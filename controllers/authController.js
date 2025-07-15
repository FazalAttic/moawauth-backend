const User = require("../models/User");
const License = require("../models/License");
const App = require("../models/App");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

// 🔐 REGISTER
exports.register = async (req, res) => {
  console.log("📥 Register Request Body:", req.body);
  const { username, password, key, hwid, appId } = req.body;

  try {
    const license = await License.findOne({ key, appId, used: false });
    console.log("🔎 License found:", license);

    if (!license) {
      return res.status(400).json({
        success: false,
        message: "Invalid or used license key.",
      });
    }

    const existingUser = await User.findOne({ username, appId });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Username already taken for this app.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      password: hashedPassword,
      hwid,
      appId,
      subscriptions: [
        {
          level: license.level,
          expires: license.expires,
        },
      ],
    });

    console.log("✅ User created:", newUser);

    license.used = true;
    license.usedBy = username;
    await license.save();

    console.log("🎫 License updated:", license);

    res.json({ success: true, message: "User registered successfully" });
  } catch (err) {
    console.error("❌ Registration Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 🔐 LOGIN (for frontend dev panel)
exports.login = async (req, res) => {
  console.log("🔐 Login Request Body:", req.body);
  const { username, password, hwid, name, ownerid, version } = req.body;

  try {
    const app = await App.findOne({ name, ownerId: ownerid, version });
    if (!app)
      return res.status(400).json({ success: false, message: "App not found" });

    const user = await User.findOne({ username, appId: app._id });
    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res
        .status(400)
        .json({ success: false, message: "Wrong password" });

    if (user.hwid && hwid && user.hwid !== hwid) {
      return res.status(403).json({ success: false, message: "HWID mismatch" });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "3h",
    });

    res.json({ success: true, token, user });
  } catch (err) {
    console.error("❌ Login Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 🔐 LICENSE LOGIN (optional shortcut)
exports.licenseLogin = async (req, res) => {
  const { key, hwid, appId } = req.body;

  try {
    const license = await License.findOne({ key, appId });
    if (!license || !license.usedBy) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid license key" });
    }

    const user = await User.findOne({ username: license.usedBy, appId });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    if (user.hwid && hwid && user.hwid !== hwid) {
      return res.status(403).json({ success: false, message: "HWID mismatch" });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "3h",
    });

    res.json({ success: true, token, user });
  } catch (err) {
    console.error("❌ License Login Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 🔐 ADMIN LOGIN
exports.adminLogin = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username, role: "admin" });
    if (!user)
      return res
        .status(403)
        .json({ success: false, message: "Admin not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res
        .status(400)
        .json({ success: false, message: "Wrong password" });

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "6h",
    });
    res.json({ success: true, token, user });
  } catch (err) {
    console.error("❌ Admin login error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 🚪 LOGOUT
exports.logout = async (req, res) => {
  res.json({ success: true, message: "Logged out" });
};

// 🔐 KeyAuth-Style Login for External Clients (reads 'pass' not 'password')
exports.keyAuthLogin = async (req, res) => {
  const { username, pass, hwid, name, ownerid } = req.body;

  try {
    const app = await App.findOne({ name, ownerId: ownerid });
    if (!app)
      return res.status(400).json({ success: false, message: "App not found" });

    const user = await User.findOne({ username, appId: app._id });
    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "User not found" });

    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch)
      return res
        .status(400)
        .json({ success: false, message: "Wrong password" });

    if (user.hwid && user.hwid !== hwid) {
      return res.status(403).json({ success: false, message: "HWID mismatch" });
    }

    return res.json({
      success: true,
      message: "Logged in",
      info: {
        username: user.username,
        subscriptions: user.subscriptions,
      },
    });
  } catch (err) {
    console.error("💥 Login error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Example admin-only action
exports.someAdminAction = async (req, res) => {
  const { username } = req.body; // or req.user.username if using JWT

  const user = await User.findOne({ username });
  if (!user || user.role !== "admin")
    return res.status(403).json({ success: false, message: "Admin only" });

  // ...rest of your admin logic...
};
