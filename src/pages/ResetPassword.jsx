import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { api } from '../services/api';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!token) {
      setError('Password reset token is missing. Please request a new link.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.resetPassword(token, password);
      if (res.message && res.message.toLowerCase().includes('successful')) {
        setSuccess('Your password has been reset successfully! Redirecting to login page...');
        setTimeout(() => {
          navigate('/admin/login');
        }, 3000);
      } else {
        setError(res.message || 'Failed to reset password. The link may have expired.');
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
          <p style={{ color: 'var(--color-text-light)', fontSize: '1rem' }}>Administrator Console</p>
        </div>

        {/* Card */}
        <div style={{
          background: 'white',
          borderRadius: 'var(--radius-lg)',
          padding: '2.5rem',
          boxShadow: '0 20px 60px rgba(255, 107, 0, 0.12)',
          border: '1px solid rgba(255, 107, 0, 0.1)'
        }}>
          <h2 style={{ marginBottom: '1.75rem', fontSize: '1.5rem', fontWeight: 700 }}>Reset Password</h2>

          {!token ? (
            <div style={{
              padding: '0.85rem 1rem',
              background: '#fee2e2',
              color: '#b91c1c',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 500,
              fontSize: '0.9rem',
              borderLeft: '4px solid #b91c1c',
              marginBottom: '1.5rem'
            }}>
              Invalid Reset Link. The password reset token is missing from the URL. Please request a new link from the login page.
            </div>
          ) : (
            <>
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

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.95rem' }}>
                    New Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter new password"
                      style={{ ...inputStyle, paddingRight: '2.8rem' }}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
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

                <div style={{ marginBottom: '2rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.95rem' }}>
                    Confirm New Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      placeholder="Confirm your new password"
                      style={{ ...inputStyle, paddingRight: '2.8rem' }}
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
                      onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
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
                      {showConfirmPassword ? <EyeOff size={19} /> : <Eye size={19} />}
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
                    fontFamily: 'inherit',
                    marginBottom: '1.25rem'
                  }}
                >
                  {loading ? 'Resetting Password...' : '🔒 Reset Password'}
                </button>
              </form>
            </>
          )}

          <button
            type="button"
            onClick={() => navigate('/admin/login')}
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
        </div>

      </div>
    </div>
  );
};

export default ResetPassword;
