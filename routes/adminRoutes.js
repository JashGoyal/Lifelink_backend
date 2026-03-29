const express = require("express");
const router = express.Router();

const {
    getDashboardStats,
    getAllUsers,
    toggleBlockUser,
    getAllRequests,
    rejectAdmin,
    getAdminRequests,
    approveAdmin
} = require("../controllers/adminController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// Dashboard
router.get("/dashboard", protect, authorizeRoles("admin"), getDashboardStats);

// Users
router.get("/users", protect, authorizeRoles("admin"), getAllUsers);
router.put("/users/:id/block", protect, authorizeRoles("admin"), toggleBlockUser);

// Requests
router.get("/requests", protect, authorizeRoles("admin"), getAllRequests);
router.get("/admin-requests", protect, authorizeRoles("admin"), getAdminRequests);
router.put("/approve/:id", protect, authorizeRoles("admin"), approveAdmin);
router.put("/reject/:id", protect, authorizeRoles("admin"), rejectAdmin);

module.exports = router;