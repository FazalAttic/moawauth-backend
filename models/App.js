const mongoose = require("mongoose");
const crypto = require("crypto");

const AppSchema = new mongoose.Schema({
  name: String,
  ownerId: String,
  secret: {
    type: String,
    default: () => crypto.randomBytes(32).toString("hex"),
  },
  version: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("App", AppSchema);
