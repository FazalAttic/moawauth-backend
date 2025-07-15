const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware to protect routes
exports.verifyToken = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token)
    return res
      .status(401)
      .json({ success: false, message: "No token provided" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { userId }
    next();
  } catch (err) {
    res.status(403).json({ success: false, message: "Invalid token" });
  }
};

// Optional middleware for admin routes (if needed later)
exports.verifyAdmin = (req, res, next) => {
  const { userId } = req.user;
  // You can check in DB if this user is an admin
  if (userId !== "adminid") {
    return res
      .status(403)
      .json({ success: false, message: "Admin access only" });
  }
  next();
};
