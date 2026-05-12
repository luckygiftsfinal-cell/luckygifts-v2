
export const getLuxuryEmailTemplate = (data: {
  userName: string,
  orderId: string,
  totalAmount: string,
  items: any[],
  tickets: string[]
}) => {
  const itemsHtml = data.items.map(item => `
    <tr>
      <td style="padding: 15px 0; border-bottom: 1px solid #222;">
        <span style="color: #ffffff; font-weight: bold; font-size: 14px;">${item.title}</span>
        <br />
        <span style="color: #666; font-size: 12px;">Qty: ${item.quantity}</span>
      </td>
      <td style="padding: 15px 0; border-bottom: 1px solid #222; text-align: right; color: #ffffff; font-weight: bold;">
        $${(parseFloat(item.price) * item.quantity).toLocaleString()}
      </td>
    </tr>
  `).join('');

  const ticketsHtml = data.tickets.map(code => `
    <div style="display: inline-block; background: #1a1a1a; border: 1px solid #FFD700; border-radius: 8px; padding: 10px 15px; margin: 5px; color: #FFD700; font-family: monospace; font-weight: bold; font-size: 14px; letter-spacing: 1px;">
      ${code}
    </div>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>LuckyGifts - Order Confirmation</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #050505; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #050505; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #0a0a0a; border: 1px solid #1a1a1a; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
              
              <!-- Header -->
              <tr>
                <td align="center" style="padding: 40px 40px 20px 40px;">
                  <h1 style="color: #FFD700; font-size: 28px; font-weight: 900; margin: 0; text-transform: uppercase; letter-spacing: -1px; font-style: italic;">LuckyGifts</h1>
                  <p style="color: #ffffff; font-size: 18px; font-weight: bold; margin-top: 20px; margin-bottom: 5px;">Congratulations, ${data.userName}!</p>
                  <p style="color: #666; font-size: 14px; margin: 0;">Your entry to the dream draw is confirmed.</p>
                </td>
              </tr>

              <!-- Order Summary Card -->
              <tr>
                <td style="padding: 20px 40px;">
                  <div style="background-color: #111; border-radius: 16px; padding: 25px; border: 1px solid #1a1a1a;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="color: #444; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; padding-bottom: 15px;">Order Details</td>
                        <td align="right" style="color: #444; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; padding-bottom: 15px;">#${data.orderId.substring(0, 8)}</td>
                      </tr>
                      ${itemsHtml}
                      <tr>
                        <td style="padding: 20px 0 0 0; color: #ffffff; font-weight: bold;">Total Amount</td>
                        <td align="right" style="padding: 20px 0 0 0; color: #FFD700; font-size: 20px; font-weight: 900;">$${data.totalAmount}</td>
                      </tr>
                    </table>
                  </div>
                </td>
              </tr>

              <!-- Tickets Section -->
              <tr>
                <td align="center" style="padding: 20px 40px 40px 40px;">
                  <p style="color: #ffffff; font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 20px;">Your Golden Tickets</p>
                  <div style="text-align: center;">
                    ${ticketsHtml}
                  </div>
                  <p style="color: #444; font-size: 11px; font-weight: bold; margin-top: 25px; line-height: 1.6; text-transform: uppercase; letter-spacing: 1px;">
                    These tickets have been registered to your profile. <br /> Good luck in the upcoming draw!
                  </p>
                </td>
              </tr>

              <!-- Footer CTA -->
              <tr>
                <td align="center" style="padding: 0 40px 40px 40px;">
                  <a href="https://luckygifts.com/dashboard" style="display: inline-block; background-color: #FFD700; color: #000000; padding: 15px 30px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">View My Dashboard</a>
                </td>
              </tr>

              <!-- Branding Footer -->
              <tr>
                <td align="center" style="padding: 20px; background-color: #050505; border-top: 1px solid #111;">
                  <p style="color: #333; font-size: 10px; margin: 0; text-transform: uppercase; letter-spacing: 2px;">&copy; 2026 LuckyGifts Luxury Platforms. All Rights Reserved.</p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};
