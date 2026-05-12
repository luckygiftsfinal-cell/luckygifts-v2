
import { getLuxuryEmailTemplate } from './emailTemplates';

const RESEND_API_KEY = (import.meta as any).env?.VITE_RESEND_API_KEY || '';

export const sendOrderConfirmationEmail = async (data: {
  toEmail: string,
  userName: string,
  orderId: string,
  totalAmount: string,
  items: any[],
  tickets: string[]
}) => {
  if (!RESEND_API_KEY) {
    console.warn("Email simulation: VITE_RESEND_API_KEY is not set. Printing email content to console instead.");
    console.log("--- EMAIL SIMULATION START ---");
    console.log(`To: ${data.toEmail}`);
    console.log(`Subject: Your LuckyGifts Order #${data.orderId.substring(0, 8)}`);
    console.log("--- EMAIL SIMULATION END ---");
    return { success: true, simulated: true };
  }

  try {
    const htmlContent = getLuxuryEmailTemplate(data);
    
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'LuckyGifts <onboarding@resend.dev>', // You can change this once you verify your domain
        to: data.toEmail,
        subject: `Your LuckyGifts Order #${data.orderId.substring(0, 8)} - Entry Confirmed!`,
        html: htmlContent
      })
    });

    const result = await response.json();
    return { success: response.ok, ...result };
  } catch (error) {
    console.error("Error sending email via Resend:", error);
    return { success: false, error };
  }
};
