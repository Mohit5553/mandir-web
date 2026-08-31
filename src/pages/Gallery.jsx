import { useState, useEffect } from 'react';
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
      <section className="section bg-primary" style={{ padding: '2rem 0', color: 'white', textAlign: 'center' }}>
        <div className="container">
          <h1 style={{ fontSize: '2.1rem', fontWeight: 800, marginBottom: '0.4rem' }}>छायाचित्र एवं वीडियो गैलरी</h1>
          <p style={{ fontSize: '1rem', opacity: 0.95, maxWidth: '650px', margin: '0 auto', lineHeight: 1.4 }}>
            मंदिर के प्रमुख उत्सवों, पूजा-अर्चना एवं जनकल्याणकारी सेवा कार्यों की मनमोहक झलकियाँ देखें।
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="responsive-actions" style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
            {['all', 'image', 'video'].map(f => (
              <button
                key={f}
                className={`btn ${filter === f ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setFilter(f)}
              >
                {f === 'image' && <Image size={18} />}
                {f === 'video' && <Video size={18} />}
                {f === 'all' ? 'सभी मीडिया' : f === 'image' ? 'तस्वीरें' : 'वीडियो'}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-light)' }}>गैलरी लोड हो रही है...</div>
          ) : (
            <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
              {media.map(item => {
                const mediaUrl = item.imageUrl || item.url;

                return (
                <div key={item._id} className="content-card" style={{ padding: 0, overflow: 'hidden', cursor: 'pointer' }}>
                  <div style={{ position: 'relative', height: '220px', background: '#fff5ed' }}>
                    {mediaUrl ? (
                      <img
                        src={mediaUrl}
                        alt={item.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop';
                        }}
                      />
                    ) : (
                      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-light)' }}>
                        <Image size={36} />
                      </div>
                    )}
                    {item.type === 'video' && (
                      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: 'rgba(0,0,0,0.55)', padding: '1rem', borderRadius: '50%', color: 'white' }}>
                        <Video size={28} />
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '1rem', textAlign: 'center', fontWeight: 600 }}>{item.title}</div>
                </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Gallery;
