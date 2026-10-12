const express = require('express');
const router = express.Router();
const behaviourController = require('../controllers/behaviour.controller');

// Incidents CRUD
router.get('/incidents', behaviourController.getIncidents);
router.post('/incidents', behaviourController.createIncident);
router.put('/incidents/:id', behaviourController.updateIncident);
router.delete('/incidents/:id', behaviourController.deleteIncident);

// Assigned Incidents
router.get('/assign', behaviourController.getAssignedIncidents);
router.post('/assign', behaviourController.assignIncident);
router.delete('/assign/:id', behaviourController.deleteAssignedIncident);

// Reports
router.get('/reports/student', behaviourController.getStudentReport);
router.get('/reports/class-section', behaviourController.getClassSectionReport);
router.get('/reports/incident-wise', behaviourController.getIncidentWiseReport);

// Settings
router.get('/settings', behaviourController.getSettings);
router.post('/settings', behaviourController.saveSettings);
router.put('/settings', behaviourController.saveSettings);

module.exports = router;
