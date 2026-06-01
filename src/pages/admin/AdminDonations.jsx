import React, { useState, useEffect } from 'react';
import { Check, X, Eye, Phone, MessageSquare } from 'lucide-react';
import { api } from '../../services/api';

const AdminDonations = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDonations = () => {
    setLoading(true);
    api.getDonations()
      .then(data => setDonations(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchDonations(); }, []);

  const handleUpdateStatus = async (id, status) => {
    if (!window.confirm(`Are you sure you want to ${status} this donation?`)) return;
    try {
      await api.updateDonationStatus(id, status);
      fetchDonations();
    } catch (error) {
      alert('Error updating status');
    }
  };

  const statusColor = { Approved: '#166534', Pending: '#92400e', Rejected: '#b91c1c' };
  const statusBg = { Approved: '#dcfce7', Pending: '#fef3c7', Rejected: '#fee2e2' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Donation Management</h1>
        <button onClick={fetchDonations} className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>Refresh</button>
      </div>

      <div className="content-card" style={{ overflowX: 'auto' }}>
        {loading ? (
          <p className="text-light">Loading donations...</p>
        ) : donations.length === 0 ? (
          <p className="text-light">No donations found.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--border-color)', color: 'var(--color-text-light)' }}>
                {['Donor & Contact', 'UTR / ID', 'Amount', 'Category', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '1rem' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {donations.map(d => (
                <tr key={d._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 600 }}>{d.name}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Phone size={12} /> {d.phone}
                      <a href={`https://wa.me/91${d.phone}`} target="_blank" rel="noreferrer" style={{ color: '#25D366' }}><MessageSquare size={12} /></a>
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 700, fontFamily: 'monospace', color: 'var(--color-primary)' }}>{d.utr || 'N/A'}</div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>{new Date(d.createdAt).toLocaleString()}</div>
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 700 }}>₹ {d.amount?.toLocaleString('en-IN')}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ fontSize: '0.85rem', background: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>{d.category}</span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: 600, background: statusBg[d.paymentStatus], color: statusColor[d.paymentStatus] }}>
                      {d.paymentStatus}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {d.paymentStatus === 'Pending' && (
                        <>
                          <button 
                            title="Approve" 
                            onClick={() => handleUpdateStatus(d._id, 'Approved')}
                            style={{ background: '#dcfce7', color: '#166534', border: 'none', padding: '0.4rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
                          >
                            <Check size={18} />
                          </button>
                          <button 
                            title="Reject" 
                            onClick={() => handleUpdateStatus(d._id, 'Rejected')}
                            style={{ background: '#fee2e2', color: '#b91c1c', border: 'none', padding: '0.4rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
                          >
                            <X size={18} />
                          </button>
                        </>
                      )}
                      <button 
                        title="View Details" 
                        className="btn btn-outline" 
                        style={{ padding: '0.4rem', border: 'none' }}
                        onClick={() => alert(`Donor: ${d.name}\nUTR: ${d.utr || 'Not Found'}\nStatus: ${d.paymentStatus}`)}
                      >
                        <Eye size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminDonations;
