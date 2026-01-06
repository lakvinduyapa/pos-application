const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = (allowedRoles = []) => (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
    req.user = decoded;

    if (allowedRoles.length && !allowedRoles.includes(decoded.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};
