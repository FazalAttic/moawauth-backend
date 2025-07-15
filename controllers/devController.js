const License = require("../models/License");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

exports.createLicense = async (req, res) => {
  const { key, level, expires, appId } = req.body;

  try {
    const license = await License.create({ key, level, expires, appId });
    res.json({ success: true, license });
  } catch {
    res.status(500).json({ success: false, message: "Error creating license" });
  }
};

exports.getUsersByApp = async (req, res) => {
  const { appId } = req.params;

  try {
    const users = await User.find({ appId });
    res.json({ success: true, users });
  } catch {
    res.status(500).json({ success: false, message: "Error fetching users" });
  }
};

exports.createUserManually = async (req, res) => {
  const { username, password, level, expires, appId } = req.body;

  try {
    const existing = await User.findOne({ username, appId });
    if (existing)
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      password: hashed,
      appId,
      subscriptions: [{ level, expires }],
    });

    res.json({ success: true, user: newUser });
  } catch (err) {
    console.error("User create error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
