const jwt = require('jsonwebtoken');
const store = require('../data/memoryStore');

/**
 * Protect routes — require valid JWT (either Admin or User)
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

    if (global.useMemoryStore) {
      // ── In-Memory Lookup ──────────────────────────────────────────
      const admin = store.getAdminById(decoded.id);
      if (admin && admin.isActive) {
        const { passwordHash, ...safeAdmin } = admin;
        req.admin = safeAdmin;
        req.user = { id: admin._id, username: admin.username, role: 'admin' };
        return next();
      }

      const user = store.getUserById ? store.getUserById(decoded.id) : null;
      if (user) {
        req.user = user;
        return next();
      }
    } else {
      // ── MongoDB Lookup ────────────────────────────────────────────
      const Admin = require('../models/Admin');
      const User = require('../models/User');

      const admin = await Admin.findById(decoded.id);
      if (admin && admin.isActive) {
        req.admin = admin.toObject();
        req.user = { id: admin._id, username: admin.username, role: 'admin' };
        return next();
      }

      const user = await User.findById(decoded.id);
      if (user) {
        req.user = user.toObject();
        return next();
      }
    }

    return res.status(401).json({
      success: false,
      error: 'User not found or account deactivated.',
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token.',
    });
  }
};

/**
 * Restrict access to Admins only
 */
const adminOnly = (req, res, next) => {
  if (req.admin || (req.user && req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({
      success: false,
      error: 'Access denied. Admin authorization required.',
    });
  }
};

/**
 * Generate JWT token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'govai_secret', {
    expiresIn: '7d',
  });
};

module.exports = { protect, adminOnly, generateToken };

