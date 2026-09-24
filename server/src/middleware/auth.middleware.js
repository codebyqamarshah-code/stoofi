const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  let token;

  // Check headers for token
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id);
    
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    if (req.user.status !== 'Active') {
      return res.status(401).json({ success: false, message: 'Account is inactive' });
    }

    if (req.user.role === 'Student' && req.user.subscription?.endDate) {
      if (new Date() > new Date(req.user.subscription.endDate)) {
        const allowedRoutes = ['/api/auth/me', '/api/payment', '/api/auth/logout'];
        const isAllowed = allowedRoutes.some(route => req.originalUrl.startsWith(route));
        if (!isAllowed) {
          return res.status(403).json({ 
            success: false, 
            message: 'Your subscription has expired. Please upgrade your plan to continue.', 
            subscriptionExpired: true 
          });
        }
      }
    }

    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};
