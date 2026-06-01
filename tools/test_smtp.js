// Simple SMTP test runner for the deployed app
// Usage: node tools/test_smtp.js recipient@example.com

require('dotenv').config();
const { sendMail, createTransporter } = require('../utils/mailer');

async function run() {
  const to = process.argv[2] || process.env.ADMIN_EMAIL || 'your-email@example.com';
  console.log('Attempting to send test email to:', to);
  try {
    // Log transporter env presence
    try {
      const t = createTransporter();
      console.log('Transporter created. Ready to send using SMTP host:', process.env.EMAIL_HOST);
    } catch (e) {
      console.error('Failed to create transporter:', e && e.message ? e.message : e);
    }

    const res = await sendMail({
      to,
      subject: 'SECI Dashboard SMTP test',
      text: 'This is a test email from SECI Dashboard. If you received this, SMTP is working.'
    });

    console.log('sendMail result:', res);
  } catch (err) {
    console.error('sendMail threw error:', err && err.message ? err.message : err);
  }
}

run();
