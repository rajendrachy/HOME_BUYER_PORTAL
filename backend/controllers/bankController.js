const Bank = require('../models/Bank');

// @desc    Get all banks
// @route   GET /api/banks
const getBanks = async (req, res) => {
  try {
    const banks = await Bank.find();
    res.json({ success: true, banks });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Add new bank
// @route   POST /api/banks
const addBank = async (req, res) => {
  try {
    const { name, branch, address, contactEmail, contactPhone } = req.body;
    
    const bank = new Bank({
      name,
      branch,
      address,
      contactEmail,
      contactPhone
    });
    
    await bank.save();
    res.status(201).json({ success: true, bank });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update bank
// @route   PUT /api/banks/:id
const updateBank = async (req, res) => {
  try {
    const bank = await Bank.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!bank) return res.status(404).json({ message: 'Bank not found' });
    res.json({ success: true, bank });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete bank
// @route   DELETE /api/banks/:id
const deleteBank = async (req, res) => {
  try {
    const bank = await Bank.findByIdAndDelete(req.params.id);
    if (!bank) return res.status(404).json({ message: 'Bank not found' });
    res.json({ success: true, message: 'Bank removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getBanks,
  addBank,
  updateBank,
  deleteBank
};
