const express = require("express");
const router = express.Router();

// Import individual route modules
const auth_routes = require("./auth_routes");
// const deptRoutes = require("./deptRoutes"); // add more as needed

// Mount under /api
router.use("/auth", auth_routes); // → /api/users/login, etc.
// router.use("/departments", deptRoutes);

const data_routes = require("./data_routes");
router.use("/data", data_routes); // → /api/data/departments, etc.

module.exports = router;
