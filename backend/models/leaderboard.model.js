const pool = require('../config/db');

const Leaderboard = {
  async getGlobal({ limit = 50, offset = 0 } = {}) {
    const [rows] = await pool.query(
      `SELECT u.id, u.name, u.institution, u.solved_count, u.rating,
              RANK() OVER (ORDER BY u.rating DESC, u.solved_count DESC) as \`rank\`
       FROM users u
       WHERE u.role = 'student'
       ORDER BY u.rating DESC, u.solved_count DESC
       LIMIT ? OFFSET ?`,
      [parseInt(limit), parseInt(offset)]
    );
    return rows;
  },

  async getTop3() {
    const [rows] = await pool.query(
      `SELECT id, name, institution, solved_count, rating
       FROM users
       WHERE role = 'student'
       ORDER BY rating DESC, solved_count DESC
       LIMIT 3`
    );
    return rows;
  },

  async getUserRank(userId) {
    const [rows] = await pool.query(
      `SELECT rank_pos FROM (
         SELECT id, RANK() OVER (ORDER BY rating DESC, solved_count DESC) as rank_pos
         FROM users WHERE role = 'student'
       ) ranked WHERE id = ?`,
      [userId]
    );
    return rows[0]?.rank_pos || null;
  }
};

module.exports = Leaderboard;
