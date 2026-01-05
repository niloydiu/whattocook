import bcrypt from "bcrypt";
import prisma from "../lib/prisma.js";

async function createAdmin() {
  const username = process.argv[2] || "admin";
  const password = process.argv[3] || "admin123";

  console.log("Creating admin user...");
  console.log(`Username: ${username}`);

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const admin = await prisma.admin.create({
      data: {
        username,
        password_hash: hashedPassword,
      },
    });

    console.log("✅ Admin user created successfully!");
    console.log(`ID: ${admin.id}`);
    console.log(`Username: ${admin.username}`);
    console.log("\n⚠️  Please save your credentials securely!");
  } catch (error: any) {
    if (error.code === "P2002") {
      console.error("❌ Admin user with this username already exists!");
    } else {
      console.error("❌ Error creating admin:", error);
    }
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
