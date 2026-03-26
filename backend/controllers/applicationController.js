const Application = require('../models/Application');
const Municipality = require('../models/Municipality');
const Bank = require('../models/Bank');

// @desc    Submit new application (Citizen)
// @route   POST /api/applications
const submitApplication = async (req, res) => {
  try {
    const {
      personalInfo,
      employment,
      property,
      family,
      subsidyRequested
    } = req.body;

    const application = new Application({
      userId: req.user._id,
      personalInfo,
      employment,
      property,
      family,
      subsidyRequested: subsidyRequested || (property?.cost * 0.1),
      status: 'pending'
    });

    await application.save();

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      applicationId: application.applicationId,
      application
    });
  } catch (error) {
    console.error('Submit error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all applications for current user (Citizen)
// @route   GET /api/applications/my
const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ userId: req.user._id })
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: applications.length,
      applications
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// @desc    Get single application by ID
// @route   GET /api/applications/:id
const getApplicationById = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    // Check permissions
    const isOwner = application.userId.toString() === req.user._id.toString();
    const isMunicipalityOfficer = req.user.role === 'municipality_officer';
    const isBankOfficer = req.user.role === 'bank_officer';
    const isAdmin = req.user.role === 'admin';
    
    // Bank officers can only view approved applications
    if (isBankOfficer && application.status !== 'approved') {
      return res.status(403).json({ 
        message: 'Bank officers can only view approved applications',
        currentStatus: application.status 
      });
    }
    
    // Allow access
    if (isOwner || isMunicipalityOfficer || (isBankOfficer && application.status === 'approved') || isAdmin) {
      return res.json({
        success: true,
        application
      });
    }
    
    return res.status(403).json({ message: 'Not authorized to view this application' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// @desc    Track application by public ID (Public)
// @route   GET /api/applications/track/:applicationId
const trackApplication = async (req, res) => {
  try {
    const application = await Application.findOne({ 
      applicationId: req.params.applicationId 
    });
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    res.json({
      success: true,
      application: {
        applicationId: application.applicationId,
        status: application.status,
        submittedAt: application.submittedAt,
        subsidyRequested: application.subsidyRequested,
        subsidyApproved: application.subsidyApproved,
        property: application.property
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ============= MUNICIPALITY OFFICER ENDPOINTS =============

// @desc    Get all applications (Municipality Officer/Admin)
// @route   GET /api/applications/all
const getAllApplications = async (req, res) => {
  try {
    let query = {};
    
    // If officer, filter by their municipality
    if (req.user.role === 'municipality_officer' && req.user.municipalityId) {
      const municipality = await Municipality.findById(req.user.municipalityId);
      if (municipality) {
        query['property.municipality'] = municipality.name;
      }
    }
    
    const applications = await Application.find(query)
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: applications.length,
      applications
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update application status (Municipality Officer)
// @route   PUT /api/applications/:id/status
const updateStatus = async (req, res) => {
  try {
    const { status, subsidyApproved, rejectionReason, officerNotes } = req.body;
    
    const application = await Application.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    // Update fields
    application.status = status || application.status;
    if (subsidyApproved) application.subsidyApproved = subsidyApproved;
    if (rejectionReason) application.rejectionReason = rejectionReason;
    if (officerNotes) application.officerNotes = officerNotes;
    
    if (status === 'approved') {
      application.approvedAt = Date.now();
    }
    
    if (status === 'completed') {
      application.completedAt = Date.now();
    }
    
    await application.save();
    
    res.json({
      success: true,
      message: `Application ${status}`,
      application
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ============= BANK OFFICER ENDPOINTS =============

// @desc    Submit loan offer for an application (Bank Officer)
// @route   POST /api/applications/:id/offer
const submitLoanOffer = async (req, res) => {
  try {
    const { loanAmount, interestRate, processingFee, tenure, notes } = req.body;
    
    const application = await Application.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    // Only allow offers on approved applications
    if (application.status !== 'approved') {
      return res.status(400).json({ message: 'Offers can only be made on approved applications' });
    }
    
    // Calculate EMI
    const monthlyRate = interestRate / 100 / 12;
    const emi = loanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenure * 12) / 
                (Math.pow(1 + monthlyRate, tenure * 12) - 1);
    
    const offer = {
      bankId: req.user.bankId || req.body.bankId,
      bankName: req.user.bankId ? await Bank.findById(req.user.bankId).then(b => b?.name) : req.body.bankName,
      loanAmount,
      interestRate,
      processingFee,
      tenure,
      emi: Math.round(emi),
      offeredAt: new Date(),
      status: 'offered'
    };
    
    application.bankOffers.push(offer);
    await application.save();
    
    res.json({
      success: true,
      message: 'Loan offer submitted successfully',
      offer
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all offers for my bank (Bank Officer)
// @route   GET /api/applications/bank/offers
const getMyBankOffers = async (req, res) => {
  try {
    const applications = await Application.find({
      'bankOffers.bankId': req.user.bankId
    }).populate('userId', 'name email phone');
    
    const offers = [];
    applications.forEach(app => {
      app.bankOffers.forEach(offer => {
        if (offer.bankId.toString() === req.user.bankId?.toString()) {
          offers.push({
            applicationId: app.applicationId,
            applicantName: app.userId?.name,
            property: app.property,
            offer,
            applicationStatus: app.status
          });
        }
      });
    });
    
    res.json({
      success: true,
      count: offers.length,
      offers
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get approved applications for bank offers
// @route   GET /api/applications/approved
const getApprovedApplications = async (req, res) => {
  try {
    const applications = await Application.find({ 
      status: 'approved' 
    }).populate('userId', 'name email phone');
    
    res.json({
      success: true,
      count: applications.length,
      applications
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Citizen accepts a bank offer
// @route   PUT /api/applications/:id/accept-offer/:offerId
const acceptOffer = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    // Check if user owns this application
    if (application.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const offer = application.bankOffers.id(req.params.offerId);
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }
    
    // Mark all other offers as rejected
    application.bankOffers.forEach(o => {
      if (o._id.toString() !== req.params.offerId) {
        o.status = 'rejected';
      } else {
        o.status = 'accepted';
      }
    });
    
    application.selectedBankId = offer.bankId;
    application.status = 'bank_selected';
    
    await application.save();
    
    res.json({
      success: true,
      message: 'Bank offer accepted successfully',
      selectedBank: offer.bankName,
      loanAmount: offer.loanAmount,
      interestRate: offer.interestRate
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
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
};

