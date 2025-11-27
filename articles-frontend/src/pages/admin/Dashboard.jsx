import React, { useState, useEffect } from 'react';
import './Dashboard.css';

const Dashboard = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarActive, setMobileSidebarActive] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [activeModal, setActiveModal] = useState(null);
  
  // States للإدارة
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: ''
  });
  const [formErrors, setFormErrors] = useState({});

  // States للمقالات
  const [articles, setArticles] = useState([]);
  const [articlesLoading, setArticlesLoading] = useState(false);
  const [articlesError, setArticlesError] = useState(null);
  const [articleStats, setArticleStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    archived: 0,
    total_views: 0
  });
  const [categories, setCategories] = useState([]);
  const [editingArticle, setEditingArticle] = useState(null);
  const [showAddArticleModal, setShowAddArticleModal] = useState(false);
  const [showEditArticleModal, setShowEditArticleModal] = useState(false);
  const [articleFormData, setArticleFormData] = useState({
    title: '',
    category_id: '',
    excerpt: '',
    content: '',
    status: 'draft',
    published_at: ''
  });
  const [articleFormErrors, setArticleFormErrors] = useState({});
  const [articleImage, setArticleImage] = useState(null);

  // دالة مساعدة للحصول على التوكن
  const getAuthToken = () => {
    return localStorage.getItem('admin_token') || localStorage.getItem('adminToken');
  };

  // دالة لمعالجة ردود الخادم
  const handleResponse = async (response) => {
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      const text = await response.text();
      throw new Error(`Server returned: ${response.status} ${response.statusText}. Response: ${text.substring(0, 200)}`);
    }
  };

  // دالة لجلب بيانات الإدمن
  const fetchAdmins = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('لم يتم العثور على رمز المصادقة');
      }

      const response = await fetch('http://localhost:8000/api/v1/admins', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`فشل في جلب البيانات: ${response.status} ${response.statusText}`);
      }

      const result = await handleResponse(response);
      
      if (result.success) {
        setAdmins(result.data);
      } else {
        setError(result.message || 'حدث خطأ غير معروف');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching admins:', err);
    } finally {
      setLoading(false);
    }
  };

  // دالة لحذف إدمن
  const handleDeleteAdmin = async (adminId, adminName) => {
    if (!window.confirm(`هل أنت متأكد من حذف ${adminName}؟`)) {
      return;
    }

    try {
      const token = getAuthToken();
      if (!token) {
        alert('لم يتم العثور على رمز المصادقة');
        return;
      }

      const response = await fetch(`http://localhost:8000/api/v1/admins/${adminId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      const result = await handleResponse(response);

      if (result.success) {
        alert('تم حذف الإدمن بنجاح');
        fetchAdmins();
      } else {
        alert(result.message || 'حدث خطأ أثناء الحذف');
      }
    } catch (err) {
      alert('حدث خطأ أثناء الحذف: ' + err.message);
      console.error('Error deleting admin:', err);
    }
  };

  // دالة لعرض تفاصيل الإدمن
  const handleViewAdmin = (admin) => {
    alert(`تفاصيل الإدمن:\nالاسم: ${admin.name}\nالبريد: ${admin.email}\nتاريخ الإنشاء: ${new Date(admin.created_at).toLocaleDateString('ar-SA')}`);
  };

  // دالة لإضافة إدمن جديد
  const handleAddAdmin = async (e) => {
    e.preventDefault();
    
    try {
      const token = getAuthToken();
      if (!token) {
        alert('لم يتم العثور على رمز المصادقة');
        return;
      }

      const response = await fetch('http://localhost:8000/api/v1/admins', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await handleResponse(response);

      if (result.success) {
        alert('تم إضافة الإدمن بنجاح');
        setShowAddModal(false);
        setFormData({ name: '', email: '', password: '', password_confirmation: '' });
        setFormErrors({});
        fetchAdmins();
      } else {
        setFormErrors(result.errors || {});
        alert(result.message || 'حدث خطأ أثناء الإضافة');
      }
    } catch (err) {
      alert('حدث خطأ في الاتصال بالخادم: ' + err.message);
      console.error('Error adding admin:', err);
    }
  };

  // دالة لتعديل إدمن
  const handleEditAdmin = async (e) => {
    e.preventDefault();
    
    try {
      const token = getAuthToken();
      if (!token) {
        alert('لم يتم العثور على رمز المصادقة');
        return;
      }

      // إنشاء بيانات التعديل (لا نرسل كلمة المرور إذا كانت فارغة)
      const updateData = {
        name: formData.name,
        email: formData.email
      };

      // إضافة كلمة المرور فقط إذا تم إدخالها
      if (formData.password) {
        updateData.password = formData.password;
        updateData.password_confirmation = formData.password_confirmation;
      }

      const response = await fetch(`http://localhost:8000/api/v1/admins/${editingAdmin.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      const result = await handleResponse(response);

      if (result.success) {
        alert('تم تعديل الإدمن بنجاح');
        setShowEditModal(false);
        setEditingAdmin(null);
        setFormData({ name: '', email: '', password: '', password_confirmation: '' });
        setFormErrors({});
        fetchAdmins();
      } else {
        setFormErrors(result.errors || {});
        alert(result.message || 'حدث خطأ أثناء التعديل');
      }
    } catch (err) {
      alert('حدث خطأ في الاتصال بالخادم: ' + err.message);
      console.error('Error editing admin:', err);
    }
  };

  // دالة لفتح نموذج الإضافة
  const openAddModal = () => {
    setShowAddModal(true);
    setFormData({ name: '', email: '', password: '', password_confirmation: '' });
    setFormErrors({});
  };

  // دالة لفتح نموذج التعديل
  const openEditModal = (admin) => {
    setEditingAdmin(admin);
    setFormData({
      name: admin.name,
      email: admin.email,
      password: '',
      password_confirmation: ''
    });
    setFormErrors({});
    setShowEditModal(true);
  };

  // دالة لإغلاق النماذج
  const closeModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setEditingAdmin(null);
    setFormData({ name: '', email: '', password: '', password_confirmation: '' });
    setFormErrors({});
  };

  // دالة لتغيير بيانات النموذج
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // مسح الخطأ عند الكتابة
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // ==================== دوال إدارة المقالات ====================

  // دالة لجلب المقالات
  const fetchArticles = async () => {
    try {
      setArticlesLoading(true);
      setArticlesError(null);
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('لم يتم العثور على رمز المصادقة');
      }

      const response = await fetch('http://localhost:8000/api/v1/articles', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`فشل في جلب المقالات: ${response.status} ${response.statusText}`);
      }

      const result = await handleResponse(response);
      
      if (result.success) {
        setArticles(result.data.articles.data);
        setArticleStats(result.data.stats);
        setCategories(result.data.categories);
      } else {
        setArticlesError(result.message || 'حدث خطأ غير معروف');
      }
    } catch (err) {
      setArticlesError(err.message);
      console.error('Error fetching articles:', err);
    } finally {
      setArticlesLoading(false);
    }
  };

  // دالة لإنشاء مقال جديد
  const handleAddArticle = async (e) => {
    e.preventDefault();
    
    try {
      const token = getAuthToken();
      if (!token) {
        alert('لم يتم العثور على رمز المصادقة');
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append('title', articleFormData.title);
      formDataToSend.append('category_id', articleFormData.category_id);
      formDataToSend.append('excerpt', articleFormData.excerpt);
      formDataToSend.append('content', articleFormData.content);
      formDataToSend.append('status', articleFormData.status);
      
      if (articleFormData.published_at) {
        formDataToSend.append('published_at', articleFormData.published_at);
      }

      if (articleImage) {
        formDataToSend.append('image', articleImage);
      }

      const response = await fetch('http://localhost:8000/api/v1/articles', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend
      });

      const result = await handleResponse(response);

      if (result.success) {
        alert('تم إنشاء المقال بنجاح');
        setShowAddArticleModal(false);
        setArticleFormData({
          title: '',
          category_id: '',
          excerpt: '',
          content: '',
          status: 'draft',
          published_at: ''
        });
        setArticleImage(null);
        setArticleFormErrors({});
        fetchArticles();
      } else {
        setArticleFormErrors(result.errors || {});
        alert(result.message || 'حدث خطأ أثناء إنشاء المقال');
      }
    } catch (err) {
      alert('حدث خطأ في الاتصال بالخادم: ' + err.message);
      console.error('Error adding article:', err);
    }
  };



// دالة محسنة لتعديل المقال مع معالجة أفضل للأخطاء
const handleEditArticle = async (e) => {
  e.preventDefault();
  
  try {
    const token = getAuthToken();
    if (!token) {
      alert('لم يتم العثور على رمز المصادقة - يرجى تسجيل الدخول مرة أخرى');
      return;
    }

    console.log('Editing article ID:', editingArticle.id);
    console.log('Form data:', articleFormData);

    const requestData = {
      title: articleFormData.title,
      category_id: parseInt(articleFormData.category_id),
      excerpt: articleFormData.excerpt || '',
      content: articleFormData.content,
      status: articleFormData.status,
      _method: 'PUT' // استخدام هذه الطريقة للتعامل مع بعض الخوادم
    };

    if (articleFormData.published_at) {
      requestData.published_at = articleFormData.published_at;
    }

    console.log('Sending request data:', requestData);

    const response = await fetch(`http://localhost:8000/api/v1/articles/${editingArticle.id}`, {
      method: 'POST', // استخدام POST مع _method
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestData)
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    const result = await handleResponse(response);

    console.log('Server response:', result);

    if (result.success) {
      alert('تم تحديث المقال بنجاح');
      setShowEditArticleModal(false);
      setEditingArticle(null);
      setArticleFormData({
        title: '',
        category_id: '',
        excerpt: '',
        content: '',
        status: 'draft',
        published_at: ''
      });
      setArticleImage(null);
      setArticleFormErrors({});
      fetchArticles();
    } else {
      setArticleFormErrors(result.errors || {});
      alert(result.message || 'حدث خطأ أثناء تحديث المقال');
    }
  } catch (err) {
    console.error('Error editing article:', err);
    
    // رسائل خطأ أكثر وضوحاً
    if (err.message.includes('CORS') || err.message.includes('Failed to fetch')) {
      alert('خطأ في الاتصال بالخادم: مشكلة في الـ CORS. تأكد من أن الخادم يعمل ويسمح بالطلبات من هذا النطاق.');
    } else {
      alert('حدث خطأ في الاتصال بالخادم: ' + err.message);
    }
  }
};

  // دالة لحذف مقال
  const handleDeleteArticle = async (article) => {
    if (!window.confirm(`هل أنت متأكد من حذف المقال "${article.title}"؟`)) {
      return;
    }

    try {
      const token = getAuthToken();
      if (!token) {
        alert('لم يتم العثور على رمز المصادقة');
        return;
      }

      const response = await fetch(`http://localhost:8000/api/v1/articles/${article.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      const result = await handleResponse(response);

      if (result.success) {
        alert('تم حذف المقال بنجاح');
        fetchArticles();
      } else {
        alert(result.message || 'حدث خطأ أثناء حذف المقال');
      }
    } catch (err) {
      alert('حدث خطأ أثناء الحذف: ' + err.message);
      console.error('Error deleting article:', err);
    }
  };

  // دالة لنشر مقال
  const handlePublishArticle = async (article) => {
    try {
      const token = getAuthToken();
      if (!token) {
        alert('لم يتم العثور على رمز المصادقة');
        return;
      }

      const response = await fetch(`http://localhost:8000/api/v1/articles/${article.id}/publish`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      const result = await handleResponse(response);

      if (result.success) {
        alert('تم نشر المقال بنجاح');
        fetchArticles();
      } else {
        alert(result.message || 'حدث خطأ أثناء نشر المقال');
      }
    } catch (err) {
      alert('حدث خطأ أثناء النشر: ' + err.message);
      console.error('Error publishing article:', err);
    }
  };

  // دالة لإلغاء نشر مقال
  const handleUnpublishArticle = async (article) => {
    try {
      const token = getAuthToken();
      if (!token) {
        alert('لم يتم العثور على رمز المصادقة');
        return;
      }

      const response = await fetch(`http://localhost:8000/api/v1/articles/${article.id}/unpublish`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      const result = await handleResponse(response);

      if (result.success) {
        alert('تم إلغاء نشر المقال بنجاح');
        fetchArticles();
      } else {
        alert(result.message || 'حدث خطأ أثناء إلغاء نشر المقال');
      }
    } catch (err) {
      alert('حدث خطأ أثناء إلغاء النشر: ' + err.message);
      console.error('Error unpublishing article:', err);
    }
  };

  // دالة لعرض تفاصيل المقال
  const handleViewArticle = (article) => {
    alert(`تفاصيل المقال:\nالعنوان: ${article.title}\nالتصنيف: ${article.category?.name}\nالحالة: ${article.status}\nالمؤلف: ${article.admin?.name}\nالمشاهدات: ${article.views_count}\nتاريخ النشر: ${article.published_at ? new Date(article.published_at).toLocaleDateString('ar-SA') : 'غير منشور'}`);
  };

  // دالة لفتح نموذج إضافة مقال
  const openAddArticleModal = () => {
    setShowAddArticleModal(true);
    setArticleFormData({
      title: '',
      category_id: '',
      excerpt: '',
      content: '',
      status: 'draft',
      published_at: ''
    });
    setArticleImage(null);
    setArticleFormErrors({});
  };

  // دالة لفتح نموذج تعديل مقال
  const openEditArticleModal = (article) => {
    setEditingArticle(article);
    setArticleFormData({
      title: article.title,
      category_id: article.category_id,
      excerpt: article.excerpt || '',
      content: article.content,
      status: article.status,
      published_at: article.published_at || ''
    });
    setArticleImage(null);
    setArticleFormErrors({});
    setShowEditArticleModal(true);
  };

  // دالة لإغلاق نماذج المقالات
  const closeArticleModals = () => {
    setShowAddArticleModal(false);
    setShowEditArticleModal(false);
    setEditingArticle(null);
    setArticleFormData({
      title: '',
      category_id: '',
      excerpt: '',
      content: '',
      status: 'draft',
      published_at: ''
    });
    setArticleImage(null);
    setArticleFormErrors({});
  };

  // دالة لتغيير بيانات نموذج المقال
  const handleArticleFormChange = (e) => {
    const { name, value } = e.target;
    setArticleFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // مسح الخطأ عند الكتابة
    if (articleFormErrors[name]) {
      setArticleFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // دالة لتغيير صورة المقال
  const handleArticleImageChange = (e) => {
    setArticleImage(e.target.files[0]);
  };

  // جلب البيانات عند تحميل المكون وعند تغيير القسم
  useEffect(() => {
    if (activeSection === 'users') {
      fetchAdmins();
    }
    if (activeSection === 'articles' || activeSection === 'dashboard') {
      fetchArticles();
    }
  }, [activeSection]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setMobileSidebarActive(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Toggle sidebar collapse
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Toggle mobile sidebar
  const toggleMobileSidebar = () => {
    setMobileSidebarActive(!mobileSidebarActive);
  };

  // Change active section
  const changeSection = (section) => {
    setActiveSection(section);
    if (window.innerWidth <= 768) {
      setMobileSidebarActive(false);
    }
  };

  // Open modal
  const openModal = (modalName) => {
    setActiveModal(modalName);
  };

  // Close modal
  const closeModal = () => {
    setActiveModal(null);
  };

  // Handle table row click
  const handleTableRowClick = (e) => {
    if (!e.target.closest('.table-actions-dash')) {
      e.currentTarget.classList.toggle('selected-dash');
    }
  };

  return (
    <div className={`dashboard-container ${darkMode ? 'dark-mode-dash' : ''}`}>
      <div className="dashboard-dash">
        {/* Header */}
        <header className="header-dash">
          <div className="d-flex-dash align-center-dash gap-1-dash">
            <button className="mobile-menu-toggle-dash" onClick={toggleMobileSidebar}>
              <i className="fas fa-bars"></i>
            </button>
            <div className="header-search-dash">
              <i className="fas fa-search"></i>
              <input type="text" placeholder="Search..." />
            </div>
          </div>
          <div className="header-actions-dash">
            <button className="header-action-btn-dash theme-toggle-dash" onClick={toggleDarkMode}>
              <i className={darkMode ? "fas fa-sun" : "fas fa-moon"}></i>
            </button>
            <button className="header-action-btn-dash">
              <i className="fas fa-bell"></i>
              <span className="header-action-badge-dash">3</span>
            </button>
            <div className="header-user-dash">
              <div className="header-user-avatar-dash">JD</div>
              <div className="header-user-info-dash">
                <div className="header-user-name-dash">John Doe</div>
                <div className="header-user-role-dash text-muted-dash">Administrator</div>
              </div>
            </div>
          </div>
        </header>

        {/* Sidebar */}
        <aside className={`sidebar-dash ${sidebarCollapsed ? 'collapsed-dash' : ''} ${mobileSidebarActive ? 'active-dash mobile-expanded-dash' : ''}`}>
          <div className="sidebar-logo-dash">
            <div className="sidebar-logo-icon-dash">
              <i className="fas fa-cube"></i>
            </div>
            <div className="sidebar-logo-text-dash">CMS Admin</div>
          </div>
          <nav className="sidebar-menu-dash">
            <a 
              href="#" 
              className={`sidebar-menu-item-dash ${activeSection === 'dashboard' ? 'active-dash' : ''}`}
              onClick={(e) => { e.preventDefault(); changeSection('dashboard'); }}
            >
              <i className="fas fa-home sidebar-menu-icon-dash"></i>
              <span className="sidebar-menu-text-dash">Dashboard</span>
            </a>
            <a 
              href="#" 
              className={`sidebar-menu-item-dash ${activeSection === 'articles' ? 'active-dash' : ''}`}
              onClick={(e) => { e.preventDefault(); changeSection('articles'); }}
            >
              <i className="fas fa-newspaper sidebar-menu-icon-dash"></i>
              <span className="sidebar-menu-text-dash">Articles</span>
            </a>
            <a 
              href="#" 
              className={`sidebar-menu-item-dash ${activeSection === 'categories' ? 'active-dash' : ''}`}
              onClick={(e) => { e.preventDefault(); changeSection('categories'); }}
            >
              <i className="fas fa-folder sidebar-menu-icon-dash"></i>
              <span className="sidebar-menu-text-dash">Categories</span>
            </a>
            <a 
              href="#" 
              className={`sidebar-menu-item-dash ${activeSection === 'comments' ? 'active-dash' : ''}`}
              onClick={(e) => { e.preventDefault(); changeSection('comments'); }}
            >
              <i className="fas fa-comments sidebar-menu-icon-dash"></i>
              <span className="sidebar-menu-text-dash">Comments</span>
            </a>
            <a 
              href="#" 
              className={`sidebar-menu-item-dash ${activeSection === 'messages' ? 'active-dash' : ''}`}
              onClick={(e) => { e.preventDefault(); changeSection('messages'); }}
            >
              <i className="fas fa-envelope sidebar-menu-icon-dash"></i>
              <span className="sidebar-menu-text-dash">Messages</span>
            </a>
            <a 
              href="#" 
              className={`sidebar-menu-item-dash ${activeSection === 'users' ? 'active-dash' : ''}`}
              onClick={(e) => { e.preventDefault(); changeSection('users'); }}
            >
              <i className="fas fa-users sidebar-menu-icon-dash"></i>
              <span className="sidebar-menu-text-dash">Users</span>
            </a>
            <a 
              href="#" 
              className={`sidebar-menu-item-dash ${activeSection === 'settings' ? 'active-dash' : ''}`}
              onClick={(e) => { e.preventDefault(); changeSection('settings'); }}
            >
              <i className="fas fa-cog sidebar-menu-icon-dash"></i>
              <span className="sidebar-menu-text-dash">Settings</span>
            </a>
          </nav>
          <div className="sidebar-footer-dash">
            <div className="sidebar-toggle-dash" onClick={toggleSidebar}>
              <i className={sidebarCollapsed ? "fas fa-chevron-right" : "fas fa-chevron-left"}></i>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="main-dash">
          {/* Dashboard Section */}
          <section className={`section-dash ${activeSection === 'dashboard' ? 'active-dash' : ''}`} id="dashboard">
            <div className="section-header-dash">
              <h1 className="section-title-dash">Dashboard</h1>
              <div className="d-flex-dash gap-1-dash">
                <button className="btn-dash btn-outline-dash">
                  <i className="fas fa-download"></i> Export Report
                </button>
                <button className="btn-dash btn-primary-dash" onClick={openAddArticleModal}>
                  <i className="fas fa-plus"></i> Add Article
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-dash">
              <div className="stat-card-dash">
                <div className="stat-card-header-dash">
                  <div className="stat-card-title-dash">Total Articles</div>
                  <div className="stat-card-icon-dash stat-card-icon-blue-dash">
                    <i className="fas fa-newspaper"></i>
                  </div>
                </div>
                <div className="stat-card-value-dash">{articleStats.total}</div>
                <div className="stat-card-change-dash stat-card-change-positive-dash">
                  <i className="fas fa-arrow-up"></i> 12% from last month
                </div>
              </div>
              <div className="stat-card-dash">
                <div className="stat-card-header-dash">
                  <div className="stat-card-title-dash">Published</div>
                  <div className="stat-card-icon-dash stat-card-icon-green-dash">
                    <i className="fas fa-check-circle"></i>
                  </div>
                </div>
                <div className="stat-card-value-dash">{articleStats.published}</div>
                <div className="stat-card-change-dash stat-card-change-positive-dash">
                  <i className="fas fa-arrow-up"></i> 8% from last month
                </div>
              </div>
              <div className="stat-card-dash">
                <div className="stat-card-header-dash">
                  <div className="stat-card-title-dash">Draft Articles</div>
                  <div className="stat-card-icon-dash stat-card-icon-orange-dash">
                    <i className="fas fa-edit"></i>
                  </div>
                </div>
                <div className="stat-card-value-dash">{articleStats.draft}</div>
                <div className="stat-card-change-dash stat-card-change-negative-dash">
                  <i className="fas fa-arrow-down"></i> 5% from last month
                </div>
              </div>
              <div className="stat-card-dash">
                <div className="stat-card-header-dash">
                  <div className="stat-card-title-dash">Total Views</div>
                  <div className="stat-card-icon-dash stat-card-icon-red-dash">
                    <i className="fas fa-eye"></i>
                  </div>
                </div>
                <div className="stat-card-value-dash">{articleStats.total_views}</div>
                <div className="stat-card-change-dash stat-card-change-positive-dash">
                  <i className="fas fa-arrow-up"></i> 15% from last month
                </div>
              </div>
            </div>

            {/* Recent Articles Table */}
            <div className="table-container-dash">
              <div className="table-controls-dash">
                <div className="table-controls-left-dash">
                  <h3>Recent Articles ({articles.length})</h3>
                </div>
                <div className="table-controls-right-dash">
                  <button className="btn-dash btn-outline-dash" onClick={fetchArticles}>
                    <i className="fas fa-sync-alt"></i> Refresh
                  </button>
                </div>
              </div>
              
              {/* Loading State */}
              {articlesLoading && (
                <div className="loading-dash">
                  <i className="fas fa-spinner fa-spin"></i> جاري تحميل المقالات...
                </div>
              )}
              
              {/* Error State */}
              {articlesError && (
                <div className="error-dash">
                  <i className="fas fa-exclamation-triangle"></i> {articlesError}
                </div>
              )}
              
              {!articlesLoading && !articlesError && (
                <>
                  <table className="table-dash">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Status</th>
                        <th>Author</th>
                        <th>Views</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {articles.slice(0, 5).map((article) => (
                        <tr key={article.id} onClick={handleTableRowClick}>
                          <td>{article.title}</td>
                          <td>{article.category?.name}</td>
                          <td>
                            <span className={`badge-dash ${
                              article.status === 'published' ? 'badge-published-dash' : 
                              article.status === 'draft' ? 'badge-draft-dash' : 'badge-archived-dash'
                            }`}>
                              {article.status === 'published' ? 'Published' : 
                              article.status === 'draft' ? 'Draft' : 'Archived'}
                            </span>
                          </td>
                          <td>{article.admin?.name}</td>
                          <td>{article.views_count}</td>
                          <td>{article.published_at ? new Date(article.published_at).toLocaleDateString('en-US') : 'Not published'}</td>
                          <td>
                            <div className="table-actions-dash">
                              <button 
                                className="table-action-dash table-action-view-dash"
                                onClick={() => handleViewArticle(article)}
                                title="View Article"
                              >
                                <i className="fas fa-eye"></i>
                              </button>
                              <button 
                                className="table-action-dash table-action-edit-dash"
                                onClick={() => openEditArticleModal(article)}
                                title="Edit Article"
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                              {article.status === 'published' ? (
                                <button 
                                  className="table-action-dash table-action-warning-dash"
                                  onClick={() => handleUnpublishArticle(article)}
                                  title="Unpublish Article"
                                >
                                  <i className="fas fa-times"></i>
                                </button>
                              ) : (
                                <button 
                                  className="table-action-dash table-action-success-dash"
                                  onClick={() => handlePublishArticle(article)}
                                  title="Publish Article"
                                >
                                  <i className="fas fa-check"></i>
                                </button>
                              )}
                              <button 
                                className="table-action-dash table-action-delete-dash"
                                onClick={() => handleDeleteArticle(article)}
                                title="Delete Article"
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </div>
          </section>

          {/* Articles Section */}
          <section className={`section-dash ${activeSection === 'articles' ? 'active-dash' : ''}`} id="articles">
            <div className="section-header-dash">
              <h1 className="section-title-dash">Articles Management</h1>
              <button className="btn-dash btn-primary-dash" onClick={openAddArticleModal}>
                <i className="fas fa-plus"></i> Add New Article
              </button>
            </div>
            
            {/* Articles Table */}
            <div className="table-container-dash">
              <div className="table-controls-dash">
                <div className="table-controls-left-dash">
                  <h3>All Articles ({articles.length})</h3>
                </div>
                <div className="table-controls-right-dash">
                  <button className="btn-dash btn-outline-dash" onClick={fetchArticles}>
                    <i className="fas fa-sync-alt"></i> Refresh
                  </button>
                </div>
              </div>
              
              {/* Loading State */}
              {articlesLoading && (
                <div className="loading-dash">
                  <i className="fas fa-spinner fa-spin"></i> جاري تحميل المقالات...
                </div>
              )}
              
              {/* Error State */}
              {articlesError && (
                <div className="error-dash">
                  <i className="fas fa-exclamation-triangle"></i> {articlesError}
                </div>
              )}
              
              {!articlesLoading && !articlesError && (
                <>
                  <table className="table-dash">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Status</th>
                        <th>Author</th>
                        <th>Views</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {articles.map((article) => (
                        <tr key={article.id} onClick={handleTableRowClick}>
                          <td>{article.title}</td>
                          <td>{article.category?.name}</td>
                          <td>
                            <span className={`badge-dash ${
                              article.status === 'published' ? 'badge-published-dash' : 
                              article.status === 'draft' ? 'badge-draft-dash' : 'badge-archived-dash'
                            }`}>
                              {article.status === 'published' ? 'Published' : 
                              article.status === 'draft' ? 'Draft' : 'Archived'}
                            </span>
                          </td>
                          <td>{article.admin?.name}</td>
                          <td>{article.views_count}</td>
                          <td>{article.published_at ? new Date(article.published_at).toLocaleDateString('en-US') : 'Not published'}</td>
                          <td>
                            <div className="table-actions-dash">
                              <button 
                                className="table-action-dash table-action-view-dash"
                                onClick={() => handleViewArticle(article)}
                                title="View Article"
                              >
                                <i className="fas fa-eye"></i>
                              </button>
                              <button 
                                className="table-action-dash table-action-edit-dash"
                                onClick={() => openEditArticleModal(article)}
                                title="Edit Article"
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                              {article.status === 'published' ? (
                                <button 
                                  className="table-action-dash table-action-warning-dash"
                                  onClick={() => handleUnpublishArticle(article)}
                                  title="Unpublish Article"
                                >
                                  <i className="fas fa-times"></i>
                                </button>
                              ) : (
                                <button 
                                  className="table-action-dash table-action-success-dash"
                                  onClick={() => handlePublishArticle(article)}
                                  title="Publish Article"
                                >
                                  <i className="fas fa-check"></i>
                                </button>
                              )}
                              <button 
                                className="table-action-dash table-action-delete-dash"
                                onClick={() => handleDeleteArticle(article)}
                                title="Delete Article"
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </div>
          </section>

          {/* Categories Section */}
          <section className={`section-dash ${activeSection === 'categories' ? 'active-dash' : ''}`} id="categories">
            <div className="section-header-dash">
              <h1 className="section-title-dash">Categories Management</h1>
              <button className="btn-dash btn-primary-dash" onClick={() => openModal('addCategory')}>
                <i className="fas fa-plus"></i> Add New Category
              </button>
            </div>
            <div className="text-center-dash mt-2-dash">
              <p className="text-muted-dash">Categories management section - content would be loaded here</p>
            </div>
          </section>

          {/* Comments Section */}
          <section className={`section-dash ${activeSection === 'comments' ? 'active-dash' : ''}`} id="comments">
            <div className="section-header-dash">
              <h1 className="section-title-dash">Comments Management</h1>
              <button className="btn-dash btn-primary-dash">
                <i className="fas fa-cog"></i> Moderation Settings
              </button>
            </div>
            <div className="text-center-dash mt-2-dash">
              <p className="text-muted-dash">Comments management section - content would be loaded here</p>
            </div>
          </section>

          {/* Messages Section */}
          <section className={`section-dash ${activeSection === 'messages' ? 'active-dash' : ''}`} id="messages">
            <div className="section-header-dash">
              <h1 className="section-title-dash">Contact Messages</h1>
              <button className="btn-dash btn-outline-dash">
                <i className="fas fa-download"></i> Export Messages
              </button>
            </div>
            <div className="text-center-dash mt-2-dash">
              <p className="text-muted-dash">Messages management section - content would be loaded here</p>
            </div>
          </section>

          {/* Users Section */}
          <section className={`section-dash ${activeSection === 'users' ? 'active-dash' : ''}`} id="users">
            <div className="section-header-dash">
              <h1 className="section-title-dash">إدارة المستخدمين</h1>
              <button className="btn-dash btn-primary-dash" onClick={openAddModal}>
                <i className="fas fa-plus"></i> إضافة مستخدم جديد
              </button>
            </div>
            
            {/* Users Table */}
            <div className="table-container-dash">
              <div className="table-controls-dash">
                <div className="table-controls-left-dash">
                  <h3>جميع المستخدمين ({admins.length})</h3>
                </div>
                <div className="table-controls-right-dash">
                  <select className="select-dash">
                    <option>جميع المستخدمين</option>
                    <option>نشط</option>
                    <option>غير نشط</option>
                  </select>
                  <button className="btn-dash btn-outline-dash" onClick={fetchAdmins}>
                    <i className="fas fa-sync-alt"></i> تحديث
                  </button>
                </div>
              </div>
              
              {/* Loading State */}
              {loading && (
                <div className="loading-dash">
                  <i className="fas fa-spinner fa-spin"></i> جاري تحميل البيانات...
                </div>
              )}
              
              {/* Error State */}
              {error && (
                <div className="error-dash">
                  <i className="fas fa-exclamation-triangle"></i> {error}
                </div>
              )}
              
              {/* Users Table */}
              {!loading && !error && (
                <>
                  <table className="table-dash">
                    <thead>
                      <tr>
                        <th>الاسم</th>
                        <th>البريد الإلكتروني</th>
                        <th>تاريخ الإنشاء</th>
                        <th>الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {admins.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="text-center-dash">
                            لا توجد بيانات
                          </td>
                        </tr>
                      ) : (
                        admins.map((admin) => (
                          <tr key={admin.id} onClick={(e) => handleTableRowClick(e)}>
                            <td>{admin.name}</td>
                            <td>{admin.email}</td>
                            <td>{new Date(admin.created_at).toLocaleDateString('ar-SA')}</td>
                            <td>
                              <div className="table-actions-dash">
                                <button 
                                  className="table-action-dash table-action-view-dash"
                                  onClick={() => handleViewAdmin(admin)}
                                  title="عرض التفاصيل"
                                >
                                  <i className="fas fa-eye"></i>
                                </button>
                                <button 
                                  className="table-action-dash table-action-edit-dash"
                                  onClick={() => openEditModal(admin)}
                                  title="تعديل"
                                >
                                  <i className="fas fa-edit"></i>
                                </button>
                                <button 
                                  className="table-action-dash table-action-delete-dash"
                                  onClick={() => handleDeleteAdmin(admin.id, admin.name)}
                                  title="حذف"
                                  disabled={admins.length <= 1}
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                  
                  <div className="pagination-dash">
                    <button className="pagination-item-dash">
                      <i className="fas fa-chevron-left"></i>
                    </button>
                    <button className="pagination-item-dash active-dash">1</button>
                    <button className="pagination-item-dash">2</button>
                    <button className="pagination-item-dash">3</button>
                    <button className="pagination-item-dash">4</button>
                    <button className="pagination-item-dash">5</button>
                    <button className="pagination-item-dash">
                      <i className="fas fa-chevron-right"></i>
                    </button>
                  </div>
                </>
              )}
            </div>
          </section>
        </main>
      </div>

     {/* Add Article Modal */}
      <div className={`modal-dash ${showAddArticleModal ? 'active-dash' : ''}`}>
        <div className="modal-content-dash" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header-dash">
            <h2 className="modal-title-dash">Add New Article</h2>
            <button className="modal-close-dash" onClick={closeArticleModals}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className="modal-body-dash">
            <form onSubmit={handleAddArticle}>
              <div className="form-group-dash">
                <label className="form-label-dash">Title</label>
                <input 
                  type="text" 
                  className="form-control-dash" 
                  name="title"
                  value={articleFormData.title}
                  onChange={handleArticleFormChange}
                  required
                />
                {articleFormErrors.title && <div className="error-message-dash">{articleFormErrors.title[0]}</div>}
              </div>
              
              <div className="form-group-dash">
                <label className="form-label-dash">Category</label>
                <select 
                  className="form-control-dash" 
                  name="category_id"
                  value={articleFormData.category_id}
                  onChange={handleArticleFormChange}
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
                {articleFormErrors.category_id && <div className="error-message-dash">{articleFormErrors.category_id[0]}</div>}
              </div>
              
              <div className="form-group-dash">
                <label className="form-label-dash">Excerpt</label>
                <textarea 
                  className="form-control-dash" 
                  name="excerpt"
                  value={articleFormData.excerpt}
                  onChange={handleArticleFormChange}
                  rows="3"
                  placeholder="Brief description of the article"
                />
                {articleFormErrors.excerpt && <div className="error-message-dash">{articleFormErrors.excerpt[0]}</div>}
              </div>
              
              <div className="form-group-dash">
                <label className="form-label-dash">Content</label>
                <textarea 
                  className="form-control-dash" 
                  name="content"
                  value={articleFormData.content}
                  onChange={handleArticleFormChange}
                  rows="6"
                  required
                  placeholder="Article content"
                />
                {articleFormErrors.content && <div className="error-message-dash">{articleFormErrors.content[0]}</div>}
              </div>
              
              <div className="form-group-dash">
                <label className="form-label-dash">Image</label>
                <input 
                  type="file" 
                  className="form-control-dash" 
                  accept="image/*"
                  onChange={handleArticleImageChange}
                />
                {articleFormErrors.image && <div className="error-message-dash">{articleFormErrors.image[0]}</div>}
              </div>
              
              <div className="form-group-dash">
                <label className="form-label-dash">Status</label>
                <select 
                  className="form-control-dash" 
                  name="status"
                  value={articleFormData.status}
                  onChange={handleArticleFormChange}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
                {articleFormErrors.status && <div className="error-message-dash">{articleFormErrors.status[0]}</div>}
              </div>
              
              {articleFormData.status === 'published' && (
                <div className="form-group-dash">
                  <label className="form-label-dash">Publish Date</label>
                  <input 
                    type="datetime-local" 
                    className="form-control-dash" 
                    name="published_at"
                    value={articleFormData.published_at}
                    onChange={handleArticleFormChange}
                  />
                  {articleFormErrors.published_at && <div className="error-message-dash">{articleFormErrors.published_at[0]}</div>}
                </div>
              )}
            </form>
          </div>
          <div className="modal-footer-dash">
            <button className="btn-dash btn-outline-dash" onClick={closeArticleModals}>Cancel</button>
            <button className="btn-dash btn-primary-dash" onClick={handleAddArticle}>Save Article</button>
          </div>
        </div>
      </div>

      {/* Edit Article Modal */}
      <div className={`modal-dash ${showEditArticleModal ? 'active-dash' : ''}`}>
        <div className="modal-content-dash" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header-dash">
            <h2 className="modal-title-dash">Edit Article</h2>
            <button className="modal-close-dash" onClick={closeArticleModals}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className="modal-body-dash">
            <form onSubmit={handleEditArticle}>
              <div className="form-group-dash">
                <label className="form-label-dash">Title</label>
                <input 
                  type="text" 
                  className="form-control-dash" 
                  name="title"
                  value={articleFormData.title}
                  onChange={handleArticleFormChange}
                  required
                />
                {articleFormErrors.title && <div className="error-message-dash">{articleFormErrors.title[0]}</div>}
              </div>
              
              <div className="form-group-dash">
                <label className="form-label-dash">Category</label>
                <select 
                  className="form-control-dash" 
                  name="category_id"
                  value={articleFormData.category_id}
                  onChange={handleArticleFormChange}
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
                {articleFormErrors.category_id && <div className="error-message-dash">{articleFormErrors.category_id[0]}</div>}
              </div>
              
              <div className="form-group-dash">
                <label className="form-label-dash">Excerpt</label>
                <textarea 
                  className="form-control-dash" 
                  name="excerpt"
                  value={articleFormData.excerpt}
                  onChange={handleArticleFormChange}
                  rows="3"
                  placeholder="Brief description of the article"
                />
                {articleFormErrors.excerpt && <div className="error-message-dash">{articleFormErrors.excerpt[0]}</div>}
              </div>
              
              <div className="form-group-dash">
                <label className="form-label-dash">Content</label>
                <textarea 
                  className="form-control-dash" 
                  name="content"
                  value={articleFormData.content}
                  onChange={handleArticleFormChange}
                  rows="6"
                  required
                  placeholder="Article content"
                />
                {articleFormErrors.content && <div className="error-message-dash">{articleFormErrors.content[0]}</div>}
              </div>
              
              <div className="form-group-dash">
                <label className="form-label-dash">Image</label>
                <input 
                  type="file" 
                  className="form-control-dash" 
                  accept="image/*"
                  onChange={handleArticleImageChange}
                />
                <small className="text-muted-dash">Leave empty to keep current image</small>
                {articleFormErrors.image && <div className="error-message-dash">{articleFormErrors.image[0]}</div>}
              </div>
              
              <div className="form-group-dash">
                <label className="form-label-dash">Status</label>
                <select 
                  className="form-control-dash" 
                  name="status"
                  value={articleFormData.status}
                  onChange={handleArticleFormChange}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
                {articleFormErrors.status && <div className="error-message-dash">{articleFormErrors.status[0]}</div>}
              </div>
              
              {articleFormData.status === 'published' && (
                <div className="form-group-dash">
                  <label className="form-label-dash">Publish Date</label>
                  <input 
                    type="datetime-local" 
                    className="form-control-dash" 
                    name="published_at"
                    value={articleFormData.published_at}
                    onChange={handleArticleFormChange}
                  />
                  {articleFormErrors.published_at && <div className="error-message-dash">{articleFormErrors.published_at[0]}</div>}
                </div>
              )}
            </form>
          </div>
          <div className="modal-footer-dash">
            <button className="btn-dash btn-outline-dash" onClick={closeArticleModals}>Cancel</button>
            <button className="btn-dash btn-primary-dash" onClick={handleEditArticle}>Update Article</button>
          </div>
        </div>
      </div>

      {/* Add Category Modal */}
      <div className={`modal-dash ${activeModal === 'addCategory' ? 'active-dash' : ''}`} id="addCategoryModal">
        <div className="modal-content-dash" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header-dash">
            <h2 className="modal-title-dash">Add New Category</h2>
            <button className="modal-close-dash" onClick={closeModal}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className="modal-body-dash">
            <form id="categoryForm">
              <div className="form-group-dash">
                <label className="form-label-dash" htmlFor="categoryName">Name</label>
                <input type="text" className="form-control-dash" id="categoryName" placeholder="Enter category name" />
              </div>
              <div className="form-group-dash">
                <label className="form-label-dash" htmlFor="categoryDescription">Description</label>
                <textarea className="form-control-dash" id="categoryDescription" placeholder="Enter category description"></textarea>
              </div>
              <div className="form-group-dash">
                <label className="form-label-dash" htmlFor="categoryParent">Parent Category</label>
                <select className="form-control-dash" id="categoryParent">
                  <option value="">None (Top Level)</option>
                  <option value="technology">Technology</option>
                  <option value="business">Business</option>
                  <option value="health">Health</option>
                </select>
              </div>
              <div className="form-group-dash">
                <label className="form-label-dash" htmlFor="categoryColor">Color</label>
                <input type="color" className="form-control-dash" id="categoryColor" defaultValue="#4361ee" />
              </div>
            </form>
          </div>
          <div className="modal-footer-dash">
            <button className="btn-dash btn-outline-dash" onClick={closeModal}>Cancel</button>
            <button className="btn-dash btn-primary-dash">Save Category</button>
          </div>
        </div>
      </div>

      {/* Add Admin Modal */}
      <div className={`modal-dash ${showAddModal ? 'active-dash' : ''}`}>
        <div className="modal-content-dash" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header-dash">
            <h2 className="modal-title-dash">إضافة مستخدم جديد</h2>
            <button className="modal-close-dash" onClick={closeModals}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className="modal-body-dash">
            <form onSubmit={handleAddAdmin}>
              <div className="form-group-dash">
                <label className="form-label-dash">الاسم</label>
                <input 
                  type="text" 
                  className="form-control-dash" 
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  required
                />
                {formErrors.name && <div className="error-message-dash">{formErrors.name[0]}</div>}
              </div>
              
              <div className="form-group-dash">
                <label className="form-label-dash">البريد الإلكتروني</label>
                <input 
                  type="email" 
                  className="form-control-dash" 
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  required
                />
                {formErrors.email && <div className="error-message-dash">{formErrors.email[0]}</div>}
              </div>
              
              <div className="form-group-dash">
                <label className="form-label-dash">كلمة المرور</label>
                <input 
                  type="password" 
                  className="form-control-dash" 
                  name="password"
                  value={formData.password}
                  onChange={handleFormChange}
                  required
                />
                {formErrors.password && <div className="error-message-dash">{formErrors.password[0]}</div>}
              </div>
              
              <div className="form-group-dash">
                <label className="form-label-dash">تأكيد كلمة المرور</label>
                <input 
                  type="password" 
                  className="form-control-dash" 
                  name="password_confirmation"
                  value={formData.password_confirmation}
                  onChange={handleFormChange}
                  required
                />
              </div>
            </form>
          </div>
          <div className="modal-footer-dash">
            <button className="btn-dash btn-outline-dash" onClick={closeModals}>إلغاء</button>
            <button className="btn-dash btn-primary-dash" onClick={handleAddAdmin}>حفظ</button>
          </div>
        </div>
      </div>

      {/* Edit Admin Modal */}
      <div className={`modal-dash ${showEditModal ? 'active-dash' : ''}`}>
        <div className="modal-content-dash" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header-dash">
            <h2 className="modal-title-dash">تعديل المستخدم</h2>
            <button className="modal-close-dash" onClick={closeModals}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className="modal-body-dash">
            <form onSubmit={handleEditAdmin}>
              <div className="form-group-dash">
                <label className="form-label-dash">الاسم</label>
                <input 
                  type="text" 
                  className="form-control-dash" 
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  required
                />
                {formErrors.name && <div className="error-message-dash">{formErrors.name[0]}</div>}
              </div>
              
              <div className="form-group-dash">
                <label className="form-label-dash">البريد الإلكتروني</label>
                <input 
                  type="email" 
                  className="form-control-dash" 
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  required
                />
                {formErrors.email && <div className="error-message-dash">{formErrors.email[0]}</div>}
              </div>
              
              <div className="form-group-dash">
                <label className="form-label-dash">كلمة المرور الجديدة (اختياري)</label>
                <input 
                  type="password" 
                  className="form-control-dash" 
                  name="password"
                  value={formData.password}
                  onChange={handleFormChange}
                  placeholder="اتركه فارغاً إذا لم ترد التغيير"
                />
                {formErrors.password && <div className="error-message-dash">{formErrors.password[0]}</div>}
              </div>
              
              <div className="form-group-dash">
                <label className="form-label-dash">تأكيد كلمة المرور</label>
                <input 
                  type="password" 
                  className="form-control-dash" 
                  name="password_confirmation"
                  value={formData.password_confirmation}
                  onChange={handleFormChange}
                  placeholder="اتركه فارغاً إذا لم ترد التغيير"
                />
              </div>
            </form>
          </div>
          <div className="modal-footer-dash">
            <button className="btn-dash btn-outline-dash" onClick={closeModals}>إلغاء</button>
            <button className="btn-dash btn-primary-dash" onClick={handleEditAdmin}>تحديث</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;