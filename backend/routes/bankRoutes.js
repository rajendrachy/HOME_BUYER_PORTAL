const express = require('express');
const router = express.Router();
const Bank = require('../models/Bank');

// @desc    Get all active banks
// @route   GET /api/banks
// @access  Public
router.get('/', async (req, res) => {
  try {
    const banks = await Bank.find({ isActive: true }).select('name branch _id');
    res.json({ success: true, banks });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
