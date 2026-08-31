import { useMemo, useState, useEffect } from 'react';
import { Newspaper, Search, X } from 'lucide-react';
import { api } from '../services/api';

const fallbackNews = [
  { _id: 1, title: "New Temple Construction Phase 2 Begins", createdAt: "2026-05-25", content: "By the grace of the divine and generous donations, we have officially started Phase 2 of the temple expansion.", images: ["https://placehold.co/400x250/FF6B00/FFFFFF?text=Temple+Construction"] },
  { _id: 2, title: "Gau Seva Foundation Reaches Milestone", createdAt: "2026-05-10", content: "Our Gaushala now provides shelter to over 500 cows. We thank all the donors for their continuous support.", images: ["https://placehold.co/400x250/FF8533/FFFFFF?text=Gau+Seva"] },
  { _id: 3, title: "Online Donation Portal Launched", createdAt: "2026-04-28", content: "Devotees can now offer their contributions seamlessly through our secure online payment gateway.", images: ["https://placehold.co/400x250/E65C00/FFFFFF?text=Portal+Launch"] }
];

const News = () => {
  const [newsItems, setNewsItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('latest');

  useEffect(() => {
    api.getNews()
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setNewsItems(data);
        else setNewsItems(fallbackNews);
      })
      .catch(() => setNewsItems(fallbackNews))
      .finally(() => setLoading(false));
  }, []);

  const filteredNews = useMemo(() => {
    const term = query.trim().toLowerCase();
    return [...newsItems]
      .filter((item) => {
        if (!term) return true;
        return `${item.title || ''} ${item.content || ''}`.toLowerCase().includes(term);
      })
      .sort((a, b) => {
        const aTime = new Date(a.createdAt || 0).getTime();
        const bTime = new Date(b.createdAt || 0).getTime();
        return sortBy === 'oldest' ? aTime - bTime : bTime - aTime;
      });
  }, [newsItems, query, sortBy]);

  return (
    <div className="news-page">
      <section className="section bg-primary" style={{ padding: '1.75rem 0', background: 'linear-gradient(135deg, #FF6000 0%, #ea580c 50%, #c2410c 100%)', color: 'white', textAlign: 'center', boxShadow: '0 4px 20px rgba(255, 96, 0, 0.2)' }}>
        <div className="container" style={{ maxWidth: '1320px', padding: '0 1.25rem' }}>
          <h1 style={{ fontSize: '2.1rem', fontWeight: 900, marginBottom: '0.35rem', letterSpacing: '-0.3px', textShadow: '0 2px 4px rgba(0,0,0,0.15)' }}>समाचार एवं नवीनतम घोषणाएँ</h1>
          <p style={{ fontSize: '1rem', opacity: 0.96, maxWidth: '750px', margin: '0 auto', lineHeight: 1.45, fontWeight: 500 }}>
            श्री मन्वत बाबा मंदिर ट्रस्ट की नवीनतम गतिविधियों, विकास कार्यों और समाचारों की जानकारी।
          </p>
        </div>
      </section>

      <section className="section" style={{ padding: '1.25rem 0 3.5rem 0', background: '#fdfbf7' }}>
        <div className="container" style={{ maxWidth: '1320px', padding: '0 1.25rem' }}>
          <div className="filter-panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '1.25rem', width: '100%', flexWrap: 'nowrap' }}>
            <div style={{ position: 'relative', flex: '1 1 auto', minWidth: '220px' }}>
              <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#ea580c' }} />
              <input
                className="filter-input"
                type="search"
                placeholder="समाचार खोजें..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{ paddingLeft: '2.75rem', width: '100%', borderRadius: '10px', border: '1px solid #cbd5e1', height: '40px', fontSize: '0.9rem', background: '#ffffff', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
              <select className="filter-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ borderRadius: '10px', border: '1px solid #cbd5e1', height: '40px', padding: '0 0.85rem', fontSize: '0.86rem', fontWeight: 600, color: '#334155', background: '#ffffff', cursor: 'pointer' }}>
                <option value="latest">नवीनतम (Latest first)</option>
                <option value="oldest">पुराना (Oldest first)</option>
              </select>
              {query && (
                <button className="btn btn-outline" type="button" onClick={() => { setQuery(''); setSortBy('latest'); }} style={{ borderRadius: '10px', height: '40px', padding: '0 0.75rem', color: '#ea580c', borderColor: '#fed7aa', background: '#fff7ed', fontSize: '0.84rem', fontWeight: 700 }}>
                  <X size={15} /> स्पष्ट
                </button>
              )}
              <div className="filter-count" style={{ background: '#fff7ed', border: '1px solid #fed7aa', color: '#c2410c', padding: '0 0.85rem', height: '40px', display: 'inline-flex', alignItems: 'center', borderRadius: '10px', fontWeight: 800, fontSize: '0.84rem', whiteSpace: 'nowrap' }}>
                {filteredNews.length} समाचार
              </div>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>समाचार लोड हो रहे हैं...</div>
          ) : filteredNews.length === 0 ? (
            <div className="empty-state" style={{ width: '100%', padding: '3rem', borderRadius: '16px', background: '#ffffff', textAlign: 'center', border: '1px dashed #cbd5e1', color: '#64748b' }}>कोई समाचार नहीं मिला।</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.75rem', width: '100%' }}>
              {filteredNews.map(item => (
                <div key={item._id} className="content-card" style={{ padding: '0', borderRadius: '18px', border: '1px solid #e2e8f0', background: '#ffffff', boxShadow: '0 8px 24px rgba(0,0,0,0.04)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <img
                    src={item.images && item.images[0] ? item.images[0] : 'https://placehold.co/400x250/FF6B00/FFFFFF?text=News'}
                    alt={item.title}
                    style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                  />
                  <div style={{ padding: '1.5rem', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '0.78rem', color: '#ea580c', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Newspaper size={14} />
                        {new Date(item.createdAt).toLocaleDateString('hi-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 0.75rem 0', color: '#0f172a', lineHeight: 1.3 }}>{item.title}</h3>
                      <p className="text-light" style={{ fontSize: '0.94rem', lineHeight: 1.6, color: '#475569', margin: 0 }}>{item.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default News;
