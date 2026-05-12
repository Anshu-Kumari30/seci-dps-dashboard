require('dotenv').config();

// Mailer helper with pluggable backends.
// By default uses SMTP via `nodemailer` when `SENDGRID_API_KEY` is not set.
// If `SENDGRID_API_KEY` is present, uses SendGrid API via `@sendgrid/mail`.

let nodemailer;
let sgMail;
try {
  nodemailer = require('nodemailer');
} catch (e) {
  nodemailer = null;
}

if (process.env.SENDGRID_API_KEY) {
  try {
    sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  } catch (e) {
    sgMail = null;
    console.warn('SENDGRID_API_KEY is set but @sendgrid/mail is not installed.');
  }
}

function createTransporter() {
  if (!nodemailer) throw new Error('nodemailer is not installed');

  const host = process.env.EMAIL_HOST;
  const port = process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT, 10) : undefined;
  const secureFlag = (String(process.env.EMAIL_SECURE || '').toLowerCase() === 'true');
  const useTlsFlag = (String(process.env.EMAIL_USE_TLS || '').toLowerCase() === 'true');
  const secure = secureFlag || false;
  const requireTLS = !secure && useTlsFlag;

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

  try {
    console.log('SMTP env presence:', {
      EMAIL_HOST: !!host,
      EMAIL_PORT: !!port,
      EMAIL_USER_or_EMAIL_HOST_USER: !!user,
      EMAIL_PASS_or_EMAIL_HOST_PASSWORD: !!pass,
      EMAIL_SECURE_or_USE_TLS: !!(process.env.EMAIL_SECURE || process.env.EMAIL_USE_TLS),
    });
  } catch (e) {
    console.error(e);
  }

  const transportOptions = {
    host,
    port,
    secure,
    name: process.env.EMAIL_HELO || process.env.EMAIL_DOMAIN || 'portal.seci.co.in',
    auth: { user, pass },
  };
  if (requireTLS) transportOptions.requireTLS = true;

  return nodemailer.createTransport(transportOptions);
}


async function sendMail({ to, subject, text, html, from: fromOverride }) {
  const from = fromOverride || process.env.EMAIL_FROM || process.env.EMAIL_USER || process.env.EMAIL_FROM_ADDRESS;

  if (sgMail) {
    const msg = { to, from, subject, text, html };
    const res = await sgMail.send(msg);
    // Normalize SendGrid response to resemble nodemailer shape
    const first = Array.isArray(res) ? res[0] : res;
    const normalized = {
      accepted: [to],
      rejected: [],
      messageId: (first && first.headers && (first.headers['x-message-id'] || first.headers['X-Message-Id'])) || null,
      response: first && first.statusCode ? String(first.statusCode) : (first && first.body) || JSON.stringify(first),
    };
    return normalized;
  }

  // Fallback to SMTP via nodemailer
  const transporter = createTransporter();
  const info = await transporter.sendMail({ from, to, subject, text, html });
  return info;
}

module.exports = { createTransporter, sendMail };
