const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const contentController = require('../controllers/content.controller');

router.use(protect);

router.post('/', contentController.create);
router.get('/', contentController.getList);
router.delete('/:id', contentController.remove);

module.exports = router;

