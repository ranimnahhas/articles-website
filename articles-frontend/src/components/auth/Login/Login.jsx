import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({
    email: false,
    password: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [apiError, setApiError] = useState('');
  
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // إصلاح: استخدام useRef لمنع الحلقة اللانهائية
  const redirectTriggered = React.useRef(false);

  useEffect(() => {
    // فقط إذا كان المستخدم مسجل دخول ولم يتم التوجيه بعد
    if (isAuthenticated && !authLoading && !redirectTriggered.current) {
      console.log('🔄 التوجيه إلى Dashboard (مرة واحدة فقط)');
      redirectTriggered.current = true;
      
      const from = location.state?.from?.pathname || '/admin/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate, location]);

  // إذا كان جاري التحميل، عرض شاشة تحميل
  if (authLoading) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="login-body">
            <div style={{ textAlign: 'center', padding: '50px' }}>
              <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', marginBottom: '20px' }}></i>
              <p>جاري التحقق من المصادقة...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // إذا كان مسجل دخول، لا تعرض صفحة Login (سيتم التوجيه عبر useEffect)
  if (isAuthenticated) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="login-body">
            <div style={{ textAlign: 'center', padding: '50px' }}>
              <i className="fas fa-check-circle" style={{ fontSize: '2rem', marginBottom: '20px', color: 'var(--success)' }}></i>
              <p>جاري التوجيه إلى لوحة التحكم...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // التحقق من صحة البريد الإلكتروني
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // التحقق من صحة كلمة المرور
  const validatePassword = (password) => {
    return password.length >= 6;
  };

  // معالجة تغيير الحقول
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value
    }));

    // مسح الأخطاء عند الكتابة
    if (apiError) setApiError('');

    // التحقق في الوقت الحقيقي
    if (name === 'email') {
      setErrors(prevState => ({
        ...prevState,
        email: value !== '' && !validateEmail(value)
      }));
    } else if (name === 'password') {
      setErrors(prevState => ({
        ...prevState,
        password: value !== '' && !validatePassword(value)
      }));
    }
  };

  // معالجة إرسال النموذج
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    
    const emailValid = validateEmail(formData.email);
    const passwordValid = validatePassword(formData.password);
    
    // تحديث الأخطاء
    setErrors({
      email: !emailValid && formData.email !== '',
      password: !passwordValid && formData.password !== ''
    });

    console.log('🔐 بدء عملية تسجيل الدخول مع API الحقيقي');

    // التحقق من الصحة
    if (!emailValid || !passwordValid) {
      console.log('❌ تحقق من صحة البيانات قبل الإرسال');
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('🔄 جاري إرسال طلب تسجيل الدخول إلى API الحقيقي...');
      
      // استخدام API الحقيقي لتسجيل الدخول
      await login({
        email: formData.email,
        password: formData.password
      });
      
      console.log('✅ تسجيل الدخول ناجح عبر API الحقيقي');
      setIsSuccess(true);
      
      // إعادة تعيين حالة التوجيه
      redirectTriggered.current = false;
      
    } catch (error) {
      // معالجة أخطاء API الحقيقي
      let errorMessage = 'فشل تسجيل الدخول. يرجى التحقق من البيانات.';
      
      console.error('❌ خطأ في تسجيل الدخول من API:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      if (error.response) {
        // الخطأ من الخادم
        const serverError = error.response.data;
        errorMessage = serverError.message || errorMessage;
        console.log('🚨 خطأ من الخادم:', serverError);
      } else if (error.request) {
        // لا يوجد اتصال بالخادم
        errorMessage = 'لا يمكن الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت.';
        console.log('🌐 خطأ اتصال: لا يمكن الوصول إلى الخادم');
      } else {
        // خطأ آخر
        errorMessage = error.message || errorMessage;
        console.log('⚡ خطأ غير متوقع:', error.message);
      }
      
      setApiError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // معالجة نسيان كلمة المرور
  const handleForgotPassword = (e) => {
    e.preventDefault();
    console.log('🔑 طلب إعادة تعيين كلمة المرور');
    
    if (formData.email && validateEmail(formData.email)) {
      alert(`سيتم إرسال تعليمات إعادة تعيين كلمة المرور إلى: ${formData.email}`);
      console.log('📧 إرسال تعليمات إعادة تعيين إلى:', formData.email);
    } else {
      alert('الرجاء إدخال عنوان بريدك الإلكتروني أولاً');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo-container">
            <div className="logo">
              <i className="fas fa-cube"></i>
            </div>
            <div className="brand">
              <h1>نظام الإدارة</h1>
              <p>Content Management System</p>
            </div>
          </div>
        </div>
        <div className="login-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">البريد الإلكتروني</label>
              <div className="input-with-icon">
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-control"
                  placeholder="admin@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
                <i className="fas fa-user"></i>
              </div>
              <div className={`error-message ${errors.email ? 'show' : ''}`}>
                <i className="fas fa-exclamation-circle"></i> يرجى إدخال بريد إلكتروني صحيح
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="password">كلمة المرور</label>
              <div className="input-with-icon">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  className="form-control"
                  placeholder="أدخل كلمة المرور"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
                <i className="fas fa-lock"></i>
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  <i className={`fas fa-eye${showPassword ? '-slash' : ''}`}></i>
                </button>
              </div>
              <div className={`error-message ${errors.password ? 'show' : ''}`}>
                <i className="fas fa-exclamation-circle"></i> كلمة المرور يجب أن تكون 6 أحرف على الأقل
              </div>
            </div>
            
            <div className="form-options">
              <div className="remember-me">
                <input
                  type="checkbox"
                  id="rememberMe"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                <label htmlFor="rememberMe">تذكر بيانات الدخول</label>
              </div>
              <a href="#" className="forgot-password" onClick={handleForgotPassword}>
                نسيت كلمة المرور؟
              </a>
            </div>

            {/* عرض خطأ API */}
            {apiError && (
              <div className="error-message show" style={{ marginBottom: '20px' }}>
                <i className="fas fa-exclamation-triangle"></i> {apiError}
              </div>
            )}
            
            <button
              type="submit"
              className={`login-button ${isLoading ? 'loading' : ''} ${!isLoading && !isSuccess ? 'pulse' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner"></i>
                  <span>جاري تسجيل الدخول...</span>
                </>
              ) : isSuccess ? (
                <>
                  <i className="fas fa-check"></i>
                  <span>تم تسجيل الدخول بنجاح</span>
                </>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt"></i>
                  <span>تسجيل الدخول إلى لوحة التحكم</span>
                </>
              )}
            </button>
            
            <div className={`success-message ${isSuccess ? 'show' : ''}`}>
              <i className="fas fa-check-circle"></i> تم تسجيل الدخول بنجاح! جاري التوجيه...
            </div>

            <div className="security-notice">
              <i className="fas fa-shield-alt"></i>
              <span>اتصال آمن مشفر. بياناتك محمية.</span>
            </div>
          </form>
          
          <div className="login-footer">
            <p>© 2023 نظام إدارة المحتوى. جميع الحقوق محفوظة. الإصدار 4.2</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;