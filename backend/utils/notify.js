const Notification = require('../models/Notification');

/**
 * Creates a notification in the database and emits it via socket.io
 * 
 * @param {Object} io - Socket.io instance
 * @param {String} userId - The target user's ID
 * @param {Object} data - Notification payload { title, message, type, link }
 */
const sendNotification = async (io, userId, data) => {
  try {
    // 1. Save to Database
    const notification = await Notification.create({
      userId,
      title: data.title,
      message: data.message,
      type: data.type || 'info',
      link: data.link || null
    });

    // 2. Emit real-time event if socket.io is available
    if (io) {
      io.to(userId.toString()).emit('new-notification', notification);
    }

    return notification;
  } catch (error) {
    console.error('Failed to send notification:', error.message);
  }
};

module.exports = { sendNotification };
