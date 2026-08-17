/* ═══════════════════════════════════════════════════════════════
   CODE ARENA — Interactive & Scroll Animation Controller
   Full-screen Section Storytelling, Live Judge Simulator,
   Animated Counters & AI Diagnostics
   ═══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  initNavbarAndScroll();
  initScrollReveal();
  initAnimatedCounters();
  initStoryPipeline();
  initLiveExecutionSimulation();
  initAuthUI();
});

/* ── 1. NAVBAR SCROLL & ACTIVE TRACKING ── */
function initNavbarAndScroll() {
  const navbar = document.getElementById('navbar');
  const progressBar = document.getElementById('scrollProgressBar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('header[id], section[id]');
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const navLinksList = document.getElementById('navLinks');

  if (hamburgerBtn && navLinksList) {
    hamburgerBtn.addEventListener('click', () => {
      navLinksList.classList.toggle('mobile-active');
    });
  }

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    
    // Progress Bar
    if (progressBar && docHeight > 0) {
      const pct = Math.min(100, Math.max(0, (scrollY / docHeight) * 100));
      progressBar.style.width = pct + '%';
    }

    // Navbar Elevation
    if (navbar) {
      if (scrollY > 30) {
        navbar.classList.add('nav-scrolled');
      } else {
        navbar.classList.remove('nav-scrolled');
      }
    }

    // Active Section Tracking
    let currentSectionId = '';
    sections.forEach(sec => {
      const top = sec.offsetTop - 120;
      const height = sec.offsetHeight;
      if (scrollY >= top && scrollY < top + height) {
        currentSectionId = sec.getAttribute('id');
      }
    });

    if (currentSectionId) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSectionId}`) {
          link.classList.add('active');
        }
      });
    }
  }, { passive: true });
}

/* ── 2. SCROLL REVEAL (INTERSECTION OBSERVER) ── */
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal, .reveal-slide-left, .reveal-slide-right');
  if (!reveals.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  reveals.forEach(el => observer.observe(el));
}

/* ── 3. ANIMATED NUMBER COUNTERS ── */
function initAnimatedCounters() {
  const statCounts = document.querySelectorAll('.stat-count');
  if (!statCounts.length) return;

  let hasRun = false;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !hasRun) {
        hasRun = true;
        statCounts.forEach(counter => {
          const target = parseInt(counter.getAttribute('data-target') || '0', 10);
          const hasPlus = counter.getAttribute('data-plus') === 'true';
          const duration = 1600;
          const startTime = performance.now();

          function updateCount(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentVal = Math.floor(easeOut * target);

            counter.textContent = currentVal + (hasPlus ? '+' : '');

            if (progress < 1) {
              requestAnimationFrame(updateCount);
            } else {
              counter.textContent = target + (hasPlus ? '+' : '');
            }
          }

          requestAnimationFrame(updateCount);
        });
      }
    });
  }, { threshold: 0.2 });

  const statsBar = document.querySelector('.hero-stats-bar');
  if (statsBar) observer.observe(statsBar);
}

/* ── 4. HOW IT WORKS 5-STEP STORY PIPELINE ── */
const STORY_STEPS = [
  {
    stepNum: '01',
    title: 'Choose a Problem',
    filename: 'two_sum.cpp',
    lang: 'C++17',
    code: `// Problem 1: Two Sum (Easy)
// Given nums = [2, 7, 11, 15], target = 9
// Return indices [0, 1] because nums[0] + nums[1] == 9

#include <iostream>
#include <vector>
#include <unordered_map>
using namespace std;`,
    verdict: 'Ready to Solve',
    verdictClass: 'dp-Medium',
    meta: 'Select from 150+ categorized programs and DSA challenges'
  },
  {
    stepNum: '02',
    title: 'Write Your Code',
    filename: 'solution.cpp',
    lang: 'C++17',
    code: `vector<int> twoSum(vector<int>& nums, int target) {
    unordered_map<int, int> map;
    for (int i = 0; i < nums.size(); i++) {
        int diff = target - nums[i];
        if (map.count(diff)) return {map[diff], i};
        map[nums[i]] = i;
    }
    return {};
}`,
    verdict: 'Editing in Browser IDE',
    verdictClass: 'dp-Medium',
    meta: 'Full CodeMirror IDE with syntax highlighting & error detection'
  },
  {
    stepNum: '03',
    title: 'Run & Submit',
    filename: 'runner.sh',
    lang: 'Sandbox Compiler',
    code: `$ g++ -O3 -std=c++17 solution.cpp -o solution
$ ./solution < input_01.txt > output_01.txt
Sandbox CPU limit: 2000ms • Memory limit: 256MB`,
    verdict: 'Compiling & Sandboxing',
    verdictClass: 'dp-Expert',
    meta: 'Secure process isolation prevents dangerous system calls'
  },
  {
    stepNum: '04',
    title: 'Automatic Evaluation',
    filename: 'judge_checker.py',
    lang: 'Test Suite',
    code: `Evaluating Test Cases:
[PASS] Test Case 1/5: nums=[2,7,11,15], target=9 -> Output: [0,1]
[PASS] Test Case 2/5: nums=[3,2,4], target=6 -> Output: [1,2]
[PASS] Test Case 3/5: nums=[3,3], target=6 -> Output: [0,1]
[PASS] Test Case 4/5: Large random array (N=10^4)
[PASS] Test Case 5/5: Edge case negative integers`,
    verdict: '5/5 Test Cases Passed',
    verdictClass: 'dp-Easy',
    meta: 'Automated I/O comparison verifies exact solution correctness'
  },
  {
    stepNum: '05',
    title: 'Get Feedback & Improve',
    filename: 'ai_diagnostics.json',
    lang: 'CodeArena AI',
    code: `{
  "verdict": "Accepted",
  "runtime": "24 ms (Beats 94.2% of submissions)",
  "memory": "12.4 MB (Optimal O(n) Hash Map)",
  "time_complexity": "O(n)",
  "space_complexity": "O(n)",
  "ai_feedback": "Optimal single-pass hash map solution. Space-time tradeoff well executed."
}`,
    verdict: 'Accepted (100%)',
    verdictClass: 'dp-Easy',
    meta: 'Detailed memory profile, percentile ranking, and AI complexity analysis'
  }
];

window.setStoryStep = function(stepIdx) {
  const data = STORY_STEPS[stepIdx];
  if (!data) return;

  // Update Buttons
  const stepBoxes = document.querySelectorAll('.step-nav-pill, .pipeline-step-box');
  stepBoxes.forEach((box, i) => {
    if (i === stepIdx) {
      box.classList.add('active-step');
    } else {
      box.classList.remove('active-step');
    }
  });

  // Update Card UI
  const codeBody = document.getElementById('storyCodeBody');
  const filename = document.getElementById('storyFilename');
  const langPill = document.getElementById('storyLangPill');
  const verdictPill = document.getElementById('storyVerdictPill');
  const metaText = document.getElementById('storyMetaText');

  if (codeBody) codeBody.textContent = data.code;
  if (filename) filename.textContent = data.filename;
  if (langPill) {
    langPill.textContent = data.lang;
    langPill.className = `diff-pill ${data.verdictClass}`;
  }
  if (verdictPill) {
    verdictPill.textContent = data.verdict;
    verdictPill.className = `diff-pill ${data.verdictClass}`;
  }
  if (metaText) metaText.textContent = data.meta;
};

/* ── 5. LIVE CODE EXECUTION SIMULATION SECTION ── */
function initLiveExecutionSimulation() {
  const runnerBtn = document.getElementById('btnRunDemo');
  if (!runnerBtn) return;

  runnerBtn.addEventListener('click', runDemoExecution);
}

window.runDemoExecution = function() {
  const statusEl = document.getElementById('demoStatusLine');
  const casesEl = document.getElementById('demoTestCasesLog');
  const metricsEl = document.getElementById('demoMetricsBar');
  const btn = document.getElementById('btnRunDemo');

  const speechEl = document.getElementById('demoRobotSpeech');

  if (!statusEl || !casesEl || !metricsEl) return;

  btn.disabled = true;
  btn.textContent = 'Running Sandbox...';
  statusEl.textContent = 'Compiling & Running Sandbox...';
  statusEl.className = 'diff-pill dp-Expert';
  if (speechEl) speechEl.textContent = 'AI Mentor: Evaluating test cases... ⏳';
  casesEl.innerHTML = '<div style="color:#94a3b8;font-style:italic">Executing against hidden test suite...</div>';
  metricsEl.style.display = 'none';

  const testCases = [
    { num: 1, desc: 'Sample Case 1: nums=[2,7,11,15], target=9', time: '4ms' },
    { num: 2, desc: 'Sample Case 2: nums=[3,2,4], target=6', time: '3ms' },
    { num: 3, desc: 'Boundary Case: nums=[3,3], target=6', time: '4ms' },
    { num: 4, desc: 'Performance Stress: N=10,000 random integers', time: '7ms' },
    { num: 5, desc: 'Negative values & duplicates test', time: '6ms' }
  ];

  let current = 0;
  casesEl.innerHTML = '';

  const interval = setInterval(() => {
    if (current < testCases.length) {
      const tc = testCases[current];
      const row = document.createElement('div');
      row.style.display = 'flex';
      row.style.justifyContent = 'space-between';
      row.style.alignItems = 'center';
      row.style.padding = '0.35rem 0';
      row.style.borderBottom = '1px solid rgba(255,255,255,0.06)';
      row.innerHTML = `
        <span style="color:#34d399;font-weight:600">✓ Test Case ${tc.num} Passed</span>
        <span style="color:#94a3b8;font-size:0.8rem">${tc.desc} (${tc.time})</span>
      `;
      casesEl.appendChild(row);
      current++;
    } else {
      clearInterval(interval);
      statusEl.textContent = 'Accepted — 100%';
      statusEl.className = 'diff-pill dp-Easy';
      if (speechEl) speechEl.textContent = 'AI Mentor: Accepted! 100% Passed! 🚀';
      metricsEl.style.display = 'flex';
      btn.disabled = false;
      btn.textContent = '▶ Run Execution Again';
    }
  }, 350);
};

/* ── 6. AI SCENARIO SWITCHER ── */
const AI_SCENARIOS = {
  tle: {
    title: 'Time Limit Exceeded (TLE) Analysis',
    badge: 'Time Limit Bottleneck',
    badgeClass: 'dp-Hard',
    comp: 'Estimated: O(n²) Time • O(1) Space',
    expl: 'Nested loops detected (lines 3-4). For large inputs (n ≥ 10⁴), the nested scan executes ~10⁸ operations, exceeding the 2000ms time window.',
    sugg: 'Use a Hash Map or Two-Pointer technique to reduce the inner lookup from O(n) to O(1), achieving O(n) total runtime.'
  },
  wa: {
    title: 'Wrong Answer (WA) Boundary Flaw',
    badge: 'Logic / Boundary Error',
    badgeClass: 'dp-Hard',
    comp: 'Estimated: O(n) Time • O(n) Space',
    expl: 'Edge case failure when nums contains duplicate targets or negative integers. Pointer condition missing strict equality validation.',
    sugg: 'Initialize frequency map before looping and check diff !== nums[i] index uniqueness.'
  },
  ac: {
    title: 'Optimal Accepted Solution & Complexity',
    badge: 'Optimal Performance',
    badgeClass: 'dp-Easy',
    comp: 'Optimal: O(n) Time • O(n) Space',
    expl: 'Clean single-pass hash map implementation. Time complexity is strictly linear with minimal memory overhead.',
    sugg: 'Ready for submission. For additional challenge, try solving with O(1) auxiliary space using sorted two-pointer approach.'
  }
};

window.selectAiScenario = function(key, btnEl) {
  const data = AI_SCENARIOS[key];
  if (!data) return;

  const btns = document.querySelectorAll('.ai-tab-btn');
  btns.forEach(b => b.classList.remove('active-ai-tab'));
  if (btnEl) btnEl.classList.add('active-ai-tab');

  const title = document.getElementById('aiDemoTitle');
  const badge = document.getElementById('aiDemoBadge');
  const comp = document.getElementById('aiDemoComp');
  const expl = document.getElementById('aiDemoExpl');
  const sugg = document.getElementById('aiDemoSugg');

  if (title) title.textContent = data.title;
  if (badge) {
    badge.textContent = data.badge;
    badge.className = `diff-pill ${data.badgeClass}`;
  }
  if (comp) comp.textContent = data.comp;
  if (expl) expl.textContent = data.expl;
  if (sugg) sugg.textContent = data.sugg;
};

/* ── 7. PROBLEM CARD FILTERING ── */
window.filterProblemCards = function(diff, btnEl) {
  const btns = document.querySelectorAll('.prob-filter-btn');
  btns.forEach(b => {
    b.classList.remove('btn-primary');
    b.classList.add('btn-secondary');
  });
  if (btnEl) {
    btnEl.classList.remove('btn-secondary');
    btnEl.classList.add('btn-primary');
  }

  const cards = document.querySelectorAll('.problem-card-item');
  cards.forEach(card => {
    const cardDiff = card.getAttribute('data-diff');
    if (diff === 'all' || cardDiff === diff || (diff === 'DSA' && (cardDiff === 'Medium' || cardDiff === 'Hard'))) {
      card.style.display = 'flex';
    } else {
      card.style.display = 'none';
    }
  });
};

/* ── 8. NAVBAR AUTH DETECTION ── */
function initAuthUI() {
  const token = localStorage.getItem('ca_token');
  const userStr = localStorage.getItem('ca_user');
  const authActions = document.getElementById('navAuthActions');
  if (!authActions) return;

  if (token && userStr) {
    try {
      const user = JSON.parse(userStr);
      const isFaculty = user.role === 'faculty' || user.role === 'admin';
      const dashUrl = isFaculty ? 'pages/dashboard-faculty.html' : 'pages/dashboard-student.html';
      
      authActions.innerHTML = `
        <a href="${dashUrl}" class="btn-secondary btn-sm" style="display:flex;align-items:center;gap:0.4rem">
          <span style="width:7px;height:7px;border-radius:50%;background:var(--success)"></span>
          ${escapeHtml(user.name?.split(' ')[0] || 'Dashboard')}
        </a>
        <button onclick="handleLogout()" class="btn-ghost btn-sm" style="color:var(--text-muted)">Logout</button>
      `;
    } catch {}
  }
}

window.handleLogout = function() {
  if (window.CA && window.CA.Auth) {
    window.CA.Auth.logout();
  } else {
    localStorage.removeItem('ca_token');
    localStorage.removeItem('ca_user');
    window.location.reload();
  }
};

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
