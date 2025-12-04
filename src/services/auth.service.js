const userRepository = require('../repositories/user.repository');
const {
  hashPassword,
  comparePassword,
  generateJWT,
  generateToken,
  generateExpiration,
  sanitizeEmail
} = require('../utils/helpers');
const {
  ValidationError,
  UnauthorizedError,
  NotFoundError,
  ConflictError
} = require('../utils/errors');
const emailService = require('./email.service');
const logger = require('../utils/logger');

class AuthService {
  /**
   * Register new user with email and password
   */
  async register(userData) {
    const { email, password, fullName } = userData;
    const sanitized = sanitizeEmail(email);

    // Check if user already exists
    const existingUser = await userRepository.findByEmail(sanitized);
    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await userRepository.create({
      email: sanitized,
      passwordHash,
      fullName
    });

    // Generate email verification token
    const verificationToken = generateToken();
    const expiresAt = generateExpiration(24); // 24 hours

    await userRepository.setEmailVerificationToken(user.id, verificationToken, expiresAt);

    // Send verification email
    try {
      await emailService.sendVerificationEmail(user.email, verificationToken, user.full_name);
    } catch (error) {
      logger.error('Failed to send verification email:', error);
      // Don't throw error, user is still created
    }

    // Generate JWT token
    const token = generateJWT({ id: user.id, email: user.email });

    return {
      user: this.sanitizeUser(user),
      token
    };
  }

  /**
   * Login user with email and password
   */
  async login(credentials) {
    const { email, password } = credentials;
    const sanitized = sanitizeEmail(email);

    // Find user by email
    const user = await userRepository.findByEmail(sanitized);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Check if user has password (not OAuth only)
    if (!user.password_hash) {
      throw new UnauthorizedError('Please login with Google or reset your password');
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Update last login
    await userRepository.updateLastLogin(user.id);

    // Generate JWT token
    const token = generateJWT({ id: user.id, email: user.email });

    return {
      user: this.sanitizeUser(user),
      token
    };
  }

  /**
   * Login or register with Google
   */
  async googleAuth(googleUser) {
    // User is already created/found in passport strategy
    // Update last login
    await userRepository.updateLastLogin(googleUser.id);

    // Generate JWT token
    const token = generateJWT({ id: googleUser.id, email: googleUser.email });

    return {
      user: this.sanitizeUser(googleUser),
      token
    };
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token) {
    const user = await userRepository.findByEmailVerificationToken(token);
    if (!user) {
      throw new ValidationError('Invalid or expired verification token');
    }

    await userRepository.verifyEmail(user.id);

    return {
      message: 'Email verified successfully'
    };
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.is_email_verified) {
      throw new ValidationError('Email is already verified');
    }

    // Generate new token
    const verificationToken = generateToken();
    const expiresAt = generateExpiration(24);

    await userRepository.setEmailVerificationToken(user.id, verificationToken, expiresAt);

    // Send verification email
    await emailService.sendVerificationEmail(user.email, verificationToken, user.full_name);

    return {
      message: 'Verification email sent'
    };
  }

  /**
   * Request password reset
   */
  async forgotPassword(email) {
    const sanitized = sanitizeEmail(email);
    const user = await userRepository.findByEmail(sanitized);

    // Don't reveal if user exists or not
    if (!user) {
      return {
        message: 'If the email exists, a password reset link has been sent'
      };
    }

    // Generate reset token
    const resetToken = generateToken();
    const expiresAt = generateExpiration(1); // 1 hour

    await userRepository.setPasswordResetToken(user.id, resetToken, expiresAt);

    // Send reset email
    try {
      await emailService.sendPasswordResetEmail(user.email, resetToken, user.full_name);
    } catch (error) {
      logger.error('Failed to send password reset email:', error);
    }

    return {
      message: 'If the email exists, a password reset link has been sent'
    };
  }

  /**
   * Reset password with token
   */
  async resetPassword(token, newPassword) {
    const user = await userRepository.findByPasswordResetToken(token);
    if (!user) {
      throw new ValidationError('Invalid or expired reset token');
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update password and clear reset token
    await userRepository.updatePassword(user.id, passwordHash);
    await userRepository.clearPasswordResetToken(user.id);

    return {
      message: 'Password reset successfully'
    };
  }

  /**
   * Change password (authenticated user)
   */
  async changePassword(userId, oldPassword, newPassword) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (!user.password_hash) {
      throw new ValidationError('Cannot change password for OAuth-only accounts');
    }

    // Verify old password
    const isPasswordValid = await comparePassword(oldPassword, user.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update password
    await userRepository.updatePassword(user.id, passwordHash);

    return {
      message: 'Password changed successfully'
    };
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    return this.sanitizeUser(user);
  }

  /**
   * Remove sensitive data from user object
   */
  sanitizeUser(user) {
    const { password_hash, email_verification_token, password_reset_token, ...sanitized } = user;
    return sanitized;
  }
}

module.exports = new AuthService();

