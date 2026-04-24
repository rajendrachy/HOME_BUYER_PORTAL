const express = require('express');
const router = express.Router();
const { getBanks, addBank, updateBank, deleteBank } = require('../controllers/bankController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(getBanks)
  .post(protect, authorize('admin'), addBank);

router.route('/:id')
  .put(protect, authorize('admin'), updateBank)
  .delete(protect, authorize('admin'), deleteBank);

module.exports = router;
