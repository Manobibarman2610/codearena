const pool = require('../config/db');

class LearningPathService {
  async generateStudentDossier(userId) {
    const [accuracyByTopic] = await pool.query(`
      SELECT p.topic, 
             COUNT(s.id) as attempts,
             COUNT(CASE WHEN s.verdict = 'Accepted' THEN 1 END) as accepted,
             ROUND(COUNT(CASE WHEN s.verdict = 'Accepted' THEN 1 END) * 100.0 / NULLIF(COUNT(s.id), 0), 1) as accuracy
      FROM submissions s
      JOIN problems p ON s.problem_id = p.id
      WHERE s.user_id = ?
      GROUP BY p.topic
    `, [userId]);

    const [difficultyBreakdown] = await pool.query(`
      SELECT p.difficulty,
             COUNT(DISTINCT CASE WHEN s.verdict = 'Accepted' THEN p.id END) as solved_count
      FROM submissions s
      JOIN problems p ON s.problem_id = p.id
      WHERE s.user_id = ?
      GROUP BY p.difficulty
    `, [userId]);

    const weakTopics = accuracyByTopic
      .filter(t => t.accuracy < 60 || t.attempts === 0)
      .map(t => t.topic);

    const strongTopics = accuracyByTopic
      .filter(t => t.accuracy >= 75)
      .map(t => t.topic);

    return {
      accuracyByTopic,
      difficultyBreakdown,
      weakTopics: weakTopics.length ? weakTopics : ['Dynamic Programming', 'Graph Theory'],
      strongTopics: strongTopics.length ? strongTopics : ['Arrays & Hash Maps'],
      suggestedNextTrack: weakTopics[0] || 'Dynamic Programming',
      recommendedDifficulty: 'Medium'
    };
  }

  async getRecommendedProblems(userId) {
    const dossier = await this.generateStudentDossier(userId);
    const targetTopic = dossier.weakTopics[0] || 'Arrays';

    const [problems] = await pool.query(`
      SELECT p.id, p.title, p.slug, p.difficulty, p.topic, p.total_submissions, p.accepted_submissions
      FROM problems p
      LEFT JOIN submissions s ON p.id = s.problem_id AND s.user_id = ? AND s.verdict = 'Accepted'
      WHERE s.id IS NULL AND (p.topic = ? OR p.difficulty = 'Easy')
      ORDER BY p.difficulty ASC, p.accepted_submissions DESC
      LIMIT 5
    `, [userId, targetTopic]);

    return problems;
  }
}

module.exports = new LearningPathService();
