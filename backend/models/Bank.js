const mongoose = require('mongoose');

const bankSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add bank name'],
    unique: true
  },
  branch: String,
  officerName: String,
  officerEmail: String,
  officerPhone: String,
  serviceDistricts: [String],
  interestRateRange: {
    min: {
      type: Number,
      default: 7.5
    },
    max: {
      type: Number,
      default: 12.5
    }
  },
  maxLoanTenure: {
    type: Number,
    default: 30 // years
  },
  processingFee: {
    type: Number,
    default: 10000
  },
  isActive: {
    type: Boolean,
    default: true
  },
  logo: String,
  website: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Bank', bankSchema);
