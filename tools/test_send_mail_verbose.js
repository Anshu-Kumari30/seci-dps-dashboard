require('dotenv').config();
const { createTransporter, sendMail } = require('../utils/mailer');

(async () => {
  const to = process.argv[2] || process.env.TEST_EMAIL || process.env.EMAIL_HOST_USER;
  if (!to) {
    console.error('No recipient configured. Provide as first arg or set TEST_EMAIL/EMAIL_HOST_USER in .env');
    process.exit(1);
  }

  try {
    const transporter = createTransporter();

    console.log('Verifying transporter connection...');
    await transporter.verify();
    console.log('Transporter verified (can connect + auth passed).');

    const result = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_HOST_USER,
      to,
      subject: 'Verbose test email from seci-dps-dashboard',
      text: 'This is a verbose test to inspect SMTP delivery details.'
    });

    console.log('Send result (raw):', result);
    console.log('Accepted:', result.accepted);
    console.log('Rejected:', result.rejected);
    console.log('Envelope:', result.envelope);
    console.log('MessageId:', result.messageId);
    console.log('Response:', result.response);
  } catch (err) {
    console.error('Mail send/verify failed:', err && err.message ? err.message : err);
    if (err && err.response) console.error('SMTP response:', err.response);
    process.exit(2);
  }
})();
