import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

function getDirectUrl(url: string | undefined) {
  if (!url) return undefined;
  if (url.startsWith("prisma+postgres://")) {
    try {
      const match = url.match(/api_key=([^&]+)/);
      if (match && match[1]) {
        const decoded = Buffer.from(match[1], "base64").toString("utf-8");
        const json = JSON.parse(decoded);
        return json.databaseUrl;
      }
    } catch (e) {
      console.error("Failed to parse prisma+postgres URL", e);
    }
  }
  return url;
}

const directUrl = getDirectUrl(process.env.DATABASE_URL);
const globalForPrisma = global as unknown as { prisma: PrismaClient };

let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  const pool = new Pool({ connectionString: directUrl });
  const adapter = new PrismaPg(pool);
  prisma = new PrismaClient({ adapter });
} else {
  if (!globalForPrisma.prisma) {
    const pool = new Pool({ connectionString: directUrl });
    const adapter = new PrismaPg(pool);
    globalForPrisma.prisma = new PrismaClient({ adapter });
  }
  prisma = globalForPrisma.prisma;
}

export { prisma };
