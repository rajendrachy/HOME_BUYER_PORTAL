const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { 
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
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Validation rules for registration
const registerValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please add a valid email'),
  body('phone').isLength({ min: 10, max: 10 }).withMessage('Phone must be 10 digits'),
  body('citizenshipNumber').notEmpty().withMessage('Citizenship number is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

// @route   POST /api/auth/register
router.post('/register', registerValidation, registerUser);

// @route   POST /api/auth/login
router.post('/login', loginUser);

// @route   POST /api/auth/2fa/login
router.post('/2fa/login', login2FA);

// @route   POST /api/auth/2fa/recover
router.post('/2fa/recover', recover2FA);

// @route   GET /api/auth/me
router.get('/me', protect, getMe);

// @route   PUT /api/auth/profile
router.put('/profile', protect, updateProfile);

// @route   POST /api/auth/profile-image
const { upload } = require('../middleware/uploadMiddleware');
router.post('/profile-image', protect, upload.single('profileImage'), async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    if (req.file && req.file.path) {
      user.profileImage = req.file.path;
      await user.save();
      return res.json({ success: true, profileImage: user.profileImage });
    }
    res.status(400).json({ message: 'No file uploaded' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// 🔐 2FA Routes
router.post('/2fa/setup', protect, setup2FA);
router.post('/2fa/verify', protect, verify2FA);
router.post('/2fa/disable', protect, disable2FA);

// 🛠️ Admin User Management Routes
router.get('/users', protect, authorize('admin'), adminGetAllUsers);
router.put('/users/:id', protect, authorize('admin'), adminUpdateUser);
router.delete('/users/:id', protect, authorize('admin'), adminDeleteUser);

module.exports = router;
