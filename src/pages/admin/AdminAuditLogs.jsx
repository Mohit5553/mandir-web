import { useState, useEffect } from 'react';
import { ScrollText, RefreshCw, Filter, Search } from 'lucide-react';
import { api } from '../../services/api';

const AdminAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

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

  const getActionBadgeColor = (action) => {
    if (action.includes('LOGIN_SUCCESS')) return { bg: '#dcfce7', text: '#166534' };
    if (action.includes('LOGIN_FAILURE')) return { bg: '#fee2e2', text: '#991b1b' };
    if (action.includes('CHANGE') || action.includes('UPDATE')) return { bg: '#e0f2fe', text: '#075985' };
    if (action.includes('CREATION')) return { bg: '#fef3c7', text: '#92400e' };
    if (action.includes('DELETION')) return { bg: '#fef2f2', text: '#991b1b' };
    return { bg: '#f1f5f9', text: '#475569' };
  };

  return (
    <div className="admin-audit-logs">
      <div className="page-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ScrollText color="var(--color-primary)" /> System Audit Logs
          </h1>
          <p className="text-light" style={{ margin: '0.25rem 0 0 0' }}>Security history and admin action trace logs</p>
        </div>
        <button onClick={fetchLogs} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <RefreshCw size={16} /> Refresh Logs
        </button>
      </div>

      <div className="content-card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '240px', display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.5rem 0.75rem' }}>
            <Search size={18} color="#94a3b8" style={{ marginRight: '0.5rem' }} />
            <input
              type="text"
              placeholder="Search user, action, IP or payload..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.9rem' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={16} color="#64748b" />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '0.9rem' }}
            >
              {actionTypes.map(act => (
                <option key={act} value={act}>{act}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="content-card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading audit logs...</div>
        ) : filteredLogs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>No audit logs found matching your filter criteria.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>
                  <th style={{ padding: '0.85rem 1rem' }}>Timestamp</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Action</th>
                  <th style={{ padding: '0.85rem 1rem' }}>User / Email</th>
                  <th style={{ padding: '0.85rem 1rem' }}>IP Address</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => {
                  const badge = getActionBadgeColor(log.action);
                  return (
                    <tr key={log._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap', color: '#64748b' }}>
                        {new Date(log.createdAt).toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>
                        <span style={{
                          padding: '0.25rem 0.6rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          background: badge.bg,
                          color: badge.text
                        }}>
                          {log.action}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: 600 }}>{log.userName || log.userEmail || 'System / Guest'}</div>
                        {log.userName && log.userEmail && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{log.userEmail}</div>}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap', fontFamily: 'monospace', color: '#64748b' }}>
                        {log.ipAddress || '-'}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: '#334155', maxWidth: '300px' }}>
                        <code style={{ fontSize: '0.75rem', background: '#f8fafc', padding: '0.2rem 0.4rem', borderRadius: '4px', wordBreak: 'break-all' }}>
                          {log.details ? JSON.stringify(log.details) : '-'}
                        </code>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAuditLogs;
