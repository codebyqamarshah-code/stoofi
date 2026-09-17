const express = require('express');
const { getAll, getById, create, update, remove, bulkCreate } = require('../controllers/student.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

const router = express.Router();

router.use(protect);

router.post('/bulk', authorize('Super Admin', 'Admin'), bulkCreate);
router.route('/').get(getAll).post(authorize('Super Admin', 'Admin'), upload.single('file'), create);
router.route('/:id').get(getById).put(authorize('Super Admin', 'Admin'), update).delete(authorize('Super Admin', 'Admin'), remove);

module.exports = router;
