const nodemailer = require('nodemailer');

const PLACEHOLDER_PATTERN = /your-|xxx|placeholder|example\.com|app-password/i;

const isSmtpConfigured = () => {
  if (process.env.NODE_ENV === 'development' && process.env.SMTP_ENABLED !== 'true') {
    return false;
  }
  const { SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_USER || !SMTP_PASS) return false;
  if (PLACEHOLDER_PATTERN.test(SMTP_USER) || PLACEHOLDER_PATTERN.test(SMTP_PASS)) {
    return false;
  }
  return true;
};

const createTransporter = () =>
  nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

const sendEmail = async ({ to, subject, html }) => {
  if (!isSmtpConfigured()) {
    console.log(`[DEV EMAIL] To: ${to} | Subject: ${subject}`);
    return { messageId: 'dev-mode' };
  }

  try {
    const transporter = createTransporter();
    return await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });
  } catch (err) {
    console.warn(`[EMAIL FAILED] ${err.message}`);
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEV EMAIL FALLBACK] To: ${to} | Subject: ${subject}`);
      return { messageId: 'dev-fallback' };
    }
    throw err;
  }
};

const sendOTPEmail = async (email, otp, purpose = 'verification') => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[DEV OTP] ${email} => ${otp} (${purpose})`);
  }

  const subject =
    purpose === 'reset'
      ? 'NannyConnect - Password Reset OTP'
      : 'NannyConnect - Email Verification OTP';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #2563EB;">NannyConnect</h2>
      <p>Your OTP for ${purpose === 'reset' ? 'password reset' : 'email verification'} is:</p>
      <h1 style="color: #2563EB; letter-spacing: 8px;">${otp}</h1>
      <p>This OTP expires in 10 minutes.</p>
      <p style="color: #666; font-size: 12px;">If you didn't request this, please ignore this email.</p>
    </div>
  `;

  return sendEmail({ to: email, subject, html });
};

module.exports = { sendEmail, sendOTPEmail };
