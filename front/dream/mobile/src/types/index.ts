export type UserRole = 'parent' | 'nanny' | 'admin';

export type PricingType = 'hourly' | 'daily' | 'monthly';

export interface User {
  _id: string;
  email: string;
  role: UserRole;
  isEmailVerified: boolean;
  isActive: boolean;
}

export interface Location {
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  area?: string;
  zipCode?: string;
  coordinates?: {
    type: 'Point';
    coordinates: [number, number];
  };
}

export interface NannySkills {
  cooking: boolean;
  cleaning: boolean;
  infantCare: boolean;
  toddlerCare: boolean;
  specialNeeds: boolean;
  homeworkHelp: boolean;
  petFriendly: boolean;
  nightShift: boolean;
  weekendAvailable: boolean;
}

export interface NannyProfile {
  _id: string;
  user: User;
  fullName: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  phone?: string;
  profilePicture?: string;
  aboutMe?: string;
  experienceYears: number;
  education?: { degree: string; institution: string; year: number }[];
  languages: string[];
  pricingType: PricingType;
  hourlyRate?: number;
  dailyRate?: number;
  monthlySalary?: number;
  liveIn: boolean;
  liveOut: boolean;
  preferredCities: string[];
  location?: Location;
  skills: NannySkills;
  certifications: { firstAid: boolean; cpr: boolean };
  backgroundVerified: boolean;
  policeVerified: boolean;
  identityVerified: boolean;
  rating: number;
  reviewCount: number;
  completedJobs: number;
  responseTimeMinutes: number;
  isOnline: boolean;
  instantHire: boolean;
  isFeatured: boolean;
  profileCompletion: number;
  gallery: string[];
}

export interface ParentProfile {
  _id: string;
  user: User;
  fullName: string;
  phone?: string;
  profilePicture?: string;
  budget?: number;
  location?: Location;
  favoriteNannies: string[];
  profileCompletion: number;
}

export interface HiringRequest {
  _id: string;
  parent: ParentProfile;
  nanny: NannyProfile;
  status: string;
  message?: string;
  pricingType: PricingType;
  agreedRate?: number;
  startDate?: string;
  endDate?: string;
  chatEnabled: boolean;
  interview?: {
    scheduledAt?: string;
    location?: string;
    meetingLink?: string;
    notes?: string;
  };
  createdAt: string;
}

export interface Message {
  _id: string;
  chat: string;
  sender: User;
  content?: string;
  messageType: 'text' | 'image' | 'document' | 'voice';
  mediaUrl?: string;
  fileName?: string;
  readBy: string[];
  createdAt: string;
}

export interface Chat {
  _id: string;
  participants: User[];
  lastMessage?: string;
  lastMessageAt?: string;
}

export interface Review {
  _id: string;
  parent: ParentProfile;
  nanny: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface Notification {
  _id: string;
  title: string;
  body: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export interface SearchFilters {
  q?: string;
  city?: string;
  country?: string;
  area?: string;
  lat?: number;
  lng?: number;
  distance?: number;
  experience?: number;
  minPrice?: number;
  maxPrice?: number;
  pricingType?: PricingType;
  rating?: number;
  gender?: string;
  languages?: string;
  verifiedOnly?: boolean;
  liveIn?: boolean;
  liveOut?: boolean;
  cpr?: boolean;
  firstAid?: boolean;
  specialNeeds?: boolean;
  infantCare?: boolean;
  nightShift?: boolean;
  weekendAvailable?: boolean;
  instantHire?: boolean;
  page?: number;
  limit?: number;
}

export interface AuthResponse {
  user: User;
  profile: ParentProfile | NannyProfile;
  accessToken: string;
  refreshToken: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}
