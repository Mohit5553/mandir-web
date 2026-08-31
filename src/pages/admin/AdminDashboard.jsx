import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart, Users, Newspaper, Calendar, TrendingUp,
  Clock, ShieldAlert, DollarSign, Activity, RefreshCw, CheckCircle2,
  Sparkles, Eye, HandHeart, PlusCircle, FileSpreadsheet,
  Award, BarChart3, Database, Server, Mail, Video, Star,
  Radio, ArrowRight, ShieldCheck, Image as ImageIcon, MessageSquare,
  Trophy, CreditCard, PieChart, Printer, Download, UserCheck, AlertCircle
} from 'lucide-react';
import { api } from '../../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    api.getDashboardStats()
      .then(data => {
        setStats(data);
        setLoading(false);
        setRefreshing(false);
      })
      .catch(err => {
        console.error('Error fetching dashboard stats:', err);
        setLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'सुप्रभात';
    if (hour < 17) return 'शुभ दोपहर';
    return 'शुभ संध्या';
  };

  const user = JSON.parse(localStorage.getItem('adminUser') || '{}');

  const handleExportCSV = () => {
    api.getDonations()
      .then(data => {
        const donations = data.donations || data || [];
        if (!donations.length) {
          alert('निर्यात के लिए कोई दान डेटा उपलब्ध नहीं है।');
          return;
        }
        const headers = ['Receipt No', 'Donor Name', 'Amount', 'Category', 'Payment Method', 'UTR', 'Status', 'Date'];
        const rows = donations.map(d => [
          d.receiptNo || '',
          `"${d.donorName || ''}"`,
          d.amount,
          `"${d.category || ''}"`,
          d.paymentMethod || 'Online',
          d.utr || '',
          d.paymentStatus || 'Approved',
          new Date(d.createdAt).toLocaleDateString('hi-IN')
        ]);
        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `Mandir_Donations_Report_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch(err => alert('CSV रिपोर्ट डाउनलोड करने में त्रुटि: ' + err.message));
  };

  if (loading || !stats) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1rem' }}>
        <RefreshCw className="spin" size={36} color="var(--color-primary)" />
        <p style={{ color: '#64748b', fontWeight: 600 }}>डैशबोर्ड आंकड़े लोड हो रहे हैं...</p>
      </div>
    );
  }

  // Calculate total category amount for percentage distribution
  const totalCategorySum = (stats.categories || []).reduce((acc, c) => acc + c.amount, 0) || 1;

  // Max amount in monthly trends for bar scaling
  const maxTrendAmount = Math.max(...(stats.monthlyTrends || []).map(t => t.amount), 1);

  // Total payment methods sum
  const totalPaymentSum = (stats.paymentMethods || []).reduce((acc, p) => acc + p.amount, 0) || 1;

  return (
    <div className="dashboard-container" style={{ paddingBottom: '3rem' }}>

      {/* ── 1. Top Executive Welcome Banner (Ultra Compact Height) ────── */}
      <div style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        borderRadius: '12px',
        padding: '1rem 1.35rem',
        color: 'white',
        marginBottom: '1.25rem',
        boxShadow: '0 4px 16px rgba(15, 23, 42, 0.12)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', right: '-40px', top: '-40px', width: '180px', height: '180px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,107,0,0.25) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.85rem', position: 'relative', zIndex: 1 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.15rem 0.55rem', background: 'rgba(255, 107, 0, 0.15)', border: '1px solid rgba(255, 107, 0, 0.3)', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 700, color: '#ff8533', marginBottom: '0.35rem' }}>
              <Sparkles size={12} /> मंदिर प्रबंधन डैशबोर्ड
            </div>
            <h1 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0 0 0.15rem 0', letterSpacing: '-0.3px' }}>
              {getTimeGreeting()}, {user.name || 'प्रशासक'}! 👋
            </h1>
            <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.82rem' }}>
              श्री मन्वत बाबा महाशिव मंदिर ट्रस्ट की वास्तविक समय (Real-time) रिपोर्ट।
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <button
              onClick={handleExportCSV}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.4rem 0.85rem',
                borderRadius: '8px',
                background: '#ea580c',
                color: 'white',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(234, 88, 12, 0.3)',
                transition: 'all 0.2s'
              }}
            >
              <Download size={14} /> CSV रिपोर्ट डाउनलोड करें
            </button>

            <button
              onClick={() => fetchStats(true)}
              disabled={refreshing}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.4rem 0.85rem',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: 'white',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer',
                backdropFilter: 'blur(8px)',
                transition: 'all 0.2s'
              }}
            >
              <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
              {refreshing ? 'अपडेट हो रहा है...' : 'रीफ्रेश'}
            </button>
          </div>
        </div>
      </div>

      {/* ── 2. Action Required Moderation Queue Banner ───────────────── */}
      {((stats?.counts?.pendingDonations || 0) > 0 || (stats?.counts?.pendingReviews || 0) > 0) && (
        <div style={{
          background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
          border: '1px solid #fed7aa',
          borderRadius: '12px',
          padding: '0.9rem 1.35rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ background: '#ea580c', color: 'white', padding: '0.55rem', borderRadius: '10px', display: 'flex' }}>
              <ShieldAlert size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 800, color: '#9a3412', fontSize: '0.92rem' }}>
                सत्यापन के लिए लंबित आवेदन
              </div>
              <div style={{ color: '#c2410c', fontSize: '0.8rem' }}>
                {stats?.counts?.pendingDonations || 0} दान रसीद सत्यापन लंबित हैं • {stats?.counts?.pendingReviews || 0} समीक्षाएं स्वीकृति की प्रतीक्षा में हैं।
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.65rem' }}>
            {(stats?.counts?.pendingDonations || 0) > 0 && (
              <Link to="/admin/donations" className="btn btn-primary" style={{ textDecoration: 'none', padding: '0.45rem 0.95rem', fontSize: '0.82rem', fontWeight: 700 }}>
                दान सत्यापन करें →
              </Link>
            )}
          </div>
        </div>
      )}

      {/* ── 3. Primary Financial KPI Cards ──────────────────────────── */}
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#334155', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <DollarSign size={18} color="var(--color-primary)" /> वित्तीय संग्रह एवं दान विवरण
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div style={{ background: 'white', borderRadius: '14px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
            <div>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>आज का कुल दान</span>
              <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', margin: '0.2rem 0 0 0' }}>
                ₹{stats.donations.today.toLocaleString('hi-IN')}
              </h2>
            </div>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(255, 107, 0, 0.1)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <CheckCircle2 size={13} /> आज का लाइव संग्रह
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '14px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
            <div>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>इस महीने का दान</span>
              <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', margin: '0.2rem 0 0 0' }}>
                ₹{stats.donations.monthly.toLocaleString('hi-IN')}
              </h2>
            </div>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Heart size={20} />
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 600 }}>
            वर्तमान माह की कुल प्राप्ति
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '14px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
            <div>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>इस वर्ष का कुल दान</span>
              <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', margin: '0.2rem 0 0 0' }}>
                ₹{stats.donations.yearly.toLocaleString('hi-IN')}
              </h2>
            </div>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Award size={20} />
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>
            वार्षिक कुल दान राशि
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '14px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
            <div>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>कुल ऐतिहासिक दान</span>
              <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', margin: '0.2rem 0 0 0' }}>
                ₹{stats.donations.total.toLocaleString('hi-IN')}
              </h2>
            </div>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#faf5ff', color: '#9333ea', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={20} />
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#9333ea', fontWeight: 600 }}>
            ट्रस्ट का कुल सर्वकालीन कोष
          </div>
        </div>
      </div>

      {/* ── 4. System & Cloud Infrastructure Monitor ────────────────── */}
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#334155', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Server size={18} color="var(--color-primary)" /> प्रणाली एवं क्लाउड सुरक्षा स्थिति
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        <div style={{ background: '#f8fafc', borderRadius: '14px', padding: '1.1rem 1.25rem', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <Database size={22} color="#16a34a" />
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>MongoDB एटलास डेटाबेस</div>
            <div style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a' }} /> डेटाबेस ऑनलाइन व सुरक्षित
            </div>
          </div>
        </div>

        <div style={{ background: '#f8fafc', borderRadius: '14px', padding: '1.1rem 1.25rem', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <ShieldCheck size={22} color="#2563eb" />
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>JWT सुरक्षा मानक</div>
            <div style={{ fontSize: '0.72rem', color: '#2563eb', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2563eb' }} /> टोकन प्रमाणीकरण सक्रिय
            </div>
          </div>
        </div>

        <div style={{ background: '#f8fafc', borderRadius: '14px', padding: '1.1rem 1.25rem', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <Mail size={22} color="#ea580c" />
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>जीमेल रसीद इंजन</div>
            <div style={{ fontSize: '0.72rem', color: '#ea580c', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ea580c' }} /> PDF 80G रसीद स्वचालन
            </div>
          </div>
        </div>

        <div style={{ background: '#f8fafc', borderRadius: '14px', padding: '1.1rem 1.25rem', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <Radio size={22} color={stats.counts.isLiveNow ? '#22c55e' : '#94a3b8'} />
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>लाइव स्ट्रीम फ़ीड</div>
            <div style={{ fontSize: '0.72rem', color: stats.counts.isLiveNow ? '#22c55e' : '#64748b', fontWeight: 700 }}>
              {stats.counts.isLiveNow ? '🟢 लाइव प्रसारण चालू है' : '⚪ प्रसारण स्टैंडबाय पर है'}
            </div>
          </div>
        </div>
      </div>

      {/* ── 5. Operational Metrics Symmetrical 8-Card Grid ───────────── */}
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#334155', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Activity size={18} color="var(--color-primary)" /> कार्यप्रणाली एवं सेवा आंकड़े
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        <Link to="/admin/users" style={{ textDecoration: 'none' }}>
          <div style={{ background: 'white', borderRadius: '14px', padding: '1.2rem', border: '1px solid #e2e8f0', transition: 'all 0.2s', cursor: 'pointer' }} className="card-hover">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{ background: '#f1f5f9', color: '#475569', padding: '0.65rem', borderRadius: '10px', display: 'flex' }}>
                <Users size={20} />
              </div>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>{stats.counts.users}</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>प्रशासक / उपयोगकर्ता</div>
              </div>
            </div>
          </div>
        </Link>

        <Link to="/admin/volunteers" style={{ textDecoration: 'none' }}>
          <div style={{ background: 'white', borderRadius: '14px', padding: '1.2rem', border: '1px solid #e2e8f0', transition: 'all 0.2s', cursor: 'pointer' }} className="card-hover">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{ background: '#ecfdf5', color: '#059669', padding: '0.65rem', borderRadius: '10px', display: 'flex' }}>
                <HandHeart size={20} />
              </div>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>{stats.counts.volunteers || 0}</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>पंजीकृत स्वयंसेवक</div>
              </div>
            </div>
          </div>
        </Link>

        <Link to="/admin/trust-management" style={{ textDecoration: 'none' }}>
          <div style={{ background: 'white', borderRadius: '14px', padding: '1.2rem', border: '1px solid #e2e8f0', transition: 'all 0.2s', cursor: 'pointer' }} className="card-hover">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{ background: '#fff7ed', color: '#ea580c', padding: '0.65rem', borderRadius: '10px', display: 'flex' }}>
                <Award size={20} />
              </div>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>{stats.counts.trustMembers || 0}</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>ट्रस्टी एवं पदाधिकारी</div>
              </div>
            </div>
          </div>
        </Link>

        <Link to="/admin/contact" style={{ textDecoration: 'none' }}>
          <div style={{ background: 'white', borderRadius: '14px', padding: '1.2rem', border: '1px solid #e2e8f0', transition: 'all 0.2s', cursor: 'pointer' }} className="card-hover">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{ background: '#eff6ff', color: '#2563eb', padding: '0.65rem', borderRadius: '10px', display: 'flex' }}>
                <MessageSquare size={20} />
              </div>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>{stats.counts.contacts || 0}</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>संपर्क संदेश</div>
              </div>
            </div>
          </div>
        </Link>

        <Link to="/admin/news" style={{ textDecoration: 'none' }}>
          <div style={{ background: 'white', borderRadius: '14px', padding: '1.2rem', border: '1px solid #e2e8f0', transition: 'all 0.2s', cursor: 'pointer' }} className="card-hover">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{ background: '#fff7ed', color: '#ea580c', padding: '0.65rem', borderRadius: '10px', display: 'flex' }}>
                <Newspaper size={20} />
              </div>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>{stats.counts.news || 0}</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>प्रकाशित समाचार</div>
              </div>
            </div>
          </div>
        </Link>

        <Link to="/admin/events" style={{ textDecoration: 'none' }}>
          <div style={{ background: 'white', borderRadius: '14px', padding: '1.2rem', border: '1px solid #e2e8f0', transition: 'all 0.2s', cursor: 'pointer' }} className="card-hover">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{ background: '#fdf4ff', color: '#c026d3', padding: '0.65rem', borderRadius: '10px', display: 'flex' }}>
                <Calendar size={20} />
              </div>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>{stats.counts.events || 0}</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>मंदिर कार्यक्रम</div>
              </div>
            </div>
          </div>
        </Link>

        <Link to="/admin/gallery" style={{ textDecoration: 'none' }}>
          <div style={{ background: 'white', borderRadius: '14px', padding: '1.2rem', border: '1px solid #e2e8f0', transition: 'all 0.2s', cursor: 'pointer' }} className="card-hover">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{ background: '#faf5ff', color: '#9333ea', padding: '0.65rem', borderRadius: '10px', display: 'flex' }}>
                <ImageIcon size={20} />
              </div>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>{stats.counts.gallery || 0}</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>गैलरी मीडिया</div>
              </div>
            </div>
          </div>
        </Link>

        <div style={{ background: 'white', borderRadius: '14px', padding: '1.2rem', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ background: '#f0f9ff', color: '#0284c7', padding: '0.65rem', borderRadius: '10px', display: 'flex' }}>
              <Eye size={20} />
            </div>
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>{stats.counts.visitors || 0}</div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>कुल वेबसाइट आगंतुक</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 6. Advanced Financial Charts: 6-Month Trend & Payment Methods ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>

        {/* 6-Month Trend Bar Graph */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '1.75rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BarChart3 size={18} color="var(--color-primary)" /> 6-माह दान संग्रह ग्राफ़
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.2rem 0 0 0' }}>मासिक स्वीकृत दान का तुलनात्मक विवरण</p>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', background: 'var(--color-primary-alpha)', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>
              भारतीय रुपये (₹)
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '180px', paddingTop: '1rem', borderBottom: '1px solid #e2e8f0', gap: '0.75rem' }}>
            {(stats.monthlyTrends || []).map((trend, idx) => {
              const heightPercent = Math.max((trend.amount / maxTrendAmount) * 100, 8);
              return (
                <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
                    {trend.amount > 0 ? `₹${(trend.amount / 1000).toFixed(1)}k` : '₹0'}
                  </div>
                  <div
                    title={`${trend.label}: ₹${trend.amount.toLocaleString('hi-IN')} (${trend.count} दान)`}
                    style={{
                      width: '100%',
                      maxWidth: '38px',
                      height: `${heightPercent}%`,
                      background: idx === (stats.monthlyTrends.length - 1)
                        ? 'linear-gradient(180deg, #FF6B00 0%, #FF8533 100%)'
                        : 'linear-gradient(180deg, #94a3b8 0%, #cbd5e1 100%)',
                      borderRadius: '6px 6px 0 0',
                      transition: 'all 0.3s ease',
                      boxShadow: idx === (stats.monthlyTrends.length - 1) ? '0 4px 12px rgba(255,107,0,0.3)' : 'none'
                    }}
                  />
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginTop: '0.5rem' }}>
                    {(() => {
                      const monthMap = { Jan: 'जनवरी', Feb: 'फरवरी', Mar: 'मार्च', Apr: 'अप्रैल', May: 'मई', Jun: 'जून', Jul: 'जुलाई', Aug: 'अगस्त', Sep: 'सितंबर', Oct: 'अक्टूबर', Nov: 'नवंबर', Dec: 'दिसंबर' };
                      return monthMap[trend.label] || trend.label;
                    })()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Methods Distribution Widget */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '1.75rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CreditCard size={18} color="var(--color-primary)" /> भुगतान माध्यमों का विवरण
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.2rem 0 0 0' }}>भुगतान चैनल विवरण (UPI बनाम बैंक UTR)</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            {(stats.paymentMethods || []).map((pm, idx) => {
              const percent = Math.round((pm.amount / totalPaymentSum) * 100) || 0;
              const nameHindi = pm.name === 'Online (UPI/QR)' ? 'ऑनलाइन (UPI / QR स्कैन)' :
                                pm.name === 'Bank Transfer / UTR' ? 'बैंक ट्रांसफर (UTR / IMPS)' :
                                pm.name === 'Direct Cash / Counter' ? 'नकद / काउंटर जमा' : pm.name;

              return (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem', fontSize: '0.88rem' }}>
                    <span style={{ fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: pm.color }} /> {nameHindi}
                    </span>
                    <span style={{ fontWeight: 800, color: '#0f172a' }}>
                      ₹{pm.amount.toLocaleString('hi-IN')} <span style={{ color: '#94a3b8', fontSize: '0.78rem', fontWeight: 500 }}>({percent}%)</span>
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${percent}%`,
                        height: '100%',
                        background: pm.color,
                        borderRadius: '9999px',
                        transition: 'width 0.5s ease'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── 7. Top Devotees Leaderboard & Upcoming Events Grid ──────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>

        {/* Top Devotees Leaderboard Widget */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '1.75rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Trophy size={18} color="#eab308" /> प्रमुख दानदाता सूची
            </h3>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#eab308', background: '#fef9c3', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>
              सर्वोच्च दानदाता
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {(!stats.topDonors || stats.topDonors.length === 0) ? (
              <div style={{ color: '#94a3b8', fontSize: '0.85rem', padding: '1rem 0' }}>अभी कोई प्रमुख दान रिकॉर्ड दर्ज नहीं हुआ है।</div>
            ) : (
              stats.topDonors.map((donor, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0.9rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: idx === 0 ? '#fef08a' : idx === 1 ? '#e2e8f0' : '#ffedd5',
                      color: idx === 0 ? '#ca8a04' : idx === 1 ? '#475569' : '#c2410c',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.8rem'
                    }}>
                      #{idx + 1}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1e293b' }}>{donor.donorName || 'गुप्त दानदाता'}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{donor.category}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--color-primary)' }}>₹{donor.amount.toLocaleString('hi-IN')}</div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{new Date(donor.createdAt).toLocaleDateString('hi-IN')}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Temple Events Widget */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '1.75rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={18} color="#c026d3" /> आगामी मंदिर कार्यक्रम
            </h3>
            <Link to="/admin/events" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#c026d3', textDecoration: 'none' }}>
              कार्यक्रम प्रबंधित करें →
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {(!stats.upcomingEvents || stats.upcomingEvents.length === 0) ? (
              <div style={{ color: '#94a3b8', fontSize: '0.85rem', padding: '1rem 0' }}>कोई आगामी कार्यक्रम निर्धारित नहीं है।</div>
            ) : (
              stats.upcomingEvents.map((evt, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0.9rem', background: '#fdf4ff', borderRadius: '10px', border: '1px solid #fae8ff' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ background: '#c026d3', color: 'white', padding: '0.5rem', borderRadius: '8px', display: 'flex' }}>
                      <Calendar size={18} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#701a75' }}>{evt.title}</div>
                      <div style={{ fontSize: '0.75rem', color: '#a21caf' }}>{evt.time || 'पूरे दिन'} • {evt.location || 'मुख्य मंदिर प्रांगण'}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#c026d3' }}>
                    {evt.date ? new Date(evt.date).toLocaleDateString('hi-IN', { month: 'short', day: 'numeric' }) : 'आगामी'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── 8. Live Activity Feed & Executive Quick Actions ────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>

        {/* Audit Activity Logs Feed */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '1.75rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={18} color="var(--color-primary)" /> सुरक्षा एवं ऑडिट गतिविधि लॉग
            </h3>
            <Link to="/admin/audit-logs" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)', textDecoration: 'none' }}>
              ऑडिट लॉग्स देखें →
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {(!stats.recentLogs || stats.recentLogs.length === 0) ? (
              <div style={{ color: '#94a3b8', fontSize: '0.85rem', padding: '1rem 0' }}>अभी तक कोई हालिया गतिविधि लॉग दर्ज नहीं हुई है।</div>
            ) : (
              stats.recentLogs.map((log, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0.85rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-primary)' }} />
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>{log.action}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>द्वारा: {log.userName || 'सिस्टम'}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>
                    {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Exporters & Admin Console Shortcuts */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '1.75rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PlusCircle size={18} color="var(--color-primary)" /> रिपोर्ट एवं त्वरित शॉर्टकट
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem' }}>
            <button
              onClick={handleExportCSV}
              style={{ padding: '0.9rem', borderRadius: '12px', border: '1px solid #fed7aa', background: '#fff7ed', display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', textAlign: 'left' }}
            >
              <FileSpreadsheet size={20} color="#ea580c" />
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#9a3412' }}>CSV डाउनलोड</div>
                <div style={{ fontSize: '0.7rem', color: '#c2410c' }}>सभी दान डेटा डाउनलोड करें</div>
              </div>
            </button>

            <Link to="/admin/news" style={{ textDecoration: 'none' }}>
              <div style={{ padding: '0.9rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fafafa', display: 'flex', alignItems: 'center', gap: '0.65rem' }} className="card-hover">
                <Newspaper size={18} color="#ea580c" />
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>समाचार प्रकाशित करें</div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>मंदिर की नई जानकारी</div>
                </div>
              </div>
            </Link>

            <Link to="/admin/events" style={{ textDecoration: 'none' }}>
              <div style={{ padding: '0.9rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fafafa', display: 'flex', alignItems: 'center', gap: '0.65rem' }} className="card-hover">
                <Calendar size={18} color="#c026d3" />
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>कार्यक्रम जोड़ें</div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>पूजा-महोत्सव समय सारणी</div>
                </div>
              </div>
            </Link>

            <Link to="/admin/audit-logs" style={{ textDecoration: 'none' }}>
              <div style={{ padding: '0.9rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fafafa', display: 'flex', alignItems: 'center', gap: '0.65rem' }} className="card-hover">
                <Clock size={18} color="#2563eb" />
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>ऑडिट लॉग्स</div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>सुरक्षा व लॉग इतिहास</div>
                </div>
              </div>
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;
