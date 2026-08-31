import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ScrollText, RefreshCw, Filter, Search, Eye, X, Shield, Calendar, User, Globe, FileCode } from 'lucide-react';
import { api } from '../../services/api';

const AdminAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.getAuditLogs(200);
      if (Array.isArray(res)) {
        setLogs(res);
      } else {
        setLogs([]);
      }
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const actionLabels = {
    LOGIN_SUCCESS: 'सफल लॉगिन (Login Success)',
    LOGIN_FAILURE: 'विफल लॉगिन (Login Failure)',
    DONATION_STATUS_CHANGE: 'दान स्थिति बदलाव',
    USER_CREATE: 'नया उपयोगकर्ता सृजन',
    USER_UPDATE: 'उपयोगकर्ता अद्यतन',
    USER_DELETE: 'उपयोगकर्ता निष्कासन',
    ROLE_CREATE: 'नयी भूमिका सृजन',
    ROLE_UPDATE: 'भूमिका अनुमतियां अद्यतन'
  };

  const actionTypes = ['ALL', ...new Set(logs.map(log => log.action))];

  const filteredLogs = logs.filter(log => {
    const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm ||
      (log.userEmail || '').toLowerCase().includes(searchLower) ||
      (log.userName || '').toLowerCase().includes(searchLower) ||
      (log.action || '').toLowerCase().includes(searchLower) ||
      (log.ipAddress || '').toLowerCase().includes(searchLower) ||
      JSON.stringify(log.details || {}).toLowerCase().includes(searchLower);
    return matchesAction && matchesSearch;
  });

  const getActionBadgeColor = (action = '') => {
    if (action.includes('LOGIN_SUCCESS')) return { bg: '#dcfce7', text: '#166534' };
    if (action.includes('LOGIN_FAILURE')) return { bg: '#fee2e2', text: '#991b1b' };
    if (action.includes('CHANGE') || action.includes('UPDATE')) return { bg: '#e0f2fe', text: '#075985' };
    if (action.includes('CREATION') || action.includes('CREATE')) return { bg: '#fef3c7', text: '#92400e' };
    if (action.includes('DELETION') || action.includes('DELETE')) return { bg: '#fef2f2', text: '#991b1b' };
    return { bg: '#f1f5f9', text: '#475569' };
  };

  const formatDate = (rawDate) => {
    if (!rawDate) return 'उपलब्ध नहीं';
    const dateObj = new Date(rawDate);
    if (isNaN(dateObj.getTime())) return 'उपलब्ध नहीं';
    return dateObj.toLocaleString('hi-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderDetails = (details) => {
    if (!details || (typeof details === 'object' && Object.keys(details).length === 0)) {
      return <span style={{ color: '#cbd5e1' }}>—</span>;
    }
    if (typeof details === 'string') {
      return <span style={{ fontSize: '0.82rem', color: '#475569' }}>{details}</span>;
    }
    
    // Donation status change formatting
    if (details.donorName || details.amount || details.newStatus) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', fontSize: '0.82rem' }}>
          {details.donorName && <span style={{ fontWeight: 700, color: '#0f172a' }}>दानदाता: {details.donorName}</span>}
          {details.amount && <span style={{ padding: '0.15rem 0.45rem', background: '#dcfce7', color: '#166534', borderRadius: '6px', fontWeight: 800 }}>₹{details.amount}</span>}
          {details.previousStatus && details.newStatus && (
            <span style={{ fontSize: '0.78rem', background: '#e0f2fe', color: '#0369a1', padding: '0.15rem 0.45rem', borderRadius: '6px', fontWeight: 700 }}>
              {details.previousStatus} ➔ {details.newStatus}
            </span>
          )}
        </div>
      );
    }

    // General Key-Value pairs inline summary
    const entries = Object.entries(details);
    const summary = entries.slice(0, 3).map(([key, val]) => {
      let strVal = typeof val === 'object' ? JSON.stringify(val) : String(val);
      if (strVal.length > 20) strVal = strVal.substring(0, 18) + '...';
      return `${key}: ${strVal}`;
    }).join(' | ');

    return (
      <div 
        style={{ fontSize: '0.8rem', color: '#475569', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '320px' }} 
        title={JSON.stringify(details, null, 2)}
      >
        {summary}
      </div>
    );
  };

  return (
    <div className="admin-audit-logs" style={{ paddingBottom: '2rem' }}>
      <div className="page-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ScrollText color="var(--color-primary)" size={24} /> सुरक्षा एवं सिस्टम ऑडिट लॉग्स
          </h1>
          <p className="text-light" style={{ margin: '0.2rem 0 0 0', fontSize: '0.9rem' }}>प्रशासक गतिविधियों व सुरक्षा इतिहास का विवरण</p>
        </div>
        <button onClick={fetchLogs} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1rem', fontSize: '0.85rem' }}>
          <RefreshCw size={15} /> लॉग्स रिफ्रेश करें
        </button>
      </div>

      <div className="content-card" style={{ marginBottom: '1rem', padding: '0.85rem 1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '240px', display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.45rem 0.85rem' }}>
            <Search size={17} color="#94a3b8" style={{ marginRight: '0.5rem' }} />
            <input
              type="text"
              placeholder="उपयोगकर्ता, कार्रवाई, IP या विवरण खोजें..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.88rem' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={16} color="#64748b" />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              style={{ padding: '0.45rem 0.85rem', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '0.88rem', fontWeight: 600 }}
            >
              {actionTypes.map(act => (
                <option key={act} value={act}>{act === 'ALL' ? 'सभी कार्रवाइयां' : (actionLabels[act] || act)}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="content-card" style={{ padding: 0, overflow: 'hidden', borderRadius: '14px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>ऑडिट लॉग्स लोड हो रहे हैं...</div>
        ) : filteredLogs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>कोई ऑडिट लॉग नहीं मिला।</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
                  <th style={{ padding: '0.75rem 1rem' }}>समय एवं तिथि</th>
                  <th style={{ padding: '0.75rem 1rem' }}>कार्रवाई (Action)</th>
                  <th style={{ padding: '0.75rem 1rem' }}>उपयोगकर्ता / ईमेल</th>
                  <th style={{ padding: '0.75rem 1rem' }}>IP पता</th>
                  <th style={{ padding: '0.75rem 1rem' }}>विस्तृत विवरण</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>देखें</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => {
                  const badge = getActionBadgeColor(log.action);
                  return (
                    <tr 
                      key={log._id} 
                      onClick={() => setSelectedLog(log)}
                      style={{ borderBottom: '1px solid #f1f5f9', verticalAlign: 'middle', cursor: 'pointer', transition: 'background 0.15s' }}
                      className="audit-row"
                    >
                      <td style={{ padding: '0.65rem 1rem', whiteSpace: 'nowrap', color: '#64748b', fontWeight: 600 }}>
                        {formatDate(log.createdAt || log.timestamp)}
                      </td>
                      <td style={{ padding: '0.65rem 1rem', whiteSpace: 'nowrap' }}>
                        <span style={{
                          padding: '0.22rem 0.6rem',
                          borderRadius: '9999px',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          background: badge.bg,
                          color: badge.text,
                          display: 'inline-block'
                        }}>
                          {actionLabels[log.action] || log.action}
                        </span>
                      </td>
                      <td style={{ padding: '0.65rem 1rem', whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: 700, color: '#1e293b' }}>{log.userName || log.userEmail || 'मुख्य प्रशासक'}</div>
                        {log.userName && log.userEmail && <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{log.userEmail}</div>}
                      </td>
                      <td style={{ padding: '0.65rem 1rem', whiteSpace: 'nowrap', fontFamily: 'monospace', color: '#64748b', fontSize: '0.8rem' }}>
                        {log.ipAddress || '-'}
                      </td>
                      <td style={{ padding: '0.65rem 1rem' }}>
                        {renderDetails(log.details)}
                      </td>
                      <td style={{ padding: '0.65rem 1rem', textAlign: 'center' }} onClick={(e) => { e.stopPropagation(); setSelectedLog(log); }}>
                        <button className="btn btn-outline" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Eye size={14} /> देखें
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Audit Log Modal Details */}
      {selectedLog && createPortal(
        <div 
          onClick={() => setSelectedLog(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(6px)',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            boxSizing: 'border-box'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              maxWidth: '620px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
              border: '1px solid #e2e8f0',
              animation: 'fadeIn 0.2s ease-out',
              margin: 'auto'
            }}
          >
            {/* Modal Header */}
            <div style={{ padding: '1.5rem 1.75rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  background: getActionBadgeColor(selectedLog.action).bg,
                  color: getActionBadgeColor(selectedLog.action).text,
                  display: 'inline-block',
                  marginBottom: '0.5rem'
                }}>
                  {actionLabels[selectedLog.action] || selectedLog.action}
                </span>
                <h2 style={{ margin: 0, fontSize: '1.35rem', color: '#0f172a', fontWeight: 800 }}>सिस्टम ऑडिट गतिविधि विवरण</h2>
              </div>
              <button 
                onClick={() => setSelectedLog(null)}
                className="btn-icon" 
                style={{ padding: '0.4rem', borderRadius: '50%', border: '1px solid #e2e8f0' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.75rem', display: 'grid', gap: '1.25rem' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: '#f8fafc', padding: '1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.2rem' }}>
                    <Calendar size={14} color="var(--color-primary)" /> गतिविधि तिथि व समय
                  </div>
                  <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.95rem' }}>
                    {formatDate(selectedLog.createdAt || selectedLog.timestamp)}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.2rem' }}>
                    <Globe size={14} color="var(--color-primary)" /> IP पता
                  </div>
                  <div style={{ fontWeight: 700, color: '#1e293b', fontFamily: 'monospace', fontSize: '0.95rem' }}>
                    {selectedLog.ipAddress || 'उपलब्ध नहीं'}
                  </div>
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.4rem' }}>
                  <User size={14} color="var(--color-primary)" /> प्रयोक्ता / प्रशासक विवरण
                </div>
                <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem' }}>
                  {selectedLog.userName || selectedLog.userEmail || 'मुख्य प्रशासक'}
                </div>
                {selectedLog.userEmail && (
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: 600, marginTop: '0.15rem' }}>
                    {selectedLog.userEmail}
                  </div>
                )}
              </div>

              {/* Formatted Payload Details */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '14px', overflow: 'hidden' }}>
                <div style={{ padding: '0.75rem 1rem', background: '#f1f5f9', fontWeight: 800, color: '#334155', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <FileCode size={16} color="var(--color-primary)" /> विस्तृत डेटा एवं पेलोड (Payload Details)
                </div>
                <div style={{ padding: '1.25rem', background: '#ffffff' }}>
                  {selectedLog.details && typeof selectedLog.details === 'object' && Object.keys(selectedLog.details).length > 0 ? (
                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                      {Object.entries(selectedLog.details).map(([k, v]) => (
                        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.85rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                          <span style={{ fontWeight: 700, color: '#475569', fontSize: '0.85rem' }}>{k}:</span>
                          <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.88rem', fontFamily: typeof v === 'number' ? 'inherit' : 'monospace', background: typeof v === 'object' ? '#eff6ff' : 'transparent', padding: typeof v === 'object' ? '0.2rem 0.5rem' : 0, borderRadius: '4px' }}>
                            {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <pre style={{ margin: 0, padding: '1rem', background: '#0f172a', color: '#f8fafc', borderRadius: '8px', fontSize: '0.82rem', fontFamily: 'monospace', overflowX: 'auto' }}>
                      {JSON.stringify(selectedLog.details || {}, null, 2)}
                    </pre>
                  )}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div style={{ padding: '1rem 1.75rem', borderTop: '1px solid #f1f5f9', textAlign: 'right', background: '#f8fafc' }}>
              <button 
                onClick={() => setSelectedLog(null)}
                className="btn btn-primary"
                style={{ padding: '0.6rem 1.5rem', fontWeight: 700 }}
              >
                बंद करें (Close)
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default AdminAuditLogs;
