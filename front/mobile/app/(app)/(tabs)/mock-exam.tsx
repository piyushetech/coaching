import { useCallback, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { courseLabel, fetchCourses, fetchExams, filterExamsForUser } from '@/lib/api';
import { COURSE_ICONS } from '@/lib/exam';
import type { MockExam } from '@/lib/exam';
import { useAuth } from '@/lib/auth';
import type { CourseOption } from '@/lib/types';

export default function MockExamListScreen() {
  const { user, isStudent } = useAuth();
  const [exams, setExams] = useState<MockExam[]>([]);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const [list, courseList] = await Promise.all([fetchExams(), fetchCourses()]);
      setCourses(courseList);
      setExams(filterExamsForUser(list, user));
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load exams');
      setExams([]);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load().finally(() => setLoading(false));
    }, [load])
  );

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  function startExam(exam: MockExam) {
    router.push({ pathname: '/exam/[id]', params: { id: exam.id, title: exam.title } });
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.heading}>Mock Exams</Text>
      <Text style={styles.sub}>
        {isStudent ? 'Pick an exam to practice with timed questions.' : 'Exams available to your students by course.'}
      </Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FlatList
        data={exams}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No mock exams available yet.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHead}>
              <Text style={styles.icon}>{COURSE_ICONS[item.course] ?? '📝'}</Text>
              <View style={styles.cardMeta}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.meta}>
                  {courseLabel(item.course, courses)} · {item.questions} Q · {item.durationMinutes} min
                </Text>
              </View>
            </View>
            {item.description ? <Text style={styles.desc}>{item.description}</Text> : null}
            {isStudent ? (
              <Pressable style={styles.startBtn} onPress={() => startExam(item)}>
                <Text style={styles.startText}>Start Exam</Text>
              </Pressable>
            ) : (
              <Text style={styles.adminNote}>Students in {courseLabel(item.course, courses)} can attempt this exam.</Text>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f8fafc' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  heading: { fontSize: 22, fontWeight: '800', color: '#0f172a', paddingHorizontal: 16, paddingTop: 8 },
  sub: { fontSize: 13, color: '#64748b', paddingHorizontal: 16, marginBottom: 8 },
  error: { color: '#dc2626', paddingHorizontal: 16, marginBottom: 8 },
  list: { padding: 16, gap: 12, paddingBottom: 32 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12
  },
  cardHead: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  icon: { fontSize: 28 },
  cardMeta: { flex: 1 },
  title: { fontSize: 17, fontWeight: '800', color: '#0f172a' },
  meta: { fontSize: 12, color: '#64748b', marginTop: 4 },
  desc: { fontSize: 13, color: '#475569', marginTop: 10, lineHeight: 18 },
  startBtn: {
    marginTop: 14,
    backgroundColor: '#4f46e5',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center'
  },
  startText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  adminNote: { marginTop: 12, fontSize: 12, color: '#64748b', fontStyle: 'italic' },
  empty: { textAlign: 'center', color: '#64748b', marginTop: 40, fontSize: 15 }
});
