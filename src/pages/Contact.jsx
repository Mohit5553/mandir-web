import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, ShieldCheck, Map as MapIcon } from 'lucide-react';
import { api } from '../services/api';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus('');
    try {
      const res = await api.sendContact(form);
      setStatus(res.message || 'Message sent successfully!');
      setForm({ name: '', email: '', message: '' });
    } catch {
      setStatus('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = { 
    width: '100%', 
    padding: '1rem', 
    borderRadius: '12px', 
    border: '1.5px solid #e2e8f0', 
    fontSize: '1rem', 
    outline: 'none', 
    fontFamily: 'inherit',
    transition: 'all 0.3s ease',
    background: '#f8fafc'
  };

  // Google Maps Embed URL for Shree Manvat Baba Mahashiv Mandir Trust
  const mapEmbedUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3550.941938596644!2d81.745494!3d27.126442!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39908de75079a6db%3A0x633fa073998b36e8!2sShree%20Manvat%20Baba%20Mahashiv%20Mandir%20Trust!5e0!3m2!1sen!2sin!4v1718000000000!5m2!1sen!2sin";

  return (
    <div className="contact-page">
      <section className="section bg-primary" style={{ padding: '5rem 0', color: 'white', textAlign: 'center', background: 'linear-gradient(rgba(255, 107, 0, 0.9), rgba(255, 107, 0, 0.9)), url("https://www.transparenttextures.com/patterns/natural-paper.png")' }}>
        <div className="container">
          <h1 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1rem' }}>Connect with Us</h1>
          <p style={{ fontSize: '1.25rem', opacity: 0.9, maxWidth: '600px', margin: '0 auto' }}>
            Have questions about trust activities or pooja timings? We're here to help.
          </p>
        </div>
      </section>

      <section className="section" style={{ background: '#fdfcfb' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '4rem', alignItems: 'start' }}>
          
          <div className="content-card" style={{ padding: '2.5rem', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.05)', border: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                <div style={{ background: 'var(--color-primary-alpha)', color: 'var(--color-primary)', width: '45px', height: '45px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShieldCheck size={24} />
                </div>
                <h3 style={{ margin: 0, fontSize: '1.75rem' }}>Send Us a Message</h3>
            </div>
            
            {status && (
              <div style={{ padding: '1rem', marginBottom: '1.5rem', borderRadius: '12px', background: status.includes('Failed') ? '#fee2e2' : '#dcfce7', color: status.includes('Failed') ? '#b91c1c' : '#166534', fontWeight: 600, textAlign: 'center' }}>
                {status}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569' }}>Your Full Name</label>
                <input type="text" required placeholder="Enter your name" style={inputStyle} value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569' }}>Email Address</label>
                <input type="email" required placeholder="Enter your email" style={inputStyle} value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569' }}>How can we help?</label>
                <textarea rows="5" required placeholder="Tell us more..." style={{...inputStyle, resize: 'none'}} value={form.message} onChange={e => setForm({...form, message: e.target.value})}></textarea>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', borderRadius: '12px', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }} disabled={loading}>
                {loading ? 'Sending...' : <><Send size={20}/> Submit Message</>}
              </button>
            </form>
          </div>

          <div>
            <div className="content-card" style={{ padding: '2.5rem', borderRadius: '24px', border: 'none', background: 'white', marginBottom: '2.5rem', boxShadow: '0 20px 40px rgba(0,0,0,0.05)' }}>
              <h3 style={{ marginBottom: '2rem', fontSize: '1.75rem' }}>Contact Information</h3>
              {[
                { icon: <MapPin size={24} />, title: 'Location', text: 'Shree Manvat Baba Mahashiv Mandir Trust, Bairampur, Colonelganj, Gonda (U.P.) - 271502' },
                { icon: <Phone size={24} />, title: 'Direct Reach', text: '+91 9792939973' },
                { icon: <Mail size={24} />, title: 'Email Info', text: 'mandirtrust@gmail.com' },
                { icon: <Clock size={24} />, title: 'Pooja Timings', text: 'Mon-Sun: 05:00 AM – 09:00 PM' },
              ].map(({ icon, title, text }) => (
                <div key={title} style={{ display: 'flex', gap: '1.25rem', marginBottom: '1.75rem' }}>
                  <div style={{ flexShrink: 0, width: '48px', height: '48px', borderRadius: '50%', background: '#fff5ed', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
                  <div>
                    <h4 style={{ marginBottom: '0.25rem', color: '#1e293b' }}>{title}</h4>
                    <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.5 }}>{text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="content-card" style={{ padding: 0, overflow: 'hidden', height: '320px', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.05)', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '15px', left: '15px', zIndex: 1, background: 'white', padding: '8px 15px', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                 <MapIcon size={16} color="var(--color-primary)"/> View Temple Map
              </div>
              <iframe
                title="Temple Location"
                src={mapEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0, display: 'block' }}
                allowFullScreen
                loading="lazy"
              />
            </div>
          </div>

        </div>
      </section>
    </div>
  );
};

export default Contact;
