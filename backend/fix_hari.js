const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const fixUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const recoveryCodes = ['HARI1234', 'RECO5678', 'SAFE9012'];
    
    const user = await User.findOneAndUpdate(
      { email: 'hari@gmail.com' },
      { 
        $set: { 
          twoFactorRecoveryCodes: recoveryCodes,
          isTwoFactorEnabled: true 
        } 
      },
      { new: true }
    );

    if (!user) {
      console.log('User not found');
    } else {
      console.log('User fixed. Temporary recovery codes added:', recoveryCodes);
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
};

fixUser();
