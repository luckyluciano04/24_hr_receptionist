import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendTestEmail = async (to: string, subject: string, body: string) => {
  try {
    const response = await resend.emails.send({
      from: 'no-reply@24hrreceptionist.com',
      to,
      subject,
      html: body,
    });
    return response;
  } catch (error) {
    console.error('Failed to send email:', error);
    throw new Error('Failed to send email');
  }
};
