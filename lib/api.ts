/**
 * FairGig API Client - Unified interface to all backend services
 * Handles authentication, requests, and error handling
 */

const API_GATEWAY = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const SERVICES = {
  auth: 'http://localhost:8001',
  earnings: 'http://localhost:8002',
  anomaly: 'http://localhost:8003',
  grievance: 'http://localhost:8004',
};

// Global token storage (in production, use httpOnly cookies)
let authToken: string | null = null;

export const setAuthToken = (token: string) => {
  authToken = token;
  localStorage.setItem('fairgig_token', token);
};

export const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    authToken = authToken || localStorage.getItem('fairgig_token');
  }
  return authToken;
};

export const clearAuthToken = () => {
  authToken = null;
  localStorage.removeItem('fairgig_token');
};

// ==================== API Request Helper ====================

interface ApiOptions {
  service: keyof typeof SERVICES;
  endpoint: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: Record<string, any>;
  requiresAuth?: boolean;
  isFormData?: boolean;
}

async function apiRequest<T = any>({
  service,
  endpoint,
  method = 'GET',
  body,
  requiresAuth = true,
  isFormData = false,
}: ApiOptions): Promise<T> {
  const url = `${SERVICES[service]}${endpoint}`;
  
  const headers: HeadersInit = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
  };
  
  if (requiresAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  const config: RequestInit = {
    method,
    headers,
  };
  
  if (body && !isFormData) {
    config.body = JSON.stringify(body);
  } else if (body && isFormData) {
    const formData = new FormData();
    Object.entries(body).forEach(([key, value]) => {
      if (value instanceof File) {
        formData.append(key, value);
      } else if (value !== null && value !== undefined) {
        formData.append(key, String(value));
      }
    });
    config.body = formData;
  }
  
  const response = await fetch(url, config);
  
  if (!response.ok) {
    if (response.status === 401) {
      clearAuthToken();
      window.location.href = '/login';
    }
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  
  return response.json();
}

// ==================== AUTH ENDPOINTS ====================

export const authAPI = {
  register: (email: string, password: string, fullName: string, role: string, city?: string, state?: string) =>
    apiRequest({
      service: 'auth',
      endpoint: '/auth/register',
      method: 'POST',
      body: { email, password, full_name: fullName, role, city, state },
      requiresAuth: false,
    }),
  
  login: (email: string, password: string) =>
    apiRequest({
      service: 'auth',
      endpoint: '/auth/login',
      method: 'POST',
      body: { email, password },
      requiresAuth: false,
    }),
  
  verify: (token: string) =>
    apiRequest({
      service: 'auth',
      endpoint: `/auth/verify?token=${token}`,
      method: 'GET',
      requiresAuth: false,
    }),
  
  getUser: (userId: string) =>
    apiRequest({
      service: 'auth',
      endpoint: `/auth/user/${userId}`,
      method: 'GET',
    }),
};

// ==================== EARNINGS ENDPOINTS ====================

export const earningsAPI = {
  createShift: (workerId: string, shift: any) =>
    apiRequest({
      service: 'earnings',
      endpoint: `/shifts?worker_id=${workerId}`,
      method: 'POST',
      body: shift,
    }),
  
  getWorkerShifts: (workerId: string) =>
    apiRequest({
      service: 'earnings',
      endpoint: `/shifts/${workerId}`,
      method: 'GET',
    }),
  
  uploadScreenshot: (workerId: string, shiftId: string, file: File) =>
    apiRequest({
      service: 'earnings',
      endpoint: `/shifts/${shiftId}/screenshot?worker_id=${workerId}`,
      method: 'POST',
      body: { file },
      isFormData: true,
    }),
  
  getPendingVerifications: () =>
    apiRequest({
      service: 'earnings',
      endpoint: '/verifications/pending',
      method: 'GET',
    }),
  
  verifyScreenshot: (verificationId: string, verifierId: string, approved: boolean, notes: string = '', confidence: number = 0.95) =>
    apiRequest({
      service: 'earnings',
      endpoint: `/verifications/${verificationId}/verify?verifier_id=${verifierId}&approved=${approved}&notes=${encodeURIComponent(notes)}&confidence=${confidence}`,
      method: 'POST',
    }),
  
  importCSV: (workerId: string, file: File) =>
    apiRequest({
      service: 'earnings',
      endpoint: `/csv-import?worker_id=${workerId}`,
      method: 'POST',
      body: { file },
      isFormData: true,
    }),
  
  getStats: (workerId: string) =>
    apiRequest({
      service: 'earnings',
      endpoint: `/earnings/stats/${workerId}`,
      method: 'GET',
    }),
};

// ==================== ANOMALY DETECTION ENDPOINTS ====================

export const anomalyAPI = {
  analyze: (workerId: string) =>
    apiRequest({
      service: 'anomaly',
      endpoint: `/analyze/${workerId}`,
      method: 'POST',
    }),
  
  getWorkerFlags: (workerId: string, status?: string) => {
    const query = status ? `?status=${status}` : '';
    return apiRequest({
      service: 'anomaly',
      endpoint: `/flags/worker/${workerId}${query}`,
      method: 'GET',
    });
  },
  
  getCriticalFlags: () =>
    apiRequest({
      service: 'anomaly',
      endpoint: '/flags/critical',
      method: 'GET',
    }),
  
  resolveFlag: (flagId: string, notes: string = '') =>
    apiRequest({
      service: 'anomaly',
      endpoint: `/flags/${flagId}/resolve?notes=${encodeURIComponent(notes)}`,
      method: 'POST',
    }),
};

// ==================== GRIEVANCE ENDPOINTS ====================

export const grievanceAPI = {
  create: (workerId: string, platform: string, title: string, description: string, category?: string, severity?: string) =>
    apiRequest({
      service: 'grievance',
      endpoint: '/grievances',
      method: 'POST',
      body: { worker_id: workerId, platform, title, description, category, severity },
      requiresAuth: false,
    }),
  
  list: (status?: string, platform?: string, limit?: number, offset?: number, sort?: string) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (platform) params.append('platform', platform);
    if (limit) params.append('limit', String(limit));
    if (offset) params.append('offset', String(offset));
    if (sort) params.append('sort', sort);
    
    return apiRequest({
      service: 'grievance',
      endpoint: `/grievances?${params.toString()}`,
      method: 'GET',
      requiresAuth: false,
    });
  },
  
  getById: (grievanceId: string) =>
    apiRequest({
      service: 'grievance',
      endpoint: `/grievances/${grievanceId}`,
      method: 'GET',
      requiresAuth: false,
    }),
  
  addComment: (grievanceId: string, userId: string, content: string) =>
    apiRequest({
      service: 'grievance',
      endpoint: `/grievances/${grievanceId}/comments`,
      method: 'POST',
      body: { user_id: userId, content },
      requiresAuth: false,
    }),
  
  like: (grievanceId: string) =>
    apiRequest({
      service: 'grievance',
      endpoint: `/grievances/${grievanceId}/like`,
      method: 'POST',
      requiresAuth: false,
    }),
  
  assign: (grievanceId: string, advocateId: string, status?: string) =>
    apiRequest({
      service: 'grievance',
      endpoint: `/grievances/${grievanceId}/assign`,
      method: 'POST',
      body: { advocate_id: advocateId, status },
    }),
  
  resolve: (grievanceId: string, resolutionNotes: string) =>
    apiRequest({
      service: 'grievance',
      endpoint: `/grievances/${grievanceId}/resolve`,
      method: 'POST',
      body: { resolution_notes: resolutionNotes },
    }),
  
  getStats: () =>
    apiRequest({
      service: 'grievance',
      endpoint: '/stats',
      method: 'GET',
      requiresAuth: false,
    }),
};

export default {
  auth: authAPI,
  earnings: earningsAPI,
  anomaly: anomalyAPI,
  grievance: grievanceAPI,
};
