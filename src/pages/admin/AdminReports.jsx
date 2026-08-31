import { useEffect, useMemo, useState } from 'react';
import {
  Banknote,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  CreditCard,
  Download,
  FileText,
  IndianRupee,
  Newspaper,
  Printer,
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

  if (loading) return <p className="p-4">रिपोर्ट्स लोड हो रही हैं...</p>;
  if (!data) return <p className="p-4">रिपोर्ट्स लोड करने में असमर्थ।</p>;

  const summaryCards = [
    { title: 'कुल दान संग्रह', value: formatCurrency(data.donations.total), note: `${data.donations.approvedCount} स्वीकृत दान प्रविष्टियां`, icon: <CircleDollarSign size={22} />, tone: '#fff7ed' },
    { title: 'नकद (Cash) संग्रह', value: formatCurrency(paymentMap.Cash?.total), note: `${paymentMap.Cash?.count || 0} नकद प्रविष्टियां`, icon: <Banknote size={22} />, tone: '#fef3c7' },
    { title: 'UPI / ऑनलाइन संग्रह', value: formatCurrency(paymentMap.UPI?.total), note: `${paymentMap.UPI?.count || 0} UPI प्रविष्टियां`, icon: <CreditCard size={22} />, tone: '#eff6ff' },
    { title: 'औसत दान राशि', value: formatCurrency(data.donations.average), note: `मुख्य श्रेणी: ${data.donations.topCategory?.name || 'सामान्य दान'}`, icon: <IndianRupee size={22} />, tone: '#f5f3ff' }
  ];

  const activityCards = [
    { label: 'आज (Today)', value: formatCurrency(data.donations.today), icon: <Clock3 size={18} /> },
    { label: 'इस महीने', value: formatCurrency(data.donations.thisMonth), icon: <CalendarDays size={18} /> },
    { label: 'इस वर्ष', value: formatCurrency(data.donations.thisYear), icon: <TrendingUp size={18} /> },
    { label: 'सर्वोच्च दान राशि', value: formatCurrency(data.donations.largest?.amount), icon: <CheckCircle2 size={18} /> }
  ];

  const handleExport80GAuditCSV = () => {
    const headers = ['Receipt No', 'Donor Name', 'PAN Number', 'Address / City', 'Phone', 'Category', 'Date', 'Amount (INR)', 'Payment Mode', '80G Status'];
    const rows = (data.recentDonations || []).map(d => [
      d.receiptId || `REC-${d._id?.slice(-6).toUpperCase()}`,
      `"${d.name || 'अज्ञात दानदाता'}"`,
      d.panNumber || 'N/A',
      `"${d.address || 'करनैलगंज, गोंडा'}"`,
      d.phone || 'N/A',
      `"${d.category || 'सामान्य दान'}"`,
      new Date(d.createdAt).toLocaleDateString('en-IN'),
      d.amount || 0,
      d.paymentMode === 'Cash' ? 'Cash' : 'Online UPI',
      'Eligible Sec 80G Exemption'
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CA_80G_Audit_Report_${new Date().getFullYear()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const maxTrend = Math.max(...(data.breakdowns.monthlyTrend || []).map(item => item.total), 1);

  return (
    <div className="reports-page">
      <div className="page-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>मंदिर वित्तीय रिपोर्ट्स एवं विश्लेषण</h1>
          <p className="text-light">दान अवलोकन, भुगतान माध्यम विवरण एवं मंदिर गतिविधियों का विस्तृत ब्योरा</p>
        </div>
        <button className="btn btn-primary" onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Download size={18} /> रिपोर्ट प्रिंट / PDF
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

      {/* 80G CA Financial Audit Generator Card */}
      <div className="content-card" style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)', border: '1px solid #fed7aa' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <FileText size={22} color="#c2410c" />
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#9a3412', fontWeight: 800 }}>वार्षिक 80G वित्तीय लेखा परीक्षा (CA Financial Audit Generator)</h3>
            </div>
            <p style={{ margin: 0, color: '#c2410c', fontSize: '0.9rem' }}>
              चार्टर्ड अकाउंटेंट (CA) हेतु आय-व्यय स्टेटमेंट, दान दाताओं के पैन (PAN) विवरण एवं धारा 80G कर छूट रिकॉर्ड की 1-क्लिक रिपोर्ट डाउनलोड करें।
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button 
              className="btn btn-primary" 
              onClick={handleExport80GAuditCSV}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(135deg, #FF6000 0%, #ea580c 100%)' }}
            >
              <Download size={18} /> CA 80G Audit Statement (CSV)
            </button>
            <button 
              className="btn" 
              onClick={() => window.print()}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#ffffff', color: '#9a3412', border: '1px solid #fed7aa', fontWeight: 800 }}
            >
              <Printer size={18} /> 80G प्रमाणपत्र एवं विवरण (Print)
            </button>
          </div>
        </div>
      </div>

      <div className="admin-page-grid" style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="content-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.35rem' }}>दान संग्रह प्रदर्शन</h3>
              <p className="text-light" style={{ marginTop: '0.35rem' }}>स्वीकृत दान प्राप्ति एवं संग्रह झलकियां</p>
            </div>
            <div style={{ padding: '0.7rem 0.9rem', borderRadius: '12px', background: '#fff7ed', color: 'var(--color-primary)', fontWeight: 800 }}>
              प्रमुख दानदाता: {data.donations.largest?.donorName || '-'}
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
              <h4 style={{ margin: 0 }}>विगत 6 महीने का रुझान</h4>
              <span className="text-light" style={{ fontSize: '0.85rem', fontWeight: 700 }}>स्वीकृत संग्रह राशि</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', gap: '0.75rem', alignItems: 'end', minHeight: '220px' }}>
              {data.breakdowns.monthlyTrend.map((item) => {
                const monthMap = { Jan: 'जनवरी', Feb: 'फरवरी', Mar: 'मार्च', Apr: 'अप्रैल', May: 'मई', Jun: 'जून', Jul: 'जुलाई', Aug: 'अगस्त', Sep: 'सितंबर', Oct: 'अक्टूबर', Nov: 'नवंबर', Dec: 'दिसंबर' };
                const labelHindi = monthMap[item.label] || item.label;

                return (
                  <div key={item.label} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: '0.6rem', minWidth: 0 }}>
                    <div title={`${labelHindi}: ${formatCurrency(item.total)}`} style={{ height: `${Math.max((item.total / maxTrend) * 150, item.total > 0 ? 16 : 6)}px`, borderRadius: '14px 14px 6px 6px', background: 'linear-gradient(180deg, #ff9d5c 0%, #ff6b00 100%)', boxShadow: '0 10px 18px rgba(255,107,0,0.18)' }} />
                    <div style={{ textAlign: 'center' }}>
                      <strong style={{ display: 'block', fontSize: '0.82rem', color: '#475569' }}>{labelHindi}</strong>
                      <span style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8' }}>{formatCurrency(item.total)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="content-card">
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.35rem' }}>ट्रस्ट गतिविधि अवलोकन</h3>
          <div className="admin-inline-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem', marginBottom: '1.5rem' }}>
            <div style={{ padding: '1rem', borderRadius: '14px', background: '#fff7ed', border: '1px solid #ffedd5' }}>
              <Users size={18} color="#ea580c" />
              <p style={{ margin: '0.6rem 0 0.25rem', color: '#9a3412', fontWeight: 700, fontSize: '0.86rem' }}>कुल उपयोगकर्ता</p>
              <h2 style={{ margin: 0 }}>{data.counts.users}</h2>
            </div>
            <div style={{ padding: '1rem', borderRadius: '14px', background: '#f0fdf4', border: '1px solid #dcfce7' }}>
              <TrendingUp size={18} color="#15803d" />
              <p style={{ margin: '0.6rem 0 0.25rem', color: '#166534', fontWeight: 700, fontSize: '0.86rem' }}>इस माह नए सदस्य</p>
              <h2 style={{ margin: 0 }}>{data.counts.newUsersThisMonth}</h2>
            </div>
            <div style={{ padding: '1rem', borderRadius: '14px', background: '#eff6ff', border: '1px solid #dbeafe' }}>
              <CalendarDays size={18} color="#2563eb" />
              <p style={{ margin: '0.6rem 0 0.25rem', color: '#1d4ed8', fontWeight: 700, fontSize: '0.86rem' }}>मंदिर कार्यक्रम</p>
              <h2 style={{ margin: 0 }}>{data.counts.events}</h2>
            </div>
            <div style={{ padding: '1rem', borderRadius: '14px', background: '#faf5ff', border: '1px solid #f3e8ff' }}>
              <Newspaper size={18} color="#7c3aed" />
              <p style={{ margin: '0.6rem 0 0.25rem', color: '#6d28d9', fontWeight: 700, fontSize: '0.86rem' }}>प्रकाशित समाचार</p>
              <h2 style={{ margin: 0 }}>{data.counts.news}</h2>
            </div>
          </div>

          <div style={{ marginBottom: '1.4rem' }}>
            <h4 style={{ margin: '0 0 0.85rem' }}>दान स्थिति विवरण</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {data.breakdowns.statuses.map((item) => {
                const statusText = item.status === 'Approved' ? 'स्वीकृत (Approved)' : item.status === 'Pending' ? 'लंबित (Pending)' : 'अस्वीकृत (Rejected)';
                return (
                  <div key={item.status} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', padding: '0.85rem 1rem', borderRadius: '12px', background: statusColors[item.status].bg }}>
                    <span style={{ color: statusColors[item.status].text, fontWeight: 800 }}>{statusText}</span>
                    <strong style={{ color: statusColors[item.status].text }}>{item.count}</strong>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h4 style={{ margin: '0 0 0.85rem' }}>सेवा श्रेणी अनुसार दान</h4>
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
            <h3 style={{ margin: 0, fontSize: '1.3rem' }}>हालिया दान प्रविष्टियां</h3>
            <p className="text-light" style={{ marginTop: '0.35rem' }}>नवीनतम प्राप्त दान एवं सत्यापन विवरण</p>
          </div>
          <div style={{ padding: '0.6rem 0.85rem', background: '#fff7ed', borderRadius: '12px', color: '#c2410c', fontWeight: 800 }}>
            लंबित: {data.counts.pendingDonations}
          </div>
        </div>

        <div className="table-scroll">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '0.85rem 0.75rem' }}>दानदाता</th>
                <th style={{ padding: '0.85rem 0.75rem' }}>सेवा श्रेणी</th>
                <th style={{ padding: '0.85rem 0.75rem' }}>माध्यम</th>
                <th style={{ padding: '0.85rem 0.75rem' }}>राशि</th>
                <th style={{ padding: '0.85rem 0.75rem' }}>स्थिति</th>
                <th style={{ padding: '0.85rem 0.75rem' }}>तिथि</th>
              </tr>
            </thead>
            <tbody>
              {data.recentDonations.map((item) => (
                <tr key={item._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.95rem 0.75rem', fontWeight: 700 }}>{item.name}</td>
                  <td style={{ padding: '0.95rem 0.75rem', color: '#475569' }}>{item.category}</td>
                  <td style={{ padding: '0.95rem 0.75rem' }}>{item.paymentMode === 'Cash' ? 'नकद जमा' : 'UPI / ऑनलाइन'}</td>
                  <td style={{ padding: '0.95rem 0.75rem', fontWeight: 800, color: 'var(--color-primary)' }}>{formatCurrency(item.amount)}</td>
                  <td style={{ padding: '0.95rem 0.75rem' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '0.3rem 0.65rem', borderRadius: '999px', background: statusColors[item.paymentStatus].bg, color: statusColors[item.paymentStatus].text, fontSize: '0.82rem', fontWeight: 800 }}>
                      {item.paymentStatus === 'Approved' ? 'स्वीकृत' : item.paymentStatus === 'Pending' ? 'लंबित' : 'अस्वीकृत'}
                    </span>
                  </td>
                  <td style={{ padding: '0.95rem 0.75rem', color: '#64748b' }}>
                    {new Date(item.createdAt).toLocaleDateString('hi-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
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
