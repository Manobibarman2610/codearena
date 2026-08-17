const pool = require('../config/db');

exports.getOverview = async (req, res, next) => {
  try {
    const [[{ totalStudents }]] = await pool.query(`SELECT COUNT(*) as totalStudents FROM users WHERE role = 'student'`);
    const [[{ activeAssignments }]] = await pool.query(`SELECT COUNT(*) as activeAssignments FROM assignments WHERE due_date >= NOW()`);
    const [[{ activeContests }]] = await pool.query(`SELECT COUNT(*) as activeContests FROM contests WHERE status = 'Live'`);
    const [[{ totalSubmissions }]] = await pool.query(`SELECT COUNT(*) as totalSubmissions FROM submissions`);
    const [[{ passRate }]] = await pool.query(`
      SELECT ROUND(COUNT(CASE WHEN verdict = 'Accepted' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0), 1) as passRate 
      FROM submissions
    `);

    res.json({
      success: true,
      stats: {
        totalStudents,
        activeAssignments,
        activeContests,
        totalSubmissions,
        passRate: passRate || 0
      }
    });
  } catch (err) { next(err); }
};

exports.getStudents = async (req, res, next) => {
  try {
    const [students] = await pool.query(`
      SELECT 
        u.id, u.name, u.email, u.institution, u.solved_count, u.rating,
        COUNT(s.id) as total_attempts,
        MAX(s.submitted_at) as last_active
      FROM users u
      LEFT JOIN submissions s ON u.id = s.user_id
      WHERE u.role = 'student'
      GROUP BY u.id
      ORDER BY u.solved_count DESC
    `);
    res.json({ success: true, students });
  } catch (err) { next(err); }
};

exports.getStudentReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [user] = await pool.query(`SELECT id, name, email, institution, solved_count, rating FROM users WHERE id = ?`, [id]);
    if (!user.length) return res.status(404).json({ success: false, message: 'Student not found' });

    const [submissions] = await pool.query(`
      SELECT s.*, p.title as problem_title, p.difficulty, p.topic
      FROM submissions s
      JOIN problems p ON s.problem_id = p.id
      WHERE s.user_id = ?
      ORDER BY s.submitted_at DESC LIMIT 50
    `, [id]);

    const [topicBreakdown] = await pool.query(`
      SELECT p.topic, 
             COUNT(DISTINCT p.id) as attempted,
             COUNT(DISTINCT CASE WHEN s.verdict = 'Accepted' THEN p.id END) as solved
      FROM submissions s
      JOIN problems p ON s.problem_id = p.id
      WHERE s.user_id = ?
      GROUP BY p.topic
    `, [id]);

    res.json({
      success: true,
      student: user[0],
      submissions,
      topicBreakdown
    });
  } catch (err) { next(err); }
};

exports.createAssignment = async (req, res, next) => {
  try {
    const { title, description, due_date, problem_ids } = req.body;
    if (!title || !due_date || !Array.isArray(problem_ids) || !problem_ids.length) {
      return res.status(400).json({ success: false, message: 'Title, due_date, and at least one problem_id are required' });
    }

    const [resInsert] = await pool.query(
      `INSERT INTO assignments (title, description, faculty_id, due_date) VALUES (?, ?, ?, ?)`,
      [title, description || '', req.user.id, due_date]
    );
    const assignmentId = resInsert.insertId;

    for (const pid of problem_ids) {
      await pool.query(`INSERT INTO assignment_problems (assignment_id, problem_id) VALUES (?, ?)`, [assignmentId, pid]);
    }

    res.status(201).json({ success: true, message: 'Assignment created successfully', assignmentId });
  } catch (err) { next(err); }
};

exports.getAssignments = async (req, res, next) => {
  try {
    const [assignments] = await pool.query(`
      SELECT a.*, COUNT(ap.problem_id) as problem_count
      FROM assignments a
      LEFT JOIN assignment_problems ap ON a.id = ap.assignment_id
      WHERE a.faculty_id = ?
      GROUP BY a.id
      ORDER BY a.created_at DESC
    `, [req.user.id]);
    res.json({ success: true, assignments });
  } catch (err) { next(err); }
};

exports.getAnalytics = async (req, res, next) => {
  try {
    const [topicAccuracy] = await pool.query(`
      SELECT p.topic, 
             COUNT(s.id) as total_submissions,
             ROUND(COUNT(CASE WHEN s.verdict = 'Accepted' THEN 1 END) * 100.0 / COUNT(s.id), 1) as accuracy
      FROM submissions s
      JOIN problems p ON s.problem_id = p.id
      GROUP BY p.topic
      ORDER BY total_submissions DESC
    `);

    const [difficultyDistribution] = await pool.query(`
      SELECT p.difficulty, COUNT(s.id) as count
      FROM submissions s
      JOIN problems p ON s.problem_id = p.id
      GROUP BY p.difficulty
    `);

    res.json({
      success: true,
      topicAccuracy,
      difficultyDistribution
    });
  } catch (err) { next(err); }
};

exports.plagiarismReport = async (req, res, next) => {
  try {
    const { contestId } = req.params;
    const [submissions] = await pool.query(`
      SELECT s.id, s.user_id, u.name as user_name, s.problem_id, p.title as problem_title, s.code, s.language
      FROM submissions s
      JOIN users u ON s.user_id = u.id
      JOIN problems p ON s.problem_id = p.id
      WHERE s.contest_id = ? AND s.verdict = 'Accepted'
    `, [contestId]);

    const flags = [];
    for (let i = 0; i < submissions.length; i++) {
      for (let j = i + 1; j < submissions.length; j++) {
        if (submissions[i].problem_id === submissions[j].problem_id &&
            submissions[i].user_id !== submissions[j].user_id) {
          const sim = computeSimilarity(submissions[i].code, submissions[j].code);
          if (sim > 75) {
            flags.push({
              problem: submissions[i].problem_title,
              user1: submissions[i].user_name,
              user2: submissions[j].user_name,
              similarity: Math.round(sim)
            });
          }
        }
      }
    }

    res.json({ success: true, flags });
  } catch (err) { next(err); }
};

function computeSimilarity(c1, c2) {
  const norm = s => s.replace(/\s+/g, '').toLowerCase();
  const s1 = norm(c1);
  const s2 = norm(c2);
  if (!s1.length || !s2.length) return 0;
  let matches = 0;
  const minLen = Math.min(s1.length, s2.length);
  for (let i = 0; i < minLen; i++) {
    if (s1[i] === s2[i]) matches++;
  }
  return (matches / Math.max(s1.length, s2.length)) * 100;
}
