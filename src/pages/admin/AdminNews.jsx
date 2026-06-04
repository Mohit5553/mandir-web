import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, X, FileText } from 'lucide-react';
import { api } from '../../services/api';

const AdminNews = () => {
  const [news, setNews] = useState([]);
  const [form, setForm] = useState({ title: '', content: '', mediaUrl: '', mediaType: 'image' });
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
      videos: form.mediaType === 'video' && form.mediaUrl ? [form.mediaUrl] : []
    };
    
    if (editingId) {
      await api.updateNews(editingId, newsData);
      setEditingId(null);
    } else {
      await api.createNews(newsData);
    }
    
    setForm({ title: '', content: '', mediaUrl: '', mediaType: 'image' });
    fetchNews();
    setLoading(false);
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setForm({
      title: item.title,
      content: item.content,
      mediaUrl: item.images?.[0] || item.videos?.[0] || '',
      mediaType: item.videos?.length > 0 ? 'video' : 'image'
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ title: '', content: '', mediaUrl: '', mediaType: 'image' });
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
      <h1 style={{ marginBottom: '2rem' }}>News Management (Full CRUD)</h1>

      <div className="admin-page-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '2rem' }}>
        <div className="content-card" style={{ position: 'sticky', top: '100px', height: 'fit-content' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {editingId ? <Edit2 size={20} color="var(--color-primary)" /> : <Plus size={20} />}
            {editingId ? 'Edit News Post' : 'Add News Post'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Headline</label>
              <input type="text" required style={inputStyle} value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Upload Photo/Video</label>
              <input type="file" accept="image/*,video/*" style={inputStyle} onChange={handleFileChange} />
              {form.mediaUrl && (
                <div style={{ marginTop: '1rem', border: '1px solid #ddd', borderRadius: '4px', overflow: 'hidden' }}>
                    {form.mediaType === 'image' ? <img src={form.mediaUrl} style={{ width: '100%' }} /> : <video src={form.mediaUrl} style={{ width: '100%' }} controls />}
                </div>
              )}
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Content</label>
              <textarea rows="6" required style={{...inputStyle, resize: 'vertical'}} value={form.content} onChange={e => setForm({...form, content: e.target.value})}></textarea>
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" className="btn btn-primary" style={{ flexGrow: 1, padding: '1rem' }} disabled={loading}>
                {editingId ? 'Update Post' : 'Post News'}
              </button>
              {editingId && (
                <button type="button" onClick={cancelEdit} className="btn btn-outline" style={{ padding: '1rem' }}>
                  <X size={20} />
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="content-card">
          <h3 style={{ marginBottom: '1.5rem' }}>Published News ({news.length})</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
            {news.map(item => (
              <div key={item._id} className="news-item-row responsive-row" style={{ display: 'flex', gap: '1.5rem', padding: '1.2rem', border: '1px solid var(--border-color)', borderRadius: '12px', transition: '0.2s' }}>
                <div style={{ width: '100px', height: '100px', flexShrink: 0, borderRadius: '8px', overflow: 'hidden', background: '#f1f5f9' }}>
                   {item.images?.[0] ? <img src={item.images[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FileText color="#94a3b8" /></div>}
                </div>
                <div style={{ flexGrow: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h4 style={{ margin: 0 }}>{item.title}</h4>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => handleEdit(item)} className="btn-icon" title="Edit"><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(item._id)} className="btn-icon" style={{ borderColor: '#fee2e2' }} title="Delete"><Trash2 size={16} color="#ef4444" /></button>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.25rem 0' }}>{new Date(item.createdAt).toLocaleDateString()}</p>
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
