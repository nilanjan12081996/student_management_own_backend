const { Batch } =require("../../models");
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


// Get All Batches
const getAllBatches = async (req, res) => {
    try {
        const batches = await Batch.findAll();

        res.status(200).json({
            success: true,
            message: 'Batches fetched successfully',
            data: batches
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

        res.status(200).json({
            success: true,
            message: 'Batch fetched successfully',
            data: batch
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
            organization_id,
            name,
            subject,
            join_code
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