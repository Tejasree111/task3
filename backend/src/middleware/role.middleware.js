const db = require('../mysql/connection');  

const checkRole = (requiredRole) => {
  return async (req, res, next) => {
    try {
      const token = req.headers["authorization"];
      if (!token) {
        return res.status(403).json({ message: "Authorization token required" });
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await db('users').where({ user_id: decoded.id }).first();
      if (!user) {
        return res.status(403).json({ message: "User not found" });
      }

      // Check if the user's role matches the required role
      if (user.role_id !== requiredRole) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      next();
    } catch (err) {
      return res.status(500).json({ message: "Server error" });
    }
  };
};

module.exports = checkRole;
