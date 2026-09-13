// TOEIC Study V2 - Main Application Script
let questions = [];
let currentQuestion = 0;
let answers = [];
let marked = [];
let timeRemaining = 1200; // 20 minutes in seconds
let timerInterval = null;

const $ = (id) => document.getElementById(id);

// Initialize the application
function init() {
  loadTheme();
  renderParts();
  loadStats();
  loadQuestions();
  setupNavigation();
}

// Load questions from JSON
async function loadQuestions() {
  try {
    const response = await fetch('data/part5.json');
    questions = await response.json();
    console.log('Questions loaded:', questions.length);
  } catch (error) {
    console.error('Error loading questions:', error);
    alert('Failed to load questions. Please refresh the page.');
  }
}

// Setup navigation button clicks
function setupNavigation() {
  document.querySelectorAll('.nav button').forEach(btn => {
    btn.onclick = () => showPage(btn.dataset.page);
  });
}

// Show/hide pages
function showPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
  $(page).classList.remove('hidden');
  
  document.querySelectorAll('.nav button').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.page === page);
  });
}

// Render TOEIC parts in home page
function renderParts() {
  const parts = [
    { num: '1', name: 'Photographs', desc: 'Listen and choose' },
    { num: '2', name: 'Question-Response', desc: 'Choose the correct response' },
    { num: '3', name: 'Conversations', desc: 'Answer questions about conversations' },
    { num: '4', name: 'Talks', desc: 'Answer questions about talks' },
    { num: '5', name: 'Incomplete Sentences', desc: 'Choose the missing word' },
    { num: '6', name: 'Text Completion', desc: 'Fill in the blanks' },
    { num: '7', name: 'Reading Comprehension', desc: 'Read and answer' }
  ];
  
  const partsHTML = parts.map((p, i) => {
    if (i === 4) { // Part 5 is active
      return `<div class="part-card active" onclick="startPractice()">
        <b>Part ${p.num}</b>
        <div class="name">${p.name}</div>
        <div class="desc">${p.desc}</div>
        <div style="margin-top:8px;font-size:11px;color:var(--pink);font-weight:600">→ START PRACTICE</div>
      </div>`;
    }
    return `<div class="part-card" onclick="alert('Part ${p.num} coming soon')">
      <b>Part ${p.num}</b>
      <div class="name">${p.name}</div>
      <div class="desc">${p.desc}</div>
      <div style="margin-top:8px;font-size:11px;color:var(--muted)">Coming Soon</div>
    </div>`;
  }).join('');
  
  $('parts').innerHTML = partsHTML;
}

// Load stats from localStorage
function loadStats() {
  const results = JSON.parse(localStorage.getItem('toeicResults') || '[]');
  
  if (results.length > 0) {
    const bestResult = results.reduce((max, r) => r.score > max.score ? r : max);
    $('homeScore').textContent = bestResult.score + ' / 990';
    const totalDone = results.reduce((sum, r) => sum + r.total, 0);
    $('homeDone').textContent = totalDone;
    
    const avgAccuracy = Math.round(results.reduce((sum, r) => sum + r.accuracy, 0) / results.length);
    $('homeAccuracy').textContent = avgAccuracy + '%';
    $('homeTests').textContent = results.length;
    
    const readingProgress = Math.min((results.length / 5) * 100, 100);
    const readingBar = document.getElementById('readingProgress');
    if (readingBar) readingBar.style.width = readingProgress + '%';
  }
}

// Start practice test
function startPractice() {
  if (questions.length === 0) {
    alert('Questions are loading. Please wait...');
    return;
  }
  
  showPage('practice');
  currentQuestion = 0;
  answers = Array(questions.length).fill(null);
  marked = Array(questions.length).fill(false);
  timeRemaining = 1200;
  
  clearInterval(timerInterval);
  timerInterval = setInterval(updateTimer, 1000);
  
  renderQuestion();
  renderQuestionNav();
  updateTimer();
}

// Update and display timer
function updateTimer() {
  timeRemaining--;
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const timerEl = $('timer');
  if (timerEl) {
    timerEl.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  
  if (timeRemaining <= 0) {
    clearInterval(timerInterval);
    submitTest();
  }
}

// Render current question
function renderQuestion() {
  const q = questions[currentQuestion];
  
  $('qnum').textContent = `Question ${String(currentQuestion + 1).padStart(2, '0')} / ${questions.length}`;
  $('question').textContent = q.question;
  
  const optionsHTML = q.options.map((opt, i) => {
    const isSelected = answers[currentQuestion] === i;
    return `<div class="option ${isSelected ? 'selected' : ''}" onclick="selectAnswer(${i})">
      <input type="radio" name="answer" ${isSelected ? 'checked' : ''}>
      <span>${String.fromCharCode(65 + i)}. ${opt}</span>
    </div>`;
  }).join('');
  
  $('options').innerHTML = optionsHTML;
  
  // Update progress bar
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const progressBar = document.getElementById('quizProgress');
  if (progressBar) progressBar.style.width = progress + '%';
  
  // Update navigation buttons
  $('prev').disabled = currentQuestion === 0;
  $('next').textContent = currentQuestion === questions.length - 1 ? 'Submit Test' : 'Next →';
  
  // Update mark button
  const markBtn = $('mark');
  if (markBtn) {
    markBtn.textContent = marked[currentQuestion] ? '★ Marked' : '☆ Mark';
    markBtn.classList.toggle('marked', marked[currentQuestion]);
  }
}

// Select an answer
function selectAnswer(index) {
  answers[currentQuestion] = index;
  renderQuestion();
  renderQuestionNav();
}

// Mark current question for review
function toggleMark() {
  marked[currentQuestion] = !marked[currentQuestion];
  renderQuestion();
  renderQuestionNav();
}

// Navigate questions
function previousQuestion() {
  if (currentQuestion > 0) {
    currentQuestion--;
    renderQuestion();
    renderQuestionNav();
  }
}

function nextQuestion() {
  if (currentQuestion < questions.length - 1) {
    currentQuestion++;
    renderQuestion();
    renderQuestionNav();
  } else {
    submitTest();
  }
}

function jumpToQuestion(index) {
  currentQuestion = index;
  renderQuestion();
  renderQuestionNav();
}

// Render question navigator
function renderQuestionNav() {
  const navHTML = questions.map((q, i) => {
    let className = '';
    if (i === currentQuestion) className = 'current';
    else if (answers[i] !== null) className = 'answered';
    if (marked[i]) className += ' marked';
    
    return `<button class="${className}" onclick="jumpToQuestion(${i})">${i + 1}</button>`;
  }).join('');
  
  const navContainer = document.getElementById('questionNav');
  if (navContainer) navContainer.innerHTML = navHTML;
}

// Submit test
function submitTest() {
  clearInterval(timerInterval);
  
  const correct = answers.filter((a, i) => a === questions[i].answer).length;
  const unanswered = answers.filter(a => a === null).length;
  const accuracy = Math.round((correct / questions.length) * 100);
  const estimatedScore = Math.round(300 + (accuracy / 100) * 400);
  
  const result = {
    date: new Date().toLocaleString(),
    score: estimatedScore,
    correct: correct,
    total: questions.length,
    accuracy: accuracy,
    timeSpent: 1200 - timeRemaining,
    answers: answers.slice(),
    marked: marked.slice()
  };
  
  // Save to localStorage
  const results = JSON.parse(localStorage.getItem('toeicResults') || '[]');
  results.push(result);
  localStorage.setItem('toeicResults', JSON.stringify(results));
  
  // Save mistakes
  const mistakes = answers
    .map((a, i) => a !== questions[i].answer ? {
      number: i + 1,
      q: questions[i].question,
      options: questions[i].options,
      yourAnswer: a !== null ? questions[i].options[a] : 'Not answered',
      correctAnswer: questions[i].options[questions[i].answer],
      explanation: questions[i].explanation,
      vi: questions[i].vi,
      grammar: questions[i].grammar
    } : null)
    .filter(m => m !== null);
  
  if (mistakes.length > 0) {
    const allMistakes = JSON.parse(localStorage.getItem('toeicMistakes') || '[]');
    allMistakes.push(...mistakes);
    localStorage.setItem('toeicMistakes', JSON.stringify(allMistakes));
  }
  
  showResults(result);
}

// Show results page
function showResults(result) {
  showPage('progress');
  
  const resultHTML = `
    <div class="hero">
      <span class="pill">TEST COMPLETE</span>
      <h1>Your Demo Result</h1>
    </div>
    
    <div class="result">
      <div class="result-score">${result.score} / 990</div>
      <div class="accuracy">Accuracy: ${result.accuracy}%</div>
      <p class="muted">Correct: ${result.correct} / ${result.total}</p>
    </div>
    
    <div class="grid">
      <div class="stat">
        <span class="muted">Estimated Score</span>
        <b>${result.score}</b>
      </div>
      <div class="stat">
        <span class="muted">Accuracy</span>
        <b>${result.accuracy}%</b>
      </div>
      <div class="stat">
        <span class="muted">Correct Answers</span>
        <b>${result.correct}</b>
      </div>
      <div class="stat">
        <span class="muted">Test Date</span>
        <b style="font-size:12px">${new Date(result.date).toLocaleDateString()}</b>
      </div>
    </div>
    
    <div style="display:flex;gap:12px;margin-top:24px">
      <button class="primary" onclick="showReview()" style="flex:1">Review Answers</button>
      <button class="secondary" onclick="showPage('home')" style="flex:1">Back to Home</button>
    </div>
  `;
  
  const progressContainer = $('progress');
  if (progressContainer) progressContainer.innerHTML = resultHTML;
}

// Show answer review
function showReview() {
  showPage('progress');
  
  let reviewHTML = `
    <div class="hero">
      <span class="pill">ANSWER REVIEW</span>
      <h1>Review your answers</h1>
    </div>
  `;
  
  questions.forEach((q, i) => {
    const userAnswer = answers[i];
    const correctAnswer = q.answer;
    const isCorrect = userAnswer === correctAnswer;
    
    reviewHTML += `
      <div class="review-item ${isCorrect ? 'correct' : 'incorrect'}">
        <div class="label">Question ${i + 1}</div>
        <div class="q">${q.question}</div>
        
        <div class="answer">
          <strong>Your answer:</strong> ${userAnswer !== null ? q.options[userAnswer] : 'Not answered'}
          <span class="wrong" style="display:block;margin-top:4px">${!isCorrect ? '✗ Incorrect' : '✓ Correct'}</span>
        </div>
        
        ${!isCorrect ? `
          <div class="answer">
            <strong>Correct answer:</strong> ${q.options[correctAnswer]}
            <span class="right" style="display:block;margin-top:4px">✓ Correct</span>
          </div>
        ` : ''}
        
        <div class="explain">
          <strong>Explanation:</strong> ${q.explanation}
        </div>
        
        <div class="vi">
          <strong>Vietnamese:</strong> ${q.vi}
        </div>
        
        <div class="grammar">Grammar: ${q.grammar}</div>
      </div>
    `;
  });
  
  reviewHTML += `
    <div style="margin-top:24px">
      <button class="primary" onclick="showPage('home')" style="width:100%">Back to Home</button>
    </div>
  `;
  
  const progressContainer = $('progress');
  if (progressContainer) progressContainer.innerHTML = reviewHTML;
}

// Load and apply theme
function loadTheme() {
  const isDark = localStorage.getItem('dark') === 'true';
  if (isDark) {
    document.body.classList.add('dark');
    const themeBtn = $('theme');
    if (themeBtn) themeBtn.textContent = '☀ Light mode';
  }
}

// Toggle dark mode
function toggleTheme() {
  document.body.classList.toggle('dark');
  const isDark = document.body.classList.contains('dark');
  localStorage.setItem('dark', isDark);
  const themeBtn = $('theme');
  if (themeBtn) {
    themeBtn.textContent = isDark ? '☀ Light mode' : '🌙 Dark mode';
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', init);
