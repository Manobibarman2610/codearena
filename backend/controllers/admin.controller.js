const pool = require('../config/db');

exports.listUsers = async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let sql = `SELECT id, name, email, role, institution, rating, solved_count, created_at FROM users WHERE 1=1`;
    const params = [];
    if (role)   { sql += ` AND role = ?`;   params.push(role); }
    if (search) { sql += ` AND (name LIKE ? OR email LIKE ?)`; params.push(`%${search}%`, `%${search}%`); }
    sql += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const [users] = await pool.query(sql, params);
    const [[{ total }]] = await pool.query(`SELECT COUNT(*) as total FROM users`);
    res.json({ success: true, users, total });
  } catch (err) { next(err); }
};

exports.changeRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!['student', 'faculty', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }
    await pool.query(`UPDATE users SET role = ? WHERE id = ?`, [role, id]);
    res.json({ success: true, message: `User role updated to ${role}` });
  } catch (err) { next(err); }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    await pool.query(`DELETE FROM users WHERE id = ?`, [id]);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) { next(err); }
};

exports.platformStats = async (req, res, next) => {
  try {
    const [[{ totalUsers }]] = await pool.query(`SELECT COUNT(*) as totalUsers FROM users`);
    const [[{ totalProblems }]] = await pool.query(`SELECT COUNT(*) as totalProblems FROM problems`);
    const [[{ totalSubmissions }]] = await pool.query(`SELECT COUNT(*) as totalSubmissions FROM submissions`);
    const [[{ totalAccepted }]] = await pool.query(`SELECT COUNT(*) as totalAccepted FROM submissions WHERE verdict = 'Accepted'`);
    const [[{ totalContests }]] = await pool.query(`SELECT COUNT(*) as totalContests FROM contests`);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalProblems,
        totalSubmissions,
        totalAccepted,
        totalContests,
        acceptanceRate: totalSubmissions ? Math.round((totalAccepted / totalSubmissions) * 100) : 0
      }
    });
  } catch (err) { next(err); }
};
