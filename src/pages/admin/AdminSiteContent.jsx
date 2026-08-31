import { useEffect, useState } from 'react';
import { Save, Settings2, Megaphone, Clock, History, CalendarDays, Music } from 'lucide-react';
import { api } from '../../services/api';

const emptyTiming = { label: '', time: '', note: '' };
const emptyCard = { title: '', description: '' };
const emptyTestimonial = { name: '', location: '', message: '' };
const emptyTimeline = { year: '', title: '', description: '' };
const emptyMessage = { author: '', role: '', message: '' };
const emptyBhaktiTrack = { id: '', title: '', subtitle: '', audioUrl: '', lyrics: '' };

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

  if (!form) return <div className="p-4">होमपेज सामग्री लोड हो रही है...</div>;

  const save = async () => {
    setSaving(true);
    const updated = await api.updateSiteContent(form);
    setForm(updated);
    setSaving(false);
  };

  const blockStyle = { padding: '2rem', borderRadius: '16px', background: '#fff', marginBottom: '2rem', boxShadow: '0 4px 24px rgba(0, 0, 0, 0.04)', border: '1px solid #f1f5f9' };
  const inputStyle = { width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.95rem', backgroundColor: '#f8fafc', transition: 'all 0.2s', outlineColor: 'var(--color-primary)' };

  const fieldLabels = {
    label: 'नाम / शीर्षक',
    time: 'समय अवधि',
    note: 'विशेष विवरण / नोट',
    title: 'शीर्षक',
    description: 'वर्णन / विवरण',
    name: 'नाम',
    location: 'स्थान / शहर',
    message: 'संदेश',
    year: 'वर्ष',
    author: 'लेखक / नाम',
    role: 'पदनाम',
    id: 'ट्रैक ID (जैसे: chalisa, mantra, aarti)',
    subtitle: 'उपशीर्षक / संक्षिप्त विवरण',
    audioUrl: 'ऑडियो MP3 लिंक / URL',
    lyrics: 'संपूर्ण हिंदी पाठ / लिरिक्स (Lyrics Text)'
  };

  const renderListEditor = (key, label, template, prepend = false) => (
    <div key={key} style={blockStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', gap: '1rem' }}>
        <h3 style={{ margin: 0 }}>{label}</h3>
        <button className="btn btn-primary" style={{ padding: '0.6rem 1.2rem', fontWeight: 600, borderRadius: '99px' }} type="button" onClick={() => setForm({ ...form, [key]: prepend ? [{ ...template }, ...(form[key] || [])] : [...(form[key] || []), { ...template }] })}>+ नई प्रविष्टि जोड़ें</button>
      </div>
      <div style={{ display: 'grid', gap: '1.25rem' }}>
        {(form[key] || []).map((item, index) => (
          <div key={`${key}-${index}`} style={{ padding: '1.1rem', border: '1px solid #eef2f7', borderRadius: '12px', background: '#f8fafc', position: 'relative' }}>
            <div style={{ display: 'grid', gap: '0.85rem' }}>
            {Object.keys(template).map((field) => (
              <div key={field}>
                {field === 'message' || field === 'description' ? (
                  <textarea rows="3" style={{ ...inputStyle, resize: 'vertical' }} placeholder={fieldLabels[field] || field} value={item[field] || ''} onChange={e => setForm({ ...form, [key]: updateListItem(form[key], index, field, e.target.value) })} />
                ) : (
                  <input style={inputStyle} placeholder={fieldLabels[field] || field} value={item[field] || ''} onChange={e => setForm({ ...form, [key]: updateListItem(form[key], index, field, e.target.value) })} />
                )}
              </div>
            ))}
            </div>
            <button className="btn btn-outline" type="button" style={{ marginTop: '0.85rem', borderColor: '#fee2e2', color: '#ef4444' }} onClick={() => setForm({ ...form, [key]: removeListItem(form[key], index) })}>हटाएं</button>
          </div>
        ))}
        {(!form[key] || form[key].length === 0) && (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', border: '1px dashed #cbd5e1', borderRadius: '12px' }}>
            कोई प्रविष्टि नहीं जोड़ी गई है। ऊपर 'नई प्रविष्टि जोड़ें' बटन पर क्लिक करें।
          </div>
        )}
      </div>
    </div>
  );

  const handleAudioFileUpload = (e, index) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64Data = uploadEvent.target.result;
      const updatedTracks = updateListItem(form.bhaktiTracks, index, 'audioUrl', base64Data);
      setForm({ ...form, bhaktiTracks: updatedTracks });
    };
    reader.readAsDataURL(file);
  };

  const renderBhaktiTracksEditor = () => (
    <div style={blockStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.25rem' }}>भक्ति संगीत, आरती एवं लिरिक्स प्रबंधक</h3>
          <p className="text-light" style={{ margin: '0.25rem 0 0', fontSize: '0.9rem' }}>वेबसाइट पर प्रदर्शित होने वाले सभी धार्मिक ऑडियो गानों, आरतियों और उनके लिरिक्स का प्रबंधन करें</p>
        </div>
        <button 
          className="btn btn-primary" 
          style={{ padding: '0.65rem 1.4rem', fontWeight: 700, borderRadius: '99px', display: 'flex', alignItems: 'center', gap: '0.4rem' }} 
          type="button" 
          onClick={() => {
            const newTrack = {
              id: `track_${Date.now()}`,
              title: '',
              subtitle: '',
              audioUrl: '',
              lyrics: '',
              enabled: true
            };
            setForm({ ...form, bhaktiTracks: [newTrack, ...(form.bhaktiTracks || [])] });
          }}
        >
          + नई प्रविष्टि जोड़ें (सबसे ऊपर)
        </button>
      </div>

      <div style={{ display: 'grid', gap: '1.5rem' }}>
        {(form.bhaktiTracks || []).map((item, index) => {
          const isEnabled = item.enabled !== false;
          return (
            <div key={`bhakti-${index}`} style={{ padding: '1.5rem', border: isEnabled ? '1px solid #fed7aa' : '1px dashed #cbd5e1', borderRadius: '16px', background: isEnabled ? '#fffdfa' : '#f8fafc', boxShadow: '0 4px 16px rgba(0,0,0,0.02)', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontWeight: 800, color: 'var(--color-primary)', fontSize: '0.95rem' }}>
                  🎵 ट्रैक #{index + 1} {item.title ? `- ${item.title}` : ''}
                </span>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {/* Enable / Disable Switch */}
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', padding: '0.35rem 0.85rem', borderRadius: '99px', background: isEnabled ? '#dcfce7' : '#f1f5f9', color: isEnabled ? '#15803d' : '#64748b' }}>
                    <input 
                      type="checkbox" 
                      style={{ width: '16px', height: '16px', accentColor: '#16a34a', cursor: 'pointer' }} 
                      checked={isEnabled} 
                      onChange={e => setForm({ ...form, bhaktiTracks: updateListItem(form.bhaktiTracks, index, 'enabled', e.target.checked) })} 
                    />
                    {isEnabled ? '🟢 चालू (Active)' : '⚪ बंद (Disabled)'}
                  </label>

                  <button className="btn btn-outline" type="button" style={{ borderColor: '#fee2e2', color: '#ef4444', padding: '0.35rem 0.85rem', fontSize: '0.85rem' }} onClick={() => setForm({ ...form, bhaktiTracks: removeListItem(form.bhaktiTracks, index) })}>हटाएं</button>
                </div>
              </div>

              <div style={{ display: 'grid', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 700, fontSize: '0.85rem', color: '#334155' }}>भक्ति शीर्षक (Title)</label>
                    <input style={inputStyle} placeholder="जैसे: श्री शिव चालीसा (Shree Shiv Chalisa)" value={item.title || ''} onChange={e => setForm({ ...form, bhaktiTracks: updateListItem(form.bhaktiTracks, index, 'title', e.target.value) })} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 700, fontSize: '0.85rem', color: '#334155' }}>उपशीर्षक / विवरण (Subtitle)</label>
                    <input style={inputStyle} placeholder="जैसे: जय गणेश गिरिजा सुवन, मंगल मूल सुजान..." value={item.subtitle || ''} onChange={e => setForm({ ...form, bhaktiTracks: updateListItem(form.bhaktiTracks, index, 'subtitle', e.target.value) })} />
                  </div>
                </div>

                {/* Audio Upload Box */}
                <div style={{ padding: '1rem', background: '#fff7ed', borderRadius: '12px', border: '1px solid #ffedd5' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 800, fontSize: '0.9rem', color: '#9a3412' }}>
                    📁 ऑडियो MP3 फाइल अपलोड करें (Upload Audio File)
                  </label>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <input 
                      type="file" 
                      accept="audio/*" 
                      style={{ fontSize: '0.9rem', cursor: 'pointer' }}
                      onChange={e => handleAudioFileUpload(e, index)} 
                    />
                    
                    <span style={{ fontSize: '0.82rem', color: '#7c2d12', fontWeight: 600 }}>या डायरेक्ट URL डालें:</span>
                    <input 
                      style={{ ...inputStyle, flex: 1, minWidth: '220px', padding: '0.5rem 0.75rem', fontSize: '0.85rem' }} 
                      placeholder="https://example.com/audio.mp3" 
                      value={item.audioUrl && item.audioUrl.startsWith('data:') ? '[अपलोड की गई ऑडियो फाइल]' : (item.audioUrl || '')} 
                      onChange={e => setForm({ ...form, bhaktiTracks: updateListItem(form.bhaktiTracks, index, 'audioUrl', e.target.value) })} 
                    />
                  </div>

                  {item.audioUrl && (
                    <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#15803d' }}>▶️ ऑडियो पूर्वदर्शन (Preview):</span>
                      <audio controls src={item.audioUrl} style={{ height: '36px', maxWidth: '360px' }} />
                    </div>
                  )}
                </div>

                {/* Lyrics Text Area */}
                <div>
                  <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 700, fontSize: '0.88rem', color: '#334155' }}>
                    📜 संपूर्ण हिंदी पाठ एवं लिरिक्स (Full Lyrics Text Editor)
                  </label>
                  <textarea 
                    rows="8" 
                    style={{ ...inputStyle, resize: 'vertical', fontFamily: 'monospace, inherit', fontSize: '0.95rem', lineHeight: '1.7', whiteSpace: 'pre-wrap' }} 
                    placeholder={`॥ दोहा ॥\nजय गणेश गिरिजा सुवन, मंगल मूल सुजान।\nकहत अयोध्यादास तुम, देहु अभय वरदान॥\n\n॥ चौपाई ॥\nजय गिरिजा पति दिन दयाला। सदा करत सन्तन प्रतिपाला...`} 
                    value={item.lyrics || ''} 
                    onChange={e => setForm({ ...form, bhaktiTracks: updateListItem(form.bhaktiTracks, index, 'lyrics', e.target.value) })} 
                  />
                </div>
              </div>
            </div>
          );
        })}

        {(!form.bhaktiTracks || form.bhaktiTracks.length === 0) && (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: '#94a3b8', border: '1px dashed #cbd5e1', borderRadius: '12px' }}>
            कोई भक्ति ट्रैक उपलब्ध नहीं है। ऊपर '+ नई प्रविष्टि जोड़ें' बटन पर क्लिक करें।
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div>
      <div className="page-toolbar" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.4rem' }}>होमपेज सामग्री प्रबंधक (Content Manager)</h1>
          <p className="text-light">मंदिर समय सारणी, घोषणाएं, इतिहास एवं लेआउट का प्रबंधन करें</p>
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
          <Save size={20} /> {saving ? 'सुरक्षित हो रहा है...' : 'सभी बदलाव सहेजें'}
        </button>
      </div>

      <div className="admin-tabs-container">
         <button type="button" className={`admin-tab ${activeTab === 'general' ? 'active' : ''}`} onClick={() => setActiveTab('general')}>
           <Megaphone size={16} /> सामान्य एवं घोषणाएँ
         </button>
         <button type="button" className={`admin-tab ${activeTab === 'timings' ? 'active' : ''}`} onClick={() => setActiveTab('timings')}>
           <Clock size={16} /> दर्शन एवं पूजा समय
         </button>
         <button type="button" className={`admin-tab ${activeTab === 'about' ? 'active' : ''}`} onClick={() => setActiveTab('about')}>
           <History size={16} /> इतिहास एवं प्रभाव
         </button>
         <button type="button" className={`admin-tab ${activeTab === 'bhakti' ? 'active' : ''}`} onClick={() => setActiveTab('bhakti')}>
           <Music size={16} /> भक्ति संगीत एवं लिरिक्स
         </button>
         <button type="button" className={`admin-tab ${activeTab === 'sections' ? 'active' : ''}`} onClick={() => setActiveTab('sections')}>
           <Settings2 size={16} /> सेक्शन प्रबंधक
         </button>
      </div>

      <div style={{ maxWidth: '960px', margin: '0 auto 4rem' }}>
        {activeTab === 'general' && (
          <div style={{ display: 'grid', gap: '2rem' }}>
            <div style={blockStyle}>
              <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.25rem' }}><Megaphone size={22} color="var(--color-primary)"/> मुख्य घोषणा पट्टी (Announcement Bar)</h3>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', fontWeight: 700, padding: '0.5rem 1rem', background: '#fff7ed', borderRadius: '99px', color: 'var(--color-primary)', cursor: 'pointer' }}>
                <input type="checkbox" style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)', cursor: 'pointer' }} checked={form.announcement?.enabled} onChange={e => setForm({ ...form, announcement: { ...form.announcement, enabled: e.target.checked } })} />
                होमपेज पर घोषणा बैनर प्रदर्शित करें
              </label>
              <textarea rows="3" style={{ ...inputStyle, resize: 'vertical' }} placeholder="घोषणा का पाठ यहाँ दर्ज करें..." value={form.announcement?.text || ''} onChange={e => setForm({ ...form, announcement: { ...form.announcement, text: e.target.value } })} />
            </div>

            <div style={blockStyle}>
              <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.25rem' }}><CalendarDays size={22} color="var(--color-primary)"/> आगामी पर्व / उत्सव उल्टी गिनती (Festival Countdown)</h3>
              <div className="admin-inline-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                <input style={inputStyle} placeholder="पर्व का नाम (जैसे: महाशिवरात्रि पर्व)" value={form.festivalCountdown?.title || ''} onChange={e => setForm({ ...form, festivalCountdown: { ...form.festivalCountdown, title: e.target.value } })} />
                <input type="date" style={inputStyle} value={form.festivalCountdown?.eventDate ? String(form.festivalCountdown.eventDate).slice(0, 10) : ''} onChange={e => setForm({ ...form, festivalCountdown: { ...form.festivalCountdown, eventDate: e.target.value || null } })} />
              </div>
              <textarea rows="2" style={{ ...inputStyle, resize: 'vertical' }} placeholder="उपशीर्षक एवं पर्व का विवरण दर्ज करें..." value={form.festivalCountdown?.subtitle || ''} onChange={e => setForm({ ...form, festivalCountdown: { ...form.festivalCountdown, subtitle: e.target.value } })} />
            </div>

            {renderListEditor('trustMessages', 'ट्रस्ट संदेश एवं नवीनतम घोषणाएँ', emptyMessage)}
          </div>
        )}

        {activeTab === 'timings' && (
          <div style={{ display: 'grid', gap: '2rem' }}>
            {renderListEditor('darshanTimings', 'दैनिक दर्शन समय सारणी', emptyTiming)}
            {renderListEditor('specialPoojaTimings', 'विशेष पूजा एवं आरती समय', emptyTiming)}
          </div>
        )}

        {activeTab === 'about' && (
          <div style={{ display: 'grid', gap: '2rem' }}>
            <div style={blockStyle}>
              <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.25rem' }}>
                <History size={22} color="var(--color-primary)"/> 'हमारे बारे में' मुख्य विवरण (About Us Text Content)
              </h3>
              <div style={{ display: 'grid', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 700, fontSize: '0.9rem', color: '#334155' }}>हमारा इतिहास (Our History)</label>
                  <textarea rows="4" style={{ ...inputStyle, resize: 'vertical' }} placeholder="सदियों पहले स्थापित श्री मन्वत बाबा मंदिर आध्यात्मिकता..." value={form.aboutHistory || ''} onChange={e => setForm({ ...form, aboutHistory: e.target.value })} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 700, fontSize: '0.9rem', color: '#334155' }}>हमारा मिशन (Our Mission)</label>
                  <textarea rows="3" style={{ ...inputStyle, resize: 'vertical' }} placeholder="आध्यात्मिक जागृति को बढ़ावा देना, सांस्कृतिक विरासत का संरक्षण करना..." value={form.aboutMission || ''} onChange={e => setForm({ ...form, aboutMission: e.target.value })} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 700, fontSize: '0.9rem', color: '#334155' }}>हमारी दृष्टि (Our Vision)</label>
                  <textarea rows="3" style={{ ...inputStyle, resize: 'vertical' }} placeholder="शांति, सद्भाव और धार्मिकता से युक्त समाज का निर्माण करना..." value={form.aboutVision || ''} onChange={e => setForm({ ...form, aboutVision: e.target.value })} />
                </div>
              </div>
            </div>
            {renderListEditor('donationImpact', 'दान प्रभाव एवं सेवा कार्ड्स', emptyCard)}
            {renderListEditor('testimonials', 'श्रद्धालु अनुभव एवं विचार', emptyTestimonial)}
            {renderListEditor('timeline', 'मंदिर विकास यात्रा टाइमलाइन', emptyTimeline)}
          </div>
        )}

        {activeTab === 'bhakti' && (
          <div style={{ display: 'grid', gap: '2rem' }}>
            {renderBhaktiTracksEditor()}
          </div>
        )}

        {activeTab === 'sections' && (
          <div className="content-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fff7ed', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Settings2 size={24} />
              </div>
              <div>
                <h3 style={{ margin: 0 }}>होमपेज लेआउट एवं दृश्यता</h3>
                <p className="text-light" style={{ margin: '0.3rem 0 0' }}>होमपेज के विभिन्न अनुभागों को चालू/बंद करें और उनका प्रदर्शन क्रम सेट करें।</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '1.25rem' }}>
            {(form.sections || []).map((section, index) => (
              <div key={section.key || index} style={{ display: 'grid', gridTemplateColumns: '1fr auto 100px', alignItems: 'center', gap: '1rem', padding: '1.25rem', border: '1px solid #eef2f7', borderRadius: '14px', background: '#f8fafc', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.01)' }}>
                <strong style={{ fontSize: '1.05rem', color: '#1e293b' }}>{section.label}</strong>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, cursor: 'pointer' }}>
                  <input type="checkbox" style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)' }} checked={section.enabled} onChange={e => setForm({ ...form, sections: updateListItem(form.sections, index, 'enabled', e.target.checked) })} />
                  सक्रिय (Enabled)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>क्रम:</span>
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
