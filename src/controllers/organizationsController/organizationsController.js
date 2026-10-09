'use strict';
const {Organization} = require("../../models")

// Create Organization
const createOrganization = async (req, res) => {
    try {
        const {
            name,
            slug,
            owner_name,
            email,
            plan,
            status
        } = req.body;

        // Basic validation
        if (!name || !email) {
            return res.status(400).json({
                message: 'Name and email are required'
            });
        }

        // Check if email already exists
        const existingOrganization = await Organization.findOne({
            where: { email }
        });

        if (existingOrganization) {
            return res.status(409).json({
                message: 'Organization with this email already exists'
            });
        }

        const organization = await Organization.create({
            name,
            slug,
            owner_name,
            email,
            plan: plan || 'starter',
            status: status || 'active'
        });

        return res.status(201).json({
            message: 'Organization created successfully',
            data: organization
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: 'Failed to create organization',
            error: error.message
        });
    }
};


// Get All Organizations
const getAllOrganizations = async (req, res) => {
    try {
        const organizations = await Organization.findAll();

        return res.status(200).json({
            message: 'Organizations fetched successfully',
            data: organizations
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: 'Failed to fetch organizations',
            error: error.message
        });
    }
};


// Get Organization By ID
const getOrganizationById = async (req, res) => {
    try {
        const { id } = req.params;

        const organization = await Organization.findByPk(id);

        if (!organization) {
            return res.status(404).json({
                message: 'Organization not found'
            });
        }

        return res.status(200).json({
            message: 'Organization fetched successfully',
            data: organization
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: 'Failed to fetch organization',
            error: error.message
        });
    }
};


// Update Organization
const updateOrganization = async (req, res) => {
    try {
        const { id } = req.params;

        const organization = await Organization.findByPk(id);

        if (!organization) {
            return res.status(404).json({
                message: 'Organization not found'
            });
        }

        const {
            name,
            slug,
            owner_name,
            email,
            plan,
            status
        } = req.body;

        await organization.update({
            name,
            slug,
            owner_name,
            email,
            plan,
            status
        });

        return res.status(200).json({
            message: 'Organization updated successfully',
            data: organization
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: 'Failed to update organization',
            error: error.message
        });
    }
};


// Delete Organization
const deleteOrganization = async (req, res) => {
    try {
        const { id } = req.params;

        const organization = await Organization.findByPk(id);

        if (!organization) {
            return res.status(404).json({
                message: 'Organization not found'
            });
        }

        await organization.destroy();

        return res.status(200).json({
            message: 'Organization deleted successfully'
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: 'Failed to delete organization',
            error: error.message
        });
    }
};

module.exports ={
    createOrganization:createOrganization,
    getAllOrganizations:getAllOrganizations,
    getOrganizationById :getOrganizationById ,
    updateOrganization :updateOrganization ,
    deleteOrganization:deleteOrganization





}
