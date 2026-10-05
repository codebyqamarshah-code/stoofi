const express = require('express');
const { 
  getAll, 
  getStats, 
  getById, 
  create, 
  update, 
  toggleFollowUp, 
  remove 
} = require('../controllers/phone-call-log.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

router.get('/stats', getStats);
router.route('/').get(getAll).post(create);
router.route('/:id').get(getById).put(update).delete(remove);
router.patch('/:id/follow-up', toggleFollowUp);

module.exports = router;
