const express = require('express');
const { getAll, getById, create, update, remove, bulkCreate, bulkDelete, promoteStudents, getNextAdmissionNo, getNextRollNo, publicVerify } = require('../controllers/student.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

const router = express.Router();

// Public student verification for scannable QR codes (No login required)
router.get('/public-verify/:identifier', publicVerify);
router.get('/verify/:identifier', publicVerify);

router.use(protect);

router.get('/next-admission-no', getNextAdmissionNo);
router.get('/next-roll-no', getNextRollNo);
router.post('/bulk', bulkCreate);
router.post('/bulk-delete', bulkDelete);
router.delete('/bulk', bulkDelete);
router.post('/promote', promoteStudents);
router.route('/').get(getAll).post(upload.any(), create);
router.route('/:id').get(getById).put(upload.any(), update).delete(remove);

module.exports = router;
