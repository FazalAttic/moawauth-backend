const router = require("express").Router();
const authController = require("../controllers/authController");

// Main KeyAuth-style POST handler
router.post("/", async (req, res) => {
  const { type } = req.body;
  if (type === "login") {
    return authController.keyAuthLogin(req, res);
  }
  return res.status(400).json({ success: false, message: "Invalid type" });
});

module.exports = router;
