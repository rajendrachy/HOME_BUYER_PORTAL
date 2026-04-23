const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const checkUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const user = await User.findOne({ email: 'hari@gmail.com' }).select('+twoFactorSecret +twoFactorRecoveryCodes');
    if (!user) {
      console.log('User not found');
    } else {
      console.log('User found:', {
        name: user.name,
        email: user.email,
        isTwoFactorEnabled: user.isTwoFactorEnabled,
        hasSecret: !!user.twoFactorSecret,
        recoveryCodesCount: user.twoFactorRecoveryCodes?.length || 0,
        recoveryCodes: user.twoFactorRecoveryCodes
      });
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
};

checkUser();
