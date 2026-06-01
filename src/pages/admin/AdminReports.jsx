import React, { useState, useEffect } from 'react';
import { Download, FileText, PieChart, TrendingUp } from 'lucide-react';
import { api } from '../../services/api';

const AdminReports = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDashboardStats()
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, []);

  if (loading || !data) return <p className="p-4">Loading reports...</p>;

  return (
    <div className="reports-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Trust Reports</h1>
          <p className="text-light">Analyze donations and activities.</p>
        </div>
        <button className="btn btn-primary" onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Download size={18} /> Download Summary
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        <div className="content-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ background: 'var(--color-primary-alpha)', p: '0.5rem', borderRadius: '4px' }}><PieChart size={24} color="var(--color-primary)" /></div>
            <h3 style={{ margin: 0 }}>Donation Distribution (Approved)</h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {Object.entries(data.donations).map(([key, val]) => (
              <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{key} Collection</span>
                <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--color-primary)' }}>₹{val}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="content-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ background: 'var(--color-primary-alpha)', p: '0.5rem', borderRadius: '4px' }}><TrendingUp size={24} color="var(--color-primary)" /></div>
            <h3 style={{ margin: 0 }}>Trust Activity Summary</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ padding: '1.5rem', textAlign: 'center', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
              <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Total Devotees</p>
              <h2 style={{ margin: 0 }}>{data.counts.users}</h2>
            </div>
            <div style={{ padding: '1.5rem', textAlign: 'center', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
              <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Active Events</p>
              <h2 style={{ margin: 0 }}>{data.counts.events}</h2>
            </div>
            <div style={{ padding: '1.5rem', textAlign: 'center', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
              <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.5rem' }}>News Published</p>
              <h2 style={{ margin: 0 }}>{data.counts.news}</h2>
            </div>
            <div style={{ padding: '1.5rem', textAlign: 'center', border: '1px solid var(--border-color)', borderRadius: '12px', background: '#fff7ed' }}>
              <p style={{ color: '#9a3412', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Pending Proofs</p>
              <h2 style={{ margin: 0, color: '#c2410c' }}>{data.counts.pendingDonations}</h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
