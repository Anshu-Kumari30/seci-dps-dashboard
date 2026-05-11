// Quick SMTP test script
// Usage: set EMAIL_* env vars (or copy .env.example -> .env) then run:
//    node scripts/send_test_mail.js recipient@example.com

require('dotenv').config();
const { sendMail } = require('../utils/mailer');

(async () => {
  const to = process.argv[2] || process.env.EMAIL_TEST_TO;
  if (!to) {
    console.error('Usage: node scripts/send_test_mail.js recipient@example.com');
    process.exit(1);
  }

  try {
    const info = await sendMail({
      to,
      subject: 'SECI Portal SMTP test',
      text: 'This is a test email sent from SECI DPS Dashboard to verify SMTP settings.',
    });
    console.log('Mail sent OK:', info);
  } catch (err) {
    console.error('Mail send failed:', err && err.message ? err.message : err);
    if (err && err.response) console.error('SMTP response:', err.response);
    process.exit(2);
  }
})();
