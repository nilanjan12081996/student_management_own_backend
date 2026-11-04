'use strict';

const express = require('express');
const organizationController = require("../../controllers/organizationsController/organizationsController");
const { authenticateToken, requireAdmin } = require("../../middleware/authMiddleware");

const router = express.Router();

// ==========================================
// ADMIN ONLY ORGANIZATION MUTATIONS
// ==========================================
// Create Organization (Admin only)
router.post('/createOrganization', authenticateToken, requireAdmin, organizationController.createOrganization);
router.post('/create', authenticateToken, requireAdmin, organizationController.createOrganization);
router.post('/', authenticateToken, requireAdmin, organizationController.createOrganization);

// Update Organization (Admin only)
router.put('/updateOrganization/:id', authenticateToken, requireAdmin, organizationController.updateOrganization);
router.put('/update/:id', authenticateToken, requireAdmin, organizationController.updateOrganization);
router.put('/:id', authenticateToken, requireAdmin, organizationController.updateOrganization);

// Delete Organization (Admin only)
router.delete('/deleteOrganization/:id', authenticateToken, requireAdmin, organizationController.deleteOrganization);
router.delete('/delete/:id', authenticateToken, requireAdmin, organizationController.deleteOrganization);
router.delete('/:id', authenticateToken, requireAdmin, organizationController.deleteOrganization);

// ==========================================
// SHARED ORGANIZATION ACCESS
// ==========================================
// Get All Organizations
router.get('/getAllOrganization', authenticateToken, organizationController.getAllOrganizations);
router.get('/getAllOrganizations', authenticateToken, organizationController.getAllOrganizations);
router.get('/getAll', authenticateToken, organizationController.getAllOrganizations);
router.get('/', authenticateToken, organizationController.getAllOrganizations);

// Get Organization By ID
router.get('/getOrganizationById/:id', authenticateToken, organizationController.getOrganizationById);
router.get('/getById/:id', authenticateToken, organizationController.getOrganizationById);
router.get('/:id', authenticateToken, organizationController.getOrganizationById);

module.exports = router;
