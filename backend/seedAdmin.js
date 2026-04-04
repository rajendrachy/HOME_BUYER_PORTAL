const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB...');

    const adminEmail = 'admin@portal.gov.np';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log('Admin account already exists.');
      process.exit(0);
    }

    const admin = new User({
      name: 'System Administrator',
      email: adminEmail,
      password: 'password123',
      phone: '9876543210',
      citizenshipNumber: '00-00-00-0000',
      role: 'admin',
      isActive: true
    });

    await admin.save();
    console.log('✅ Admin account created successfully!');
    console.log('Email: admin@portal.gov.np');
    console.log('Password: password123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
