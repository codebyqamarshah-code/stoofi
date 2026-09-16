const express = require('express');
const { getAll, getById, create, update, remove, bulkCreate } = require('../controllers/student.controller');
const { protect } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

const router = express.Router();

router.use(protect);

router.post('/bulk', bulkCreate);
router.route('/').get(getAll).post(upload.single('file'), create);
router.route('/:id').get(getById).put(update).delete(remove);

module.exports = router;
