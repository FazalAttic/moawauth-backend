require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const moawauthRoutes = require("./routes/moawauth");
const devRoutes = require("./routes/dev");
const authRoutes = require("./routes/auth");
const jwt = require("jsonwebtoken");

const app = express();

// Middleware
app.use(cors()); // Allow cross-origin requests for developer testing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/moawauth", moawauthRoutes);
app.use("/api/dev", devRoutes);
app.use("/api/auth", authRoutes);

// MongoDB Connection
mongoose.set("debug", true);
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
