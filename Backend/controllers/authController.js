const jwt  = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/env');

const generateToken = (id) => {
  return jwt.sign({ id }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn
  });
};

// ─── Shared profile fields sent to client ────────────────────────────────────
const profileFields = (user) => ({
  _id:         user._id,
  name:        user.name,
  email:       user.email,
  role:        user.role,
  avatar:      user.avatar      || '',
  phone:       user.phone       || '',
  bio:         user.bio         || '',
  location:    user.location    || {},
  farmProfile: user.farmProfile || {},
  preferences: user.preferences || {},
  stats:       user.stats       || {},
  createdAt:   user.createdAt
});

// ─── @route  POST /api/auth/register ─────────────────────────────────────────
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Please add all required fields' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    const user = await User.create({ name, email, password, role: role || 'farmer' });

    if (user) {
      res.status(201).json({
        ...profileFields(user),
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ error: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Error in registerUser:', error);
    res.status(500).json({ error: error.message });
  }
};

// ─── @route  POST /api/auth/login ────────────────────────────────────────────
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Update last login timestamp
    user.stats = user.stats || {};
    user.stats.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });

    res.json({
      ...profileFields(user),
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('Error in loginUser:', error);
    res.status(500).json({ error: error.message });
  }
};

// ─── @route  GET /api/auth/me ─────────────────────────────────────────────────
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(profileFields(user));
  } catch (error) {
    console.error('Error in getMe:', error);
    res.status(500).json({ error: error.message });
  }
};

// ─── @route  PUT /api/auth/profile ───────────────────────────────────────────
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const {
      name, phone, bio, avatar,
      location, farmProfile, preferences
    } = req.body;

    if (name)        user.name   = name.trim();
    if (phone !== undefined) user.phone = phone;
    if (bio   !== undefined) user.bio   = bio;
    if (avatar !== undefined) user.avatar = avatar;

    // Deep merge nested objects so partial updates work
    if (location) {
      user.location = { ...(user.location || {}), ...location };
    }
    if (farmProfile) {
      user.farmProfile = { ...(user.farmProfile || {}), ...farmProfile };
    }
    if (preferences) {
      user.preferences = { ...(user.preferences || {}), ...preferences };
    }

    await user.save({ validateBeforeSave: false });
    res.json(profileFields(user));
  } catch (error) {
    console.error('Error in updateProfile:', error);
    res.status(500).json({ error: error.message });
  }
};

// ─── @route  PUT /api/auth/password ──────────────────────────────────────────
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Please provide current and new password' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) return res.status(401).json({ error: 'Current password is incorrect' });

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error in changePassword:', error);
    res.status(500).json({ error: error.message });
  }
};
