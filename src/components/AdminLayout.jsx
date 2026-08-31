import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Heart, Image as ImageIcon, Calendar, Newspaper, Bell, LogOut, FileText, Menu, PanelsTopLeft, Settings2, HandHeart, Video, ShieldCheck, Mail, ChevronLeft, ChevronRight, ScrollText, Globe } from 'lucide-react';
import { api } from '../services/api';
import logo from '../assets/logo.png';
import './Admin.css';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => localStorage.getItem('adminSidebarCollapsed') === 'true');

  const toggleCollapse = () => {
    const nextVal = !isCollapsed;
    setIsCollapsed(nextVal);
    localStorage.setItem('adminSidebarCollapsed', String(nextVal));
  };
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    const refreshToken = localStorage.getItem('adminRefreshToken');
    if (refreshToken) {
      api.logout(refreshToken).catch(() => {});
    }
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminPermissions');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminRefreshToken');
    navigate('/admin/login');
  };

  const user = JSON.parse(localStorage.getItem('adminUser') || '{}');
  const userRole = user.role || '';
  const isSuperAdmin = userRole === 'Super Admin';

  // All menus grouped with section headers
  const ALL_MENU_ITEMS = [
    { section: 'MAIN' },
    { name: 'Dashboard',          path: '/admin',                  icon: <LayoutDashboard size={19} /> },
    { name: 'Donations',          path: '/admin/donations',        icon: <Heart size={19} /> },
    { name: 'Reports',            path: '/admin/reports',          icon: <FileText size={19} /> },

    { section: 'MANAGEMENT' },
    { name: 'Users & Roles',      path: '/admin/users',            icon: <Users size={19} /> },
    { name: 'Trust Management',   path: '/admin/trust-management', icon: <Users size={19} /> },
    { name: 'Volunteer Requests', path: '/admin/volunteers',       icon: <HandHeart size={19} /> },
    { name: 'Contact Messages',   path: '/admin/contact',          icon: <Mail size={19} /> },

    { section: 'CONTENT & MEDIA' },
    { name: 'Events',             path: '/admin/events',           icon: <Calendar size={19} /> },
    { name: 'News',               path: '/admin/news',             icon: <Newspaper size={19} /> },
    { name: 'Gallery',            path: '/admin/gallery',          icon: <ImageIcon size={19} /> },
    { name: 'Home Carousel',      path: '/admin/carousel',         icon: <PanelsTopLeft size={19} /> },
    { name: 'Homepage Content',   path: '/admin/site-content',     icon: <Settings2 size={19} /> },
    { name: 'Live Stream',        path: '/admin/live',             icon: <Video size={19} /> },
    { name: 'Notifications',      path: '/admin/notifications',    icon: <Bell size={19} /> },

    { section: 'SYSTEM & AUDIT' },
    { name: 'Audit Logs',         path: '/admin/audit-logs',       icon: <ScrollText size={19} /> },
  ];

  // Get permissions from localStorage (set on login)
  const permissions = (() => {
    try { return JSON.parse(localStorage.getItem('adminPermissions') || '[]'); } catch { return []; }
  })();

  const canViewMenu = (menuName) => {
    if (isSuperAdmin) return true;
    if (menuName === 'Users & Roles') {
      const pUsers = permissions.find(x => x.menu === 'Users');
      const pRoles = permissions.find(x => x.menu === 'Roles');
      return (pUsers && pUsers.view) || (pRoles && pRoles.view);
    }
    const p = permissions.find(x => x.menu === menuName);
    return p ? p.view : false;
  };

  const filteredMenu = ALL_MENU_ITEMS.filter(item => {
    if (item.section) return true;
    if (item.superAdminOnly) return isSuperAdmin;
    return canViewMenu(item.name);
  });

  // Route guard: is the current path accessible?
  const cleanPath = location.pathname.replace(/\/$/, '');
  let currentAllowed = true;

  if (cleanPath === '/admin/users' || cleanPath === '/admin/roles') {
    currentAllowed = isSuperAdmin || (() => {
      const pUsers = permissions.find(x => x.menu === 'Users');
      const pRoles = permissions.find(x => x.menu === 'Roles');
      return (pUsers && pUsers.view) || (pRoles && pRoles.view);
    })();
  } else {
    const currentMenu = ALL_MENU_ITEMS.find(item => item.path === cleanPath);
    if (currentMenu) {
      currentAllowed = canViewMenu(currentMenu.name) || (currentMenu.superAdminOnly && isSuperAdmin);
    }
  }

  return (
    <div className={`admin-layout ${isCollapsed ? 'collapsed' : ''}`}>
      <button
        className={`admin-sidebar-backdrop ${isSidebarOpen ? 'show' : ''}`}
        type="button"
        aria-label="Close admin navigation"
        onClick={() => setIsSidebarOpen(false)}
      />
      <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`} style={{ overflow: 'visible' }}>
        {/* Professional Outer Border Toggle Button */}
        <button 
          type="button"
          onClick={toggleCollapse} 
          className="sidebar-edge-toggle hide-mobile"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        <div className="admin-logo">
          <img src={logo} alt="Logo" style={{ height: isCollapsed ? '36px' : '38px', width: isCollapsed ? '36px' : '38px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0, transition: 'all 0.3s' }} />
          {!isCollapsed && (
            <div style={{ lineHeight: 1.2 }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, background: 'linear-gradient(135deg, #FF6B00, #FF8533)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '0.5px' }}>
                MANDIR TRUST
              </div>
              <div style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                ADMIN CONTROL
              </div>
            </div>
          )}
        </div>
        <nav className="admin-nav">
          {filteredMenu.map((item, index) => {
            if (item.section) {
              return (
                <div key={`sec-${index}`} className="admin-nav-section-title">
                  {item.section}
                </div>
              );
            }
            const isActive = location.pathname === item.path || (item.path === '/admin/users' && location.pathname === '/admin/roles');
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`admin-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setIsSidebarOpen(false)}
              >
                {item.icon} <span className="nav-item-label">{item.name}</span>
              </Link>
            );
          })}
        </nav>
        <div className="admin-nav-bottom">
          <button className="admin-nav-item" style={{ color: '#b91c1c', border: 'none', background: 'none', cursor: 'pointer', width: '100%' }} onClick={handleLogout}>
            <LogOut size={19} /> <span className="nav-item-label">Logout</span>
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-header glass" style={{ borderRadius: 0 }}>
          <div className="admin-header-left">
            <button
              className="admin-menu-btn"
              type="button"
              aria-label="Open admin navigation"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--color-primary)', background: 'var(--color-primary-alpha)', padding: '0.15rem 0.45rem', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                ADMIN
              </span>
              <span style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>/</span>
              <h2 style={{ fontSize: '0.92rem', fontWeight: 700, margin: 0, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                {(() => {
                  const active = ALL_MENU_ITEMS.find(item => item.path === cleanPath);
                  return active ? (
                    <>
                      <span style={{ color: 'var(--color-primary)', display: 'inline-flex' }}>{active.icon}</span>
                      {active.name}
                    </>
                  ) : 'Dashboard';
                })()}
              </h2>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.2rem 0.6rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 600, color: '#475569' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' }}></span>
              <span>Online</span>
            </div>

            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              title="Open Public Website"
              style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.25rem 0.65rem', borderRadius: '6px', fontSize: '0.76rem', fontWeight: 600, color: 'var(--color-primary)', border: '1px solid rgba(255,107,0,0.25)', background: 'rgba(255,107,0,0.06)', transition: 'all 0.2s' }}
            >
              <Globe size={14} /> <span className="hide-mobile">Website</span>
            </a>

            <div className="admin-profile" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fff', border: '1px solid #e2e8f0', padding: '0.15rem 0.25rem 0.15rem 0.6rem', borderRadius: '9999px', boxShadow: '0 1px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#1e293b', lineHeight: 1.1 }}>{user.name || 'User'}</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--color-primary)', fontWeight: 700 }}>{user.role || 'Super Admin'}</div>
              </div>
              <div className="admin-avatar" style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #FF6B00, #FF8533)', color: 'white', fontWeight: 800, fontSize: '0.78rem', boxShadow: '0 2px 6px rgba(255,107,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {user.name ? user.name[0].toUpperCase() : 'U'}
              </div>
            </div>
          </div>
        </header>

        <div className="admin-content">
          {currentAllowed ? (
            <Outlet />
          ) : (
            <div className="content-card" style={{ textAlign: 'center', padding: '4rem', maxWidth: '500px', margin: '4rem auto' }}>
              <ShieldCheck size={52} color="#fca5a5" style={{ marginBottom: '1rem' }} />
              <h2 style={{ color: '#ef4444', marginBottom: '1rem' }}>Access Denied</h2>
              <p style={{ color: '#64748b', marginBottom: '2rem' }}>You do not have permission to access this module. Contact your Super Admin to request access.</p>
              <button className="btn btn-primary" onClick={() => navigate('/admin')}>Go to Dashboard</button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
