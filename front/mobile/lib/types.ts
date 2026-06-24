export type UserRole = 'admin' | 'student';

export type CourseId = string;

export type CourseOption = { id: CourseId; label: string };

export type UserProfile = {
  mobile?: string;
  address?: string;
  education?: string;
  educationMarks?: string;
  avatarUrl?: string;
};

export type AppUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isOwner?: boolean;
  courses?: CourseId[];
  profile?: UserProfile;
};

export type MediaItem = {
  id: string;
  title: string;
  type: 'pdf' | 'video';
  url: string;
  course: CourseId;
  thumbnail?: string;
  description?: string;
  size?: string;
  sizeBytes?: number;
  dateModified?: string;
  uploadedBy?: string;
};

export type StorageStats = {
  quotaBytes?: number;
  quotaLabel: string;
  usedBytes?: number;
  usedLabel: string;
  percentUsed: number;
  percentLabel: string;
  videoCount?: number;
  pdfCount?: number;
  videoBytes?: number;
  pdfBytes?: number;
  videoLabel: string;
  pdfLabel: string;
};

export type AuthResponse = {
  success: boolean;
  message?: string;
  token?: string;
  user?: AppUser;
};

export type ApiResult = {
  success: boolean;
  message?: string;
};
