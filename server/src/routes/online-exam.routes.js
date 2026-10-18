const express = require('express');
const {
  getAll,
  getById,
  create,
  update,
  remove,
  submitExam,
  getExamResults,
  getStudentResults
} = require('../controllers/online-exam.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

router.get('/student/results', getStudentResults);

router.route('/')
  .get(getAll)
  .post(create);

router.route('/:id')
  .get(getById)
  .put(update)
  .delete(remove);

router.post('/:id/submit', submitExam);
router.get('/:id/results', getExamResults);

module.exports = router;
