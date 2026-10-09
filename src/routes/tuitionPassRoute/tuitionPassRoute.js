const express = require("express");

const router = express.Router();

const tuitionPassController = require(
    "../../controllers/tuitionPassController/tuitionPassController"
);


// ======================================================
// CREATE / ISSUE TUITION PASS
// POST /api/tuition-passes/createTuitionPass
// ======================================================
router.post(
    "/createTuitionPass",
    tuitionPassController.createTuitionPass
);


// ======================================================
// GET ALL TUITION PASSES
// GET /api/tuition-passes/getAllTuitionPass
// ======================================================
router.get(
    "/getAllTuitionPass",
    tuitionPassController.getAllTuitionPasses
);


// ======================================================
// DELETE / REVOKE TUITION PASS
// DELETE /api/tuition-passes/deleteTuitionPass/:id
// ======================================================
router.delete(
    "/deleteTuitionPass/:id",
    tuitionPassController.deleteTuitionPass
);


module.exports = router;