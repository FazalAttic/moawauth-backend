const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
  hwid: String,
  appId: String,
  role: { type: String, default: "user" },
  subscriptions: [
    {
      level: String,
      expires: Date,
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", UserSchema);
