const express = require('express');
const { 
  getAll, 
  getStats, 
  getByType, 
  getById, 
  create, 
  update, 
  toggleStatus, 
  remove 
} = require('../controllers/setup.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

router.get('/stats', getStats);
router.get('/type/:type', getByType);
router.route('/').get(getAll).post(create);
router.route('/:id').get(getById).put(update).delete(remove);
router.patch('/:id/status', toggleStatus);

module.exports = router;
