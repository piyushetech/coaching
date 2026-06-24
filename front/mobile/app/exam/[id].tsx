import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { fetchExamQuestions, fetchExams, submitExamAttempt } from '@/lib/api';
import { computeResults, formatTime, type ExamQuestion, type ExamResultSummary, type MockExam } from '@/lib/exam';
import { useAuth } from '@/lib/auth';

type Phase = 'loading' | 'exam' | 'results';

export default function ExamTakeScreen() {
  const { id, title } = useLocalSearchParams<{ id: string; title?: string }>();
  const { isStudent } = useAuth();

  const [phase, setPhase] = useState<Phase>('loading');
  const [exam, setExam] = useState<MockExam | null>(null);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [results, setResults] = useState<ExamResultSummary | null>(null);
  const [error, setError] = useState('');

  const totalSecondsRef = useRef(0);
  const submittedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeLeftRef = useRef(0);
  const answersRef = useRef<Record<string, number>>({});
  const questionsRef = useRef<ExamQuestion[]>([]);
  const examRef = useRef<MockExam | null>(null);

  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    questionsRef.current = questions;
  }, [questions]);

  useEffect(() => {
    examRef.current = exam;
  }, [exam]);

  const currentQuestion = questions[currentIndex];

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const submitExam = useCallback(async () => {
    if (submittedRef.current || !examRef.current) return;
    submittedRef.current = true;
    stopTimer();
    const timeSpent = totalSecondsRef.current - timeLeftRef.current;
    const summary = computeResults(questionsRef.current, answersRef.current, timeSpent);
    setResults(summary);
    setPhase('results');
    if (isStudent) {
      try {
        await submitExamAttempt(examRef.current.id, {
          score: summary.score,
          total: summary.total,
          accuracy: summary.accuracy,
          timeTaken: summary.timeSpentLabel
        });
      } catch {
        /* attempt save optional */
      }
    }
  }, [isStudent, stopTimer]);

  useEffect(() => {
    if (!isStudent) {
      setError('Only students can take mock exams.');
      setPhase('loading');
      return;
    }
    (async () => {
      try {
        const exams = await fetchExams();
        const found = exams.find((e) => e.id === id);
        if (!found) {
          setError('Exam not found.');
          return;
        }
        const qs = await fetchExamQuestions(found.id);
        setExam(found);
        setQuestions(qs);
        totalSecondsRef.current = found.durationMinutes * 60;
        setTimeLeft(found.durationMinutes * 60);
        submittedRef.current = false;
        setPhase('exam');
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not load exam');
      }
    })();
    return () => stopTimer();
  }, [id, isStudent, stopTimer]);

  useEffect(() => {
    if (phase !== 'exam') return;
    stopTimer();
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          submitExam();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => stopTimer();
  }, [phase, stopTimer, submitExam]);

  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);

  function selectOption(index: number) {
    if (!currentQuestion) return;
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: index }));
  }

  function confirmSubmit() {
    Alert.alert('Submit exam?', `You answered ${answeredCount} of ${questions.length} questions.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Submit', style: 'destructive', onPress: () => void submitExam() }
    ]);
  }

  function optionLetter(idx: number) {
    return String.fromCharCode(65 + idx);
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Stack.Screen options={{ title: title || 'Mock Exam' }} />
        <Text style={styles.error}>{error}</Text>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  if (phase === 'loading') {
    return (
      <View style={styles.center}>
        <Stack.Screen options={{ title: title || 'Mock Exam' }} />
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  if (phase === 'results' && results) {
    const passed = results.accuracy >= 60;
    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.resultsContent}>
        <Stack.Screen options={{ title: 'Results', headerBackVisible: false }} />
        <Text style={[styles.resultBadge, passed ? styles.pass : styles.fail]}>
          {passed ? 'Passed' : 'Keep practicing'}
        </Text>
        <Text style={styles.resultScore}>{results.score}/{results.total}</Text>
        <Text style={styles.resultAcc}>{results.accuracy}% accuracy · {results.timeSpentLabel}</Text>

        {results.sectionBreakdown.map((s) => (
          <View key={s.section} style={styles.sectionRow}>
            <Text style={styles.sectionName}>{s.section}</Text>
            <Text style={styles.sectionStat}>{s.correct}/{s.total} ({s.percentage}%)</Text>
          </View>
        ))}

        <Pressable style={styles.backBtn} onPress={() => router.replace('/(app)/(tabs)/mock-exam')}>
          <Text style={styles.backBtnText}>Back to exams</Text>
        </Pressable>
      </ScrollView>
    );
  }

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ title: exam?.title || title || 'Exam' }} />

      <View style={styles.topBar}>
        <Text style={[styles.timer, timeLeft <= 60 && styles.timerCritical]}>{formatTime(timeLeft)}</Text>
        <Text style={styles.progress}>
          Q{currentIndex + 1}/{questions.length} · {answeredCount} answered
        </Text>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        {currentQuestion ? (
          <>
            <Text style={styles.category}>{currentQuestion.category}</Text>
            <Text style={styles.question}>{currentQuestion.question}</Text>
            {currentQuestion.options.map((opt, idx) => {
              const selected = answers[currentQuestion.id] === idx;
              return (
                <Pressable
                  key={idx}
                  style={[styles.option, selected && styles.optionSelected]}
                  onPress={() => selectOption(idx)}
                >
                  <Text style={[styles.optionLetter, selected && styles.optionLetterSelected]}>
                    {optionLetter(idx)}
                  </Text>
                  <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{opt}</Text>
                </Pressable>
              );
            })}
          </>
        ) : null}
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.palette} contentContainerStyle={styles.paletteContent}>
        {questions.map((q, idx) => {
          const answered = answers[q.id] !== undefined;
          const active = idx === currentIndex;
          return (
            <Pressable
              key={q.id}
              style={[styles.paletteDot, answered && styles.paletteAnswered, active && styles.paletteActive]}
              onPress={() => setCurrentIndex(idx)}
            >
              <Text style={styles.paletteDotText}>{idx + 1}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={[styles.navBtn, currentIndex === 0 && styles.navBtnDisabled]}
          disabled={currentIndex === 0}
          onPress={() => setCurrentIndex((i) => Math.max(0, i - 1))}
        >
          <Text style={styles.navBtnText}>Previous</Text>
        </Pressable>
        {currentIndex < questions.length - 1 ? (
          <Pressable style={styles.navBtn} onPress={() => setCurrentIndex((i) => i + 1)}>
            <Text style={styles.navBtnText}>Next</Text>
          </Pressable>
        ) : (
          <Pressable style={styles.submitBtn} onPress={confirmSubmit}>
            <Text style={styles.submitText}>Submit</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f8fafc' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0'
  },
  timer: { fontSize: 18, fontWeight: '800', color: '#4f46e5' },
  timerCritical: { color: '#dc2626' },
  progress: { fontSize: 13, color: '#64748b' },
  body: { flex: 1 },
  bodyContent: { padding: 16 },
  category: { fontSize: 12, fontWeight: '700', color: '#6366f1', marginBottom: 8, textTransform: 'uppercase' },
  question: { fontSize: 17, fontWeight: '700', color: '#0f172a', lineHeight: 24, marginBottom: 16 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10
  },
  optionSelected: { borderColor: '#4f46e5', backgroundColor: '#eef2ff' },
  optionLetter: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f1f5f9',
    textAlign: 'center',
    lineHeight: 28,
    fontWeight: '800',
    color: '#475569',
    overflow: 'hidden'
  },
  optionLetterSelected: { backgroundColor: '#4f46e5', color: '#fff' },
  optionText: { flex: 1, fontSize: 15, color: '#334155' },
  optionTextSelected: { color: '#312e81', fontWeight: '600' },
  palette: { maxHeight: 52, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e2e8f0' },
  paletteContent: { paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  paletteDot: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8
  },
  paletteAnswered: { backgroundColor: '#dcfce7' },
  paletteActive: { borderWidth: 2, borderColor: '#4f46e5' },
  paletteDotText: { fontSize: 13, fontWeight: '700', color: '#334155' },
  footer: {
    flexDirection: 'row',
    gap: 10,
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0'
  },
  navBtn: {
    flex: 1,
    backgroundColor: '#e2e8f0',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center'
  },
  navBtnDisabled: { opacity: 0.4 },
  navBtnText: { fontWeight: '700', color: '#334155' },
  submitBtn: {
    flex: 1,
    backgroundColor: '#4f46e5',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center'
  },
  submitText: { fontWeight: '800', color: '#fff' },
  resultsContent: { padding: 24, alignItems: 'center' },
  resultBadge: { fontSize: 14, fontWeight: '800', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999, overflow: 'hidden' },
  pass: { backgroundColor: '#dcfce7', color: '#166534' },
  fail: { backgroundColor: '#fee2e2', color: '#991b1b' },
  resultScore: { fontSize: 48, fontWeight: '900', color: '#0f172a', marginTop: 16 },
  resultAcc: { fontSize: 16, color: '#64748b', marginBottom: 24 },
  sectionRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0'
  },
  sectionName: { fontWeight: '700', color: '#334155' },
  sectionStat: { color: '#64748b' },
  backBtn: {
    marginTop: 28,
    backgroundColor: '#4f46e5',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12
  },
  backBtnText: { color: '#fff', fontWeight: '800' },
  error: { color: '#dc2626', textAlign: 'center', marginBottom: 16 }
});
