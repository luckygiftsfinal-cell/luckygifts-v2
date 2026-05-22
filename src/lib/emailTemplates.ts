const generateTicketNumber = (code: string, index: number) => {
  return `LG-${String(index + 1).padStart(4, '0')}-${code.substring(0, 6).toUpperCase()}`;
};

const formatDate = () => {
  return new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
};

// 1. Order Confirmation Email
export const getLuxuryEmailTemplate = (data: {
  userName: string,
  orderId: string,
  totalAmount: string,
  items: any[],
  tickets: string[],
  paymentMethod?: string
}) => {
  const itemsHtml = data.items.map(item => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #1a1a1a;">
        <span style="color:#fff;font-weight:bold;font-size:14px;">${item.title || item.name}</span><br>
        <span style="color:#555;font-size:11px;">🎫 ${item.tickets || 1} ticket(s)</span>
      </td>
      <td style="padding:12px 0;border-bottom:1px solid #1a1a1a;text-align:right;color:#FFD700;font-weight:bold;">
        $${parseFloat(item.price).toFixed(2)}
      </td>
    </tr>
  `).join('');

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#050505;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellspacing="0" cellpadding="0" style="background:#050505;padding:30px 15px;">
<tr><td align="center">
<table width="580" cellspacing="0" cellpadding="0" style="background:#0a0a0a;border:1px solid #1a1a1a;border-radius:20px;overflow:hidden;">

  <tr><td style="background:#FFD700;height:5px;font-size:0;">&nbsp;</td></tr>

  <tr><td align="center" style="padding:35px 35px 20px;">
    <h1 style="color:#FFD700;font-size:28px;font-weight:900;margin:0;font-style:italic;">LUCKY<span style="color:#fff;">GIFTS</span></h1>
    <div style="width:50px;height:3px;background:#FFD700;margin:12px auto 20px;border-radius:2px;"></div>
    <p style="color:#fff;font-size:20px;font-weight:bold;margin:0 0 8px;">Order Confirmed! 🎉</p>
    <p style="color:#666;font-size:14px;margin:0;">Hello <strong style="color:#FFD700;">${data.userName}</strong>, your entry is confirmed!</p>
  </td></tr>

  <tr><td style="padding:0 35px 20px;">
    <div style="background:#111;border:1px solid #222;border-radius:12px;padding:16px 20px;text-align:center;">
      <p style="color:#555;font-size:10px;text-transform:uppercase;letter-spacing:2px;margin:0 0 6px;">Order Reference</p>
      <p style="color:#FFD700;font-size:20px;font-weight:900;font-family:monospace;margin:0;">#${data.orderId.substring(0, 8).toUpperCase()}</p>
    </div>
  </td></tr>

  <tr><td style="padding:0 35px 20px;">
    <div style="background:#111;border:1px solid #1a1a1a;border-radius:14px;padding:20px;">
      <p style="color:#555;font-size:9px;text-transform:uppercase;letter-spacing:2px;margin:0 0 10px;">Order Summary</p>
      <table width="100%" cellspacing="0" cellpadding="0">
        ${itemsHtml}
        <tr>
          <td style="padding:15px 0 0;color:#fff;font-size:15px;font-weight:bold;">Total Paid</td>
          <td style="padding:15px 0 0;text-align:right;color:#FFD700;font-size:22px;font-weight:900;">$${parseFloat(data.totalAmount).toFixed(2)}</td>
        </tr>
      </table>
    </div>
  </td></tr>

  <tr><td style="padding:0 35px 30px;">
    <div style="background:linear-gradient(135deg,#1a1500,#111);border:1px solid #FFD700;border-radius:14px;padding:22px;text-align:center;">
      <p style="color:#FFD700;font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:3px;margin:0 0 8px;">🏆 Your Draw Entries</p>
      <p style="color:#fff;font-size:44px;font-weight:900;margin:0;">${data.tickets?.length || 0}</p>
      <p style="color:#FFD700;font-size:14px;font-weight:bold;margin:4px 0 12px;">Golden Ticket${(data.tickets?.length || 0) > 1 ? 's' : ''}</p>
      <p style="color:#666;font-size:12px;margin:0;">Check your Ticket Email for your unique ticket numbers 🎫</p>
    </div>
  </td></tr>

  <tr><td align="center" style="padding:0 35px 30px;border-top:1px solid #1a1a1a;">
    <p style="color:#444;font-size:11px;line-height:1.8;margin:20px 0 0;">
      Questions? <a href="mailto:support@getluckygifts.shop" style="color:#FFD700;text-decoration:none;">support@getluckygifts.shop</a><br>
      © 2026 LuckyGifts. All Rights Reserved. Dubai, UAE.
    </p>
  </td></tr>

  <tr><td style="background:#FFD700;height:4px;font-size:0;">&nbsp;</td></tr>

</table>
</td></tr>
</table>
</body></html>`;
};

// 2. Ticket Email (luxury ticket design)
export const getTicketEmailTemplate = (data: {
  userName: string,
  orderId: string,
  totalAmount: string,
  items: any[],
  tickets: string[]
}) => {
  const ticketsHtml = data.tickets.map((code, i) => {
    const ticketNum = generateTicketNumber(code, i);
    const product = data.items[0];
    const prizeName = product?.prize || product?.category || 'Cash Prize';

    return `
    <table width="100%" cellspacing="0" cellpadding="0" style="background:#111;border:1px solid #222;border-radius:16px;overflow:hidden;margin-bottom:16px;">
      <tr><td style="background:#FFD700;height:5px;font-size:0;">&nbsp;</td></tr>
      <tr>
        <td style="padding:20px 24px;">
          <table width="100%" cellspacing="0" cellpadding="0">
            <tr>
              <td style="width:60%;">
                <p style="color:#FFD700;font-size:15px;font-weight:900;margin:0 0 4px;font-style:italic;">LUCKY<span style="color:#fff;">GIFTS</span></p>
                <p style="color:#444;font-size:9px;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 16px;">Official Draw Entry</p>

                <p style="color:#444;font-size:9px;text-transform:uppercase;letter-spacing:2px;margin:0 0 6px;">Ticket Number</p>
                <div style="background:#0a0a0a;border:1px solid #FFD700;border-radius:8px;padding:10px 14px;display:inline-block;margin-bottom:16px;">
                  <p style="color:#FFD700;font-size:18px;font-weight:900;font-family:monospace;letter-spacing:3px;margin:0;">${ticketNum}</p>
                </div>

                <table cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="padding-right:24px;">
                      <p style="color:#444;font-size:9px;text-transform:uppercase;letter-spacing:1px;margin:0 0 3px;">Holder</p>
                      <p style="color:#fff;font-size:12px;font-weight:bold;margin:0;">${data.userName}</p>
                    </td>
                    <td style="padding-right:24px;">
                      <p style="color:#444;font-size:9px;text-transform:uppercase;letter-spacing:1px;margin:0 0 3px;">Issue Date</p>
                      <p style="color:#fff;font-size:12px;font-weight:bold;margin:0;">${formatDate()}</p>
                    </td>
                    <td>
                      <p style="color:#444;font-size:9px;text-transform:uppercase;letter-spacing:1px;margin:0 0 3px;">Draw Date</p>
                      <p style="color:#FFD700;font-size:12px;font-weight:bold;margin:0;">31 Dec 2026</p>
                    </td>
                  </tr>
                  <tr><td colspan="3" style="padding-top:12px;">
                    <p style="color:#444;font-size:9px;text-transform:uppercase;letter-spacing:1px;margin:0 0 3px;">Order Ref</p>
                    <p style="color:#fff;font-size:12px;font-weight:bold;font-family:monospace;margin:0 0 10px;">#${data.orderId.substring(0, 8).toUpperCase()}</p>
                    <span style="background:rgba(255,215,0,0.1);border:1px solid rgba(255,215,0,0.3);color:#FFD700;font-size:10px;font-weight:700;padding:4px 12px;border-radius:20px;text-transform:uppercase;letter-spacing:1px;">${prizeName}</span>
                  </td></tr>
                </table>
              </td>

              <td style="width:1px;border-left:2px dashed #222;padding:0 8px;"></td>

              <td style="width:110px;text-align:center;padding-left:16px;">
                <div style="background:#0a0a0a;border:1px solid #222;border-radius:10px;padding:12px;display:inline-block;margin-bottom:8px;">
                  <table cellspacing="2" cellpadding="0">
                    <tr>
                      <td style="background:#FFD700;width:9px;height:9px;border-radius:2px;"></td>
                      <td style="background:#FFD700;width:9px;height:9px;border-radius:2px;"></td>
                      <td style="background:#222;width:9px;height:9px;"></td>
                      <td style="background:#FFD700;width:9px;height:9px;border-radius:2px;"></td>
                    </tr>
                    <tr>
                      <td style="background:#FFD700;width:9px;height:9px;border-radius:2px;"></td>
                      <td style="background:#222;width:9px;height:9px;"></td>
                      <td style="background:#FFD700;width:9px;height:9px;border-radius:2px;"></td>
                      <td style="background:#FFD700;width:9px;height:9px;border-radius:2px;"></td>
                    </tr>
                    <tr>
                      <td style="background:#222;width:9px;height:9px;"></td>
                      <td style="background:#FFD700;width:9px;height:9px;border-radius:2px;"></td>
                      <td style="background:#222;width:9px;height:9px;"></td>
                      <td style="background:#FFD700;width:9px;height:9px;border-radius:2px;"></td>
                    </tr>
                    <tr>
                      <td style="background:#FFD700;width:9px;height:9px;border-radius:2px;"></td>
                      <td style="background:#FFD700;width:9px;height:9px;border-radius:2px;"></td>
                      <td style="background:#FFD700;width:9px;height:9px;border-radius:2px;"></td>
                      <td style="background:#222;width:9px;height:9px;"></td>
                    </tr>
                  </table>
                </div>
                <p style="color:#444;font-size:9px;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;">Verify Entry</p>
                <div style="background:#FFD700;color:#000;font-size:9px;font-weight:900;padding:4px 10px;border-radius:4px;letter-spacing:1px;">✓ VALID</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr><td style="background:#FFD700;height:3px;font-size:0;">&nbsp;</td></tr>
    </table>`;
  }).join('');

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#050505;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellspacing="0" cellpadding="0" style="background:#050505;padding:30px 15px;">
<tr><td align="center">
<table width="580" cellspacing="0" cellpadding="0" style="background:#0a0a0a;border:1px solid #1a1a1a;border-radius:20px;overflow:hidden;">

  <tr><td style="background:#FFD700;height:5px;font-size:0;">&nbsp;</td></tr>

  <tr><td align="center" style="padding:30px 35px 20px;">
    <h1 style="color:#FFD700;font-size:26px;font-weight:900;margin:0;font-style:italic;">LUCKY<span style="color:#fff;">GIFTS</span></h1>
    <div style="width:50px;height:3px;background:#FFD700;margin:12px auto 18px;border-radius:2px;"></div>
    <p style="color:#fff;font-size:18px;font-weight:bold;margin:0 0 6px;">🎫 Your Golden Tickets</p>
    <p style="color:#666;font-size:13px;margin:0;">Dear <strong style="color:#FFD700;">${data.userName}</strong>, here are your official draw entry tickets</p>
  </td></tr>

  <tr><td style="padding:0 35px 15px;">
    <div style="background:#111;border-left:3px solid #FFD700;border-radius:0 8px 8px 0;padding:12px 16px;">
      <p style="color:#FFD700;font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px;">⚠️ Important — Save This Email</p>
      <p style="color:#666;font-size:12px;margin:0;">These ticket numbers are your official entries into the LuckyGifts prize draw. Keep them safe — you'll need them to claim your prize.</p>
    </div>
  </td></tr>

  <tr><td style="padding:0 35px 20px;">
    ${ticketsHtml}
  </td></tr>

  <tr><td style="padding:0 35px 25px;">
    <div style="background:#111;border:1px solid #222;border-radius:12px;padding:18px;text-align:center;">
      <p style="color:#FFD700;font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:2px;margin:0 0 10px;">Draw Information</p>
      <p style="color:#888;font-size:13px;line-height:1.8;margin:0;">
        🏆 Draw Date: <strong style="color:#fff;">31 December 2026</strong><br>
        📍 Location: <strong style="color:#fff;">Dubai, UAE</strong><br>
        🎯 Winners announced live on LuckyGifts platform
      </p>
    </div>
  </td></tr>

  <tr><td align="center" style="padding:0 35px 30px;border-top:1px solid #1a1a1a;">
    <p style="color:#444;font-size:11px;line-height:1.8;margin:20px 0 0;">
      Good luck! 🍀 Questions? <a href="mailto:support@getluckygifts.shop" style="color:#FFD700;text-decoration:none;">support@getluckygifts.shop</a><br>
      © 2026 LuckyGifts. All Rights Reserved. Dubai, UAE.
    </p>
  </td></tr>

  <tr><td style="background:#FFD700;height:4px;font-size:0;">&nbsp;</td></tr>

</table>
</td></tr>
</table>
</body></html>`;
};

// 3. Admin Notification
export const getAdminNotificationTemplate = (data: {
  userName: string,
  orderId: string,
  totalAmount: string,
  items: any[],
  tickets: string[],
  paymentMethod?: string
}) => {
  const itemsHtml = data.items.map(item => `
    <tr>
      <td style="padding:10px;border-bottom:1px solid #eee;font-size:13px;color:#333;">${item.title || item.name}</td>
      <td style="padding:10px;border-bottom:1px solid #eee;font-size:13px;color:#333;text-align:right;">$${parseFloat(item.price).toFixed(2)}</td>
    </tr>
  `).join('');

  const ticketsHtml = data.tickets.map((code, i) => `
    <span style="display:inline-block;background:#fff8e1;border:1px solid #FFD700;border-radius:6px;padding:4px 10px;margin:3px;font-family:monospace;font-size:12px;color:#333;font-weight:bold;">
      ${generateTicketNumber(code, i)}
    </span>
  `).join('');

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:20px;background:#f5f5f5;font-family:Arial,sans-serif;">
<table width="580" cellspacing="0" cellpadding="0" style="background:#fff;border-radius:12px;overflow:hidden;border:1px solid #ddd;margin:0 auto;">
  <tr><td style="background:#000;padding:20px 25px;">
    <p style="color:#FFD700;font-size:18px;font-weight:900;margin:0;">🛒 New Order — $${parseFloat(data.totalAmount).toFixed(2)}</p>
    <p style="color:#666;font-size:12px;margin:4px 0 0;">LuckyGifts Admin Notification</p>
  </td></tr>
  <tr><td style="padding:20px 25px;">
    <table width="100%" cellspacing="0" cellpadding="0" style="font-size:13px;">
      <tr><td style="color:#666;padding:6px 0;width:40%;">Order ID</td><td style="color:#000;font-weight:bold;font-family:monospace;padding:6px 0;">#${data.orderId.substring(0, 8).toUpperCase()}</td></tr>
      <tr><td style="color:#666;padding:6px 0;">Customer</td><td style="color:#000;font-weight:bold;padding:6px 0;">${data.userName}</td></tr>
      <tr><td style="color:#666;padding:6px 0;">Payment</td><td style="color:#000;font-weight:bold;padding:6px 0;">${(data.paymentMethod || 'unknown').replace('_', ' ').toUpperCase()}</td></tr>
      <tr><td style="color:#666;padding:6px 0;">Amount</td><td style="color:#000;font-size:20px;font-weight:900;padding:6px 0;">$${parseFloat(data.totalAmount).toFixed(2)}</td></tr>
      <tr><td style="color:#666;padding:6px 0;">Tickets</td><td style="color:#000;font-weight:bold;padding:6px 0;">${data.tickets?.length || 0} issued</td></tr>
      <tr><td style="color:#666;padding:6px 0;">Time</td><td style="color:#000;padding:6px 0;">${new Date().toLocaleString('en-US', { timeZone: 'Asia/Dubai' })} (Dubai)</td></tr>
    </table>
  </td></tr>
  <tr><td style="padding:0 25px 15px;">
    <p style="color:#666;font-size:11px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;">Items</p>
    <table width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #eee;border-radius:8px;overflow:hidden;">${itemsHtml}</table>
  </td></tr>
  <tr><td style="padding:0 25px 20px;">
    <p style="color:#666;font-size:11px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;">Tickets Issued</p>
    <div>${ticketsHtml}</div>
  </td></tr>
  <tr><td style="background:#f9f9f9;padding:12px 25px;border-top:1px solid #eee;">
    <a href="https://getluckygifts.shop/admin/orders" style="color:#000;font-size:12px;font-weight:bold;text-decoration:none;">→ View in Admin Panel</a>
  </td></tr>
</table>
</body></html>`;
};
