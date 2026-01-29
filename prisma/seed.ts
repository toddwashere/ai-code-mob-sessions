import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Add seed data here if needed
  console.log("Seed completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
