import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, MapPin, Clock } from 'lucide-react';
import { api } from '../services/api';

const fallbackEvents = [
  { _id: 1, title: "Maha Shivratri Mahotsav", date: "2026-03-08", location: "Main Temple Premises", description: "Join us for the grand celebration of Maha Shivratri. All-night Jagran, special Abhishek, and continuous Mahaprasad distribution." },
  { _id: 2, title: "Daily Evening Aarti", date: "Everyday", location: "Main Temple Shrine", description: "Experience the divine bliss of the daily evening Sandhya Aarti." },
  { _id: 3, title: "Annual Annadan Camp", date: "2026-04-15", location: "Temple Community Hall", description: "Mass food distribution for the underprivileged. Volunteers are requested to register." }
];

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getEvents()
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setEvents(data);
        else setEvents(fallbackEvents);
      })
      .catch(() => setEvents(fallbackEvents))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="events-page">
      <section className="section bg-primary" style={{ padding: '4rem 0', color: 'white', textAlign: 'center' }}>
        <div className="container">
          <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem' }}>Upcoming Events</h1>
          <p style={{ fontSize: '1.25rem', opacity: 0.9, maxWidth: '600px', margin: '0 auto' }}>
            Stay updated with our upcoming festivals, poojas, and community service events.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-light)' }}>Loading events...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '900px', margin: '0 auto' }}>
              {events.map(event => (
                <div key={event._id} className="content-card" style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                  <div style={{ background: 'var(--color-primary-alpha)', padding: '1.5rem', borderRadius: 'var(--radius-md)', textAlign: 'center', minWidth: '100px' }}>
                    <CalendarIcon size={32} color="var(--color-primary)" style={{ marginBottom: '0.5rem' }} />
                    <div style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '0.85rem' }}>
                      {event.date && event.date !== 'Everyday' ? new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Daily'}
                    </div>
                  </div>
                  <div style={{ flexGrow: 1 }}>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>{event.title}</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem', color: 'var(--color-text-light)', fontSize: '0.9rem' }}>
                      {event.location && <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><MapPin size={16} /> {event.location}</div>}
                    </div>
                    <p className="text-light">{event.description}</p>
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
