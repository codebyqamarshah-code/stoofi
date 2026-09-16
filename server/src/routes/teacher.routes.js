const express = require('express');
const { getAll, getById } = require('../controllers/teacher.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

router.route('/').get(getAll);
router.route('/:id').get(getById);

module.exports = router;
