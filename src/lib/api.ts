const API_BASE = '/api';

function getToken(): string | null {
  return localStorage.getItem('caliguide-token');
}

export function setToken(token: string) {
  localStorage.setItem('caliguide-token', token);
}

export function clearToken() {
  localStorage.removeItem('caliguide-token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data as T;
}

// Auth
export const authApi = {
  register: (input: { name: string; email: string; password: string }) =>
    request<{ token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  login: (input: { email: string; password: string }) =>
    request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  me: () => request<any>('/auth/me'),
  updateProfile: (input: { name: string; avatarUrl: string }) =>
    request<any>('/auth/profile', { method: 'PUT', body: JSON.stringify(input) }),
  changePassword: (input: { currentPassword: string; newPassword: string }) =>
    request<any>('/auth/password', { method: 'PUT', body: JSON.stringify(input) }),
  forgotPassword: (email: string) =>
    request<{ message: string; token?: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
  resetPassword: (token: string, newPassword: string) =>
    request<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    }),
};

// Guides
export const guidesApi = {
  list: (params?: { category?: string; search?: string }) => {
    const qs = new URLSearchParams();
    if (params?.category) qs.set('category', params.category);
    if (params?.search) qs.set('search', params.search);
    const query = qs.toString();
    return request<any[]>(`/guides${query ? `?${query}` : ''}`);
  },
  get: (id: string) => request<any>(`/guides/${id}`),
  save: (id: string) => request<{ saved: boolean }>(`/guides/${id}/save`, { method: 'POST' }),
  savedList: () => request<any[]>('/guides/user/saved'),
};

// Forum
export const forumApi = {
  list: (params?: { category?: string; search?: string; tag?: string }) => {
    const qs = new URLSearchParams();
    if (params?.category) qs.set('category', params.category);
    if (params?.search) qs.set('search', params.search);
    if (params?.tag) qs.set('tag', params.tag);
    const query = qs.toString();
    return request<any[]>(`/forum${query ? `?${query}` : ''}`);
  },
  get: (id: string) => request<any>(`/forum/${id}`),
  create: (input: { title: string; content: string; category: string; tags?: string[] }) =>
    request<any>('/forum', { method: 'POST', body: JSON.stringify(input) }),
  reply: (postId: string, content: string) =>
    request<any>(`/forum/${postId}/reply`, { method: 'POST', body: JSON.stringify({ content }) }),
  userPosts: () => request<any[]>('/forum/user/posts'),
  reportPost: (postId: string, reason: string) =>
    request<any>(`/forum/${postId}/report`, { method: 'POST', body: JSON.stringify({ reason }) }),
  reportReply: (replyId: string, reason: string) =>
    request<any>(`/forum/replies/${replyId}/report`, { method: 'POST', body: JSON.stringify({ reason }) }),
};

// Chat
export const chatApi = {
  send: (message: string) =>
    request<{ text: string }>('/chat', { method: 'POST', body: JSON.stringify({ message }) }),
  history: () => request<any[]>('/chat/history'),
  clear: () => request<any>('/chat/history', { method: 'DELETE' }),
};

// Profile
export const profileApi = {
  getChecklist: () => request<any[]>('/profile/checklist'),
  addChecklistItem: (name: string) =>
    request<any>('/profile/checklist', { method: 'POST', body: JSON.stringify({ name }) }),
  toggleChecklistItem: (id: string) =>
    request<any>(`/profile/checklist/${id}`, { method: 'PUT' }),
  deleteChecklistItem: (id: string) =>
    request<any>(`/profile/checklist/${id}`, { method: 'DELETE' }),
  getSettings: () => request<any>('/profile/settings'),
  updateSettings: (settings: any) =>
    request<any>('/profile/settings', { method: 'PUT', body: JSON.stringify(settings) }),
};

// Admin
export const adminApi = {
  getStats: () => request<any>('/admin/stats'),
  getReports: () => request<any[]>('/admin/reports'),
  updateReportStatus: (id: string, status: string) =>
    request<any>(`/admin/reports/${id}`, { method: 'PUT', body: JSON.stringify({ status }) }),
  // Post moderation
  getPendingPosts: () => request<any[]>('/admin/posts/pending'),
  getAllPosts: (params?: { status?: string; category?: string }) => {
    const qs = new URLSearchParams();
    if (params?.status) qs.set('status', params.status);
    if (params?.category) qs.set('category', params.category);
    const query = qs.toString();
    return request<any[]>(`/admin/posts/all${query ? `?${query}` : ''}`);
  },
  updatePostStatus: (id: string, status: string) =>
    request<any>(`/admin/posts/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  pinPost: (id: string, pinned: boolean) =>
    request<any>(`/admin/posts/${id}/pin`, { method: 'PUT', body: JSON.stringify({ pinned }) }),
  deletePost: (id: string) =>
    request<any>(`/admin/posts/${id}`, { method: 'DELETE' }),
  // Reply moderation
  updateReplyStatus: (id: string, status: string) =>
    request<any>(`/admin/replies/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  deleteReply: (id: string) =>
    request<any>(`/admin/replies/${id}`, { method: 'DELETE' }),
  // Feedback
  getFeedback: () => request<any[]>('/admin/feedback'),
  updateFeedbackStatus: (id: string, status: string) =>
    request<any>(`/admin/feedback/${id}`, { method: 'PUT', body: JSON.stringify({ status }) }),
  // Users
  getUsers: (params?: { status?: string; search?: string }) => {
    const qs = new URLSearchParams();
    if (params?.status) qs.set('status', params.status);
    if (params?.search) qs.set('search', params.search);
    const query = qs.toString();
    return request<any[]>(`/admin/users${query ? `?${query}` : ''}`);
  },
  updateUserStatus: (id: string, status: string) =>
    request<any>(`/admin/users/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  updateUserRole: (id: string, role: string) =>
    request<any>(`/admin/users/${id}/role`, { method: 'PUT', body: JSON.stringify({ role }) }),
  // Guide management
  getGuides: () => request<any[]>('/admin/guides'),
  createGuide: (guide: any) =>
    request<any>('/admin/guides', { method: 'POST', body: JSON.stringify(guide) }),
  updateGuide: (id: string, guide: any) =>
    request<any>(`/admin/guides/${id}`, { method: 'PUT', body: JSON.stringify(guide) }),
  deleteGuide: (id: string) =>
    request<any>(`/admin/guides/${id}`, { method: 'DELETE' }),
  // Announcements
  getAnnouncements: () => request<any[]>('/admin/announcements'),
  createAnnouncement: (data: any) =>
    request<any>('/admin/announcements', { method: 'POST', body: JSON.stringify(data) }),
  updateAnnouncement: (id: string, data: any) =>
    request<any>(`/admin/announcements/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAnnouncement: (id: string) =>
    request<any>(`/admin/announcements/${id}`, { method: 'DELETE' }),
  // Events
  getEvents: () => request<any[]>('/admin/events'),
  createEvent: (data: any) =>
    request<any>('/admin/events', { method: 'POST', body: JSON.stringify(data) }),
  updateEvent: (id: string, data: any) =>
    request<any>(`/admin/events/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteEvent: (id: string) =>
    request<any>(`/admin/events/${id}`, { method: 'DELETE' }),
  getEventRegistrations: (id: string) =>
    request<any[]>(`/admin/events/${id}/registrations`),
  // Logs
  getLogs: () => request<any[]>('/admin/logs'),
};

// Feedback
export const feedbackApi = {
  submit: (input: { category: string; subject: string; message: string }) =>
    request<{ success: boolean; id: string }>('/feedback', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  getMyFeedback: () => request<any[]>('/feedback/my'),
  getFeedback: (id: string) => request<any>(`/feedback/${id}`),
};

// Reminders
export const remindersApi = {
  list: () => request<any[]>('/reminders'),
  upcoming: () => request<any[]>('/reminders/upcoming'),
  create: (input: { title: string; description?: string; due_date: string; type?: string }) =>
    request<any>('/reminders', { method: 'POST', body: JSON.stringify(input) }),
  update: (id: string, input: any) =>
    request<any>(`/reminders/${id}`, { method: 'PUT', body: JSON.stringify(input) }),
  delete: (id: string) =>
    request<any>(`/reminders/${id}`, { method: 'DELETE' }),
  complete: (id: string) =>
    request<any>(`/reminders/${id}/complete`, { method: 'PUT' }),
};

// Events
export const eventsApi = {
  list: (params?: { category?: string; type?: string; status?: string }) => {
    const qs = new URLSearchParams();
    if (params?.category) qs.set('category', params.category);
    if (params?.type) qs.set('type', params.type);
    if (params?.status) qs.set('status', params.status);
    const query = qs.toString();
    return request<any[]>(`/events${query ? `?${query}` : ''}`);
  },
  get: (id: string) => request<any>(`/events/${id}`),
  register: (id: string) => request<any>(`/events/${id}/register`, { method: 'POST' }),
  cancelRegistration: (id: string) => request<any>(`/events/${id}/cancel`, { method: 'POST' }),
  myEvents: () => request<any[]>('/events/user/registered'),
  myVolunteerHours: () => request<any>('/events/user/volunteer-hours'),
};

// Public
export const publicApi = {
  getAnnouncements: () => request<any[]>('/admin/public/announcements'),
};
