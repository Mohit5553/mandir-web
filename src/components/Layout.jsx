import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Heart, MapPin, Phone, Menu, X, LogIn, LayoutDashboard, ChevronRight, Calendar, Mail, Info, Image as ImageIcon, FileText, ShieldCheck } from 'lucide-react';
import logo from '../assets/logo.png';
import LanguageToggle from './LanguageToggle';
import './Layout.css';

const Layout = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const adminUser = JSON.parse(localStorage.getItem('adminUser') || 'null');

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    navigate('/');
  };

  return (
    <div className="layout">
      <header className={`header${scrolled ? ' scrolled' : ''}`}>
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
            <LanguageToggle onSelect={() => setIsMenuOpen(false)} />
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

      {/* Floating WhatsApp */}
      <a
        className="whatsapp-float"
        href="https://wa.me/919792939973?text=Namaste%2C%20I%20want%20to%20contact%20Shree%20Manvat%20Baba%20Mahashiv%20Mandir%20Trust."
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        title="Chat on WhatsApp"
      >
        <svg viewBox="0 0 32 32" aria-hidden="true" className="whatsapp-logo">
          <path d="M16.04 3.2c-7.03 0-12.75 5.65-12.75 12.61 0 2.23.6 4.41 1.74 6.32L3.2 28.8l6.86-1.79a12.93 12.93 0 0 0 5.98 1.5c7.03 0 12.75-5.65 12.75-12.61S23.07 3.2 16.04 3.2Zm0 22.96c-1.88 0-3.72-.5-5.33-1.46l-.38-.22-4.07 1.06 1.09-3.92-.25-.4a10.19 10.19 0 0 1-1.58-5.41c0-5.68 4.72-10.3 10.52-10.3s10.52 4.62 10.52 10.3-4.72 10.35-10.52 10.35Zm5.77-7.72c-.32-.16-1.88-.92-2.17-1.02-.29-.11-.5-.16-.71.16-.21.31-.81 1.02-.99 1.23-.18.21-.37.24-.69.08-.32-.16-1.34-.49-2.55-1.55-.94-.83-1.58-1.85-1.76-2.16-.18-.31-.02-.48.14-.64.14-.14.32-.37.48-.55.16-.18.21-.31.32-.52.11-.21.05-.39-.03-.55-.08-.16-.71-1.69-.97-2.32-.26-.61-.52-.53-.71-.54h-.61c-.21 0-.55.08-.84.39-.29.31-1.1 1.07-1.1 2.6s1.13 3.02 1.29 3.23c.16.21 2.22 3.35 5.38 4.7.75.32 1.34.51 1.8.65.76.24 1.45.21 1.99.13.61-.09 1.88-.76 2.15-1.5.26-.73.26-1.36.18-1.5-.08-.13-.29-.21-.61-.37Z" />
        </svg>
      </a>

      {/* Floating Donate Button */}
      <Link
        to="/donate"
        className="donate-float"
        aria-label="Donate Now"
        title="Donate Now"
      >
        <Heart size={22} />
        <span>Donate</span>
      </Link>

      <footer className="footer custom-premium-footer">
        <div className="container footer-content premium-grid">
          <div className="footer-col brand-col">
            <div className="footer-brand">
              <img src={logo} alt="Trust Logo" className="footer-logo premium-shadow" />
              <h3>Shree Manvat Baba Mahashiv Mandir Trust</h3>
            </div>
            <p className="brand-desc">
              A sacred place of worship, peace, and spiritual growth. Join our faithful community to spread harmony and devotion.
            </p>
            <div className="social-links">
              <a href="#" className="social-icon" aria-label="Facebook">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
              <a href="#" className="social-icon" aria-label="Instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href="#" className="social-icon" aria-label="Twitter">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
              </a>
              <a href="#" className="social-icon" aria-label="YouTube">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
              </a>
            </div>
          </div>

          <div className="footer-col links-col">
            <h3>Explore</h3>
            <ul className="premium-links">
              <li>
                <Link to="/about" className="hover-link">
                  <Info size={16} className="link-icon" /> About Us
                </Link>
              </li>
              <li>
                <Link to="/events" className="hover-link">
                  <Calendar size={16} className="link-icon" /> Upcoming Events
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="hover-link">
                  <ImageIcon size={16} className="link-icon" /> Gallery
                </Link>
              </li>
              <li>
                <Link to="/donate" className="hover-link highlight-link">
                  <Heart size={16} className="link-icon" /> Make a Donation
                </Link>
              </li>
              <li>
                <Link to="/terms-and-conditions" className="hover-link">
                  <FileText size={16} className="link-icon" /> Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover-link">
                  <ShieldCheck size={16} className="link-icon" /> Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          <div className="footer-col contact-col">
            <h3>Contact Info</h3>
            <div className="premium-contact-details">
              <p>
                <MapPin size={20} className="contact-icon" />
                <span>Bairampur, Colonelganj, Gonda (U.P.) - 271502</span>
              </p>
              <p>
                <Phone size={20} className="contact-icon" />
                <span>+91 9792939973</span>
              </p>
              <p>
                <Mail size={20} className="contact-icon" />
                <span>mahashivmandirtrusts@gmail.com</span>
              </p>
            </div>
          </div>

          <div className="footer-col map-col">
            <h3>Temple Location</h3>
            <div className="map-container premium-shadow">
              <iframe
                title="Footer Location"
                src="https://maps.google.com/maps?q=27.1941132,81.6734072&hl=en&z=17&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
              />
            </div>
          </div>
        </div>
        
        <div className="footer-bottom premium-bottom">
          <p>&copy; {new Date().getFullYear()} Shree Manvat Baba Mandir Trust. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
