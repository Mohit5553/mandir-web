import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Heart, Image as ImageIcon, Calendar, Newspaper, Bell, LogOut, FileText, Menu, PanelsTopLeft, Settings2, HandHeart, Video, ShieldCheck, Mail, ChevronLeft, ChevronRight } from 'lucide-react';
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
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminPermissions');
    navigate('/admin/login');
  };

  const user = JSON.parse(localStorage.getItem('adminUser') || '{}');
  const userRole = user.role || '';
  const isSuperAdmin = userRole === 'Super Admin';

  // All menus (name must match what the backend stores in permissions)
  const ALL_MENU_ITEMS = [
    { name: 'Dashboard',          path: '/admin',                  icon: <LayoutDashboard size={20} /> },
    { name: 'Users & Roles',      path: '/admin/users',            icon: <Users size={20} /> },
    { name: 'Trust Management',   path: '/admin/trust-management', icon: <Users size={20} /> },
    { name: 'Donations',          path: '/admin/donations',        icon: <Heart size={20} /> },
    { name: 'Events',             path: '/admin/events',           icon: <Calendar size={20} /> },
    { name: 'News',               path: '/admin/news',             icon: <Newspaper size={20} /> },
    { name: 'Gallery',            path: '/admin/gallery',          icon: <ImageIcon size={20} /> },
    { name: 'Home Carousel',      path: '/admin/carousel',         icon: <PanelsTopLeft size={20} /> },
    { name: 'Homepage Content',   path: '/admin/site-content',     icon: <Settings2 size={20} /> },
    { name: 'Volunteer Requests', path: '/admin/volunteers',       icon: <HandHeart size={20} /> },
    { name: 'Live Stream',        path: '/admin/live',             icon: <Video size={20} /> },
    { name: 'Notifications',      path: '/admin/notifications',    icon: <Bell size={20} /> },
    { name: 'Contact Messages',   path: '/admin/contact',          icon: <Mail size={20} /> },
    { name: 'Reports',            path: '/admin/reports',          icon: <FileText size={20} /> },
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
      <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="admin-logo">
          <img src={logo} alt="Logo" style={{ height: isCollapsed ? '42px' : '70px', width: isCollapsed ? '42px' : '70px', borderRadius: '50%', objectFit: 'cover', transition: 'width 0.3s, height 0.3s' }} />
          {!isCollapsed && <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-primary)', textAlign: 'center', letterSpacing: '0.5px', lineHeight: 1.3 }}>MANDIR TRUST</div>}
        </div>
        <nav className="admin-nav">
          {filteredMenu.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`admin-nav-item ${(location.pathname === item.path || (item.path === '/admin/users' && location.pathname === '/admin/roles')) ? 'active' : ''}`}
              onClick={() => setIsSidebarOpen(false)}
            >
              {item.icon} <span className="nav-item-label">{item.name}</span>
            </Link>
          ))}
        </nav>
        <div className="admin-nav-bottom">
          <button 
            type="button"
            onClick={toggleCollapse} 
            className="admin-nav-item collapse-btn"
            style={{ border: 'none', background: 'none', cursor: 'pointer', width: '100%', marginBottom: '0.5rem' }}
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            <span className="nav-item-label">Collapse Menu</span>
          </button>
          <button className="admin-nav-item" style={{ color: '#b91c1c', border: 'none', background: 'none', cursor: 'pointer', width: '100%' }} onClick={handleLogout}>
            <LogOut size={20} /> <span className="nav-item-label">Logout</span>
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-header glass">
          <div className="admin-header-left">
            <button
              className="admin-menu-btn"
              type="button"
              aria-label="Open admin navigation"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={22} />
            </button>
            <h2 style={{ fontSize: '1.25rem' }}>Admin Portal</h2>
          </div>
          <div className="admin-profile">
            <div style={{ textAlign: 'right', marginRight: '1rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{user.name || 'User'}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 600 }}>Role: {user.role || 'Super Admin'}</div>
            </div>
            <div className="admin-avatar">{user.name ? user.name[0].toUpperCase() : 'U'}</div>
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
