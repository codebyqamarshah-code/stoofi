const express = require('express');
const { 
  getAll, 
  getStats, 
  getById, 
  create, 
  update, 
  toggleStatus, 
  remove,
  generateCertificates
} = require('../controllers/certificate.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

router.get('/stats', getStats);
router.post('/generate', generateCertificates);
router.route('/').get(getAll).post(create);
router.route('/:id').get(getById).put(update).delete(remove);
router.patch('/:id/status', toggleStatus);

module.exports = router;
