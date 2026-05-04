require("dotenv").config();
const sequelize = require("./config/database");
const User = require("./models/User");

const createAdmin = async () => {
  try {
    await sequelize.authenticate();
    console.log("DB connected");

    await sequelize.sync(); // ensure tables exist

    const email = "admin@pos.com";
    const password = "admin123";

    const adminExists = await User.findOne({ where: { email } });

    if (!adminExists) {
      await User.create({
        name: "Admin",
        email,
        password, // hashed automatically
        role: "ADMIN",
      });

      console.log("✅ Admin created:");
      console.log(`Email: ${email}`);
      console.log(`Password: ${password}`);
    } else {
      console.log("⚠️ Admin already exists");
    }

  } catch (err) {
    console.error("Error creating admin:", err);
  } finally {
    process.exit();
  }
};

createAdmin();