import "dotenv/config";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const __dirname = dirname(fileURLToPath(import.meta.url));
const ports = JSON.parse(
  readFileSync(join(__dirname, "../data/ports.json"), "utf-8")
);

async function main() {
  console.log("Seeding database...");

  // Wipe existing rows so re-running seed is safe
  await prisma.port.deleteMany();

  const result = await prisma.port.createMany({ data: ports });

  console.log(`Seeded ${result.count} ports.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
