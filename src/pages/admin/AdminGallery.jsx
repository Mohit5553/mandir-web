import { useState, useEffect } from 'react';
import { Upload, Trash2, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import { hasPermission } from '../../hooks/usePermission';

const AdminGallery = () => {
  const canCreate = hasPermission('Gallery', 'create');
  const canUpdate = hasPermission('Gallery', 'update');
  const canDelete = hasPermission('Gallery', 'delete');
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
    if (!window.confirm('क्या आप निश्चित रूप से इस फोटो को गैलरी से हटाना (डिलीट करना) चाहते हैं?')) return;
    try {
      await api.deleteGalleryItem(id);
      fetchGallery();
    } catch { 
      setError('फोटो डिलीट करने में विफलता हुई।'); 
    }
  };

  const toggleFeatured = async (item) => {
    try {
      await api.updateGalleryItem(item._id, { featuredOnHome: !item.featuredOnHome });
      fetchGallery();
    } catch {
      setError('स्थिति अद्यतन करने में विफलता हुई।');
    }
  };

  return (
    <div>
      <div className="page-toolbar" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.4rem' }}>गैलरी मीडिया प्रबंधन</h1>
          <p className="text-light">मंदिर की भव्य फोटो एवं मीडिया सामग्री अपलोड व प्रदर्शित करें</p>
        </div>
      </div>

      <div className="admin-page-grid" style={{ display: 'grid', gridTemplateColumns: canCreate ? '350px 1fr' : '1fr', gap: '2rem', alignItems: 'start' }}>
        
        {/* Upload Form */}
        {canCreate && (
        <div className="content-card" style={{ height: 'fit-content', borderRadius: '16px' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Upload size={20} color="var(--color-primary)"/> नई फोटो अपलोड करें
          </h3>

          {error && (
            <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <AlertCircle size={16}/> {error}
            </div>
          )}

          <form onSubmit={handleUpload}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>फोटो चुनें *</label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange} 
                style={{ width: '100%', padding: '0.75rem', border: '2px dashed var(--color-primary)', borderRadius: '8px', background: '#fff5ed', cursor: 'pointer' }} 
              />
              {preview && (
                <div style={{ marginTop: '1rem', borderRadius: '10px', overflow: 'hidden', border: '1px solid #e2e8f0', maxHeight: '200px' }}>
                  <img src={preview} style={{ width: '100%', height: '200px', objectFit: 'cover', display: 'block' }} alt="पूर्वावलोकन" />
                </div>
              )}
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>शीर्षक / विवरण</label>
              <input 
                type="text" 
                placeholder="जैसे: महाशिवरात्रि आरती उत्सव"
                style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.95rem' }}
                value={caption} 
                onChange={e => setCaption(e.target.value)} 
              />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem', fontWeight: 700, color: '#475569' }}>
              <input type="checkbox" checked={featuredOnHome} onChange={e => setFeaturedOnHome(e.target.checked)} />
              होमपेज पर प्रदर्शित करें (Featured)
            </label>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.9rem' }} disabled={loading}>
              {loading ? 'अपलोड हो रहा है...' : '📸 गैलरी में जोड़ें'}
            </button>
          </form>
        </div>
        )}

        {/* Gallery Grid */}
        <div className="content-card" style={{ borderRadius: '16px' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>गैलरी फोटो प्रविष्टियां ({images.length})</h3>
          {images.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
              <ImageIcon size={48} style={{ marginBottom: '1rem', opacity: 0.4 }}/>
              <p>अभी तक कोई फोटो उपलब्ध नहीं है। पहली फोटो अपलोड करें!</p>
            </div>
          ) : (
            <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.25rem' }}>
              {images.map(img => (
                <div key={img._id} style={{ position: 'relative', borderRadius: '14px', overflow: 'hidden', border: '1px solid #e2e8f0', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                  <img 
                    src={img.imageUrl} 
                    style={{ width: '100%', height: '160px', objectFit: 'cover', display: 'block' }} 
                    alt={img.title}
                    onError={(e) => { e.target.style.display='none'; }}
                  />
                  <div style={{ padding: '0.75rem 0.85rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1e293b', marginBottom: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {img.title || 'मंदिर फोटो'}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '0.15rem 0.45rem', borderRadius: '999px', background: img.featuredOnHome ? '#fff7ed' : '#f1f5f9', color: img.featuredOnHome ? '#c2410c' : '#64748b' }}>
                        {img.featuredOnHome ? 'होम पर प्रमुख' : 'सामान्य'}
                      </span>
                      <button type="button" className="btn btn-outline" style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem', fontWeight: 700 }} onClick={() => toggleFeatured(img)}>
                        {img.featuredOnHome ? 'होम से हटाएं' : 'होम पर दिखाएं'}
                      </button>
                    </div>
                  </div>
                  {canDelete && (
                  <button 
                    onClick={() => handleDelete(img._id)} 
                    title="फोटो पूर्णतः डिलीट करें"
                    style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(239,68,68,0.92)', color: 'white', border: 'none', padding: '0.45rem', borderRadius: '8px', cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.2)', transition: 'transform 0.15s' }}>
                    <Trash2 size={16}/>
                  </button>
                  )}
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
