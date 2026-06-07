import { useEffect, useState } from 'react';
import { Save, Settings2, Megaphone, Clock, History, CalendarDays } from 'lucide-react';
import { api } from '../../services/api';

const emptyTiming = { label: '', time: '', note: '' };
const emptyCard = { title: '', description: '' };
const emptyTestimonial = { name: '', location: '', message: '' };
const emptyTimeline = { year: '', title: '', description: '' };
const emptyMessage = { author: '', role: '', message: '' };

const updateListItem = (list, index, field, value) => list.map((item, itemIndex) => (
  itemIndex === index ? { ...item, [field]: value } : item
));

const removeListItem = (list, index) => list.filter((_, itemIndex) => itemIndex !== index);

const AdminSiteContent = () => {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    api.getSiteContent().then(data => setForm(data?.message ? null : data));
  }, []);

  if (!form) return <div className="p-4">Loading homepage content...</div>;

  const save = async () => {
    setSaving(true);
    const updated = await api.updateSiteContent(form);
    setForm(updated);
    setSaving(false);
  };

  const blockStyle = { padding: '2rem', borderRadius: '16px', background: '#fff', marginBottom: '2rem', boxShadow: '0 4px 24px rgba(0, 0, 0, 0.04)', border: '1px solid #f1f5f9' };
  const inputStyle = { width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.95rem', backgroundColor: '#f8fafc', transition: 'all 0.2s', outlineColor: 'var(--color-primary)' };

  const renderListEditor = (key, label, template) => (
    <div key={key} style={blockStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', gap: '1rem' }}>
        <h3 style={{ margin: 0 }}>{label}</h3>
        <button className="btn btn-primary" style={{ padding: '0.6rem 1.2rem', fontWeight: 600, borderRadius: '99px' }} type="button" onClick={() => setForm({ ...form, [key]: [...(form[key] || []), { ...template }] })}>+ Add Item</button>
      </div>
      <div style={{ display: 'grid', gap: '1.25rem' }}>
        {(form[key] || []).map((item, index) => (
          <div key={`${key}-${index}`} style={{ padding: '1.1rem', border: '1px solid #eef2f7', borderRadius: '12px', background: '#f8fafc', position: 'relative' }}>
            <div style={{ display: 'grid', gap: '0.85rem' }}>
            {Object.keys(template).map((field) => (
              <div key={field}>
                {field === 'message' || field === 'description' ? (
                  <textarea rows="3" style={{ ...inputStyle, resize: 'vertical' }} placeholder={field.charAt(0).toUpperCase() + field.slice(1)} value={item[field] || ''} onChange={e => setForm({ ...form, [key]: updateListItem(form[key], index, field, e.target.value) })} />
                ) : (
                  <input style={inputStyle} placeholder={field.charAt(0).toUpperCase() + field.slice(1)} value={item[field] || ''} onChange={e => setForm({ ...form, [key]: updateListItem(form[key], index, field, e.target.value) })} />
                )}
              </div>
            ))}
            </div>
            <button className="btn btn-outline" type="button" style={{ marginTop: '0.85rem', borderColor: '#fee2e2', color: '#ef4444' }} onClick={() => setForm({ ...form, [key]: removeListItem(form[key], index) })}>Remove</button>
          </div>
        ))}
        {(!form[key] || form[key].length === 0) && (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', border: '1px dashed #cbd5e1', borderRadius: '12px' }}>
            No items added yet. Click the Add button above.
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div>
      <div className="page-toolbar" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.4rem' }}>Homepage Content Manager</h1>
          <p className="text-light">Manage timings, announcements, testimonials, and layout order.</p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={save} 
          disabled={saving}
          style={{
            position: 'fixed',
            bottom: '2.5rem',
            right: '2.5rem',
            zIndex: 100,
            boxShadow: '0 8px 32px rgba(255, 107, 0, 0.35)',
            padding: '0.85rem 1.75rem',
            borderRadius: '99px',
            fontSize: '1.05rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'transform 0.2s',
            transform: saving ? 'scale(0.95)' : 'scale(1)'
          }}
        >
          <Save size={20} /> {saving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>

      <div className="admin-tabs-container">
         <button type="button" className={`admin-tab ${activeTab === 'general' ? 'active' : ''}`} onClick={() => setActiveTab('general')}>
           <Megaphone size={16} /> General & Events
         </button>
         <button type="button" className={`admin-tab ${activeTab === 'timings' ? 'active' : ''}`} onClick={() => setActiveTab('timings')}>
           <Clock size={16} /> Timings
         </button>
         <button type="button" className={`admin-tab ${activeTab === 'about' ? 'active' : ''}`} onClick={() => setActiveTab('about')}>
           <History size={16} /> Impact & History
         </button>
         <button type="button" className={`admin-tab ${activeTab === 'sections' ? 'active' : ''}`} onClick={() => setActiveTab('sections')}>
           <Settings2 size={16} /> Section Manager
         </button>
      </div>

      <div style={{ maxWidth: '960px', margin: '0 auto 4rem' }}>
        {activeTab === 'general' && (
          <div style={{ display: 'grid', gap: '2rem' }}>
            <div style={blockStyle}>
              <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.25rem' }}><Megaphone size={22} color="var(--color-primary)"/> Announcement Bar</h3>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', fontWeight: 700, padding: '0.5rem 1rem', background: '#fff7ed', borderRadius: '99px', color: 'var(--color-primary)', cursor: 'pointer' }}>
                <input type="checkbox" style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)', cursor: 'pointer' }} checked={form.announcement?.enabled} onChange={e => setForm({ ...form, announcement: { ...form.announcement, enabled: e.target.checked } })} />
                Show Announcement Banner on Home Page
              </label>
              <textarea rows="3" style={{ ...inputStyle, resize: 'vertical' }} placeholder="Enter the announcement text..." value={form.announcement?.text || ''} onChange={e => setForm({ ...form, announcement: { ...form.announcement, text: e.target.value } })} />
            </div>

            <div style={blockStyle}>
              <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.25rem' }}><CalendarDays size={22} color="var(--color-primary)"/> Festival Countdown</h3>
              <div className="admin-inline-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                <input style={inputStyle} placeholder="Countdown title (e.g. Maha Shivaratri)" value={form.festivalCountdown?.title || ''} onChange={e => setForm({ ...form, festivalCountdown: { ...form.festivalCountdown, title: e.target.value } })} />
                <input type="date" style={inputStyle} value={form.festivalCountdown?.eventDate ? String(form.festivalCountdown.eventDate).slice(0, 10) : ''} onChange={e => setForm({ ...form, festivalCountdown: { ...form.festivalCountdown, eventDate: e.target.value || null } })} />
              </div>
              <textarea rows="2" style={{ ...inputStyle, resize: 'vertical' }} placeholder="Subtitle description" value={form.festivalCountdown?.subtitle || ''} onChange={e => setForm({ ...form, festivalCountdown: { ...form.festivalCountdown, subtitle: e.target.value } })} />
            </div>

            {renderListEditor('trustMessages', 'Trust Updates / Member Messages', emptyMessage)}
          </div>
        )}

        {activeTab === 'timings' && (
          <div style={{ display: 'grid', gap: '2rem' }}>
            {renderListEditor('darshanTimings', 'Darshan Timings', emptyTiming)}
            {renderListEditor('specialPoojaTimings', 'Special Pooja Timings', emptyTiming)}
          </div>
        )}

        {activeTab === 'about' && (
          <div style={{ display: 'grid', gap: '2rem' }}>
            {renderListEditor('donationImpact', 'Donation Impact Cards', emptyCard)}
            {renderListEditor('testimonials', 'Testimonials', emptyTestimonial)}
            {renderListEditor('timeline', 'Temple History Timeline', emptyTimeline)}
          </div>
        )}

        {activeTab === 'sections' && (
          <div className="content-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fff7ed', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Settings2 size={24} />
              </div>
              <div>
                <h3 style={{ margin: 0 }}>Layout & Visibility</h3>
                <p className="text-light" style={{ margin: '0.3rem 0 0' }}>Turn homepage sections on or off and set their rendering order.</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '1.25rem' }}>
            {(form.sections || []).map((section, index) => (
              <div key={section.key || index} style={{ display: 'grid', gridTemplateColumns: '1fr auto 100px', alignItems: 'center', gap: '1rem', padding: '1.25rem', border: '1px solid #eef2f7', borderRadius: '14px', background: '#f8fafc', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.01)' }}>
                <strong style={{ fontSize: '1.05rem', color: '#1e293b' }}>{section.label}</strong>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, cursor: 'pointer' }}>
                  <input type="checkbox" style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)' }} checked={section.enabled} onChange={e => setForm({ ...form, sections: updateListItem(form.sections, index, 'enabled', e.target.checked) })} />
                  Enabled
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Order:</span>
                  <input type="number" style={{ ...inputStyle, padding: '0.5rem' }} value={section.order} onChange={e => setForm({ ...form, sections: updateListItem(form.sections, index, 'order', Number(e.target.value) || 0) })} />
                </div>
              </div>
            ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSiteContent;
