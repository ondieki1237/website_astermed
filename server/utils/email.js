import nodemailer from 'nodemailer';

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Send quote request notification email
export const sendQuoteNotification = async (quoteData) => {
  try {
    const transporter = createTransporter();
    
    const { customer, items, orderNumber } = quoteData;
    
    // Format items list for email
    const itemsList = items.map((item, index) => 
      `${index + 1}. ${item.name} - Quantity: ${item.quantity}`
    ).join('\n');

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: process.env.QUOTE_NOTIFICATION_EMAIL || 'info@astermedsupplies.co.ke',
      subject: `New Quote Request - ${orderNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #d0dc36 0%, #c5d030 100%); padding: 20px; text-align: center;">
            <h1 style="color: #333; margin: 0;">New Quote Request</h1>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; border-bottom: 2px solid #d0dc36; padding-bottom: 10px;">
              Quote #${orderNumber}
            </h2>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #e53935; margin-top: 0;">Customer Information</h3>
              <p><strong>Name:</strong> ${customer.name}</p>
              <p><strong>Email:</strong> ${customer.email}</p>
              <p><strong>Phone:</strong> ${customer.phone}</p>
              ${customer.role ? `<p><strong>Role/Position:</strong> ${customer.role}</p>` : ''}
              ${customer.facility ? `<p><strong>Facility:</strong> ${customer.facility}</p>` : ''}
              ${customer.county ? `<p><strong>County:</strong> ${customer.county}</p>` : ''}
              ${customer.location ? `<p><strong>Location:</strong> ${customer.location}</p>` : ''}
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #e53935; margin-top: 0;">Requested Items</h3>
              <div style="white-space: pre-line; font-family: monospace; background: #f5f5f5; padding: 15px; border-radius: 4px;">
${itemsList}
              </div>
              <p style="margin-top: 15px;"><strong>Total Items:</strong> ${items.length}</p>
            </div>
            
            <div style="background: #e8f5e9; padding: 15px; border-radius: 8px; border-left: 4px solid #4caf50;">
              <p style="margin: 0; color: #2e7d32;">
                <strong>Action Required:</strong> Please review this quote request and respond to the customer within 24 hours.
              </p>
            </div>
          </div>
          
          <div style="background: #333; color: #fff; padding: 20px; text-align: center; font-size: 12px;">
            <p style="margin: 0;">AsterMed Supplies Ltd</p>
            <p style="margin: 5px 0;">info@astermedsupplies.co.ke | +254 746 999 725</p>
            <p style="margin: 5px 0; opacity: 0.7;">This is an automated notification from your quote request system.</p>
          </div>
        </div>
      `,
      text: `
New Quote Request - ${orderNumber}

Customer Information:
Name: ${customer.name}
Email: ${customer.email}
Phone: ${customer.phone}
${customer.role ? `Role: ${customer.role}\n` : ''}${customer.facility ? `Facility: ${customer.facility}\n` : ''}${customer.county ? `County: ${customer.county}\n` : ''}${customer.location ? `Location: ${customer.location}\n` : ''}

Requested Items:
${itemsList}

Total Items: ${items.length}

Action Required: Please review this quote request and respond to the customer within 24 hours.

---
AsterMed Supplies Ltd
info@astermedsupplies.co.ke | +254 746 999 725
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Quote notification email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending quote notification email:', error);
    return { success: false, error: error.message };
  }
};

// Send confirmation email to customer
export const sendQuoteConfirmationToCustomer = async (quoteData) => {
  try {
    const transporter = createTransporter();
    
    const { customer, items, orderNumber } = quoteData;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: customer.email,
      subject: `Quote Request Received - ${orderNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #d0dc36 0%, #c5d030 100%); padding: 20px; text-align: center;">
            <h1 style="color: #333; margin: 0;">Quote Request Received</h1>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <p style="font-size: 16px; color: #333;">Dear ${customer.name},</p>
            
            <p style="color: #555; line-height: 1.6;">
              Thank you for your interest in AsterMed Supplies! We have received your quote request (${orderNumber}) 
              for ${items.length} item(s).
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #d0dc36;">
              <h3 style="color: #e53935; margin-top: 0;">What's Next?</h3>
              <ul style="color: #555; line-height: 1.8;">
                <li>Our team will review your request</li>
                <li>You'll receive a detailed quote within 24 hours</li>
                <li>We'll contact you to discuss delivery and payment options</li>
              </ul>
            </div>
            
            <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #1565c0;">
                <strong>Need immediate assistance?</strong><br>
                Call us at +254 746 999 725 or email info@astermedsupplies.co.ke
              </p>
            </div>
            
            <p style="color: #555;">Best regards,<br><strong>AsterMed Supplies Team</strong></p>
          </div>
          
          <div style="background: #333; color: #fff; padding: 20px; text-align: center; font-size: 12px;">
            <p style="margin: 0;">AsterMed Supplies Ltd</p>
            <p style="margin: 5px 0;">info@astermedsupplies.co.ke | +254 746 999 725</p>
            <div style="margin-top: 15px;">
              <a href="https://facebook.com/astermedKe" style="color: #d0dc36; margin: 0 10px; text-decoration: none;">Facebook</a>
              <a href="https://twitter.com/astermedKe" style="color: #d0dc36; margin: 0 10px; text-decoration: none;">Twitter</a>
              <a href="https://linkedin.com/company/astermedKe" style="color: #d0dc36; margin: 0 10px; text-decoration: none;">LinkedIn</a>
            </div>
          </div>
        </div>
      `,
      text: `
Dear ${customer.name},

Thank you for your interest in AsterMed Supplies! We have received your quote request (${orderNumber}) for ${items.length} item(s).

What's Next?
- Our team will review your request
- You'll receive a detailed quote within 24 hours
- We'll contact you to discuss delivery and payment options

Need immediate assistance?
Call us at +254 746 999 725 or email info@astermedsupplies.co.ke

Best regards,
AsterMed Supplies Team

---
AsterMed Supplies Ltd
info@astermedsupplies.co.ke | +254 746 999 725
Follow us: @astermedKe
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Customer confirmation email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending customer confirmation email:', error);
    return { success: false, error: error.message };
  }
};
