const express = require('express');
const router = express.Router();
const { getMunicipalities, addMunicipality, updateMunicipality, deleteMunicipality } = require('../controllers/municipalityController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(getMunicipalities)
  .post(protect, authorize('admin'), addMunicipality);

router.route('/:id')
  .put(protect, authorize('admin'), updateMunicipality)
  .delete(protect, authorize('admin'), deleteMunicipality);

module.exports = router;
