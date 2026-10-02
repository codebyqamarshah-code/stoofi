const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const studentGroupController = require('../controllers/studentGroup.controller');

router.use(protect);

router.post('/', studentGroupController.create);
router.get('/', studentGroupController.getList);
router.put('/:id', studentGroupController.update);
router.delete('/:id', studentGroupController.remove);

module.exports = router;

