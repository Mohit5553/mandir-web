import { useEffect, useState } from 'react';
import { Mail, MailOpen, Trash2, Search, CheckCircle2, MessageSquare, Reply } from 'lucide-react';
import { api } from '../../services/api';
import { hasPermission } from '../../hooks/usePermission';

const AdminContact = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread' | 'read'
  const [search, setSearch] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const canDelete = hasPermission('Contact Messages', 'delete');
  const canUpdate = hasPermission('Contact Messages', 'update');

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const data = await api.getContactMessages();
      if (data?.message) {
        setErrorMsg(data.message);
      } else {
        setMessages(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      setErrorMsg('Failed to connect to API server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleToggleRead = async (id) => {
    if (!canUpdate) return;
    try {
      const res = await api.toggleContactRead(id);
      if (res?.message && res.message.includes('failed')) {
        setErrorMsg(res.message);
      } else {
        setMessages(prev => prev.map(msg => msg._id === id ? { ...msg, isRead: !msg.isRead } : msg));
        setSuccessMsg(res.isRead ? '✅ Message marked as read.' : '✅ Message marked as unread.');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      setErrorMsg('Failed to update status.');
    }
  };

  const handleDelete = async (id) => {
    if (!canDelete) return;
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    try {
      const res = await api.deleteContactMessage(id);
      if (res?.message && res.message.includes('failed')) {
        setErrorMsg(res.message);
      } else {
        setMessages(prev => prev.filter(msg => msg._id !== id));
        setSuccessMsg('✅ Message deleted successfully.');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      setErrorMsg('Failed to delete message.');
    }
  };

  // Stats
  const totalCount = messages.length;
  const unreadCount = messages.filter(m => !m.isRead).length;
  const readCount = messages.filter(m => m.isRead).length;

  // Filter & Search
  const filteredMessages = messages.filter(msg => {
    const matchesFilter = filter === 'all' || (filter === 'read' && msg.isRead) || (filter === 'unread' && !msg.isRead);
    const searchLower = search.toLowerCase();
    const matchesSearch = 
      msg.name.toLowerCase().includes(searchLower) ||
      msg.email.toLowerCase().includes(searchLower) ||
      msg.message.toLowerCase().includes(searchLower);
    return matchesFilter && matchesSearch;
  });

  const inputStyle = {
    padding: '0.65rem 1rem',
    borderRadius: '12px',
    border: '1px solid var(--border-color)',
    fontSize: '0.92rem',
    backgroundColor: '#fff',
    outlineColor: 'var(--color-primary)',
    minWidth: '240px'
  };

  return (
    <div>
      <div className="page-toolbar" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.4rem' }}>संपर्क संदेश (Devotee Queries)</h1>
          <p className="text-light">वेबसाइट से श्रद्धालुओं द्वारा भेजे गए प्रश्नों एवं संदेशों की समीक्षा व उत्तर दें</p>
        </div>
      </div>

      {errorMsg && (
        <div style={{ marginBottom: '1.25rem', padding: '0.8rem 1.2rem', borderRadius: '10px', background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca', fontWeight: 600 }}>
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div style={{ marginBottom: '1.25rem', padding: '0.8rem 1.2rem', borderRadius: '10px', background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', fontWeight: 600 }}>
          {successMsg}
        </div>
      )}

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div className="content-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#eff6ff', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MessageSquare size={22} />
          </div>
          <div>
            <p style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 700, margin: '0 0 0.15rem' }}>कुल संपर्क संदेश</p>
            <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{totalCount}</h2>
          </div>
        </div>

        <div className="content-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fef2f2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Mail size={22} />
          </div>
          <div>
            <p style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 700, margin: '0 0 0.15rem' }}>अपठित (Unread) संदेश</p>
            <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#ef4444' }}>{unreadCount}</h2>
          </div>
        </div>

        <div className="content-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f0fdf4', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MailOpen size={22} />
          </div>
          <div>
            <p style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 700, margin: '0 0 0.15rem' }}>पढ़े गए / निस्तारित</p>
            <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#15803d' }}>{readCount}</h2>
          </div>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="content-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
        <div style={{ display: 'inline-flex', background: '#f1f5f9', borderRadius: '12px', padding: '4px', gap: '4px' }}>
          <button className={`admin-tab ${filter === 'all' ? 'active' : ''}`} style={{ border: 'none', padding: '0.5rem 1.25rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }} onClick={() => setFilter('all')}>सभी संदेश</button>
          <button className={`admin-tab ${filter === 'unread' ? 'active' : ''}`} style={{ border: 'none', padding: '0.5rem 1.25rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }} onClick={() => setFilter('unread')}>अपठित (Unread)</button>
          <button className={`admin-tab ${filter === 'read' ? 'active' : ''}`} style={{ border: 'none', padding: '0.5rem 1.25rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }} onClick={() => setFilter('read')}>पढ़े गए (Read)</button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', color: '#94a3b8' }} />
          <input type="text" placeholder="नाम, ईमेल या संदेश खोजें..." style={{ ...inputStyle, paddingLeft: '36px' }} value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Messages Grid */}
      {loading ? (
        <p style={{ textAlign: 'center', color: '#94a3b8', padding: '3rem' }}>संदेश लोड हो रहे हैं...</p>
      ) : filteredMessages.length === 0 ? (
        <div className="content-card" style={{ textAlign: 'center', padding: '4rem' }}>
          <Mail size={52} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
          <h3 style={{ color: '#94a3b8', marginBottom: '0.5rem' }}>कोई संदेश नहीं मिला</h3>
          <p style={{ color: '#cbd5e1' }}>आपकी खोज या फ़िल्टर के अनुसार कोई संपर्क संदेश उपलब्ध नहीं है।</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1.25rem' }}>
          {filteredMessages.map(msg => (
            <div key={msg._id} className="content-card" style={{
              borderLeft: msg.isRead ? '4px solid #cbd5e1' : '4px solid var(--color-primary)',
              opacity: msg.isRead ? 0.82 : 1,
              transition: 'all 0.2s'
            }}>
              {/* Header Info */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {msg.name}
                    {!msg.isRead && (
                      <span style={{ padding: '0.15rem 0.5rem', borderRadius: '999px', fontSize: '0.65rem', fontWeight: 800, background: '#fef2f2', color: '#ef4444', border: '1px solid #fee2e2' }}>नया (NEW)</span>
                    )}
                  </h3>
                  <a href={`mailto:${msg.email}`} style={{ fontSize: '0.85rem', color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600 }}>{msg.email}</a>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}>
                    {new Date(msg.createdAt).toLocaleString('hi-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {canDelete && (
                    <button onClick={() => handleDelete(msg._id)} className="btn-icon" style={{ borderColor: '#fee2e2', padding: '0.4rem' }} title="संदेश हटाएं">
                      <Trash2 size={15} color="#ef4444" />
                    </button>
                  )}
                </div>
              </div>

              {/* Message content */}
              <div style={{
                background: '#f8fafc',
                padding: '1rem 1.25rem',
                borderRadius: '12px',
                border: '1px solid #f1f5f9',
                fontSize: '0.95rem',
                color: '#334155',
                lineHeight: 1.5,
                whiteSpace: 'pre-wrap',
                marginBottom: '1rem'
              }}>
                {msg.message}
              </div>

              {/* Action Toolbar */}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                {canUpdate && (
                  <button onClick={() => handleToggleRead(msg._id)} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 1rem', fontSize: '0.82rem', fontWeight: 700 }}>
                    {msg.isRead ? <Mail size={15} /> : <MailOpen size={15} />}
                    {msg.isRead ? 'अपठित चिह्नित करें' : 'पढ़ा हुआ चिह्नित करें'}
                  </button>
                )}
                <a href={`mailto:${msg.email}?subject=श्री मन्वत बाबा महाशिव मंदिर - आपके संदेश का उत्तर&body=प्रिय ${msg.name},%0D%0A%0D%0Aश्री मन्वत बाबा महाशिव मंदिर ट्रस्ट से संपर्क करने के लिए धन्यवाद।%0D%0A%0D%0A[अपना उत्तर यहाँ लिखें]%0D%0A%0D%0Aसादर,%0D%0Aट्रस्ट प्रशासन`} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 1rem', fontSize: '0.82rem', textDecoration: 'none', fontWeight: 700 }}>
                  <Reply size={15} /> ईमेल द्वारा उत्तर दें
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminContact;
