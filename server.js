const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/dev", require("./routes/dev"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/moawauth", require("./routes/moawauth"));
// <-- Add this line here

// Connect DB and Start Server
const PORT = process.env.PORT || 5000;
const connectDB = require("./config/db");

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
