require('dotenv').config();
const { sendOTPEmail, sendPasswordChangedEmail, testMailer } = require('./utils/mailer');

async function runTest() {
  console.log('\n🔧 FleetFly Nodemailer Test\n');
  console.log('GMAIL_USER:', process.env.GMAIL_USER);
  console.log('SMTP_HOST:', 'smtp.gmail.com');
  console.log('SMTP_PORT:', 465);
  console.log('');

  // Step 1: Verify SMTP connection
  console.log('Step 1: Verifying SMTP connection...');
  const connected = await testMailer();
  if (!connected) {
    console.error('❌ SMTP connection failed. Check your .env credentials.');
    process.exit(1);
  }

  // Step 2: Send test OTP email to yourself
  console.log('\nStep 2: Sending test OTP email to', process.env.GMAIL_USER, '...');
  const testOTP = '847291';
  const otpSent = await sendOTPEmail(process.env.GMAIL_USER, testOTP, 'Karan');
  if (otpSent) {
    console.log('✅ OTP email sent successfully! OTP was:', testOTP);
  } else {
    console.error('❌ OTP email failed to send.');
  }

  // Step 3: Send password change confirmation
  console.log('\nStep 3: Sending password changed confirmation email...');
  const confirmSent = await sendPasswordChangedEmail(process.env.GMAIL_USER, 'Karan');
  if (confirmSent) {
    console.log('✅ Password changed email sent successfully!');
  } else {
    console.error('❌ Password changed email failed.');
  }

  console.log('\n🎉 Test complete! Check your Gmail inbox at:', process.env.GMAIL_USER);
}

runTest().catch(console.error);
