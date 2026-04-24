const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  applicationId: {
    type: String,
    default: function() {
      const year = new Date().getFullYear();
      const random = Math.floor(Math.random() * 99999).toString().padStart(5, '0');
      return `APP-${year}-${random}`;
    }
  },
  status: {
    type: String,
    enum: ['pending', 'under_review', 'approved', 'rejected', 'bank_selected', 'completed'],
    default: 'pending'
  },
  personalInfo: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  employment: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  property: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  family: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  subsidyRequested: Number,
  subsidyApproved: {
    type: Number,
    default: 0
  },
  rejectionReason: String,
  officerNotes: String,
  bankNotes: String,
  
  // ✅ DOCUMENT UPLOAD FIELDS (ADD THESE)
  citizenshipDocument: {
    type: String,
    default: null
  },
  incomeProofDocument: {
    type: String,
    default: null
  },
  propertyDocument: {
    type: String,
    default: null
  },
  
  // Bank Offers
  bankOffers: [{
    bankId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bank'
    },
    bankName: String,
    loanAmount: Number,
    interestRate: Number,
    processingFee: Number,
    tenure: Number,
    emi: Number,
    status: {
      type: String,
      enum: ['offered', 'accepted', 'rejected'],
      default: 'offered'
    },
    message: String,
    offeredAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  selectedBankId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bank'
  },
  
  submittedAt: {
    type: Date,
    default: Date.now
  },
  approvedAt: Date,
  completedAt: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('Application', applicationSchema);