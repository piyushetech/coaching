export type CourseId = string;

export type CourseOption = { id: CourseId; label: string };

export const DEFAULT_COURSES: CourseOption[] = [
  { id: 'jee', label: 'JEE' },
  { id: 'neet', label: 'NEET' },
  { id: 'gk', label: 'GK' },
  { id: 'ssc', label: 'SSC' },
  { id: 'up-police', label: 'UP Police' }
];

/** @deprecated Use CoursesService.courses() */
export const COURSES = DEFAULT_COURSES;

export function courseLabel(id: CourseId, list: CourseOption[] = DEFAULT_COURSES): string {
  return list.find((c) => c.id === id)?.label ?? id;
}

export function courseLabels(ids: CourseId[] | undefined, list: CourseOption[] = DEFAULT_COURSES): string {
  if (!ids?.length) return '—';
  return ids.map((id) => courseLabel(id, list)).join(', ');
}
