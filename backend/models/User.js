const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please add a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Please add a phone number'],
    match: [/^[0-9]{10}$/, 'Please add a valid 10-digit phone number']
  },
  citizenshipNumber: {
    type: String,
    required: [true, 'Please add citizenship number'],
    unique: true
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6
  },
  role: {
    type: String,
    enum: ['citizen', 'municipality_officer', 'bank_officer', 'admin'],
    default: 'citizen'
  },
  municipalityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Municipality'
  },
  bankId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bank'
  },
  // ✅ ADD THIS - Bank name for bank officers
  bankName: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  address: {
    street: String,
    ward: Number,
    municipality: String,
    district: String
  },
  profileImage: {
    type: String,
    default: ''
  },
  twoFactorSecret: {
    type: String,
    select: false
  },
   tempTwoFactorSecret: {
    type: String,
    select: false
  },
  isTwoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorRecoveryCodes: {
    type: [String],
    select: false
  }
}, {
  timestamps: true
});

// Encrypt password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

