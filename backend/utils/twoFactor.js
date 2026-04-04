const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

/**
 * Generate a new TOTP secret for a user
 * @param {string} email - User's email
 * @returns {object} { secret, otpauth_url }
 */
const generateSecret = (email) => {
  const secret = speakeasy.generateSecret({
    name: `HomeBuyerPortal:${email}`,
    issuer: 'Home Buyer Portal'
  });
  return {
    base32: secret.base32,
    otpauth_url: secret.otpauth_url
  };
};

/**
 * Generate a QR code data URL from an otpauth URL
 * @param {string} otpauth_url 
 * @returns {Promise<string>} QR code Data URL
 */
const generateQRCode = async (otpauth_url) => {
  try {
    return await qrcode.toDataURL(otpauth_url);
  } catch (err) {
    console.error('QR Code Generation Error:', err);
    throw new Error('Failed to generate QR code');
  }
};

/**
 * Verify a TOTP token against a secret
 * @param {string} secret - User's base32 secret
 * @param {string} token - The 6-digit token to verify
 * @returns {boolean}
 */
const verifyToken = (secret, token) => {
  return speakeasy.totp.verify({
    secret: secret,
    encoding: 'base32',
    token: token,
    window: 2 // 2 token window (60s) leeway for better time-sync compatibility
  });
};

module.exports = {
  generateSecret,
  generateQRCode,
  verifyToken
};
