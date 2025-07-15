const mongoose = require("mongoose");

const LicenseSchema = new mongoose.Schema({
  key: { type: String, unique: true },
  level: String,
  expires: Date,
  used: { type: Boolean, default: false },
  usedBy: String,
  appId: String,
});

module.exports = mongoose.model("License", LicenseSchema);
