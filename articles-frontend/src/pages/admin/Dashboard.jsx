import React, { useState, useEffect } from 'react';
import './dashboard.css';

const Dashboard = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarActive, setMobileSidebarActive] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [activeModal, setActiveModal] = useState(null);

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
                <button className="btn-dash btn-primary-dash">
                  <i className="fas fa-plus"></i> Add Content
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
                <div className="stat-card-value-dash">142</div>
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
                <div className="stat-card-value-dash">118</div>
                <div className="stat-card-change-dash stat-card-change-positive-dash">
                  <i className="fas fa-arrow-up"></i> 8% from last month
                </div>
              </div>
              <div className="stat-card-dash">
                <div className="stat-card-header-dash">
                  <div className="stat-card-title-dash">Pending Comments</div>
                  <div className="stat-card-icon-dash stat-card-icon-orange-dash">
                    <i className="fas fa-comments"></i>
                  </div>
                </div>
                <div className="stat-card-value-dash">24</div>
                <div className="stat-card-change-dash stat-card-change-negative-dash">
                  <i className="fas fa-arrow-down"></i> 5% from last month
                </div>
              </div>
              <div className="stat-card-dash">
                <div className="stat-card-header-dash">
                  <div className="stat-card-title-dash">New Messages</div>
                  <div className="stat-card-icon-dash stat-card-icon-red-dash">
                    <i className="fas fa-envelope"></i>
                  </div>
                </div>
                <div className="stat-card-value-dash">16</div>
                <div className="stat-card-change-dash stat-card-change-positive-dash">
                  <i className="fas fa-arrow-up"></i> 3% from last month
                </div>
              </div>
            </div>

            {/* Recent Articles Table */}
            <div className="table-container-dash">
              <div className="table-controls-dash">
                <div className="table-controls-left-dash">
                  <h3>Recent Articles</h3>
                </div>
                <div className="table-controls-right-dash">
                  <select className="select-dash">
                    <option>All Categories</option>
                    <option>Technology</option>
                    <option>Business</option>
                    <option>Health</option>
                  </select>
                  <button className="btn-dash btn-outline-dash">
                    <i className="fas fa-filter"></i> Filter
                  </button>
                </div>
              </div>
              <table className="table-dash">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Author</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr onClick={handleTableRowClick}>
                    <td>#142</td>
                    <td>The Future of Artificial Intelligence</td>
                    <td>Technology</td>
                    <td><span className="badge-dash badge-published-dash">Published</span></td>
                    <td>John Doe</td>
                    <td>May 15, 2023</td>
                    <td>
                      <div className="table-actions-dash">
                        <button className="table-action-dash table-action-view-dash">
                          <i className="fas fa-eye"></i>
                        </button>
                        <button className="table-action-dash table-action-edit-dash">
                          <i className="fas fa-edit"></i>
                        </button>
                        <button className="table-action-dash table-action-delete-dash">
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr onClick={handleTableRowClick}>
                    <td>#141</td>
                    <td>Sustainable Business Practices</td>
                    <td>Business</td>
                    <td><span className="badge-dash badge-published-dash">Published</span></td>
                    <td>Jane Smith</td>
                    <td>May 12, 2023</td>
                    <td>
                      <div className="table-actions-dash">
                        <button className="table-action-dash table-action-view-dash">
                          <i className="fas fa-eye"></i>
                        </button>
                        <button className="table-action-dash table-action-edit-dash">
                          <i className="fas fa-edit"></i>
                        </button>
                        <button className="table-action-dash table-action-delete-dash">
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr onClick={handleTableRowClick}>
                    <td>#140</td>
                    <td>Mental Health in the Workplace</td>
                    <td>Health</td>
                    <td><span className="badge-dash badge-draft-dash">Draft</span></td>
                    <td>Robert Johnson</td>
                    <td>May 10, 2023</td>
                    <td>
                      <div className="table-actions-dash">
                        <button className="table-action-dash table-action-view-dash">
                          <i className="fas fa-eye"></i>
                        </button>
                        <button className="table-action-dash table-action-edit-dash">
                          <i className="fas fa-edit"></i>
                        </button>
                        <button className="table-action-dash table-action-delete-dash">
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr onClick={handleTableRowClick}>
                    <td>#139</td>
                    <td>Web Development Trends 2023</td>
                    <td>Technology</td>
                    <td><span className="badge-dash badge-published-dash">Published</span></td>
                    <td>Sarah Williams</td>
                    <td>May 8, 2023</td>
                    <td>
                      <div className="table-actions-dash">
                        <button className="table-action-dash table-action-view-dash">
                          <i className="fas fa-eye"></i>
                        </button>
                        <button className="table-action-dash table-action-edit-dash">
                          <i className="fas fa-edit"></i>
                        </button>
                        <button className="table-action-dash table-action-delete-dash">
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr onClick={handleTableRowClick}>
                    <td>#138</td>
                    <td>Remote Work Best Practices</td>
                    <td>Business</td>
                    <td><span className="badge-dash badge-draft-dash">Draft</span></td>
                    <td>Michael Brown</td>
                    <td>May 5, 2023</td>
                    <td>
                      <div className="table-actions-dash">
                        <button className="table-action-dash table-action-view-dash">
                          <i className="fas fa-eye"></i>
                        </button>
                        <button className="table-action-dash table-action-edit-dash">
                          <i className="fas fa-edit"></i>
                        </button>
                        <button className="table-action-dash table-action-delete-dash">
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
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
            </div>
          </section>

          {/* Articles Section */}
          <section className={`section-dash ${activeSection === 'articles' ? 'active-dash' : ''}`} id="articles">
            <div className="section-header-dash">
              <h1 className="section-title-dash">Articles Management</h1>
              <button className="btn-dash btn-primary-dash" onClick={() => openModal('addArticle')}>
                <i className="fas fa-plus"></i> Add New Article
              </button>
            </div>
            <div className="text-center-dash mt-2-dash">
              <p className="text-muted-dash">Articles management section - content would be loaded here</p>
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
              <h1 className="section-title-dash">User Management</h1>
              <button className="btn-dash btn-primary-dash">
                <i className="fas fa-plus"></i> Add New User
              </button>
            </div>
            <div className="text-center-dash mt-2-dash">
              <p className="text-muted-dash">User management section - content would be loaded here</p>
            </div>
          </section>

          {/* Settings Section */}
          <section className={`section-dash ${activeSection === 'settings' ? 'active-dash' : ''}`} id="settings">
            <div className="section-header-dash">
              <h1 className="section-title-dash">Settings</h1>
            </div>
            <div className="text-center-dash mt-2-dash">
              <p className="text-muted-dash">Settings section - content would be loaded here</p>
            </div>
          </section>
        </main>
      </div>

      {/* Add Article Modal */}
      <div className={`modal-dash ${activeModal === 'addArticle' ? 'active-dash' : ''}`} id="addArticleModal">
        <div className="modal-content-dash" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header-dash">
            <h2 className="modal-title-dash">Add New Article</h2>
            <button className="modal-close-dash" onClick={closeModal}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className="modal-body-dash">
            <form id="articleForm">
              <div className="form-group-dash">
                <label className="form-label-dash" htmlFor="articleTitle">Title</label>
                <input type="text" className="form-control-dash" id="articleTitle" placeholder="Enter article title" />
              </div>
              <div className="form-group-dash">
                <label className="form-label-dash" htmlFor="articleCategory">Category</label>
                <select className="form-control-dash" id="articleCategory">
                  <option value="">Select a category</option>
                  <option value="technology">Technology</option>
                  <option value="business">Business</option>
                  <option value="health">Health</option>
                  <option value="lifestyle">Lifestyle</option>
                </select>
              </div>
              <div className="form-group-dash">
                <label className="form-label-dash" htmlFor="articleContent">Content</label>
                <textarea className="form-control-dash" id="articleContent" placeholder="Enter article content"></textarea>
              </div>
              <div className="form-group-dash">
                <label className="form-label-dash" htmlFor="articleStatus">Status</label>
                <select className="form-control-dash" id="articleStatus">
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </form>
          </div>
          <div className="modal-footer-dash">
            <button className="btn-dash btn-outline-dash" onClick={closeModal}>Cancel</button>
            <button className="btn-dash btn-primary-dash">Save Article</button>
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
    </div>
  );
};

export default Dashboard;