const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  connectionTimeout: 10_000,
  greetingTimeout: 10_000,
  socketTimeout: 15_000,
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_KEY,
  },
});

transporter.verify((error) => {
  if (error) {
    console.error('[MAILER] Brevo SMTP connection failed:', error.message);
  } else {
    console.log('[MAILER] Brevo SMTP ready ✓');
  }
});

const sendEmail = async ({ to, subject, text, html }) => {
  const sendMailPromise = transporter.sendMail({
    from: `"FleetFly" <${process.env.BREVO_FROM}>`,
    to,
    subject,
    text,
    html,
  });

  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('SMTP send timeout after 15s')), 15_000);
  });

  const info = await Promise.race([sendMailPromise, timeoutPromise]);

  console.log('[MAILER] Email sent to:', to, '| ID:', info.messageId);
  return info;
};

const sendOTPEmail = async (toEmail, otp) => {
  const sendMailPromise = transporter.sendMail({
    from: `"FleetFly" <${process.env.BREVO_FROM}>`,
    to: toEmail,
    subject: 'Your FleetFly OTP Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
        <div style="background: #0f172a; color: #ffffff; padding: 16px 20px; font-size: 20px; font-weight: 700;">FleetFly</div>
        <div style="padding: 20px; color: #111827;">
          <p style="margin: 0 0 8px; color: #6b7280;">Fleet Management Platform</p>
          <p style="margin: 0 0 12px;">Your OTP verification code:</p>
          <div style="font-size: 30px; font-weight: 700; letter-spacing: 8px; text-align: center; background: #eff6ff; color: #1d4ed8; border-radius: 8px; padding: 14px 12px; margin: 10px 0 16px;">${otp}</div>
          <p style="margin: 0 0 8px; color: #374151;">Valid for 10 minutes.</p>
          <p style="margin: 0; color: #6b7280;">Didn't request this? Ignore this email.</p>
        </div>
      </div>
    `,
  });

  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('SMTP send timeout after 15s')), 15_000);
  });

  const info = await Promise.race([sendMailPromise, timeoutPromise]);
  console.log('[MAILER] OTP sent to:', toEmail, '| ID:', info.messageId);
  return info;
};

const sendPasswordChangedEmail = async (toEmail) => {
  const sendMailPromise = transporter.sendMail({
    from: `"FleetFly" <${process.env.BREVO_FROM}>`,
    to: toEmail,
    subject: 'FleetFly — Password Changed Successfully',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
        <div style="background: #0f172a; color: #ffffff; padding: 16px 20px; font-size: 20px; font-weight: 700;">FleetFly</div>
        <div style="padding: 20px; color: #111827;">
          <p style="margin: 0 0 8px; color: #6b7280;">Fleet Management Platform</p>
          <p style="margin: 0 0 12px;">Your password was successfully changed.</p>
          <p style="margin: 0; color: #6b7280;">If you did not do this, contact support immediately.</p>
        </div>
      </div>
    `,
  });

  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('SMTP send timeout after 15s')), 15_000);
  });

  const info = await Promise.race([sendMailPromise, timeoutPromise]);
  return info;
};

const testMailer = async () => {
  if (!process.env.BREVO_SMTP_USER || !process.env.BREVO_SMTP_KEY || !process.env.BREVO_FROM) {
    console.error('[MAILER] Missing BREVO_SMTP_USER, BREVO_SMTP_KEY, or BREVO_FROM');
    return false;
  }

  console.log('[MAILER] Brevo configuration present ✓');
  return true;
};

module.exports = { sendOTPEmail, sendPasswordChangedEmail, testMailer, sendEmail };
