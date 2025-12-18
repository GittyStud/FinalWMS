const bcrypt = require("bcryptjs");
const { User } = require("./models");
const sequelize = require("./db");

const seed = async () => {
  try {
    console.log("🔄 Resetting database...");

    // Disable Foreign Keys to allow drop
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 0", { raw: true });

    // Force Sync (Drops & Recreates Tables)
    await sequelize.sync({ force: true });

    // Re-enable Foreign Keys
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 1", { raw: true });

    const users = [
      {
        first_name: "Khim",
        last_name: "Limbona",
        email: "Khimadmin@wims.com",
        username: "admin",
        password: await bcrypt.hash("admin123", 10),
        role: "Admin",
      },
      {
        first_name: "Hafsah",
        last_name: "Mangorangca",
        email: "manager@wims.com",
        username: "manager",
        password: await bcrypt.hash("manager123", 10),
        role: "Manager",
      },
      {
        first_name: "Yasser",
        last_name: "Maguidala",
        email: "staff@wims.com",
        username: "staff",
        password: await bcrypt.hash("staff123", 10),
        role: "Staff",
      },
    ];

    for (const u of users) {
      await User.create(u);
      console.log(`✅ Created: ${u.username} (${u.role})`);
    }

    console.log("🎉 Seeding complete.");
    process.exit();
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
};

seed();
