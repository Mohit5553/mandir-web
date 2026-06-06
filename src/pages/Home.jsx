import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Bell,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Heart,
  Image as ImageIcon,
  MapPin,
  Newspaper,
  Users
} from 'lucide-react';
import { api } from '../services/api';

const Home = () => {
  const [carouselItems, setCarouselItems] = useState([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [newsItems, setNewsItems] = useState([]);
  const [events, setEvents] = useState([]);
  const [management, setManagement] = useState({ categories: [], members: [] });

  useEffect(() => {
    Promise.all([
      api.getCarousel(true),
      api.getNews(),
      api.getEvents(),
      api.getTrustManagement()
    ]).then(([carouselData, newsData, eventData, trustData]) => {
      setCarouselItems(Array.isArray(carouselData) ? carouselData : []);
      setNewsItems(Array.isArray(newsData) ? newsData : []);
      setEvents(Array.isArray(eventData) ? eventData : []);
      setManagement({
        categories: Array.isArray(trustData?.categories) ? trustData.categories : [],
        members: Array.isArray(trustData?.members) ? trustData.members : []
      });
      setActiveSlide(0);
    });
  }, []);

  useEffect(() => {
    if (carouselItems.length <= 1) return undefined;

    const timer = window.setInterval(() => {
      setActiveSlide(current => (current + 1) % carouselItems.length);
    }, 5500);

    return () => window.clearInterval(timer);
  }, [carouselItems.length]);

  const latestNews = useMemo(() => (
    [...newsItems]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 3)
  ), [newsItems]);

  const upcomingEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return [...events]
      .filter(event => {
        if (event.date === 'Everyday') return true;
        const eventDate = new Date(event.date);
        return !Number.isNaN(eventDate.getTime()) && eventDate >= today;
      })
      .sort((a, b) => {
        if (a.date === 'Everyday') return -1;
        if (b.date === 'Everyday') return 1;
        return new Date(a.date) - new Date(b.date);
      })
      .slice(0, 3);
  }, [events]);

  const featuredMembers = useMemo(() => (
    [...management.members]
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .slice(0, 6)
  ), [management.members]);

  const goToSlide = (index) => {
    if (!carouselItems.length) return;
    setActiveSlide((index + carouselItems.length) % carouselItems.length);
  };

  const formatDate = (date) => {
    if (!date || date === 'Everyday') return 'Daily';
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return date;
    return parsed.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const renderAvatar = (member) => (
    member.photoUrl ? (
      <img className="trust-member-avatar trust-member-avatar-md" src={member.photoUrl} alt={member.name} />
    ) : (
      <span className="trust-member-avatar trust-member-avatar-md trust-member-photo-icon" aria-label="No photo uploaded">
        <ImageIcon size={22} />
      </span>
    )
  );

  return (
    <div>
      <section className={`hero home-hero ${carouselItems.length ? 'has-carousel' : ''}`}>
        {carouselItems.length > 0 && (
          <div className="home-hero-carousel" aria-hidden="true">
            {carouselItems.map((item, index) => (
              <div key={item._id || index} className={`home-hero-slide ${index === activeSlide ? 'active' : ''}`}>
                {item.mediaType === 'video' ? (
                  <video src={item.mediaUrl} autoPlay muted loop playsInline />
                ) : (
                  <img src={item.mediaUrl} alt="" />
                )}
              </div>
            ))}
          </div>
        )}

        <div className="home-hero-overlay" />

        {carouselItems.length > 1 && (
          <>
            <button type="button" className="home-carousel-nav prev" onClick={() => goToSlide(activeSlide - 1)} aria-label="Previous slide">
              <ChevronLeft size={22} />
            </button>
            <button type="button" className="home-carousel-nav next" onClick={() => goToSlide(activeSlide + 1)} aria-label="Next slide">
              <ChevronRight size={22} />
            </button>
          </>
        )}

        <div className="container home-hero-content" style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--color-primary-dark)', lineHeight: 1.2 }}>
            श्री मनवट बाबा <br /> महाशिव मंदिर ट्रस्ट
          </h1>
          <p style={{ fontSize: '1.25rem', color: '#ffffff', maxWidth: '800px', margin: '0 auto 2.5rem' }}>
            बैरमपुर, करनैलगंज - गोंडा (उत्तर प्रदेश) - पंजीकृत संस्था: 4/5/389/428/9
          </p>
          <div className="responsive-actions" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/donate" className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.125rem' }}>
              <Heart size={20} /> Donate Now
            </Link>
            <Link to="/about" className="btn btn-outline" style={{ padding: '1rem 2.5rem', fontSize: '1.125rem' }}>
              Learn More
            </Link>
          </div>
        </div>

        {carouselItems.length > 1 && (
          <div className="home-carousel-dots" aria-label="Carousel slides">
            {carouselItems.map((item, index) => (
              <button
                key={item._id || index}
                type="button"
                className={index === activeSlide ? 'active' : ''}
                onClick={() => goToSlide(index)}
                aria-label={`Show slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </section>

      <section className="section">
        <div className="container">
          <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <div className="content-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--color-primary-alpha)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', marginBottom: '1.5rem' }}>
                <Bell size={32} />
              </div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Latest News</h3>
              <p style={{ color: 'var(--color-text-light)', marginBottom: '1.5rem', flexGrow: 1 }}>
                Stay updated with our latest announcements and trust activities.
              </p>
              <Link to="/news" style={{ color: 'var(--color-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                View All News <ArrowRight size={18} />
              </Link>
            </div>

            <div className="content-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--color-primary-alpha)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', marginBottom: '1.5rem' }}>
                <Calendar size={32} />
              </div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Upcoming Events</h3>
              <p style={{ color: 'var(--color-text-light)', marginBottom: '1.5rem', flexGrow: 1 }}>
                Join our upcoming festivals, poojas, and community service events.
              </p>
              <Link to="/events" style={{ color: 'var(--color-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                View Calendar <ArrowRight size={18} />
              </Link>
            </div>

            <div className="content-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--color-primary-alpha)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', marginBottom: '1.5rem' }}>
                <Users size={32} />
              </div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Trust Management</h3>
              <p style={{ color: 'var(--color-text-light)', marginBottom: '1.5rem', flexGrow: 1 }}>
                Meet the temple committee and supporting members serving the trust.
              </p>
              <Link to="/about" style={{ color: 'var(--color-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                View Members <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {latestNews.length > 0 && (
        <section className="section home-preview-section">
          <div className="container">
            <div className="home-section-heading">
              <div>
                <span><Newspaper size={18} /> News</span>
                <h2>Latest Announcements</h2>
              </div>
              <Link to="/news" className="btn btn-outline">View All <ArrowRight size={17} /></Link>
            </div>
            <div className="responsive-grid home-preview-grid">
              {latestNews.map(item => (
                <article key={item._id} className="content-card home-news-card">
                  <img src={item.images?.[0] || 'https://placehold.co/600x360/FF6B00/FFFFFF?text=News'} alt={item.title} />
                  <div>
                    <p>{formatDate(item.createdAt)}</p>
                    <h3>{item.title}</h3>
                    <span>{item.content}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {upcomingEvents.length > 0 && (
        <section className="section home-preview-section home-events-band">
          <div className="container">
            <div className="home-section-heading">
              <div>
                <span><Calendar size={18} /> Events</span>
                <h2>Upcoming Events</h2>
              </div>
              <Link to="/events" className="btn btn-outline">View All <ArrowRight size={17} /></Link>
            </div>
            <div className="home-event-list">
              {upcomingEvents.map(event => (
                <article key={event._id} className="content-card home-event-card">
                  <div className="home-event-date">
                    <Calendar size={24} />
                    <strong>{formatDate(event.date)}</strong>
                  </div>
                  <div>
                    <h3>{event.title}</h3>
                    {event.location && <p><MapPin size={16} /> {event.location}</p>}
                    <span>{event.description}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {featuredMembers.length > 0 && (
        <section className="section home-preview-section">
          <div className="container">
            <div className="home-section-heading">
              <div>
                <span><Users size={18} /> Trust Management</span>
                <h2>Committee Members</h2>
              </div>
              <Link to="/about" className="btn btn-outline">View All <ArrowRight size={17} /></Link>
            </div>
            <div className="responsive-grid home-member-grid">
              {featuredMembers.map(member => (
                <article key={member._id || `${member.role}-${member.name}`} className="content-card home-member-card">
                  {renderAvatar(member)}
                  <div>
                    <span>{member.role || 'Member'}</span>
                    <strong>{member.name}</strong>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
