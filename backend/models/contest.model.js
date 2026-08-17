const pool = require('../config/db');

const Contest = {
  async findAll({ status, type, limit = 20, offset = 0 } = {}) {
    let sql = `SELECT * FROM contests WHERE 1=1`;
    const params = [];
    if (status) { sql += ` AND status = ?`; params.push(status); }
    if (type)   { sql += ` AND type = ?`;   params.push(type); }
    sql += ` ORDER BY start_time DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));
    const [rows] = await pool.query(sql, params);
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.query(`SELECT * FROM contests WHERE id = ?`, [id]);
    return rows[0] || null;
  },

  async create({ title, description, start_time, end_time, type, faculty_id }) {
    const [result] = await pool.query(
      `INSERT INTO contests (title, description, start_time, end_time, type, faculty_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title, description, start_time, end_time, type || 'Standard', faculty_id]
    );
    return result.insertId;
  },

  async addParticipant(contest_id, user_id) {
    await pool.query(
      `INSERT IGNORE INTO contest_participants (contest_id, user_id) VALUES (?, ?)`,
      [contest_id, user_id]
    );
  },

  async getProblems(contest_id) {
    const [rows] = await pool.query(
      `SELECT p.*, cp.points, cp.problem_order
       FROM contest_problems cp
       JOIN problems p ON cp.problem_id = p.id
       WHERE cp.contest_id = ?
       ORDER BY cp.problem_order ASC`,
      [contest_id]
    );
    return rows;
  },

  async addProblem(contest_id, problem_id, points = 100, problem_order = 1) {
    await pool.query(
      `INSERT INTO contest_problems (contest_id, problem_id, points, problem_order)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE points = VALUES(points), problem_order = VALUES(problem_order)`,
      [contest_id, problem_id, points, problem_order]
    );
  },

  async getLeaderboard(contest_id) {
    const [rows] = await pool.query(
      `SELECT cp.score, cp.solved_count, cp.penalty, u.id as user_id, u.name, u.institution,
              RANK() OVER (ORDER BY cp.score DESC, cp.penalty ASC) as rank_pos
       FROM contest_participants cp
       JOIN users u ON cp.user_id = u.id
       WHERE cp.contest_id = ?
       ORDER BY cp.score DESC, cp.penalty ASC`,
      [contest_id]
    );
    return rows;
  }
};

module.exports = Contest;
