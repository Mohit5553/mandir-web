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
      <section className="section bg-primary" style={{ padding: '4rem 0', color: 'white', textAlign: 'center' }}>
        <div className="container">
          <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem' }}>News & Announcements</h1>
          <p style={{ fontSize: '1.25rem', opacity: 0.9, maxWidth: '600px', margin: '0 auto' }}>
            Latest updates, achievements, and announcements from the Temple Trust.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="filter-panel">
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-light)' }} />
              <input
                className="filter-input"
                type="search"
                placeholder="Search news by title or keyword"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
            <select className="filter-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="latest">Latest first</option>
              <option value="oldest">Oldest first</option>
            </select>
            <button className="btn btn-outline" type="button" onClick={() => { setQuery(''); setSortBy('latest'); }}>
              <X size={16} /> Clear
            </button>
            <div className="filter-count">{filteredNews.length} news found</div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-light)' }}>Loading news...</div>
          ) : filteredNews.length === 0 ? (
            <div className="empty-state">No news found. Try another search.</div>
          ) : (
            <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
              {filteredNews.map(item => (
                <div key={item._id} className="content-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <img
                    src={item.images && item.images[0] ? item.images[0] : 'https://placehold.co/400x250/FF6B00/FFFFFF?text=News'}
                    alt={item.title}
                    style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                  />
                  <div style={{ padding: '1.5rem', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Newspaper size={14} />
                      {new Date(item.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>{item.title}</h3>
                    <p className="text-light" style={{ marginBottom: '1.5rem', flexGrow: 1 }}>{item.content}</p>
                    <button className="btn btn-outline" style={{ width: '100%' }}>Read More</button>
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
