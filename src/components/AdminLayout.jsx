import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Heart, Image as ImageIcon, Calendar, Newspaper, Bell, LogOut, FileText } from 'lucide-react';
import './Admin.css';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  const user = JSON.parse(localStorage.getItem('adminUser') || '{}');

  const menu = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
    { name: 'Users', path: '/admin/users', icon: <Users size={20} /> },
    { name: 'Donations', path: '/admin/donations', icon: <Heart size={20} /> },
    { name: 'Events', path: '/admin/events', icon: <Calendar size={20} /> },
    { name: 'News', path: '/admin/news', icon: <Newspaper size={20} /> },
    { name: 'Gallery', path: '/admin/gallery', icon: <ImageIcon size={20} /> },
    { name: 'Notifications', path: '/admin/notifications', icon: <Bell size={20} /> },
    { name: 'Reports', path: '/admin/reports', icon: <FileText size={20} /> }
  ];

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar" style={{ width: '280px' }}>
        <div className="admin-logo">
          <img src="/src/assets/trust_logo.png" alt="Logo" style={{ height: '32px', width: '32px', borderRadius: '50%', marginRight: '10px' }} onError={(e) => e.target.style.display = 'none'} />
          SMT Dashboard
        </div>
        <nav className="admin-nav">
          {menu.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`admin-nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              {item.icon} {item.name}
            </Link>
          ))}
        </nav>
        <div className="admin-nav-bottom">
          <button className="admin-nav-item" style={{ color: '#b91c1c', border: 'none', background: 'none', cursor: 'pointer', width: '100%', justifyContent: 'flex-start' }} onClick={handleLogout}>
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-header glass">
          <div>
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
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
