require('dotenv').config();
const { sendOTPEmail, sendPasswordChangedEmail } = require('./utils/mailer');

async function runTest() {
  console.log('\n🔧 FleetFly Brevo API Test\n');
  console.log('BREVO_API_KEY:', process.env.BREVO_API_KEY ? 'set' : 'missing');
  console.log('BREVO_FROM:', process.env.BREVO_FROM);
  console.log('');

  // Step 1: Verify Brevo configuration
  console.log('Step 1: Verifying Brevo configuration...');
  const hasConfig = !!(process.env.BREVO_API_KEY && process.env.BREVO_FROM);
  if (!hasConfig) {
    console.error('❌ Brevo config check failed. Check your .env values.');
    process.exit(1);
  }

  const testRecipient = process.env.MAIL_TEST_TO;
  if (!testRecipient) {
    console.error('❌ Set MAIL_TEST_TO in .env to run this test script.');
    process.exit(1);
  }

  // Step 2: Send test OTP email
  console.log('\nStep 2: Sending test OTP email to', testRecipient, '...');
  const testOTP = '847291';
  const otpSent = await sendOTPEmail(testRecipient, testOTP);
  if (otpSent) {
    console.log('✅ OTP email sent successfully! OTP was:', testOTP);
  } else {
    console.error('❌ OTP email failed to send.');
  }

  // Step 3: Send password change confirmation
  console.log('\nStep 3: Sending password changed confirmation email...');
  const confirmSent = await sendPasswordChangedEmail(testRecipient, 'Karan');
  if (confirmSent) {
    console.log('✅ Password changed email sent successfully!');
  } else {
    console.error('❌ Password changed email failed.');
  }

  console.log('\n🎉 Test complete! Check inbox at:', testRecipient);
}

runTest().catch(console.error);
