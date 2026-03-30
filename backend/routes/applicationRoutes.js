const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { uploadDocuments } = require('../middleware/uploadMiddleware');
const {
  submitApplication,
  getMyApplications,
  getApplicationById,
  trackApplication,
  getAllApplications,
  updateStatus,
  submitLoanOffer,
  getMyBankOffers,
  getApprovedApplications,
  getMyOffers,        // ✅ NEW: Get all offers submitted by this bank
  acceptOffer
} = require('../controllers/applicationController');

// ============= PUBLIC ROUTES =============
// Anyone can track application by public ID
router.get('/track/:applicationId', trackApplication);

// ============= CITIZEN ROUTES =============
// Citizen submits new application (with file upload)
router.post('/', protect, uploadDocuments, submitApplication);
// Citizen gets their own applications
router.get('/my', protect, getMyApplications);
// Citizen accepts a bank offer
router.put('/:id/accept-offer/:offerId', protect, acceptOffer);

// ============= MUNICIPALITY OFFICER ROUTES (must come BEFORE /:id) =============
// Officer views all applications (with filters)
router.get('/all', protect, authorize('municipality_officer', 'admin'), getAllApplications);

// ============= BANK OFFICER ROUTES (must come BEFORE /:id) =============
// Bank views approved applications ready for offers
router.get('/approved', protect, authorize('bank_officer', 'admin'), getApprovedApplications);
// Bank views their submitted offers history
router.get('/bank/offers', protect, authorize('bank_officer', 'admin'), getMyBankOffers);
// ✅ NEW: Bank views ALL their offers (accepted, rejected, pending) with citizen details
router.get('/my-offers', protect, authorize('bank_officer', 'admin'), getMyOffers);
// Bank submits a loan offer
router.post('/:id/offer', protect, authorize('bank_officer', 'admin'), submitLoanOffer);

// ============= DYNAMIC ROUTES (must come LAST) =============
// Get single application by ID (works for citizen, officer, bank)
router.get('/:id', protect, getApplicationById);
// Update application status (officer only)
router.put('/:id/status', protect, authorize('municipality_officer', 'admin'), updateStatus);

module.exports = router;

