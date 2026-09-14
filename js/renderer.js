// Rendering functions for exam interface

// Render current question
function renderCurrentQuestion() {
  if (!currentExam) return;
  
  const question = currentExam.questions[currentQuestionIndex];
  const examBody = document.getElementById('exam-body');
  
  if (!examBody) return;
  
  let html = `
    <div class="question-block">
      <div class="question-num">Question ${currentQuestionIndex + 1} / ${currentExam.totalQuestions}</div>
  `;
  
  // For Part 6 and 7, show passage
  if (currentExam.part !== 'part5' && question.passage) {
    html += `
      <div style="background: var(--primary-light); padding: 16px; border-radius: 8px; margin-bottom: 20px;">
        <div style="font-weight: bold; margin-bottom: 12px;">${question.passage.title || 'Passage'}</div>
        <div style="font-size: 14px; line-height: 1.6; color: var(--text);">${question.passage.text}</div>
      </div>
    `;
  }
  
  // Question text
  html += `<div class="question-text">${question.question}</div>`;
  
  // Options
  html += '<div class="options">';
  const options = Array.isArray(question.options) ? question.options : Object.values(question.options || {});
  options.forEach((option, i) => {
    const optionText = typeof option === 'string' ? option : option.text;
    const isSelected = examAnswers[currentQuestionIndex] === i;
    html += `
      <div class="option ${isSelected ? 'selected' : ''}" onclick="selectAnswer(${i})">
        <input type="radio" name="answer" ${isSelected ? 'checked' : ''}>
        <label><strong>${String.fromCharCode(65 + i)}.</strong> ${optionText}</label>
      </div>
    `;
  });
  html += '</div></div>';
  
  examBody.innerHTML = html;
  updateProgressBar();
}

// Update progress bar
function updateProgressBar() {
  if (!currentExam) return;
  const progress = ((currentQuestionIndex + 1) / currentExam.totalQuestions) * 100;
  const progressBar = document.getElementById('exam-progress');
  if (progressBar) {
    progressBar.style.setProperty('--progress', progress + '%');
  }
}

// Update question navigator
function updateQuestionNav() {
  if (!currentExam) return;
  
  const navContainer = document.getElementById('exam-questions-nav');
  if (!navContainer) return;
  
  let html = '';
  for (let i = 0; i < currentExam.totalQuestions; i++) {
    let className = '';
    if (i === currentQuestionIndex) className = 'current';
    else if (examAnswers[i] !== null) className = 'answered';
    else className = 'unanswered';
    
    if (examMarked[i]) className += ' marked';
    
    html += `<button class="exam-nav-btn ${className}" onclick="goToQuestion(${i})" title="Question ${i + 1}">${i + 1}</button>`;
  }
  navContainer.innerHTML = html;
}

// Show exam results
function showExamResults(result) {
  const container = document.getElementById('results-container');
  container.classList.remove('hidden');
  document.getElementById('exam-container').classList.add('hidden');
  
  const correct = result.correct;
  const total = result.total;
  const accuracy = result.accuracy;
  const incorrect = total - correct;
  
  let html = `
    <div class="result-header">
      <span class="part-badge">${result.part.toUpperCase()}</span>
      <h1>${result.testName}</h1>
      <div class="result-score">${result.score}</div>
      <p style="color: var(--muted);">Estimated Score</p>
    </div>
    
    <div class="result-stats">
      <div class="result-stat">
        <div class="result-stat-label">Correct</div>
        <div class="result-stat-value">${correct}</div>
      </div>
      <div class="result-stat">
        <div class="result-stat-label">Incorrect</div>
        <div class="result-stat-value">${incorrect}</div>
      </div>
      <div class="result-stat">
        <div class="result-stat-label">Accuracy</div>
        <div class="result-stat-value">${accuracy}%</div>
      </div>
      <div class="result-stat">
        <div class="result-stat-label">Total</div>
        <div class="result-stat-value">${total}</div>
      </div>
    </div>
    
    <div style="text-align: center; margin: 32px 0;">
      <button class="btn-primary" onclick="showReview('${result.testId}')">Review Answers</button>
      <button class="btn-secondary" onclick="backToDashboard()" style="margin-left: 12px;">Back to Dashboard</button>
    </div>
    
    <div class="review-section" id="review-details"></div>
  `;
  
  document.getElementById('results-body').innerHTML = html;
}

// Show answer review
function showReview(testId) {
  const reviewContainer = document.getElementById('review-details');
  if (!reviewContainer) return;
  
  let html = '<h2 style="margin-bottom: 24px;">Answer Review</h2>';
  
  currentExam.questions.forEach((question, i) => {
    const userAnswer = examAnswers[i];
    const correctAnswerIdx = typeof question.correctAnswer === 'string' ? 
      getAnswerIndex(question.correctAnswer) : question.correctAnswer;
    const isCorrect = userAnswer === correctAnswerIdx;
    
    const options = Array.isArray(question.options) ? question.options : Object.values(question.options || {});
    const userAnswerText = userAnswer !== null ? (typeof options[userAnswer] === 'string' ? options[userAnswer] : options[userAnswer].text) : 'Not answered';
    const correctAnswerText = typeof options[correctAnswerIdx] === 'string' ? options[correctAnswerIdx] : options[correctAnswerIdx].text;
    
    html += `
      <div class="review-item ${isCorrect ? 'correct' : 'incorrect'}">
        <div class="review-question">Question ${i + 1}</div>
        <div style="margin-bottom: 12px; font-size: 14px; color: var(--muted);">${question.question}</div>
        
        <div class="review-answer">
          <div class="review-label">Your answer:</div>
          <div class="review-text">${String.fromCharCode(65 + (userAnswer || 0))}. ${userAnswerText}</div>
          <div style="margin-top: 4px; color: ${isCorrect ? 'var(--success)' : 'var(--danger)'}; font-weight: 600;">
            ${isCorrect ? '✓ Correct' : '✗ Incorrect'}
          </div>
        </div>
        
        ${!isCorrect ? `
          <div class="review-answer">
            <div class="review-label">Correct answer:</div>
            <div class="review-text">${String.fromCharCode(65 + correctAnswerIdx)}. ${correctAnswerText}</div>
            <div style="margin-top: 4px; color: var(--success); font-weight: 600;">✓ Correct</div>
          </div>
        ` : ''}
        
        <div class="review-explanation">
          <strong>Explanation:</strong><br>
          ${question.explanationVi || question.explanation?.vi || question.explanation || 'No explanation available'}
        </div>
        
        ${question.grammarPoint ? `
          <div class="review-explanation" style="margin-top: 8px; background: var(--soft);">
            <strong>Grammar:</strong> ${question.grammarPoint}
          </div>
        ` : ''}
        
        ${question.vocabulary ? `
          <div class="review-explanation" style="margin-top: 8px; background: var(--soft);">
            <strong>Vocabulary:</strong> ${question.vocabulary}
          </div>
        ` : ''}
      </div>
    `;
  });
  
  reviewContainer.innerHTML = html;
}

// Back to dashboard
function backToDashboard() {
  document.getElementById('results-container').classList.add('hidden');
  document.getElementById('exam-container').classList.add('hidden');
  currentExam = null;
  loadDashboard();
  navigateToPage('dashboard');
}