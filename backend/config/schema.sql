-- ============================================================
-- CodeArena Database Schema
-- MySQL 8.0+
-- ============================================================

CREATE DATABASE IF NOT EXISTS codearena
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE codearena;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('student', 'faculty', 'admin') DEFAULT 'student',
  institution VARCHAR(150) DEFAULT '',
  rating INT DEFAULT 1200,
  solved_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_rating (rating)
) ENGINE=InnoDB;

-- 2. Problems Table
CREATE TABLE IF NOT EXISTS problems (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(220) NOT NULL UNIQUE,
  difficulty ENUM('Easy', 'Medium', 'Hard') NOT NULL DEFAULT 'Easy',
  topic VARCHAR(80) NOT NULL DEFAULT 'General',
  description TEXT NOT NULL,
  input_format TEXT,
  output_format TEXT,
  constraints TEXT,
  sample_input TEXT,
  sample_output TEXT,
  starter_code JSON,
  solution_code TEXT,
  time_limit INT DEFAULT 2000,
  memory_limit INT DEFAULT 256,
  total_submissions INT DEFAULT 0,
  accepted_submissions INT DEFAULT 0,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_difficulty (difficulty),
  INDEX idx_topic (topic),
  INDEX idx_slug (slug)
) ENGINE=InnoDB;

-- 3. Test Cases Table
CREATE TABLE IF NOT EXISTS test_cases (
  id INT AUTO_INCREMENT PRIMARY KEY,
  problem_id INT NOT NULL,
  input_data MEDIUMTEXT NOT NULL,
  expected_output MEDIUMTEXT NOT NULL,
  is_sample BOOLEAN DEFAULT FALSE,
  explanation TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE,
  INDEX idx_problem_sample (problem_id, is_sample)
) ENGINE=InnoDB;

-- 4. Contests Table
CREATE TABLE IF NOT EXISTS contests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  start_time DATETIME NOT NULL,
  end_time DATETIME NOT NULL,
  status ENUM('Upcoming', 'Live', 'Completed') DEFAULT 'Upcoming',
  type VARCHAR(50) DEFAULT 'Standard',
  faculty_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (faculty_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_status (status),
  INDEX idx_times (start_time, end_time)
) ENGINE=InnoDB;

-- 5. Contest Problems (Many-to-Many)
CREATE TABLE IF NOT EXISTS contest_problems (
  contest_id INT NOT NULL,
  problem_id INT NOT NULL,
  points INT DEFAULT 100,
  problem_order INT DEFAULT 1,
  PRIMARY KEY (contest_id, problem_id),
  FOREIGN KEY (contest_id) REFERENCES contests(id) ON DELETE CASCADE,
  FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. Contest Participants
CREATE TABLE IF NOT EXISTS contest_participants (
  contest_id INT NOT NULL,
  user_id INT NOT NULL,
  score INT DEFAULT 0,
  solved_count INT DEFAULT 0,
  penalty INT DEFAULT 0,
  registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (contest_id, user_id),
  FOREIGN KEY (contest_id) REFERENCES contests(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. Submissions Table
CREATE TABLE IF NOT EXISTS submissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  problem_id INT NOT NULL,
  contest_id INT DEFAULT NULL,
  language ENUM('c', 'cpp', 'java', 'python', 'javascript') NOT NULL,
  code LONGTEXT NOT NULL,
  verdict ENUM('Pending', 'Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Memory Limit Exceeded', 'Compilation Error', 'Runtime Error') DEFAULT 'Pending',
  runtime_ms INT DEFAULT 0,
  memory_kb INT DEFAULT 0,
  passed_cases INT DEFAULT 0,
  total_cases INT DEFAULT 0,
  error_message TEXT,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE,
  FOREIGN KEY (contest_id) REFERENCES contests(id) ON DELETE SET NULL,
  INDEX idx_user_problem (user_id, problem_id),
  INDEX idx_verdict (verdict),
  INDEX idx_submitted_at (submitted_at)
) ENGINE=InnoDB;

-- 8. Hints Table
CREATE TABLE IF NOT EXISTS hints (
  id INT AUTO_INCREMENT PRIMARY KEY,
  problem_id INT NOT NULL,
  hint_number INT NOT NULL,
  hint_text TEXT NOT NULL,
  penalty_points INT DEFAULT 10,
  FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE,
  UNIQUE KEY uq_prob_hint (problem_id, hint_number)
) ENGINE=InnoDB;

-- 9. User Unlocked Hints
CREATE TABLE IF NOT EXISTS user_hints (
  user_id INT NOT NULL,
  problem_id INT NOT NULL,
  hint_number INT NOT NULL,
  unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, problem_id, hint_number),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 10. AI Diagnostics & Analysis Logs
CREATE TABLE IF NOT EXISTS ai_analysis_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  problem_id INT,
  code LONGTEXT NOT NULL,
  language VARCHAR(30) NOT NULL,
  verdict VARCHAR(50),
  feedback JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 11. Practice Programs (Language-Specific Modules)
CREATE TABLE IF NOT EXISTS practice_programs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(220) NOT NULL,
  language ENUM('c', 'cpp', 'java', 'python', 'javascript') NOT NULL,
  category VARCHAR(80) NOT NULL DEFAULT 'Basic',
  difficulty ENUM('Basic', 'Intermediate', 'Advanced') NOT NULL DEFAULT 'Basic',
  description TEXT NOT NULL,
  starter_code TEXT,
  solution_code TEXT,
  time_limit INT DEFAULT 2000,
  memory_limit INT DEFAULT 256,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_lang_cat (language, category),
  INDEX idx_lang_diff (language, difficulty)
) ENGINE=InnoDB;

-- 12. Practice Test Cases
CREATE TABLE IF NOT EXISTS practice_testcases (
  id INT AUTO_INCREMENT PRIMARY KEY,
  program_id INT NOT NULL,
  input_data MEDIUMTEXT NOT NULL,
  expected_output MEDIUMTEXT NOT NULL,
  is_sample BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (program_id) REFERENCES practice_programs(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 13. Practice Submissions
CREATE TABLE IF NOT EXISTS practice_submissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  program_id INT NOT NULL,
  language ENUM('c', 'cpp', 'java', 'python', 'javascript') NOT NULL,
  code LONGTEXT NOT NULL,
  verdict VARCHAR(50) DEFAULT 'Pending',
  runtime_ms INT DEFAULT 0,
  memory_kb INT DEFAULT 0,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (program_id) REFERENCES practice_programs(id) ON DELETE CASCADE,
  INDEX idx_user_prog (user_id, program_id)
) ENGINE=InnoDB;

-- 14. Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('contest', 'verdict', 'assignment', 'system') DEFAULT 'system',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_read (user_id, is_read)
) ENGINE=InnoDB;

-- 15. Assignments (Faculty Module)
CREATE TABLE IF NOT EXISTS assignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  faculty_id INT NOT NULL,
  due_date DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (faculty_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 16. Assignment Problems
CREATE TABLE IF NOT EXISTS assignment_problems (
  assignment_id INT NOT NULL,
  problem_id INT NOT NULL,
  PRIMARY KEY (assignment_id, problem_id),
  FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
  FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE
) ENGINE=InnoDB;
