const express = require("express");
const batchController = require("../../controllers/batchController/batchController");
const { authenticateToken, requireAdmin } = require("../../middleware/authMiddleware");

const router = express.Router();

// ==========================================
// ADMIN / TUTOR ONLY BATCH MUTATIONS
// ==========================================
// Create a batch (Admin only)
router.post("/createBatch", authenticateToken, requireAdmin, batchController.createBatch);
router.post("/create", authenticateToken, requireAdmin, batchController.createBatch);
router.post("/", authenticateToken, requireAdmin, batchController.createBatch);

// Update batch (Admin only)
router.put("/updateBatch/:id", authenticateToken, requireAdmin, batchController.updateBatch);
router.put("/update/:id", authenticateToken, requireAdmin, batchController.updateBatch);
router.put("/:id", authenticateToken, requireAdmin, batchController.updateBatch);

// Delete batch (Admin only)
router.delete("/deleteBatch/:id", authenticateToken, requireAdmin, batchController.deleteBatch);
router.delete("/delete/:id", authenticateToken, requireAdmin, batchController.deleteBatch);
router.delete("/:id", authenticateToken, requireAdmin, batchController.deleteBatch);

// ==========================================
// SHARED BATCH ACCESS (STUDENT & ADMIN)
// ==========================================
// Get all batches
router.get("/getAllBatches", authenticateToken, batchController.getAllBatches);
router.get("/getAll", authenticateToken, batchController.getAllBatches);
router.get("/", authenticateToken, batchController.getAllBatches);

// Get batch by ID
router.get("/getBatchById/:id", authenticateToken, batchController.getBatchById);
router.get("/getById/:id", authenticateToken, batchController.getBatchById);
router.get("/:id", authenticateToken, batchController.getBatchById);

module.exports = router;
