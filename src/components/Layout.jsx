import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Heart, MapPin, Phone, Menu, X, LogIn, LayoutDashboard, ChevronRight, Calendar, Mail, Info, Image as ImageIcon, FileText, ShieldCheck, Radio, Home, Newspaper, Download, Users } from 'lucide-react';
import logo from '../assets/logo.png';
import LanguageToggle from './LanguageToggle';
import BhaktiAudioPlayer from './BhaktiAudioPlayer';
import PWAInstallPrompt from './PWAInstallPrompt';
import { api } from '../services/api';
import './Layout.css';

const Layout = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const [isLive, setIsLive] = React.useState(false);
  const [visitorCount, setVisitorCount] = React.useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const adminUser = JSON.parse(localStorage.getItem('adminUser') || 'null');

  React.useEffect(() => {
    const handleVisitorTracking = async () => {
      try {
        if (!sessionStorage.getItem('hasVisited')) {
          const res = await api.incrementVisitorCount();
          if (res && res.count) {
            setVisitorCount(res.count);
            sessionStorage.setItem('hasVisited', 'true');
          }
        } else {
          const res = await api.getVisitorCount();
          if (res && res.count) {
            setVisitorCount(res.count);
          }
        }
      } catch (err) {
        console.error('Failed to track visitor:', err);
      }
    };
    handleVisitorTracking();

    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  React.useEffect(() => {
    const checkLiveStatus = async () => {
      try {
        const data = await api.getLiveStatus();
        if (data && typeof data.isLive === 'boolean') {
          setIsLive(data.isLive);
        }
      } catch (err) {
        console.error('Failed to fetch live status:', err);
      }
    };
    checkLiveStatus();
    const timer = setInterval(checkLiveStatus, 15000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    navigate('/');
  };

  return (
    <div className="layout">
      {/* Flashing Live Stream Announcement Banner when Live is Active */}
      {isLive && (
        <div className="live-stream-top-banner">
          <div className="live-banner-content">
            <span className="live-banner-dot" />
            <span>🎥 मंदिर परिसर से <strong>लाइव दर्शन (Live Darshan)</strong> प्रसारित हो रहा है!</span>
          </div>
          <Link to="/live" className="live-banner-action">
            अभी देखें ▶
          </Link>
        </div>
      )}

      <header className={`header${scrolled ? ' scrolled' : ''}${isLive ? ' has-live-banner' : ''}`}>
        <div className="container header-content">
          <Link to="/" className="logo">
            <img src={logo} alt="Trust Logo" className="logo-img" />
          </Link>

          {/* Direct Mobile Live Badge visible on Mobile Top Bar without opening drawer */}
          {isLive && (
            <Link
              to="/live"
              className="mobile-live-badge-top"
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="live-dot-pulse" />
              <Radio size={14} />
              <span>LIVE दर्शन</span>
            </Link>
          )}

          {/* Mobile Overlay Backdrop */}
          {isMenuOpen && (
            <div className="mobile-menu-overlay" onClick={() => setIsMenuOpen(false)} />
          )}

          {/* Centered Navigation Links / Drawer */}
          <nav className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
            {/* Drawer Header for Mobile */}
            <div className="drawer-header">
              <div className="drawer-brand">
                <img src={logo} alt="ट्रस्ट लोगो" className="drawer-logo" />
                <span className="drawer-title">मंदिर ट्रस्ट</span>
              </div>
              <button type="button" className="drawer-close-btn" onClick={() => setIsMenuOpen(false)} aria-label="मेनू बंद करें">
                <X size={24} />
              </button>
            </div>

            <div className="drawer-menu-items">
              <Link to="/" className={isActive('/')} onClick={() => setIsMenuOpen(false)}>
                <div className="link-text-group">
                  <Home size={20} className="menu-icon" />
                  <span>होम</span>
                </div>
                <ChevronRight size={16} className="menu-arrow" />
              </Link>
              <Link to="/about" className={isActive('/about')} onClick={() => setIsMenuOpen(false)}>
                <div className="link-text-group">
                  <Info size={20} className="menu-icon" />
                  <span>हमारे बारे में</span>
                </div>
                <ChevronRight size={16} className="menu-arrow" />
              </Link>
              <Link to="/news" className={isActive('/news')} onClick={() => setIsMenuOpen(false)}>
                <div className="link-text-group">
                  <Newspaper size={20} className="menu-icon" />
                  <span>समाचार</span>
                </div>
                <ChevronRight size={16} className="menu-arrow" />
              </Link>
              <Link to="/events" className={isActive('/events')} onClick={() => setIsMenuOpen(false)}>
                <div className="link-text-group">
                  <Calendar size={20} className="menu-icon" />
                  <span>घटनाएँ</span>
                </div>
                <ChevronRight size={16} className="menu-arrow" />
              </Link>
              <Link to="/gallery" className={isActive('/gallery')} onClick={() => setIsMenuOpen(false)}>
                <div className="link-text-group">
                  <ImageIcon size={20} className="menu-icon" />
                  <span>गैलरी</span>
                </div>
                <ChevronRight size={16} className="menu-arrow" />
              </Link>
              <Link to="/contact" className={isActive('/contact')} onClick={() => setIsMenuOpen(false)}>
                <div className="link-text-group">
                  <Phone size={20} className="menu-icon" />
                  <span>संपर्क</span>
                </div>
                <ChevronRight size={16} className="menu-arrow" />
              </Link>
              {isLive && (
                <Link
                  to="/live"
                  className={`${isActive('/live')} nav-live-link ${isLive ? 'online' : 'offline'}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="link-text-group">
                    <Radio size={20} className="menu-icon" />
                    <span>लाइव दर्शन</span>
                  </div>
                  <span className={`live-indicator-dot ${isLive ? 'online' : 'offline'}`} title={isLive ? "दर्शन लाइव चालू है!" : "लाइव दर्शन बंद है"}></span>
                </Link>
              )}
            </div>

            {/* Mobile Actions Drawer Wrapper */}
            <div className="mobile-actions-wrapper">
              <LanguageToggle onSelect={() => setIsMenuOpen(false)} />

              <div style={{ marginTop: '0.85rem' }}>
                {adminUser ? (
                  <div>
                    <Link to="/admin" className="btn btn-dashboard" onClick={() => setIsMenuOpen(false)}>
                      <LayoutDashboard size={18} /> डैशबोर्ड
                    </Link>
                    <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="btn btn-logout">
                      लॉग आउट
                    </button>
                  </div>
                ) : (
                  <Link to="/admin/login" className="btn btn-login" onClick={() => setIsMenuOpen(false)}>
                    <LogIn size={18} /> लॉग इन करें
                  </Link>
                )}
              </div>
            </div>
          </nav>

          {/* Desktop-only Header Actions */}
          <div className="header-actions">
            <LanguageToggle onSelect={() => setIsMenuOpen(false)} />
            <Link to="/donate" className="btn" style={{ background: 'linear-gradient(135deg, #FF6000 0%, #ea580c 100%)', color: '#ffffff', padding: '0.5rem 1.15rem', borderRadius: '99px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.88rem', boxShadow: '0 4px 15px rgba(255, 96, 0, 0.3)', textDecoration: 'none', border: 'none', transition: 'transform 0.2s, box-shadow 0.2s' }} onClick={() => setIsMenuOpen(false)}>
              <Heart size={15} fill="currentColor" /> दान करें
            </Link>
            {adminUser ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Link to="/admin" className="btn" style={{ background: 'rgba(255, 96, 0, 0.1)', color: 'var(--color-primary)', padding: '0.5rem 1rem', borderRadius: '99px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.88rem', textDecoration: 'none' }} onClick={() => setIsMenuOpen(false)}>
                  <LayoutDashboard size={15} /> डैशबोर्ड
                </Link>
                <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} style={{ background: 'transparent', color: '#64748b', border: '1px solid #cbd5e1', padding: '0.5rem 0.85rem', borderRadius: '99px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>
                  लॉग आउट
                </button>
              </div>
            ) : (
              <Link to="/admin/login" className="btn" style={{ background: '#fff7ed', color: '#ea580c', padding: '0.5rem 1.1rem', borderRadius: '99px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.88rem', border: '1px solid #fed7aa', textDecoration: 'none' }} onClick={() => setIsMenuOpen(false)}>
                <LogIn size={15} /> लॉग इन करें
              </Link>
            )}
          </div>

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
        aria-label="WhatsApp पर चैट करें"
        title="WhatsApp पर चैट करें"
      >
        <svg viewBox="0 0 32 32" aria-hidden="true" className="whatsapp-logo">
          <path d="M16.04 3.2c-7.03 0-12.75 5.65-12.75 12.61 0 2.23.6 4.41 1.74 6.32L3.2 28.8l6.86-1.79a12.93 12.93 0 0 0 5.98 1.5c7.03 0 12.75-5.65 12.75-12.61S23.07 3.2 16.04 3.2Zm0 22.96c-1.88 0-3.72-.5-5.33-1.46l-.38-.22-4.07 1.06 1.09-3.92-.25-.4a10.19 10.19 0 0 1-1.58-5.41c0-5.68 4.72-10.3 10.52-10.3s10.52 4.62 10.52 10.3-4.72 10.35-10.52 10.35Zm5.77-7.72c-.32-.16-1.88-.92-2.17-1.02-.29-.11-.5-.16-.71.16-.21.31-.81 1.02-.99 1.23-.18.21-.37.24-.69.08-.32-.16-1.34-.49-2.55-1.55-.94-.83-1.58-1.85-1.76-2.16-.18-.31-.02-.48.14-.64.14-.14.32-.37.48-.55.16-.18.21-.31.32-.52.11-.21.05-.39-.03-.55-.08-.16-.71-1.69-.97-2.32-.26-.61-.52-.53-.71-.54h-.61c-.21 0-.55.08-.84.39-.29.31-1.1 1.07-1.1 2.6s1.13 3.02 1.29 3.23c.16.21 2.22 3.35 5.38 4.7.75.32 1.34.51 1.8.65.76.24 1.45.21 1.99.13.61-.09 1.88-.76 2.15-1.5.26-.73.26-1.36.18-1.5-.08-.13-.29-.21-.61-.37Z" />
        </svg>
      </a>

      {/* Floating Donate Button */}
      <Link
        to="/donate"
        className="donate-float"
        aria-label="दान करें"
        title="दान करें"
      >
        <Heart size={22} />
        <span>दान करें</span>
      </Link>

      {/* App-Style Mobile Bottom Navigation Bar (Visible only on mobile screens <= 768px) */}
      <nav className={`mobile-app-bottom-nav ${isMenuOpen ? 'hidden-when-drawer-open' : ''}`}>
        <Link to="/" className={`mobile-nav-tab ${location.pathname === '/' ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>
          <Home size={20} />
          <span>होम</span>
        </Link>
        
        <Link to="/about" className={`mobile-nav-tab ${location.pathname === '/about' ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>
          <Info size={20} />
          <span>के बारे में</span>
        </Link>
        
        <Link to="/donate" className="mobile-nav-tab mobile-donate-center-tab" onClick={() => setIsMenuOpen(false)}>
          <div className="mobile-donate-fab">
            <Heart size={20} fill="#ffffff" color="#ffffff" />
          </div>
          <span>दान करें</span>
        </Link>

        <Link to="/events" className={`mobile-nav-tab ${location.pathname === '/events' ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>
          <Calendar size={20} />
          <span>घटनाएँ</span>
        </Link>

        <Link to="/gallery" className={`mobile-nav-tab ${location.pathname === '/gallery' ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>
          <ImageIcon size={20} />
          <span>गैलरी</span>
        </Link>
      </nav>

      <footer className="footer custom-premium-footer">
        <div className="container footer-content premium-grid">
          <div className="footer-col brand-col">
            <div className="footer-brand">
              <img src={logo} alt="ट्रस्ट लोगो" className="footer-logo premium-shadow" />
              <h3>श्री मन्वत बाबा महाशिव मंदिर ट्रस्ट</h3>
            </div>
            <p className="brand-desc">
              पूजा, शांति और आध्यात्मिक उन्नति का पवित्र स्थान। धार्मिक सद्भाव और भक्ति का प्रसार करने के लिए हमारे भक्त समुदाय से जुड़ें।
            </p>
            <div className="social-links">
              <a href="#" className="social-icon" aria-label="फेसबुक">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
              <a href="#" className="social-icon" aria-label="इंस्टाग्राम">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href="#" className="social-icon" aria-label="ट्विटर">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
              </a>
              <a href="#" className="social-icon" aria-label="यूट्यूब">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
              </a>
            </div>
          </div>

          <div className="footer-col links-col">
            <h3>त्वरित लिंक्स</h3>
            <ul className="premium-links">
              <li>
                <Link to="/about" className="hover-link">
                  <Info size={16} className="link-icon" /> हमारे बारे में
                </Link>
              </li>
              <li>
                <Link to="/events" className="hover-link">
                  <Calendar size={16} className="link-icon" /> आगामी कार्यक्रम
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="hover-link">
                  <ImageIcon size={16} className="link-icon" /> गैलरी
                </Link>
              </li>
              <li>
                <Link to="/donate" className="hover-link highlight-link">
                  <Heart size={16} className="link-icon" /> दान करें
                </Link>
              </li>
              <li>
                <Link to="/terms-and-conditions" className="hover-link">
                  <FileText size={16} className="link-icon" /> नियम एवं शर्तें
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover-link">
                  <ShieldCheck size={16} className="link-icon" /> गोपनीयता नीति
                </Link>
              </li>
              <li>
                <a href="/mandir-app.apk" download className="hover-link" style={{ fontWeight: 'bold', color: '#ffffff' }}>
                  <Download size={16} className="link-icon" /> ऐप्लिकेशन डाउनलोड करें (APK)
                </a>
              </li>
            </ul>
          </div>

          <div className="footer-col contact-col">
            <h3>संपर्क सूचना</h3>
            <div className="premium-contact-details">
              <p>
                <MapPin size={20} className="contact-icon" />
                <span>बैरमपुर, करनैलगंज, गोंडा (उ.प्र.) - 271502</span>
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
            <h3>मंदिर का स्थान</h3>
            <div className="map-container premium-shadow">
              <iframe
                title="मंदिर स्थान"
                src="https://maps.google.com/maps?q=27.1941132,81.6734072&hl=hi&z=17&output=embed"
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
          <p>&copy; {new Date().getFullYear()} श्री मन्वत बाबा मंदिर ट्रस्ट। सर्वाधिकार सुरक्षित।</p>
          <p style={{ marginTop: '0.4rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
            <Users size={14} /> कुल आगंतुक: <strong>{visitorCount > 0 ? visitorCount.toLocaleString('hi-IN') : '...'}</strong>
          </p>
        </div>
      </footer>

      {/* Global Bhakti Audio Player & Mobile PWA Install Prompt */}
      <BhaktiAudioPlayer />
      <PWAInstallPrompt />
    </div>
  );
};

export default Layout;
