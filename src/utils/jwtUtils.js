const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'eduadmin_super_secret_jwt_key_2026_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30d';

/**
 * Generate a signed JWT token containing complete user details.
 * Payload includes: id, role, roll, roll_number, tuition_code, name, email, organization_id, class, semester, course, status.
 */
function generateUserToken(user) {
  if (!user) return null;

  const role = (user.role || 'student').toLowerCase();
  const rollIdentifier = user.tuition_code || user.id;

  const payload = {
    id: user.id,
    role: role,
    roll: rollIdentifier,
    roll_number: rollIdentifier,
    tuition_code: user.tuition_code || null,
    name: user.name || '',
    email: user.email || '',
    organization_id: Number(user.organization_id) || 1,
    class: user.class || null,
    semester: user.semester || null,
    course: user.course || null,
    status: user.status || 'active'
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verify and decode a JWT token.
 */
function verifyUserToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

module.exports = {
  JWT_SECRET,
  JWT_EXPIRES_IN,
  generateUserToken,
  verifyUserToken
};
