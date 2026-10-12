const express = require('express');
const router = express.Router();
const controller = require('../controllers/classRoutine.controller');

router.get('/', controller.getRoutines);
router.post('/', controller.createRoutine);
router.get('/:id', controller.getRoutineById);
router.put('/:id', controller.updateRoutine);
router.delete('/:id', controller.deleteRoutine);

module.exports = router;
