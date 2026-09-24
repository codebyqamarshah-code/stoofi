const express = require('express');
const { getSettings, updateSettings } = require('../controllers/setting.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', getSettings);
router.put('/', protect, authorize('Super Admin', 'Admin'), updateSettings);

module.exports = router;
