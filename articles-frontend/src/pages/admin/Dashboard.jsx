import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard');

  const handleLogout = async () => {
    console.log('🚪 بدء تسجيل الخروج...');
    await logout();
  };

  // إحصائيات
  const stats = [
    {
      title: 'المقالات',
      value: '24',
      icon: 'fas fa-newspaper',
      color: 'var(--primary)',
      change: '+12%',
      description: 'مقال نشط'
    },
    {
      title: 'الأقسام',
      value: '8',
      icon: 'fas fa-folder',
      color: 'var(--success)',
      change: '+5%',
      description: 'قسم رئيسي'
    },
    {
      title: 'التعليقات',
      value: '156',
      icon: 'fas fa-comments',
      color: 'var(--accent)',
      change: '+23%',
      description: 'في انتظار المراجعة'
    },
    {
      title: 'الرسائل',
      value: '12',
      icon: 'fas fa-envelope',
      color: 'var(--secondary)',
      change: '+8%',
      description: 'جديدة'
    }
  ];

  // الإجراءات السريعة
  const quickActions = [
    {
      title: 'مقال جديد',
      icon: 'fas fa-plus',
      description: 'إنشاء مقال جديد',
      color: 'var(--primary)',
      onClick: () => setActiveSection('articles')
    },
    {
      title: 'قسم جديد',
      icon: 'fas fa-folder-plus',
      description: 'إضافة قسم جديد',
      color: 'var(--success)',
      onClick: () => setActiveSection('categories')
    },
    {
      title: 'إدارة التعليقات',
      icon: 'fas fa-comment-medical',
      description: 'مراجعة التعليقات',
      color: 'var(--accent)',
      onClick: () => setActiveSection('comments')
    },
    {
      title: 'الرسائل',
      icon: 'fas fa-envelope-open',
      description: 'عرض الرسائل الواردة',
      color: 'var(--secondary)',
      onClick: () => setActiveSection('messages')
    }
  ];

  // النشاط الحديث
  const recentActivities = [
    {
      action: 'إنشاء مقال',
      title: '"أفضل ممارسات React"',
      time: 'منذ 2 ساعة',
      icon: 'fas fa-plus-circle',
      color: 'var(--success)'
    },
    {
      action: 'تعليق جديد',
      title: 'على مقال "كيفية استخدام Laravel"',
      time: 'منذ 4 ساعات',
      icon: 'fas fa-comment',
      color: 'var(--accent)'
    },
    {
      action: 'مستخدم جديد',
      title: 'تمت إضافة مستخدم جديد',
      time: 'منذ 6 ساعات',
      icon: 'fas fa-user-plus',
      color: 'var(--primary)'
    },
    {
      action: 'تحديث',
      title: 'تم تحديث قسم "برمجة"',
      time: 'منذ 8 ساعات',
      icon: 'fas fa-sync',
      color: 'var(--secondary)'
    }
  ];

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <div className="brand">
            <div className="logo">
              <i className="fas fa-cube"></i>
            </div>
            <h2>نظام الإدارة</h2>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-title">القائمة الرئيسية</div>
            <ul>
              <li className={activeSection === 'dashboard' ? 'active' : ''}>
                <a onClick={() => setActiveSection('dashboard')}>
                  <div className="nav-icon">
                    <i className="fas fa-tachometer-alt"></i>
                  </div>
                  <span>لوحة التحكم</span>
                </a>
              </li>
              <li className={activeSection === 'articles' ? 'active' : ''}>
                <a onClick={() => setActiveSection('articles')}>
                  <div className="nav-icon">
                    <i className="fas fa-newspaper"></i>
                  </div>
                  <span>المقالات</span>
                  <span className="nav-badge">24</span>
                </a>
              </li>
              <li className={activeSection === 'categories' ? 'active' : ''}>
                <a onClick={() => setActiveSection('categories')}>
                  <div className="nav-icon">
                    <i className="fas fa-folder"></i>
                  </div>
                  <span>الأقسام</span>
                </a>
              </li>
            </ul>
          </div>

          <div className="nav-section">
            <div className="nav-title">التفاعلات</div>
            <ul>
              <li className={activeSection === 'comments' ? 'active' : ''}>
                <a onClick={() => setActiveSection('comments')}>
                  <div className="nav-icon">
                    <i className="fas fa-comments"></i>
                  </div>
                  <span>التعليقات</span>
                  <span className="nav-badge">12</span>
                </a>
              </li>
              <li className={activeSection === 'messages' ? 'active' : ''}>
                <a onClick={() => setActiveSection('messages')}>
                  <div className="nav-icon">
                    <i className="fas fa-envelope"></i>
                  </div>
                  <span>الرسائل</span>
                  <span className="nav-badge">5</span>
                </a>
              </li>
            </ul>
          </div>

          <div className="nav-section">
            <div className="nav-title">الإدارة</div>
            <ul>
              <li className={activeSection === 'users' ? 'active' : ''}>
                <a onClick={() => setActiveSection('users')}>
                  <div className="nav-icon">
                    <i className="fas fa-users"></i>
                  </div>
                  <span>المستخدمين</span>
                </a>
              </li>
              <li className={activeSection === 'settings' ? 'active' : ''}>
                <a onClick={() => setActiveSection('settings')}>
                  <div className="nav-icon">
                    <i className="fas fa-cog"></i>
                  </div>
                  <span>الإعدادات</span>
                </a>
              </li>
            </ul>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="user-card">
            <div className="user-avatar">
              <i className="fas fa-user"></i>
            </div>
            <div className="user-info">
              <div className="user-name">{user?.name}</div>
              <div className="user-role">مدير النظام</div>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-main">
        {/* Header */}
        <header className="main-header">
          <div className="header-left">
            <h1>لوحة التحكم</h1>
            <p>مرحباً بعودتك، {user?.name}!
</p>
          </div>
          <div className="header-right">
            <div className="header-actions">
              <button className="notification-btn">
                <i className="fas fa-bell"></i>
                <span className="notification-dot"></span>
              </button>
              <div className="search-box">
                <i className="fas fa-search"></i>
                <input type="text" placeholder="ابحث عن..." />
              </div>
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-header">
                <div className="stat-icon" style={{ backgroundColor: stat.color }}>
                  <i className={stat.icon}></i>
                </div>
                <div className="stat-change" style={{ color: stat.color }}>
                  {stat.change}
                </div>
              </div>
              <div className="stat-content">
                <h3>{stat.value}</h3>
                <p>{stat.title}</p>
                <span>{stat.description}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="content-grid">
          {/* Quick Actions */}
          <div className="quick-actions-section">
            <div className="section-header">
              <h3>الإجراءات السريعة</h3>
              <p>الوصول السريع للمهام الشائعة</p>
            </div>
            <div className="actions-grid">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  className="action-card"
                  onClick={action.onClick}
                  style={{ '--action-color': action.color }}
                >
                  <div className="action-icon">
                    <i className={action.icon}></i>
                  </div>
                  <div className="action-content">
                    <h4>{action.title}</h4>
                    <p>{action.description}</p>
                  </div>
                  <div className="action-arrow">
                    <i className="fas fa-arrow-left"></i>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="recent-activity-section">
            <div className="section-header">
              <h3>النشاط الحديث</h3>
              <p>آخر التحديثات في النظام</p>
            </div>
            <div className="activity-list">
              {recentActivities.map((activity, index) => (
                <div key={index} className="activity-item">
                  <div className="activity-icon" style={{ color: activity.color }}>
                    <i className={activity.icon}></i>
                  </div>
                  <div className="activity-content">
                    <div className="activity-header">
                      <span className="activity-action">{activity.action}</span>
                      <span className="activity-time">{activity.time}</span>
                    </div>
                    <p className="activity-title">{activity.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="charts-section">
          <div className="chart-card">
            <div className="chart-header">
              <h4>إحصائيات المقالات</h4>
              <select className="chart-filter">
                <option>آخر 7 أيام</option>
                <option>آخر 30 يوم</option>
                <option>آخر 90 يوم</option>
              </select>
            </div>
            <div className="chart-placeholder">
              <i className="fas fa-chart-bar"></i>
              <p>رسم بياني لإحصائيات المقالات</p>
            </div>
          </div>

          <div className="chart-card">
            <div className="chart-header">
              <h4>تفاعل المستخدمين</h4>
              <select className="chart-filter">
                <option>آخر 7 أيام</option>
                <option>آخر 30 يوم</option>
                <option>آخر 90 يوم</option>
              </select>
            </div>
            <div className="chart-placeholder">
              <i className="fas fa-chart-line"></i>
              <p>رسم بياني لتفاعل المستخدمين</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;