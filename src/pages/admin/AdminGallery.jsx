import { useState, useEffect } from 'react';
import { Upload, Trash2, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';

const AdminGallery = () => {
  const [images, setImages] = useState([]);
  const [imageUrl, setImageUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState('');
  const [featuredOnHome, setFeaturedOnHome] = useState(false);

  const fetchGallery = () => {
    api.getGallery().then(data => setImages(Array.isArray(data) ? data : []));
  };

  useEffect(() => { fetchGallery(); }, []);

  // Compress image to reduce size before sending to backend
  const compressImage = (file) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        // Max 800px width/height while maintaining aspect ratio
        const MAX = 800;
        let { width, height } = img;
        if (width > MAX || height > MAX) {
          if (width > height) { height = (height / width) * MAX; width = MAX; }
          else { width = (width / height) * MAX; height = MAX; }
        }
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.75)); // 75% quality JPEG
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setError('');
    // Show original as preview
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
    // Compress for upload
    const compressed = await compressImage(file);
    setImageUrl(compressed);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!imageUrl) return setError('Please select a photo first');
    setLoading(true);
    setError('');
    try {
      await api.addGalleryItem({ 
        imageUrl,           // Compressed Base64
        title: caption || 'Gallery Photo',
        type: 'image',
        featuredOnHome
      });
      setImageUrl('');
      setPreview('');
      setCaption('');
      setFeaturedOnHome(false);
      fetchGallery();
    } catch {
      setError('Upload failed. Image may be too large. Try a smaller image.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this photo?')) return;
    try {
      await api.deleteGalleryItem(id);
      fetchGallery();
    } catch { setError('Delete failed'); }
  };

  const toggleFeatured = async (item) => {
    await api.updateGalleryItem(item._id, { featuredOnHome: !item.featuredOnHome });
    fetchGallery();
  };

  return (
    <div>
      <h1 style={{ marginBottom: '0.5rem' }}>Gallery Management</h1>
      <p style={{ color: '#64748b', marginBottom: '2rem' }}>Upload and manage temple photos</p>

      <div className="admin-page-grid" style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '2rem', alignItems: 'start' }}>
        
        {/* Upload Form */}
        <div className="content-card" style={{ height: 'fit-content', borderRadius: '16px' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Upload size={20} color="var(--color-primary)"/> Add New Photo
          </h3>

          {error && (
            <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <AlertCircle size={16}/> {error}
            </div>
          )}

          <form onSubmit={handleUpload}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Select Photo</label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange} 
                style={{ width: '100%', padding: '0.75rem', border: '2px dashed var(--color-primary)', borderRadius: '8px', background: '#fff5ed', cursor: 'pointer' }} 
              />
              {preview && (
                <div style={{ marginTop: '1rem', borderRadius: '10px', overflow: 'hidden', border: '1px solid #e2e8f0', maxHeight: '200px' }}>
                  <img src={preview} style={{ width: '100%', height: '200px', objectFit: 'cover', display: 'block' }} alt="Preview" />
                </div>
              )}
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Caption</label>
              <input 
                type="text" 
                placeholder="Describe the photo"
                style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.95rem' }}
                value={caption} 
                onChange={e => setCaption(e.target.value)} 
              />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem', fontWeight: 700, color: '#475569' }}>
              <input type="checkbox" checked={featuredOnHome} onChange={e => setFeaturedOnHome(e.target.checked)} />
              Featured on Home Page
            </label>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.9rem' }} disabled={loading}>
              {loading ? 'Uploading...' : '📸 Add to Gallery'}
            </button>
          </form>
        </div>

        {/* Gallery Grid */}
        <div className="content-card" style={{ borderRadius: '16px' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Photos ({images.length})</h3>
          {images.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
              <ImageIcon size={48} style={{ marginBottom: '1rem', opacity: 0.4 }}/>
              <p>No photos yet. Upload your first photo!</p>
            </div>
          ) : (
            <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
              {images.map(img => (
                <div key={img._id} style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', background: '#f8fafc' }}>
                  <img 
                    src={img.imageUrl} 
                    style={{ width: '100%', height: '160px', objectFit: 'cover', display: 'block' }} 
                    alt={img.title}
                    onError={(e) => { e.target.style.display='none'; }}
                  />
                  {img.title && img.title !== 'Gallery Photo' && (
                    <div style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>{img.title}</div>
                  )}
                  <div style={{ padding: '0 0.75rem 0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: img.featuredOnHome ? '#c2410c' : '#94a3b8' }}>
                      {img.featuredOnHome ? 'Featured on Home' : 'Not Featured'}
                    </span>
                    <button type="button" className="btn btn-outline" style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }} onClick={() => toggleFeatured(img)}>
                      {img.featuredOnHome ? 'Unfeature' : 'Feature'}
                    </button>
                  </div>
                  <button 
                    onClick={() => handleDelete(img._id)} 
                    style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(239,68,68,0.9)', color: 'white', border: 'none', padding: '0.4rem', borderRadius: '6px', cursor: 'pointer' }}>
                    <Trash2 size={15}/>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminGallery;
