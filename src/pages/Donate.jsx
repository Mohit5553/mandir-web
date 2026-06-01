import React, { useState } from 'react';
import { Heart, Building2, Utensils, Sprout, ShieldCheck, QrCode, CheckCircle2, Upload } from 'lucide-react';
import { api } from '../services/api';

const Donate = () => {
  const [step, setStep] = useState(1); 
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    amount: '501',
    category: 'General Donation',
    utr: '',
    screenshot: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm({ ...form, screenshot: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const causes = [
    { title: 'General Donation', id: 'General Donation', icon: <Heart /> },
    { title: 'Construction Fund', id: 'Construction Fund', icon: <Building2 /> },
    { title: 'Annadan', id: 'Annadan', icon: <Utensils /> },
    { title: 'Gau Seva (Cow Service)', id: 'Gau Seva', icon: <Sprout /> }
  ];

  const amounts = ['101', '501', '1001', '5001'];

  const handleNext = (e) => {
    e.preventDefault();
    setStep(2);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.createDonation(form);
      setSuccess(true);
      window.scrollTo(0, 0);
    } catch (error) {
      alert('Error submitting donation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = { width: '100%', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '1rem' };

  if (success) {
    return (
      <div className="container" style={{ padding: '8rem 0', textAlign: 'center' }}>
        <CheckCircle2 size={80} color="#166534" style={{ marginBottom: '1.5rem' }} />
        <h1 style={{ marginBottom: '1rem' }}>Donation Submitted!</h1>
        <p className="text-light" style={{ maxWidth: '600px', margin: '0 auto 2rem', fontSize: '1.1rem' }}>
          Thank you for your contribution. Admin will verify your transaction within 24-48 hours.
        </p>
        <button className="btn btn-primary" onClick={() => window.location.href = '/'}>Back to Home</button>
      </div>
    );
  }

  return (
    <div className="donate-page">
      <section className="section bg-primary" style={{ padding: '4rem 0', color: 'white', textAlign: 'center' }}>
        <div className="container">
          <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '0.5rem' }}>Support the Trust</h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>Helping humanity through your devotion.</p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: '700px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', marginBottom: '3rem' }}>
            <div style={{ textAlign: 'center', opacity: step === 1 ? 1 : 0.5 }}>
              <div style={{ background: 'var(--color-primary)', color: 'white', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.5rem', fontWeight: 700 }}>1</div>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Details</span>
            </div>
            <div style={{ textAlign: 'center', opacity: step === 2 ? 1 : 0.5 }}>
              <div style={{ background: step === 2 ? 'var(--color-primary)' : '#ccc', color: 'white', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.5rem', fontWeight: 700 }}>2</div>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Payment</span>
            </div>
          </div>

          <div className="content-card">
            {step === 1 ? (
              <form onSubmit={handleNext}>
                <h3 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Step 1: Your Details</h3>
                <div style={{ marginBottom: '1.5rem' }}>
                   <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Select Donation Type</label>
                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    {causes.map(c => (
                      <div key={c.id} onClick={() => setForm({...form, category: c.id})} style={{ padding: '0.75rem', border: `2px solid ${form.category === c.id ? 'var(--color-primary)' : 'var(--border-color)'}`, borderRadius: 'var(--radius-sm)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', background: form.category === c.id ? 'var(--color-primary-alpha)' : 'transparent' }}>
                        <div style={{ color: form.category === c.id ? 'var(--color-primary)' : '#666' }}>{c.icon}</div>
                        <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{c.title}</span>
                      </div>
                    ))}
                   </div>
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                   <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Amount (₹)</label>
                   <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                    {amounts.map(amt => (
                      <button key={amt} type="button" onClick={() => setForm({...form, amount: amt})} style={{ flex: 1, padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: `2px solid ${form.amount === amt ? 'var(--color-primary)' : 'var(--border-color)'}`, background: form.amount === amt ? 'var(--color-primary)' : 'transparent', color: form.amount === amt ? 'white' : 'inherit', fontWeight: 600 }}>{amt}</button>
                    ))}
                   </div>
                   <input type="number" placeholder="Other Amount" style={inputStyle} value={form.amount} onChange={(e) => setForm({...form, amount: e.target.value})} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                  <input type="text" placeholder="Name" required style={inputStyle} value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                  <input type="tel" placeholder="Mobile" required style={inputStyle} value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem' }}>Next: Scan & Pay</button>
              </form>
            ) : (
              <form onSubmit={handleSubmit}>
                <button type="button" onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer', marginBottom: '1rem' }}>← Back</button>
                <div style={{ textAlign: 'center', marginBottom: '2rem', background: '#f9f9f9', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ background: 'white', padding: '0.5rem', display: 'inline-block', borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow-sm)', marginBottom: '1rem' }}>
                    <img src="/src/assets/donation_qr.png" alt="Payment QR" style={{ width: '220px', borderRadius: '4px' }} />
                  </div>
                  <p style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--color-primary)' }}>Payable Amount: ₹ {form.amount}</p>
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>UTR / Transaction ID</label>
                  <input type="text" required placeholder="Enter Transaction ID" style={inputStyle} value={form.utr} onChange={e => setForm({...form, utr: e.target.value})} />
                </div>
                <div style={{ marginBottom: '2rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}><Upload size={18}/> Upload Screenshot</label>
                  <input type="file" accept="image/*" onChange={handleFileChange} style={inputStyle} />
                  {form.screenshot && <p style={{ fontSize: '0.8rem', color: 'green', marginTop: '0.5rem' }}>Photo selected ✓</p>}
                </div>
                <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '1rem' }}>{loading ? 'Submitting...' : 'Submit Donation Request'}</button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Donate;
