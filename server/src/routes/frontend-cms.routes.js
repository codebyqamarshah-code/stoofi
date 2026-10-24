const express = require('express');
const router = express.Router();
const controller = require('../controllers/frontend-cms.controller');

router.get('/', controller.getCmsData);
router.post('/', controller.mutateCmsData);
router.put('/', controller.mutateCmsData);

module.exports = router;
