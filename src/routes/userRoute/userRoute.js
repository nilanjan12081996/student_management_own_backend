const express = require("express");

const userController = require("../../controllers/userController");

const router = express.Router();

// Create/Register user
router.post("/create", userController.createUser);

// Login user
router.post("/login", userController.loginUser);

// Get all users
router.get("/getAll", userController.getAllUsers);

// Get user by ID
router.get("/getById/:id", userController.getUserById);

// Update user
router.put("/update/:id", userController.updateUser);

// Delete user
router.delete("/delete/:id", userController.deleteUser);

module.exports = router;