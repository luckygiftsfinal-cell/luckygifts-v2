
import { getLuxuryEmailTemplate, getAdminNotificationTemplate, getTicketEmailTemplate } from './emailTemplates';

const RESEND_API_KEY = (import.meta as any).env?.VITE_RESEND_API_KEY || '';
const ADMIN_EMAIL = 'luckygiftsfinal@gmail.com';
const FROM_EMAIL = 'LuckyGifts <onboarding@resend.dev>';

// Send email via Resend
const sendEmail = async (to: string, subject: string, html: string) => {
  if (!RESEND_API_KEY) {
    console.warn("Email simulation - RESEND_API_KEY not set");
    console.log(`To: ${to} | Subject: ${subject}`);
    return { success: true, simulated: true };
  }
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({ from: FROM_EMAIL, to, subject, html })
    });
    const result = await response.json();
    return { success: response.ok, ...result };
  } catch (error) {
    console.error("Email error:", error);
    return { success: false, error };
  }
};

// 1. Order Confirmation + Tickets to Customer
export const sendOrderConfirmationEmail = async (data: {
  toEmail: string,
  userName: string,
  orderId: string,
  totalAmount: string,
  items: any[],
  tickets: string[],
  paymentMethod?: string
}) => {
  // Email 1: Order confirmation with tickets to customer
  const customerHtml = getLuxuryEmailTemplate(data);
  await sendEmail(
    data.toEmail,
    `🎫 Your LuckyGifts Tickets #${data.orderId.substring(0, 8)} - Entry Confirmed!`,
    customerHtml
  );

  // Email 2: Ticket details email to customer (separate email)
  if (data.tickets && data.tickets.length > 0) {
    const ticketHtml = getTicketEmailTemplate(data);
    await sendEmail(
      data.toEmail,
      `🏆 Your Lucky Ticket Numbers - LuckyGifts #${data.orderId.substring(0, 8)}`,
      ticketHtml
    );
  }

  // Email 3: Admin notification
  const adminHtml = getAdminNotificationTemplate(data);
  await sendEmail(
    ADMIN_EMAIL,
    `🛒 New Order: $${data.totalAmount} from ${data.userName} | #${data.orderId.substring(0, 8)}`,
    adminHtml
  );

  return { success: true };
};

export const sendWorkWithUsEmail = async (data: {
  name: string,
  email: string,
  phone: string,
  position: string,
  message: string
}) => {
  const html = `
    <div style="font-family: sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #000;">New Career Application</h2>
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Phone:</strong> ${data.phone}</p>
      <p><strong>Position:</strong> ${data.position}</p>
      <p><strong>Message:</strong></p>
      <div style="background: #f4f4f4; padding: 15px; border-radius: 8px;">
        ${data.message.replace(/\n/g, '<br>')}
      </div>
    </div>
  `;
  return sendEmail(ADMIN_EMAIL, `New Career Application: ${data.position} from ${data.name}`, html);
};

export const sendContactEmail = async (data: {
  name: string,
  email: string,
  phone: string,
  subject: string,
  message: string
}) => {
  const html = `
    <div style="font-family: sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #000;">New Contact Message</h2>
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Phone:</strong> ${data.phone}</p>
      <p><strong>Subject:</strong> ${data.subject}</p>
      <p><strong>Message:</strong></p>
      <div style="background: #f4f4f4; padding: 15px; border-radius: 8px;">
        ${data.message.replace(/\n/g, '<br>')}
      </div>
    </div>
  `;
  return sendEmail(ADMIN_EMAIL, `New Contact: ${data.subject} from ${data.name}`, html);
};
