const { JWT_SECRET, verifyUserToken } = require('../utils/jwtUtils');

/**
 * Middleware: authenticateToken
 * Verifies Bearer JWT token from the Authorization header.
 * Attaches the verified user payload to `req.user`.
 */
const authenticateToken = (req, res, next) => {
  // Allow preflight CORS OPTIONS requests through
  if (req.method === 'OPTIONS') {
    return next();
  }

  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  let token = null;

  if (authHeader) {
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    } else {
      token = authHeader.trim();
    }
  }

  // Also support query param fallback (?token=...) for direct downloads or media views
  if (!token && req.query && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied: Authentication token required. Please log in.'
    });
  }

  const decoded = verifyUserToken(token);
  if (!decoded) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired authentication token. Please log in again.'
    });
  }

  req.user = decoded;
  next();
};

/**
 * Middleware: requireRoles(...allowedRoles)
 * Role-based authorization. Validates that req.user.role is authorized.
 * 'superadmin' is globally authorized for all administrative actions.
 */
const requireRoles = (...allowedRoles) => {
  const flatRoles = allowedRoles.flat().map(r => String(r).toLowerCase());

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No user context found.'
      });
    }

    const userRole = (req.user.role || '').toLowerCase();

    // superadmin has full access
    if (userRole === 'superadmin' || flatRoles.includes(userRole)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `Access denied: Role '${req.user.role}' is not authorized to access this resource. Required role(s): ${flatRoles.join(', ')}.`
    });
  };
};

/**
 * Pre-defined role guards:
 * - requireAdmin: Admin, Superadmin, Teacher, Tutor
 * - requireStudent: Student
 * - requireAuth: Any authenticated user
 */
const requireAdmin = requireRoles('superadmin', 'admin', 'teacher', 'tutor');
const requireStudent = requireRoles('student');
const requireAuth = authenticateToken;

module.exports = {
  JWT_SECRET,
  authenticateToken,
  requireRoles,
  requireAdmin,
  requireStudent,
  requireAuth
};
