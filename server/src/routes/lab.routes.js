const express = require('express');
const router = express.Router();
const {
  getReports,
  getLabs,
  createLab,
  updateLab,
  deleteLab,
  getEquipment,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  getMaintenance,
  createMaintenance,
  updateMaintenance,
  deleteMaintenance,
  getConsumables,
  createConsumable,
  updateConsumable,
  deleteConsumable,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getPracticals,
  createPractical,
  updatePractical,
  deletePractical
} = require('../controllers/lab.controller');

// Live Reports & Analytics
router.get('/reports', getReports);

// Laboratories
router.route('/manage')
  .get(getLabs)
  .post(createLab);
router.route('/manage/:id')
  .put(updateLab)
  .delete(deleteLab);

router.route('/')
  .get(getLabs)
  .post(createLab);
router.route('/:id')
  .put(updateLab)
  .delete(deleteLab);

// Equipment & Assets
router.route('/equipment')
  .get(getEquipment)
  .post(createEquipment);
router.route('/equipment/:id')
  .put(updateEquipment)
  .delete(deleteEquipment);

router.route('/assets')
  .get(getEquipment)
  .post(createEquipment);
router.route('/assets/:id')
  .put(updateEquipment)
  .delete(deleteEquipment);

// Maintenance & Repairs
router.route('/maintenance')
  .get(getMaintenance)
  .post(createMaintenance);
router.route('/maintenance/:id')
  .put(updateMaintenance)
  .delete(deleteMaintenance);

// Consumables & Reagents
router.route('/consumables')
  .get(getConsumables)
  .post(createConsumable);
router.route('/consumables/:id')
  .put(updateConsumable)
  .delete(deleteConsumable);

// Categories
router.route('/categories')
  .get(getCategories)
  .post(createCategory);
router.route('/categories/:id')
  .put(updateCategory)
  .delete(deleteCategory);

// Practicals & Syllabus
router.route('/practicals')
  .get(getPracticals)
  .post(createPractical);
router.route('/practicals/:id')
  .put(updatePractical)
  .delete(deletePractical);

// Lab Timetable & Schedules (Synced with Academic Class Routine)
const routineController = require('../controllers/classRoutine.controller');
router.route('/schedule')
  .get(routineController.getRoutines)
  .post(routineController.createRoutine);
router.route('/schedule/:id')
  .get(routineController.getRoutineById)
  .put(routineController.updateRoutine)
  .delete(routineController.deleteRoutine);

module.exports = router;

