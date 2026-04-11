const nodemailer = require('nodemailer');

const SMTP_CANDIDATES = [
  { host: 'smtp-relay.brevo.com', port: 2525, secure: false },
  { host: 'smtp-relay.brevo.com', port: 587, secure: false },
  { host: 'smtp-relay.sendinblue.com', port: 587, secure: false },
  { host: 'smtp-relay.sendinblue.com', port: 2525, secure: false },
  { host: 'smtp-relay.brevo.com', port: 465, secure: true },
  { host: 'smtp-relay.sendinblue.com', port: 465, secure: true },
];

let activeSmtpConfig = null;

const cleanEnv = (value) => String(value || '').trim().replace(/^['"]|['"]$/g, '');
const smtpUser = cleanEnv(process.env.BREVO_SMTP_USER);
const smtpPass = cleanEnv(process.env.BREVO_SMTP_KEY);

const createTransport = (config) => nodemailer.createTransport({
  host: config.host,
  port: config.port,
  secure: config.secure,
  connectionTimeout: 8_000,
  greetingTimeout: 8_000,
  socketTimeout: 12_000,
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
});

const getSmtpOrder = () => {
  if (!activeSmtpConfig) return SMTP_CANDIDATES;
  return [activeSmtpConfig, ...SMTP_CANDIDATES.filter(
    (c) => !(c.host === activeSmtpConfig.host && c.port === activeSmtpConfig.port && c.secure === activeSmtpConfig.secure)
  )];
};

const sendWithSmtpFallback = async (mailOptions) => {
  if (!smtpUser || !smtpPass) {
    throw new Error('Brevo SMTP credentials are missing (BREVO_SMTP_USER / BREVO_SMTP_KEY)');
  }

  const attempts = getSmtpOrder();
  let lastError = null;

  for (const cfg of attempts) {
    const transporter = createTransport(cfg);
    try {
      const info = await transporter.sendMail(mailOptions);
      activeSmtpConfig = cfg;
      console.log(`[MAILER] Brevo SMTP ready ✓ (${cfg.host}:${cfg.port}, secure=${cfg.secure})`);
      return info;
    } catch (error) {
      lastError = error;
      console.error(`[MAILER] SMTP attempt failed (${cfg.host}:${cfg.port}, secure=${cfg.secure}):`, error.message);

      // Invalid login is deterministic; retrying other hosts won't fix wrong creds.
      if (/invalid login|535|eauth/i.test(String(error.message || ''))) {
        throw new Error('Brevo SMTP authentication failed (check BREVO_SMTP_USER and BREVO_SMTP_KEY)');
      }
    }
  }

  throw lastError || new Error('All SMTP attempts failed');
};

// Probe the currently preferred route at startup (non-blocking).
(async () => {
  try {
    const first = getSmtpOrder()[0];
    const transporter = createTransport(first);
    await transporter.verify();
    activeSmtpConfig = first;
    console.log(`[MAILER] Brevo SMTP ready ✓ (${first.host}:${first.port}, secure=${first.secure})`);
  } catch (error) {
    console.error('[MAILER] Brevo SMTP connection failed:', error.message);
  }
})();

const sendEmail = async ({ to, subject, text, html }) => {
  const info = await sendWithSmtpFallback({
    from: `"FleetFly" <${process.env.BREVO_FROM}>`,
    to,
    subject,
    text,
    html,
  });

  console.log('[MAILER] Email sent to:', to, '| ID:', info.messageId);
  return info;
};

const sendOTPEmail = async (toEmail, otp) => {
  const info = await sendWithSmtpFallback({
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
  console.log('[MAILER] OTP sent to:', toEmail, '| ID:', info.messageId);
  return info;
};

const sendPasswordChangedEmail = async (toEmail) => {
  const info = await sendWithSmtpFallback({
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
