const express = require('express');
const { getAll, create, update, remove } = require('../controllers/question-bank.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

router.route('/').get(getAll).post(create);
router.route('/:id').put(update).delete(remove);

module.exports = router;
