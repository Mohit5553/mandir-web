import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.login(form);
      if (res.message === 'Login successful') {
        localStorage.setItem('adminUser', JSON.stringify(res.user));
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
            Shree Mandir Trust
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
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.95rem' }}>
                Password
              </label>
              <input
                type="password"
                required
                placeholder="Enter your password"
                style={inputStyle}
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
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
                fontFamily: 'inherit'
              }}
            >
              {loading ? 'Signing In...' : '🔐 Sign In to Dashboard'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--color-text-light)', fontSize: '0.9rem' }}>
          <a href="/" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>← Back to Website</a>
        </p>

      </div>
    </div>
  );
};

export default Login;
