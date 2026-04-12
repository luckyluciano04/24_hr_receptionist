import { Resend } from 'resend';

function getResend(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error('Missing RESEND_API_KEY environment variable');
  }
  return new Resend(key);
}

let _resend: Resend | null = null;
function resend(): Resend {
  if (!_resend) _resend = getResend();
  return _resend;
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const FROM = 'noreply@24hrreceptionist.com';
const APP_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://24hrreceptionist.com';

function baseLayout(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>24hrreceptionist.com</title>
</head>
<body style="margin:0;padding:0;background:#0A0A0A;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0A0A;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#111;border-radius:8px;overflow:hidden;">
          <tr>
            <td style="background:#2563EB;padding:24px 32px;">
              <h1 style="margin:0;color:#fff;font-size:20px;font-weight:700;">
                24hr Receptionist
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="padding:16px 32px;border-top:1px solid #222;">
              <p style="margin:0;color:#666;font-size:12px;text-align:center;">
                &copy; ${new Date().getFullYear()} 24hrreceptionist.com · All rights reserved<br/>
                <a href="${APP_URL}/unsubscribe" style="color:#2563EB;">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  const html = baseLayout(`
    <h2 style="color:#fff;margin-top:0;">Welcome to 24hr Receptionist!</h2>
    <p style="color:#ccc;line-height:1.6;">Hi ${name},</p>
    <p style="color:#ccc;line-height:1.6;">
      Thanks for signing up! You're one step away from never missing another business call.
      Complete your setup to start your free 7-day trial.
    </p>
    <a href="${APP_URL}/signup" style="display:inline-block;background:#2563EB;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:600;margin-top:16px;">
      Complete Setup
    </a>
    <p style="color:#999;font-size:14px;margin-top:24px;">
      No credit card required for your trial. Cancel anytime.
    </p>
  `);

  await resend().emails.send({ from: FROM, to, subject: 'Welcome to 24hr Receptionist!', html });
}

export async function sendConfirmationEmail(
  to: string,
  name: string,
  tier: string,
  magicLink?: string,
): Promise<void> {
  const ctaLink = magicLink ?? `${APP_URL}/login`;
  const html = baseLayout(`
    <h2 style="color:#fff;margin-top:0;">You're all set! 🎉</h2>
    <p style="color:#ccc;line-height:1.6;">Hi ${name},</p>
    <p style="color:#ccc;line-height:1.6;">
      Your <strong style="color:#2563EB;">${capitalize(tier)}</strong> plan is now active.
      Click the button below to complete your setup — the link expires in 24 hours.
    </p>
    <a href="${ctaLink}" style="display:inline-block;background:#2563EB;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:600;margin-top:16px;">
      Start Onboarding →
    </a>
    <p style="color:#999;font-size:14px;margin-top:24px;">
      Setup takes less than 5 minutes. You can always sign in again at
      <a href="${APP_URL}/login" style="color:#2563EB;">${APP_URL}/login</a>.
    </p>
  `);

  await resend().emails.send({
    from: FROM,
    to,
    subject: "Payment confirmed — let's get you set up",
    html,
  });
}

export async function sendCallNotificationEmail(
  to: string,
  businessName: string,
  callerName: string,
  callerPhone: string,
  summary: string,
  duration: number,
): Promise<void> {
  const mins = Math.floor(duration / 60);
  const secs = duration % 60;
  const durationStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;

  const html = baseLayout(`
    <h2 style="color:#fff;margin-top:0;">📞 New Call for ${businessName}</h2>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #222;">
          <span style="color:#999;font-size:13px;">Caller Name</span><br/>
          <span style="color:#fff;font-size:16px;font-weight:600;">${callerName}</span>
        </td>
      </tr>
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #222;">
          <span style="color:#999;font-size:13px;">Phone Number</span><br/>
          <span style="color:#fff;font-size:16px;font-weight:600;">${callerPhone}</span>
        </td>
      </tr>
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #222;">
          <span style="color:#999;font-size:13px;">Duration</span><br/>
          <span style="color:#fff;font-size:16px;">${durationStr}</span>
        </td>
      </tr>
      <tr>
        <td style="padding:8px 0;">
          <span style="color:#999;font-size:13px;">Summary</span><br/>
          <span style="color:#ccc;font-size:15px;line-height:1.6;">${summary}</span>
        </td>
      </tr>
    </table>
    <a href="${APP_URL}/dashboard/calls" style="display:inline-block;background:#2563EB;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:600;margin-top:24px;">
      View Full Transcript
    </a>
  `);

  await resend().emails.send({
    from: FROM,
    to,
    subject: `New call from ${callerName} — ${businessName}`,
    html,
  });
}

export async function sendPaymentFailedEmail(to: string, name: string): Promise<void> {
  const html = baseLayout(`
    <h2 style="color:#fff;margin-top:0;">⚠️ Payment Failed</h2>
    <p style="color:#ccc;line-height:1.6;">Hi ${name},</p>
    <p style="color:#ccc;line-height:1.6;">
      We had trouble processing your payment. Your service will remain active for 3 more days 
      while we retry. Please update your payment method to avoid any interruption.
    </p>
    <a href="${APP_URL}/dashboard/settings" style="display:inline-block;background:#2563EB;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:600;margin-top:16px;">
      Update Payment Method
    </a>
    <p style="color:#999;font-size:14px;margin-top:24px;">
      Questions? Reply to this email and we'll help right away.
    </p>
  `);

  await resend().emails.send({
    from: FROM,
    to,
    subject: 'Action required: Payment failed',
    html,
  });
}

export async function sendCancellationEmail(to: string, name: string): Promise<void> {
  const html = baseLayout(`
    <h2 style="color:#fff;margin-top:0;">We're sorry to see you go</h2>
    <p style="color:#ccc;line-height:1.6;">Hi ${name},</p>
    <p style="color:#ccc;line-height:1.6;">
      Your 24hr Receptionist subscription has been cancelled. You'll continue to have access 
      until the end of your current billing period.
    </p>
    <p style="color:#ccc;line-height:1.6;">
      If you change your mind, you can reactivate at any time.
    </p>
    <a href="${APP_URL}/pricing" style="display:inline-block;background:#2563EB;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:600;margin-top:16px;">
      Reactivate My Account
    </a>
    <p style="color:#999;font-size:14px;margin-top:24px;">
      Thank you for giving us a try. We hope to serve you again in the future.
    </p>
  `);

  await resend().emails.send({
    from: FROM,
    to,
    subject: 'Your subscription has been cancelled',
    html,
  });
}
