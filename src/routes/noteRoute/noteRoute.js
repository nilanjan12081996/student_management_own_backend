const express = require("express");
const noteController = require("../../controllers/noteController/noteController");
const router = express.Router();

// Auto-heal notes columns (batch_id, batch_name) before processing note requests
router.use(async (req, res, next) => {
    try {
        await noteController.ensureNoteColumns();
    } catch (_) {}
    next();
});

// Create a note
router.post("/createNote", noteController.createNote);
router.post("/create", noteController.createNote);
router.post("/", noteController.createNote);

// Get all notes
router.get('/getAllNotes', noteController.getAllNotes);
router.get('/getAll', noteController.getAllNotes);
router.get('/', noteController.getAllNotes);

// Get note by ID
router.get('/getNoteById/:id', noteController.getNoteById);
router.get('/getById/:id', noteController.getNoteById);
router.get('/:id', noteController.getNoteById);

// Update note
router.put('/updateNote/:id', noteController.updateNote);
router.put('/update/:id', noteController.updateNote);
router.put('/:id', noteController.updateNote);

// Delete note
router.delete('/deleteNote/:id', noteController.deleteNote);
router.delete('/delete/:id', noteController.deleteNote);
router.delete('/:id', noteController.deleteNote);

module.exports = router;
