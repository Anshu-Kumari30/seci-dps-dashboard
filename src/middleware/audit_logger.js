// middlewares/auditLogger.js

const jwt = require('jsonwebtoken');
const { UserLogs } = require('../models').models;

// Your secret used to sign JWTs
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

const auditLogger = (actionDescription) => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];

      if (!token) {
        console.warn('Audit: No token provided.');
        return next();
      }

      let decoded;
      try {
        decoded = jwt.verify(token, JWT_SECRET);
      } catch (err) {
        console.warn('Audit: Invalid token.');
        return next();
      }

      // Log the action
      await UserLogs.create({
        user_id: decoded.user_id,
        name: decoded.name,
        action: actionDescription,
      });
      next();
    } catch (err) {
      console.error('Audit error:', err);
      next(); // Continue request even if audit fails
    }
  };
};

module.exports = auditLogger;
