const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const express = require("express");
const cors = require("cors");

const db = require("./config/db");
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const retailerRoutes = require("./routes/retailer");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "MilkCollect API is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/retailer", retailerRoutes);

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await db.query("SELECT 1");

    console.log("MySQL connected successfully.");

    app.listen(PORT, () => {
      console.log(`MilkCollect API running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Database connection failed:");
    console.error(error.message);
  }
}

startServer();