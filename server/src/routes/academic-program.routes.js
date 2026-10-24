const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getAllPrograms,
  createProgram,
  updateProgram,
  deleteProgram,
  getAllAffiliations,
  createAffiliation,
  updateAffiliation,
  deleteAffiliation,
  getAllCampuses,
  createCampus,
  getAllSessions,
  createSession,
  getAllOfferings,
  getOfferingById,
  createOffering,
  updateOffering,
  deleteOffering,
  getBatches,
  createBatch,
  getNextNumbers,
  searchExistingStudent,
  createAdmission,
  getAllEnrollments,
  updateEnrollmentStatus
} = require('../controllers/academic-program.controller');

// Read-only endpoints accessible to authenticated users (Staff, Admins, Teachers)
router.use(protect);

router.get('/category', getAllCategories);
router.get('/program', getAllPrograms);
router.get('/affiliation', getAllAffiliations);
router.get('/campus', getAllCampuses);
router.get('/session', getAllSessions);
router.get('/offering', getAllOfferings);
router.get('/offering/:id', getOfferingById);
router.get('/batch', getBatches);
router.get('/next-numbers', getNextNumbers);
router.get('/student-search', searchExistingStudent);
router.get('/enrollment', getAllEnrollments);

// Admission creation (Super Admin & Admin)
router.post('/admission', authorize('Super Admin', 'Admin'), createAdmission);
router.put('/enrollment/:id/status', authorize('Super Admin', 'Admin'), updateEnrollmentStatus);

// Academic Configuration management (Super Admin & Admin)
router.post('/category', authorize('Super Admin', 'Admin'), createCategory);
router.put('/category/:id', authorize('Super Admin', 'Admin'), updateCategory);
router.delete('/category/:id', authorize('Super Admin', 'Admin'), deleteCategory);

router.post('/program', authorize('Super Admin', 'Admin'), createProgram);
router.put('/program/:id', authorize('Super Admin', 'Admin'), updateProgram);
router.delete('/program/:id', authorize('Super Admin', 'Admin'), deleteProgram);

router.post('/affiliation', authorize('Super Admin', 'Admin'), createAffiliation);
router.put('/affiliation/:id', authorize('Super Admin', 'Admin'), updateAffiliation);
router.delete('/affiliation/:id', authorize('Super Admin', 'Admin'), deleteAffiliation);

router.post('/campus', authorize('Super Admin', 'Admin'), createCampus);
router.post('/session', authorize('Super Admin', 'Admin'), createSession);

router.post('/offering', authorize('Super Admin', 'Admin'), createOffering);
router.put('/offering/:id', authorize('Super Admin', 'Admin'), updateOffering);
router.delete('/offering/:id', authorize('Super Admin', 'Admin'), deleteOffering);

router.post('/batch', authorize('Super Admin', 'Admin'), createBatch);

module.exports = router;
