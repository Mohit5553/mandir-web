import React, { useState, useEffect } from 'react';
import { Upload, Trash2, Image as ImageIcon } from 'lucide-react';
import { api } from '../../services/api';

const AdminGallery = () => {
  const [images, setImages] = useState([]);
  const [imageUrl, setImageUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchGallery = () => {
    api.getGallery().then(data => setImages(Array.isArray(data) ? data : []));
  };

  useEffect(() => { fetchGallery(); }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!imageUrl) return alert('Please select a photo first');
    setLoading(true);
    try {
      await api.addGalleryItem({ imageUrl, title: caption });
      setImageUrl('');
      setCaption('');
      fetchGallery();
      alert('Photo added to gallery!');
    } catch (error) {
      alert('Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this photo?')) return;
    await api.deleteGalleryItem(id);
    fetchGallery();
  };

  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>Gallery Management</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '2rem' }}>
        <div className="content-card" style={{ height: 'fit-content' }}>
          <h3 style={{ marginBottom: '1.5rem' }}><Upload size={20} /> Add New Photo</h3>
          <form onSubmit={handleUpload}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Select File</label>
              <input type="file" accept="image/*" onChange={handleFileChange} style={{ width: '100%', padding: '0.5rem', border: '1px dashed #ccc' }} />
              {imageUrl && <img src={imageUrl} style={{ width: '100%', marginTop: '1rem', borderRadius: '8px' }} alt="Preview" />}
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Caption</label>
              <input type="text" placeholder="Describe the photo" className="form-input" style={{ width: '100%' }} value={caption} onChange={e => setCaption(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Adding...' : 'Add to Gallery'}
            </button>
          </form>
        </div>

        <div className="content-card">
          <h3 style={{ marginBottom: '1.5rem' }}>Photos ({images.length})</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
            {images.map(img => (
              <div key={img._id} style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '1px solid #eee' }}>
                <img src={img.imageUrl} style={{ width: '100%', height: '180px', objectFit: 'cover' }} alt={img.title} />
                <div style={{ padding: '0.75rem', fontSize: '0.9rem', fontWeight: 600 }}>{img.title}</div>
                <button onClick={() => handleDelete(img._id)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(239, 68, 68, 0.9)', color: 'white', border: 'none', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer' }}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminGallery;
