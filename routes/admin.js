const router = require("express").Router();
const adminController = require("../controllers/adminController");
const { verifyToken } = require("../middleware/auth");

// Assuming your frontend sets an admin token
router.get("/users", verifyToken, adminController.getAllUsers);
router.get("/apps", verifyToken, adminController.getAllApps);
router.post("/ban", verifyToken, adminController.banUser);

module.exports = router;
