const express = require('express');
const { 
  getQueries, 
  createQuery, 
  updateQuery, 
  deleteQuery 
} = require('../controllers/admissionQuery.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect); // Require auth for all admission query routes

router.route('/')
  .get(getQueries)
  .post(createQuery);

router.route('/:id')
  .put(updateQuery)
  .delete(deleteQuery);

module.exports = router;
