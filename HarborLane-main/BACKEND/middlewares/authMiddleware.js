const jwt = require("jsonwebtoken");

const SECRET_KEY = "HaBourLaNe";

// Middleware to verify JWT token
const authenticateUser = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token.replace("Bearer ", ""), SECRET_KEY);
    req.user = decoded; // Attach user data to request
    next();
  } catch (err) {
    res.status(400).json({ message: "Invalid token." });
  }
};

// Middleware to restrict access based on roles
const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Access forbidden: Unauthorized role" });
    }
    next();
  };
};

module.exports = {
  authenticateUser,
  authorizeRole,
};
