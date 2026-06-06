import { useEffect, useState } from 'react';
import { AlertCircle, Image as ImageIcon, ToggleLeft, ToggleRight, Trash2, Upload, Video } from 'lucide-react';
import { api } from '../../services/api';

const emptyForm = {
  title: '',
  mediaUrl: '',
  mediaType: 'image',
  sortOrder: 0,
  isActive: true
};

const AdminCarousel = () => {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchItems = () => {
    api.getCarousel().then(data => setItems(Array.isArray(data) ? data : []));
  };

  useEffect(() => { fetchItems(); }, []);

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        const MAX = 1600;
        let { width, height } = img;
        if (width > MAX || height > MAX) {
          if (width > height) {
            height = (height / width) * MAX;
            width = MAX;
          } else {
            width = (width / height) * MAX;
            height = MAX;
          }
        }
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const readFile = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError('');
    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');

    if (!isVideo && !isImage) {
      setError('Please select an image or video file.');
      return;
    }

    if (isVideo && file.size > 35 * 1024 * 1024) {
      setError('Video is too large. Please upload a video under 35 MB.');
      return;
    }

    const mediaUrl = isImage ? await compressImage(file) : await readFile(file);
    setPreview(mediaUrl);
    setForm(current => ({
      ...current,
      mediaUrl,
      mediaType: isVideo ? 'video' : 'image',
      title: current.title || file.name.replace(/\.[^/.]+$/, '')
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.mediaUrl) {
      setError('Please select a photo or video first.');
      return;
    }

    setLoading(true);
    setError('');

    const response = await api.addCarouselItem({
      ...form,
      title: form.title || 'Home Carousel Media',
      sortOrder: Number(form.sortOrder) || 0
    });

    if (response?.message) {
      setError(response.message);
    } else {
      setForm(emptyForm);
      setPreview('');
      fetchItems();
    }

    setLoading(false);
  };

  const handleUpdate = async (item, changes) => {
    await api.updateCarouselItem(item._id, changes);
    fetchItems();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this carousel media?')) return;
    await api.deleteCarouselItem(id);
    fetchItems();
  };

  return (
    <div>
      <h1 style={{ marginBottom: '0.5rem' }}>Home Carousel</h1>
      <p style={{ color: '#64748b', marginBottom: '2rem' }}>Upload photos or videos that rotate behind the home page hero.</p>

      <div className="admin-page-grid" style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '2rem', alignItems: 'start' }}>
        <div className="content-card" style={{ height: 'fit-content' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Upload size={20} color="var(--color-primary)" /> Add Media
          </h3>

          {error && (
            <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Photo or Video</label>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              style={{ width: '100%', padding: '0.75rem', border: '2px dashed var(--color-primary)', borderRadius: '8px', background: '#fff5ed', cursor: 'pointer', marginBottom: '1rem' }}
            />

            {preview && (
              <div style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid #e2e8f0', marginBottom: '1rem', background: '#0f172a' }}>
                {form.mediaType === 'video' ? (
                  <video src={preview} controls muted style={{ width: '100%', height: '190px', objectFit: 'cover', display: 'block' }} />
                ) : (
                  <img src={preview} alt="Preview" style={{ width: '100%', height: '190px', objectFit: 'cover', display: 'block' }} />
                )}
              </div>
            )}

            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Title</label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="Media title"
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.95rem', marginBottom: '1rem' }}
            />

            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Sort Order</label>
            <input
              type="number"
              value={form.sortOrder}
              onChange={e => setForm({ ...form, sortOrder: e.target.value })}
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.95rem', marginBottom: '1rem' }}
            />

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={e => setForm({ ...form, isActive: e.target.checked })}
              />
              Active on home page
            </label>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.9rem' }} disabled={loading}>
              {loading ? 'Uploading...' : 'Add to Carousel'}
            </button>
          </form>
        </div>

        <div className="content-card">
          <h3 style={{ marginBottom: '1.5rem' }}>Carousel Media ({items.length})</h3>
          {items.length === 0 ? (
            <div className="empty-state">
              <ImageIcon size={44} style={{ marginBottom: '1rem', opacity: 0.45 }} />
              <p>No carousel media yet.</p>
            </div>
          ) : (
            <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
              {items.map(item => (
                <div key={item._id} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', background: '#fff', position: 'relative' }}>
                  <div style={{ height: '150px', background: '#0f172a' }}>
                    {item.mediaType === 'video' ? (
                      <video src={item.mediaUrl} muted style={{ width: '100%', height: '150px', objectFit: 'cover', display: 'block' }} />
                    ) : (
                      <img src={item.mediaUrl} alt={item.title} style={{ width: '100%', height: '150px', objectFit: 'cover', display: 'block' }} />
                    )}
                  </div>
                  <div style={{ padding: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: item.mediaType === 'video' ? '#7c3aed' : 'var(--color-primary)', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                      {item.mediaType === 'video' ? <Video size={15} /> : <ImageIcon size={15} />}
                      {item.mediaType}
                    </div>
                    <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem', overflowWrap: 'anywhere' }}>{item.title}</div>
                    <label style={{ display: 'block', color: '#64748b', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.35rem' }}>Sort Order</label>
                    <input
                      type="number"
                      defaultValue={item.sortOrder}
                      onBlur={e => handleUpdate(item, { sortOrder: Number(e.target.value) || 0 })}
                      style={{ width: '100%', padding: '0.55rem', border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '0.75rem' }}
                    />
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => handleUpdate(item, { isActive: !item.isActive })}
                        className="btn btn-outline"
                        style={{ flex: 1, padding: '0.55rem 0.7rem', fontSize: '0.85rem' }}
                      >
                        {item.isActive ? <ToggleRight size={17} /> : <ToggleLeft size={17} />}
                        {item.isActive ? 'Active' : 'Hidden'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item._id)}
                        style={{ width: '42px', borderRadius: '8px', background: '#fee2e2', color: '#b91c1c', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                        aria-label="Delete carousel media"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCarousel;
