const express = require('express');
const { sendEmail, sendOTPEmail } = require('../utils/mailer');

const router = express.Router();

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const OTP_TTL_MS = 10 * 60 * 1000;
const otpStore = new Map();

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
const normalizeEmail = (value) => String(value || '').trim().toLowerCase();

setInterval(() => {
  const now = Date.now();
  for (const [email, entry] of otpStore.entries()) {
    if (entry.expiresAt <= now) {
      otpStore.delete(email);
    }
  }
}, 60_000).unref?.();

router.post('/send-email', async (req, res) => {
  try {
    const { to, subject, text, html } = req.body || {};

    if (!to || !subject || (!text && !html)) {
      return res.status(400).json({
        success: false,
        message: 'to, subject, and text or html are required',
      });
    }

    if (!isValidEmail(to)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid recipient email address',
      });
    }

    const info = await sendEmail({ to, subject, text, html });

    return res.status(200).json({
      success: true,
      message: 'Email sent successfully',
      id: info?.messageId,
    });
  } catch (error) {
    console.error('[MAIL ROUTE] /send-email unexpected error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Unexpected server error while sending email',
    });
  }
});

router.post('/send-otp', async (req, res) => {
  try {
    const { to } = req.body || {};

    if (!to) {
      return res.status(400).json({
        success: false,
        message: 'to is required',
      });
    }

    if (!isValidEmail(to)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid recipient email address',
      });
    }

    const otp = generateOTP();
    const emailKey = normalizeEmail(to);
    otpStore.set(emailKey, { otp, expiresAt: Date.now() + OTP_TTL_MS });

    await sendOTPEmail(to, otp);

    return res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      expiresInSeconds: Math.floor(OTP_TTL_MS / 1000),
    });
  } catch (error) {
    console.error('[MAIL ROUTE] /send-otp unexpected error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Unexpected server error while sending OTP',
    });
  }
});

module.exports = router;
