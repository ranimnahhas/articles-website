import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import API_CONFIG from '../../config';

const Dashboard = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarActive, setMobileSidebarActive] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  
  // States for Users Management
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
  const [actionLoading, setActionLoading] = useState(false);

  // States for Pagination
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0
  });

  // States for Articles
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
  const [articleActionLoading, setArticleActionLoading] = useState(false);

  // States for Categories
  const [categoriesData, setCategoriesData] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    slug: '',
    status: 'active'
  });
  const [categoryFormErrors, setCategoryFormErrors] = useState({});
  const [categoryActionLoading, setCategoryActionLoading] = useState(false);

  // Categories Pagination
  const [categoriesPagination, setCategoriesPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0
  });

  // Get admin name from localStorage
  const [adminName, setAdminName] = useState('');

  // Helper function to get auth token
  const getAuthToken = () => {
    return localStorage.getItem('admin_token') || localStorage.getItem('adminToken');
  };

  // Handle server responses
  const handleResponse = async (response) => {
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      const text = await response.text();
      throw new Error(`Server returned: ${response.status} ${response.statusText}. Response: ${text.substring(0, 200)}`);
    }
  };

  // Fetch admins data with pagination
  const fetchAdmins = async (page = 1, perPage = pagination.per_page) => {
    try {
      setLoading(true);
      setError(null);
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}/admins?page=${page}&per_page=${perPage}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
      }

      const result = await handleResponse(response);
      
      if (result.success) {
        setAdmins(result.data);
        setPagination(result.pagination);
      } else {
        setError(result.message || 'Unknown error occurred');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching admins:', err);
    } finally {
      setLoading(false);
    }
  };

  // View admin details
  const handleViewAdmin = (admin) => {
    alert(`Admin Details:\nName: ${admin.name}\nEmail: ${admin.email}\nCreated At: ${new Date(admin.created_at).toLocaleDateString('en-US')}`);
  };

  // Add new admin
  const handleAddAdmin = async (e) => {
    e.preventDefault();
    
    try {
      setActionLoading(true);
      const token = getAuthToken();
      if (!token) {
        alert('Authentication token not found');
        return;
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}/admins`, {
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
        alert('Admin added successfully');
        setShowAddModal(false);
        setFormData({ name: '', email: '', password: '', password_confirmation: '' });
        setFormErrors({});
        fetchAdmins(pagination.current_page, pagination.per_page);
      } else {
        setFormErrors(result.errors || {});
        alert(result.message || 'Error occurred during addition');
      }
    } catch (err) {
      alert('Server connection error: ' + err.message);
      console.error('Error adding admin:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Edit admin
  const handleEditAdmin = async (e) => {
    e.preventDefault();
    
    try {
      setActionLoading(true);
      const token = getAuthToken();
      if (!token) {
        alert('Authentication token not found');
        return;
      }

      // Create update data (don't send password if empty)
      const updateData = {
        name: formData.name,
        email: formData.email
      };

      // Add password only if entered
      if (formData.password) {
        updateData.password = formData.password;
        updateData.password_confirmation = formData.password_confirmation;
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}/admins/${editingAdmin.id}`, {
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
        alert('Admin updated successfully');
        setShowEditModal(false);
        setEditingAdmin(null);
        setFormData({ name: '', email: '', password: '', password_confirmation: '' });
        setFormErrors({});
        fetchAdmins(pagination.current_page, pagination.per_page);
      } else {
        setFormErrors(result.errors || {});
        alert(result.message || 'Error occurred during update');
      }
    } catch (err) {
      alert('Server connection error: ' + err.message);
      console.error('Error editing admin:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Open add modal
  const openAddModal = () => {
    setShowAddModal(true);
    setFormData({ name: '', email: '', password: '', password_confirmation: '' });
    setFormErrors({});
  };

  // Open edit modal
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

  // Close modals
  const closeModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setEditingAdmin(null);
    setFormData({ name: '', email: '', password: '', password_confirmation: '' });
    setFormErrors({});
  };

  // Handle form changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Pagination functions
  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.last_page) {
      fetchAdmins(page, pagination.per_page);
    }
  };

  const handlePerPageChange = (e) => {
    const newPerPage = parseInt(e.target.value);
    fetchAdmins(1, newPerPage);
  };

  const handleFirstPage = () => {
    handlePageChange(1);
  };

  const handleLastPage = () => {
    handlePageChange(pagination.last_page);
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, pagination.current_page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(pagination.last_page, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // First page button
    pages.push(
      <button
        key="first"
        className={`pagination-item-dash ${pagination.current_page === 1 ? 'disabled-dash' : ''}`}
        onClick={handleFirstPage}
        disabled={pagination.current_page === 1}
        title="First Page"
      >
        <i className="fas fa-angle-double-left"></i>
      </button>
    );

    // Previous button
    pages.push(
      <button
        key="prev"
        className={`pagination-item-dash ${pagination.current_page === 1 ? 'disabled-dash' : ''}`}
        onClick={() => handlePageChange(pagination.current_page - 1)}
        disabled={pagination.current_page === 1}
        title="Previous Page"
      >
        <i className="fas fa-chevron-left"></i>
      </button>
    );

    // First page and ellipsis
    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          className={`pagination-item-dash ${1 === pagination.current_page ? 'active-dash' : ''}`}
          onClick={() => handlePageChange(1)}
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(
          <span key="ellipsis1" className="pagination-ellipsis-dash">
            ...
          </span>
        );
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`pagination-item-dash ${i === pagination.current_page ? 'active-dash' : ''}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }

    // Last page and ellipsis
    if (endPage < pagination.last_page) {
      if (endPage < pagination.last_page - 1) {
        pages.push(
          <span key="ellipsis2" className="pagination-ellipsis-dash">
            ...
          </span>
        );
      }
      pages.push(
        <button
          key={pagination.last_page}
          className={`pagination-item-dash ${pagination.last_page === pagination.current_page ? 'active-dash' : ''}`}
          onClick={() => handlePageChange(pagination.last_page)}
        >
          {pagination.last_page}
        </button>
      );
    }

    // Next button
    pages.push(
      <button
        key="next"
        className={`pagination-item-dash ${pagination.current_page === pagination.last_page ? 'disabled-dash' : ''}`}
        onClick={() => handlePageChange(pagination.current_page + 1)}
        disabled={pagination.current_page === pagination.last_page}
        title="Next Page"
      >
        <i className="fas fa-chevron-right"></i>
      </button>
    );

    // Last page button
    pages.push(
      <button
        key="last"
        className={`pagination-item-dash ${pagination.current_page === pagination.last_page ? 'disabled-dash' : ''}`}
        onClick={handleLastPage}
        disabled={pagination.current_page === pagination.last_page}
        title="Last Page"
      >
        <i className="fas fa-angle-double-right"></i>
      </button>
    );

    return pages;
  };

  // ==================== Articles Functions ====================

  // Fetch articles
  const fetchArticles = async () => {
    try {
      setArticlesLoading(true);
      setArticlesError(null);
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}/articles`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch articles: ${response.status} ${response.statusText}`);
      }

      const result = await handleResponse(response);
      
      if (result.success) {
        setArticles(result.data.articles.data);
        setArticleStats(result.data.stats);
        setCategories(result.data.categories);
      } else {
        setArticlesError(result.message || 'Unknown error occurred');
      }
    } catch (err) {
      setArticlesError(err.message);
      console.error('Error fetching articles:', err);
    } finally {
      setArticlesLoading(false);
    }
  };

  // Create new article
  const handleAddArticle = async (e) => {
    e.preventDefault();
    
    try {
      setArticleActionLoading(true);
      const token = getAuthToken();
      if (!token) {
        alert('Authentication token not found');
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

      const response = await fetch(`${API_CONFIG.BASE_URL}/articles`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend
      });

      const result = await handleResponse(response);

      if (result.success) {
        alert('Article created successfully');
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
        alert(result.message || 'Error occurred while creating article');
      }
    } catch (err) {
      alert('Server connection error: ' + err.message);
      console.error('Error adding article:', err);
    } finally {
      setArticleActionLoading(false);
    }
  };

  // Edit article
  const handleEditArticle = async (e) => {
    e.preventDefault();
    
    try {
      setArticleActionLoading(true);
      const token = getAuthToken();
      if (!token) {
        alert('Authentication token not found - please login again');
        return;
      }

      const requestData = {
        title: articleFormData.title,
        category_id: parseInt(articleFormData.category_id),
        excerpt: articleFormData.excerpt || '',
        content: articleFormData.content,
        status: articleFormData.status,
        _method: 'PUT'
      };

      if (articleFormData.published_at) {
        requestData.published_at = articleFormData.published_at;
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}/articles/${editingArticle.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      const result = await handleResponse(response);

      if (result.success) {
        alert('Article updated successfully');
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
        alert(result.message || 'Error occurred while updating article');
      }
    } catch (err) {
      console.error('Error editing article:', err);
      
      if (err.message.includes('CORS') || err.message.includes('Failed to fetch')) {
        alert('Server connection error: CORS issue. Make sure the server is running and allows requests from this domain.');
      } else {
        alert('Server connection error: ' + err.message);
      }
    } finally {
      setArticleActionLoading(false);
    }
  };

  // Delete article
  const handleDeleteArticle = async (article) => {
    if (!window.confirm(`Are you sure you want to delete the article "${article.title}"?`)) {
      return;
    }

    try {
      setArticleActionLoading(true);
      const token = getAuthToken();
      if (!token) {
        alert('Authentication token not found');
        return;
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}/articles/${article.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      const result = await handleResponse(response);

      if (result.success) {
        alert('Article deleted successfully');
        fetchArticles();
      } else {
        alert(result.message || 'Error occurred while deleting article');
      }
    } catch (err) {
      alert('Error occurred during deletion: ' + err.message);
      console.error('Error deleting article:', err);
    } finally {
      setArticleActionLoading(false);
    }
  };

  // Publish article
  const handlePublishArticle = async (article) => {
    try {
      setArticleActionLoading(true);
      const token = getAuthToken();
      if (!token) {
        alert('Authentication token not found');
        return;
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}/articles/${article.id}/publish`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      const result = await handleResponse(response);

      if (result.success) {
        alert('Article published successfully');
        fetchArticles();
      } else {
        alert(result.message || 'Error occurred while publishing article');
      }
    } catch (err) {
      alert('Error occurred during publishing: ' + err.message);
      console.error('Error publishing article:', err);
    } finally {
      setArticleActionLoading(false);
    }
  };

  // Unpublish article
  const handleUnpublishArticle = async (article) => {
    try {
      setArticleActionLoading(true);
      const token = getAuthToken();
      if (!token) {
        alert('Authentication token not found');
        return;
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}/articles/${article.id}/unpublish`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      const result = await handleResponse(response);

      if (result.success) {
        alert('Article unpublished successfully');
        fetchArticles();
      } else {
        alert(result.message || 'Error occurred while unpublishing article');
      }
    } catch (err) {
      alert('Error occurred during unpublishing: ' + err.message);
      console.error('Error unpublishing article:', err);
    } finally {
      setArticleActionLoading(false);
    }
  };

  // View article details
  const handleViewArticle = (article) => {
    alert(`Article Details:\nTitle: ${article.title}\nCategory: ${article.category?.name}\nStatus: ${article.status}\nAuthor: ${article.admin?.name}\nViews: ${article.views_count}\nPublished Date: ${article.published_at ? new Date(article.published_at).toLocaleDateString('en-US') : 'Not published'}`);
  };

  // Open add article modal
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

  // Open edit article modal
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

  // Close article modals
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

  // Handle article form changes
  const handleArticleFormChange = (e) => {
    const { name, value } = e.target;
    setArticleFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when typing
    if (articleFormErrors[name]) {
      setArticleFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle article image change
  const handleArticleImageChange = (e) => {
    setArticleImage(e.target.files[0]);
  };

  // ==================== Categories Functions ====================

  // Fetch categories with pagination
  const fetchCategories = async (page = 1, perPage = categoriesPagination.per_page) => {
    try {
      setCategoriesLoading(true);
      setCategoriesError(null);
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}/categories?page=${page}&per_page=${perPage}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.status} ${response.statusText}`);
      }

      const result = await handleResponse(response);
      
      if (result.success) {
        setCategoriesData(result.data.categories.data);
        setCategoriesPagination({
          current_page: result.data.categories.current_page,
          last_page: result.data.categories.last_page,
          per_page: result.data.categories.per_page,
          total: result.data.categories.total,
          from: result.data.categories.from,
          to: result.data.categories.to
        });
      } else {
        setCategoriesError(result.message || 'Unknown error occurred');
      }
    } catch (err) {
      setCategoriesError(err.message);
      console.error('Error fetching categories:', err);
    } finally {
      setCategoriesLoading(false);
    }
  };

  // View category details
  const handleViewCategory = (category) => {
    alert(`Category Details:\nName: ${category.name}\nSlug: ${category.slug}\nStatus: ${category.is_active ? 'Active' : 'Inactive'}\nCreated At: ${new Date(category.created_at).toLocaleDateString('en-US')}`);
  };

  // Add new category
  const handleAddCategory = async (e) => {
    e.preventDefault();
    
    try {
      setCategoryActionLoading(true);
      const token = getAuthToken();
      if (!token) {
        alert('Authentication token not found');
        return;
      }

      const updateData = {
        name: categoryFormData.name,
        slug: categoryFormData.slug,
        is_active: categoryFormData.status === 'active'
      };

      const response = await fetch(`${API_CONFIG.BASE_URL}/categories`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      const result = await handleResponse(response);

      if (result.success) {
        alert('Category added successfully');
        setShowAddCategoryModal(false);
        setCategoryFormData({ name: '', slug: '', status: 'active' });
        setCategoryFormErrors({});
        fetchCategories(categoriesPagination.current_page, categoriesPagination.per_page);
      } else {
        setCategoryFormErrors(result.errors || {});
        alert(result.message || 'Error occurred during addition');
      }
    } catch (err) {
      alert('Server connection error: ' + err.message);
      console.error('Error adding category:', err);
    } finally {
      setCategoryActionLoading(false);
    }
  };

  // Edit category
  const handleEditCategory = async (e) => {
    e.preventDefault();
    
    try {
      setCategoryActionLoading(true);
      const token = getAuthToken();
      if (!token) {
        alert('Authentication token not found');
        return;
      }

      const updateData = {
        name: categoryFormData.name,
        slug: categoryFormData.slug,
        is_active: categoryFormData.status === 'active'
      };

      const response = await fetch(`${API_CONFIG.BASE_URL}/categories/${editingCategory.id}`, {
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
        alert('Category updated successfully');
        setShowEditCategoryModal(false);
        setEditingCategory(null);
        setCategoryFormData({ name: '', slug: '', status: 'active' });
        setCategoryFormErrors({});
        fetchCategories(categoriesPagination.current_page, categoriesPagination.per_page);
      } else {
        setCategoryFormErrors(result.errors || {});
        alert(result.message || 'Error occurred during update');
      }
    } catch (err) {
      alert('Server connection error: ' + err.message);
      console.error('Error editing category:', err);
    } finally {
      setCategoryActionLoading(false);
    }
  };

  // Open add category modal
  const openAddCategoryModal = () => {
    setShowAddCategoryModal(true);
    setCategoryFormData({ name: '', slug: '', status: 'active' });
    setCategoryFormErrors({});
  };

  // Open edit category modal
  const openEditCategoryModal = (category) => {
    setEditingCategory(category);
    setCategoryFormData({
      name: category.name,
      slug: category.slug,
      status: category.is_active ? 'active' : 'inactive'
    });
    setCategoryFormErrors({});
    setShowEditCategoryModal(true);
  };

  // Close category modals
  const closeCategoryModals = () => {
    setShowAddCategoryModal(false);
    setShowEditCategoryModal(false);
    setEditingCategory(null);
    setCategoryFormData({ name: '', slug: '', status: 'active' });
    setCategoryFormErrors({});
  };

  // Handle category form changes
  const handleCategoryFormChange = (e) => {
    const { name, value } = e.target;
    setCategoryFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when typing
    if (categoryFormErrors[name]) {
      setCategoryFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Categories Pagination functions
  const handleCategoriesPageChange = (page) => {
    if (page >= 1 && page <= categoriesPagination.last_page) {
      fetchCategories(page, categoriesPagination.per_page);
    }
  };

  const handleCategoriesPerPageChange = (e) => {
    const newPerPage = parseInt(e.target.value);
    fetchCategories(1, newPerPage);
  };

  const handleCategoriesFirstPage = () => {
    handleCategoriesPageChange(1);
  };

  const handleCategoriesLastPage = () => {
    handleCategoriesPageChange(categoriesPagination.last_page);
  };

  const renderCategoriesPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, categoriesPagination.current_page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(categoriesPagination.last_page, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // First page button
    pages.push(
      <button
        key="first"
        className={`pagination-item-dash ${categoriesPagination.current_page === 1 ? 'disabled-dash' : ''}`}
        onClick={handleCategoriesFirstPage}
        disabled={categoriesPagination.current_page === 1}
        title="First Page"
      >
        <i className="fas fa-angle-double-left"></i>
      </button>
    );

    // Previous button
    pages.push(
      <button
        key="prev"
        className={`pagination-item-dash ${categoriesPagination.current_page === 1 ? 'disabled-dash' : ''}`}
        onClick={() => handleCategoriesPageChange(categoriesPagination.current_page - 1)}
        disabled={categoriesPagination.current_page === 1}
        title="Previous Page"
      >
        <i className="fas fa-chevron-left"></i>
      </button>
    );

    // First page and ellipsis
    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          className={`pagination-item-dash ${1 === categoriesPagination.current_page ? 'active-dash' : ''}`}
          onClick={() => handleCategoriesPageChange(1)}
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(
          <span key="ellipsis1" className="pagination-ellipsis-dash">
            ...
          </span>
        );
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`pagination-item-dash ${i === categoriesPagination.current_page ? 'active-dash' : ''}`}
          onClick={() => handleCategoriesPageChange(i)}
        >
          {i}
        </button>
      );
    }

    // Last page and ellipsis
    if (endPage < categoriesPagination.last_page) {
      if (endPage < categoriesPagination.last_page - 1) {
        pages.push(
          <span key="ellipsis2" className="pagination-ellipsis-dash">
            ...
          </span>
        );
      }
      pages.push(
        <button
          key={categoriesPagination.last_page}
          className={`pagination-item-dash ${categoriesPagination.last_page === categoriesPagination.current_page ? 'active-dash' : ''}`}
          onClick={() => handleCategoriesPageChange(categoriesPagination.last_page)}
        >
          {categoriesPagination.last_page}
        </button>
      );
    }

    // Next button
    pages.push(
      <button
        key="next"
        className={`pagination-item-dash ${categoriesPagination.current_page === categoriesPagination.last_page ? 'disabled-dash' : ''}`}
        onClick={() => handleCategoriesPageChange(categoriesPagination.current_page + 1)}
        disabled={categoriesPagination.current_page === categoriesPagination.last_page}
        title="Next Page"
      >
        <i className="fas fa-chevron-right"></i>
      </button>
    );

    // Last page button
    pages.push(
      <button
        key="last"
        className={`pagination-item-dash ${categoriesPagination.current_page === categoriesPagination.last_page ? 'disabled-dash' : ''}`}
        onClick={handleCategoriesLastPage}
        disabled={categoriesPagination.current_page === categoriesPagination.last_page}
        title="Last Page"
      >
        <i className="fas fa-angle-double-right"></i>
      </button>
    );

    return pages;
  };

  // Load admin name from localStorage on component mount
  useEffect(() => {
    const storedAdminName = localStorage.getItem('adminName');
    if (storedAdminName) {
      setAdminName(storedAdminName);
    }
  }, []);

  // Fetch data when component loads and when section changes
  useEffect(() => {
    if (activeSection === 'users') {
      fetchAdmins();
    }
    if (activeSection === 'articles' || activeSection === 'dashboard') {
      fetchArticles();
    }
    if (activeSection === 'categories') {
      fetchCategories();
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
           
            <div className="header-user-dash">
            
              <div className="header-user-info-dash">
                <div className="header-user-name-dash">{adminName || 'Administrator'}</div>
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
                  <i className="fas fa-spinner fa-spin"></i> Loading articles...
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
                  <i className="fas fa-spinner fa-spin"></i> Loading articles...
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
              <button className="btn-dash btn-primary-dash" onClick={openAddCategoryModal}>
                <i className="fas fa-plus"></i> Add New Category
              </button>
            </div>
            
            {/* Categories Table */}
            <div className="table-container-dash">
              <div className="table-controls-dash">
                <div className="table-controls-left-dash">
                  <h3>All Categories ({categoriesPagination.total})</h3>
                  <div className="text-muted-dash">
                    Showing {categoriesPagination.from} to {categoriesPagination.to} of {categoriesPagination.total} entries
                  </div>
                </div>
                <div className="table-controls-right-dash">
                  <div className="d-flex-dash align-center-dash gap-1-dash">
                    <span className="text-muted-dash">Show:</span>
                    <select 
                      className="select-dash" 
                      value={categoriesPagination.per_page}
                      onChange={handleCategoriesPerPageChange}
                    >
                      <option value="5">5</option>
                      <option value="10">10</option>
                      <option value="25">25</option>
                      <option value="50">50</option>
                      <option value="100">100</option>
                    </select>
                    <span className="text-muted-dash">per page</span>
                  </div>
                  <button className="btn-dash btn-outline-dash" onClick={() => fetchCategories(categoriesPagination.current_page, categoriesPagination.per_page)}>
                    <i className="fas fa-sync-alt"></i> Refresh
                  </button>
                </div>
              </div>
              
              {/* Loading State */}
              {categoriesLoading && (
                <div className="loading-dash">
                  <i className="fas fa-spinner fa-spin"></i> Loading categories...
                </div>
              )}
              
              {/* Error State */}
              {categoriesError && (
                <div className="error-dash">
                  <i className="fas fa-exclamation-triangle"></i> {categoriesError}
                </div>
              )}
              
              {/* Categories Table */}
              {!categoriesLoading && !categoriesError && (
                <>
                  <table className="table-dash">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Slug</th>
                        <th>Status</th>
                        <th>Created At</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categoriesData.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="text-center-dash">
                            No data available
                          </td>
                        </tr>
                      ) : (
                        categoriesData.map((category) => (
                          <tr key={category.id} onClick={(e) => handleTableRowClick(e)}>
                            <td>{category.name}</td>
                            <td>{category.slug}</td>
                            <td>
                              <span className={`badge-dash ${
                                category.is_active ? 'badge-published-dash' : 'badge-archived-dash'
                              }`}>
                                {category.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td>{new Date(category.created_at).toLocaleDateString('en-US')}</td>
                            <td>
                              <div className="table-actions-dash">
                                <button 
                                  className="table-action-dash table-action-view-dash"
                                  onClick={() => handleViewCategory(category)}
                                  title="View Details"
                                >
                                  <i className="fas fa-eye"></i>
                                </button>
                                <button 
                                  className="table-action-dash table-action-edit-dash"
                                  onClick={() => openEditCategoryModal(category)}
                                  title="Edit"
                                >
                                  <i className="fas fa-edit"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                  
                  {/* Pagination */}
                  <div className="pagination-dash">
                    {renderCategoriesPagination()}
                  </div>

                  {/* Pagination Info */}
                  <div className="pagination-info-dash text-center-dash text-muted-dash">
                    Page {categoriesPagination.current_page} of {categoriesPagination.last_page} - {categoriesPagination.total} total categories
                  </div>
                </>
              )}
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
              <h1 className="section-title-dash">Users Management</h1>
              <button className="btn-dash btn-primary-dash" onClick={openAddModal}>
                <i className="fas fa-plus"></i> Add New User
              </button>
            </div>
            
            {/* Users Table */}
            <div className="table-container-dash">
              <div className="table-controls-dash">
                <div className="table-controls-left-dash">
                  <h3>All Users ({pagination.total})</h3>
                  <div className="text-muted-dash">
                    Showing {pagination.from} to {pagination.to} of {pagination.total} entries
                  </div>
                </div>
                <div className="table-controls-right-dash">
                  <div className="d-flex-dash align-center-dash gap-1-dash">
                    <span className="text-muted-dash">Show:</span>
                    <select 
                      className="select-dash" 
                      value={pagination.per_page}
                      onChange={handlePerPageChange}
                    >
                      <option value="5">5</option>
                      <option value="10">10</option>
                      <option value="25">25</option>
                      <option value="50">50</option>
                      <option value="100">100</option>
                    </select>
                    <span className="text-muted-dash">per page</span>
                  </div>
                  <button className="btn-dash btn-outline-dash" onClick={() => fetchAdmins(pagination.current_page, pagination.per_page)}>
                    <i className="fas fa-sync-alt"></i> Refresh
                  </button>
                </div>
              </div>
              
              {/* Loading State */}
              {loading && (
                <div className="loading-dash">
                  <i className="fas fa-spinner fa-spin"></i> Loading data...
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
                        <th>Name</th>
                        <th>Email</th>
                        <th>Created At</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {admins.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="text-center-dash">
                            No data available
                          </td>
                        </tr>
                      ) : (
                        admins.map((admin) => (
                          <tr key={admin.id} onClick={(e) => handleTableRowClick(e)}>
                            <td>{admin.name}</td>
                            <td>{admin.email}</td>
                            <td>{new Date(admin.created_at).toLocaleDateString('en-US')}</td>
                            <td>
                              <div className="table-actions-dash">
                                <button 
                                  className="table-action-dash table-action-view-dash"
                                  onClick={() => handleViewAdmin(admin)}
                                  title="View Details"
                                >
                                  <i className="fas fa-eye"></i>
                                </button>
                                <button 
                                  className="table-action-dash table-action-edit-dash"
                                  onClick={() => openEditModal(admin)}
                                  title="Edit"
                                >
                                  <i className="fas fa-edit"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                  
                  {/* Pagination */}
                  <div className="pagination-dash">
                    {renderPagination()}
                  </div>

                  {/* Pagination Info */}
                  <div className="pagination-info-dash text-center-dash text-muted-dash">
                    Page {pagination.current_page} of {pagination.last_page} - {pagination.total} total users
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
            <button className="btn-dash btn-primary-dash" onClick={handleAddArticle} disabled={articleActionLoading}>
              {articleActionLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Saving...
                </>
              ) : (
                'Save Article'
              )}
            </button>
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
            <button className="btn-dash btn-primary-dash" onClick={handleEditArticle} disabled={articleActionLoading}>
              {articleActionLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Updating...
                </>
              ) : (
                'Update Article'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Add Category Modal */}
      <div className={`modal-dash ${showAddCategoryModal ? 'active-dash' : ''}`}>
        <div className="modal-content-dash" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header-dash">
            <h2 className="modal-title-dash">Add New Category</h2>
            <button className="modal-close-dash" onClick={closeCategoryModals}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className="modal-body-dash">
            <form onSubmit={handleAddCategory}>
              <div className="form-group-dash">
                <label className="form-label-dash">Name</label>
                <input 
                  type="text" 
                  className="form-control-dash" 
                  name="name"
                  value={categoryFormData.name}
                  onChange={handleCategoryFormChange}
                  required
                />
                {categoryFormErrors.name && <div className="error-message-dash">{categoryFormErrors.name[0]}</div>}
              </div>
              
              <div className="form-group-dash">
                <label className="form-label-dash">Slug</label>
                <input 
                  type="text" 
                  className="form-control-dash" 
                  name="slug"
                  value={categoryFormData.slug}
                  onChange={handleCategoryFormChange}
                  required
                  placeholder="URL-friendly version of the name"
                />
                {categoryFormErrors.slug && <div className="error-message-dash">{categoryFormErrors.slug[0]}</div>}
              </div>
              
              <div className="form-group-dash">
                <label className="form-label-dash">Status</label>
                <select 
                  className="form-control-dash" 
                  name="status"
                  value={categoryFormData.status}
                  onChange={handleCategoryFormChange}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                {categoryFormErrors.status && <div className="error-message-dash">{categoryFormErrors.status[0]}</div>}
              </div>
            </form>
          </div>
          <div className="modal-footer-dash">
            <button className="btn-dash btn-outline-dash" onClick={closeCategoryModals}>Cancel</button>
            <button className="btn-dash btn-primary-dash" onClick={handleAddCategory} disabled={categoryActionLoading}>
              {categoryActionLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Saving...
                </>
              ) : (
                'Save Category'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Edit Category Modal */}
      <div className={`modal-dash ${showEditCategoryModal ? 'active-dash' : ''}`}>
        <div className="modal-content-dash" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header-dash">
            <h2 className="modal-title-dash">Edit Category</h2>
            <button className="modal-close-dash" onClick={closeCategoryModals}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className="modal-body-dash">
            <form onSubmit={handleEditCategory}>
              <div className="form-group-dash">
                <label className="form-label-dash">Name</label>
                <input 
                  type="text" 
                  className="form-control-dash" 
                  name="name"
                  value={categoryFormData.name}
                  onChange={handleCategoryFormChange}
                  required
                />
                {categoryFormErrors.name && <div className="error-message-dash">{categoryFormErrors.name[0]}</div>}
              </div>
              
              <div className="form-group-dash">
                <label className="form-label-dash">Slug</label>
                <input 
                  type="text" 
                  className="form-control-dash" 
                  name="slug"
                  value={categoryFormData.slug}
                  onChange={handleCategoryFormChange}
                  required
                  placeholder="URL-friendly version of the name"
                />
                {categoryFormErrors.slug && <div className="error-message-dash">{categoryFormErrors.slug[0]}</div>}
              </div>
              
              <div className="form-group-dash">
                <label className="form-label-dash">Status</label>
                <select 
                  className="form-control-dash" 
                  name="status"
                  value={categoryFormData.status}
                  onChange={handleCategoryFormChange}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                {categoryFormErrors.status && <div className="error-message-dash">{categoryFormErrors.status[0]}</div>}
              </div>
            </form>
          </div>
          <div className="modal-footer-dash">
            <button className="btn-dash btn-outline-dash" onClick={closeCategoryModals}>Cancel</button>
            <button className="btn-dash btn-primary-dash" onClick={handleEditCategory} disabled={categoryActionLoading}>
              {categoryActionLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Updating...
                </>
              ) : (
                'Update Category'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Add Admin Modal */}
      <div className={`modal-dash ${showAddModal ? 'active-dash' : ''}`}>
        <div className="modal-content-dash" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header-dash">
            <h2 className="modal-title-dash">Add New User</h2>
            <button className="modal-close-dash" onClick={closeModals}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className="modal-body-dash">
            <form onSubmit={handleAddAdmin}>
              <div className="form-group-dash">
                <label className="form-label-dash">Name</label>
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
                <label className="form-label-dash">Email</label>
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
                <label className="form-label-dash">Password</label>
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
                <label className="form-label-dash">Confirm Password</label>
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
            <button className="btn-dash btn-outline-dash" onClick={closeModals}>Cancel</button>
            <button className="btn-dash btn-primary-dash" onClick={handleAddAdmin} disabled={actionLoading}>
              {actionLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Saving...
                </>
              ) : (
                'Save'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Edit Admin Modal */}
      <div className={`modal-dash ${showEditModal ? 'active-dash' : ''}`}>
        <div className="modal-content-dash" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header-dash">
            <h2 className="modal-title-dash">Edit User</h2>
            <button className="modal-close-dash" onClick={closeModals}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className="modal-body-dash">
            <form onSubmit={handleEditAdmin}>
              <div className="form-group-dash">
                <label className="form-label-dash">Name</label>
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
                <label className="form-label-dash">Email</label>
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
                <label className="form-label-dash">New Password (Optional)</label>
                <input 
                  type="password" 
                  className="form-control-dash" 
                  name="password"
                  value={formData.password}
                  onChange={handleFormChange}
                  placeholder="Leave empty if you don't want to change"
                />
                {formErrors.password && <div className="error-message-dash">{formErrors.password[0]}</div>}
              </div>
              
              <div className="form-group-dash">
                <label className="form-label-dash">Confirm Password</label>
                <input 
                  type="password" 
                  className="form-control-dash" 
                  name="password_confirmation"
                  value={formData.password_confirmation}
                  onChange={handleFormChange}
                  placeholder="Leave empty if you don't want to change"
                />
              </div>
            </form>
          </div>
          <div className="modal-footer-dash">
            <button className="btn-dash btn-outline-dash" onClick={closeModals}>Cancel</button>
            <button className="btn-dash btn-primary-dash" onClick={handleEditAdmin} disabled={actionLoading}>
              {actionLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Updating...
                </>
              ) : (
                'Update'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;