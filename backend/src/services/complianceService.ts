import { aiProviderService } from './aiProviderService';
import prisma from '../config/db';

interface ComplianceResult {
  metricName: string;
  currentValue: number;
  standardValue: number;
  unit: string;
  status: 'green' | 'yellow' | 'red';
  compliancePercentage: number;
  analysis: string;
  recommendations: string;
  priority: 'immediate' | 'soon' | 'planned';
}

class ComplianceService {
  // Caching layer to avoid calling LLM APIs on every page reload
  private cache = new Map<string, { data: any; timestamp: number }>();
  private CACHE_TTL = 60 * 60 * 1000; // 1 hour in milliseconds

  // Regulatory standards database
  private standards = {
    EU_CARBON_2050: {
      name: 'EU Carbon Neutrality 2050',
      metric: 'carbon_emissions',
      target: 200, // Threshold: target emissions below 200 tonnes CO2e
      unit: 'tCO2e',
      type: 'environmental',
      higherIsBetter: false, // For emissions, lower is better
    },
    EU_ENERGY_EFFICIENCY: {
      name: 'EU Energy Efficiency 2030',
      metric: 'renewable_energy_percentage',
      target: 42.5,
      unit: '%',
      type: 'environmental',
      higherIsBetter: true,
    },
    ISO_50001: {
      name: 'ISO 50001 Energy Management',
      metric: 'energy_consumption',
      target: 5000,
      unit: 'MWh',
      type: 'environmental',
      higherIsBetter: false,
    },
    GERMAN_STROMSTG: {
      name: 'German StromStG (Electricity Tax)',
      metric: 'renewable_energy_percentage',
      target: 65.0,
      unit: '%',
      type: 'environmental',
      higherIsBetter: true,
    },
    WATER_MANAGEMENT: {
      name: 'Water Usage Standards',
      metric: 'water_usage',
      target: 1000000,
      unit: 'litres',
      type: 'environmental',
      higherIsBetter: false,
    },
    WASTE_RECYCLING: {
      name: 'Waste Recycling Target',
      metric: 'waste_recycling_percentage',
      target: 70.0, // target 70% recycling rate
      unit: '%',
      type: 'environmental',
      higherIsBetter: true,
    },
    ISO_30415: {
      name: 'ISO 30415 Diversity & Inclusion',
      metric: 'diversity_ratio',
      target: 40.0,
      unit: '%',
      type: 'social',
      higherIsBetter: true,
    },
    UN_SDG_COMMUNITY: {
      name: 'UN SDG 11 Community Support',
      metric: 'community_hours',
      target: 1000,
      unit: 'Hours',
      type: 'social',
      higherIsBetter: true,
    },
    LOCAL_PROCUREMENT: {
      name: 'Local Supply Chain Standard',
      metric: 'local_vendor_ratio',
      target: 50.0,
      unit: '%',
      type: 'economic',
      higherIsBetter: true,
    }
  };

  async analyzeMetric(
    metricName: string,
    currentValue: number,
    standardKey: string
  ): Promise<ComplianceResult> {
    const standard = this.standards[standardKey as keyof typeof this.standards];

    if (!standard) {
      throw new Error(`Standard ${standardKey} not found`);
    }

    // Determine RGY status and compliance percentage
    let status: 'green' | 'yellow' | 'red';
    let compliancePercentage: number;

    if (standard.higherIsBetter) {
      // e.g. Waste Recycling, Renewable Energy, Diversity
      compliancePercentage = (currentValue / standard.target) * 100;
      if (currentValue >= standard.target) {
        status = 'green';
      } else if (currentValue >= standard.target * 0.85) {
        status = 'yellow';
      } else {
        status = 'red';
      }
    } else {
      // e.g. Carbon footprint, Water usage (lower values are better)
      if (currentValue === 0) {
        compliancePercentage = 100;
      } else {
        compliancePercentage = (standard.target / currentValue) * 100;
      }

      if (currentValue <= standard.target) {
        status = 'green';
      } else if (currentValue <= standard.target * 1.15) {
        status = 'yellow';
      } else {
        status = 'red';
      }
    }

    // Generate AI analysis
    const analysisPrompt = `
    Analyze this regulatory compliance metric:

    Metric: ${metricName}
    Current Value: ${currentValue} ${standard.unit}
    Standard: ${standard.name}
    Target: ${standard.target} ${standard.unit}
    Compliance Score: ${compliancePercentage.toFixed(1)}%
    Status: ${status.toUpperCase()}

    Provide:
    1. Brief analysis (2-3 sentences max)
    2. Recommendations for improvement
    3. Action priority (immediate/soon/planned)

    Return ONLY a JSON object with keys: "analysis", "recommendations", "priority". Do not include backticks, code wrappers, or extra text.
    `;

    let aiResult = {
      analysis: 'Telemetry data processed successfully.',
      recommendations: 'No further action required.',
      priority: 'planned' as const,
    };

    try {
      const aiResponse = await aiProviderService.analyzeCompliance(analysisPrompt);
      // Clean clean response JSON
      const cleanJsonStr = aiResponse.trim().replace(/^```json\s*/i, '').replace(/```\s*$/i, '');
      const parsed = JSON.parse(cleanJsonStr);
      aiResult = {
        analysis: parsed.analysis || 'Telemetry analysis complete.',
        recommendations: parsed.recommendations || 'Continue standard tracking.',
        priority: parsed.priority || 'planned',
      };
    } catch (error) {
      console.error(`[Compliance Service] AI prompt parsing error for ${metricName}:`, error);
    }

    return {
      metricName,
      currentValue,
      standardValue: standard.target,
      unit: standard.unit,
      status,
      compliancePercentage,
      analysis: aiResult.analysis,
      recommendations: aiResult.recommendations,
      priority: aiResult.priority as any,
    };
  }

  async generateComplianceReport(companyId: string, forceRefresh = false): Promise<{
    companyId: string;
    timestamp: Date;
    overallScore: number;
    metrics: ComplianceResult[];
    summary: string;
    alerts: string[];
  }> {
    const cacheKey = `report_${companyId}`;
    
    // Return cached report if valid
    if (!forceRefresh && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      if (Date.now() - cached.timestamp < this.CACHE_TTL) {
        console.log('[Compliance Service] Serving compliance report from cache...');
        return cached.data;
      }
    }

    console.log('[Compliance Service] Generating fresh compliance report...');
    
    // Fetch company metrics
    const metrics = await prisma.csrMetric.findMany({
      where: { companyId },
    });

    const complianceResults: ComplianceResult[] = [];
    const alerts: string[] = [];

    for (const metric of metrics) {
      try {
        // Map metric name to standard key
        let standardKey: keyof typeof this.standards = 'WATER_MANAGEMENT';
        const nameLower = metric.metricName.toLowerCase();

        if (nameLower.includes('carbon') && nameLower.includes('offset')) {
          standardKey = 'EU_ENERGY_EFFICIENCY'; // offset score target
        } else if (nameLower.includes('carbon') || nameLower.includes('footprint') || nameLower.includes('emission')) {
          standardKey = 'EU_CARBON_2050';
        } else if (nameLower.includes('energy') && nameLower.includes('efficiency')) {
          standardKey = 'EU_ENERGY_EFFICIENCY';
        } else if (nameLower.includes('renewable') || nameLower.includes('solar') || nameLower.includes('wind')) {
          standardKey = 'GERMAN_STROMSTG';
        } else if (nameLower.includes('waste') || nameLower.includes('recycled') || nameLower.includes('recycling')) {
          standardKey = 'WASTE_RECYCLING';
        } else if (nameLower.includes('water')) {
          standardKey = 'WATER_MANAGEMENT';
        } else if (nameLower.includes('diversity') || nameLower.includes('leadership') || nameLower.includes('gender')) {
          standardKey = 'ISO_30415';
        } else if (nameLower.includes('community') || nameLower.includes('volunteer') || nameLower.includes('social')) {
          standardKey = 'UN_SDG_COMMUNITY';
        } else if (nameLower.includes('local') || nameLower.includes('vendor') || nameLower.includes('procurement')) {
          standardKey = 'LOCAL_PROCUREMENT';
        }

        const result = await this.analyzeMetric(
          metric.metricName,
          Number(metric.metricValue),
          standardKey
        );

        complianceResults.push(result);

        // Generate alerts for RED status
        if (result.status === 'red') {
          alerts.push(
            `⚠️ ${result.metricName} below compliance threshold (${result.compliancePercentage.toFixed(1)}%)`
          );
        }
      } catch (error) {
        console.error(`[Compliance Service] Failed to analyze metric ${metric.metricName}:`, error);
      }
    }

    // Calculate overall score (capped at 100%)
    const overallScore =
      complianceResults.length > 0
        ? Math.min(
            complianceResults.reduce((sum, r) => sum + r.compliancePercentage, 0) / complianceResults.length,
            100
          )
        : 100;

    // Generate summary
    const greenCount = complianceResults.filter((r) => r.status === 'green').length;
    const yellowCount = complianceResults.filter((r) => r.status === 'yellow').length;
    const redCount = complianceResults.filter((r) => r.status === 'red').length;

    const summary = `${greenCount} compliant • ${yellowCount} warnings • ${redCount} non-compliant • ${overallScore.toFixed(0)}% overall score`;

    const report = {
      companyId,
      timestamp: new Date(),
      overallScore,
      metrics: complianceResults,
      summary,
      alerts,
    };

    // Save in cache
    this.cache.set(cacheKey, {
      data: report,
      timestamp: Date.now(),
    });

    return report;
  }
}

export const complianceService = new ComplianceService();
