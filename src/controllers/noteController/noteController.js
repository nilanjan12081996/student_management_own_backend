const { Note } = require("../../models");

let noteColumnsEnsured = false;
const ensureNoteColumns = async () => {
    if (noteColumnsEnsured) return;
    try {
        const sequelize = Note.sequelize;
        const alterQueries = [
            "ALTER TABLE Notes ADD COLUMN batch_id INT NULL",
            "ALTER TABLE Notes ADD COLUMN batch_name VARCHAR(255) NULL",
            "ALTER TABLE notes ADD COLUMN batch_id INT NULL",
            "ALTER TABLE notes ADD COLUMN batch_name VARCHAR(255) NULL"
        ];
        for (const sql of alterQueries) {
            try {
                await sequelize.query(sql);
            } catch (_) {}
        }
        noteColumnsEnsured = true;
    } catch (err) {
        console.warn('ensureNoteColumns note:', err.message);
        noteColumnsEnsured = true;
    }
};

// Create a new note
const createNote = async (req, res) => {
    try {
        await ensureNoteColumns();
        const {
            title,
            topic,
            class: noteClass,
            semester,
            content_type,
            content_url,
            batch_id,
            batch_name,
            organization_id
        } = req.body;

        const resolvedBatchId = batch_id && batch_id !== 'all' ? Number(batch_id) : null;
        const resolvedBatchName = batch_name && batch_name !== 'All Batches' && batch_name !== 'all'
            ? batch_name
            : (resolvedBatchId ? null : 'All Batches');
        const finalClass = (resolvedBatchName && resolvedBatchName !== 'All Batches')
            ? resolvedBatchName
            : (noteClass || 'All Classes');

        const note = await Note.create({
            title,
            topic,
            class: finalClass,
            semester,
            batch_id: resolvedBatchId,
            batch_name: resolvedBatchName,
            content_type,
            content_url,
            organization_id: organization_id || 1
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
        await ensureNoteColumns();
        const where = {};
        if (req.query.organization_id) {
            where.organization_id = Number(req.query.organization_id);
        }

        const notes = await Note.findAll({
            where,
            order: [['createdAt', 'DESC']]
        });

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
        await ensureNoteColumns();
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
        await ensureNoteColumns();
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
            content_url,
            batch_id,
            batch_name
        } = req.body;

        const resolvedBatchId = batch_id !== undefined
            ? (batch_id && batch_id !== 'all' ? Number(batch_id) : null)
            : note.batch_id;
        const resolvedBatchName = batch_name !== undefined
            ? (batch_name && batch_name !== 'All Batches' && batch_name !== 'all' ? batch_name : (resolvedBatchId ? null : 'All Batches'))
            : note.batch_name;
        const finalClass = (resolvedBatchName && resolvedBatchName !== 'All Batches')
            ? resolvedBatchName
            : (noteClass !== undefined ? noteClass : note.class);

        await note.update({
            title: title !== undefined ? title : note.title,
            topic: topic !== undefined ? topic : note.topic,
            class: finalClass,
            semester: semester !== undefined ? semester : note.semester,
            batch_id: resolvedBatchId,
            batch_name: resolvedBatchName,
            content_type: content_type !== undefined ? content_type : note.content_type,
            content_url: content_url !== undefined ? content_url : note.content_url
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
        await ensureNoteColumns();
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
    createNote: createNote,
    getAllNotes: getAllNotes,
    getNoteById: getNoteById,
    updateNote: updateNote,
    deleteNote: deleteNote,
    ensureNoteColumns: ensureNoteColumns
};
