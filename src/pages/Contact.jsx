import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
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

  const inputStyle = { width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '1rem', outline: 'none', fontFamily: 'inherit' };

  return (
    <div className="contact-page">
      <section className="section bg-primary" style={{ padding: '4rem 0', color: 'white', textAlign: 'center' }}>
        <div className="container">
          <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem' }}>Contact Us</h1>
          <p style={{ fontSize: '1.25rem', opacity: 0.9, maxWidth: '600px', margin: '0 auto' }}>
            We'd love to hear from you. Reach out for queries, volunteering, or guidance.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
          <div>
            <div className="content-card">
              <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Send Us a Message</h3>
              {status && (
                <div style={{ padding: '0.75rem 1rem', marginBottom: '1rem', borderRadius: 'var(--radius-sm)', background: status.includes('Failed') ? '#fee2e2' : '#dcfce7', color: status.includes('Failed') ? '#b91c1c' : '#166534', fontWeight: 500 }}>
                  {status}
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Your Name</label>
                  <input type="text" required style={inputStyle} value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Your Email</label>
                  <input type="email" required style={inputStyle} value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Message</label>
                  <textarea rows="5" required style={{...inputStyle, resize: 'vertical'}} value={form.message} onChange={e => setForm({...form, message: e.target.value})}></textarea>
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>

          <div>
            <div className="content-card" style={{ marginBottom: '2rem' }}>
              <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Temple Information</h3>
              {[
                { icon: <MapPin size={24} color="var(--color-primary)" />, title: 'Address', text: '123 Temple Road, Holy City District, State - 123456' },
                { icon: <Phone size={24} color="var(--color-primary)" />, title: 'Phone', text: '+91 98765 43210' },
                { icon: <Mail size={24} color="var(--color-primary)" />, title: 'Email', text: 'info@shreemandirtrust.com' },
                { icon: <Clock size={24} color="var(--color-primary)" />, title: 'Timings', text: 'Morning: 05:00 AM – 12:00 PM\nEvening: 04:00 PM – 09:00 PM' },
              ].map(({ icon, title, text }) => (
                <div key={title} style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ flexShrink: 0 }}>{icon}</div>
                  <div>
                    <h4 style={{ marginBottom: '0.25rem' }}>{title}</h4>
                    <p className="text-light" style={{ whiteSpace: 'pre-line' }}>{text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="content-card" style={{ padding: 0, overflow: 'hidden', height: '250px' }}>
              <iframe
                title="Temple Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d241316.6722939663!2d72.71637343750002!3d19.08250570000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c6306644edc1%3A0x5da4ed8f8d648c69!2sMumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1718000000000!5m2!1sen!2sin"
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
