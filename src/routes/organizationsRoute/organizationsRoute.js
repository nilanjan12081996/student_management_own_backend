'use strict';

const express = require('express');
const organizationController = require("../../controllers/organizationsController/organizationsController");

const router = express.Router();

// Create Organization
router.post('/createOrganization', organizationController.createOrganization);
router.post('/create', organizationController.createOrganization);
router.post('/', organizationController.createOrganization);

// Get All Organizations
router.get('/getAllOrganization', organizationController.getAllOrganizations);
router.get('/getAllOrganizations', organizationController.getAllOrganizations);
router.get('/getAll', organizationController.getAllOrganizations);
router.get('/', organizationController.getAllOrganizations);

// Get Organization By ID
router.get('/getOrganizationById/:id', organizationController.getOrganizationById);
router.get('/getById/:id', organizationController.getOrganizationById);
router.get('/:id', organizationController.getOrganizationById);

// Update Organization
router.put('/updateOrganization/:id', organizationController.updateOrganization);
router.put('/update/:id', organizationController.updateOrganization);
router.put('/:id', organizationController.updateOrganization);

// Delete Organization
router.delete('/deleteOrganization/:id', organizationController.deleteOrganization);
router.delete('/delete/:id', organizationController.deleteOrganization);
router.delete('/:id', organizationController.deleteOrganization);

module.exports = router;