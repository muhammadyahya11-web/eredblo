import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'https://eredbloo-server.vercel.app/api';

const api = axios.create({
  baseURL,
  timeout: 15000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      error.message = 'Request timed out. Please check your connection and try again.';
    } else if (!error.response) {
      error.message = 'Cannot reach the server. Please check your connection and try again.';
    } else if (error.response && error.response.status === 502) {
      error.message = 'Server error (502). The backend may be down or restarting. Please try again shortly.';
    } else if (error.response && error.response.status === 503) {
      error.message = 'Service temporarily unavailable. Please try again later.';
    }

    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export const earningsAPI = {
  getMyEarnings: () => api.get('/earnings/my-earnings'),
  getPlatformEarnings: () => api.get('/earnings/platform'),
};

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  sendLoginOTP: (data) => api.post('/auth/send-login-otp', data),
  loginWithOTP: (data) => api.post('/auth/login-with-otp', data),
  verifyOTP: (data) => api.post('/auth/verify-otp', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (token, data) => api.put(`/auth/reset-password/${token}`, data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  uploadProfilePicture: (formData) => api.post('/users/profile/picture', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getDashboard: () => api.get('/users/dashboard'),
  getReferralStats: () => api.get('/users/referral-stats'),
};

export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUserStatus: (id, status) => api.put(`/admin/users/${id}/status`, { status }),
  getAdmins: () => api.get('/admin/admins'),
  createAdmin: (data) => api.post('/admin/admins', data),
  deleteAdmin: (id) => api.delete(`/admin/admins/${id}`),
};

export const superAdminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUserStatus: (id, status) => api.put(`/admin/users/${id}/status`, { status }),
  getAdmins: () => api.get('/admin/admins'),
  createAdmin: (data) => api.post('/admin/admins', data),
  deleteAdmin: (id) => api.delete(`/admin/admins/${id}`),
  distributeProfit: () => api.post('/investments/distribute-profit'),
};

export const planAPI = {
  getPlans: (params) => api.get('/plans', { params }),
  getPlan: (id) => api.get(`/plans/${id}`),
  createPlan: (data) => api.post('/plans', data),
  updatePlan: (id, data) => api.put(`/plans/${id}`, data),
  deletePlan: (id) => api.delete(`/plans/${id}`),
};

export const depositAPI = {
  create: (formData) => api.post('/deposits', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getMyDeposits: (params) => api.get('/deposits/my-deposits', { params }),
  getAll: (params) => api.get('/deposits', { params }),
  updateStatus: (id, data) => api.put(`/deposits/${id}/status`, data),
};

export const withdrawalAPI = {
  create: (data) => api.post('/withdrawals', data),
  getMyWithdrawals: (params) => api.get('/withdrawals/my-withdrawals', { params }),
  getAll: (params) => api.get('/withdrawals', { params }),
  updateStatus: (id, data) => api.put(`/withdrawals/${id}/status`, data),
};

export const investmentAPI = {
  create: (data) => api.post('/investments', data),
  getMyInvestments: (params) => api.get('/investments/my-investments', { params }),
  getAll: (params) => api.get('/investments', { params }),
  getById: (id) => api.get(`/investments/${id}`),
  cancel: (id) => api.delete(`/investments/${id}`),
  distributeProfit: () => api.post('/investments/distribute-profit'),
};

export const transactionAPI = {
  getMyTransactions: (params) => api.get('/transactions/my-transactions', { params }),
  getAll: (params) => api.get('/transactions', { params }),
};

export const notificationAPI = {
  getMy: (params) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications', { params: { limit: 1, isRead: false } }),
  getAll: (params) => api.get('/notifications/all-admin', { params }),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  create: (data) => api.post('/notifications', data),
  delete: (id) => api.delete(`/notifications/${id}`),
};

export const supportAPI = {
  create: (data) => api.post('/support', data),
  getMy: (params) => api.get('/support/my-tickets', { params }),
  getAll: (params) => api.get('/support', { params }),
  getById: (id) => api.get(`/support/${id}`),
  updateStatus: (id, data) => api.put(`/support/${id}/status`, data),
  reply: (id, data) => api.post(`/support/${id}/reply`, data),
};

export const settingsAPI = {
  getPublic: () => api.get('/settings/public'),
  get: () => api.get('/settings'),
  update: (data) => api.put('/settings', data),
};

export default api;
