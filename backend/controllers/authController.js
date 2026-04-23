const User = require('../models/User');
const Bank = require('../models/Bank');  // ✅ Add this import
const Application = require('../models/Application');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { generateSecret, generateQRCode, verifyToken } = require('../utils/twoFactor');
const { sendNotification } = require('../utils/notify');

// Generate Recovery Codes
const generateRecoveryCodes = () => {
  return Array.from({ length: 8 }, () => 
    Math.random().toString(36).substring(2, 10).toUpperCase()
  );
};

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, phone, citizenshipNumber, password, role, municipalityId, bankId } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ 
      $or: [{ email }, { citizenshipNumber }] 
    });
    
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email or citizenship number' });
    }

    // ✅ NEW: If bank officer, get bank name
    let bankName = null;
    if (role === 'bank_officer' && bankId) {
      const bank = await Bank.findById(bankId);
      if (!bank) {
        return res.status(400).json({ message: 'Invalid bank selected' });
      }
      bankName = bank.name;
    }

    // Create user
    const user = await User.create({
      name,
      email,
      phone,
      citizenshipNumber,
      password,
      role: role || 'citizen',
      municipalityId: municipalityId || null,
      bankId: bankId || null,
      bankName: bankName  // ✅ Save bank name
    });

    // 🔔 Send welcome notification
    try {
      sendNotification(null, user._id, {
        title: 'Welcome to Home Buyer Portal! 🏠',
        message: `Hi ${user.name}, your account has been created successfully. You can now submit applications for housing subsidies.`,
        type: 'success',
        link: '/citizen/dashboard'
      });
    } catch (notifErr) {
      console.error('Welcome notification error (non-critical):', notifErr.message);
    }

    // Return user data with token
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      citizenshipNumber: user.citizenshipNumber,
      role: user.role,
      bankName: user.bankName,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email }).select('+password +twoFactorSecret');
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isPasswordMatch = await user.matchPassword(password);
    
    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated. Please contact admin.' });
    }

    // Check if 2FA is enabled
    if (user.isTwoFactorEnabled) {
      return res.json({
        requires2FA: true,
        userId: user._id,
        message: 'Two-factor authentication required'
      });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      citizenshipNumber: user.citizenshipNumber,
      role: user.role,
      bankName: user.bankName,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('municipalityId', 'name district')
      .populate('bankId', 'name branch');
    
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields
    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    user.email = req.body.email || user.email;
    
    if (req.body.address) {
      user.address = req.body.address;
    }

    // Update password if provided
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      role: updatedUser.role,
      bankName: updatedUser.bankName,
      profileImage: updatedUser.profileImage,
      token: generateToken(updatedUser._id)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Setup 2FA (step 1: generate secret)
// @route   POST /api/auth/2fa/setup
// @access  Private
const setup2FA = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { base32, otpauth_url } = generateSecret(user.email);
    
    // Save to temp secret
    user.tempTwoFactorSecret = base32;
    await user.save();
    
    const qrCode = await generateQRCode(otpauth_url);
    
    res.json({
      success: true,
      qrCode,
      secret: base32
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to setup 2FA', error: error.message });
  }
};

// @desc    Verify 2FA (step 2: confirm token)
// @route   POST /api/auth/2fa/verify
// @access  Private
const verify2FA = async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findById(req.user._id).select('+tempTwoFactorSecret');
    
    if (!user.tempTwoFactorSecret) {
      return res.status(400).json({ message: '2FA setup not initiated' });
    }
    
    const isValid = verifyToken(user.tempTwoFactorSecret, token);
    
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid authentication token. Please ensure your phone time is correct.' });
    }
    
    // Generate recovery codes
    const recoveryCodes = generateRecoveryCodes();
    
    // Promote temp secret to permanent
    user.twoFactorSecret = user.tempTwoFactorSecret;
    user.tempTwoFactorSecret = null;
    user.isTwoFactorEnabled = true;
    user.twoFactorRecoveryCodes = recoveryCodes;
    await user.save();
    
    res.json({ 
      success: true, 
      message: 'Two-factor authentication enabled successfully',
      recoveryCodes 
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to verify 2FA', error: error.message });
  }
};

// @desc    Verify 2FA for Login
// @route   POST /api/auth/2fa/login
// @access  Public
const login2FA = async (req, res) => {
  try {
    const { userId, token } = req.body;
    const user = await User.findById(userId).select('+twoFactorSecret +twoFactorRecoveryCodes');
    
    if (!user || !user.isTwoFactorEnabled) {
      return res.status(401).json({ message: 'Authentication failed' });
    }
    
    let isValid = verifyToken(user.twoFactorSecret, token);
    let usedRecoveryCode = false;

    // If not valid TOTP, check if it's a recovery code
    if (!isValid && user.twoFactorRecoveryCodes?.includes(token.toUpperCase())) {
      isValid = true;
      usedRecoveryCode = true;
      // Remove used recovery code
      user.twoFactorRecoveryCodes = user.twoFactorRecoveryCodes.filter(c => c !== token.toUpperCase());
      await user.save();
    }
    
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid authentication token or recovery code' });
    }
    
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      citizenshipNumber: user.citizenshipNumber,
      role: user.role,
      bankName: user.bankName,
      token: generateToken(user._id),
      recoveryUsed: usedRecoveryCode
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Recover account (Disable 2FA using recovery code)
// @route   POST /api/auth/2fa/recover
// @access  Public
const recover2FA = async (req, res) => {
  try {
    const { email, recoveryCode } = req.body;
    const user = await User.findOne({ email }).select('+twoFactorRecoveryCodes +twoFactorSecret');
    
    if (!user || !user.isTwoFactorEnabled) {
      return res.status(404).json({ message: 'Account not found or 2FA not enabled' });
    }
    
    if (!user.twoFactorRecoveryCodes?.includes(recoveryCode.toUpperCase())) {
      return res.status(401).json({ message: 'Invalid recovery code' });
    }
    
    // Disable 2FA
    user.isTwoFactorEnabled = false;
    user.twoFactorSecret = null;
    user.twoFactorRecoveryCodes = [];
    await user.save();
    
    res.json({ success: true, message: 'Identity protection layer deactivated. You can now login with your password.' });
  } catch (error) {
    res.status(500).json({ message: 'Recovery failed', error: error.message });
  }
};

// @desc    Disable 2FA
// @route   POST /api/auth/2fa/disable
// @access  Private
const disable2FA = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.isTwoFactorEnabled = false;
    user.twoFactorSecret = null;
    await user.save();
    res.json({ success: true, message: 'Two-factor authentication disabled' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to disable 2FA', error: error.message });
  }
};

// @desc    Admin: Get all users
// @route   GET /api/auth/users
// @access  Private/Admin
const adminGetAllUsers = async (req, res) => {
  try {
    const { search, role, status } = req.query;
    let query = {};

    // Filter by search (name, email, citizenship)
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { citizenshipNumber: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by role
    if (role && role !== 'all') {
      query.role = role;
    }

    // Filter by status (active/inactive)
    if (status && status !== 'all') {
      query.isActive = status === 'active';
    }

    const users = await User.find(query)
      .select('-password -twoFactorSecret -tempTwoFactorSecret')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
};

// @desc    Admin: Update user (status, role, etc)
// @route   PUT /api/auth/users/:id
// @access  Private/Admin
const adminUpdateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields
    if (req.body.name) user.name = req.body.name;
    if (req.body.email) user.email = req.body.email;
    if (req.body.role) user.role = req.body.role;
    if (req.body.isActive !== undefined) user.isActive = req.body.isActive;
    if (req.body.bankName !== undefined) user.bankName = req.body.bankName;
    if (req.body.bankId !== undefined) user.bankId = req.body.bankId;
    if (req.body.municipalityId !== undefined) user.municipalityId = req.body.municipalityId;
    
    const updatedUser = await user.save();

    res.json({
      success: true,
      message: 'User updated successfully',
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        isActive: updatedUser.isActive
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update user', error: error.message });
  }
};

// @desc    Admin: Delete user
// @route   DELETE /api/auth/users/:id
// @access  Private/Admin
const adminDeleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Administrators cannot delete themselves' });
    }

    // Delete associated applications if citizen
    if (user.role === 'citizen') {
      await Application.deleteMany({ applicant: user._id });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete user', error: error.message });
  }
};

module.exports = { 
  registerUser, 
  loginUser, 
  getMe, 
  updateProfile,
  setup2FA,
  verify2FA,
  login2FA,
  disable2FA,
  recover2FA,
  adminGetAllUsers,
  adminUpdateUser,
  adminDeleteUser
};
