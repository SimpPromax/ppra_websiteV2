// test-email.js
require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
  console.log('='.repeat(50));
  console.log('📧 EMAIL CONFIGURATION TEST');
  console.log('='.repeat(50));
  
  console.log('📋 Configuration:');
  console.log('  SMTP_USER:', process.env.SMTP_USER);
  console.log('  SMTP_PASS:', process.env.SMTP_PASS ? '✅ Set (length: ' + process.env.SMTP_PASS.length + ')' : '❌ Not set');
  console.log('  INFO_EMAIL:', process.env.INFO_EMAIL);
  console.log('');

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    // Test 1: Verify connection
    console.log('🔄 Test 1: Verifying transporter...');
    await transporter.verify();
    console.log('✅ Transporter verified successfully!');
    console.log('');

    // Test 2: Send test email
    console.log('🔄 Test 2: Sending test email...');
    const info = await transporter.sendMail({
      from: `"PPRA Test" <${process.env.SMTP_USER}>`,
      to: process.env.INFO_EMAIL,
      subject: 'Test Email from PPRA Backend',
      text: 'This is a test email to verify the email configuration is working.',
      html: `
        <h1>Test Email</h1>
        <p>This is a test email to verify the email configuration is working.</p>
        <p>Time: ${new Date().toISOString()}</p>
      `,
    });

    console.log('✅ Email sent successfully!');
    console.log('  Message ID:', info.messageId);
    console.log('  Response:', info.response);
    console.log('');

  } catch (error) {
    console.error('❌ Email test failed!');
    console.error('  Error:', error.message);
    console.error('  Code:', error.code);
    console.error('  Command:', error.command);
    console.error('');
    
    // Provide helpful diagnostics
    if (error.code === 'EAUTH') {
      console.log('🔍 DIAGNOSIS: Authentication failed');
      console.log('   Possible causes:');
      console.log('   1. Wrong password (needs App Password, not regular password)');
      console.log('   2. 2FA not enabled for this Google account');
      console.log('   3. App Password not generated correctly');
      console.log('');
      console.log('   🔧 How to fix:');
      console.log('   1. Go to https://myaccount.google.com/apppasswords');
      console.log('   2. Generate a new App Password');
      console.log('   3. Update SMTP_PASS in .env');
      console.log('   4. Restart the server');
    } else if (error.code === 'ESOCKET') {
      console.log('🔍 DIAGNOSIS: Connection issue');
      console.log('   Possible causes:');
      console.log('   1. Internet connection problem');
      console.log('   2. Firewall blocking port 587');
      console.log('   3. Gmail SMTP server unreachable');
    }
  }
}

testEmail();