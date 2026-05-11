require('dotenv').config();
const { sendMail } = require('../utils/mailer');

(async () => {
  const to = process.env.TEST_EMAIL || process.env.EMAIL_HOST_USER;
  if (!to) {
    console.error('No recipient configured. Set TEST_EMAIL or EMAIL_HOST_USER in .env');
    process.exit(1);
  }

  try {
    const info = await sendMail({ to, subject: 'Test email from seci-dps-dashboard', text: 'This is a test.' });
    console.log('Mail sent:', info && info.response ? info.response : info);
  } catch (err) {
    console.error('Mail send failed:', err && err.message ? err.message : err);
    if (err && err.response) console.error('SMTP response:', err.response);
    process.exit(2);
  }
})();
