import React, { useState, useEffect, useRef } from 'react';
import { Check, X, Eye, Phone, MessageSquare, Share2, Printer, Calendar, Hash, Tag, IndianRupee, ShieldCheck, LayoutDashboard } from 'lucide-react';
import logo from '../../assets/logo.png';
import { api } from '../../services/api';

const AdminDonations = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const receiptRef = useRef();

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
                    <p>Online (UPI)</p>
                </div>
            </div>

            <table class="main-table">
                <thead>
                    <tr>
                        <th>Donor Name</th>
                        <th>Category</th>
                        <th>Transaction ID (UTR)</th>
                        <th style="text-align: right;">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>${selectedDonation.name}</td>
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
                    <p>Email: mandirtrust@gmail.com</p>
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

  return (
    <div className="admin-donations">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Donation Management</h1>
          <p style={{ color: '#64748b' }}>Manage and verify trust contributions</p>
        </div>
        <button onClick={fetchDonations} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Refresh Data
        </button>
      </div>

      <div className="content-card" style={{ overflowX: 'auto', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>Loading contributions...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.5rem' }}>
            <thead>
              <tr style={{ textAlign: 'left', color: '#64748b', fontSize: '0.9rem' }}>
                <th style={{ padding: '1rem' }}>DONOR</th>
                <th style={{ padding: '1rem' }}>UTR / TRANS ID</th>
                <th style={{ padding: '1rem' }}>AMOUNT</th>
                <th style={{ padding: '1rem' }}>STATUS</th>
                <th style={{ padding: '1rem' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {donations.map(d => (
                <tr key={d._id} style={{ background: '#fff' }}>
                  <td style={{ padding: '1.25rem 1rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '1rem' }}>{d.name}</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Phone size={12} /> {d.phone}
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 600, color: 'var(--color-primary)', fontFamily: 'monospace' }}>{d.utr || 'N/A'}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{new Date(d.createdAt).toLocaleDateString()}</div>
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
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button onClick={() => setSelectedDonation(d)} className="btn-icon" style={{ background: '#f8fafc', color: '#64748b' }}><Eye size={18}/></button>
                      {d.paymentStatus === 'Pending' && (
                        <button onClick={() => handleUpdateStatus(d._id, 'Approved')} className="btn-icon" style={{ background: '#dcfce7', color: '#166534' }}><Check size={18}/></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

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
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Transaction ID: {selectedDonation.utr || 'N/A'}</p>
                    </div>
                </div>
                <button onClick={() => setSelectedDonation(null)} style={{ border: 'none', background: '#f1f5f9', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={20}/></button>
            </div>

            <div style={{ padding: '2rem', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
              
              {/* Left Column: Full Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                    
                    {[
                      { label: 'Donor Name', val: selectedDonation.name, icon: <LayoutDashboard size={14}/> },
                      { label: 'Mobile Number', val: selectedDonation.phone, icon: <Phone size={14}/> },
                      { label: 'Donation Date', val: new Date(selectedDonation.createdAt).toLocaleDateString(), icon: <Calendar size={14}/> },
                      { label: 'Category', val: selectedDonation.category, icon: <Tag size={14}/> },
                    ].map(item => (
                      <div key={item.label}>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>{item.icon} {item.label.toUpperCase()}</div>
                        <div style={{ fontWeight: 700, fontSize: '1rem' }}>{item.val}</div>
                      </div>
                    ))}
                 </div>

                 {selectedDonation.screenshot && (
                    <div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '0.75rem' }}>TRANSACTION SCREENSHOT</div>
                        <div style={{ border: '1.5px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden', background: '#000', cursor: 'zoom-in', position: 'relative' }}>
                            <img src={selectedDonation.screenshot} style={{ width: '100%', maxHeight: '350px', objectFit: 'contain' }} onClick={() => window.open(selectedDonation.screenshot)} />
                            <div style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'rgba(0,0,0,0.5)', color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem' }}>Click to view full</div>
                        </div>
                    </div>
                 )}

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
                        { l: 'Contact', v: selectedDonation.phone },
                        { l: 'Category', v: selectedDonation.category },
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
