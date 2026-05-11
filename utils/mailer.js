const nodemailer = require('nodemailer');
require('dotenv').config();

// Minimal mailer helper. Uses environment variables:
// - EMAIL_HOST
// - EMAIL_PORT
// - EMAIL_SECURE (true/false)
// - EMAIL_USER
// - EMAIL_PASS
// - EMAIL_FROM (optional)

function createTransporter() {
  const host = process.env.EMAIL_HOST;
  const port = process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT, 10) : undefined;
  // Accept either EMAIL_SECURE or EMAIL_USE_TLS (some systems use EMAIL_USE_TLS/True)
  const secureFlag = (String(process.env.EMAIL_SECURE || '').toLowerCase() === 'true');
  const useTlsFlag = (String(process.env.EMAIL_USE_TLS || '').toLowerCase() === 'true' || String(process.env.EMAIL_USE_TLS || '').toLowerCase() === 'true');
  // prefer explicit EMAIL_SECURE, otherwise infer from EMAIL_USE_TLS
  const secure = secureFlag || false;
  const requireTLS = !secure && useTlsFlag;

  // Accept multiple env var names for user/pass
  const user = process.env.EMAIL_USER || process.env.EMAIL_HOST_USER;
  const pass = process.env.EMAIL_PASS || process.env.EMAIL_HOST_PASSWORD;
  const missing = [];
  if (!host) missing.push('EMAIL_HOST');
  if (!port) missing.push('EMAIL_PORT');
  if (!user) missing.push('EMAIL_USER or EMAIL_HOST_USER');
  if (!pass) missing.push('EMAIL_PASS or EMAIL_HOST_PASSWORD');
  if (missing.length) {
    throw new Error('Missing SMTP configuration in environment variables: ' + missing.join(', '));
  }

  // Diagnostic: log which SMTP env keys are present (do not print values)
  try {
    console.log('SMTP env presence:', {
      EMAIL_HOST: !!host,
      EMAIL_PORT: !!port,
      EMAIL_USER_or_EMAIL_HOST_USER: !!user,
      EMAIL_PASS_or_EMAIL_HOST_PASSWORD: !!pass,
      EMAIL_SECURE_or_USE_TLS: !!(process.env.EMAIL_SECURE || process.env.EMAIL_USE_TLS),
    });
  } catch (e) {
    // ignore logging errors
    logger.error("uncaughtexception error", err);
  }

  const transportOptions = {
    host,
    port,
    secure,
    auth: { user, pass },
  };
  if (requireTLS) transportOptions.requireTLS = true;

  return nodemailer.createTransport(transportOptions);
}

async function sendMail({ to, subject, text, html }) {
  const transporter = createTransporter();
  const from = process.env.EMAIL_FROM || process.env.EMAIL_USER;

  const info = await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
  });

  return info;
}

module.exports = { createTransporter, sendMail };
