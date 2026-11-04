const express = require("express");
const router = express.Router();
const tuitionPassController = require(
    "../../controllers/tuitionPassController/tuitionPassController"
);
const { authenticateToken, requireAdmin } = require("../../middleware/authMiddleware");

// All Tuition Pass management routes are protected for Admins & Tutors only
router.use(authenticateToken, requireAdmin);

// ======================================================
// CREATE / ISSUE TUITION PASS (Admin only)
// POST /api/tuition-passes/createTuitionPass
// ======================================================
router.post(
    "/createTuitionPass",
    tuitionPassController.createTuitionPass
);

// ======================================================
// GET ALL TUITION PASSES (Admin only)
// GET /api/tuition-passes/getAllTuitionPass
// ======================================================
router.get(
    "/getAllTuitionPass",
    tuitionPassController.getAllTuitionPasses
);

// ======================================================
// DELETE / REVOKE TUITION PASS (Admin only)
// DELETE /api/tuition-passes/deleteTuitionPass/:id
// ======================================================
router.delete(
    "/deleteTuitionPass/:id",
    tuitionPassController.deleteTuitionPass
);

module.exports = router;
