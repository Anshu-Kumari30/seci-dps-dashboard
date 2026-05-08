const express = require("express");
const router = express.Router();
const {
  login_user,
  getAllUsers,
  manageUser,
  createUser,
  editUserDepartmentMapping,
} = require("../controllers/auth_controller");
const { verifyAdmin, verifyToken } = require("../middleware/verify_token");
const auditLogger = require("../middleware/audit_logger"); // ✅ imported properly

// Define route: POST /api/login
router.post("/login", login_user); // ❌ no audit - user is not yet authenticated

// GET all users (admin only)
router.get(
  "/users",
  verifyToken,
  verifyAdmin,
  auditLogger("Viewed all users"),
  getAllUsers
);

// Update/manage a user (admin only)
router.put(
  "/users/:user_id",
  verifyToken,
  verifyAdmin,
  auditLogger("Modified user access or status"),
  manageUser
);

// Create a new user - either admin or user
router.post(
  "/users/add",
  verifyToken,
  verifyAdmin,
  auditLogger("Created a new user"),
  createUser
);

router.put(
  "/users/mapping/edit",
  verifyToken,
  verifyAdmin,
  auditLogger("Edited User Department mappings"),
  editUserDepartmentMapping
);

module.exports = router;
