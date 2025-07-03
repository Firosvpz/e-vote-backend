import dotenv from "dotenv";
import nodemailer from "nodemailer";
dotenv.config();

export const sendStatusUpdateEmail = async (
  toEmail,
  status,
  planName,
  userName,
) => {
  try {
    console.log(
      `Sending ${status} email to ${toEmail} for plan: ${planName}, user: ${userName}`,
    );

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const subjectMap = {
      confirmed: "🎉 Your Booking is Confirmed!",
      pending: "⏳ Your Booking is Under Review",
      cancelled: "❌ Your Booking was Cancelled",
      completed: "✅ Booking Completed Successfully",
    };

    // Modern HTML Email Template
    const getModernEmailHTML = (status, userName, planName) => {
      const statusConfig = {
        confirmed: { color: "#10B981", bgColor: "#ECFDF5", icon: "✅" },
        pending: { color: "#F59E0B", bgColor: "#FFFBEB", icon: "⏳" },
        cancelled: { color: "#EF4444", bgColor: "#FEF2F2", icon: "❌" },
        completed: { color: "#8B5CF6", bgColor: "#F3E8FF", icon: "🎉" },
      };

      const config = statusConfig[status] || statusConfig.pending;

      const messages = {
        confirmed: `Great news! Your booking for the <strong>"${planName}"</strong> plan has been <span style="color: ${config.color}; font-weight: bold;">confirmed</span>! You now have full access to all plan benefits.`,
        pending: `Your booking for the <strong>"${planName}"</strong> plan is currently <span style="color: ${config.color}; font-weight: bold;">under review</span>. We'll notify you once processed (typically 1-2 business days).`,
        cancelled: `Your booking for the <strong>"${planName}"</strong> plan has been <span style="color: ${config.color}; font-weight: bold;">cancelled</span>. You can rebook anytime if needed.`,
        completed: `Your booking for the <strong>"${planName}"</strong> plan has been <span style="color: ${config.color}; font-weight: bold;">completed</span>! Thank you for choosing our service.`,
      };

      return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Booking Status Update</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 20px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); max-width: 600px;">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; margin: 0 0 8px 0;">Booking Update</h1>
                            <p style="color: #ffffff; font-size: 16px; margin: 0; opacity: 0.9;">Your booking status has been updated</p>
                        </td>
                    </tr>
                    
                    <!-- Status Banner -->
                    <tr>
                        <td style="padding: 0 30px;">
                            <div style="background-color: ${config.bgColor}; border-left: 4px solid ${config.color}; padding: 20px; margin: 30px 0; border-radius: 8px;">
                                <table width="100%" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td width="50" style="vertical-align: top;">
                                            <div style="font-size: 32px; line-height: 1;">${config.icon}</div>
                                        </td>
                                        <td style="vertical-align: top;">
                                            <h2 style="color: ${config.color}; font-size: 24px; font-weight: 700; margin: 0 0 5px 0;">${status.charAt(0).toUpperCase() + status.slice(1)}</h2>
                                            <p style="color: #6B7280; font-size: 16px; margin: 0;">Status updated successfully</p>
                                        </td>
                                    </tr>
                                </table>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Main Content -->
                    <tr>
                        <td style="padding: 0 30px 30px;">
                            <div style="font-size: 18px; font-weight: 600; color: #111827; margin-bottom: 20px;">Hello ${userName},</div>
                            
                            <!-- Plan Details -->
                            <div style="background-color: #F8FAFC; border: 1px solid #E5E7EB; border-radius: 8px; padding: 20px; margin: 25px 0;">
                                <h3 style="color: #111827; font-size: 16px; font-weight: 600; margin: 0 0 10px 0;">Plan Details</h3>
                                <div style="color: ${config.color}; font-weight: 700; font-size: 18px;">${planName}</div>
                            </div>
                            
                            <!-- Message -->
                            <div style="font-size: 16px; line-height: 1.6; color: #4B5563; margin: 25px 0;">
                                ${messages[status] || "Your booking status has been updated."}
                            </div>
                            
                            <!-- CTA Button -->
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="#" style="display: inline-block; background: ${config.color}; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                                    ${status === "confirmed" ? "Access Your Plan" : status === "pending" ? "Check Status" : status === "cancelled" ? "Book Again" : "View Details"}
                                </a>
                            </div>
                            
                            <!-- Divider -->
                            <div style="height: 1px; background: linear-gradient(to right, transparent, #E5E7EB, transparent); margin: 30px 0;"></div>
                            
                            <p style="color: #6B7280; font-size: 14px; margin: 0;">
                                If you have any questions or need assistance, please don't hesitate to reach out to our support team.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #F9FAFB; padding: 30px; text-align: center; border-top: 1px solid #E5E7EB;">
                            <p style="color: #111827; font-weight: 600; font-size: 16px; margin: 0 0 15px 0;">Thank you for choosing our service!</p>
                            <p style="color: #6B7280; font-size: 14px; margin: 0 0 20px 0;">This email was sent regarding your booking status update.</p>
                            
                            <div style="margin: 20px 0;">
                                <a href="#" style="color: #9CA3AF; text-decoration: none; font-size: 14px; margin: 0 10px;">Help Center</a>
                                <span style="color: #9CA3AF;">|</span>
                                <a href="#" style="color: #9CA3AF; text-decoration: none; font-size: 14px; margin: 0 10px;">Contact Support</a>
                                <span style="color: #9CA3AF;">|</span>
                                <a href="#" style="color: #9CA3AF; text-decoration: none; font-size: 14px; margin: 0 10px;">Privacy Policy</a>
                            </div>
                            
                            <p style="font-size: 12px; color: #9CA3AF; margin: 20px 0 0 0;">
                                © 2024 Your Company Name. All rights reserved.<br>
                                You're receiving this email because you have an active booking with us.
                            </p>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
    };

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: toEmail,
      subject: subjectMap[status] || "Booking Status Updated",
      html: getModernEmailHTML(status, userName, planName),
    };

    await transporter.sendMail(mailOptions);
    console.log(`Modern ${status} email sent successfully to ${toEmail}`);
  } catch (error) {
    console.error("Email send error:", error.message);
  }
};
