const { Batch, User } = require("../../models");
'use strict';

// Create Batch
const createBatch = async (req, res) => {
    try {
        const { organization_id, name, subject, join_code } = req.body;

        const batch = await Batch.create({
            organization_id,
            name,
            subject,
            join_code
        });

        res.status(201).json({
            success: true,
            message: 'Batch created successfully',
            data: batch
        });

    } catch (error) {
        console.error('Create Batch Error:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to create batch',
            error: error.message
        });
    }
};


// Helper to calculate student count for a batch
const countStudentsForBatch = (batch, students) => {
    const bName = (batch.name || '').trim().toLowerCase();
    const bSubject = (batch.subject || '').trim().toLowerCase();
    const bCode = (batch.join_code || '').trim().toUpperCase();

    return students.filter(s => {
        if (batch.organization_id && s.organization_id && Number(batch.organization_id) !== Number(s.organization_id)) {
            return false;
        }
        const sClass = (s.class || '').trim().toLowerCase();
        const sCourse = (s.course || '').trim().toLowerCase();
        const sCode = (s.tuition_code || '').trim().toUpperCase();

        return (
            (bName && sClass === bName) ||
            (bCode && sCode === bCode) ||
            (bSubject && sClass === bSubject) ||
            (bName && sCourse === bName)
        );
    }).length;
};

// Get All Batches
const getAllBatches = async (req, res) => {
    try {
        const where = {};
        if (req.query.organization_id) {
            where.organization_id = Number(req.query.organization_id);
        }

        const batches = await Batch.findAll({ where });

        let students = [];
        try {
            students = await User.findAll({
                where: { role: 'student' },
                attributes: ['id', 'name', 'email', 'class', 'course', 'tuition_code', 'organization_id']
            });
        } catch (_) {}

        const batchesWithCounts = batches.map(batch => {
            const batchJson = batch.toJSON();
            batchJson.student_count = countStudentsForBatch(batch, students);
            return batchJson;
        });

        res.status(200).json({
            success: true,
            message: 'Batches fetched successfully',
            data: batchesWithCounts
        });

    } catch (error) {
        console.error('Get All Batches Error:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to fetch batches',
            error: error.message
        });
    }
};


// Get Batch By ID
const getBatchById = async (req, res) => {
    try {
        const { id } = req.params;

        const batch = await Batch.findByPk(id);

        if (!batch) {
            return res.status(404).json({
                success: false,
                message: 'Batch not found'
            });
        }

        const batchJson = batch.toJSON();
        let students = [];
        try {
            students = await User.findAll({
                where: { role: 'student' },
                attributes: ['id', 'name', 'email', 'class', 'course', 'tuition_code', 'organization_id']
            });
        } catch (_) {}

        batchJson.student_count = countStudentsForBatch(batch, students);

        res.status(200).json({
            success: true,
            message: 'Batch fetched successfully',
            data: batchJson
        });

    } catch (error) {
        console.error('Get Batch By ID Error:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to fetch batch',
            error: error.message
        });
    }
};


// Update Batch
const updateBatch = async (req, res) => {
    try {
        const { id } = req.params;

        const batch = await Batch.findByPk(id);

        if (!batch) {
            return res.status(404).json({
                success: false,
                message: 'Batch not found'
            });
        }

        const {
            organization_id,
            name,
            subject,
            join_code
        } = req.body;

        await batch.update({
            organization_id: organization_id || batch.organization_id,
            name: name !== undefined ? name : batch.name,
            subject: subject !== undefined ? subject : batch.subject,
            join_code: join_code || batch.join_code
        });

        res.status(200).json({
            success: true,
            message: 'Batch updated successfully',
            data: batch
        });

    } catch (error) {
        console.error('Update Batch Error:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to update batch',
            error: error.message
        });
    }
};


// Delete Batch
const deleteBatch = async (req, res) => {
    try {
        const { id } = req.params;

        const batch = await Batch.findByPk(id);

        if (!batch) {
            return res.status(404).json({
                success: false,
                message: 'Batch not found'
            });
        }

        await batch.destroy();

        res.status(200).json({
            success: true,
            message: 'Batch deleted successfully'
        });

    } catch (error) {
        console.error('Delete Batch Error:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to delete batch',
            error: error.message
        });
    }
};


module.exports = {
    createBatch:createBatch,
    getAllBatches:getAllBatches,
    getBatchById:getBatchById,
    updateBatch:updateBatch,
    deleteBatch:deleteBatch
};