const router = require("express").Router();
const devController = require("../controllers/devController");
const { verifyToken } = require("../middleware/auth");

router.post("/license", verifyToken, devController.createLicense);
router.get("/users/:appId", verifyToken, devController.getUsersByApp);
router.post("/create-user", verifyToken, devController.createUserManually);

module.exports = router;
