const { Note } = require("../../models");

let noteColumnsEnsured = false;
const ensureNoteColumns = async () => {
    if (noteColumnsEnsured) return;
    try {
        const sequelize = Note.sequelize;
        const alterQueries = [
            "ALTER TABLE Notes ADD COLUMN batch_id INT NULL",
            "ALTER TABLE Notes ADD COLUMN batch_ids VARCHAR(255) NULL",
            "ALTER TABLE Notes ADD COLUMN batch_name VARCHAR(255) NULL",
            "ALTER TABLE notes ADD COLUMN batch_id INT NULL",
            "ALTER TABLE notes ADD COLUMN batch_ids VARCHAR(255) NULL",
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

// Helper: Auto-detect semester number from batch or class names (e.g. "BCA sem3" -> "Semester 3")
const inferSemesterFromText = (text, fallback = null) => {
    if (!text) return fallback;
    const match1 = text.match(/sem(?:ester)?\s*(\d+)/i);
    if (match1 && match1[1]) return `Semester ${match1[1]}`;
    const match2 = text.match(/(\d+)(?:st|nd|rd|th)?\s*sem/i);
    if (match2 && match2[1]) return `Semester ${match2[1]}`;
    return fallback;
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
            batch_ids,
            batch_name,
            organization_id
        } = req.body;

        const resolvedBatchId = batch_id && batch_id !== 'all' ? Number(batch_id) : null;
        const resolvedBatchIds = batch_ids
            ? (Array.isArray(batch_ids) ? batch_ids.join(',') : String(batch_ids))
            : null;
        const resolvedBatchName = batch_name && batch_name !== 'All Batches' && batch_name !== 'all'
            ? batch_name
            : (resolvedBatchId ? null : 'All Batches');
        const finalClass = (resolvedBatchName && resolvedBatchName !== 'All Batches')
            ? resolvedBatchName
            : (noteClass || 'All Classes');

        // Automatically infer true semester from batch/class if semester was defaulted to 'Semester 1' or omitted
        const detectedSemester = inferSemesterFromText(`${resolvedBatchName || ''} ${finalClass || ''}`);
        const resolvedSemester = detectedSemester || semester || 'Semester 1';

        const note = await Note.create({
            title,
            topic,
            class: finalClass,
            semester: resolvedSemester,
            batch_id: resolvedBatchId,
            batch_ids: resolvedBatchIds,
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

        // Auto-heal existing notes where batch/class specifies semester (e.g. "BCA sem3") but was saved as "Semester 1"
        for (const n of notes) {
            const detected = inferSemesterFromText(`${n.batch_name || ''} ${n.class || ''}`);
            if (detected && n.semester !== detected && (n.semester === 'Semester 1' || !n.semester || n.semester === 'None')) {
                try {
                    await n.update({ semester: detected });
                    n.semester = detected;
                } catch (_) {}
            }
        }

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

        // Auto-heal semester if detected from batch/class
        const detected = inferSemesterFromText(`${note.batch_name || ''} ${note.class || ''}`);
        if (detected && note.semester !== detected && (note.semester === 'Semester 1' || !note.semester)) {
            try {
                await note.update({ semester: detected });
                note.semester = detected;
            } catch (_) {}
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
            batch_ids,
            batch_name
        } = req.body;

        const resolvedBatchId = batch_id !== undefined
            ? (batch_id && batch_id !== 'all' ? Number(batch_id) : null)
            : note.batch_id;
        const resolvedBatchIds = batch_ids !== undefined
            ? (Array.isArray(batch_ids) ? batch_ids.join(',') : (batch_ids ? String(batch_ids) : null))
            : note.batch_ids;
        const resolvedBatchName = batch_name !== undefined
            ? (batch_name && batch_name !== 'All Batches' && batch_name !== 'all' ? batch_name : (resolvedBatchId ? null : 'All Batches'))
            : note.batch_name;
        const finalClass = (resolvedBatchName && resolvedBatchName !== 'All Batches')
            ? resolvedBatchName
            : (noteClass !== undefined ? noteClass : note.class);

        const detectedSemester = inferSemesterFromText(`${resolvedBatchName || ''} ${finalClass || ''}`);
        const resolvedSemester = semester !== undefined
            ? ((semester === 'Semester 1' && detectedSemester) ? detectedSemester : semester)
            : (detectedSemester || note.semester);

        await note.update({
            title: title !== undefined ? title : note.title,
            topic: topic !== undefined ? topic : note.topic,
            class: finalClass,
            semester: resolvedSemester,
            batch_id: resolvedBatchId,
            batch_ids: resolvedBatchIds,
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
    createNote,
    getAllNotes,
    getNoteById,
    updateNote,
    deleteNote
};
