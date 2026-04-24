const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Models
const Application = require('../models/Application');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');
const Bank = require('../models/Bank');
const Municipality = require('../models/Municipality');

dotenv.config({ path: path.join(__dirname, '../.env') });

const clearData = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected');

    console.log('🗑️  Clearing Application data...');
    const appRes = await Application.deleteMany({});
    console.log(`Deleted ${appRes.deletedCount} applications.`);

    console.log('🗑️  Clearing Notification data...');
    const notifRes = await Notification.deleteMany({});
    console.log(`Deleted ${notifRes.deletedCount} notifications.`);

    console.log('🗑️  Clearing Activity Logs...');
    const logRes = await ActivityLog.deleteMany({});
    console.log(`Deleted ${logRes.deletedCount} activity logs.`);

    console.log('🗑️  Clearing Bank institutions...');
    const bankRes = await Bank.deleteMany({});
    console.log(`Deleted ${bankRes.deletedCount} banks.`);

    console.log('🗑️  Clearing Municipality jurisdictions...');
    const muniRes = await Municipality.deleteMany({});
    console.log(`Deleted ${muniRes.deletedCount} municipalities.`);

    console.log('\n✨ Database cleared successfully (User accounts preserved).');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing data:', error);
    process.exit(1);
  }
};

clearData();
