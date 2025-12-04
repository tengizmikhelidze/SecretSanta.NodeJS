const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  /**
   * Send verification email
   */
  async sendVerificationEmail(to, token, fullName) {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject: 'Verify Your Email - Secret Santa',
      html: this.getVerificationEmailTemplate(verificationUrl, fullName)
    };

    try {
      await this.transporter.sendMail(mailOptions);
      logger.info(`Verification email sent to ${to}`);
    } catch (error) {
      logger.error('Error sending verification email:', error);
      throw error;
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(to, token, fullName) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject: 'Reset Your Password - Secret Santa',
      html: this.getPasswordResetTemplate(resetUrl, fullName)
    };

    try {
      await this.transporter.sendMail(mailOptions);
      logger.info(`Password reset email sent to ${to}`);
    } catch (error) {
      logger.error('Error sending password reset email:', error);
      throw error;
    }
  }

  /**
   * Send party invitation email
   */
  async sendPartyInvitationEmail(to, participantName, hostName, partyDetails, accessToken) {
    const partyUrl = `${process.env.FRONTEND_URL}/party/${partyDetails.partyId}?token=${accessToken}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject: `You're Invited to ${hostName}'s Secret Santa! 🎅`,
      html: this.getPartyInvitationTemplate(participantName, hostName, partyDetails, partyUrl)
    };

    try {
      await this.transporter.sendMail(mailOptions);
      logger.info(`Party invitation sent to ${to}`);
    } catch (error) {
      logger.error('Error sending party invitation:', error);
      throw error;
    }
  }

  /**
   * Send Secret Santa assignment email
   */
  async sendAssignmentEmail(to, giverName, receiverName, receiverWishlist, partyDetails, accessToken) {
    const partyUrl = `${process.env.FRONTEND_URL}/party/${partyDetails.partyId}?token=${accessToken}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject: `Your Secret Santa Assignment 🎁`,
      html: this.getAssignmentTemplate(giverName, receiverName, receiverWishlist, partyDetails, partyUrl)
    };

    try {
      await this.transporter.sendMail(mailOptions);
      logger.info(`Assignment email sent to ${to}`);
    } catch (error) {
      logger.error('Error sending assignment email:', error);
      throw error;
    }
  }

  /**
   * Send party update notification
   */
  async sendPartyUpdateEmail(to, participantName, updateMessage, partyDetails, accessToken) {
    const partyUrl = `${process.env.FRONTEND_URL}/party/${partyDetails.partyId}?token=${accessToken}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject: `Secret Santa Party Update`,
      html: this.getPartyUpdateTemplate(participantName, updateMessage, partyDetails, partyUrl)
    };

    try {
      await this.transporter.sendMail(mailOptions);
      logger.info(`Party update email sent to ${to}`);
    } catch (error) {
      logger.error('Error sending party update email:', error);
      throw error;
    }
  }

  /**
   * Email templates
   */
  getVerificationEmailTemplate(verificationUrl, fullName) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .button { display: inline-block; padding: 12px 24px; background-color: #dc3545; 
                    color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; 
                    font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Welcome to Secret Santa! 🎅</h2>
          <p>Hi ${fullName || 'there'},</p>
          <p>Thank you for registering! Please verify your email address by clicking the button below:</p>
          <a href="${verificationUrl}" class="button">Verify Email</a>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all;">${verificationUrl}</p>
          <p>This link will expire in 24 hours.</p>
          <div class="footer">
            <p>If you didn't create this account, please ignore this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getPasswordResetTemplate(resetUrl, fullName) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .button { display: inline-block; padding: 12px 24px; background-color: #dc3545; 
                    color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; 
                    font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Password Reset Request</h2>
          <p>Hi ${fullName || 'there'},</p>
          <p>We received a request to reset your password. Click the button below to set a new password:</p>
          <a href="${resetUrl}" class="button">Reset Password</a>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all;">${resetUrl}</p>
          <p>This link will expire in 1 hour.</p>
          <div class="footer">
            <p>If you didn't request this, please ignore this email. Your password will remain unchanged.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getPartyInvitationTemplate(participantName, hostName, partyDetails, partyUrl) {
    const { partyDate, location, maxAmount, personalMessage } = partyDetails;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                    color: white; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 24px; background-color: #dc3545; 
                    color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .details { background: white; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; 
                    font-size: 12px; color: #666; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎅 Secret Santa Invitation 🎄</h1>
          </div>
          <div class="content">
            <p>Ho ho ho, ${participantName}!</p>
            <p><strong>${hostName}</strong> has invited you to join their Secret Santa party!</p>
            
            ${personalMessage ? `<div class="details"><p><em>"${personalMessage}"</em></p></div>` : ''}
            
            <div class="details">
              <h3>Party Details:</h3>
              ${partyDate ? `<p><strong>Date:</strong> ${new Date(partyDate).toLocaleDateString()}</p>` : ''}
              ${location ? `<p><strong>Location:</strong> ${location}</p>` : ''}
              ${maxAmount ? `<p><strong>Budget:</strong> $${maxAmount}</p>` : ''}
            </div>
            
            <p>Click the button below to join the party and add your wishlist:</p>
            <center><a href="${partyUrl}" class="button">Join Secret Santa 🎁</a></center>
            
            <div class="footer">
              <p>Keep this link safe! You'll need it to access your Secret Santa assignment.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getAssignmentTemplate(giverName, receiverName, receiverWishlist, partyDetails, partyUrl) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; padding: 20px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); 
                    color: white; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .assignment { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; 
                        border-left: 4px solid #dc3545; }
          .button { display: inline-block; padding: 12px 24px; background-color: #28a745; 
                    color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; 
                    font-size: 12px; color: #666; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎁 Your Secret Santa Assignment 🎁</h1>
          </div>
          <div class="content">
            <p>Hi ${giverName}!</p>
            <p>The Secret Santa assignments are in! 🎉</p>
            
            <div class="assignment">
              <h2>You're Secret Santa for: <strong>${receiverName}</strong></h2>
              ${receiverWishlist ? `
                <h3>Their Wishlist:</h3>
                <p style="white-space: pre-wrap;">${receiverWishlist}</p>
              ` : '<p><em>They haven\'t added a wishlist yet. Check back later!</em></p>'}
            </div>
            
            <p><strong>Remember:</strong> Keep it secret! Don't tell ${receiverName} or anyone else who you're buying for! 🤫</p>
            
            <center><a href="${partyUrl}" class="button">View Full Details</a></center>
            
            <div class="footer">
              <p>Happy gifting! 🎅</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getPartyUpdateTemplate(participantName, updateMessage, partyDetails, partyUrl) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .button { display: inline-block; padding: 12px 24px; background-color: #007bff; 
                    color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .update { background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; 
                    border-left: 4px solid #ffc107; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Secret Santa Party Update 🎄</h2>
          <p>Hi ${participantName},</p>
          <div class="update">
            <p>${updateMessage}</p>
          </div>
          <center><a href="${partyUrl}" class="button">View Party Details</a></center>
        </div>
      </body>
      </html>
    `;
  }
}

module.exports = new EmailService();

