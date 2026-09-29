const express = require('express');
const { getAll, getById, create, update, remove } = require('../controllers/staff.controller');
const { protect } = require('../middleware/auth.middleware');

const upload = require('../middleware/upload.middleware');
const router = express.Router();

router.use(protect);

router.route('/').get(getAll).post(upload.any(), create);
router.route('/:id').get(getById).put(upload.any(), update).delete(remove);

module.exports = router;
