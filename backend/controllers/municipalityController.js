const Municipality = require('../models/Municipality');

// @desc    Get all municipalities
// @route   GET /api/municipalities
const getMunicipalities = async (req, res) => {
  try {
    const municipalities = await Municipality.find();
    res.json({ success: true, municipalities });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Add new municipality
// @route   POST /api/municipalities
const addMunicipality = async (req, res) => {
  try {
    const { name, district, state, code } = req.body;
    
    const municipality = new Municipality({
      name,
      district,
      state,
      code
    });
    
    await municipality.save();
    res.status(201).json({ success: true, municipality });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update municipality
// @route   PUT /api/municipalities/:id
const updateMunicipality = async (req, res) => {
  try {
    const municipality = await Municipality.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!municipality) return res.status(404).json({ message: 'Municipality not found' });
    res.json({ success: true, municipality });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete municipality
// @route   DELETE /api/municipalities/:id
const deleteMunicipality = async (req, res) => {
  try {
    const municipality = await Municipality.findByIdAndDelete(req.params.id);
    if (!municipality) return res.status(404).json({ message: 'Municipality not found' });
    res.json({ success: true, message: 'Municipality removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getMunicipalities,
  addMunicipality,
  updateMunicipality,
  deleteMunicipality
};
