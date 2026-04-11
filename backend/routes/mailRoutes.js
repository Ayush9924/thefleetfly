const express = require('express');
const {
  sendEmail,
  createAndSendOtp,
} = require('../services/mailService');

const router = express.Router();

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

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

    const result = await sendEmail(to, subject, text, html);
    if (!result.success) {
      console.error('[MAIL ROUTE] /send-email failed:', result.error, result.details || '');
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

    const result = await createAndSendOtp(to);
    if (!result.success) {
      console.error('[MAIL ROUTE] /send-otp failed:', result.error, result.details || '');
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
  } catch (error) {
    console.error('[MAIL ROUTE] /send-otp unexpected error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Unexpected server error while sending OTP',
    });
  }
});

module.exports = router;
