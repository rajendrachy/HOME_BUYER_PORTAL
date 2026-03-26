const User = require('./User');
const Application = require('./Application');
const Municipality = require('./Municipality');
const Bank = require('./Bank');
const ActivityLog = require('./ActivityLog');

// Create indexes for better performance
const createIndexes = async () => {
  try {
    await User.createIndexes();
    await Application.createIndexes();
    await Municipality.createIndexes();
    await Bank.createIndexes();
    await ActivityLog.createIndexes();
    console.log('✅ All database indexes created');
  } catch (error) {
    console.error('Error creating indexes:', error);
  }
};

module.exports = {
  User,
  Application,
  Municipality,
  Bank,
  ActivityLog,
  createIndexes
};