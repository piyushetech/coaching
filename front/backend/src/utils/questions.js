const BASE_QUESTIONS = [
  {
    category: 'Aptitude',
    question: 'If A is taller than B but shorter than C, and D is taller than C, who is the shortest?',
    options: ['A', 'B', 'C', 'D'],
    correctIndex: 1
  },
  {
    category: 'Aptitude',
    question: 'Find the next number in the series: 2, 6, 12, 20, 30, ?',
    options: ['38', '40', '42', '44'],
    correctIndex: 2
  },
  {
    category: 'Aptitude',
    question: 'A clock shows 3:15. What is the angle between the hour and minute hands?',
    options: ['0°', '7.5°', '15°', '22.5°'],
    correctIndex: 1
  },
  {
    category: 'Math',
    question: 'What is 25% of 480?',
    options: ['100', '120', '140', '160'],
    correctIndex: 1
  },
  {
    category: 'Math',
    question: 'The average of 5 numbers is 20. If one number is removed, the average becomes 18. What is the removed number?',
    options: ['26', '28', '30', '32'],
    correctIndex: 1
  },
  {
    category: 'Math',
    question: 'A train 150 m long passes a pole in 15 seconds. Find its speed in km/h.',
    options: ['30', '36', '40', '45'],
    correctIndex: 1
  },
  {
    category: 'GK',
    question: 'Who is known as the "Father of the Indian Constitution"?',
    options: ['Mahatma Gandhi', 'Dr. B.R. Ambedkar', 'Jawaharlal Nehru', 'Sardar Patel'],
    correctIndex: 1
  },
  {
    category: 'GK',
    question: 'Which is the largest state of India by area?',
    options: ['Madhya Pradesh', 'Maharashtra', 'Rajasthan', 'Uttar Pradesh'],
    correctIndex: 2
  },
  {
    category: 'GK',
    question: 'The currency of Japan is:',
    options: ['Yuan', 'Won', 'Yen', 'Ringgit'],
    correctIndex: 2
  },
  {
    category: 'English',
    question: 'Choose the correct synonym of "Abundant":',
    options: ['Scarce', 'Plentiful', 'Tiny', 'Weak'],
    correctIndex: 1
  },
  {
    category: 'English',
    question: 'Fill in the blank: She _____ to the market every Sunday.',
    options: ['go', 'goes', 'going', 'gone'],
    correctIndex: 1
  },
  {
    category: 'English',
    question: 'Identify the correctly spelled word:',
    options: ['Accomodation', 'Accommodation', 'Acommodation', 'Acomodation'],
    correctIndex: 1
  }
];

const CATEGORIES = ['Aptitude', 'Math', 'GK', 'English'];

export function generateQuestions(examId, count = 50) {
  return Array.from({ length: count }, (_, i) => {
    const base = BASE_QUESTIONS[i % BASE_QUESTIONS.length];
    const cycle = Math.floor(i / BASE_QUESTIONS.length) + 1;
    return {
      id: `${examId}-q${i + 1}`,
      number: i + 1,
      category: CATEGORIES[i % 4],
      question: cycle > 1 ? `[Set ${cycle}] ${base.question}` : base.question,
      options: [...base.options],
      correctIndex: base.correctIndex
    };
  });
}

export function performanceTier(avgAccuracy) {
  if (avgAccuracy === null || avgAccuracy === undefined) return 'none';
  if (avgAccuracy >= 80) return 'good';
  if (avgAccuracy >= 60) return 'average';
  return 'needs-improvement';
}
