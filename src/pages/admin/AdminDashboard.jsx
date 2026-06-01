import React, { useState, useEffect } from 'react';
import { Heart, Users, Newspaper, Calendar, ArrowUpRight } from 'lucide-react';
import { api } from '../../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = () => {
    setLoading(true);
    api.getDashboardStats()
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => console.error('Error fetching dashboard stats:', err));
  };

  useEffect(() => { fetchStats(); }, []);

  if (loading || !stats) return <div className="p-4">Loading dashboard statistics...</div>;

  const topCards = [
    { title: "Today's Donations", value: `₹${stats.donations.today}`, icon: <Heart color="#FF6B00" />, color: "#FFF0E6" },
    { title: "Monthly Donations", value: `₹${stats.donations.monthly}`, icon: <Heart color="#FF6B00" />, color: "#FFF0E6" },
    { title: "Yearly Donations", value: `₹${stats.donations.yearly}`, icon: <Heart color="#FF6B00" />, color: "#FFF0E6" },
    { title: "Total Donations", value: `₹${stats.donations.total}`, icon: <Heart color="#FF6B00" />, color: "#FFF0E6" },
    { title: "Registered Users", value: stats.counts.users, icon: <Users color="#FF6B00" />, color: "#FFF0E6" },
    { title: "Total News Posts", value: stats.counts.news, icon: <Newspaper color="#FF6B00" />, color: "#FFF0E6" },
    { title: "Total Events", value: stats.counts.events, icon: <Calendar color="#FF6B00" />, color: "#FFF0E6" },
    { title: "Pending Approvals", value: stats.counts.pendingDonations, icon: <ArrowUpRight color="#FF6B00" />, color: "#FFF0E6" }
  ];

  return (
    <div className="dashboard">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.2rem' }}>Dashboard Overview</h1>
          <p className="text-light">Welcome back, Super Admin</p>
        </div>
        <button onClick={fetchStats} className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>Refresh Data</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {topCards.map((card, idx) => (
          <div key={idx} className="content-card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem' }}>
            <div style={{ background: card.color, width: '50px', height: '50px', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {card.icon}
            </div>
            <div>
              <p style={{ color: 'var(--color-text-light)', fontSize: '0.85rem', marginBottom: '0.25rem', fontWeight: 500 }}>{card.title}</p>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>{card.value}</h2>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
        <div className="content-card">
          <h3 style={{ marginBottom: '1.5rem' }}>Donation by Category (INR)</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {stats.categories && stats.categories.map((cat, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '1.2rem 1rem', background: '#fcfcfc', borderBottom: '1px solid #f0f0f0', borderRadius: '8px' }}>
                <span style={{ fontWeight: 600, color: '#444' }}>{cat.name}</span>
                <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                  ₹{cat.amount.toLocaleString('en-IN')} <span style={{ color: '#999', fontSize: '0.8rem', fontWeight: 400 }}>({cat.count})</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="content-card">
          <h3 style={{ marginBottom: '1.5rem' }}>Trust Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
             <div style={{ padding: '1rem', border: '1px solid #f0f0f0', borderRadius: '12px' }}>
                <p style={{ fontSize: '0.9rem', marginBottom: '1rem', color: '#666' }}>You have <strong>{stats.counts.pendingDonations}</strong> donations waiting for your approval.</p>
                <a href="/admin/donations" className="btn btn-primary" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>Go to Approvals</a>
             </div>
             <div style={{ padding: '1rem', border: '1px solid #f0f0f0', borderRadius: '12px' }}>
                <p style={{ fontSize: '0.9rem', marginBottom: '1rem', color: '#666' }}>Post new temple news or organize a religious event.</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <a href="/admin/news" className="btn btn-outline" style={{ textAlign: 'center', textDecoration: 'none', fontSize: '0.85rem' }}>News</a>
                  <a href="/admin/events" className="btn btn-outline" style={{ textAlign: 'center', textDecoration: 'none', fontSize: '0.85rem' }}>Events</a>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
