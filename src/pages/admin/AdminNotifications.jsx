import { useState, useEffect } from 'react';
import { Send } from 'lucide-react';
import { api } from '../../services/api';

const notificationTypes = [
  { value: 'General', label: 'सामान्य (General)' },
  { value: 'Festival', label: 'त्योहार / पर्व (Festival)' },
  { value: 'Event', label: 'मंदिर कार्यक्रम (Event)' },
  { value: 'Donation Campaign', label: 'दान अभियान (Donation Campaign)' }
];

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [form, setForm] = useState({ title: '', message: '', type: 'General' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState('');

  const fetchNotifications = () => api.getNotifications().then(data => setNotifications(Array.isArray(data) ? data : []));
  useEffect(() => { fetchNotifications(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await api.sendNotification(form);

    if (result?.emailResult?.sent) {
      setSent(`सूचना "${form.title}" सफलतापूर्वक ${result.emailResult.recipientCount} श्रद्धालुओं को ईमेल द्वारा भेज दी गई है।`);
    } else if (result?.emailResult?.reason) {
      setSent(`सूचना सहेजी गई, परंतु ईमेल नहीं भेजा जा सका: ${result.emailResult.reason}`);
    } else if (result?.emailResult?.error) {
      setSent(`सूचना सहेजी गई, परंतु ईमेल भेजने में विफलता हुई: ${result.emailResult.error}`);
    } else {
      setSent(result?.message || `सूचना "${form.title}" सुरक्षित हो गई है।`);
    }

    if (!result?.message?.startsWith('Server error')) {
      setForm({ title: '', message: '', type: 'General' });
      await fetchNotifications();
    }

    setLoading(false);
    setTimeout(() => setSent(''), 6000);
  };

  const inputStyle = { width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '1rem', fontFamily: 'inherit' };

  return (
    <div>
      <div className="page-toolbar" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.4rem' }}>सूचनाएँ (Broadcast Notifications)</h1>
          <p className="text-light">श्रद्धालुओं एवं मंदिर सदस्यों को व्यापक ईमेल व घोषणाएँ भेजें</p>
        </div>
      </div>

      <div className="admin-page-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div className="content-card">
          <h3 style={{ marginBottom: '1.5rem' }}>नयी सूचना प्रेषित करें</h3>
          {sent && <div style={{ padding: '0.75rem', marginBottom: '1rem', background: '#dcfce7', color: '#166534', borderRadius: 'var(--radius-sm)', fontWeight: 600 }}>{sent}</div>}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>सूचना का प्रकार *</label>
              <select style={inputStyle} value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                {notificationTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>सूचना का विषय / शीर्षक *</label>
              <input type="text" required placeholder="जैसे: महाशिवरात्रि पर्व विशेष आमंत्रण" style={inputStyle} value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>संदेश विवरण *</label>
              <textarea rows="4" required placeholder="अपना संदेश यहाँ लिखें..." style={{...inputStyle, resize: 'vertical'}} value={form.message} onChange={e => setForm({...form, message: e.target.value})}></textarea>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.9rem' }} disabled={loading}>
              <Send size={18} /> {loading ? 'भेजा जा रहा है...' : 'सभी श्रद्धालुओं को भेजें'}
            </button>
          </form>
        </div>

        <div className="content-card" style={{ maxHeight: '500px', overflowY: 'auto' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>पूर्व प्रेषित सूचनाएँ ({notifications.length})</h3>
          {notifications.length === 0 && <p className="text-light">अभी तक कोई सूचना नहीं भेजी गई है।</p>}
          {notifications.map(n => (
            <div key={n._id} style={{ padding: '1rem 0', borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', alignItems: 'center' }}>
                <p style={{ fontWeight: 700, margin: 0 }}>{n.title}</p>
                <span style={{ padding: '0.2rem 0.6rem', background: 'var(--color-primary-alpha)', color: 'var(--color-primary)', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 800 }}>
                  {notificationTypes.find(t => t.value === n.type)?.label || n.type}
                </span>
              </div>
              <p className="text-light" style={{ fontSize: '0.9rem', margin: '0.4rem 0' }}>{n.message}</p>
              <p className="text-light" style={{ fontSize: '0.8rem', margin: 0, color: '#94a3b8' }}>
                प्रेषण तिथि: {new Date(n.sentAt).toLocaleString('hi-IN')}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* WhatsApp Broadcast Assistant Section */}
      <div className="content-card" style={{ marginTop: '2rem', background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
        <h3 style={{ color: '#166534', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          📲 व्हाट्सएप ब्रॉडकास्ट एवं पर्व आमंत्रण सहायक (WhatsApp Broadcast Assistant)
        </h3>
        <p style={{ color: '#15803d', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
          महाशिवरात्रि, सावन सोमवार व विशेष पर्वों पर श्रद्धालुओं को व्हाट्सएप संदेश एवं ऑनलाइन लाइव दर्शन लिंक ब्रॉडकास्ट करें।
        </p>

        <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: '#ffffff', borderRadius: '12px', border: '1px solid #dcfce7' }}>
            <strong style={{ color: '#166534', display: 'block', marginBottom: '0.4rem' }}>1. महाशिवरात्रि पर्व आमंत्रण</strong>
            <p style={{ fontSize: '0.82rem', color: '#475569', marginBottom: '0.75rem' }}>"महाशिवरात्रि के पावन अवसर पर भव्य पूजन एवं विशाल भंडारे में सादर आमंत्रित हैं..."</p>
            <button 
              className="btn" 
              onClick={() => {
                const txt = `🚩 *श्री मन्वत बाबा महाशिव मंदिर - महाशिवरात्रि पर्व आमंत्रण* 🚩\n\nसमस्त श्रद्धालुओं को महाशिवरात्रि के पावन अवसर पर भव्य दर्शन, महापूजन एवं विशाल भंडारे में सादर आमंत्रित किया जाता है।\n\n🎥 लाइव दर्शन लिंक: https://manvatmandir.org/#/live\nहर हर महादेव! 🙏`;
                window.open(`https://wa.me/?text=${encodeURIComponent(txt)}`, '_blank');
              }}
              style={{ width: '100%', background: '#25D366', color: '#fff', fontWeight: 800, fontSize: '0.85rem' }}
            >
              📲 व्हाट्सएप पर भेजें
            </button>
          </div>

          <div style={{ padding: '1rem', background: '#ffffff', borderRadius: '12px', border: '1px solid #dcfce7' }}>
            <strong style={{ color: '#166534', display: 'block', marginBottom: '0.4rem' }}>2. सावन सोमवार विशेष आमंत्रण</strong>
            <p style={{ fontSize: '0.82rem', color: '#475569', marginBottom: '0.75rem' }}>"सावन सोमवार पर विशेष रुद्राभिषेक एवं भव्य महाश्रृंगार दर्शन हेतु लाइव जुड़ें..."</p>
            <button 
              className="btn" 
              onClick={() => {
                const txt = `🚩 *श्री मन्वत बाबा महाशिव मंदिर - सावन सोमवार आमंत्रण* 🚩\n\nसावन सोमवार पर विशेष रुद्राभिषेक एवं भव्य महाश्रृंगार दर्शन का आयोजन। दर्शन हेतु पधारें अथवा ऑनलाइन लाइव जुड़ें।\n\n🎥 लाइव दर्शन: https://manvatmandir.org/#/live\nहर हर महादेव! 🙏`;
                window.open(`https://wa.me/?text=${encodeURIComponent(txt)}`, '_blank');
              }}
              style={{ width: '100%', background: '#25D366', color: '#fff', fontWeight: 800, fontSize: '0.85rem' }}
            >
              📲 व्हाट्सएप पर भेजें
            </button>
          </div>

          <div style={{ padding: '1rem', background: '#ffffff', borderRadius: '12px', border: '1px solid #dcfce7' }}>
            <strong style={{ color: '#166534', display: 'block', marginBottom: '0.4rem' }}>3. महाप्रसाद एवं भंडारा आमंत्रण</strong>
            <p style={{ fontSize: '0.82rem', color: '#475569', marginBottom: '0.75rem' }}>"परम पावन भंडारा प्रसाद वितरण में पधार कर महाप्रसाद ग्रहण करें व पुण्य कमाएं..."</p>
            <button 
              className="btn" 
              onClick={() => {
                const txt = `🚩 *श्री मन्वत बाबा महाशिव मंदिर - महाप्रसाद एवं भंडारा आमंत्रण* 🚩\n\nपरम पावन भंडारा प्रसाद वितरण में पधार कर महाप्रसाद ग्रहण करें व पुण्य के भागी बनें।\n\n📍 स्थान: बैरमपुर, करनैलगंज - गोंडा\nहर हर महादेव! 🙏`;
                window.open(`https://wa.me/?text=${encodeURIComponent(txt)}`, '_blank');
              }}
              style={{ width: '100%', background: '#25D366', color: '#fff', fontWeight: 800, fontSize: '0.85rem' }}
            >
              📲 व्हाट्सएप पर भेजें
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNotifications;
