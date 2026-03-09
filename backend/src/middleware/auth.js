const jwt = require('jsonwebtoken');
const store = require('../data/memoryStore');

/**
 * Protect routes — require valid JWT from admin
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access denied. No token provided.',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'govai_secret');
    const admin = store.getAdminById(decoded.id);

    if (!admin || !admin.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Admin not found or account deactivated.',
      });
    }

    // Attach admin without password
    const { passwordHash, ...safeAdmin } = admin;
    req.admin = safeAdmin;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Generate JWT token for admin
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'govai_secret', {
    expiresIn: '7d',
  });
};

module.exports = { protect, generateToken };
