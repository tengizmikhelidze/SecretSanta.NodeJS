const crypto = require('crypto');
const jwt = require('jsonwebtoken');

/**
 * Generate a random token
 * @param {number} length - Token length
 * @returns {string} - Random token
 */
const generateToken = (length = 64) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Generate JWT token
 * @param {object} payload - Token payload
 * @param {string} expiresIn - Expiration time
 * @returns {string} - JWT token
 */
const generateJWT = (payload, expiresIn = process.env.JWT_EXPIRE) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @returns {object} - Decoded token
 */
const verifyJWT = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

/**
 * Generate UUID v4
 * @returns {string} - UUID
 */
const generateUUID = () => {
  return crypto.randomUUID();
};

/**
 * Hash password with bcrypt
 * @param {string} password - Plain password
 * @returns {Promise<string>} - Hashed password
 */
const hashPassword = async (password) => {
  const bcrypt = require('bcrypt');
  return await bcrypt.hash(password, 12);
};

/**
 * Compare password with hash
 * @param {string} password - Plain password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>} - Match result
 */
const comparePassword = async (password, hash) => {
  const bcrypt = require('bcrypt');
  return await bcrypt.compare(password, hash);
};

/**
 * Generate expiration timestamp
 * @param {number} hours - Hours from now
 * @returns {Date} - Expiration date
 */
const generateExpiration = (hours = 24) => {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
};

/**
 * Check if token is expired
 * @param {Date} expirationDate - Expiration date
 * @returns {boolean} - Is expired
 */
const isExpired = (expirationDate) => {
  return new Date() > new Date(expirationDate);
};

/**
 * Sanitize email
 * @param {string} email - Email address
 * @returns {string} - Sanitized email
 */
const sanitizeEmail = (email) => {
  return email.toLowerCase().trim();
};

/**
 * Generate random access token
 * @returns {string} - Access token
 */
const generateAccessToken = () => {
  return generateToken(parseInt(process.env.ACCESS_TOKEN_LENGTH) || 32);
};

module.exports = {
  generateToken,
  generateJWT,
  verifyJWT,
  generateUUID,
  hashPassword,
  comparePassword,
  generateExpiration,
  isExpired,
  sanitizeEmail,
  generateAccessToken
};

