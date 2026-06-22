import { CourseId } from '../constants/courses';

export type ExamCategory = 'Aptitude' | 'Math' | 'GK' | 'English';

export type MockExam = {
  id: string;
  title: string;
  examType: string;
  course: CourseId;
  description: string;
  questions: number;
  durationMinutes: number;
  sections: string[];
  createdAt?: string;
  createdBy?: string;
};

export type ExamQuestion = {
  id: string;
  number: number;
  category: ExamCategory;
  question: string;
  options: string[];
  correctIndex: number;
};

export type ExamAttempt = {
  id: string;
  studentId: string;
  studentName: string;
  examId: string;
  examTitle: string;
  examType: string;
  course: CourseId;
  score: number;
  total: number;
  accuracy: number;
  timeTaken: string;
  date: string;
};

export type StudentPerformanceTier = 'good' | 'average' | 'needs-improvement' | 'none';

export type ReviewItem = ExamQuestion & {
  selectedIndex: number | null;
  isCorrect: boolean;
  isSkipped: boolean;
};

export type ExamResultSummary = {
  score: number;
  total: number;
  accuracy: number;
  timeSpentSeconds: number;
  timeSpentLabel: string;
  sectionBreakdown: { section: string; correct: number; total: number; percentage: number }[];
  review: ReviewItem[];
};

export const EXAM_TYPES = ['JEE', 'NEET', 'MHT-CET', 'Foundation', 'Boards', 'SSC', 'UP Police', 'TET', 'Patwari'];

export const DEFAULT_EXAMS: MockExam[] = [
  {
    id: 'jee-m1',
    title: 'JEE Full Mock 1',
    examType: 'JEE',
    course: 'jee',
    description: 'Full-length JEE Main pattern — Physics, Chemistry & Mathematics.',
    questions: 50,
    durationMinutes: 60,
    sections: ['Aptitude', 'Math', 'GK', 'English']
  },
  {
    id: 'neet-m1',
    title: 'NEET Full Mock 1',
    examType: 'NEET',
    course: 'neet',
    description: 'NEET UG pattern — Biology, Physics & Chemistry.',
    questions: 50,
    durationMinutes: 60,
    sections: ['Aptitude', 'Math', 'GK', 'English']
  },
  {
    id: 'cet-m1',
    title: 'MHT-CET Mock 1',
    examType: 'MHT-CET',
    course: 'mht-cet',
    description: 'Maharashtra CET practice paper with timed sections.',
    questions: 50,
    durationMinutes: 60,
    sections: ['Aptitude', 'Math', 'GK', 'English']
  },
  {
    id: 'foundation-m1',
    title: 'Foundation Mock 1',
    examType: 'Foundation',
    course: 'foundation',
    description: 'Class 9–10 foundation science & maths mock test.',
    questions: 50,
    durationMinutes: 60,
    sections: ['Aptitude', 'Math', 'GK', 'English']
  },
  {
    id: 'boards-m1',
    title: 'Boards Mock 1',
    examType: 'Boards',
    course: 'boards',
    description: 'CBSE/State board class 11–12 comprehensive mock.',
    questions: 50,
    durationMinutes: 60,
    sections: ['Aptitude', 'Math', 'GK', 'English']
  }
];

const BASE_QUESTIONS: Omit<ExamQuestion, 'id' | 'number'>[] = [
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

const CATEGORIES: ExamCategory[] = ['Aptitude', 'Math', 'GK', 'English'];

export function generateQuestions(examId: string, count = 50): ExamQuestion[] {
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

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${String(s).padStart(2, '0')}s`;
}

export function computeResults(
  questions: ExamQuestion[],
  answers: Record<string, number>,
  timeSpentSeconds: number
): ExamResultSummary {
  let correct = 0;
  const sectionStats: Record<string, { correct: number; total: number }> = {};

  const review: ReviewItem[] = questions.map((q) => {
    const selected = answers[q.id];
    const isCorrect = selected === q.correctIndex;
    if (isCorrect) correct++;
    if (!sectionStats[q.category]) sectionStats[q.category] = { correct: 0, total: 0 };
    sectionStats[q.category].total++;
    if (isCorrect) sectionStats[q.category].correct++;

    return {
      ...q,
      selectedIndex: selected ?? null,
      isCorrect,
      isSkipped: selected === undefined
    };
  });

  const total = questions.length;
  return {
    score: correct,
    total,
    accuracy: total ? Math.round((correct / total) * 100) : 0,
    timeSpentSeconds,
    timeSpentLabel: formatDuration(timeSpentSeconds),
    sectionBreakdown: Object.entries(sectionStats).map(([section, stat]) => ({
      section,
      correct: stat.correct,
      total: stat.total,
      percentage: Math.round((stat.correct / stat.total) * 100)
    })),
    review
  };
}

export function groupExamsByCourse(exams: MockExam[]): Record<string, MockExam[]> {
  return exams.reduce<Record<string, MockExam[]>>((acc, exam) => {
    const key = exam.course;
    if (!acc[key]) acc[key] = [];
    acc[key].push(exam);
    return acc;
  }, {});
}

export const COURSE_ICONS: Record<string, string> = {
  jee: '🎯',
  neet: '🧬',
  gk: '🧠',
  ssc: '📋',
  'up-police': '🛡️',
  'mht-cet': '📐',
  foundation: '📘',
  boards: '📚'
};

export const CATEGORY_CLASS: Record<ExamCategory, string> = {
  Aptitude: 'cat-aptitude',
  Math: 'cat-math',
  GK: 'cat-gk',
  English: 'cat-english'
};

export function performanceTier(avgAccuracy: number | null): StudentPerformanceTier {
  if (avgAccuracy === null) return 'none';
  if (avgAccuracy >= 80) return 'good';
  if (avgAccuracy >= 60) return 'average';
  return 'needs-improvement';
}

export function performanceLabel(tier: StudentPerformanceTier): string {
  switch (tier) {
    case 'good': return 'Doing Great';
    case 'average': return 'Average';
    case 'needs-improvement': return 'Needs Focus';
    default: return 'No exams yet';
  }
}
