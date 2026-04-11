const formData = require('form-data');
const Mailgun = require('mailgun.js');

// Mailgun sender requested by project requirements.
const MAILGUN_FROM = 'FleetFly <mail@mg.thefleetfly.xyz>';

// OTP values are stored in-memory for a short period.
const OTP_TTL_MS = 10 * 60 * 1000;
const otpStore = new Map();

const mailgunApiKey = process.env.MAILGUN_API_KEY;
const mailgunDomain = process.env.MAILGUN_DOMAIN;

const mailgunClient = mailgunApiKey
  ? new Mailgun(formData).client({ username: 'api', key: mailgunApiKey })
  : null;

const cleanupExpiredOtps = () => {
  const now = Date.now();
  for (const [email, value] of otpStore.entries()) {
    if (value.expiresAt <= now) {
      otpStore.delete(email);
    }
  }
};

const otpCleanupTimer = setInterval(cleanupExpiredOtps, 60 * 1000);
if (otpCleanupTimer.unref) otpCleanupTimer.unref();

const normalizeEmail = (value) => String(value || '').trim().toLowerCase();
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const storeOTP = (email, otp) => {
  otpStore.set(normalizeEmail(email), {
    otp,
    expiresAt: Date.now() + OTP_TTL_MS,
  });
};

const getStoredOTP = (email) => otpStore.get(normalizeEmail(email)) || null;

const sendEmail = async (to, subject, text, html) => {
  if (!to || !subject || (!text && !html)) {
    return {
      success: false,
      error: 'Missing required fields: to, subject, and text or html',
    };
  }

  if (!mailgunApiKey || !mailgunDomain || !mailgunClient) {
    const msg = 'Mailgun is not configured. Set MAILGUN_API_KEY and MAILGUN_DOMAIN';
    console.error('[MAILGUN] Config error:', msg);
    return { success: false, error: msg };
  }

  try {
    const response = await mailgunClient.messages.create(mailgunDomain, {
      from: MAILGUN_FROM,
      to: [to],
      subject,
      text,
      html,
    });

    console.log('[MAILGUN] Send success:', {
      to,
      subject,
      id: response?.id || null,
      message: response?.message || null,
    });

    return {
      success: true,
      data: response,
    };
  } catch (error) {
    const details = {
      message: error?.message || 'Unknown Mailgun error',
      status: error?.status || error?.statusCode || null,
      details: error?.details || error?.response?.body || null,
    };
    console.error('[MAILGUN] Send failed:', details);
    return {
      success: false,
      error: details.message,
      details,
    };
  }
};

const sendOtpEmail = async (to, otp) => {
  const subject = 'Your FleetFly OTP Code';
  const text = `Your FleetFly OTP is ${otp}. It is valid for 10 minutes.`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px;">
      <h2 style="margin: 0 0 16px; color: #1d4ed8;">FleetFly - OTP Verification</h2>
      <p style="margin: 0 0 12px; color: #111827;">Use this one-time password to continue:</p>
      <div style="font-size: 32px; font-weight: 700; letter-spacing: 8px; padding: 12px 16px; background: #eff6ff; border-radius: 8px; text-align: center; color: #1d4ed8;">${otp}</div>
      <p style="margin: 16px 0 8px; color: #374151;">Valid for 10 minutes.</p>
      <p style="margin: 0; color: #6b7280;">Did not request this? Ignore this email.</p>
    </div>
  `;

  return sendEmail(to, subject, text, html);
};

const createAndSendOtp = async (to) => {
  const normalizedTo = normalizeEmail(to);
  const otp = generateOTP();

  storeOTP(normalizedTo, otp);
  const result = await sendOtpEmail(normalizedTo, otp);

  if (!result.success) {
    otpStore.delete(normalizedTo);
    return result;
  }

  return {
    success: true,
    expiresInSeconds: Math.floor(OTP_TTL_MS / 1000),
  };
};

module.exports = {
  sendEmail,
  sendOtpEmail,
  createAndSendOtp,
  generateOTP,
  storeOTP,
  getStoredOTP,
};
