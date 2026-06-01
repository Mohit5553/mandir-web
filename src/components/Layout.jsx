import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Heart, MapPin, Phone, Menu, X, LogIn, LayoutDashboard } from 'lucide-react';
import './Layout.css';

const Layout = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const adminUser = JSON.parse(localStorage.getItem('adminUser') || 'null');

  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    navigate('/');
  };

  return (
    <div className="layout">
      <header className="header glass">
        <div className="container header-content">
          <Link to="/" className="logo">
            <img src="/src/assets/trust_logo.png" alt="Trust Logo" style={{ height: '50px', width: '50px', borderRadius: '50%', objectFit: 'cover' }} onError={(e) => e.target.style.display = 'none'} />
            <span className="logo-text">Manvat Baba Mandir Trust</span>
          </Link>
          
          <nav className={`nav ${isMenuOpen ? 'nav-open' : ''}`}>
            <Link to="/" className={isActive('/')} onClick={() => setIsMenuOpen(false)}>Home</Link>
            <Link to="/about" className={isActive('/about')} onClick={() => setIsMenuOpen(false)}>About Us</Link>
            <Link to="/news" className={isActive('/news')} onClick={() => setIsMenuOpen(false)}>News</Link>
            <Link to="/events" className={isActive('/events')} onClick={() => setIsMenuOpen(false)}>Events</Link>
            <Link to="/gallery" className={isActive('/gallery')} onClick={() => setIsMenuOpen(false)}>Gallery</Link>
            <Link to="/contact" className={isActive('/contact')} onClick={() => setIsMenuOpen(false)}>Contact</Link>
            <Link to="/donate" className="btn btn-primary" onClick={() => setIsMenuOpen(false)}>
              <Heart size={18} /> Donate Now
            </Link>
            {adminUser ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderLeft: '1px solid var(--border-color)', paddingLeft: '1rem' }}>
                <Link to="/admin" className="btn" style={{ background: 'var(--color-primary-alpha)', color: 'var(--color-primary)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem' }} onClick={() => setIsMenuOpen(false)}>
                  <LayoutDashboard size={16} /> Dashboard
                </Link>
                <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} style={{ background: 'transparent', color: 'var(--color-text-light)', border: '1px solid var(--border-color)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)', fontWeight: 500, fontSize: '0.9rem', cursor: 'pointer' }}>
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/admin/login" className="btn" style={{ background: 'var(--color-primary-alpha)', color: 'var(--color-primary)', padding: '0.6rem 1.2rem', borderRadius: 'var(--radius-full)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', border: '1px solid rgba(255,107,0,0.2)' }} onClick={() => setIsMenuOpen(false)}>
                <LogIn size={16} /> Admin Login
              </Link>
            )}
          </nav>
          
          <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>
      
      <main className="main-content">
        <Outlet />
      </main>
      
      <footer className="footer bg-primary text-inverse">
        <div className="container footer-content">
          <div className="footer-col">
            <h3>Shree Manvat Baba Mahashiv Mandir Trust</h3>
            <p style={{opacity: 0.9}}>बैरमपुर, करनैलगंज - गोण्डा (उत्तर प्रदेश)</p>
          </div>
          <div className="footer-col">
            <h3>Quick Links</h3>
            <ul>
              <li><Link to="/events">Upcoming Events</Link></li>
              <li><Link to="/donate">Make a Donation</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h3>Contact Info</h3>
            <p><MapPin size={16}/> 123 Temple Road, Holy City</p>
            <p><Phone size={16}/> +91 9876543210</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 Shree Mandir Trust. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
