const router = require("express").Router();
const devController = require("../controllers/devController");
const { verifyToken } = require("../middleware/auth");
const App = require("../models/App");
const License = require("../models/License");
const User = require("../models/User");

router.post("/license", verifyToken, devController.createLicense);
router.post("/create-user", verifyToken, devController.createUserManually);

router.post("/create-app", verifyToken, async (req, res) => {
  const { name, version } = req.body;
  const ownerId = req.user.userId;

  try {
    const existingApp = await App.findOne({ name, ownerId });
    if (existingApp) {
      return res
        .status(400)
        .json({ success: false, message: "App name already exists" });
    }

    const app = await App.create({ name, ownerId, version });
    res.json({
      success: true,
      app: {
        id: app._id,
        name: app.name,
        ownerId: app.ownerId,
        secret: app.secret,
        version: app.version,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error creating app" });
  }
});

router.get("/apps", verifyToken, async (req, res) => {
  try {
    const apps = await App.find({ ownerId: req.user.userId });
    res.json({
      success: true,
      apps: apps.map((app) => ({
        id: app._id,
        name: app.name,
        ownerId: app.ownerId,
        secret: app.secret,
        version: app.version,
      })),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching apps" });
  }
});

router.get("/licenses/:appId", verifyToken, async (req, res) => {
  const { appId } = req.params;
  try {
    const app = await App.findOne({ _id: appId, ownerId: req.user.userId });
    if (!app) {
      return res
        .status(403)
        .json({ success: false, message: "App not found or unauthorized" });
    }
    const licenses = await License.find({ appId });
    res.json({ success: true, licenses });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Error fetching licenses" });
  }
});

router.get("/users/:appId", verifyToken, async (req, res) => {
  const { appId } = req.params;
  try {
    const app = await App.findOne({ _id: appId, ownerId: req.user.userId });
    if (!app) {
      return res
        .status(403)
        .json({ success: false, message: "App not found or unauthorized" });
    }
    const users = await User.find({ appId });
    res.json({
      success: true,
      users: users.map((user) => ({
        username: user.username,
        subscriptions: user.subscriptions,
        createdAt: user.createdAt,
      })),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching users" });
  }
});

module.exports = router;
