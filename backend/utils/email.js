const nodemailer = require('nodemailer');

// Create transporter for Brevo (Sendinblue)
const createTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false, // TLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      ciphers: 'SSLv3',
      rejectUnauthorized: false
    },
    // Timeout settings to prevent connection issues on Render
    connectionTimeout: 60000,  // 60 seconds
    greetingTimeout: 60000,    // 60 seconds
    socketTimeout: 60000       // 60 seconds
  });
};

// Send email function (non-blocking)
const sendEmail = async (to, subject, html, from = null) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: from || `"Home Buyer Portal" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email error:', error.message);
    return { success: false, error: error.message };
  }
};

// Email Templates
const getEmailTemplates = {
  // Application Submitted
  applicationSubmitted: (name, applicationId) => ({
    subject: 'Application Submitted Successfully',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #2563eb, #1e40af); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">🏠 Home Buyer Portal</h1>
          <p style="color: #bfdbfe; margin: 5px 0 0;">Government of Nepal</p>
        </div>
        <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
          <h2>Hello ${name},</h2>
          <p>Your application has been <strong style="color: #2563eb;">submitted successfully</strong>!</p>
          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 5px;"><strong>Application ID:</strong> ${applicationId}</p>
            <p style="margin: 0;"><strong>Status:</strong> <span style="color: #eab308;">PENDING</span></p>
          </div>
          <p>You can track your application status using the link below:</p>
          <a href="https://home-buyer-portal.vercel.app/track" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Track Application</a>
          <p style="margin-top: 20px; color: #6b7280; font-size: 12px;">Thank you for using Home Buyer Portal.<br>Government of Nepal</p>
        </div>
      </div>
    `
  }),
  
  // Application Approved
  applicationApproved: (name, applicationId, subsidyAmount) => ({
    subject: 'Application Approved - Subsidy Granted',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #16a34a, #15803d); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">✅ Application Approved</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
          <h2>Congratulations ${name}!</h2>
          <p>Your application <strong>${applicationId}</strong> has been <strong style="color: #16a34a;">APPROVED</strong>!</p>
          <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a;">
            <p style="margin: 0 0 5px;"><strong>💰 Subsidy Approved:</strong> NPR ${subsidyAmount?.toLocaleString()}</p>
            <p style="margin: 0;"><strong>📋 Next Step:</strong> Wait for bank offers</p>
          </div>
          <a href="https://home-buyer-portal.vercel.app/login" style="background: #16a34a; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Login to View</a>
        </div>
      </div>
    `
  }),
  
  // Bank Offer Received
  bankOfferReceived: (name, applicationId, bankName, loanAmount, interestRate, emi) => ({
    subject: 'New Bank Offer Received',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #8b5cf6, #6d28d9); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">🏦 New Bank Offer</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
          <h2>Hello ${name},</h2>
          <p>You have received a new loan offer for application <strong>${applicationId}</strong>!</p>
          <div style="background: #f5f3ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 5px;"><strong>🏦 Bank:</strong> ${bankName}</p>
            <p style="margin: 0 0 5px;"><strong>💰 Loan Amount:</strong> NPR ${loanAmount?.toLocaleString()}</p>
            <p style="margin: 0 0 5px;"><strong>📈 Interest Rate:</strong> ${interestRate}%</p>
            <p style="margin: 0;"><strong>📅 Monthly EMI:</strong> NPR ${emi?.toLocaleString()}</p>
          </div>
          <a href="https://home-buyer-portal.vercel.app/login" style="background: #8b5cf6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View & Accept Offer</a>
        </div>
      </div>
    `
  }),
  
  // Offer Accepted
  offerAccepted: (name, applicationId, bankName, loanAmount, interestRate) => ({
    subject: 'Bank Offer Accepted - Application Complete',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #16a34a, #15803d); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">🎉 Offer Accepted!</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
          <h2>Congratulations ${name}!</h2>
          <p>You have successfully accepted the loan offer from <strong>${bankName}</strong>!</p>
          <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 5px;"><strong>💰 Loan Amount:</strong> NPR ${loanAmount?.toLocaleString()}</p>
            <p style="margin: 0 0 5px;"><strong>📈 Interest Rate:</strong> ${interestRate}%</p>
            <p style="margin: 0;"><strong>✅ Status:</strong> BANK SELECTED</p>
          </div>
          <p>Please visit the bank to complete the loan process.</p>
          <a href="https://home-buyer-portal.vercel.app/login" style="background: #16a34a; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Details</a>
        </div>
      </div>
    `
  }),
  
  // Application Rejected
  applicationRejected: (name, applicationId, reason) => ({
    subject: 'Application Status Update',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Application Update</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
          <h2>Hello ${name},</h2>
          <p>Your application <strong>${applicationId}</strong> has been <strong style="color: #dc2626;">REJECTED</strong>.</p>
          <div style="background: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Reason:</strong> ${reason || 'Did not meet eligibility criteria'}</p>
          </div>
          <p>You can contact your municipality office for more information.</p>
        </div>
      </div>
    `
  })
};

module.exports = { sendEmail, getEmailTemplates };
