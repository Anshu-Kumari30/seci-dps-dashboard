const express = require("express");
const router = express.Router();
const {
    getAllAuditLogs
} = require("../controllers/audit_controller");
const { verifyAdmin, verifyToken } = require("../middleware/verify_token");

router.get("/all", verifyToken, verifyAdmin, getAllAuditLogs);

module.exports = router;