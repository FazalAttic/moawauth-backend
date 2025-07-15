const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/license", authController.licenseLogin);
router.post("/logout", authController.logout);
router.post("/admin-login", authController.adminLogin);

module.exports = router;
