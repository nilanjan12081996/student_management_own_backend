const express = require("express");
const batchController = require("../../controllers/batchController/batchController");

const router = express.Router();

// Create a batch
router.post("/createBatch", batchController.createBatch);
router.post("/create", batchController.createBatch);
router.post("/", batchController.createBatch);

// Get all batches
router.get("/getAllBatches", batchController.getAllBatches);
router.get("/getAll", batchController.getAllBatches);
router.get("/", batchController.getAllBatches);

// Get batch by ID
router.get("/getBatchById/:id", batchController.getBatchById);
router.get("/getById/:id", batchController.getBatchById);
router.get("/:id", batchController.getBatchById);

// Update batch
router.put("/updateBatch/:id", batchController.updateBatch);
router.put("/update/:id", batchController.updateBatch);
router.put("/:id", batchController.updateBatch);

// Delete batch
router.delete("/deleteBatch/:id", batchController.deleteBatch);
router.delete("/delete/:id", batchController.deleteBatch);
router.delete("/:id", batchController.deleteBatch);

module.exports = router;