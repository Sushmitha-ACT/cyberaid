require('ts-node').register({ transpileOnly: true });
const { prisma } = require('./src/lib/prisma');

async function main() {
  let firstCountry = await prisma.country.findFirst();
  if (!firstCountry) {
    firstCountry = await prisma.country.create({
      data: { code: "US", name: "United States" }
    });
  }

  const incident = await prisma.incident.create({
    data: {
      userId: null,
      type: "ACCOUNT_HACKED",
      status: "OPEN",
      severity: "HIGH",
      countryId: firstCountry?.id || "unknown",
      contextData: {
        originalDescription: "test",
        initialPlatform: "Unknown",
        initialIncidentType: "Account Takeover",
        severityReason: "Simulated high severity (Missing API Key).",
        generatedSteps: [],
        completedSteps: [],
        failedAttempts: []
      }
    }
  });
  console.log(incident);
}

main().catch(console.error).finally(() => prisma.$disconnect());
