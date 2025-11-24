import axios from 'axios';

const API_BASE = 'http://localhost:8000/api/v1';

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000, // 10 ثواني
});

// إضافة التوكن تلقائياً للطلبات
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('🔐 إضافة التوكن للطلب:', config.url);
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// معالجة الأخطاء
api.interceptors.response.use(
  (response) => {
    console.log('✅ استجابة ناجحة:', response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ خطأ في API:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message
    });

    if (error.response?.status === 401) {
      console.log('🚨 خطأ 401 - غير مصرح، جاري تنظيف التوكن');
      localStorage.removeItem('token');
      // يمكنك إضافة redirect هنا إذا أردت
    }
    
    return Promise.reject(error);
  }
);

export default api;