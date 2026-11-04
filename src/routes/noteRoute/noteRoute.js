const express = require("express");
const noteController = require("../../controllers/noteController/noteController");
const { authenticateToken, requireAdmin } = require("../../middleware/authMiddleware");

const router = express.Router();

// Auto-heal notes columns (batch_id, batch_name) before processing note requests
router.use(async (req, res, next) => {
    try {
        await noteController.ensureNoteColumns();
    } catch (_) {}
    next();
});

// ==========================================
// ADMIN / TUTOR ONLY NOTE ACTIONS
// ==========================================
// Create note (Admin/Tutor only)
router.post("/createNote", authenticateToken, requireAdmin, noteController.createNote);
router.post("/create", authenticateToken, requireAdmin, noteController.createNote);
router.post("/", authenticateToken, requireAdmin, noteController.createNote);

// Update note (Admin/Tutor only)
router.put('/updateNote/:id', authenticateToken, requireAdmin, noteController.updateNote);
router.put('/update/:id', authenticateToken, requireAdmin, noteController.updateNote);
router.put('/:id', authenticateToken, requireAdmin, noteController.updateNote);

// Delete note (Admin/Tutor only)
router.delete('/deleteNote/:id', authenticateToken, requireAdmin, noteController.deleteNote);
router.delete('/delete/:id', authenticateToken, requireAdmin, noteController.deleteNote);
router.delete('/:id', authenticateToken, requireAdmin, noteController.deleteNote);

// ==========================================
// STUDENT & ADMIN ACCESS (READ-ONLY)
// ==========================================
// Get all notes (Students & Admins)
router.get('/getAllNotes', authenticateToken, noteController.getAllNotes);
router.get('/getAll', authenticateToken, noteController.getAllNotes);
router.get('/', authenticateToken, noteController.getAllNotes);

// Get note by ID (Students & Admins)
router.get('/getNoteById/:id', authenticateToken, noteController.getNoteById);
router.get('/getById/:id', authenticateToken, noteController.getNoteById);
router.get('/:id', authenticateToken, noteController.getNoteById);

module.exports = router;
