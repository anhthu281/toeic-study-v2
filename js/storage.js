// LocalStorage Management for TOEIC Study

// Save test result
function saveTestResult(testId, testName, part, correct, total, accuracy, answers, marked) {
  const result = {
    testId: testId,
    testName: testName,
    part: part,
    correct: correct,
    total: total,
    accuracy: accuracy,
    score: calculateScore(correct, total),
    answers: answers,
    marked: marked,
    date: new Date().toISOString()
  };
  
  let history = JSON.parse(localStorage.getItem('toeic_test_history') || '[]');
  history.unshift(result);
  localStorage.setItem('toeic_test_history', JSON.stringify(history.slice(0, 100)));
  
  return result;
}

// Calculate estimated TOEIC score
function calculateScore(correct, total) {
  const accuracy = (correct / total) * 100;
  if (total === 30) {
    // Part 5 only: 30 questions, max 100 points in Reading
    return Math.round(100 * (accuracy / 100));
  } else if (total === 16) {
    // Part 6 only: 16 questions, max 100 points in Reading
    return Math.round(100 * (accuracy / 100));
  } else if (total === 54) {
    // Part 7 only: 54 questions, max 100 points in Reading
    return Math.round(100 * (accuracy / 100));
  } else if (total === 100) {
    // Full Reading: 100 questions, max 495 points in Reading (TOEIC scale)
    return Math.round(300 + (accuracy / 100) * 195);
  }
  return 0;
}

// Get test history
function getTestHistory() {
  return JSON.parse(localStorage.getItem('toeic_test_history') || '[]');
}

// Get specific test result
function getTestResult(testId) {
  const history = getTestHistory();
  return history.find(h => h.testId === testId);
}

// Get all answers from history
function getAllAnswers() {
  const history = getTestHistory();
  return history.reduce((total, test) => total + test.total, 0);
}

// Save current exam state
function saveExamState(examId, answers, marked, currentQuestion) {
  const state = {
    examId: examId,
    answers: answers,
    marked: marked,
    currentQuestion: currentQuestion,
    timestamp: Date.now()
  };
  localStorage.setItem(`exam_state_${examId}`, JSON.stringify(state));
}

// Load exam state
function loadExamState(examId) {
  const state = localStorage.getItem(`exam_state_${examId}`);
  return state ? JSON.parse(state) : null;
}

// Get Part 5 stats
function getPart5Stats() {
  const history = getTestHistory();
  const part5Tests = history.filter(h => h.part === 'part5');
  const progress = Math.min((part5Tests.length / 10) * 100, 100);
  return {
    completed: part5Tests.length,
    progress: progress,
    avgAccuracy: part5Tests.length > 0 ? Math.round(part5Tests.reduce((sum, t) => sum + t.accuracy, 0) / part5Tests.length) : 0
  };
}

// Get Part 6 stats
function getPart6Stats() {
  const history = getTestHistory();
  const part6Tests = history.filter(h => h.part === 'part6');
  const progress = Math.min((part6Tests.length / 10) * 100, 100);
  return {
    completed: part6Tests.length,
    progress: progress,
    avgAccuracy: part6Tests.length > 0 ? Math.round(part6Tests.reduce((sum, t) => sum + t.accuracy, 0) / part6Tests.length) : 0
  };
}

// Get Part 7 stats
function getPart7Stats() {
  const history = getTestHistory();
  const part7Tests = history.filter(h => h.part === 'part7');
  const progress = Math.min((part7Tests.length / 10) * 100, 100);
  return {
    completed: part7Tests.length,
    progress: progress,
    avgAccuracy: part7Tests.length > 0 ? Math.round(part7Tests.reduce((sum, t) => sum + t.accuracy, 0) / part7Tests.length) : 0
  };
}

// Clear all data
function clearAllData() {
  if (confirm('Bạn chắc chắn muốn xóa tất cả lịch sử? Hành động này không thể hoàn tác.')) {
    localStorage.removeItem('toeic_test_history');
    location.reload();
  }
}