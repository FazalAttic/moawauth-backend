const mongoose = require("mongoose");

const AppSchema = new mongoose.Schema({
  name: String,
  ownerId: String,
  secret: String,
  version: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("App", AppSchema);
