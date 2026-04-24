const Application = require('../models/Application');
const Municipality = require('../models/Municipality');
const Bank = require('../models/Bank');
const User = require('../models/User');
const { sendEmail, getEmailTemplates } = require('../utils/email');
const { sendNotification } = require('../utils/notify');

// @desc    Submit new application (Citizen)
// @route   POST /api/applications
const submitApplication = async (req, res) => {
  console.log('========== FILE UPLOAD DEBUG ==========');
  console.log('req.files:', req.files);
  console.log('req.body keys:', Object.keys(req.body));
  console.log('=======================================');
  
  try {
    const {
      personalInfo,
      employment,
      property,
      family,
      subsidyRequested
    } = req.body;

    // Parse JSON if sent as strings
    const parsedPersonalInfo = typeof personalInfo === 'string' ? JSON.parse(personalInfo) : personalInfo;
    const parsedEmployment = typeof employment === 'string' ? JSON.parse(employment) : employment;
    const parsedProperty = typeof property === 'string' ? JSON.parse(property) : property;
    const parsedFamily = typeof family === 'string' ? JSON.parse(family) : family;

    // Get uploaded file URLs from Cloudinary
    const citizenshipDoc = req.files?.citizenshipDocument ? req.files.citizenshipDocument[0].path : null;
    const incomeProofDoc = req.files?.incomeProofDocument ? req.files.incomeProofDocument[0].path : null;
    const propertyDoc = req.files?.propertyDocument ? req.files.propertyDocument[0].path : null;

    const application = new Application({
      userId: req.user._id,
      personalInfo: parsedPersonalInfo,
      employment: parsedEmployment,
      property: parsedProperty,
      family: parsedFamily,
      subsidyRequested: subsidyRequested || (parsedProperty?.cost * 0.1),
      status: 'pending',
      citizenshipDocument: citizenshipDoc,
      incomeProofDocument: incomeProofDoc,
      propertyDocument: propertyDoc
    });

    await application.save();

    // 🔔 Send notification to citizen
    const io = req.app.get('io');
    sendNotification(io, req.user._id, {
      title: 'Application Submitted ✅',
      message: `Your application #${application.applicationId} has been submitted and is now pending review.`,
      type: 'info',
      link: `/citizen/application/${application._id}`
    });

    // 🔔 Notify all officers & admins about new application
    try {
      const officers = await User.find({ role: { $in: ['municipality_officer', 'admin'] } });
      for (const officer of officers) {
        sendNotification(io, officer._id, {
          title: 'New Application Received 📋',
          message: `${req.user.name || 'A citizen'} submitted application #${application.applicationId}.`,
          type: 'info',
          link: `/officer/application/${application._id}`
        });
      }
    } catch (notifErr) {
      console.error('Officer notification error (non-critical):', notifErr.message);
    }

    // Send email in background
    try {
      const user = await User.findById(req.user._id);
      const template = getEmailTemplates.applicationSubmitted(user.name, application.applicationId);
      sendEmail(user.email, template.subject, template.html)
        .then(() => console.log(`📧 Email sent to ${user.email} - Application Submitted`))
        .catch(err => console.error('Email error:', err.message));
    } catch (emailError) {
      console.error('Email error (non-critical):', emailError.message);
    }

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
    
    // Define permissions
    const isOwner = application.userId.toString() === req.user._id.toString();
    const isMunicipalityOfficer = req.user.role === 'municipality_officer';
    const isBankOfficer = req.user.role === 'bank_officer';
    const isAdmin = req.user.role === 'admin';
    
    // Bank officers can only view approved or bank_selected applications
    if (isBankOfficer && (application.status !== 'approved' && application.status !== 'bank_selected')) {
      return res.status(403).json({ 
        success: false,
        message: 'Bank officers can only view approved or bank selected applications',
        currentStatus: application.status 
      });
    }

    // Check if user is authorized for this specific application
    if (isOwner || isMunicipalityOfficer || isBankOfficer || isAdmin) {
      return res.json({
        success: true,
        application
      });
    }
    
    return res.status(403).json({ success: false, message: 'Not authorized to view this application' });
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

// @desc    Get all applications with advanced filters (Municipality Officer/Admin)
// @route   GET /api/applications/all
// @access  Private (Municipality Officer/Admin)
const getAllApplications = async (req, res) => {
  try {
    console.log('🔍 getAllApplications called...');
    console.log('User:', req.user?.email, 'Role:', req.user?.role);
    console.log('Query params:', req.query);
    
    let query = {};
    
    // ✅ FILTER BY STATUS
    if (req.query.status && req.query.status !== 'all') {
      query.status = req.query.status;
    }
    
    // ✅ FILTER BY DISTRICT
    if (req.query.district && req.query.district !== 'all') {
      query['property.district'] = req.query.district;
    }
    
    // ✅ FILTER BY DATE RANGE
    if (req.query.startDate) {
      query.submittedAt = { ...query.submittedAt, $gte: new Date(req.query.startDate) };
    }
    if (req.query.endDate) {
      query.submittedAt = { ...query.submittedAt, $lte: new Date(req.query.endDate) };
    }
    
    // ✅ SEARCH BY APPLICATION ID OR APPLICANT NAME/EMAIL
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [
        { applicationId: searchRegex },
        { 'personalInfo.fullName': searchRegex },
        { 'personalInfo.email': searchRegex },
        { 'personalInfo.citizenshipNumber': searchRegex }
      ];
    }
    
    // If officer, filter by their municipality
    if (req.user.role === 'municipality_officer' && req.user.municipalityId) {
      const municipality = await Municipality.findById(req.user.municipalityId);
      if (municipality) {
        query['property.municipality'] = municipality.name;
      }
    }
    
    // ✅ PAGINATION
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // ✅ SORTING
    let sort = { createdAt: -1 }; // Default: newest first
    if (req.query.sortBy) {
      switch (req.query.sortBy) {
        case 'date_asc':
          sort = { createdAt: 1 };
          break;
        case 'date_desc':
          sort = { createdAt: -1 };
          break;
        case 'cost_asc':
          sort = { 'property.cost': 1 };
          break;
        case 'cost_desc':
          sort = { 'property.cost': -1 };
          break;
        case 'status':
          sort = { status: 1 };
          break;
        default:
          sort = { createdAt: -1 };
      }
    }
    
    // Execute query with pagination
    const applications = await Application.find(query)
      .populate('userId', 'name email phone')
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const total = await Application.countDocuments(query);
    
    // ✅ Get unique districts for filter dropdown
    const districts = await Application.distinct('property.district');
    
    console.log(`✅ Found ${applications.length} applications (Total: ${total})`);
    
    res.json({
      success: true,
      count: applications.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      applications,
      filters: {
        districts: districts.filter(d => d)
      }
    });
  } catch (error) {
    console.error('❌ getAllApplications Error:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

// @desc    Update application status (Municipality Officer)
// @route   PUT /api/applications/:id/status
const updateStatus = async (req, res) => {
  try {
    const { status, subsidyApproved, rejectionReason, officerNotes } = req.body;
    
    const application = await Application.findById(req.params.id).populate('userId');
    
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
    
    console.log(`✅ Application ${application.applicationId} status updated to ${status}`);
    
    // Real-time notification to citizen
    const io = req.app.get('io');
    sendNotification(io, application.userId._id || application.userId, {
      title: `Application ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: `Your application #${application.applicationId} has been ${status}.`,
      type: status === 'approved' ? 'success' : (status === 'rejected' ? 'error' : 'info'),
      link: `/citizen/application/${application._id}`
    });

    // 🔔 Notify bank officers when application is approved
    if (status === 'approved') {
      try {
        const bankOfficers = await User.find({ role: 'bank_officer' });
        for (const banker of bankOfficers) {
          sendNotification(io, banker._id, {
            title: 'New Approved Application 🏦',
            message: `Application #${application.applicationId} has been approved. Submit your loan offer now!`,
            type: 'success',
            link: `/bank/application/${application._id}`
          });
        }
      } catch (notifErr) {
        console.error('Bank notification error (non-critical):', notifErr.message);
      }
    }

    // Send email in background
    try {
      const user = application.userId;
      if (status === 'approved') {
        const template = getEmailTemplates.applicationApproved(user.name, application.applicationId, subsidyApproved);
        sendEmail(user.email, template.subject, template.html)
          .then(() => console.log(`📧 Email sent to ${user.email} - Application Approved`))
          .catch(err => console.error('Email error:', err.message));
      } else if (status === 'rejected') {
        const template = getEmailTemplates.applicationRejected(user.name, application.applicationId, rejectionReason);
        sendEmail(user.email, template.subject, template.html)
          .then(() => console.log(`📧 Email sent to ${user.email} - Application Rejected`))
          .catch(err => console.error('Email error:', err.message));
      }
    } catch (emailError) {
      console.error('Email error (non-critical):', emailError.message);
    }
    
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
    const { loanAmount, interestRate, processingFee, tenure } = req.body;
    
    const application = await Application.findById(req.params.id).populate('userId');
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    // Only allow offers on approved applications
    if (application.status !== 'approved') {
      return res.status(400).json({ message: 'Offers can only be made on approved applications' });
    }
    
    // Calculate EMI
    const monthlyRate = interestRate / 100 / 12;
    const months = tenure * 12;
    let emi = 0;
    
    if (loanAmount > 0 && interestRate > 0) {
      emi = loanAmount * monthlyRate * Math.pow(1 + monthlyRate, months) / 
            (Math.pow(1 + monthlyRate, months) - 1);
    }
    
    // Use bankName from user profile
    let bankName = req.user.bankName || req.user.name || 'Bank Offer';
    
    const offer = {
      bankId: req.user.bankId || null,
      bankName: bankName,
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
    
    console.log(`✅ Bank offer submitted for ${application.applicationId} by ${bankName}`);

    // Real-time notification
    const io = req.app.get('io');
    sendNotification(io, application.userId._id || application.userId, {
      title: `New Bank Offer`,
      message: `${bankName} has offered you a loan of NPR ${loanAmount.toLocaleString()}`,
      type: 'success',
      link: `/citizen/application/${application._id}`
    });
    
    // Send email in background
    try {
      const user = application.userId;
      const template = getEmailTemplates.bankOfferReceived(
        user.name, 
        application.applicationId, 
        bankName, 
        loanAmount, 
        interestRate, 
        Math.round(emi)
      );
      sendEmail(user.email, template.subject, template.html)
        .then(() => console.log(`📧 Email sent to ${user.email} - Bank Offer Received`))
        .catch(err => console.error('Email error:', err.message));
    } catch (emailError) {
      console.error('Email error (non-critical):', emailError.message);
    }
    
    res.json({
      success: true,
      message: 'Loan offer submitted successfully',
      offer
    });
  } catch (error) {
    console.error('Submit loan offer error:', error);
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
        if (offer.bankId?.toString() === req.user.bankId?.toString()) {
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



// @desc    Get applications for bank offers (approved AND bank_selected)
// @route   GET /api/applications/approved
// @access  Private (Bank Officer)
const getApprovedApplications = async (req, res) => {
  try {
    // Logic: 
    // 1. Must be 'approved' status.
    // 2. To fulfill "when one bank offer then in another bank the user submited form disapper":
    //    Show only if bankOffers is empty OR if this specific bank has already made an offer (so they can see their offer).
    //    Wait, if they already made an offer, it should be in "My Offers". 
    //    So "Approved" list should only show applications with ZERO offers.
    
    const applications = await Application.find({ 
      status: 'approved',
      bankOffers: { $size: 0 }
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



// ✅ Get all offers submitted by this bank (including accepted/rejected)
// @route   GET /api/applications/my-offers
// @access  Private (Bank Officer)
const getMyOffers = async (req, res) => {
  try {
    // Find all applications where this bank submitted an offer
    const applications = await Application.find({
      'bankOffers.bankId': req.user.bankId
    }).populate('userId', 'name email phone');
    
    // Format the response with offer details
    const myOffers = [];
    applications.forEach(app => {
      const myOffer = app.bankOffers.find(offer => 
        offer.bankId?.toString() === req.user.bankId?.toString()
      );
      
      if (myOffer) {
        myOffers.push({
          applicationId: app.applicationId,
          applicantName: app.userId?.name,
          applicantEmail: app.userId?.email,
          applicantPhone: app.userId?.phone,
          propertyCost: app.property?.cost,
          subsidyApproved: app.subsidyApproved,
          offerDetails: myOffer,
          applicationStatus: app.status,
          selectedBank: app.selectedBankId?.toString() === req.user.bankId?.toString()
        });
      }
    });
    
    res.json({
      success: true,
      count: myOffers.length,
      offers: myOffers
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
    console.log('=== ACCEPT OFFER DEBUG ===');
    console.log('User ID from token:', req.user._id.toString());
    console.log('User Role:', req.user.role);
    console.log('Application ID:', req.params.id);
    console.log('Offer ID:', req.params.offerId);
    
    const application = await Application.findById(req.params.id).populate('userId');
    
    if (!application) {
      console.log('❌ Application not found');
      return res.status(404).json({ message: 'Application not found' });
    }
    
    console.log('Application Owner ID:', application.userId._id.toString());
    console.log('Do IDs match?', application.userId._id.toString() === req.user._id.toString());
    
    // Check if user owns this application
    if (application.userId._id.toString() !== req.user._id.toString()) {
      console.log('❌ Authorization failed');
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const offer = application.bankOffers.id(req.params.offerId);
    if (!offer) {
      console.log('❌ Offer not found');
      return res.status(404).json({ message: 'Offer not found' });
    }
    
    console.log('✅ Offer found:', offer.bankName, 'Amount:', offer.loanAmount);
    console.log('Offer status:', offer.status);
    
    // Check if offer is still available
    if (offer.status !== 'offered') {
      console.log('❌ Offer not available. Status:', offer.status);
      return res.status(400).json({ 
        message: `This offer is no longer available. Status: ${offer.status}` 
      });
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
    
    console.log('✅ Offer accepted successfully!');
    
    // Send email in background
    try {
      const user = application.userId;
      const template = getEmailTemplates.offerAccepted(
        user.name, 
        application.applicationId, 
        offer.bankName, 
        offer.loanAmount, 
        offer.interestRate
      );
      sendEmail(user.email, template.subject, template.html)
        .then(() => console.log(`📧 Email sent to ${user.email} - Offer Accepted`))
        .catch(err => console.error('Email error:', err.message));
    } catch (emailError) {
      console.error('Email error (non-critical):', emailError.message);
    }
    
    res.json({
      success: true,
      message: 'Bank offer accepted successfully',
      selectedBank: offer.bankName,
      loanAmount: offer.loanAmount,
      interestRate: offer.interestRate
    });
  } catch (error) {
    console.error('❌ Accept offer error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ============= SUPER ADMIN EXCLUSIVE ENDPOINTS =============

// @desc    Admin: Update ANY application field (Absolute Control)
// @route   PUT /api/applications/admin/:id
// @access  Private (Admin Only)
const adminUpdateApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Merge incoming data into application object
    // This allows updating nested fields like personalInfo, property, etc.
    const updates = req.body;
    
    Object.keys(updates).forEach(key => {
      if (typeof updates[key] === 'object' && updates[key] !== null && !Array.isArray(updates[key])) {
        application[key] = { ...application[key], ...updates[key] };
      } else {
        application[key] = updates[key];
      }
    });

    await application.save();

    console.log(`🛡️ Admin Override: Application #${application.applicationId} updated by Super Admin.`);

    res.json({
      success: true,
      message: 'Application dossier updated by Admin Override.',
      application
    });
  } catch (error) {
    console.error('Admin update error:', error);
    res.status(500).json({ message: 'Server error during administrative override', error: error.message });
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
  getMyOffers,
  acceptOffer,
  adminUpdateApplication
};

