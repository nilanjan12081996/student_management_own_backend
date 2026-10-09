const { Note } = require("../../models");

// Create a new note
const createNote = async (req, res) => {
    try {
        const {
            title,
            topic,
            class: noteClass,
            semester,
            content_type,
            content_url
        } = req.body;

        const note = await Note.create({
            title,
            topic,
            class: noteClass,
            semester,
            content_type,
            content_url
        });

        res.status(201).json({
            message: 'Note created successfully',
            note
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Failed to create note',
            error: error.message
        });
    }
};


// Get all notes
const getAllNotes = async (req, res) => {
    try {
        const notes = await Note.findAll();

        res.status(200).json({
            message: 'Notes fetched successfully',
            notes
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Failed to fetch notes',
            error: error.message
        });
    }
};


// Get a single note by ID
const getNoteById = async (req, res) => {
    try {
        const { id } = req.params;

        const note = await Note.findByPk(id);

        if (!note) {
            return res.status(404).json({
                message: 'Note not found'
            });
        }

        res.status(200).json({
            message: 'Note fetched successfully',
            note
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Failed to fetch note',
            error: error.message
        });
    }
};


// Update a note
const updateNote = async (req, res) => {
    try {
        const { id } = req.params;

        const note = await Note.findByPk(id);

        if (!note) {
            return res.status(404).json({
                message: 'Note not found'
            });
        }

        const {
            title,
            topic,
             class: noteClass,
            semester,
            content_type,
            content_url
        } = req.body;

        await note.update({
            title,
            topic,
            class: noteClass,
            semester,
            content_type,
            content_url
        });

        res.status(200).json({
            message: 'Note updated successfully',
            note
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Failed to update note',
            error: error.message
        });
    }
};


// Delete a note
const deleteNote = async (req, res) => {
    try {
        const { id } = req.params;

        const note = await Note.findByPk(id);

        if (!note) {
            return res.status(404).json({
                message: 'Note not found'
            });
        }

        await note.destroy();

        res.status(200).json({
            message: 'Note deleted successfully'
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Failed to delete note',
            error: error.message
        });
    }
};


module.exports = {
    createNote:createNote,
    getAllNotes:getAllNotes,
    getNoteById:getNoteById,
    updateNote:updateNote,
    deleteNote:deleteNote
};