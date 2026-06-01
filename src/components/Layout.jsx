import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Heart, MapPin, Phone, Menu, X, LogIn, LayoutDashboard } from 'lucide-react';
import logo from '../assets/logo.png';
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
          <Link to="/" className="logo" style={{ display: 'flex', alignItems: 'center' }}>
            <img src={logo} alt="Trust Logo" style={{ height: '70px', width: '70px', borderRadius: '50%', objectFit: 'cover', filter: 'drop-shadow(0 2px 8px rgba(255,107,0,0.2))' }} />
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <img src={logo} alt="Trust Logo" style={{ height: '60px', width: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.2)' }} />
              <h3 style={{ margin: 0 }}>Shree Manvat Baba Mahashiv Mandir Trust</h3>
            </div>
            <p style={{opacity: 0.9}}>बैरमपुर, करनैलगंज - गोण्डा (उत्तर प्रदेश)</p>
          </div>
          <div className="footer-col">
            <h3>Quick Links</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '0.75rem' }}><Link to="/events" className="hover-link">Upcoming Events</Link></li>
              <li style={{ marginBottom: '0.75rem' }}><Link to="/donate" className="hover-link">Make a Donation</Link></li>
              <li style={{ marginBottom: '0.75rem' }}><Link to="/contact" className="hover-link">Contact Us</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h3>Contact Info</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: 0, opacity: 0.9 }}>
                <MapPin size={18} color="var(--color-primary)"/> Bairampur, Colonelganj, Gonda (U.P.)
              </p>
              <p style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: 0, opacity: 0.9 }}>
                <Phone size={18} color="var(--color-primary)"/> +91 9792939973
              </p>
            </div>
            
            <div style={{ marginTop: '1.5rem', height: '120px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
              <iframe
                title="Footer Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3550.941938596644!2d81.745494!3d27.126442!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39908de75079a6db%3A0x633fa073998b36e8!2sShree%20Manvat%20Baba%20Mahashiv%20Mandir%20Trust!5e0!3m2!1sen!2sin!4v1718000000000"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
              />
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 Shree Manvat Baba Mandir Trust. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
