import { useMemo, useState, useEffect, useRef } from 'react';
import { Check, X, Eye, Phone, Share2, Printer, Calendar, Tag, ShieldCheck, LayoutDashboard, Search, Plus, Banknote, QrCode, Mail, Upload, Camera, Download } from 'lucide-react';
import logo from '../../assets/logo.png';
import qrCode from '../../assets/donation_qr.jpeg';
import { api } from '../../services/api';
import { hasPermission } from '../../hooks/usePermission';

const donationCategories = ['General Donation', 'Construction Fund', 'Annadan', 'Gau Seva'];
const initialAdminForm = {
  name: '',
  email: '',
  phone: '',
  amount: '',
  category: 'General Donation',
  paymentMode: 'Cash',
  utr: '',
  screenshot: ''
};

const AdminDonations = () => {
  const canCreate = hasPermission('Donations', 'create');
  const canUpdate = hasPermission('Donations', 'update');
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [adminForm, setAdminForm] = useState(initialAdminForm);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('all');
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const receiptRef = useRef();

  const fetchDonations = () => {
    setLoading(true);
    api.getDonations()
      .then(data => setDonations(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchDonations(); }, []);

  const handleUpdateStatus = async (id, status) => {
    if (!window.confirm(`Are you sure you want to ${status} this donation?`)) return;
    try {
      const updatedDonation = await api.updateDonationStatus(id, status);
      fetchDonations();
      if (status === 'Approved') {
        if (updatedDonation?.receiptEmail?.sent) {
          alert('Donation approved and receipt email sent to customer.');
        } else if (updatedDonation?.receiptEmail?.reason) {
          alert(`Donation approved, but receipt email was not sent: ${updatedDonation.receiptEmail.reason}`);
        } else if (updatedDonation?.receiptEmail?.error) {
          alert(`Donation approved, but receipt email failed: ${updatedDonation.receiptEmail.error}`);
        }
      }
    } catch {
      alert('Error updating status');
    }
  };

  const handleSendReceipt = async (donation) => {
    if (!donation.email) {
      alert('This donation has no customer email address.');
      return;
    }

    try {
      const result = await api.sendDonationReceipt(donation._id);
      if (result?.receiptEmail?.sent) {
        alert(`Receipt email sent to ${donation.email}.`);
      } else if (result?.receiptEmail?.reason) {
        alert(`Receipt email was not sent: ${result.receiptEmail.reason}`);
      } else if (result?.receiptEmail?.error) {
        alert(`Receipt email failed: ${result.receiptEmail.error}`);
      } else {
        alert(result?.message || 'Receipt email was not sent.');
      }
    } catch {
      alert('Error sending receipt email.');
    }
  };

  const resetAdminForm = () => {
    setAdminForm(initialAdminForm);
    setShowCreateModal(false);
    closeCamera();
  };

  const handleAdminScreenshotChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setAdminForm((current) => ({ ...current, screenshot: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const openCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Camera is not supported in this browser.');
      return;
    }

    setCameraError('');
    setCameraOpen(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (error) {
      setCameraError(error.name === 'NotAllowedError' ? 'Please allow camera permission and try again.' : 'Unable to open camera. Please use Upload instead.');
      setCameraOpen(false);
      stopCamera();
    }
  };

  const closeCamera = () => {
    stopCamera();
    setCameraOpen(false);
  };

  const captureAdminScreenshot = () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    setAdminForm((current) => ({ ...current, screenshot: canvas.toDataURL('image/jpeg', 0.9) }));
    closeCamera();
  };

  const handleCreateDonation = async (e) => {
    e.preventDefault();

    if (adminForm.paymentMode === 'UPI' && !adminForm.utr.trim() && !adminForm.screenshot) {
      alert('Please enter UTR / Transaction ID or upload/capture payment screenshot for UPI donation.');
      return;
    }

    setCreating(true);
    try {
      const response = await api.createAdminDonation({
        ...adminForm,
        amount: Number(adminForm.amount)
      });

      if (response?.message) {
        alert(response.message);
        return;
      }

      if (response?.receiptEmail?.sent) {
        alert(`Donation saved and receipt email sent to ${response.email}.`);
      } else if (response?.receiptEmail?.reason) {
        alert(`Donation saved, but receipt email was not sent: ${response.receiptEmail.reason}`);
      } else if (response?.receiptEmail?.error) {
        alert(`Donation saved, but receipt email failed: ${response.receiptEmail.error}`);
      } else {
        alert('Donation saved.');
      }

      resetAdminForm();
      fetchDonations();
    } catch {
      alert('Error creating donation');
    } finally {
      setCreating(false);
    }
  };

  const statusColor = { Approved: '#166534', Pending: '#92400e', Rejected: '#b91c1c' };
  const statusBg = { Approved: '#dcfce7', Pending: '#fef3c7', Rejected: '#fee2e2' };

  const categories = useMemo(() => {
    return [...new Set(donations.map((d) => d.category).filter(Boolean))];
  }, [donations]);

  const filteredDonations = useMemo(() => {
    const term = query.trim().toLowerCase();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const last7 = new Date(today);
    last7.setDate(today.getDate() - 7);
    const last30 = new Date(today);
    last30.setDate(today.getDate() - 30);

    return donations.filter((d) => {
      const searchable = `${d.name || ''} ${d.email || ''} ${d.phone || ''} ${d.utr || ''} ${d.category || ''} ${d.paymentMode || ''} ${d.amount || ''}`.toLowerCase();
      const created = new Date(d.createdAt);
      const matchesSearch = !term || searchable.includes(term);
      const matchesStatus = statusFilter === 'All' || d.paymentStatus === statusFilter;
      const matchesCategory = categoryFilter === 'All' || d.category === categoryFilter;
      const matchesDate =
        dateFilter === 'all' ||
        (dateFilter === 'today' && created >= today) ||
        (dateFilter === '7days' && created >= last7) ||
        (dateFilter === '30days' && created >= last30);

      return matchesSearch && matchesStatus && matchesCategory && matchesDate;
    });
  }, [donations, query, statusFilter, categoryFilter, dateFilter]);

  const handlePrint = () => {
    const receiptId = selectedDonation._id.slice(-8).toUpperCase();
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Official Receipt - ${selectedDonation.name}</title>
          <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800&display=swap" rel="stylesheet">
          <style>
            @page { size: portrait; margin: 0; }
            body { 
              font-family: 'Outfit', sans-serif; 
              background: #fff; 
              margin: 0; padding: 0;
              display: flex; justify-content: center;
            }
            .paper {
              width: 210mm; height: 297mm; /* A4 */
              background: white; border: 1px solid #eee;
              padding: 40px; box-sizing: border-box;
              position: relative;
            }
            .header-strip {
              background: #FF6B00; height: 10px; width: 100%;
              position: absolute; top: 0; left: 0;
            }
            .logo-header {
              display: flex; align-items: center; justify-content: space-between;
              border-bottom: 2px solid #FF6B00; padding-bottom: 20px; margin-bottom: 40px;
            }
            .trust-info h1 {
              color: #FF6B00; margin: 0; font-size: 28px; font-weight: 800;
            }
            .trust-info p { margin: 5px 0 0; color: #666; font-size: 14px; }
            
            .receipt-meta {
                display: flex; justify-content: space-between; margin-bottom: 30px;
                background: #fdf2e9; padding: 15px 20px; border-radius: 8px;
            }
            .meta-box h4 { margin: 0; font-size: 11px; color: #FF6B00; text-transform: uppercase; }
            .meta-box p { margin: 5px 0 0; font-weight: 700; font-size: 15px; }

            .main-table {
                width: 100%; border-collapse: collapse; margin-bottom: 40px;
            }
            .main-table th {
                background: #f8fafc; color: #64748b; text-align: left;
                padding: 12px 15px; font-size: 12px; text-transform: uppercase;
                border-bottom: 1px solid #e2e8f0;
            }
            .main-table td {
                padding: 20px 15px; border-bottom: 1px solid #f1f5f9;
                font-size: 15px; font-weight: 600;
            }
            
            .total-section {
                margin-left: auto; width: 300px;
                background: #FF6B00; color: white;
                padding: 20px; border-radius: 12px; text-align: center;
                box-shadow: 0 4px 12px rgba(255, 107, 0, 0.2);
            }
            .total-label { font-size: 12px; font-weight: 600; opacity: 0.8; text-transform: uppercase; }
            .total-amount { font-size: 32px; font-weight: 800; margin-top: 5px; }

            .footer {
                margin-top: 100px; display: flex; justify-content: space-between; align-items: flex-end;
            }
            .legal { font-size: 12px; color: #94a3b8; line-height: 1.6; }
            .signature-box { text-align: center; }
            .signature-line { border-top: 1px solid #000; width: 180px; margin-top: 40px; padding-top: 8px; font-weight: 700; }
            
            .mantra-footer {
                position: absolute; bottom: 40px; left: 0; width: 100%;
                text-align: center; color: #FF6B00; font-weight: 800;
                font-size: 18px; letter-spacing: 2px;
            }
          </style>
        </head>
        <body>
          <div class="paper">
            <div class="header-strip"></div>
            
            <div class="logo-header">
                <div class="trust-info">
                    <h1>SHREE MANVAT BABA MANDIR TRUST</h1>
                    <p>Bairampur, Colonelganj, Gonda (U.P.) - 271502</p>
                </div>
                <img src="${logo}" style="height: 80px; width: 80px; border-radius: 50%;" />
            </div>

            <div class="receipt-meta">
                <div class="meta-box">
                    <h4>Receipt Number</h4>
                    <p># ${receiptId}</p>
                </div>
                <div class="meta-box" style="text-align: center;">
                    <h4>Donation Date</h4>
                    <p>${new Date(selectedDonation.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                </div>
                <div class="meta-box" style="text-align: right;">
                    <h4>Payment Mode</h4>
                    <p>${selectedDonation.paymentMode || 'UPI'}</p>
                </div>
            </div>

            <table class="main-table">
                <thead>
                    <tr>
                        <th>Donor Name</th>
                        <th>Email</th>
                        <th>Category</th>
                        <th>Transaction ID (UTR)</th>
                        <th style="text-align: right;">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>${selectedDonation.name}</td>
                        <td>${selectedDonation.email || 'N/A'}</td>
                        <td>${selectedDonation.category}</td>
                        <td style="font-family: monospace;">${selectedDonation.utr || 'N/A'}</td>
                        <td style="text-align: right; font-weight: 800;">₹ ${selectedDonation.amount}</td>
                    </tr>
                </tbody>
            </table>

            <div class="total-section">
                <div class="total-label">Grand Total Received</div>
                <div class="total-amount">₹ ${selectedDonation.amount}/-</div>
            </div>

            <div class="footer">
                <div class="legal">
                    <p>Contact: +91 9792939973</p>
                    <p>Email: mahashivmandirtrusts@gmail.com</p>
                    <p style="margin-top: 20px;">* This is an electronically generated document.<br/>No hand signature is required for verification.</p>
                </div>
                <div class="signature-box">
                    <div class="signature-line">Authorized Signatory</div>
                </div>
            </div>

            <div class="mantra-footer">जय श्री राम! जय महाकाल!</div>
          </div>
          <script>
            window.onload = () => { setTimeout(() => { window.print(); window.close(); }, 500); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleShareWhatsApp = () => {
    const msg = `🕉️ *Shree Manvat Baba Mandir Trust* %0A🙏 *Donation Receipt* %0A--------------------------%0ADonor: *${selectedDonation.name}*%0AAmount: *₹${selectedDonation.amount}*%0AUTR: *${selectedDonation.utr || 'N/A'}*%0ADate: *${new Date(selectedDonation.createdAt).toLocaleDateString()}*%0A--------------------------%0A_May Mahadev bless you with health and prosperity._`;
    window.open(`https://wa.me/91${selectedDonation.phone}?text=${msg}`, '_blank');
  };

  const exportToCSV = () => {
    if (!filteredDonations.length) {
      alert('No donations to export.');
      return;
    }
    const headers = ['Receipt No', 'Donor Name', 'Amount (INR)', 'Category', 'Payment Mode', 'Payment Status', 'Transaction ID (UTR)', 'Phone', 'Email', 'Date'];
    const rows = filteredDonations.map(d => [
      `SMB-${String(d._id).slice(-8).toUpperCase()}`,
      `"${(d.name || '').replace(/"/g, '""')}"`,
      d.amount,
      `"${d.category}"`,
      d.paymentMode || 'UPI',
      d.paymentStatus,
      `"${d.utr || 'N/A'}"`,
      `"${d.phone || ''}"`,
      `"${d.email || ''}"`,
      `"${new Date(d.createdAt).toLocaleString('en-IN')}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `donations_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="donations-management">
      <div className="page-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.2rem' }}>Devotee Donations</h1>
          <p className="text-light">Manage, approve, and track online UPI & cash contributions</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {canCreate && (
          <button onClick={() => setShowCreateModal(true)} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={18} /> Create Donation
          </button>
          )}
          <button onClick={exportToCSV} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Download size={18} /> Export CSV
          </button>
          <button onClick={fetchDonations} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Refresh Data
          </button>
        </div>
      </div>

      <div className="filter-panel">
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-light)' }} />
          <input
            className="filter-input"
            type="search"
            placeholder="Search donor, email, phone, UTR, category, payment, amount"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>
        <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="All">All status</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
        <select className="filter-select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="All">All categories</option>
          {categories.map((category) => <option key={category} value={category}>{category}</option>)}
        </select>
        <select className="filter-select" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
          <option value="all">Any date</option>
          <option value="today">Today</option>
          <option value="7days">Last 7 days</option>
          <option value="30days">Last 30 days</option>
        </select>
        <button className="btn btn-outline" type="button" onClick={() => { setQuery(''); setStatusFilter('All'); setCategoryFilter('All'); setDateFilter('all'); }}>
          <X size={16} /> Clear
        </button>
        <div className="filter-count">{filteredDonations.length} donations found</div>
      </div>

      <div className="content-card table-scroll" style={{ overflowX: 'auto', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>Loading contributions...</div>
        ) : filteredDonations.length === 0 ? (
          <div className="empty-state">No donations match your search or filters.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.5rem' }}>
            <thead>
              <tr style={{ textAlign: 'left', color: '#64748b', fontSize: '0.9rem' }}>
                <th style={{ padding: '1rem' }}>DONOR</th>
                <th style={{ padding: '1rem' }}>EMAIL</th>
                <th style={{ padding: '1rem' }}>UTR / TRANS ID</th>
                <th style={{ padding: '1rem' }}>AMOUNT</th>
                <th style={{ padding: '1rem' }}>STATUS</th>
                <th style={{ padding: '1rem' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredDonations.map(d => (
                <tr key={d._id} style={{ background: '#fff' }}>
                  <td style={{ padding: '1.25rem 1rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '1rem' }}>{d.name}</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Phone size={12} /> {d.phone}
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 600, color: '#334155', wordBreak: 'break-word' }}>{d.email || 'N/A'}</div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 600, color: 'var(--color-primary)', fontFamily: 'monospace' }}>{d.utr || 'N/A'}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{d.paymentMode || 'UPI'} | {new Date(d.createdAt).toLocaleDateString()}</div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.1rem' }}>₹{d.amount?.toLocaleString('en-IN')}</div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ padding: '0.4rem 1rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700, background: statusBg[d.paymentStatus], color: statusColor[d.paymentStatus], border: `1px solid ${statusColor[d.paymentStatus]}20` }}>
                      {d.paymentStatus}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <button 
                        onClick={() => setSelectedDonation(d)} 
                        title="View Details"
                        style={{ background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '8px', padding: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Eye size={16}/>
                      </button>
                      {d.paymentStatus === 'Pending' && canUpdate && (
                        <>
                          <button 
                            onClick={() => handleUpdateStatus(d._id, 'Approved')} 
                            title="Approve"
                            style={{ background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '0.5rem 0.75rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Check size={14}/> Approve
                          </button>
                          <button 
                            onClick={() => handleUpdateStatus(d._id, 'Rejected')} 
                            title="Reject"
                            style={{ background: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca', borderRadius: '8px', padding: '0.5rem 0.75rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <X size={14}/> Reject
                          </button>
                        </>
                      )}
                      {d.paymentStatus === 'Approved' && (
                        <button
                          onClick={() => handleSendReceipt(d)}
                          title="Send receipt email"
                          style={{ background: '#fff7ed', color: 'var(--color-primary)', border: '1px solid #fed7aa', borderRadius: '8px', padding: '0.5rem 0.75rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                        >
                          <Mail size={14}/> Send Mail
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showCreateModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.72)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1.5rem', backdropFilter: 'blur(4px)' }}>
          <div className="content-card" style={{ width: '100%', maxWidth: '760px', maxHeight: '90vh', overflowY: 'auto', padding: 0, borderRadius: '20px', border: 'none' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#fff', zIndex: 2 }}>
              <div>
                <h3 style={{ margin: 0 }}>Create Donation</h3>
                <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.9rem' }}>Record an offline trust contribution</p>
              </div>
              <button onClick={resetAdminForm} type="button" style={{ border: 'none', background: '#f1f5f9', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateDonation} style={{ padding: '1.5rem', display: 'grid', gap: '1.25rem' }}>
              <div className="admin-inline-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <label style={{ display: 'grid', gap: '0.45rem', fontWeight: 700, color: '#334155' }}>
                  Donor Name
                  <input required className="form-input" value={adminForm.name} onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })} placeholder="Enter donor name" />
                </label>
                <label style={{ display: 'grid', gap: '0.45rem', fontWeight: 700, color: '#334155' }}>
                  Email
                  <input className="form-input" type="email" value={adminForm.email} onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })} placeholder="Enter email address" />
                </label>
              </div>

              <div className="admin-inline-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <label style={{ display: 'grid', gap: '0.45rem', fontWeight: 700, color: '#334155' }}>
                  Mobile Number
                  <input required className="form-input" type="tel" value={adminForm.phone} onChange={(e) => setAdminForm({ ...adminForm, phone: e.target.value })} placeholder="Enter mobile number" />
                </label>
                <label style={{ display: 'grid', gap: '0.45rem', fontWeight: 700, color: '#334155' }}>
                  Amount
                  <input required className="form-input" type="number" min="1" value={adminForm.amount} onChange={(e) => setAdminForm({ ...adminForm, amount: e.target.value })} placeholder="Enter amount" />
                </label>
              </div>

              <div className="admin-inline-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <label style={{ display: 'grid', gap: '0.45rem', fontWeight: 700, color: '#334155' }}>
                  Category
                  <select required className="form-input" value={adminForm.category} onChange={(e) => setAdminForm({ ...adminForm, category: e.target.value })}>
                    {donationCategories.map((category) => <option key={category} value={category}>{category}</option>)}
                  </select>
                </label>
              </div>

              <div>
                <div style={{ fontWeight: 700, color: '#334155', marginBottom: '0.6rem' }}>Payment Mode</div>
                <div className="admin-inline-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  {[
                    { mode: 'Cash', icon: <Banknote size={20} /> },
                    { mode: 'UPI', icon: <QrCode size={20} /> }
                  ].map((item) => (
                    <button
                      key={item.mode}
                      type="button"
                      onClick={() => setAdminForm({
                        ...adminForm,
                        paymentMode: item.mode,
                        utr: item.mode === 'Cash' ? '' : adminForm.utr,
                        screenshot: item.mode === 'Cash' ? '' : adminForm.screenshot
                      })}
                      style={{
                        minHeight: '54px',
                        border: `2px solid ${adminForm.paymentMode === item.mode ? 'var(--color-primary)' : 'var(--border-color)'}`,
                        background: adminForm.paymentMode === item.mode ? 'var(--color-primary-alpha)' : '#fff',
                        color: adminForm.paymentMode === item.mode ? 'var(--color-primary)' : '#334155',
                        borderRadius: '10px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      {item.icon} {item.mode}
                    </button>
                  ))}
                </div>
              </div>

              {adminForm.paymentMode === 'UPI' && (
                <div className="admin-inline-grid" style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '1.25rem', alignItems: 'center', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1rem' }}>
                  <div style={{ background: '#fff', borderRadius: '10px', padding: '0.75rem', display: 'flex', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' }}>
                    <img src={qrCode} alt="Payment QR" style={{ width: '190px', maxWidth: '100%', borderRadius: '6px' }} />
                  </div>
                  <div style={{ display: 'grid', gap: '1rem' }}>
                    <label style={{ display: 'grid', gap: '0.45rem', fontWeight: 700, color: '#334155' }}>
                      UTR / Transaction ID
                      <input className="form-input" value={adminForm.utr} onChange={(e) => setAdminForm({ ...adminForm, utr: e.target.value })} placeholder="Enter UPI transaction ID" />
                    </label>
                    <div>
                      <div style={{ fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>Payment Screenshot</div>
                      <div className="admin-inline-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <label className="form-input" style={{ minHeight: '52px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 700, color: '#334155', background: '#fff' }}>
                          <Upload size={18} /> Upload
                          <input type="file" accept="image/*" onChange={handleAdminScreenshotChange} style={{ display: 'none' }} />
                        </label>
                        <button type="button" onClick={openCamera} className="form-input" style={{ minHeight: '52px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 700, color: 'var(--color-primary)', background: 'var(--color-primary-alpha)', borderColor: 'var(--color-primary)' }}>
                          <Camera size={18} /> Capture
                        </button>
                      </div>
                      <p style={{ margin: '0.5rem 0 0', color: '#64748b', fontSize: '0.85rem' }}>Enter transaction ID or attach payment proof.</p>
                      {cameraError && <p style={{ color: '#b91c1c', fontSize: '0.85rem', fontWeight: 600, marginTop: '0.75rem' }}>{cameraError}</p>}
                      {adminForm.screenshot && (
                        <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#166534', fontSize: '0.85rem', fontWeight: 700 }}>
                          <img src={adminForm.screenshot} alt="Selected payment proof" style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #bbf7d0' }} />
                          Photo selected
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.5rem' }}>
                <button type="button" onClick={resetAdminForm} className="btn btn-outline">Cancel</button>
                <button type="submit" disabled={creating} className="btn btn-primary">
                  {creating ? 'Saving...' : 'Save Donation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {cameraOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.82)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ width: '100%', maxWidth: '560px', background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)' }}>
              <h3 style={{ margin: 0 }}>Capture Screenshot</h3>
              <button type="button" onClick={closeCamera} style={{ width: '36px', height: '36px', borderRadius: '50%', border: 'none', background: '#f1f5f9', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ background: '#020617', aspectRatio: '4 / 3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <video ref={videoRef} playsInline muted style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <div style={{ padding: '1rem 1.25rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button type="button" onClick={closeCamera} className="btn btn-outline">Cancel</button>
              <button type="button" onClick={captureAdminScreenshot} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Camera size={18} /> Take Photo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DETAILED ATTRATIVE MODAL */}
      {selectedDonation && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.8)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1.5rem', backdropFilter: 'blur(4px)' }}>
          <div className="content-card" style={{ maxWidth: '850px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '0', borderRadius: '24px', border: 'none', display: 'flex', flexDirection: 'column' }}>
            
            {/* Modal Header */}
            <div style={{ padding: '1.5rem 2rem', background: '#fff', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: 'var(--color-primary-alpha)', color: 'var(--color-primary)', width: '45px', height: '45px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <h3 style={{ margin: 0 }}>Donation Details</h3>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Payment: {selectedDonation.paymentMode || 'UPI'} | Transaction ID: {selectedDonation.utr || 'N/A'}</p>
                    </div>
                </div>
                <button onClick={() => setSelectedDonation(null)} style={{ border: 'none', background: '#f1f5f9', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={20}/></button>
            </div>

            <div className="admin-modal-grid" style={{ padding: '2rem', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
              
              {/* Left Column: Full Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                 <div className="admin-inline-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                    
                    {[
                      { label: 'Donor Name', val: selectedDonation.name, icon: <LayoutDashboard size={14}/> },
                      { label: 'Email', val: selectedDonation.email || 'N/A', icon: <Mail size={14}/> },
                      { label: 'Mobile Number', val: selectedDonation.phone, icon: <Phone size={14}/> },
                      { label: 'Donation Date', val: new Date(selectedDonation.createdAt).toLocaleDateString(), icon: <Calendar size={14}/> },
                      { label: 'Category', val: selectedDonation.category, icon: <Tag size={14}/> },
                      { label: 'Payment Mode', val: selectedDonation.paymentMode || 'UPI', icon: <QrCode size={14}/> },
                    ].map(item => (
                      <div key={item.label}>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>{item.icon} {item.label.toUpperCase()}</div>
                        <div style={{ fontWeight: 700, fontSize: '1rem' }}>{item.val}</div>
                      </div>
                    ))}
                 </div>

                 <div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Tag size={13}/> PAYMENT SCREENSHOT
                    </div>
                    {selectedDonation.screenshot ? (
                      <div 
                        onClick={() => window.open(selectedDonation.screenshot)} 
                        style={{ border: '2px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden', background: '#000', cursor: 'zoom-in', position: 'relative' }}>
                        <img 
                          src={selectedDonation.screenshot} 
                          style={{ width: '100%', maxHeight: '280px', objectFit: 'contain', display: 'block' }} 
                          alt="Payment Proof"
                        />
                        <div style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'rgba(0,0,0,0.6)', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 600 }}>
                          🔍 Click to Zoom
                        </div>
                      </div>
                    ) : (
                      <div style={{ 
                        border: '2px dashed #e2e8f0', borderRadius: '16px', 
                        padding: '3rem 1rem', textAlign: 'center',
                        background: '#f8fafc', color: '#94a3b8'
                      }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📷</div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem' }}>No Screenshot Uploaded</div>
                        <div style={{ fontSize: '0.8rem' }}>Donor did not attach a payment proof</div>
                      </div>
                    )}
                 </div>

                 <div style={{ marginTop: 'auto', display: 'flex', gap: '1rem' }}>
                    {selectedDonation.paymentStatus === 'Pending' && (
                        <button onClick={() => { handleUpdateStatus(selectedDonation._id, 'Approved'); setSelectedDonation(null); }} className="btn btn-primary" style={{ flex: 1, padding: '1rem' }}>Approve Donation</button>
                    )}
                 </div>
              </div>

              {/* Right Column: Receipt Template View */}
              <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '20px', display: 'flex', flexDirection: 'column' }}>
                 <div ref={receiptRef} className="receipt-preview" style={{ background: 'white', border: '2px solid #FF6B00', padding: '25px', borderRadius: '16px', flexGrow: 1 }}>
                    <div className="header" style={{ textAlign: 'center', borderBottom: '2px solid #fff5ed', paddingBottom: '15px', marginBottom: '15px' }}>
                        <img src={logo} style={{ height: '60px', width: '60px', borderRadius: '50%', marginBottom: '5px' }} />
                        <div className="title" style={{ color: '#FF6B00', fontWeight: 800, fontSize: '16px', letterSpacing: '1px' }}>SHREE MANVAT BABA MANDIR TRUST</div>
                        <div style={{ fontSize: '10px', color: '#94a3b8' }}>RECEIPT NO: {selectedDonation._id.slice(-8).toUpperCase()}</div>
                    </div>

                    {[
                        { l: 'Donor', v: selectedDonation.name },
                        { l: 'Email', v: selectedDonation.email || 'N/A' },
                        { l: 'Contact', v: selectedDonation.phone },
                        { l: 'Category', v: selectedDonation.category },
                        { l: 'Payment', v: selectedDonation.paymentMode || 'UPI' },
                        { l: 'Trans ID', v: selectedDonation.utr || 'N/A' },
                        { l: 'Date', v: new Date(selectedDonation.createdAt).toLocaleDateString() },
                    ].map(row => (
                        <div key={row.l} className="row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', borderBottom: '1px dashed #f1f5f9', paddingBottom: '6px' }}>
                            <span className="label" style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700 }}>{row.l}</span>
                            <span className="value" style={{ fontSize: '11px', fontWeight: 700 }}>{row.v}</span>
                        </div>
                    ))}

                    <div className="amount-box" style={{ background: '#fff5ed', padding: '15px', borderRadius: '12px', textAlign: 'center', marginTop: '20px', border: '1px solid #FF6B0020' }}>
                        <div style={{ fontSize: '11px', color: '#FF6B00', fontWeight: 700 }}>AMOUNT RECEIVED</div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FF6B00' }}>₹{selectedDonation.amount}</div>
                    </div>

                    <div className="footer" style={{ textAlign: 'center', marginTop: '20px', fontSize: '11px', color: '#FF6B00', fontWeight: 700 }}>
                        जय श्री राम! जय महाकाल!
                    </div>
                 </div>

                 <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    <button onClick={handlePrint} className="btn" style={{ background: 'var(--color-primary)', color: 'white', border: 'none', padding: '0.85rem', borderRadius: 'var(--radius-md)', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <Printer size={18}/> Print / Download PDF
                    </button>
                    <button onClick={handleShareWhatsApp} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#166534', borderColor: '#25D366', background: '#dcfce730' }}>
                        <Share2 size={18}/> Share Receipt on WhatsApp
                    </button>
                 </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDonations;
