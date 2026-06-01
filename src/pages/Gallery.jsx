import React, { useState, useEffect } from 'react';
import { Image, Video } from 'lucide-react';
import { api } from '../services/api';

const fallbackMedia = [
  { _id: 1, type: 'image', url: 'https://placehold.co/600x400/FF8533/FFFFFF?text=Temple+Festival', title: 'Annual Festival' },
  { _id: 2, type: 'video', url: 'https://placehold.co/600x400/333333/FFFFFF?text=Aarti+Video', title: 'Evening Aarti' },
  { _id: 3, type: 'image', url: 'https://placehold.co/600x400/FF6B00/FFFFFF?text=Pooja+Ceremony', title: 'Special Pooja' },
  { _id: 4, type: 'image', url: 'https://placehold.co/600x400/E65C00/FFFFFF?text=Annadan', title: 'Mass Annadan' },
  { _id: 5, type: 'video', url: 'https://placehold.co/600x400/333333/FFFFFF?text=Discourse+Video', title: 'Spiritual Discourse' },
  { _id: 6, type: 'image', url: 'https://placehold.co/600x400/FF8533/FFFFFF?text=Gau+Seva', title: 'Gaushala Visit' },
];

const Gallery = () => {
  const [filter, setFilter] = useState('all');
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const type = filter === 'all' ? null : filter;
    setLoading(true);
    api.getGallery(type)
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setMedia(data);
        else setMedia(filter === 'all' ? fallbackMedia : fallbackMedia.filter(m => m.type === filter));
      })
      .catch(() => setMedia(filter === 'all' ? fallbackMedia : fallbackMedia.filter(m => m.type === filter)))
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <div className="gallery-page">
      <section className="section bg-primary" style={{ padding: '4rem 0', color: 'white', textAlign: 'center' }}>
        <div className="container">
          <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem' }}>Photo & Video Gallery</h1>
          <p style={{ fontSize: '1.25rem', opacity: 0.9, maxWidth: '600px', margin: '0 auto' }}>
            Catch glimpses of our vibrant festivals, poojas, and community service activities.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '3rem' }}>
            {['all', 'image', 'video'].map(f => (
              <button
                key={f}
                className={`btn ${filter === f ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setFilter(f)}
              >
                {f === 'image' && <Image size={18} />}
                {f === 'video' && <Video size={18} />}
                {f === 'all' ? 'All Media' : f === 'image' ? 'Photos' : 'Videos'}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-light)' }}>Loading gallery...</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
              {media.map(item => (
                <div key={item._id} className="content-card" style={{ padding: 0, overflow: 'hidden', cursor: 'pointer' }}>
                  <div style={{ position: 'relative' }}>
                    <img src={item.url} alt={item.title} style={{ width: '100%', height: '220px', objectFit: 'cover', display: 'block' }} />
                    {item.type === 'video' && (
                      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: 'rgba(0,0,0,0.55)', padding: '1rem', borderRadius: '50%', color: 'white' }}>
                        <Video size={28} />
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '1rem', textAlign: 'center', fontWeight: 600 }}>{item.title}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Gallery;
