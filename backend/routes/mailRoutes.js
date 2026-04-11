const express = require('express');
const {
  sendEmail,
  createAndSendOtp,
} = require('../services/mailService');

const router = express.Router();

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

router.post('/send-email', async (req, res) => {
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

  const result = await sendEmail(to, subject, text, html);
  if (!result.success) {
    return res.status(500).json({
      success: false,
      message: 'Failed to send email',
      error: result.error,
    });
  }

  return res.status(200).json({
    success: true,
    message: 'Email sent successfully',
    id: result.data?.id,
  });
});

router.post('/send-otp', async (req, res) => {
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

  const result = await createAndSendOtp(to);
  if (!result.success) {
    return res.status(500).json({
      success: false,
      message: 'Failed to send OTP',
      error: result.error,
    });
  }

  return res.status(200).json({
    success: true,
    message: 'OTP sent successfully',
    expiresInSeconds: result.expiresInSeconds,
  });
});

module.exports = router;
