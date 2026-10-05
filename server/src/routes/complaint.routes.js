const express = require('express');
const { 
  getAll, 
  getStats, 
  getById, 
  create, 
  update, 
  updateStatus, 
  assign, 
  remove 
} = require('../controllers/complaint.controller');
const { protect } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

const router = express.Router();

router.use(protect);

router.route('/stats').get(getStats);
router.route('/').get(getAll).post(upload.single('file'), create);
router.route('/:id/status').patch(updateStatus);
router.route('/:id/assign').patch(assign);
router.route('/:id')
  .get(getById)
  .put(upload.single('file'), update)
  .delete(remove);

module.exports = router;
