const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/env');

module.exports = async function protect(req, res, next) {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Not authorized, no token provided' });
  }

  try {
    const token = authorization.split(' ')[1];
    const decoded = jwt.verify(token, config.jwtSecret);

    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({ error: 'Not authorized, user not found' });
    }

    return next();
  } catch (error) {
    console.error('Auth middleware token verification error:', error);
    return res.status(401).json({ error: 'Not authorized, token failed' });
  }
};
