const mongoose = require('mongoose');

const municipalitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add municipality name']
  },
  district: {
    type: String,
    required: [true, 'Please add district']
  },
  province: {
    type: String,
    enum: ['Province 1', 'Madhesh', 'Bagmati', 'Gandaki', 'Lumbini', 'Karnali', 'Sudurpashchim']
  },
  wards: [{
    number: Number,
    name: String
  }],
  officers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  totalSubsidyBudget: {
    type: Number,
    default: 50000000 // NPR 5 crore
  },
  budgetRemaining: {
    type: Number,
    default: 50000000
  },
  isActive: {
    type: Boolean,
    default: true
  },
  contactEmail: String,
  contactPhone: String,
  address: String,
  logo: String
}, {
  timestamps: true
});

// Create indexes for better search performance
municipalitySchema.index({ name: 1, district: 1 });

module.exports = mongoose.model('Municipality', municipalitySchema);
