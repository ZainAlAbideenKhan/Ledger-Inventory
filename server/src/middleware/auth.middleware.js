const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Check if Authorization header exists
    if (!authHeader) {
      return res.status(401).json({
        message: 'Authorization header missing',
      });
    }

    // Expected format: Bearer <token>
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        message: 'Invalid authorization format',
      });
    }

    const token = parts[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info to request
    req.user = {
      id: decoded.id,
      username: decoded.username,
      email: decoded.email,
    };

    next();
  } catch (err) {
    return res.status(401).json({
      message: 'Unauthorized or invalid token',
    });
  }
};

module.exports = authMiddleware;
