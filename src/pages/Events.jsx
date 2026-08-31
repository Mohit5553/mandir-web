import { useMemo, useState, useEffect } from 'react';
import { Calendar as CalendarIcon, MapPin, Search, X } from 'lucide-react';
import { api } from '../services/api';

const fallbackEvents = [
  { _id: 1, title: "Maha Shivratri Mahotsav", date: "2026-03-08", location: "Main Temple Premises", description: "Join us for the grand celebration of Maha Shivratri. All-night Jagran, special Abhishek, and continuous Mahaprasad distribution." },
  { _id: 2, title: "Daily Evening Aarti", date: "Everyday", location: "Main Temple Shrine", description: "Experience the divine bliss of the daily evening Sandhya Aarti." },
  { _id: 3, title: "Annual Annadan Camp", date: "2026-04-15", location: "Temple Community Hall", description: "Mass food distribution for the underprivileged. Volunteers are requested to register." }
];

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState('all');

  useEffect(() => {
    api.getEvents()
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setEvents(data);
        else setEvents(fallbackEvents);
      })
      .catch(() => setEvents(fallbackEvents))
      .finally(() => setLoading(false));
  }, []);

  const filteredEvents = useMemo(() => {
    const term = query.trim().toLowerCase();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return events.filter((event) => {
      const searchable = `${event.title || ''} ${event.location || ''} ${event.description || ''}`.toLowerCase();
      const matchesSearch = !term || searchable.includes(term);
      const isDaily = event.date === 'Everyday';
      const eventDate = isDaily ? null : new Date(event.date);
      const isUpcoming = isDaily || (eventDate instanceof Date && !Number.isNaN(eventDate.getTime()) && eventDate >= today);
      const isPast = !isDaily && eventDate instanceof Date && !Number.isNaN(eventDate.getTime()) && eventDate < today;

      if (timeFilter === 'upcoming') return matchesSearch && isUpcoming;
      if (timeFilter === 'past') return matchesSearch && isPast;
      if (timeFilter === 'daily') return matchesSearch && isDaily;
      return matchesSearch;
    });
  }, [events, query, timeFilter]);

  return (
    <div className="events-page">
      <section className="section bg-primary" style={{ padding: '1.75rem 0', background: 'linear-gradient(135deg, #FF6000 0%, #ea580c 50%, #c2410c 100%)', color: 'white', textAlign: 'center', boxShadow: '0 4px 20px rgba(255, 96, 0, 0.2)' }}>
        <div className="container" style={{ maxWidth: '1320px', padding: '0 1.25rem' }}>
          <h1 style={{ fontSize: '2.1rem', fontWeight: 900, marginBottom: '0.35rem', letterSpacing: '-0.3px', textShadow: '0 2px 4px rgba(0,0,0,0.15)' }}>आगामी कार्यक्रम एवं पूजा उत्सव</h1>
          <p style={{ fontSize: '1rem', opacity: 0.96, maxWidth: '750px', margin: '0 auto', lineHeight: 1.45, fontWeight: 500 }}>
            हमारे आगामी त्योहारों, विशेष पूजाओं, आरती समय एवं सामुदायिक सेवा कार्यक्रमों की नवीनतम जानकारी।
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
                placeholder="घटनाओं, स्थानों या विवरणों की खोज करें..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{ paddingLeft: '2.75rem', width: '100%', borderRadius: '10px', border: '1px solid #cbd5e1', height: '40px', fontSize: '0.9rem', background: '#ffffff', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
              <select className="filter-select" value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)} style={{ borderRadius: '10px', border: '1px solid #cbd5e1', height: '40px', padding: '0 0.85rem', fontSize: '0.86rem', fontWeight: 600, color: '#334155', background: '#ffffff', cursor: 'pointer' }}>
                <option value="all">सभी कार्यक्रम (All Events)</option>
                <option value="upcoming">आगामी कार्यक्रम (Upcoming)</option>
                <option value="daily">दैनिक कार्यक्रम (Daily)</option>
                <option value="past">विगत कार्यक्रम (Past)</option>
              </select>

              {(query || timeFilter !== 'all') && (
                <button className="btn btn-outline" type="button" onClick={() => { setQuery(''); setTimeFilter('all'); }} style={{ borderRadius: '10px', height: '40px', padding: '0 0.75rem', color: '#ea580c', borderColor: '#fed7aa', background: '#fff7ed', fontSize: '0.84rem', fontWeight: 700 }}>
                  <X size={15} /> स्पष्ट
                </button>
              )}

              <div className="filter-count" style={{ background: '#fff7ed', border: '1px solid #fed7aa', color: '#c2410c', padding: '0 0.85rem', height: '40px', display: 'inline-flex', alignItems: 'center', borderRadius: '10px', fontWeight: 800, fontSize: '0.84rem', whiteSpace: 'nowrap' }}>
                {filteredEvents.length} कार्यक्रम
              </div>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b', fontWeight: 600 }}>कार्यक्रम लोड हो रहे हैं...</div>
          ) : filteredEvents.length === 0 ? (
            <div className="empty-state" style={{ width: '100%', padding: '3rem', borderRadius: '16px', background: '#ffffff', textAlign: 'center', border: '1px dashed #cbd5e1', color: '#64748b' }}>कोई कार्यक्रम नहीं मिला। कृपया अन्य खोज शब्द का प्रयास करें।</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.75rem', width: '100%' }}>
              {filteredEvents.map(event => (
                <div key={event._id} className="content-card" style={{ padding: '1.5rem', borderRadius: '18px', border: '1px solid #e2e8f0', background: '#ffffff', boxShadow: '0 8px 24px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'all 0.25s ease' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                      <div style={{ background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)', border: '1px solid #fed7aa', padding: '0.85rem 1rem', borderRadius: '14px', textAlign: 'center', minWidth: '85px', boxShadow: '0 2px 6px rgba(234,88,12,0.08)' }}>
                        <CalendarIcon size={24} color="#ea580c" style={{ marginBottom: '0.25rem' }} />
                        <div style={{ fontWeight: 800, color: '#c2410c', fontSize: '0.82rem', letterSpacing: '0.3px' }}>
                          {event.date && event.date !== 'Everyday' ? new Date(event.date).toLocaleDateString('hi-IN', { day: 'numeric', month: 'short' }) : 'दैनिक'}
                        </div>
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 0.35rem 0', color: '#0f172a', lineHeight: 1.3 }}>{event.title}</h3>
                        {event.location && (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#64748b', fontSize: '0.84rem', fontWeight: 600 }}>
                            <MapPin size={14} color="#ea580c" /> {event.location}
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-light" style={{ fontSize: '0.94rem', lineHeight: 1.6, color: '#475569', margin: 0 }}>{event.description}</p>
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

export default Events;
