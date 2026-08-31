import { useState, useEffect } from 'react';
import { Trash2, Edit2, X } from 'lucide-react';
import { api } from '../../services/api';
import { hasPermission } from '../../hooks/usePermission';

const AdminEvents = () => {
  const canCreate = hasPermission('Events', 'create');
  const canUpdate = hasPermission('Events', 'update');
  const canDelete = hasPermission('Events', 'delete');
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', date: '', time: '', location: '', imageUrl: '', featuredOnHome: false });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchEvents = () => api.getEvents().then(data => setEvents(Array.isArray(data) ? data : []));
  useEffect(() => { fetchEvents(); }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm({ ...form, imageUrl: reader.result }); // Storing as Base64 string
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (editingId) {
      await api.updateEvent(editingId, form);
      setEditingId(null);
    } else {
      await api.createEvent(form);
    }
    setForm({ title: '', description: '', date: '', time: '', location: '', imageUrl: '', featuredOnHome: false });
    fetchEvents();
    setLoading(false);
  };

  const handleEdit = (event) => {
    setEditingId(event._id);
    setForm({
      title: event.title,
      description: event.description,
      date: event.date ? event.date.split('T')[0] : '',
      time: event.time || '',
      location: event.location || '',
      imageUrl: event.imageUrl || '',
      featuredOnHome: Boolean(event.featuredOnHome)
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    await api.deleteEvent(id);
    fetchEvents();
  };

  const inputStyle = { width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '1rem' };

  return (
    <div>
      <div className="page-toolbar" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.4rem' }}>घटनाएँ एवं मंदिर कार्यक्रम (Events Management)</h1>
          <p className="text-light">मंदिर के आगामी धार्मिक अनुष्ठानों, आयोजनों एवं कार्यक्रमों का प्रकाशन व प्रबंधन करें</p>
        </div>
      </div>

      <div className="admin-page-grid" style={{ display: 'grid', gridTemplateColumns: canCreate ? '1.2fr 1fr' : '1fr', gap: '2rem' }}>
        {canCreate && (
        <div className="content-card" style={{ height: 'fit-content', position: 'sticky', top: '100px' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>{editingId ? 'कार्यक्रम विवरण अद्यतन करें' : 'नया कार्यक्रम जोड़ें'}</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>कार्यक्रम का नाम / शीर्षक *</label>
              <input type="text" required placeholder="जैसे: महाशिवरात्रि महापूजा एवं शोभायात्रा" style={inputStyle} value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
            </div>

            <div className="admin-inline-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>कार्यक्रम तिथि *</label>
                <input type="date" required style={inputStyle} value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>समय (Time) *</label>
                <input type="time" required style={inputStyle} value={form.time} onChange={e => setForm({...form, time: e.target.value})} />
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>बैनर फोटो अपलोड करें</label>
              <input type="file" accept="image/*" style={inputStyle} onChange={handleFileChange} />
              {form.imageUrl && <img src={form.imageUrl} style={{ width: '100%', marginTop: '1rem', borderRadius: '8px', border: '1px solid #ddd' }} alt="पूर्वावलोकन" />}
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>विवरण एवं विशेष जानकारी *</label>
              <textarea rows="4" required placeholder="कार्यक्रम का विस्तृत विवरण यहाँ लिखें..." style={{...inputStyle, resize: 'vertical'}} value={form.description} onChange={e => setForm({...form, description: e.target.value})}></textarea>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem', fontWeight: 700, color: '#475569' }}>
              <input type="checkbox" checked={form.featuredOnHome} onChange={e => setForm({ ...form, featuredOnHome: e.target.checked })} />
              होमपेज पर प्रमुखता से दिखाएं (Featured)
            </label>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" className="btn btn-primary" style={{ flexGrow: 1, padding: '0.9rem' }} disabled={loading}>
                {editingId ? 'कार्यक्रम अद्यतन करें' : 'कार्यक्रम प्रकाशित करें'}
              </button>
              {editingId && <button onClick={() => {setEditingId(null); setForm({title:'',description:'',date:'',time:'',location:'',imageUrl:'',featuredOnHome:false})}} className="btn btn-outline" type="button"><X size={20}/></button>}
            </div>
          </form>
        </div>
        )}

        <div className="content-card">
          <h3 style={{ marginBottom: '1.5rem' }}>सक्रिय कार्यक्रम प्रविष्टियां ({events.length})</h3>
          {events.length === 0 && <p className="text-light" style={{ padding: '2rem', textAlign: 'center' }}>कोई कार्यक्रम प्रविष्ट नहीं है। नया कार्यक्रम जोड़ें!</p>}
          {events.map(event => (
            <div key={event._id} style={{ padding: '1rem', border: '1px solid #f0f0f0', borderRadius: '12px', marginBottom: '1.5rem' }}>
              {event.imageUrl ? (
                <img src={event.imageUrl} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px' }} alt="कार्यक्रम फोटो" />
              ) : (
                <div style={{ height: '150px', background: '#f8fafc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>कोई फोटो उपलब्ध नहीं</div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                <div>
                  <h4 style={{ margin: 0 }}>{event.title}</h4>
                  {event.featuredOnHome && <span style={{ display: 'inline-flex', padding: '0.2rem 0.55rem', borderRadius: '999px', background: '#fff7ed', color: '#c2410c', fontSize: '0.75rem', fontWeight: 800, marginTop: '0.35rem' }}>होमपेज पर प्रमुख</span>}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {canUpdate && <button onClick={() => handleEdit(event)} className="btn-icon" title="संपादित करें"><Edit2 size={16}/></button>}
                  {canDelete && <button onClick={() => handleDelete(event._id)} className="btn-icon" style={{ borderColor: '#fee2e2' }} title="हटाएं"><Trash2 size={16} color="#ef4444" /></button>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminEvents;
