require('dotenv').config();
const { sendOTPEmail, sendPasswordChangedEmail, testMailer } = require('./utils/mailer');

async function runTest() {
  console.log('\n🔧 FleetFly Mailgun Test\n');
  console.log('MAILGUN_DOMAIN:', process.env.MAILGUN_DOMAIN);
  console.log('MAIL_FROM:', process.env.MAIL_FROM);
  console.log('');

  // Step 1: Verify Mailgun configuration
  console.log('Step 1: Verifying Mailgun configuration...');
  const connected = await testMailer();
  if (!connected) {
    console.error('❌ Mailgun config check failed. Check your .env values.');
    process.exit(1);
  }

  const testRecipient = process.env.MAILGUN_TEST_TO;
  if (!testRecipient) {
    console.error('❌ Set MAILGUN_TEST_TO in .env to run this test script.');
    process.exit(1);
  }

  // Step 2: Send test OTP email
  console.log('\nStep 2: Sending test OTP email to', testRecipient, '...');
  const testOTP = '847291';
  const otpSent = await sendOTPEmail(testRecipient, testOTP, 'Karan');
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
