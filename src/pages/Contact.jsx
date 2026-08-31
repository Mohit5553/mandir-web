import { useState } from 'react';
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
      setStatus(res.message || 'आपका संदेश सफलता पूर्वक भेज दिया गया है!');
      setForm({ name: '', email: '', message: '' });
    } catch {
      setStatus('संदेश भेजने में त्रुटि हुई। कृपया पुनः प्रयास करें।');
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
  const mapEmbedUrl = "https://maps.google.com/maps?q=27.1941132,81.6734072&hl=hi&z=17&output=embed";

  return (
    <div className="contact-page">
      <section className="section bg-primary" style={{ padding: '2rem 0', color: 'white', textAlign: 'center', background: 'linear-gradient(rgba(255, 107, 0, 0.9), rgba(255, 107, 0, 0.9)), url("https://www.transparenttextures.com/patterns/natural-paper.png")' }}>
        <div className="container">
          <h1 style={{ fontSize: '2.1rem', fontWeight: 800, marginBottom: '0.4rem' }}>हमसे संपर्क करें</h1>
          <p style={{ fontSize: '1rem', opacity: 0.95, maxWidth: '650px', margin: '0 auto', lineHeight: 1.4 }}>
            ट्रस्ट की गतिविधियों, दान अथवा पूजा-आरती के विषय में प्रश्न हैं? हम आपकी सहायता के लिए सदैव तत्पर हैं।
          </p>
        </div>
      </section>

      <section className="section" style={{ background: '#fdfcfb' }}>
        <div className="container responsive-two-col" style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '4rem', alignItems: 'start' }}>
          
          <div className="content-card" style={{ padding: '2.5rem', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.05)', border: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                <div style={{ background: 'var(--color-primary-alpha)', color: 'var(--color-primary)', width: '45px', height: '45px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShieldCheck size={24} />
                </div>
                <h3 style={{ margin: 0, fontSize: '1.75rem' }}>हमें संदेश भेजें</h3>
            </div>
            
            {status && (
              <div style={{ padding: '1rem', marginBottom: '1.5rem', borderRadius: '12px', background: status.includes('त्रुटि') || status.includes('Failed') ? '#fee2e2' : '#dcfce7', color: status.includes('त्रुटि') || status.includes('Failed') ? '#b91c1c' : '#166534', fontWeight: 600, textAlign: 'center' }}>
                {status}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569' }}>आपका पूरा नाम *</label>
                <input type="text" required placeholder="अपना पूरा नाम दर्ज करें" style={inputStyle} value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569' }}>ई-मेल आईडी *</label>
                <input type="email" required placeholder="अपनी ई-मेल आईडी दर्ज करें" style={inputStyle} value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569' }}>आप क्या पूछना या बताना चाहते हैं? *</label>
                <textarea rows="5" required placeholder="अपना संदेश संक्षेप में विस्तार से लिखें..." style={{...inputStyle, resize: 'none'}} value={form.message} onChange={e => setForm({...form, message: e.target.value})}></textarea>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', borderRadius: '12px', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }} disabled={loading}>
                {loading ? 'भेजा जा रहा है...' : <><Send size={20}/> संदेश जमा करें</>}
              </button>
            </form>
          </div>

          <div>
            <div className="content-card" style={{ padding: '2.5rem', borderRadius: '24px', border: 'none', background: 'white', marginBottom: '2.5rem', boxShadow: '0 20px 40px rgba(0,0,0,0.05)' }}>
              <h3 style={{ marginBottom: '2rem', fontSize: '1.75rem' }}>संपर्क जानकारी</h3>
              {[
                { icon: <MapPin size={24} />, title: 'मंदिर स्थान', text: 'श्री मन्वत बाबा महाशिव मंदिर ट्रस्ट, बैरमपुर, करनैलगंज, गोंडा (उ.प्र.) - 271502' },
                { icon: <Phone size={24} />, title: 'सीधा संपर्क सूत्र', text: '+91 9792939973' },
                { icon: <Mail size={24} />, title: 'ई-मेल पता', text: 'mahashivmandirtrusts@gmail.com' },
                { icon: <Clock size={24} />, title: 'मंदिर खुलने का समय', text: 'सोमवार - रविवार: प्रातः 05:00 से रात्रि 09:00 तक' },
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
                 <MapIcon size={16} color="var(--color-primary)"/> मंदिर मानचित्र देखें
              </div>
              <iframe
                title="मंदिर स्थान मानचित्र"
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
