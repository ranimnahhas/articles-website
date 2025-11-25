import React, { useState } from 'react';
import './Login.css';
import API_CONFIG from '../../../config';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiMessage, setApiMessage] = useState('');

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    let isValid = true;
    
    // Reset error messages
    setEmailError('');
    setPasswordError('');
    setApiMessage('');
    
    // Validate email
    if (!email.trim()) {
      setEmailError('الرجاء إدخال البريد الإلكتروني');
      isValid = false;
    } else if (!isValidEmail(email.trim())) {
      setEmailError('البريد الإلكتروني غير صحيح');
      isValid = false;
    }
    
    // Validate password
    if (!password.trim()) {
      setPasswordError('الرجاء إدخال كلمة المرور');
      isValid = false;
    } else if (password.trim().length < 6) {
      setPasswordError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      isValid = false;
    }
    
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsLoading(true);
      setApiMessage('');
      
      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/v1/admin/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            email: email.trim(),
            password: password
          })
        });

        const data = await response.json();

        if (data.success) {
          // حفظ التوكن في localStorage
          localStorage.setItem('adminToken', data.data.token);
          localStorage.setItem('adminData', JSON.stringify(data.data.admin));
          
          setApiMessage({
            text: data.message,
            type: 'success'
          });
          
          // Reset form
          setEmail('');
          setPassword('');
          setRemember(false);
          
          // يمكنك إضافة redirect هنا إذا أردت
          // window.location.href = '/dashboard';
          
        } else {
          setApiMessage({
            text: data.message || 'فشل تسجيل الدخول. الرجاء المحاولة مرة أخرى.',
            type: 'error'
          });
        }
      } catch (error) {
        setApiMessage({
          text: 'حدث خطأ في الاتصال بالخادم. الرجاء المحاولة مرة أخرى.',
          type: 'error'
        });
        console.error('Login error:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="login-body-log">
      {/* Floating Background Elements */}
      <div className="floating-elements-log">
        <div className="floating-element-log element-1-log"></div>
        <div className="floating-element-log element-2-log"></div>
        <div className="floating-element-log element-3-log"></div>
        <div className="floating-element-log element-4-log"></div>
      </div>

      {/* Login Container */}
      <div className="login-container-log">
        <div className="login-header-log">
          <div className="logo-container-log">
            <div className="logo-log">
              <i className="fas fa-feather-alt"></i>
            </div>
            <div className="logo-ring-log"></div>
          </div>
        </div>

        {/* Display API Messages */}
        {apiMessage && (
          <div className={`api-message-log ${apiMessage.type === 'success' ? 'success-log' : 'error-log'}`}>
            <i className={`fas ${apiMessage.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
            {apiMessage.text}
          </div>
        )}

        <form id="loginForm-log" onSubmit={handleSubmit}>
          <div className="form-group-log">
            <label htmlFor="email-log">البريد الإلكتروني</label>
            <div className="input-with-icon-log">
              <input 
                type="email" 
                id="email-log" 
                className={`form-control-log ${emailError ? 'error-shake-log' : ''}`}
                placeholder="أدخل بريدك الإلكتروني"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
              <i className="fas fa-envelope"></i>
            </div>
            {emailError && <div className="error-message-log">{emailError}</div>}
          </div>
          
          <div className="form-group-log">
            <label htmlFor="password-log">كلمة المرور</label>
            <div className="input-with-icon-log">
              <input 
                type="password" 
                id="password-log" 
                className={`form-control-log ${passwordError ? 'error-shake-log' : ''}`}
                placeholder="أدخل كلمة المرور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
              <i className="fas fa-lock"></i>
            </div>
            {passwordError && <div className="error-message-log">{passwordError}</div>}
          </div>
          
          <button type="submit" className="login-btn-log" disabled={isLoading}>
            {isLoading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                جاري تسجيل الدخول...
              </>
            ) : (
              <>
                <i className="fas fa-sign-in-alt"></i>
                تسجيل دخول
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;