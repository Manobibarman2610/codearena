const pool = require('../config/db');

class AIService {
  async generateFeedback({ userId, problemId, code, language, verdict, errorMessage, customQuery }) {
    // 1. Analyze Code Complexity & Patterns
    const complexity = this.estimateComplexity(code, language);
    const issues = this.detectCommonFlaws(code, language, verdict, errorMessage);
    const hints = this.generateTargetedHints(verdict, issues, customQuery);
    
    const feedbackData = {
      verdict: verdict || 'Analyzed',
      language,
      estimated_time_complexity: complexity.time,
      estimated_space_complexity: complexity.space,
      complexity_explanation: complexity.explanation,
      issues_detected: issues,
      optimization_suggestions: hints.suggestions,
      guided_questions: hints.questions,
      encouragement: hints.encouragement
    };

    // 2. Persist analysis log in DB
    try {
      await pool.query(
        `INSERT INTO ai_analysis_logs (user_id, problem_id, code, language, verdict, feedback)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, problemId || null, code, language, verdict || 'Analyzed', JSON.stringify(feedbackData)]
      );
    } catch (err) {
      console.warn('[AI Service] Log persistence skipped:', err.message);
    }

    return feedbackData;
  }

  estimateComplexity(code, language) {
    const loopMatches = (code.match(/\b(for|while)\b/g) || []).length;
    const recursionMatch = /function\s+(\w+)[\s\S]*?\1\(|def\s+(\w+)[\s\S]*?\2\(/.test(code);
    const sortMatch = /\b(sort|sorted|Arrays\.sort|Collections\.sort|std::sort)\b/.test(code);
    const hashMatch = /\b(HashMap|unordered_map|dict|Set|HashSet|unordered_set|Map|new Set)\b/i.test(code);

    let time = 'O(n)';
    let space = hashMatch ? 'O(n)' : 'O(1)';
    let explanation = 'Single pass or linear iteration detected.';

    if (loopMatches >= 2) {
      time = 'O(n²)';
      explanation = 'Nested loops detected. For large inputs, this may lead to Time Limit Exceeded (TLE).';
    } else if (loopMatches === 3) {
      time = 'O(n³)';
      explanation = 'Triple nested iteration detected. Consider memoization, hashing, or divide-and-conquer.';
    } else if (sortMatch) {
      time = 'O(n log n)';
      explanation = 'Sorting operation detected. Typical comparison sort requires O(n log n) comparisons.';
    } else if (recursionMatch) {
      time = 'O(2ⁿ) or O(log n)';
      explanation = 'Recursive structure detected. Check if tree division is logarithmic or exponential without memoization.';
    }

    return { time, space, explanation };
  }

  detectCommonFlaws(code, language, verdict, errorMessage) {
    const issues = [];

    if (verdict === 'Time Limit Exceeded') {
      issues.push({
        type: 'TLE',
        title: 'Time Limit Exceeded',
        description: 'Your algorithm did not complete within the maximum CPU time limit (usually 2000ms).'
      });
    }

    if (verdict === 'Compilation Error') {
      issues.push({
        type: 'Syntax',
        title: 'Compiler / Syntax Issue',
        description: errorMessage || 'Check semicolons, type signatures, header imports, or missing brackets.'
      });
    }

    if (verdict === 'Wrong Answer') {
      issues.push({
        type: 'Logic',
        title: 'Boundary or Test Case Discrepancy',
        description: 'Output differed from expected output on hidden test cases (check edge cases, 0 values, empty arrays, or negative values).'
      });
    }

    // Static code checks
    if (language === 'cpp' && !code.includes('#include')) {
      issues.push({ type: 'Header', title: 'Missing Includes', description: 'Ensure required headers like <vector>, <iostream>, or <algorithm> are imported.' });
    }

    if (language === 'python' && /print\(/.test(code) && !/def |return /.test(code)) {
      issues.push({ type: 'Return', title: 'Check Return Value', description: 'Ensure your function returns the expected result instead of only printing.' });
    }

    return issues;
  }

  generateTargetedHints(verdict, issues, customQuery) {
    const suggestions = [];
    const questions = [];

    if (verdict === 'Time Limit Exceeded') {
      suggestions.push('Can you replace the inner loop lookup with a Hash Map / Hash Set to achieve O(1) average lookup?');
      suggestions.push('If the array is sorted, could the Two-Pointer technique or Binary Search reduce the search time?');
      questions.push('What is the maximum constraint for N? Will an O(n²) solution exceed 10⁸ operations?');
    } else if (verdict === 'Wrong Answer') {
      suggestions.push('Test your logic with minimum inputs (e.g., array length 1 or 2, empty strings, target = 0).');
      suggestions.push('Check for integer overflow if dealing with large summations or multiplications.');
      questions.push('Does your solution handle negative integers and duplicates properly?');
    } else {
      suggestions.push('Great job! For further optimization, consider whether auxiliary space can be reduced to O(1).');
      questions.push('Can this problem be solved using bit manipulation or constant-space pointer traversal?');
    }

    return {
      suggestions,
      questions,
      encouragement: verdict === 'Accepted' ? 'Outstanding work! Keep up the coding momentum!' : 'You are close! Review the edge conditions and try running again.'
    };
  }

  async getHistory(userId, problemId) {
    const [rows] = await pool.query(
      `SELECT * FROM ai_analysis_logs WHERE user_id = ? AND problem_id = ? ORDER BY created_at DESC LIMIT 10`,
      [userId, problemId]
    );
    return rows;
  }
}

module.exports = new AIService();
