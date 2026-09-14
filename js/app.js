// Main Application Controller
let currentPage = 'dashboard';
let currentExam = null;
let examState = {
  answers: [],
  marked: [],
  timeRemaining: 0,
  timerInterval: null,
  startTime: 0
};

function init() {
  loadTheme();
  setupNavigation();
  loadDashboard();
  setupThemeToggle();
}

function setupNavigation() {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const page = btn.dataset.page;
      navigateToPage(page);
    });
  });
}

function navigateToPage(page) {
  currentPage = page;
  
  // Hide all pages
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(page).classList.add('active');
  
  // Update nav buttons
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.page === page);
  });
  
  // Load page content
  switch(page) {
    case 'dashboard':
      loadDashboard();
      break;
    case 'part5':
      loadPart5Menu();
      break;
    case 'part6':
      loadPart6Menu();
      break;
    case 'part7':
      loadPart7Menu();
      break;
    case 'full-test':
      loadFullTestMenu();
      break;
    case 'history':
      loadHistory();
      break;
  }
}

function loadDashboard() {
  const history = getTestHistory();
  const allAnswers = getAllAnswers();
  const totalQuestions = allAnswers.length;
  let correct = 0;
  let accuracy = 0;
  
  if (history.length > 0) {
    const latestTest = history[0];
    document.getElementById('lastScore').textContent = latestTest.score;
    correct = latestTest.correct;
  }
  
  if (totalQuestions > 0) {
    accuracy = Math.round((correct / totalQuestions) * 100);
    document.getElementById('accuracy').textContent = accuracy + '%';
  }
  
  document.getElementById('completedTests').textContent = history.length;
  document.getElementById('totalQuestions').textContent = totalQuestions;
  
  // Update progress bars
  updateProgressBars();
}

function updateProgressBars() {
  const part5Stats = getPart5Stats();
  const part6Stats = getPart6Stats();
  const part7Stats = getPart7Stats();
  
  document.getElementById('part5-progress').style.width = part5Stats.progress + '%';
  document.getElementById('part6-progress').style.width = part6Stats.progress + '%';
  document.getElementById('part7-progress').style.width = part7Stats.progress + '%';
}

function loadPart5Menu() {
  const container = document.getElementById('part5-content');
  let html = '<div class="tests-menu">';
  
  for (let i = 1; i <= 10; i++) {
    const testId = `part5-test${String(i).padStart(2, '0')}`;
    const result = getTestResult(testId);
    const status = result ? ` - Điểm: ${result.score}` : ' - Chưa làm';
    
    html += `
      <div class="test-card">
        <div class="test-title">Test Part 5 - ${i}</div>
        <div class="test-status">${status}</div>
        <button class="btn-primary" onclick="startExam('part5', ${i})">Làm bài</button>
      </div>
    `;
  }
  
  html += '</div>';
  container.innerHTML = html;
}

function loadPart6Menu() {
  const container = document.getElementById('part6-content');
  let html = '<div class="tests-menu">';
  
  for (let i = 1; i <= 10; i++) {
    const testId = `part6-test${String(i).padStart(2, '0')}`;
    const result = getTestResult(testId);
    const status = result ? ` - Điểm: ${result.score}` : ' - Chưa làm';
    
    html += `
      <div class="test-card">
        <div class="test-title">Test Part 6 - ${i}</div>
        <div class="test-status">${status}</div>
        <button class="btn-primary" onclick="startExam('part6', ${i})">Làm bài</button>
      </div>
    `;
  }
  
  html += '</div>';
  container.innerHTML = html;
}

function loadPart7Menu() {
  const container = document.getElementById('part7-content');
  let html = '<div class="tests-menu">';
  
  for (let i = 1; i <= 10; i++) {
    const testId = `part7-test${String(i).padStart(2, '0')}`;
    const result = getTestResult(testId);
    const status = result ? ` - Điểm: ${result.score}` : ' - Chưa làm';
    
    html += `
      <div class="test-card">
        <div class="test-title">Test Part 7 - ${i}</div>
        <div class="test-status">${status}</div>
        <button class="btn-primary" onclick="startExam('part7', ${i})">Làm bài</button>
      </div>
    `;
  }
  
  html += '</div>';
  container.innerHTML = html;
}

function loadFullTestMenu() {
  const container = document.getElementById('full-test-content');
  let html = '<div class="tests-menu">';
  
  for (let i = 1; i <= 10; i++) {
    const testId = `full-test${String(i).padStart(2, '0')}`;
    const result = getTestResult(testId);
    const status = result ? ` - Điểm: ${result.score}` : ' - Chưa làm';
    
    html += `
      <div class="test-card">
        <div class="test-title">Bài thi đầy đủ - ${i}</div>
        <div class="test-status">${status}</div>
        <p style="margin-top: 8px; font-size: 13px; color: var(--muted);">Part 5 (30) + Part 6 (16) + Part 7 (54) = 100 câu</p>
        <button class="btn-primary" onclick="startFullTest(${i})">Làm bài</button>
      </div>
    `;
  }
  
  html += '</div>';
  container.innerHTML = html;
}

function loadHistory() {
  const container = document.getElementById('history-content');
  const history = getTestHistory();
  
  if (history.length === 0) {
    container.innerHTML = '<p style="color: var(--muted); text-align: center; padding: 40px;">Chưa có lịch sử làm bài</p>';
    return;
  }
  
  let html = '<div class="history-list">';
  history.forEach((test, idx) => {
    html += `
      <div class="history-item">
        <div class="history-header">
          <div>
            <div class="history-title">${test.testName}</div>
            <div class="history-date">${new Date(test.date).toLocaleString('vi-VN')}</div>
          </div>
          <div class="history-score">${test.score}</div>
        </div>
        <div class="history-stats">
          <span>Đúng: ${test.correct}/${test.total}</span>
          <span>Độ chính xác: ${test.accuracy}%</span>
        </div>
      </div>
    `;
  });
  html += '</div>';
  container.innerHTML = html;
}

function setupThemeToggle() {
  document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
}

function toggleTheme() {
  document.body.classList.toggle('dark');
  const isDark = document.body.classList.contains('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  document.getElementById('theme-toggle').textContent = isDark ? '☀️ Light mode' : '🌙 Dark mode';
}

function loadTheme() {
  const theme = localStorage.getItem('theme') || 'light';
  if (theme === 'dark') {
    document.body.classList.add('dark');
    document.getElementById('theme-toggle').textContent = '☀️ Light mode';
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);

// Add CSS for menu
const style = document.createElement('style');
style.textContent = `
  .tests-menu {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
  }
  
  .test-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 20px;
  }
  
  .test-title {
    font-weight: 600;
    font-size: 18px;
    margin-bottom: 8px;
  }
  
  .test-status {
    color: var(--muted);
    font-size: 14px;
    margin-bottom: 16px;
  }
  
  .history-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .history-item {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 16px;
  }
  
  .history-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }
  
  .history-title {
    font-weight: 600;
  }
  
  .history-date {
    color: var(--muted);
    font-size: 13px;
  }
  
  .history-score {
    font-size: 24px;
    font-weight: bold;
    color: var(--primary);
  }
  
  .history-stats {
    display: flex;
    gap: 16px;
    font-size: 13px;
    color: var(--muted);
  }
`;
document.head.appendChild(style);