import axios from 'axios';
import prisma from '../config/db';
import { MetricCategory } from '@prisma/client';
import { socketService } from './socketService';

class SharepointService {
  private syncIntervalId: NodeJS.Timeout | null = null;

  // Initialize background scheduler running every 30 minutes
  startScheduler() {
    console.log('[SharePoint] Sync scheduler started (runs every 30 minutes)');
    
    // Trigger sync immediately on start
    this.syncAllCompanies().catch((err) => {
      console.error('[SharePoint] Error during initial startup sync:', err);
    });

    // Setup 30 minutes interval (30 * 60 * 1000 ms)
    this.syncIntervalId = setInterval(() => {
      this.syncAllCompanies().catch((err) => {
        console.error('[SharePoint] Error during scheduled sync:', err);
      });
    }, 30 * 60 * 1000);
  }

  stopScheduler() {
    if (this.syncIntervalId) {
      clearInterval(this.syncIntervalId);
      this.syncIntervalId = null;
      console.log('[SharePoint] Sync scheduler stopped');
    }
  }

  // Sync metrics for all companies with SharePoint enabled
  async syncAllCompanies() {
    console.log('[SharePoint] Starting sync process for all companies...');
    try {
      const companies = await prisma.company.findMany({
        where: {
          csrDataSource: 'sharepoint',
        },
      });

      console.log(`[SharePoint] Found ${companies.length} companies with SharePoint source.`);
      
      for (const company of companies) {
        await this.syncCompanyMetrics(company.id);
      }
    } catch (error) {
      console.error('[SharePoint] Sync iteration failed:', error);
    }
  }

  // Fetch token using OAuth 2.0 client credentials flow
  private async getAccessToken(tenantId: string): Promise<string | null> {
    const clientId = process.env.SHAREPOINT_CLIENT_ID;
    const clientSecret = process.env.SHAREPOINT_CLIENT_SECRET;

    if (!tenantId || !clientId || !clientSecret) {
      console.warn('[SharePoint] Client credentials or tenant ID not fully configured in environment.');
      return null;
    }

    try {
      const url = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
      const data = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        scope: 'https://graph.microsoft.com/.default',
        grant_type: 'client_credentials',
      });

      const response = await axios.post(url, data.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      return response.data.access_token;
    } catch (error: any) {
      console.error('[SharePoint] OAuth authentication failed:', error.response?.data || error.message);
      return null;
    }
  }

  // Sync a single company's SharePoint list
  async syncCompanyMetrics(companyId: string): Promise<{ success: boolean; count?: number; message?: string }> {
    console.log(`[SharePoint] Syncing metrics for company: ${companyId}`);
    
    try {
      const company = await prisma.company.findUnique({
        where: { id: companyId },
      });

      if (!company) {
        return { success: false, message: 'Company not found' };
      }

      const tenantId = company.sharepointTenantId || process.env.SHAREPOINT_TENANT_ID;
      const listId = company.sharepointListId || process.env.SHAREPOINT_LIST_ID;

      // Fallback: If no client secret is set, simulate successful sync with mock ESG metrics
      if (!process.env.SHAREPOINT_CLIENT_SECRET || !tenantId || !listId) {
        console.log(`[SharePoint] Credentials not configured. Simulating list sync for ${company.name}`);
        const mockCount = await this.simulateSync(companyId);
        return { success: true, count: mockCount, message: 'Simulated sync completed (No credentials)' };
      }

      const token = await this.getAccessToken(tenantId);
      if (!token) {
        return { success: false, message: 'Azure OAuth token fetch failed' };
      }

      // Query Microsoft Graph SharePoint list items
      // Endpoint to fetch specific list items with fields expanded
      const graphUrl = `https://graph.microsoft.com/v1.0/sites/root/lists/${listId}/items?expand=fields`;
      
      const response = await axios.get(graphUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      const items = response.data.value || [];
      console.log(`[SharePoint] Fetched ${items.length} items from SharePoint for ${company.name}`);

      let updatedCount = 0;

      for (const item of items) {
        const fields = item.fields || {};
        
        // Expected columns (mapped from standard fields)
        const metricName = fields.Title; // e.g. "CO2 Emission Reduction"
        const valueNum = Number(fields.MetricValue); // e.g. 120.4
        const unit = fields.Unit || 'Units';
        const categoryInput = fields.Category ? fields.Category.toLowerCase() : 'environmental';
        const description = fields.Description || '';

        if (!metricName || isNaN(valueNum)) {
          continue; // Skip invalid rows
        }

        // Match categories
        let category: MetricCategory = MetricCategory.environmental;
        if (categoryInput === 'social') category = MetricCategory.social;
        if (categoryInput === 'economic') category = MetricCategory.economic;

        // Upsert the metric in db
        const dbMetric = await prisma.csrMetric.findFirst({
          where: {
            companyId,
            metricName,
          },
        });

        if (dbMetric) {
          await prisma.csrMetric.update({
            where: { id: dbMetric.id },
            data: {
              metricValue: valueNum,
              metricUnit: unit,
              category,
              description,
            },
          });
        } else {
          await prisma.csrMetric.create({
            data: {
              companyId,
              metricName,
              metricValue: valueNum,
              metricUnit: unit,
              category,
              description,
            },
          });
        }
        updatedCount++;
      }

      // Emit update via websockets
      socketService.emitToCompany(companyId, 'metrics:synced', {
        timestamp: new Date(),
        updatedCount,
      });

      return { success: true, count: updatedCount };
    } catch (error: any) {
      console.error(`[SharePoint] Sync error for company ${companyId}:`, error.response?.data || error.message);
      return { success: false, message: error.message };
    }
  }

  // Simulates a sync by inserting/updating mock ESG metrics for visual feedback in the MVP
  private async simulateSync(companyId: string): Promise<number> {
    const mockMetrics = [
      {
        metricName: 'Carbon Footprint Reduction',
        metricValue: 245.50,
        metricUnit: 'tCO2e',
        category: MetricCategory.environmental,
        description: 'Simulated metric representing greenhouse gas emissions prevented through renewable energy adoption.',
      },
      {
        metricName: 'Waste Recycled Ratio',
        metricValue: 78.40,
        metricUnit: '%',
        category: MetricCategory.environmental,
        description: 'Percentage of office and operational waste diverted from landfills.',
      },
      {
        metricName: 'Community Service Hours',
        metricValue: 1250,
        metricUnit: 'Hours',
        category: MetricCategory.social,
        description: 'Total employee volunteer hours dedicated to local community development initiatives.',
      },
      {
        metricName: 'Diversity in Leadership',
        metricValue: 42.00,
        metricUnit: '%',
        category: MetricCategory.social,
        description: 'Percentage of female and underrepresented minority employees holding leadership roles.',
      },
      {
        metricName: 'Local Vendors Share',
        metricValue: 65.00,
        metricUnit: '%',
        category: MetricCategory.economic,
        description: 'Percentage of corporate procurement spend allocated to local suppliers and small businesses.',
      },
    ];

    for (const metric of mockMetrics) {
      const existing = await prisma.csrMetric.findFirst({
        where: {
          companyId,
          metricName: metric.metricName,
        },
      });

      if (existing) {
        // Slightly vary the values to simulate live background fluctuations
        const variance = (Math.random() - 0.5) * 5; // +/- 2.5
        const updatedVal = Math.max(0, Number(existing.metricValue) + variance);
        
        await prisma.csrMetric.update({
          where: { id: existing.id },
          data: {
            metricValue: parseFloat(updatedVal.toFixed(2)),
            description: metric.description,
          },
        });
      } else {
        await prisma.csrMetric.create({
          data: {
            companyId,
            ...metric,
          },
        });
      }
    }

    // Broadcast socket event
    socketService.emitToCompany(companyId, 'metrics:synced', {
      timestamp: new Date(),
      updatedCount: mockMetrics.length,
      simulated: true,
    });

    return mockMetrics.length;
  }
}

export const sharepointService = new SharepointService();
