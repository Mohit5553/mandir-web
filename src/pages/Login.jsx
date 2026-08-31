import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { api } from '../services/api';

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

  const inputStyle = {
    width: '100%',
    padding: '0.9rem 1rem',
    borderRadius: 'var(--radius-sm)',
    border: '2px solid var(--border-color)',
    fontSize: '1rem',
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'var(--transition)',
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #FFF0E6 0%, #FFFFFF 60%, #FFF0E6 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      fontFamily: 'Outfit, sans-serif'
    }}>
      <div style={{ width: '100%', maxWidth: '460px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>🕉️</div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, background: 'linear-gradient(135deg, #FF6B00, #FF8533)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.25rem' }}>
            Shree Manvat Baba Mahashiv Mandir
          </h1>
          <p style={{ color: 'var(--color-text-light)', fontSize: '1rem' }}>Administrator Login</p>
        </div>

        {/* Card */}
        <div style={{
          background: 'white',
          borderRadius: 'var(--radius-lg)',
          padding: '2.5rem',
          boxShadow: '0 20px 60px rgba(255, 107, 0, 0.12)',
          border: '1px solid rgba(255, 107, 0, 0.1)'
        }}>
          {view === 'login' ? (
            <>
              <h2 style={{ marginBottom: '1.75rem', fontSize: '1.5rem', fontWeight: 700 }}>Sign In</h2>

              {error && (
                <div style={{
                  padding: '0.85rem 1rem',
                  marginBottom: '1.5rem',
                  background: '#fee2e2',
                  color: '#b91c1c',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 500,
                  fontSize: '0.9rem',
                  borderLeft: '4px solid #b91c1c'
                }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.95rem' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="Enter admin email"
                    style={inputStyle}
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
                  />
                </div>

                <div style={{ marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <label style={{ fontWeight: 600, fontSize: '0.95rem', margin: 0 }}>
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => { setView('forgot'); setError(''); setSuccess(''); }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-primary)',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
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
                      placeholder="Enter your password"
                      style={{ ...inputStyle, paddingRight: '2.8rem' }}
                      value={form.password}
                      onChange={e => setForm({ ...form, password: e.target.value })}
                      onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
                      onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      style={{
                        position: 'absolute',
                        right: '0.85rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0.25rem'
                      }}
                    >
                      {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    background: loading ? '#ccc' : 'linear-gradient(135deg, #FF6B00, #FF8533)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'var(--transition)',
                    boxShadow: loading ? 'none' : '0 4px 16px rgba(255,107,0,0.3)',
                    fontFamily: 'inherit'
                  }}
                >
                  {loading ? 'Signing In...' : '🔐 Sign In to Dashboard'}
                </button>
              </form>
            </>
          ) : (
            <>
              <h2 style={{ marginBottom: '1.75rem', fontSize: '1.5rem', fontWeight: 700 }}>Forgot Password</h2>

              {error && (
                <div style={{
                  padding: '0.85rem 1rem',
                  marginBottom: '1.5rem',
                  background: '#fee2e2',
                  color: '#b91c1c',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 500,
                  fontSize: '0.9rem',
                  borderLeft: '4px solid #b91c1c'
                }}>
                  {error}
                </div>
              )}

              {success && (
                <div style={{
                  padding: '0.85rem 1rem',
                  marginBottom: '1.5rem',
                  background: '#dcfce7',
                  color: '#15803d',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 500,
                  fontSize: '0.9rem',
                  borderLeft: '4px solid #15803d'
                }}>
                  {success}
                </div>
              )}

              <form onSubmit={handleForgotSubmit}>
                <div style={{ marginBottom: '2rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.95rem' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="Enter your registered email"
                    style={inputStyle}
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                    onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    background: loading ? '#ccc' : 'linear-gradient(135deg, #FF6B00, #FF8533)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'var(--transition)',
                    boxShadow: loading ? 'none' : '0 4px 16px rgba(255,107,0,0.3)',
                    fontFamily: 'inherit',
                    marginBottom: '1.25rem'
                  }}
                >
                  {loading ? 'Sending link...' : '✉️ Send Password Reset Link'}
                </button>

                <button
                  type="button"
                  onClick={() => { setView('login'); setError(''); setSuccess(''); }}
                  style={{
                    width: '100%',
                    padding: '0.85rem',
                    background: 'transparent',
                    color: 'var(--color-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'var(--transition)',
                    fontFamily: 'inherit'
                  }}
                >
                  ← Back to Login
                </button>
              </form>
            </>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--color-text-light)', fontSize: '0.9rem' }}>
          <a href="/" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>← Back to Website</a>
        </p>

      </div>
    </div>
  );
};

export default Login;
