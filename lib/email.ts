import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// NOTE: The from address domain must be verified with Resend before use in production.
// See https://resend.com/docs/dashboard/domains/introduction
// You can override this via the RESEND_FROM_ADDRESS environment variable.
const FROM = process.env.RESEND_FROM_ADDRESS ?? 'no-reply@24hrreceptionist.com';

export const sendTestEmail = async (to: string, subject: string, body: string) => {
  try {
    const response = await resend.emails.send({
      from: FROM,
      to,
      subject,
      html: body,
    });
    return response;
  } catch (error) {
    console.error('Failed to send email:', error);
    throw new Error(`Failed to send email: ${error}`);
  }
};
