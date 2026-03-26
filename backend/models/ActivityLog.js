const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: true
  },
  action: {
    type: String,
    enum: [
      'submitted',
      'review_started',
      'approved',
      'rejected',
      'bank_offer_added',
      'bank_offer_accepted',
      'bank_offer_rejected',
      'completed',
      'note_added'
    ],
    required: true
  },
  oldStatus: String,
  newStatus: String,
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  performedByRole: {
    type: String,
    enum: ['citizen', 'municipality_officer', 'bank_officer', 'admin']
  },
  notes: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Create index for faster queries
activityLogSchema.index({ applicationId: 1, timestamp: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
