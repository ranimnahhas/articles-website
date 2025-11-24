import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        // في التطبيق الحقيقي، يمكنك جلب بيانات المستخدم من API
        // const userData = await authService.getMe();
        // setUser(userData);
        
        // حالياً سنستخدم بيانات افتراضية حتى تنشئ endpoint لـ getMe
        console.log('🔍 التحقق من المصادقة - يوجد توكن');
        // يمكنك تفعيل هذا عندما يكون لديك endpoint لـ getMe
        // const userData = await authService.getMe();
        // setUser(userData);
      } else {
        console.log('🔍 التحقق من المصادقة - لا يوجد توكن');
      }
    } catch (error) {
      console.error('❌ فشل التحقق من المصادقة:', error);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      console.log('🔄 محاولة تسجيل الدخول مع:', { 
        email: credentials.email,
        password: '***' + credentials.password.slice(-2)
      });

      // استخدام API الحقيقي لتسجيل الدخول
      const response = await authService.login(credentials);
      
      console.log('📨 استجابة API:', response);

      if (response.success) {
        const { admin, token } = response.data;
        
        // حفظ التوكن في localStorage
        localStorage.setItem('token', token);
        
        // حفظ بيانات المستخدم
        setUser(admin);
        
        console.log('✅ تسجيل الدخول ناجح:', admin);
        return admin;
      } else {
        // إذا كان الـ success = false
        const error = new Error(response.message || 'فشل تسجيل الدخول');
        console.error('❌ فشل تسجيل الدخول من API:', error.message);
        throw error;
      }

    } catch (error) {
      console.error('❌ خطأ في تسجيل الدخول:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // تنظيف البيانات في حالة الخطأ
      localStorage.removeItem('token');
      setUser(null);
      
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 بدء تسجيل الخروج...');
      
      // محاولة تسجيل الخروج من API إذا كان هناك توكن
      const token = localStorage.getItem('token');
      if (token) {
        await authService.logout();
      }
      
    } catch (error) {
      console.error('⚠️ خطأ في تسجيل الخروج من API:', error);
    } finally {
      // تنظيف البيانات محلياً في جميع الأحوال
      localStorage.removeItem('token');
      setUser(null);
      console.log('✅ تم تسجيل الخروج محلياً');
    }
  };

  const value = {
    user, 
    login, 
    logout, 
    loading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};