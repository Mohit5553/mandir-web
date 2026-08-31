import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, ShieldCheck, Lock, Mail, ArrowLeft, Sparkles, CheckCircle2, Globe } from 'lucide-react';
import { api } from '../services/api';
import logo from '../assets/logo.png';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [view, setView] = useState('login'); // 'login' | 'forgot'
  const [forgotEmail, setForgotEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await api.login(form);
      if (res.message === 'Login successful') {
        localStorage.setItem('adminUser', JSON.stringify(res.user));
        localStorage.setItem('adminPermissions', JSON.stringify(res.permissions || []));
        localStorage.setItem('adminToken', res.token);
        localStorage.setItem('adminRefreshToken', res.refreshToken);
        navigate('/admin');
      } else {
        setError(res.message || 'Invalid credentials. Please try again.');
      }
    } catch {
      setError('Could not connect to server. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await api.forgotPassword(forgotEmail);
      if (res.message && res.message.includes('sent')) {
        setSuccess(res.message);
        setForgotEmail('');
      } else {
        setError(res.message || 'Failed to request password reset.');
      }
    } catch {
      setError('Could not connect to server. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="admin-login-container"
      style={{
        height: '100vh',
        width: '100vw',
        maxHeight: '100vh',
        overflow: 'hidden',
        display: 'flex',
        boxSizing: 'border-box',
        fontFamily: 'Outfit, sans-serif'
      }}
    >
      
      {/* ── Left Side: Devotional Saffron Mandir Branding Panel (45% Width on Desktop) ── */}
      <div style={{
        flex: '0 0 45%',
        background: 'linear-gradient(135deg, #FF6000 0%, #ea580c 60%, #c2410c 100%)',
        padding: '2.5rem 3rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }} className="admin-login-left-panel">
        
        {/* Ambient background mandala/sun glows */}
        <div style={{ position: 'absolute', top: '-100px', left: '-100px', width: '350px', height: '350px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255, 255, 255, 0.25) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-100px', right: '-100px', width: '350px', height: '350px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255, 237, 213, 0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />

        {/* Top Header: Left "ॐ नमः शिवाय", Center Logo, Right "ॐ नमः शिवाय" */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem',
            width: '100%'
          }}>
            <div style={{
              fontSize: '1rem',
              fontWeight: 800,
              color: '#ffffff',
              background: 'rgba(255, 255, 255, 0.18)',
              backdropFilter: 'blur(8px)',
              padding: '0.3rem 0.75rem',
              borderRadius: '9999px',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              whiteSpace: 'nowrap'
            }}>
              ॐ नमः शिवाय
            </div>

            <div style={{ textAlign: 'center' }}>
              <img
                src={logo}
                alt="Mandir Logo"
                style={{
                  width: '90px',
                  height: '90px',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 6px 18px rgba(0,0,0,0.25))',
                  background: 'rgba(255, 255, 255, 0.95)',
                  padding: '8px',
                  borderRadius: '20px',
                  border: '2px solid rgba(255, 255, 255, 0.4)'
                }}
              />
            </div>

            <div style={{
              fontSize: '1rem',
              fontWeight: 800,
              color: '#ffffff',
              background: 'rgba(255, 255, 255, 0.18)',
              backdropFilter: 'blur(8px)',
              padding: '0.3rem 0.75rem',
              borderRadius: '9999px',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              whiteSpace: 'nowrap'
            }}>
              ॐ नमः शिवाय
            </div>
          </div>

          {/* Mandir Name in 2 Lines Centered Below Logo */}
          <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
            <h1 style={{
              fontSize: '2.1rem',
              fontWeight: 900,
              margin: 0,
              lineHeight: 1.15,
              color: '#ffffff',
              letterSpacing: '-0.3px',
              textShadow: '0 2px 10px rgba(0,0,0,0.2)'
            }}>
              श्री मन्वत बाबा
            </h1>
            <h2 style={{
              fontSize: '1.65rem',
              fontWeight: 800,
              margin: '0.2rem 0 0 0',
              lineHeight: 1.2,
              color: '#fef08a',
              letterSpacing: '-0.2px',
              textShadow: '0 2px 8px rgba(0,0,0,0.15)'
            }}>
              महाशिव मंदिर ट्रस्ट
            </h2>
          </div>
        </div>

        {/* Middle Main Mandir Intro & Services */}
        <div style={{ position: 'relative', zIndex: 1, marginTop: '0.75rem' }}>
          <p style={{ color: '#ffedd5', fontSize: '0.9rem', margin: '0 0 1.5rem 0', lineHeight: 1.5, fontWeight: 500, textAlign: 'center' }}>
            बैरमपुर, गोण्डा — धार्मिक सेवा, डिजिटल दान पावती एवं मंदिर प्रबंधन का आधिकारिक पोर्टल
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.88rem', color: '#ffffff', fontWeight: 600 }}>
              <CheckCircle2 size={18} color="#fef08a" />
              <span>दैनिक प्रभात व संध्या आरती एवं महाप्रसाद सेवा</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.88rem', color: '#ffffff', fontWeight: 600 }}>
              <CheckCircle2 size={18} color="#fef08a" />
              <span>ऑनलाइन दान एवं तुरंत 80G टैक्स रसीद स्वचालन</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.88rem', color: '#ffffff', fontWeight: 600 }}>
              <CheckCircle2 size={18} color="#fef08a" />
              <span>विशेष पूजा बुकिंग, धार्मिक अनुष्ठान एवं पर्व उत्सव प्रबंधन</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.88rem', color: '#ffffff', fontWeight: 600 }}>
              <CheckCircle2 size={18} color="#fef08a" />
              <span>ट्रस्टी मंडल, सेवक एवं स्वयंसेवक प्रबंधन पोर्टल</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div style={{ position: 'relative', zIndex: 1, fontSize: '0.78rem', color: '#ffedd5', fontWeight: 600, textAlign: 'center', marginTop: '1rem' }}>
          © २०२६ श्री मन्वत बाबा महाशिव मंदिर ट्रस्ट • बैरमपुर, करनैलगंज - गोण्डा (उ.प्र.)
        </div>
      </div>

      {/* ── Right Side: Form Panel (100% Width on Mobile) ────────── */}
      <div
        className="admin-login-right-panel"
        style={{
          flex: 1,
          background: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '2.5rem',
          boxSizing: 'border-box',
          position: 'relative'
        }}
      >
        
        {/* Top Highlighted "Back to Website" Button with Icon */}
        <div style={{
          position: 'absolute',
          top: '1.25rem',
          right: '1.25rem',
          zIndex: 10
        }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.4rem 0.85rem',
              borderRadius: '9999px',
              background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
              border: '1.5px solid #fed7aa',
              color: '#ea580c',
              fontSize: '0.8rem',
              fontWeight: 800,
              textDecoration: 'none',
              boxShadow: '0 3px 12px rgba(234, 88, 12, 0.15)',
              transition: 'all 0.2s'
            }}
          >
            <Globe size={15} color="#ea580c" />
            <span>← Back to Website</span>
          </Link>
        </div>

        {/* Mobile Header Logo & Mandir Name (Only Visible on Mobile <= 850px) */}
        <div
          className="admin-login-mobile-header"
          style={{
            display: 'none',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            marginBottom: '1.5rem',
            width: '100%'
          }}
        >
          <img
            src={logo}
            alt="Mandir Logo"
            style={{
              width: '70px',
              height: '70px',
              objectFit: 'contain',
              borderRadius: '16px',
              boxShadow: '0 6px 16px rgba(255, 107, 0, 0.2)',
              marginBottom: '0.5rem'
            }}
          />
          <h1 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
            श्री मन्वत बाबा महाशिव मंदिर
          </h1>
          <div style={{ fontSize: '0.75rem', color: '#ea580c', fontWeight: 700, marginTop: '0.25rem' }}>
            बैरमपुर, करनैलगंज - गोण्डा (उ.प्र.)
          </div>
        </div>

        <div style={{ width: '100%', maxWidth: '380px' }}>

          <div style={{ marginBottom: '1.75rem' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.2rem 0.65rem',
              background: 'rgba(255, 107, 0, 0.1)',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#ea580c',
              marginBottom: '0.5rem'
            }}>
              <ShieldCheck size={14} /> ADMINISTRATOR ACCESS
            </div>
            <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              {view === 'login' ? 'Sign In' : 'Reset Password'}
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.25rem 0 0 0' }}>
              {view === 'login' ? 'Enter your admin account email & password' : 'Enter email to receive password reset link'}
            </p>
          </div>

          {error && (
            <div style={{
              padding: '0.75rem 1rem',
              marginBottom: '1.25rem',
              background: '#fef2f2',
              color: '#991b1b',
              borderRadius: '10px',
              fontWeight: 600,
              fontSize: '0.82rem',
              borderLeft: '4px solid #ef4444'
            }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{
              padding: '0.75rem 1rem',
              marginBottom: '1.25rem',
              background: '#f0fdf4',
              color: '#166534',
              borderRadius: '10px',
              fontWeight: 600,
              fontSize: '0.82rem',
              borderLeft: '4px solid #22c55e'
            }}>
              {success}
            </div>
          )}

          {view === 'login' ? (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 700, fontSize: '0.85rem', color: '#334155' }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    required
                    placeholder="admin@mandir.org"
                    style={{
                      width: '100%',
                      padding: '0.75rem 0.9rem 0.75rem 2.6rem',
                      borderRadius: '10px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.9rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'all 0.2s'
                    }}
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                  />
                  <Mail size={18} color="#64748b" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label style={{ fontWeight: 700, fontSize: '0.85rem', color: '#334155', margin: 0 }}>
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => { setView('forgot'); setError(''); setSuccess(''); }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-primary)',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    Forgot Password?
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    style={{
                      width: '100%',
                      padding: '0.75rem 2.6rem 0.75rem 2.6rem',
                      borderRadius: '10px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.9rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'all 0.2s'
                    }}
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                  />
                  <Lock size={18} color="#64748b" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0.2rem'
                    }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  background: loading ? '#cbd5e1' : 'linear-gradient(135deg, #FF6B00 0%, #FF8533 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: loading ? 'none' : '0 4px 16px rgba(255, 107, 0, 0.35)',
                  transition: 'all 0.2s'
                }}
              >
                {loading ? 'Authenticating...' : 'Sign In to Dashboard →'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleForgotSubmit}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 700, fontSize: '0.85rem', color: '#334155' }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    required
                    placeholder="admin@mandir.org"
                    style={{
                      width: '100%',
                      padding: '0.75rem 0.9rem 0.75rem 2.6rem',
                      borderRadius: '10px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.9rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                  />
                  <Mail size={18} color="#64748b" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  background: loading ? '#cbd5e1' : 'linear-gradient(135deg, #FF6B00 0%, #FF8533 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 16px rgba(255, 107, 0, 0.35)',
                  marginBottom: '0.85rem'
                }}
              >
                {loading ? 'Sending link...' : 'Send Reset Instructions'}
              </button>

              <button
                type="button"
                onClick={() => { setView('login'); setError(''); setSuccess(''); }}
                style={{
                  width: '100%',
                  padding: '0.7rem',
                  background: 'transparent',
                  color: '#64748b',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                ← Back to Login
              </button>
            </form>
          )}

        </div>
      </div>

    </div>
  );
};

export default Login;
