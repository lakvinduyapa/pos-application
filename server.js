require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");

app.use(express.json());



app.use(cors());
const sequelize = require("./config/database");
const User = require("./models/User");

sequelize.authenticate()
  .then(() => console.log("Database connected successfully"))
  .catch(err => console.log("DB error:", err));


app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.get("/", (req, res) => {
  res.send("Grocery POS API running");
});
app.use("/api/auth", authRoutes);
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
