const express = require('express');
const { getAll, getStats, create, update, checkout, remove } = require('../controllers/visitor-book.controller');
const { protect } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

const router = express.Router();

router.use(protect);

router.route('/stats').get(getStats);
router.route('/').get(getAll).post(upload.single('file'), create);
router.route('/:id/checkout').patch(checkout);
router.route('/:id').put(update).delete(remove);

module.exports = router;
