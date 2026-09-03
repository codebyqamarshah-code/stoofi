const express = require('express');
const { getAll, create, update, remove } = require('../controllers/visitor-book.controller');
const { protect } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

const router = express.Router();

router.use(protect);

router.route('/').get(getAll).post(upload.single('file'), create);
router.route('/:id').put(update).delete(remove);

module.exports = router;
