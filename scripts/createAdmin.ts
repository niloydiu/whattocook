import bcrypt from "bcrypt";
import prisma from "../lib/prisma.js";

async function createAdmin() {
  const username = process.argv[2] || "admin";
  const password = process.argv[3] || "admin123";

  console.log("Creating admin user...");
  console.log(`Username: ${username}`);

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    // Check if admin already exists (case-insensitive)
    const existingAdmin = await prisma.admin.findFirst({
      where: { 
        username: {
          equals: username,
          mode: 'insensitive'
        }
      },
    });

    if (existingAdmin) {
      await prisma.admin.update({
        where: { id: existingAdmin.id },
        data: { 
          username: username, // Update to the provided casing
          password_hash: hashedPassword 
        },
      });
      console.log(`✅ Password updated for existing admin: ${existingAdmin.username}`);
    } else {
      const admin = await prisma.admin.create({
        data: {
          username,
          password_hash: hashedPassword,
        },
      });

      console.log("✅ Admin user created successfully!");
      console.log(`ID: ${admin.id}`);
      console.log(`Username: ${admin.username}`);
    }
    console.log("\n⚠️  Please save your credentials securely!");
  } catch (error: any) {
    console.error("❌ Error managing admin user:", error);
  }
}

createAdmin()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
