const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Bank = require('./models/Bank');
const Municipality = require('./models/Municipality');
const Application = require('./models/Application');
const Notification = require('./models/Notification');
const ActivityLog = require('./models/ActivityLog');

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // 1. Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Bank.deleteMany({});
    await Municipality.deleteMany({});
    await Application.deleteMany({});
    await Notification.deleteMany({});
    await ActivityLog.deleteMany({});
    console.log('Data cleared.');

    // 2. Create a Municipality
    const municipality = await Municipality.create({
      name: 'Kathmandu Metropolitan City',
      district: 'Kathmandu',
      province: 'Bagmati',
      totalSubsidyBudget: 100000000,
      budgetRemaining: 100000000,
      contactEmail: 'contact@kmc.gov.np',
      address: 'Bagdurbar, Kathmandu'
    });
    console.log('Municipality created:', municipality.name);

    // 3. Create a Bank
    const bank = await Bank.create({
      name: 'Nepal Investment Mega Bank',
      branch: 'Durbar Marg',
      serviceDistricts: ['Kathmandu', 'Lalitpur', 'Bhaktapur'],
      interestRateRange: { min: 8.5, max: 11.5 }
    });
    console.log('Bank created:', bank.name);

    // 4. Create Users
    const salt = await bcrypt.genSalt(10);
    const commonPassword = 'password123';

    const users = [
      {
        name: 'Super Admin',
        email: 'admin@portal.gov.np',
        password: commonPassword,
        phone: '9800000000',
        citizenshipNumber: '00-00-00-00000',
        role: 'admin'
      },
      {
        name: 'Municipality Officer',
        email: 'officer@kmc.gov.np',
        password: commonPassword,
        phone: '9811111111',
        citizenshipNumber: '11-11-11-11111',
        role: 'municipality_officer',
        municipalityId: municipality._id
      },
      {
        name: 'Bank Manager',
        email: 'manager@nimb.com.np',
        password: commonPassword,
        phone: '9822222222',
        citizenshipNumber: '22-22-22-22222',
        role: 'bank_officer',
        bankId: bank._id,
        bankName: bank.name
      },
      {
        name: 'Hari Bahadur',
        email: 'hari@gmail.com',
        password: commonPassword,
        phone: '9841000000',
        citizenshipNumber: '12-34-56-78901',
        role: 'citizen'
      }
    ];

    // We use User.create so the password hashing pre-save hook runs
    await User.create(users);
    console.log('Users created successfully.');

    await mongoose.disconnect();
    console.log('Seeding completed.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
