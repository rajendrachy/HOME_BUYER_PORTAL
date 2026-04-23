const express = require('express');
const router = express.Router();
const Municipality = require('../models/Municipality');

// @desc    Get all active municipalities
// @route   GET /api/municipalities
// @access  Public
router.get('/', async (req, res) => {
  try {
    const municipalities = await Municipality.find().select('name district _id');
    res.json({ success: true, municipalities });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
