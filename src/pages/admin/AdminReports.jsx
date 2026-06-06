import { useEffect, useMemo, useState } from 'react';
import {
  Banknote,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  CreditCard,
  Download,
  IndianRupee,
  Newspaper,
  TrendingUp,
  Users
} from 'lucide-react';
import { api } from '../../services/api';

const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

const statusColors = {
  Approved: { bg: '#ecfdf3', text: '#15803d' },
  Pending: { bg: '#fff7ed', text: '#c2410c' },
  Rejected: { bg: '#fef2f2', text: '#b91c1c' }
};

const AdminReports = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getReports()
      .then(response => {
        setData(response?.message ? null : response);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const paymentMap = useMemo(() => {
    const entries = data?.breakdowns?.paymentModes || [];
    return entries.reduce((acc, item) => {
      acc[item.mode] = item;
      return acc;
    }, {});
  }, [data]);

  if (loading) return <p className="p-4">Loading reports...</p>;
  if (!data) return <p className="p-4">Unable to load reports right now.</p>;

  const summaryCards = [
    { title: 'Total Donation', value: formatCurrency(data.donations.total), note: `${data.donations.approvedCount} approved donations`, icon: <CircleDollarSign size={22} />, tone: '#fff7ed' },
    { title: 'Cash Collection', value: formatCurrency(paymentMap.Cash?.total), note: `${paymentMap.Cash?.count || 0} cash entries`, icon: <Banknote size={22} />, tone: '#fef3c7' },
    { title: 'UPI Collection', value: formatCurrency(paymentMap.UPI?.total), note: `${paymentMap.UPI?.count || 0} UPI entries`, icon: <CreditCard size={22} />, tone: '#eff6ff' },
    { title: 'Average Donation', value: formatCurrency(data.donations.average), note: `Top category: ${data.donations.topCategory?.name || 'N/A'}`, icon: <IndianRupee size={22} />, tone: '#f5f3ff' }
  ];

  const activityCards = [
    { label: 'Today', value: formatCurrency(data.donations.today), icon: <Clock3 size={18} /> },
    { label: 'This Month', value: formatCurrency(data.donations.thisMonth), icon: <CalendarDays size={18} /> },
    { label: 'This Year', value: formatCurrency(data.donations.thisYear), icon: <TrendingUp size={18} /> },
    { label: 'Largest Donation', value: formatCurrency(data.donations.largest?.amount), icon: <CheckCircle2 size={18} /> }
  ];

  const maxTrend = Math.max(...(data.breakdowns.monthlyTrend || []).map(item => item.total), 1);

  return (
    <div className="reports-page">
      <div className="page-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Trust Reports</h1>
          <p className="text-light">Donation overview, payment insights, and trust activity in one place.</p>
        </div>
        <button className="btn btn-primary" onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Download size={18} /> Print Report
        </button>
      </div>

      <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {summaryCards.map((card) => (
          <div key={card.title} className="content-card" style={{ padding: '1.35rem', background: `linear-gradient(180deg, #fff 0%, ${card.tone} 100%)` }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'rgba(255,255,255,0.9)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', boxShadow: 'var(--shadow-sm)' }}>
              {card.icon}
            </div>
            <p style={{ color: '#64748b', fontSize: '0.88rem', fontWeight: 700, marginBottom: '0.35rem' }}>{card.title}</p>
            <h2 style={{ margin: 0, fontSize: '1.9rem', lineHeight: 1.15 }}>{card.value}</h2>
            <span style={{ display: 'block', marginTop: '0.6rem', color: '#475569', fontSize: '0.88rem', fontWeight: 600 }}>{card.note}</span>
          </div>
        ))}
      </div>

      <div className="admin-page-grid" style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="content-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.35rem' }}>Donation Performance</h3>
              <p className="text-light" style={{ marginTop: '0.35rem' }}>Approved donation movement and collection highlights.</p>
            </div>
            <div style={{ padding: '0.7rem 0.9rem', borderRadius: '12px', background: '#fff7ed', color: 'var(--color-primary)', fontWeight: 800 }}>
              {data.donations.largest?.donorName || '-'}
            </div>
          </div>

          <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.9rem', marginBottom: '1.5rem' }}>
            {activityCards.map((card) => (
              <div key={card.label} style={{ padding: '1rem', borderRadius: '14px', background: '#f8fafc', border: '1px solid #eef2f7' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '10px', background: '#fff', color: 'var(--color-primary)', marginBottom: '0.7rem' }}>
                  {card.icon}
                </div>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.84rem', fontWeight: 700 }}>{card.label}</p>
                <strong style={{ display: 'block', marginTop: '0.25rem', fontSize: '1.15rem', color: '#0f172a' }}>{card.value}</strong>
              </div>
            ))}
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
              <h4 style={{ margin: 0 }}>Last 6 Months</h4>
              <span className="text-light" style={{ fontSize: '0.85rem', fontWeight: 700 }}>Approved collections</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', gap: '0.75rem', alignItems: 'end', minHeight: '220px' }}>
              {data.breakdowns.monthlyTrend.map((item) => (
                <div key={item.label} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: '0.6rem', minWidth: 0 }}>
                  <div title={`${item.label}: ${formatCurrency(item.total)}`} style={{ height: `${Math.max((item.total / maxTrend) * 150, item.total > 0 ? 16 : 6)}px`, borderRadius: '14px 14px 6px 6px', background: 'linear-gradient(180deg, #ff9d5c 0%, #ff6b00 100%)', boxShadow: '0 10px 18px rgba(255,107,0,0.18)' }} />
                  <div style={{ textAlign: 'center' }}>
                    <strong style={{ display: 'block', fontSize: '0.82rem', color: '#475569' }}>{item.label}</strong>
                    <span style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8' }}>{formatCurrency(item.total)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="content-card">
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.35rem' }}>Trust Activity Snapshot</h3>
          <div className="admin-inline-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem', marginBottom: '1.5rem' }}>
            <div style={{ padding: '1rem', borderRadius: '14px', background: '#fff7ed', border: '1px solid #ffedd5' }}>
              <Users size={18} color="#ea580c" />
              <p style={{ margin: '0.6rem 0 0.25rem', color: '#9a3412', fontWeight: 700, fontSize: '0.86rem' }}>Total Users</p>
              <h2 style={{ margin: 0 }}>{data.counts.users}</h2>
            </div>
            <div style={{ padding: '1rem', borderRadius: '14px', background: '#f0fdf4', border: '1px solid #dcfce7' }}>
              <TrendingUp size={18} color="#15803d" />
              <p style={{ margin: '0.6rem 0 0.25rem', color: '#166534', fontWeight: 700, fontSize: '0.86rem' }}>New This Month</p>
              <h2 style={{ margin: 0 }}>{data.counts.newUsersThisMonth}</h2>
            </div>
            <div style={{ padding: '1rem', borderRadius: '14px', background: '#eff6ff', border: '1px solid #dbeafe' }}>
              <CalendarDays size={18} color="#2563eb" />
              <p style={{ margin: '0.6rem 0 0.25rem', color: '#1d4ed8', fontWeight: 700, fontSize: '0.86rem' }}>Events</p>
              <h2 style={{ margin: 0 }}>{data.counts.events}</h2>
            </div>
            <div style={{ padding: '1rem', borderRadius: '14px', background: '#faf5ff', border: '1px solid #f3e8ff' }}>
              <Newspaper size={18} color="#7c3aed" />
              <p style={{ margin: '0.6rem 0 0.25rem', color: '#6d28d9', fontWeight: 700, fontSize: '0.86rem' }}>News</p>
              <h2 style={{ margin: 0 }}>{data.counts.news}</h2>
            </div>
          </div>

          <div style={{ marginBottom: '1.4rem' }}>
            <h4 style={{ margin: '0 0 0.85rem' }}>Donation Status</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {data.breakdowns.statuses.map((item) => (
                <div key={item.status} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', padding: '0.85rem 1rem', borderRadius: '12px', background: statusColors[item.status].bg }}>
                  <span style={{ color: statusColors[item.status].text, fontWeight: 800 }}>{item.status}</span>
                  <strong style={{ color: statusColors[item.status].text }}>{item.count}</strong>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 style={{ margin: '0 0 0.85rem' }}>Category Breakdown</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {data.breakdowns.categories.map((item) => (
                <div key={item.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.35rem' }}>
                    <span style={{ fontWeight: 700 }}>{item.name}</span>
                    <span style={{ color: 'var(--color-primary)', fontWeight: 800 }}>{formatCurrency(item.total)}</span>
                  </div>
                  <div style={{ height: '10px', borderRadius: '999px', background: '#f1f5f9', overflow: 'hidden' }}>
                    <div style={{ width: `${data.donations.total ? (item.total / data.donations.total) * 100 : 0}%`, height: '100%', borderRadius: '999px', background: 'linear-gradient(90deg, #ffb37a 0%, #ff6b00 100%)' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="content-card">
        <div className="page-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', gap: '1rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.3rem' }}>Recent Donation Activity</h3>
            <p className="text-light" style={{ marginTop: '0.35rem' }}>Most recent donation entries across all statuses.</p>
          </div>
          <div style={{ padding: '0.6rem 0.85rem', background: '#fff7ed', borderRadius: '12px', color: '#c2410c', fontWeight: 800 }}>
            Pending: {data.counts.pendingDonations}
          </div>
        </div>

        <div className="table-scroll">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '0.85rem 0.75rem' }}>Donor</th>
                <th style={{ padding: '0.85rem 0.75rem' }}>Category</th>
                <th style={{ padding: '0.85rem 0.75rem' }}>Mode</th>
                <th style={{ padding: '0.85rem 0.75rem' }}>Amount</th>
                <th style={{ padding: '0.85rem 0.75rem' }}>Status</th>
                <th style={{ padding: '0.85rem 0.75rem' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {data.recentDonations.map((item) => (
                <tr key={item._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.95rem 0.75rem', fontWeight: 700 }}>{item.name}</td>
                  <td style={{ padding: '0.95rem 0.75rem', color: '#475569' }}>{item.category}</td>
                  <td style={{ padding: '0.95rem 0.75rem' }}>{item.paymentMode}</td>
                  <td style={{ padding: '0.95rem 0.75rem', fontWeight: 800, color: 'var(--color-primary)' }}>{formatCurrency(item.amount)}</td>
                  <td style={{ padding: '0.95rem 0.75rem' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '0.3rem 0.65rem', borderRadius: '999px', background: statusColors[item.paymentStatus].bg, color: statusColors[item.paymentStatus].text, fontSize: '0.82rem', fontWeight: 800 }}>
                      {item.paymentStatus}
                    </span>
                  </td>
                  <td style={{ padding: '0.95rem 0.75rem', color: '#64748b' }}>
                    {new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
