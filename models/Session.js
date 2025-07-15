const mongoose = require("mongoose");

const SessionSchema = new mongoose.Schema({
  userId: String,
  appId: String,
  token: String,
  createdAt: { type: Date, default: Date.now },
  expiresAt: Date,
});

module.exports = mongoose.model("Session", SessionSchema);
