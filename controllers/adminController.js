const User = require("../models/User");
const App = require("../models/App");
const License = require("../models/License");

exports.getAllUsers = async (req, res) => {
  const users = await User.find();
  res.json({ success: true, users });
};

exports.getAllApps = async (req, res) => {
  const apps = await App.find();
  res.json({ success: true, apps });
};

exports.banUser = async (req, res) => {
  const { username } = req.body;
  await User.deleteOne({ username });
  res.json({ success: true, message: "User banned/deleted" });
};
