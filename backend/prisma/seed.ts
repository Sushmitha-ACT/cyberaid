import { IncidentType, SeverityLevel, StepPriority } from '@prisma/client';
import crypto from 'crypto';
import { prisma } from '../src/lib/prisma';

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

async function main() {
  console.log('Starting massive seed data pipeline...');

  // 1. Seed Countries
  const countries = [
    { code: 'US', name: 'United States' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'CA', name: 'Canada' },
    { code: 'AU', name: 'Australia' },
    { code: 'IN', name: 'India' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'JP', name: 'Japan' },
  ];
  for (const c of countries) {
    await prisma.country.upsert({ where: { code: c.code }, update: {}, create: c });
  }

  // 2. Seed Platforms
  const platforms = [
    { name: 'Google', category: 'Email/Account' },
    { name: 'Microsoft', category: 'Email/Account' },
    { name: 'Facebook', category: 'Social Media' },
    { name: 'Instagram', category: 'Social Media' },
    { name: 'WhatsApp', category: 'Messaging' },
    { name: 'X / Twitter', category: 'Social Media' },
    { name: 'Bank of America', category: 'Finance' },
    { name: 'PayPal', category: 'Finance' },
    { name: 'Venmo', category: 'Finance' },
    { name: 'Coinbase', category: 'Crypto' },
    { name: 'Amazon', category: 'E-commerce' },
    { name: 'Apple', category: 'Account/Device' }
  ];
  for (const p of platforms) {
    await prisma.platform.upsert({ where: { name: p.name }, update: {}, create: p });
  }

  // 3. Admin User
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@cyberaid.test' },
    update: {},
    create: { 
      email: 'admin@cyberaid.test', 
      name: 'Admin', 
      role: 'ADMIN',
      password: hashPassword('admin123')
    },
  });

  const usCountry = await prisma.country.findUnique({ where: { code: 'US' } });
  if (!usCountry) throw new Error("US Country missing");

  // 4. Seed Official Resources (Dummy verified sources for templates)
  const cisaResource = await prisma.officialResource.create({
    data: {
      organization: 'Cybersecurity and Infrastructure Security Agency (CISA)',
      url: 'https://www.cisa.gov',
      countryId: usCountry.id,
      verifiedAt: new Date(),
      reviewerId: adminUser.id,
      sourceCategory: 'Government',
    },
  });

  // 5. Build Checklist Templates for all 18 Incident Types
  const allIncidents = Object.values(IncidentType);
  for (const incidentType of allIncidents) {
    await prisma.checklistTemplate.upsert({
      where: { incidentType_version: { incidentType, version: 1 } },
      update: {},
      create: {
        incidentType,
        severity: SeverityLevel.HIGH,
        version: 1,
        isPublished: true,
        steps: {
          create: [
            {
              order: 1,
              title: `Isolate and Secure: ${incidentType.replace(/_/g, ' ')}`,
              explanation: `Immediate action required to stop ongoing damage related to ${incidentType}.`,
              whyItMatters: 'Acting quickly limits the attacker’s window of opportunity.',
              priority: StepPriority.IMMEDIATE,
              estimatedMinutes: 10,
              evidenceWarning: true,
              officialResourceId: cisaResource.id
            },
            {
              order: 2,
              title: 'Change Passwords & Enable MFA',
              explanation: 'Secure all connected accounts immediately.',
              whyItMatters: 'Prevents lateral movement by the attacker.',
              priority: StepPriority.HIGH,
              estimatedMinutes: 15,
              evidenceWarning: false,
            }
          ]
        }
      }
    });
  }

  // 6. Generate 30+ Detailed Guides
  const guideTopics = [
    { cat: 'Account Recovery', titles: ['How to recover a hacked Instagram account', 'Gmail recovery steps', 'Facebook locked out guide', 'What to do if your Apple ID is compromised', 'Securing Microsoft accounts after a breach', 'WhatsApp account stolen - Next steps', 'Recovering a disabled social media profile'] },
    { cat: 'Financial Fraud', titles: ['Reversing a fraudulent bank transfer', 'Reporting a PayPal scam', 'What to do if you sent money via Zelle to a scammer', 'Credit card fraud immediate actions', 'Recognizing investment scams', 'Crypto wallet compromised - Emergency steps', 'Tax fraud and identity theft response'] },
    { cat: 'Device Security', titles: ['What to do if your iPhone is lost or stolen', 'Removing malware from an Android device', 'Detecting spyware on your laptop', 'Securing your home Wi-Fi router', 'Factory resetting a compromised device', 'Recognizing malicious browser extensions'] },
    { cat: 'Privacy', titles: ['Removing your personal data from broker sites', 'Responding to non-consensual image sharing', 'Stopping cyberstalking and harassment', 'What to do after a major data breach', 'Securing your online footprint', 'Protecting your child’s online privacy', 'Understanding tracking cookies and how to block them'] },
    { cat: 'Phishing & Scams', titles: ['I clicked a phishing link - Now what?', 'Spotting fake job offer scams', 'The anatomy of a romance scam', 'Sextortion emails: How to respond (and what not to do)', 'Fake tech support popups explained'] }
  ];

  let guideCount = 0;
  for (const topic of guideTopics) {
    for (const title of topic.titles) {
      await prisma.guide.create({
        data: {
          title,
          description: `A comprehensive guide covering the essential steps for: ${title}. Learn how to protect yourself and recover effectively.`,
          content: `## Introduction\nThis is a detailed guide on ${title}.\n\n## Step 1: Immediate Actions\n- Stop communicating with the attacker.\n- Preserve all evidence (screenshots, emails, URLs).\n- Disconnect from the internet if dealing with malware.\n\n## Step 2: Remediation\n- Change your passwords from a safe device.\n- Enable Two-Factor Authentication.\n- Contact support or your bank immediately.\n\n## Step 3: Prevention\n- Monitor your accounts closely for the next 30 days.\n- Use a password manager.\n\n### FAQs\n**Q: How fast do I need to act?**\nA: Immediately. The first 24 hours are critical.`,
          difficulty: 'Beginner',
          estimatedMinutes: Math.floor(Math.random() * 10) + 5,
          category: topic.cat,
          tags: [topic.cat.toLowerCase(), 'security', 'guide'],
          isPublished: true,
        }
      });
      guideCount++;
    }
  }

  // 7. Seed Threat Alerts
  await prisma.threatAlert.createMany({
    data: [
      { title: 'New Phishing Campaign targeting Office 365', description: 'Be aware of emails claiming your password is about to expire.', severity: SeverityLevel.HIGH },
      { title: 'Zero-Day in popular password manager', description: 'Ensure your app is updated to the latest version immediately.', severity: SeverityLevel.CRITICAL }
    ]
  });

  console.log(`Seeded ${guideCount} guides, 18 incident templates, and threat alerts.`);
  console.log('Massive seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
