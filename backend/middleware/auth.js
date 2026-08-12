const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Society = require('../models/Society');

// Decodes the JWT (which encodes { id: userId, societyId, role }), loads the
// user, and attaches req.user, req.societyId, req.society and req.role so
// that every downstream route/controller can rely on them. req.user.role is
// also set to the society-scoped role so existing authorize() calls and any
// code reading req.user.role keeps working unchanged.
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findByPk(decoded.id, { attributes: { exclude: ['password'] } });
      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      if (!decoded.societyId) {
        return res.status(401).json({ message: 'Not authorized, no society context on token' });
      }

      const society = await Society.findByPk(decoded.societyId);
      if (!society) {
        return res.status(401).json({ message: 'Society not found' });
      }
      if (society.isGuestSandbox && society.expiresAt && society.expiresAt < new Date()) {
        return res.status(410).json({ message: 'This guest sandbox has expired. Please try a new guest session.' });
      }

      req.societyId = decoded.societyId;
      req.society = society;
      req.role = decoded.role;
      req.user.role = decoded.role; // keep req.user.role in sync for backward compatibility
      req.flatId = decoded.flatId || null; // the caller's own flat identity for THIS session's role, straight from the token

      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Usage: authorize('secretary', 'chairman')
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: `Role '${req.user?.role}' is not permitted to access this resource` });
    }
    next();
  };
};

module.exports = { protect, authorize };
