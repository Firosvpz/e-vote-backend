import dotenv from "dotenv";
import nodemailer from "nodemailer";
dotenv.config();

export const sendVotingConfirmationEmail = async (
  toEmail,
  voteDetails,
  userName,
) => {
  try {
    console.log(
      `Sending voting confirmation email to ${toEmail} for vote: ${voteDetails.title}, user: ${userName}`,
    );

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Modern HTML Email Template for Voting Confirmation
    const getVotingEmailHTML = (userName, voteDetails) => {
      return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Voting Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 20px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); max-width: 600px;">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; margin: 0 0 8px 0;">Voting Confirmation : ${voteDetails.title}</h1>
                            <p style="color: #ffffff; font-size: 16px; margin: 0; opacity: 0.9;">Thank you for participating in our democratic process</p>
                        </td>
                    </tr>
                    
                    <!-- Status Banner -->
                    <tr>
                        <td style="padding: 0 30px;">
                            <div style="background-color: #ECFDF5; border-left: 4px solid #10B981; padding: 20px; margin: 30px 0; border-radius: 8px;">
                                <table width="100%" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td width="50" style="vertical-align: top;">
                                            <div style="font-size: 32px; line-height: 1;">✅</div>
                                        </td>
                                        <td style="vertical-align: top;">
                                            <h2 style="color: #10B981; font-size: 24px; font-weight: 700; margin: 0 0 5px 0;">Vote Recorded</h2>
                                            <p style="color: #6B7280; font-size: 16px; margin: 0;">Your vote has been successfully submitted</p>
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
                            
                            <!-- Vote Details -->
                            <div style="background-color: #F8FAFC; border: 1px solid #E5E7EB; border-radius: 8px; padding: 20px; margin: 25px 0;">
                                <h3 style="color: #111827; font-size: 16px; font-weight: 600; margin: 0 0 10px 0;">Your Voting Details</h3>
                                <div style="margin-bottom: 15px;">
                                    <p style="color: #4B5563; font-size: 14px; margin: 0 0 5px 0;">Election/Referendum:</p>
                                    <div style="color: #4F46E5; font-weight: 700; font-size: 18px;">${voteDetails.title}</div>
                                </div>
                                <div style="margin-bottom: 15px;">
                                    <p style="color: #4B5563; font-size: 14px; margin: 0 0 5px 0;">Date of Voting:</p>
                                    <div style="color: #111827; font-weight: 600; font-size: 16px;">${voteDetails.voteDate}</div>
                                </div>
                                <div>
                                    <p style="color: #4B5563; font-size: 14px; margin: 0 0 5px 0;">Your Selection:</p>
                                    <div style="color: #111827; font-weight: 600; font-size: 16px;">${voteDetails.selectedOption}</div>
                                </div>
                            </div>
                            
                            <!-- Message -->
                            <div style="font-size: 16px; line-height: 1.6; color: #4B5563; margin: 25px 0;">
                                <p>Thank you for exercising your democratic right. Your participation helps shape our collective future.</p>
                                <p>This email serves as confirmation that your vote has been successfully recorded in our system.</p>
                            </div>
                            
                            <!-- Receipt ID -->
                            <div style="background-color: #F3F4F6; padding: 15px; border-radius: 8px; text-align: center; margin: 30px 0;">
                                <p style="color: #4B5563; font-size: 14px; margin: 0 0 5px 0;">Your voting receipt ID:</p>
                                <p style="color: #111827; font-weight: 700; font-size: 18px; letter-spacing: 1px; margin: 0;">${voteDetails.receiptId}</p>
                            </div>
                            
                            <!-- Important Note -->
                            <div style="border-left: 4px solid #F59E0B; background-color: #FFFBEB; padding: 15px; border-radius: 8px; margin: 30px 0;">
                                <h3 style="color: #92400E; font-size: 16px; margin: 0 0 10px 0;">Important Note</h3>
                                <p style="color: #92400E; font-size: 14px; margin: 0;">
                                    For security reasons, we cannot display your full voting details in this email. 
                                    This receipt confirms your participation but does not serve as proof of how you voted.
                                </p>
                            </div>
                            
                            <!-- Divider -->
                            <div style="height: 1px; background: linear-gradient(to right, transparent, #E5E7EB, transparent); margin: 30px 0;"></div>
                            
                            <p style="color: #6B7280; font-size: 14px; margin: 0;">
                                If you did not participate in this voting process or believe this email was sent in error, 
                                please contact our support team immediately.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #F9FAFB; padding: 30px; text-align: center; border-top: 1px solid #E5E7EB;">
                            <p style="color: #111827; font-weight: 600; font-size: 16px; margin: 0 0 15px 0;">Thank you for your participation!</p>
                            <p style="color: #6B7280; font-size: 14px; margin: 0 0 20px 0;">This email confirms your voting activity.</p>
                            
                            <div style="margin: 20px 0;">
                                <a href="#" style="color: #9CA3AF; text-decoration: none; font-size: 14px; margin: 0 10px;">Voting Guidelines</a>
                                <span style="color: #9CA3AF;">|</span>
                                <a href="#" style="color: #9CA3AF; text-decoration: none; font-size: 14px; margin: 0 10px;">Election Results</a>
                                <span style="color: #9CA3AF;">|</span>
                                <a href="#" style="color: #9CA3AF; text-decoration: none; font-size: 14px; margin: 0 10px;">Contact Election Commission</a>
                            </div>
                            
                            <p style="font-size: 12px; color: #9CA3AF; margin: 20px 0 0 0;">
                                © ${new Date().getFullYear()} Election Commission. All rights reserved.<br>
                                This is an automated message - please do not reply to this email.
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
      subject: `Voting Confirmation: ${voteDetails.title}`,
      html: getVotingEmailHTML(userName, voteDetails),
    };

    await transporter.sendMail(mailOptions);
    console.log(`Voting confirmation email sent successfully to ${toEmail}`);
  } catch (error) {
    console.error("Email send error:", error.message);
  }
};