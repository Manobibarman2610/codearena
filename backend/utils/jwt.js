const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'codearena_jwt_secret_dev_2026';
const JWT_EXPIRES = '7d';

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );
};

const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

module.exports = { generateToken, verifyToken };
