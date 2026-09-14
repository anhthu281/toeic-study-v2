// Data Loader for TOEIC Tests

let allTestsData = {};

// Load test data from JSON files
async function loadTestData(part, testNumber) {
  try {
    const padded = String(testNumber).padStart(2, '0');
    const response = await fetch(`data/${part}/test${padded}.json`);
    if (!response.ok) {
      throw new Error(`Failed to load ${part} test ${testNumber}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error loading test data:', error);
    return null;
  }
}

// Load grammar data
async function loadGrammarData() {
  try {
    const response = await fetch('data/grammar.json');
    if (!response.ok) {
      throw new Error('Failed to load grammar data');
    }
    const data = await response.json();
    return data.grammar || [];
  } catch (error) {
    console.error('Error loading grammar data:', error);
    return [];
  }
}

// Get all Part 5 tests
async function loadAllPart5Tests() {
  const tests = [];
  for (let i = 1; i <= 10; i++) {
    const data = await loadTestData('part5', i);
    if (data) tests.push(data);
  }
  return tests;
}

// Get all Part 6 tests
async function loadAllPart6Tests() {
  const tests = [];
  for (let i = 1; i <= 10; i++) {
    const data = await loadTestData('part6', i);
    if (data) tests.push(data);
  }
  return tests;
}

// Get all Part 7 tests
async function loadAllPart7Tests() {
  const tests = [];
  for (let i = 1; i <= 10; i++) {
    const data = await loadTestData('part7', i);
    if (data) tests.push(data);
  }
  return tests;
}

// Combine tests for Full Reading
async function loadFullReadingTest(testNumber) {
  const part5 = await loadTestData('part5', testNumber);
  const part6 = await loadTestData('part6', testNumber);
  const part7 = await loadTestData('part7', testNumber);
  
  if (!part5 || !part6 || !part7) return null;
  
  const questions = [];
  let questionNum = 101;
  
  // Add Part 5 questions (101-130)
  part5.questions.forEach(q => {
    questions.push({...q, number: questionNum++, part: 5});
  });
  
  // Add Part 6 questions (131-146)
  part6.passages.forEach(passage => {
    passage.questions.forEach(q => {
      questions.push({...q, number: questionNum++, part: 6, passage: passage});
    });
  });
  
  // Add Part 7 questions (147-200)
  let passageTypes = {single: 0, double: 0, triple: 0};
  part7.passages.forEach(passage => {
    passage.questions.forEach(q => {
      questions.push({...q, number: questionNum++, part: 7, passage: passage});
    });
  });
  
  return {
    testId: `full-reading-test${String(testNumber).padStart(2, '0')}`,
    testName: `Full Reading Test ${testNumber}`,
    part: 'full-reading',
    totalQuestions: 100,
    timeLimit: 75 * 60, // 75 minutes in seconds
    questions: questions,
    part5: part5,
    part6: part6,
    part7: part7
  };
}

// Preload test metadata (for listing)
async function getTestMetadata(part, testNumber) {
  const data = await loadTestData(part, testNumber);
  if (!data) return null;
  
  const result = getTestResult(`${part}-test${String(testNumber).padStart(2, '0')}`);
  return {
    testNumber: testNumber,
    totalQuestions: data.totalQuestions || data.questions?.length || 0,
    completed: !!result,
    score: result?.score || null,
    accuracy: result?.accuracy || null,
    date: result?.date || null
  };
}