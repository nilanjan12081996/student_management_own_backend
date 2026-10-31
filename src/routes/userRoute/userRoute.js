const express = require("express");

const userController = require("../../controllers/userController");

const router = express.Router();

// Auto-heal reset password columns before processing any user requests
router.use(async (req, res, next) => {
    try {
        await userController.ensureResetColumns();
    } catch (_) {}
    next();
});

// Create/Register user
router.post("/create", userController.createUser);

// Login user
router.post("/login", userController.loginUser);

// Forgot password
router.post("/forgot-password", userController.forgotPassword);

// Reset password
router.post("/reset-password", userController.resetPassword);

// Get all users
router.get("/getAll", userController.getAllUsers);

// Get user by ID
router.get("/getById/:id", userController.getUserById);

// Update user
router.put("/update/:id", userController.updateUser);

// Delete user
router.delete("/delete/:id", userController.deleteUser);

module.exports = router;