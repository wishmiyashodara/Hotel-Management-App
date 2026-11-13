const nodemailer = require('nodemailer');

// Configure the email transporter
// You can update these with your real SMTP details (Gmail, SendGrid, etc.)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
});

/**
 * Send a professional HTML email
 */
const sendEmail = async (to, subject, title, body, bookingDetails = null) => {
  try {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1C1C1E; line-height: 1.6; margin: 0; padding: 0; background-color: #f4f4f7; }
          .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 15px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
          .header { background: #1C1C1E; padding: 40px; text-align: center; color: #ffffff; }
          .logo { width: 80px; margin-bottom: 20px; }
          .content { padding: 40px; }
          .title { font-size: 24px; font-weight: 800; margin-bottom: 20px; color: #1C1C1E; }
          .body { font-size: 16px; margin-bottom: 30px; color: #48484A; }
          .details-box { background: #f8f8fa; padding: 25px; border-radius: 12px; border: 1px solid #eee; margin-bottom: 30px; }
          .detail-row { display: flex; justify-content: space-between; margin-bottom: 10px; border-bottom: 1px solid #efeff4; padding-bottom: 10px; }
          .detail-label { font-weight: 700; color: #8E8E93; font-size: 13px; text-transform: uppercase; }
          .detail-val { font-weight: 800; color: #1C1C1E; }
          .footer { background: #f8f8fa; padding: 30px; text-align: center; color: #8E8E93; font-size: 12px; }
          .btn { display: inline-block; padding: 15px 35px; background-color: #FF385C; color: #ffffff !important; text-decoration: none; border-radius: 10px; font-weight: 800; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin:0; letter-spacing: 2px;">COCONUT REPUBLIK</h1>
          </div>
          <div class="content">
            <div class="title">${title}</div>
            <div class="body">${body}</div>
            
            ${bookingDetails ? `
              <div class="details-box">
                <div class="detail-row">
                  <span class="detail-label">Reservation ID</span>
                  <span class="detail-val">${bookingDetails._id.toString().slice(-6).toUpperCase()}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Guest</span>
                  <span class="detail-val">${bookingDetails.customerName}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Check In</span>
                  <span class="detail-val">${new Date(bookingDetails.checkInDate).toLocaleDateString()}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Check Out</span>
                  <span class="detail-val">${new Date(bookingDetails.checkOutDate).toLocaleDateString()}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Total Amount</span>
                  <span class="detail-val">$${bookingDetails.totalAmount}</span>
                </div>
              </div>
            ` : ''}

            <a href="#" class="btn">View Reservation</a>
          </div>
          <div class="footer">
            <p>© 2026 Coconut Republik Villa & Restaurant. All rights reserved.</p>
            <p>Ahangama, Sri Lanka • luxury@coconutrepublik.com</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"Coconut Republik" <${process.env.EMAIL_USER || 'your-email@gmail.com'}>`,
      to,
      subject,
      html: htmlContent
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${to}`);
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
};

module.exports = { sendEmail };
