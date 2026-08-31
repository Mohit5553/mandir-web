import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, X, FileText } from 'lucide-react';
import { api } from '../../services/api';
import { hasPermission } from '../../hooks/usePermission';

const AdminNews = () => {
  const canCreate = hasPermission('News', 'create');
  const canUpdate = hasPermission('News', 'update');
  const canDelete = hasPermission('News', 'delete');
  const [news, setNews] = useState([]);
  const [form, setForm] = useState({ title: '', content: '', mediaUrl: '', mediaType: 'image', featuredOnHome: false });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchNews = () => api.getNews().then(data => setNews(Array.isArray(data) ? data : []));
  useEffect(() => { fetchNews(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const newsData = {
      title: form.title,
      content: form.content,
      images: form.mediaType === 'image' && form.mediaUrl ? [form.mediaUrl] : [],
      videos: form.mediaType === 'video' && form.mediaUrl ? [form.mediaUrl] : [],
      featuredOnHome: form.featuredOnHome
    };
    
    if (editingId) {
      await api.updateNews(editingId, newsData);
      setEditingId(null);
    } else {
      await api.createNews(newsData);
    }
    
    setForm({ title: '', content: '', mediaUrl: '', mediaType: 'image', featuredOnHome: false });
    fetchNews();
    setLoading(false);
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setForm({
      title: item.title,
      content: item.content,
      mediaUrl: item.images?.[0] || item.videos?.[0] || '',
      mediaType: item.videos?.length > 0 ? 'video' : 'image',
      featuredOnHome: Boolean(item.featuredOnHome)
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ title: '', content: '', mediaUrl: '', mediaType: 'image', featuredOnHome: false });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const isVideo = file.type.startsWith('video/');
      setForm({ ...form, mediaType: isVideo ? 'video' : 'image', mediaUrl: URL.createObjectURL(file) });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this news?')) return;
    await api.deleteNews(id);
    fetchNews();
  };

  const inputStyle = { width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '1rem' };

  return (
    <div>
      <div className="page-toolbar" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.4rem' }}>समाचार एवं प्रेस विज्ञप्ति (News & Announcements)</h1>
          <p className="text-light">मंदिर की मुख्य गतिविधियों, प्रेस विज्ञप्तियों एवं समाचारों का प्रकाशन व प्रबंधन करें</p>
        </div>
      </div>

      <div className="admin-page-grid" style={{ display: 'grid', gridTemplateColumns: canCreate ? 'minmax(300px, 1fr) 2fr' : '1fr', gap: '2rem' }}>
        {canCreate && (
        <div className="content-card" style={{ position: 'sticky', top: '100px', height: 'fit-content' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {editingId ? <Edit2 size={20} color="var(--color-primary)" /> : <Plus size={20} />}
            {editingId ? 'समाचार अद्यतन करें' : 'नया समाचार प्रकाशित करें'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>मुख्य सुर्खी (Headline) *</label>
              <input type="text" required placeholder="जैसे: महाशिवरात्रि पर्व पर विशेष भण्डारा" style={inputStyle} value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>फोटो या वीडियो अपलोड करें</label>
              <input type="file" accept="image/*,video/*" style={inputStyle} onChange={handleFileChange} />
              {form.mediaUrl && (
                <div style={{ marginTop: '1rem', border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
                    {form.mediaType === 'image' ? <img src={form.mediaUrl} style={{ width: '100%' }} alt="पूर्वावलोकन" /> : <video src={form.mediaUrl} style={{ width: '100%' }} controls />}
                </div>
              )}
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>समाचार का विस्तृत विवरण *</label>
              <textarea rows="6" required placeholder="पूरा विवरण यहाँ लिखें..." style={{...inputStyle, resize: 'vertical'}} value={form.content} onChange={e => setForm({...form, content: e.target.value})}></textarea>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem', fontWeight: 700, color: '#475569' }}>
              <input type="checkbox" checked={form.featuredOnHome} onChange={e => setForm({ ...form, featuredOnHome: e.target.checked })} />
              होमपेज पर प्रदर्शित करें (Featured)
            </label>
            
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" className="btn btn-primary" style={{ flexGrow: 1, padding: '0.9rem' }} disabled={loading}>
                {editingId ? 'समाचार अद्यतन करें' : 'समाचार प्रकाशित करें'}
              </button>
              {editingId && (
                <button type="button" onClick={cancelEdit} className="btn btn-outline" style={{ padding: '0.9rem' }}>
                  <X size={20} />
                </button>
              )}
            </div>
          </form>
        </div>
        )}

        <div className="content-card">
          <h3 style={{ marginBottom: '1.5rem' }}>प्रकाशित समाचार प्रविष्टियां ({news.length})</h3>
          {news.length === 0 && <p className="text-light" style={{ padding: '2rem', textAlign: 'center' }}>कोई समाचार प्रकाशित नहीं है।</p>}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
            {news.map(item => (
              <div key={item._id} className="news-item-row responsive-row" style={{ display: 'flex', gap: '1.5rem', padding: '1.2rem', border: '1px solid var(--border-color)', borderRadius: '12px', transition: '0.2s' }}>
                <div style={{ width: '100px', height: '100px', flexShrink: 0, borderRadius: '8px', overflow: 'hidden', background: '#f1f5f9' }}>
                   {item.images?.[0] ? <img src={item.images[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="समाचार चित्र" /> : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FileText color="#94a3b8" /></div>}
                </div>
                <div style={{ flexGrow: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h4 style={{ margin: 0 }}>{item.title}</h4>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {canUpdate && <button onClick={() => handleEdit(item)} className="btn-icon" title="संपादित करें"><Edit2 size={16} /></button>}
                      {canDelete && <button onClick={() => handleDelete(item._id)} className="btn-icon" style={{ borderColor: '#fee2e2' }} title="हटाएं"><Trash2 size={16} color="#ef4444" /></button>}
                    </div>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.25rem 0' }}>
                    प्रकाशन तिथि: {new Date(item.createdAt).toLocaleDateString('hi-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  {item.featuredOnHome && <span style={{ display: 'inline-flex', padding: '0.2rem 0.55rem', borderRadius: '999px', background: '#fff7ed', color: '#c2410c', fontSize: '0.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>होमपेज पर प्रमुख</span>}
                  <p style={{ fontSize: '0.9rem', color: '#444', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNews;
