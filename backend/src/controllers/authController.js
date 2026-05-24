const User = require('../models/User');
const store = require('../data/memoryStore');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../middleware/auth');

/**
 * Register citizen user
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, languagePreference } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, and password are required.',
      });
    }

    if (global.useMemoryStore) {
      const existing = store.getUserByEmail(email);
      if (existing) {
        return res.status(400).json({
          success: false,
          error: 'Email is already registered.',
        });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const randId = Math.random().toString(36).substr(2, 9).toUpperCase();
      const user = {
        _id: 'usr_' + randId,
        userId: 'USR-' + randId,
        name,
        email: email.toLowerCase(),
        password: passwordHash,
        languagePreference: languagePreference || 'en',
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      store.addUser(user);
      const token = generateToken(user._id);

      const { password: _, ...safeUser } = user;
      return res.status(201).json({
        success: true,
        data: { token, user: safeUser },
      });
    } else {
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) {
        return res.status(400).json({
          success: false,
          error: 'Email is already registered.',
        });
      }

      const user = await User.create({
        name,
        email: email.toLowerCase(),
        password,
        languagePreference: languagePreference || 'en',
        role: 'user',
      });

      const token = generateToken(user._id);
      return res.status(201).json({
        success: true,
        data: { token, user },
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Login citizen user
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required.',
      });
    }

    if (global.useMemoryStore) {
      const user = store.getUserByEmail(email);
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({
          success: false,
          error: 'Invalid email or password.',
        });
      }

      const token = generateToken(user._id);
      const { password: _, ...safeUser } = user;
      return res.status(200).json({
        success: true,
        data: { token, user: safeUser },
      });
    } else {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({
          success: false,
          error: 'Invalid email or password.',
        });
      }

      const token = generateToken(user._id);
      return res.status(200).json({
        success: true,
        data: { token, user },
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Get profile details
 */
const getProfile = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: req.user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update citizen profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, languagePreference } = req.body;
    const id = req.user._id;

    if (global.useMemoryStore) {
      const user = store.getUserById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found.',
        });
      }

      const updates = {};
      if (name) updates.name = name;
      if (languagePreference) updates.languagePreference = languagePreference;

      const updated = store.updateUser(id, updates);
      const { password: _, ...safeUser } = updated;
      return res.status(200).json({
        success: true,
        data: safeUser,
      });
    } else {
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found.',
        });
      }

      if (name) user.name = name;
      if (languagePreference) user.languagePreference = languagePreference;

      await user.save();
      return res.status(200).json({
        success: true,
        data: user,
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getProfile, updateProfile };
