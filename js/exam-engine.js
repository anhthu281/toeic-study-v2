// Exam Engine - Core exam logic

let currentExam = null;
let examAnswers = [];
let examMarked = [];
let currentQuestionIndex = 0;
let examStartTime = 0;
let examTimeRemaining = 0;
let timerInterval = null;

// Initialize exam
function initExam(testData) {
  currentExam = testData;
  examAnswers = new Array(testData.totalQuestions).fill(null);
  examMarked = new Array(testData.totalQuestions).fill(false);
  currentQuestionIndex = 0;
  examStartTime = Date.now();
  examTimeRemaining = (testData.timeLimit || 1200) * 1000; // milliseconds
  
  // Load saved state if exists
  const savedState = loadExamState(testData.testId);
  if (savedState) {
    examAnswers = savedState.answers;
    examMarked = savedState.marked;
    currentQuestionIndex = savedState.currentQuestion;
  }
  
  startTimer();
}

// Start timer
function startTimer() {
  if (timerInterval) clearInterval(timerInterval);
  
  timerInterval = setInterval(() => {
    examTimeRemaining -= 1000;
    updateTimerDisplay();
    
    if (examTimeRemaining <= 0) {
      clearInterval(timerInterval);
      submitExam();
    }
    
    // Auto-save exam state every 30 seconds
    if (Date.now() % 30000 < 1000) {
      saveExamState(currentExam.testId, examAnswers, examMarked, currentQuestionIndex);
    }
  }, 1000);
}

// Update timer display
function updateTimerDisplay() {
  const totalSeconds = Math.max(0, Math.floor(examTimeRemaining / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const timerEl = document.getElementById('exam-timer');
  if (timerEl) {
    timerEl.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
}

// Select answer
function selectAnswer(optionIndex) {
  examAnswers[currentQuestionIndex] = optionIndex;
  saveExamState(currentExam.testId, examAnswers, examMarked, currentQuestionIndex);
  renderCurrentQuestion();
  updateQuestionNav();
}

// Toggle mark
function toggleMark() {
  examMarked[currentQuestionIndex] = !examMarked[currentQuestionIndex];
  saveExamState(currentExam.testId, examAnswers, examMarked, currentQuestionIndex);
  renderCurrentQuestion();
  updateQuestionNav();
}

// Navigate to question
function goToQuestion(index) {
  if (index >= 0 && index < currentExam.totalQuestions) {
    currentQuestionIndex = index;
    renderCurrentQuestion();
    updateQuestionNav();
  }
}

// Previous question
function previousQuestion() {
  if (currentQuestionIndex > 0) {
    goToQuestion(currentQuestionIndex - 1);
  }
}

// Next question
function nextQuestion() {
  if (currentQuestionIndex < currentExam.totalQuestions - 1) {
    goToQuestion(currentQuestionIndex + 1);
  }
}

// Submit exam
function submitExam() {
  clearInterval(timerInterval);
  
  // Calculate results
  const correct = examAnswers.filter((answer, i) => {
    const question = currentExam.questions[i];
    if (question.correctAnswer === undefined) return false;
    return answer === question.correctAnswer || answer === getAnswerIndex(question.correctAnswer);
  }).length;
  
  const unanswered = examAnswers.filter(a => a === null).length;
  const accuracy = Math.round((correct / currentExam.totalQuestions) * 100);
  
  // Save result
  const result = saveTestResult(
    currentExam.testId,
    currentExam.testName,
    currentExam.part,
    correct,
    currentExam.totalQuestions,
    accuracy,
    examAnswers,
    examMarked
  );
  
  // Clear saved state
  localStorage.removeItem(`exam_state_${currentExam.testId}`);
  
  // Show results
  showExamResults(result);
}

// Get answer index from letter (A=0, B=1, C=2, D=3)
function getAnswerIndex(answer) {
  if (typeof answer === 'number') return answer;
  return answer.charCodeAt(0) - 65; // A=65 in ASCII
}

// Exit exam
function exitExam() {
  if (confirm('Bạn có chắc chắn muốn thoát? Dữ liệu hiện tại sẽ được lưu.')) {
    clearInterval(timerInterval);
    saveExamState(currentExam.testId, examAnswers, examMarked, currentQuestionIndex);
    currentExam = null;
    navigateToPage('dashboard');
  }
}