
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

export const sendWorkWithUsEmail = async (data: {
  name: string,
  email: string,
  phone: string,
  position: string,
  message: string
}) => {
  const targetEmail = "luckygifts2026@gmail.com";

  if (!RESEND_API_KEY) {
    console.warn("Email simulation: VITE_RESEND_API_KEY is not set.");
    console.log("--- WORK WITH US EMAIL SIMULATION ---");
    console.log(`To: ${targetEmail}`);
    console.log(`From: ${data.name} (${data.email})`);
    console.log(`Phone: ${data.phone}`);
    console.log(`Position: ${data.position}`);
    console.log(`Message: ${data.message}`);
    console.log("--- END SIMULATION ---");
    return { success: true, simulated: true };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'LuckyGifts Careers <onboarding@resend.dev>',
        to: targetEmail,
        subject: `New Career Application: ${data.position} from ${data.name}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #000;">New Career Application</h2>
            <p><strong>Name:</strong> ${data.name}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Phone:</strong> ${data.phone}</p>
            <p><strong>Desired Position/Role:</strong> ${data.position}</p>
            <p><strong>Message:</strong></p>
            <div style="background: #f4f4f4; padding: 15px; border-radius: 8px;">
              ${data.message.replace(/\n/g, '<br>')}
            </div>
          </div>
        `
      })
    });

    const result = await response.json();
    return { success: response.ok, ...result };
  } catch (error) {
    console.error("Error sending career application:", error);
    return { success: false, error };
  }
};

export const sendContactEmail = async (data: {
  name: string,
  email: string,
  phone: string,
  subject: string,
  message: string
}) => {
  const targetEmail = "luckygifts2026@gmail.com";

  if (!RESEND_API_KEY) {
    console.warn("Email simulation: VITE_RESEND_API_KEY is not set.");
    console.log("--- CONTACT EMAIL SIMULATION ---");
    console.log(`To: ${targetEmail}`);
    console.log(`From: ${data.name} (${data.email})`);
    console.log(`Phone: ${data.phone}`);
    console.log(`Subject: ${data.subject}`);
    console.log(`Message: ${data.message}`);
    console.log("--- END SIMULATION ---");
    return { success: true, simulated: true };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'LuckyGifts Contact <onboarding@resend.dev>',
        to: targetEmail,
        subject: `New Contact Message: ${data.subject} from ${data.name}`,
        html: `
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
        `
      })
    });

    const result = await response.json();
    return { success: response.ok, ...result };
  } catch (error) {
    console.error("Error sending contact message:", error);
    return { success: false, error };
  }
};
