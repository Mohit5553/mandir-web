import { useState, useEffect } from 'react';
import { Heart, Users, Newspaper, Calendar, Bell } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { api } from '../../services/api';

const Dashboard = () => {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getReports()
      .then(data => setReports(data))
      .catch(() => setReports(null))
      .finally(() => setLoading(false));
  }, []);

  const fmt = (n) => n ? `₹ ${Number(n).toLocaleString('en-IN')}` : '₹ 0';

  const stats = reports ? [
    { label: "Today's Donations", value: fmt(reports.donations?.today), icon: <Heart size={28} /> },
    { label: "Monthly Donations", value: fmt(reports.donations?.thisMonth), icon: <Heart size={28} /> },
    { label: "Yearly Donations", value: fmt(reports.donations?.thisYear), icon: <Heart size={28} /> },
    { label: "Total Donations", value: fmt(reports.donations?.total), icon: <Heart size={28} /> },
    { label: "Registered Users", value: reports.users?.total ?? 0, icon: <Users size={28} /> },
    { label: "Total News Posts", value: reports.news?.total ?? 0, icon: <Newspaper size={28} /> },
    { label: "Total Events", value: reports.events?.total ?? 0, icon: <Calendar size={28} /> },
  ] : [];

  return (
    <div>
      <h1 style={{ marginBottom: '0.5rem' }}>Dashboard Overview</h1>
      <p className="text-light" style={{ marginBottom: '2rem' }}>Welcome back, Super Admin</p>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-light)' }}>Loading reports...</div>
      ) : (
        <>
          <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
            {stats.map((s, i) => (
              <div key={i} className="stat-card">
                <div className="stat-icon">{s.icon}</div>
                <div className="stat-info">
                  <h4>{s.label}</h4>
                  <div className="stat-value">{s.value}</div>
                </div>
              </div>
            ))}
          </div>

          {reports?.donations?.categoryBreakdown && (
            <div className="admin-page-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
              <div className="content-card" style={{ minHeight: '400px' }}>
                <h3 style={{ marginBottom: '1.5rem' }}>Donation by Category</h3>
                <div style={{ height: '300px', width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={Object.entries(reports.donations.categoryBreakdown).map(([name, data]) => ({ name, Total: data.total }))}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="name" stroke="var(--color-text-light)" />
                      <YAxis stroke="var(--color-text-light)" />
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        formatter={(value) => `₹ ${value.toLocaleString('en-IN')}`}
                      />
                      <Legend />
                      <Bar dataKey="Total" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="content-card">
                <h3 style={{ marginBottom: '1.5rem' }}>Quick Actions</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <button className="btn btn-primary" style={{ justifyContent: 'flex-start' }} onClick={() => window.location.href = '/admin/news'}><Newspaper size={18}/> Manage News</button>
                  <button className="btn btn-outline" style={{ justifyContent: 'flex-start' }} onClick={() => window.location.href = '/admin/events'}><Calendar size={18}/> Manage Events</button>
                  <button className="btn btn-outline" style={{ justifyContent: 'flex-start' }} onClick={() => window.location.href = '/admin/notifications'}><Bell size={18}/> Send Notification</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
