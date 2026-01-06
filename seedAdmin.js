require("dotenv").config();
const sequelize = require("./config/database");
const User = require("./models/User");

const createAdmin = async () => {
  await sequelize.sync();
  const adminExists = await User.findOne({ where: { email: "admin@grocery.com" } });
  if (!adminExists) {
    await User.create({
      name: "Admin",
      email: "admin@grocery.com",
      password: "admin123", // will be hashed automatically
      role: "ADMIN"
    });
    console.log("Admin user created!");
  } else {
    console.log("Admin already exists");
  }
  process.exit();
};

createAdmin();
