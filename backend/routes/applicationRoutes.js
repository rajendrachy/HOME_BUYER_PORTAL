const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
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
  acceptOffer
} = require('../controllers/applicationController');

// ============= PUBLIC ROUTES =============
router.get('/track/:applicationId', trackApplication);

// ============= CITIZEN ROUTES =============
router.post('/', protect, submitApplication);
router.get('/my', protect, getMyApplications);
router.put('/:id/accept-offer/:offerId', protect, acceptOffer);

// ============= MUNICIPALITY OFFICER ROUTES (must come BEFORE /:id) =============
router.get('/all', protect, authorize('municipality_officer', 'admin'), getAllApplications);

// ============= BANK OFFICER ROUTES (must come BEFORE /:id) =============
router.get('/approved', protect, authorize('bank_officer', 'admin'), getApprovedApplications);
router.get('/bank/offers', protect, authorize('bank_officer', 'admin'), getMyBankOffers);
router.post('/:id/offer', protect, authorize('bank_officer', 'admin'), submitLoanOffer);

// ============= DYNAMIC ROUTES (must come LAST) =============
router.get('/:id', protect, getApplicationById);
router.put('/:id/status', protect, authorize('municipality_officer', 'admin'), updateStatus);

module.exports = router;
