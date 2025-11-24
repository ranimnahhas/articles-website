import api from './api';

export const authService = {
  // تسجيل الدخول - مرتبط مع API الحقيقي
  login: async (credentials) => {
    const response = await api.post('/admin/login', credentials);
    return response.data;
  },

  // تسجيل الخروج - مرتبط مع API الحقيقي
  logout: async () => {
    const response = await api.post('/admin/logout');
    return response.data;
  },

  // جلب بيانات المستخدم الحالي (إذا كان لديك endpoint)
  getMe: async () => {
    const response = await api.get('/admin/me'); // تأكد من وجود هذا الـ endpoint
    return response.data;
  },
};