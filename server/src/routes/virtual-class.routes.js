const express = require('express');
const router = express.Router();
const {
  getVirtualClasses,
  getReports,
  getVirtualClassById,
  createVirtualClass,
  updateVirtualClass,
  updateStatus,
  deleteVirtualClass,
} = require('../controllers/virtual-class.controller');

router.get('/', getVirtualClasses);
router.get('/reports', getReports);
router.get('/:id', getVirtualClassById);
router.post('/', createVirtualClass);
router.put('/:id', updateVirtualClass);
router.patch('/:id/status', updateStatus);
router.delete('/:id', deleteVirtualClass);

module.exports = router;
