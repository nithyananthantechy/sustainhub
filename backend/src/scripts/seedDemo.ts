import { PrismaClient, MetricCategory, TicketCategory, TicketStatus, TicketPriority } from '@prisma/client';

const prisma = new PrismaClient();

const generateDateInPastDays = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * days));
  return date;
};

async function seedDemoData() {
  const email = process.argv[2];
  if (!email) {
    console.error('Please provide the company email as an argument. Example: npx ts-node src/scripts/seedDemo.ts admin@nskgroups.com');
    process.exit(1);
  }

  const company = await prisma.company.findUnique({
    where: { email },
  });

  if (!company) {
    console.error(`Company with email ${email} not found. Please register on the UI first.`);
    process.exit(1);
  }

  const companyId = company.id;
  console.log(`Found company ${company.name} (${companyId}). Seeding data...`);

  // 1. Seed CSR Metrics
  console.log('Seeding CSR Metrics...');
  const csrMetricsData = [
    { name: 'Carbon Footprint', value: 1250.5, unit: 'Tons CO2e', category: MetricCategory.environmental, desc: 'Total carbon equivalent emissions this quarter' },
    { name: 'Renewable Energy %', value: 78.5, unit: '%', category: MetricCategory.environmental, desc: 'Percentage of energy sourced from renewables' },
    { name: 'Water Usage Reduction', value: 12.4, unit: '%', category: MetricCategory.environmental, desc: 'Reduction in water usage compared to last year' },
    { name: 'Community Investment', value: 250000, unit: 'USD', category: MetricCategory.social, desc: 'Total corporate giving and community investments' },
    { name: 'Diversity Index', value: 42.5, unit: 'Score', category: MetricCategory.social, desc: 'Internal workplace diversity and inclusion index' },
    { name: 'Supplier Compliance', value: 94.2, unit: '%', category: MetricCategory.economic, desc: 'Percentage of suppliers meeting ESG criteria' },
    { name: 'R&D Green Investment', value: 1.2, unit: 'M USD', category: MetricCategory.economic, desc: 'Investment in sustainable product development' },
  ];

  for (const metric of csrMetricsData) {
    await prisma.csrMetric.create({
      data: {
        companyId,
        metricName: metric.name,
        metricValue: metric.value,
        metricUnit: metric.unit,
        category: metric.category,
        description: metric.desc,
      }
    });
  }

  // 2. Seed Operational Stats (Past 30 days)
  console.log('Seeding Operational Stats (Historical data for charts)...');
  const statsNames = [
    { name: 'API Requests', unit: 'req/day', base: 50000, variance: 10000 },
    { name: 'Server Uptime', unit: '%', base: 99.5, variance: 0.4 },
    { name: 'Avg Response Time', unit: 'ms', base: 120, variance: 30 }
  ];

  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    for (const stat of statsNames) {
      // Create some random variance
      const randomVariance = (Math.random() * stat.variance * 2) - stat.variance;
      const value = stat.base + randomVariance;

      await prisma.operationalStat.create({
        data: {
          companyId,
          statName: stat.name,
          statValue: Number(value.toFixed(2)),
          statUnit: stat.unit,
          timestamp: date,
        }
      });
    }
  }

  // 3. Seed Users & Tickets
  console.log('Seeding Demo Users and Tickets...');
  const user = await prisma.user.findFirst({ where: { companyId } });
  
  if (user) {
    const ticketsData = [
      { title: 'API Integration Issue', desc: 'Getting 500 errors on the telemetry ingestion endpoint.', cat: TicketCategory.issue, status: TicketStatus.resolved, pri: TicketPriority.high },
      { title: 'Update Billing Information', desc: 'Need to update the credit card on file for the next cycle.', cat: TicketCategory.issue, status: TicketStatus.closed, pri: TicketPriority.medium },
      { title: 'Add Data Export Feature', desc: 'It would be great if we could export CSR reports as PDF.', cat: TicketCategory.suggestion, status: TicketStatus.open, pri: TicketPriority.low },
      { title: 'Dashboard Loading Slowly', desc: 'The operational dashboard takes 5 seconds to load during peak hours.', cat: TicketCategory.complaint, status: TicketStatus.in_progress, pri: TicketPriority.medium },
      { title: 'SharePoint Sync Failed', desc: 'The daily sync job failed last night. Logs show authentication error.', cat: TicketCategory.issue, status: TicketStatus.open, pri: TicketPriority.critical },
    ];

    for (const t of ticketsData) {
      await prisma.ticket.create({
        data: {
          companyId,
          userId: user.id,
          title: t.title,
          description: t.desc,
          category: t.cat,
          status: t.status,
          priority: t.pri,
          createdAt: generateDateInPastDays(14),
        }
      });
    }
  }

  console.log('✅ Demo data successfully seeded! Your dashboards should now look amazing.');
}

seedDemoData()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
