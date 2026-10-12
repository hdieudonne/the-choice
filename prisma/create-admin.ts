
import "dotenv/config";
import { hash } from "bcryptjs";
import { prisma } from "../src/lib/prisma";

async function main() {
  const name = process.env.ADMIN_NAME?.trim();
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!name || !email || !password) {
    throw new Error(
      "Set ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD in your .env file."
    );
  }

  if (password.length < 12) {
    throw new Error("ADMIN_PASSWORD must be at least 12 characters.");
  }

  const passwordHash = await hash(password, 12);

  await prisma.adminUser.upsert({
    where: { email },
    update: {
      name,
      passwordHash,
      isActive: true,
    },
    create: {
      name,
      email,
      passwordHash,
      isActive: true,
    },
  });

  console.log(`Administrator account created or updated: ${email}`);
}

main()
  .catch((error) => {
    console.error("Failed to create administrator:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
