export type ExamCategory = 'Aptitude' | 'Math' | 'GK' | 'English';

export type MockExam = {
  id: string;
  title: string;
  examType: string;
  course: string;
  description: string;
  questions: number;
  durationMinutes: number;
  sections: string[];
  createdAt?: string;
};

export type ExamQuestion = {
  id: string;
  number: number;
  category: ExamCategory;
  question: string;
  options: string[];
  correctIndex: number;
};

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
