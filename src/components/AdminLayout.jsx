import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Heart, Image as ImageIcon, Calendar, Newspaper, Bell, LogOut, FileText, Menu, PanelsTopLeft, Settings2, HandHeart, Video, ShieldCheck, Mail, ChevronLeft, ChevronRight, ScrollText, Globe } from 'lucide-react';
import { api } from '../services/api';
import logo from '../assets/logo.png';
import './Admin.css';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => localStorage.getItem('adminSidebarCollapsed') === 'true');
  const [showProfileMenu, setShowProfileMenu] = useState(false);

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
      api.logout(refreshToken).catch(() => { });
    }
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminPermissions');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminRefreshToken');
    navigate('/admin/login');
  };

  const rawUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
  if (rawUser.name === 'Main Super Admin' || rawUser.name === 'Super Admin' || !rawUser.name) {
    rawUser.name = 'मुख्य मंदिर प्रशासक';
    localStorage.setItem('adminUser', JSON.stringify(rawUser));
  }
  const user = rawUser;
  const userRole = user.role || '';
  const isSuperAdmin = userRole === 'Super Admin' || userRole === 'Chief Trustee';

  // All menus grouped with section headers
  const ALL_MENU_ITEMS = [
    { section: 'मुख्य' },
    { name: 'डैशबोर्ड', apiKey: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={19} /> },
    { name: 'दान प्रबंधन', apiKey: 'Donations', path: '/admin/donations', icon: <Heart size={19} /> },
    { name: 'रिपोर्ट्स', apiKey: 'Reports', path: '/admin/reports', icon: <FileText size={19} /> },

    { section: 'प्रबंधन' },
    { name: 'उपयोगकर्ता एवं भूमिकाएं', apiKey: 'Users', path: '/admin/users', icon: <Users size={19} /> },
    { name: 'ट्रस्ट प्रबंधन', apiKey: 'Trust Management', path: '/admin/trust-management', icon: <Users size={19} /> },
    { name: 'स्वयंसेवक अनुरोध', apiKey: 'Volunteers', path: '/admin/volunteers', icon: <HandHeart size={19} /> },
    { name: 'संपर्क संदेश', apiKey: 'Contact', path: '/admin/contact', icon: <Mail size={19} /> },

    { section: 'सामग्री एवं मीडिया' },
    { name: 'घटनाएँ', apiKey: 'Events', path: '/admin/events', icon: <Calendar size={19} /> },
    { name: 'समाचार', apiKey: 'News', path: '/admin/news', icon: <Newspaper size={19} /> },
    { name: 'गैलरी', apiKey: 'Gallery', path: '/admin/gallery', icon: <ImageIcon size={19} /> },
    { name: 'होमपेज बैनर', apiKey: 'Carousel', path: '/admin/carousel', icon: <PanelsTopLeft size={19} /> },
    { name: 'वेबसाइट सामग्री', apiKey: 'Site Content', path: '/admin/site-content', icon: <Settings2 size={19} /> },
    { name: 'लाइव स्ट्रीम', apiKey: 'Live Stream', path: '/admin/live', icon: <Video size={19} /> },
    { name: 'सूचनाएँ', apiKey: 'Notifications', path: '/admin/notifications', icon: <Bell size={19} /> },

    { section: 'सिस्टम एवं ऑडिट' },
    { name: 'ऑडिट लॉग्स', apiKey: 'Audit Logs', path: '/admin/audit-logs', icon: <ScrollText size={19} /> },
  ];

  // Get permissions from localStorage (set on login)
  const permissions = (() => {
    try { return JSON.parse(localStorage.getItem('adminPermissions') || '[]'); } catch { return []; }
  })();

  const canViewMenu = (item) => {
    if (isSuperAdmin) return true;
    const apiKey = item.apiKey || item.name;
    if (apiKey === 'Users' || apiKey === 'Users & Roles') {
      const pUsers = permissions.find(x => x.menu === 'Users');
      const pRoles = permissions.find(x => x.menu === 'Roles');
      return (pUsers && pUsers.view) || (pRoles && pRoles.view);
    }
    const p = permissions.find(x => x.menu === apiKey || x.menu === item.name);
    return p ? p.view : false;
  };

  const filteredMenu = ALL_MENU_ITEMS.filter(item => {
    if (item.section) return true;
    if (item.superAdminOnly) return isSuperAdmin;
    return canViewMenu(item);
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
      currentAllowed = canViewMenu(currentMenu) || (currentMenu.superAdminOnly && isSuperAdmin);
    }
  }

  return (
    <div className={`admin-layout ${isCollapsed ? 'collapsed' : ''}`}>
      <button
        className={`admin-sidebar-backdrop ${isSidebarOpen ? 'show' : ''}`}
        type="button"
        aria-label="नेविगेशन बंद करें"
        onClick={() => setIsSidebarOpen(false)}
      />
      <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`} style={{ overflow: 'visible' }}>
        {/* Professional Outer Border Toggle Button */}
        <button
          type="button"
          onClick={toggleCollapse}
          className="sidebar-edge-toggle hide-mobile"
          title={isCollapsed ? "विस्तार करें" : "छोटा करें"}
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        <div className="admin-logo">
          <img src={logo} alt="लोगो" style={{ height: isCollapsed ? '36px' : '38px', width: isCollapsed ? '36px' : '38px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0, transition: 'all 0.3s' }} />
          {!isCollapsed && (
            <div style={{ lineHeight: 1.25 }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 900, background: 'linear-gradient(135deg, #FF6000 0%, #ea580c 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.2px' }}>
                श्री मन्वत बाबा
              </div>
              <div style={{ fontSize: '0.68rem', color: '#475569', fontWeight: 800, letterSpacing: '0.2px' }}>
                महाशिव मंदिर ट्रस्ट
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
            <LogOut size={19} /> <span className="nav-item-label">लॉग आउट</span>
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-header glass" style={{ borderRadius: 0, padding: '0.6rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="admin-header-left" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              className="admin-menu-btn"
              type="button"
              aria-label="प्रशासन नेविगेशन खोलें"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={19} color="#ea580c" />
            </button>

            <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--color-primary)', background: 'var(--color-primary-alpha)', padding: '0.15rem 0.45rem', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                प्रशासन
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
                  ) : 'डैशबोर्ड';
                })()}
              </h2>
            </div>
          </div>

          {/* Centered Mandir Brand Badge (Visible on Mobile) */}
          <div className="mobile-header-brand" style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <img src={logo} alt="मंदिर लोगो" style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #FF6000' }} />
            <span style={{ fontWeight: 900, fontSize: '0.9rem', color: '#0f172a', letterSpacing: '-0.2px' }}>
              श्री मन्वत बाबा
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', position: 'relative' }}>
            <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.2rem 0.6rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 600, color: '#475569' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' }}></span>
              <span>ऑनलाइन</span>
            </div>

            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              title="मुख्य वेबसाइट खोलें"
              style={{
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                padding: '0.35rem 0.65rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#ea580c',
                border: '1px solid #fed7aa',
                background: '#fff7ed',
                boxShadow: '0 2px 6px rgba(234,88,12,0.1)',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap'
              }}
            >
              <Globe size={14} color="#ea580c" />
              <span className="hide-mobile">वेबसाइट</span>
            </a>

            {/* Clickable Profile Badge with Dropdown State */}
            <div
              className="admin-profile"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: showProfileMenu ? '#fff7ed' : '#fff',
                border: showProfileMenu ? '1px solid #fed7aa' : '1px solid #e2e8f0',
                padding: '0.15rem 0.25rem 0.15rem 0.6rem',
                borderRadius: '9999px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.02)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#1e293b', lineHeight: 1.1 }}>{user.name || 'प्रशासक'}</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--color-primary)', fontWeight: 700 }}>{user.role === 'Super Admin' ? 'मुख्य मंदिर प्रशासक' : user.role || 'मंदिर प्रशासक'}</div>
              </div>
              <div className="admin-avatar" style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #FF6B00, #FF8533)', color: 'white', fontWeight: 800, fontSize: '0.78rem', boxShadow: '0 2px 6px rgba(255,107,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {user.name ? user.name[0].toUpperCase() : 'म'}
              </div>
            </div>

            {/* Interactive Admin Profile Dropdown Menu */}
            {showProfileMenu && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '260px',
                background: '#ffffff',
                borderRadius: '14px',
                boxShadow: '0 12px 36px rgba(0, 0, 0, 0.12)',
                border: '1px solid #e2e8f0',
                padding: '1rem',
                zIndex: 1000,
                animation: 'fadeIn 0.15s ease-in-out'
              }}>
                {/* User Summary Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingBottom: '0.85rem', borderBottom: '1px solid #f1f5f9', marginBottom: '0.75rem' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'linear-gradient(135deg, #FF6B00 0%, #ea580c 100%)', color: 'white', fontWeight: 800, fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(255, 107, 0, 0.3)' }}>
                    {user.name ? user.name[0].toUpperCase() : 'म'}
                  </div>
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {user.name || 'प्रशासक'}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {user.email || 'mahashivmandirtrusts@gmail.com'}
                    </div>
                    <span style={{ display: 'inline-block', marginTop: '0.2rem', fontSize: '0.65rem', fontWeight: 700, color: '#ea580c', background: '#fff7ed', padding: '0.1rem 0.45rem', borderRadius: '4px', border: '1px solid #fed7aa' }}>
                      {user.role === 'Super Admin' ? 'मुख्य मंदिर प्रशासक' : user.role || 'मंदिर प्रशासक'}
                    </span>
                  </div>
                </div>

                {/* Quick Navigation Links */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '0.75rem' }}>
                  <Link
                    to="/admin/users"
                    onClick={() => setShowProfileMenu(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.55rem 0.75rem', borderRadius: '8px', color: '#334155', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600, background: '#f8fafc', transition: 'all 0.2s' }}
                  >
                    <Users size={16} color="#ea580c" />
                    <span>उपयोगकर्ता एवं भूमिकाएं</span>
                  </Link>

                  <Link
                    to="/admin/audit-logs"
                    onClick={() => setShowProfileMenu(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.55rem 0.75rem', borderRadius: '8px', color: '#334155', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600, background: '#f8fafc', transition: 'all 0.2s' }}
                  >
                    <ScrollText size={16} color="#2563eb" />
                    <span>सुरक्षा ऑडिट लॉग्स</span>
                  </Link>

                  <a
                    href="/"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setShowProfileMenu(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.55rem 0.75rem', borderRadius: '8px', color: '#334155', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600, background: '#f8fafc', transition: 'all 0.2s' }}
                  >
                    <Globe size={16} color="#059669" />
                    <span>मुख्य वेबसाइट देखें</span>
                  </a>
                </div>

                {/* Logout Button */}
                <button
                  onClick={() => { setShowProfileMenu(false); handleLogout(); }}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', background: '#fef2f2', border: '1px solid #fee2e2', color: '#dc2626', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem' }}
                >
                  <LogOut size={15} />
                  <span>खाता लॉग आउट करें</span>
                </button>
              </div>
            )}
          </div>
        </header>

        <div className="admin-content">
          {currentAllowed ? (
            <Outlet />
          ) : (
            <div className="content-card" style={{ textAlign: 'center', padding: '4rem', maxWidth: '500px', margin: '4rem auto' }}>
              <ShieldCheck size={52} color="#fca5a5" style={{ marginBottom: '1rem' }} />
              <h2 style={{ color: '#ef4444', marginBottom: '1rem' }}>अनुमति अस्वीकृत (Access Denied)</h2>
              <p style={{ color: '#64748b', marginBottom: '2rem' }}>आपके पास इस मॉड्यूल को देखने की अनुमति नहीं है। कृपया मुख्य प्रशासक से अनुमति का अनुरोध करें।</p>
              <button className="btn btn-primary" onClick={() => navigate('/admin')}>डैशबोर्ड पर जाएं</button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
