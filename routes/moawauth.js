const router = require("express").Router();
const authController = require("../controllers/authController");
const App = require("../models/App");
const Session = require("../models/Session");
const User = require("../models/User");
const License = require("../models/License");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const generateSignature = (responseBody, secret) => {
  return crypto.createHmac("sha256", secret).update(responseBody).digest("hex");
};

router.post("/", async (req, res) => {
  const { type, name, ownerid, version, username, pass, key, hwid, sessionid } =
    req.body;

  // Validate app credentials
  const app = await App.findOne({ name, ownerId: ownerid, version });
  if (!app) {
    const responseBody = { success: false, message: "App not found" };
    res.setHeader(
      "signature",
      generateSignature(JSON.stringify(responseBody), "fallback-secret")
    );
    return res.status(400).json(responseBody);
  }

  let responseBody;
  switch (type) {
    case "init":
      try {
        const session = await Session.create({ appId: app._id });
        responseBody = { success: true, sessionid: session._id };
      } catch (err) {
        responseBody = { success: false, message: "Initialization failed" };
      }
      break;
    case "login":
      return authController.keyAuthLogin(req, res);
    case "register":
      try {
        const license = await License.findOne({
          key,
          appId: app._id,
          used: false,
        });
        if (!license) {
          responseBody = {
            success: false,
            message: "Invalid or used license key",
          };
          break;
        }

        const existingUser = await User.findOne({ username, appId: app._id });
        if (existingUser) {
          responseBody = { success: false, message: "Username already taken" };
          break;
        }

        const hashedPassword = await bcrypt.hash(pass, 10);
        const newUser = await User.create({
          username,
          password: hashedPassword,
          hwid,
          appId: app._id,
          subscriptions: [{ level: license.level, expires: license.expires }],
        });

        license.used = true;
        license.usedBy = username;
        await license.save();

        responseBody = {
          success: true,
          message: "User registered successfully",
          info: {
            username: newUser.username,
            subscriptions: newUser.subscriptions,
            ip: req.ip,
            hwid: newUser.hwid,
            createdate: newUser.createdAt,
            lastlogin: new Date(),
          },
        };
      } catch (err) {
        responseBody = { success: false, message: "Server error" };
      }
      break;
    case "check":
      try {
        const session = await Session.findOne({
          _id: sessionid,
          appId: app._id,
        });
        responseBody = {
          success: !!session,
          message: session ? "Session valid" : "Invalid session",
        };
      } catch (err) {
        responseBody = { success: false, message: "Server error" };
      }
      break;
    default:
      responseBody = { success: false, message: "Invalid type" };
  }

  // Convert response to JSON string and set signature header
  const responseString = JSON.stringify(responseBody);
  res.setHeader("signature", generateSignature(responseString, app.secret));
  res.json(responseBody);
});

module.exports = router;
