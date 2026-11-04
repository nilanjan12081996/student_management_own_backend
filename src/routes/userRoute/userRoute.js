const express = require("express");
const userController = require("../../controllers/userController");
const { authenticateToken, requireAdmin } = require("../../middleware/authMiddleware");

const router = express.Router();

// Auto-heal reset password columns before processing any user requests
router.use(async (req, res, next) => {
    try {
        await userController.ensureResetColumns();
    } catch (_) {}
    next();
});

// ==========================================
// PUBLIC AUTHENTICATION ROUTES
// ==========================================
// Create/Register user (Public registration for new students)
router.post("/create", userController.createUser);

// Login user (Returns JWT token with user id, role, roll, and details)
router.post("/login", userController.loginUser);

// Forgot password
router.post("/forgot-password", userController.forgotPassword);

// Reset password
router.post("/reset-password", userController.resetPassword);

// ==========================================
// PROTECTED USER ROUTES
// ==========================================
// Get all users (Admin / Tutor only)
router.get("/getAll", authenticateToken, requireAdmin, userController.getAllUsers);

// Get user by ID (Authenticated user or Admin)
router.get("/getById/:id", authenticateToken, userController.getUserById);

// Update user profile (Authenticated user or Admin)
router.put("/update/:id", authenticateToken, userController.updateUser);

// Delete user (Admin only)
router.delete("/delete/:id", authenticateToken, requireAdmin, userController.deleteUser);

module.exports = router;
