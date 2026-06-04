import { useState, useEffect } from 'react';
import { Send } from 'lucide-react';
import { api } from '../../services/api';

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [form, setForm] = useState({ title: '', message: '', type: 'General' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState('');

  const fetchNotifications = () => api.getNotifications().then(data => setNotifications(Array.isArray(data) ? data : []));
  useEffect(() => { fetchNotifications(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await api.sendNotification(form);

    if (result?.emailResult?.sent) {
      setSent(`Notification "${form.title}" emailed to ${result.emailResult.recipientCount} recipients.`);
    } else if (result?.emailResult?.reason) {
      setSent(`Notification saved, but email was not sent: ${result.emailResult.reason}`);
    } else if (result?.emailResult?.error) {
      setSent(`Notification saved, but email failed: ${result.emailResult.error}`);
    } else {
      setSent(result?.message || `Notification "${form.title}" saved.`);
    }

    if (!result?.message?.startsWith('Server error')) {
      setForm({ title: '', message: '', type: 'General' });
      await fetchNotifications();
    }

    setLoading(false);
    setTimeout(() => setSent(''), 6000);
  };

  const inputStyle = { width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '1rem', fontFamily: 'inherit' };

  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>Notification Management</h1>
      <div className="admin-page-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div className="content-card">
          <h3 style={{ marginBottom: '1.5rem' }}>Send New Notification</h3>
          {sent && <div style={{ padding: '0.75rem', marginBottom: '1rem', background: '#dcfce7', color: '#166534', borderRadius: 'var(--radius-sm)', fontWeight: 500 }}>{sent}</div>}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Notification Type</label>
              <select style={inputStyle} value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                {['General', 'Festival', 'Event', 'Donation Campaign'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Title</label>
              <input type="text" required style={inputStyle} value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Message</label>
              <textarea rows="4" required style={{...inputStyle, resize: 'vertical'}} value={form.message} onChange={e => setForm({...form, message: e.target.value})}></textarea>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              <Send size={18} /> {loading ? 'Sending...' : 'Send to All Users'}
            </button>
          </form>
        </div>

        <div className="content-card" style={{ maxHeight: '500px', overflowY: 'auto' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Sent Notifications ({notifications.length})</h3>
          {notifications.length === 0 && <p className="text-light">No notifications sent yet.</p>}
          {notifications.map(n => (
            <div key={n._id} style={{ padding: '1rem 0', borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <p style={{ fontWeight: 600 }}>{n.title}</p>
                <span style={{ padding: '0.2rem 0.6rem', background: 'var(--color-primary-alpha)', color: 'var(--color-primary)', borderRadius: 'var(--radius-full)', fontSize: '0.8rem' }}>{n.type}</span>
              </div>
              <p className="text-light" style={{ fontSize: '0.9rem' }}>{n.message}</p>
              <p className="text-light" style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>{new Date(n.sentAt).toLocaleString('en-IN')}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminNotifications;
