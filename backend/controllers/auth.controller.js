const User = require('../models/user.model');
const { hashPassword, comparePassword } = require('../utils/hash');
const { generateToken } = require('../utils/jwt');

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role = 'student', institution } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    const existing = await User.findByEmail(email);
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists' });
    }

    const allowedRoles = ['student', 'faculty', 'admin'];
    const assignedRole = allowedRoles.includes(role) ? role : 'student';

    const password_hash = await hashPassword(password);
    const userId = await User.create({ name, email, password_hash, role: assignedRole, institution });
    const user = await User.findById(userId);
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      token,
      user
    });
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const userWithHash = await (async () => {
      const pool = require('../config/db');
      const [rows] = await pool.query(`SELECT * FROM users WHERE email = ?`, [email]);
      return rows[0] || null;
    })();

    if (!userWithHash) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await comparePassword(password, userWithHash.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const user = await User.findById(userWithHash.id);
    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Logged in successfully',
      token,
      user
    });
  } catch (err) { next(err); }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) { next(err); }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const token = generateToken(user);
    res.json({ success: true, token, user });
  } catch (err) { next(err); }
};
