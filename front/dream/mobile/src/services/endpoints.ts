import api from './api';
import {
  AuthResponse,
  NannyProfile,
  ParentProfile,
  SearchFilters,
  PaginatedResponse,
  HiringRequest,
  Chat,
  Message,
  Review,
  Notification,
} from '../types';

export const authApi = {
  register: (data: {
    email: string;
    password: string;
    role: string;
    fullName: string;
    phone?: string;
    address?: string;
    city?: string;
    budget?: string;
    experienceYears?: string;
    aboutMe?: string;
  }) =>
    api.post<{ data: AuthResponse }>('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post<{ data: AuthResponse }>('/auth/login', data),
  verifyEmail: (data: { email: string; otp: string }) =>
    api.post('/auth/verify-email', data),
  resendOTP: (email: string) => api.post('/auth/resend-otp', { email }),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data: { email: string; otp: string; newPassword: string }) =>
    api.post('/auth/reset-password', data),
  logout: () => api.post('/auth/logout'),
};

export const searchApi = {
  search: (filters: SearchFilters) =>
    api.get<{ data: NannyProfile[]; pagination: PaginatedResponse<NannyProfile>['pagination'] }>(
      '/search',
      { params: filters }
    ),
  getById: (id: string) => api.get<{ data: NannyProfile }>(`/search/${id}`),
  recommendations: () => api.get<{ data: NannyProfile[] }>('/search/recommendations'),
};

export const parentApi = {
  getProfile: () => api.get<{ data: ParentProfile }>('/parents/profile'),
  updateProfile: (data: Partial<ParentProfile>) => api.patch('/parents/profile', data),
  getFavorites: () => api.get('/parents/favorites'),
  addFavorite: (nannyId: string) => api.post(`/parents/favorites/${nannyId}`),
  removeFavorite: (nannyId: string) => api.delete(`/parents/favorites/${nannyId}`),
};

export const nannyApi = {
  getProfile: () => api.get<{ data: NannyProfile }>('/nannies/profile'),
  updateProfile: (data: Partial<NannyProfile>) => api.patch('/nannies/profile', data),
  updateAvailability: (availability: unknown[]) =>
    api.patch('/nannies/availability', { availability }),
  updateOnlineStatus: (isOnline: boolean) =>
    api.patch('/nannies/online-status', { isOnline }),
};

export const hiringApi = {
  getRequests: (params?: { status?: string; page?: number }) =>
    api.get<{ data: HiringRequest[]; pagination: PaginatedResponse<HiringRequest>['pagination'] }>(
      '/hiring',
      { params }
    ),
  create: (data: {
    nannyId: string;
    message?: string;
    pricingType?: string;
    agreedRate?: number;
    startDate?: string;
    endDate?: string;
  }) => api.post<{ data: HiringRequest }>('/hiring', data),
  respond: (requestId: string, action: 'accept' | 'reject') =>
    api.patch(`/hiring/${requestId}/respond`, { action }),
  scheduleInterview: (requestId: string, interview: object) =>
    api.patch(`/hiring/${requestId}/interview`, interview),
  confirm: (requestId: string) => api.patch(`/hiring/${requestId}/confirm`),
  complete: (requestId: string) => api.patch(`/hiring/${requestId}/complete`),
  cancel: (requestId: string, reason?: string) =>
    api.patch(`/hiring/${requestId}/cancel`, { reason }),
};

export const chatApi = {
  getChats: () => api.get<{ data: Chat[] }>('/chat'),
  getMessages: (chatId: string, page?: number) =>
    api.get<{ data: Message[] }>(`/chat/${chatId}/messages`, { params: { page } }),
  deleteMessage: (messageId: string) => api.delete(`/chat/messages/${messageId}`),
  blockUser: (chatId: string) => api.post(`/chat/${chatId}/block`),
};

export const reviewApi = {
  create: (data: { nannyId: string; rating: number; comment?: string; hiringRequestId?: string }) =>
    api.post('/reviews', data),
  getForNanny: (nannyId: string) => api.get<{ data: Review[] }>(`/reviews/nanny/${nannyId}`),
};

export const notificationApi = {
  getAll: (page?: number) => api.get<{ data: Notification[]; unreadCount: number }>('/notifications', { params: { page } }),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
  reportUser: (data: { reportedUserId: string; reason: string; description?: string }) =>
    api.post('/notifications/report', data),
};

export const formatRate = (nanny: NannyProfile): string => {
  switch (nanny.pricingType) {
    case 'daily':
      return `₹${nanny.dailyRate?.toLocaleString() || 0}/day`;
    case 'monthly':
      return `₹${nanny.monthlySalary?.toLocaleString() || 0}/mo`;
    default:
      return `₹${nanny.hourlyRate?.toLocaleString() || 0}/hr`;
  }
};
