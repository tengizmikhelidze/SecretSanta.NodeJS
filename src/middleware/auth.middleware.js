const passport = require('passport');
const { UnauthorizedError } = require('../utils/errors');

/**
 * Protect routes - require JWT authentication
 */
const protect = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      return next(new UnauthorizedError('Not authorized to access this route'));
    }

    req.user = user;
    next();
  })(req, res, next);
};

/**
 * Check if user is verified
 */
const requireEmailVerification = (req, res, next) => {
  if (!req.user.is_email_verified) {
    return next(new UnauthorizedError('Please verify your email to access this resource'));
  }
  next();
};

/**
 * Authorize based on user roles or conditions
 */
const authorize = (...conditions) => {
  return (req, res, next) => {
    // Custom authorization logic can be added here
    // For now, just check if user exists
    if (!req.user) {
      return next(new UnauthorizedError('Not authorized to access this route'));
    }
    next();
  };
};

module.exports = {
  protect,
  requireEmailVerification,
  authorize
};

