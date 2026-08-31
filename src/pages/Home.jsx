import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Bell,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock3,
  HandHeart,
  Heart,
  Image as ImageIcon,
  IndianRupee,
  Landmark,
  MapPin,
  Megaphone,
  Newspaper,
  Quote,
  Sparkles,
  Users
} from 'lucide-react';
import { api } from '../services/api';
import ReviewSection from '../components/ReviewSection';

const fallbackSections = [
  { key: 'announcement', label: 'Announcement Bar', enabled: true, order: 1 },
  { key: 'timings', label: 'Darshan & Aarti Timings', enabled: true, order: 2 },
  { key: 'countdown', label: 'Festival Countdown', enabled: true, order: 3 },
  { key: 'donationImpact', label: 'Donation Impact', enabled: true, order: 4 },
  { key: 'galleryHighlights', label: 'Photo & Video Highlights', enabled: true, order: 5 },
  { key: 'transparency', label: 'Trust Transparency', enabled: true, order: 6 },
  { key: 'volunteer', label: 'Volunteer Registration', enabled: true, order: 7 },
  { key: 'trustMessages', label: 'Trust Updates', enabled: true, order: 8 },
  { key: 'testimonials', label: 'Testimonials', enabled: true, order: 9 },
  { key: 'timeline', label: 'Temple Timeline', enabled: true, order: 10 },
  { key: 'news', label: 'Featured News', enabled: true, order: 11 },
  { key: 'events', label: 'Featured Events', enabled: true, order: 12 },
  { key: 'management', label: 'Trust Management', enabled: true, order: 13 }
];

const Home = () => {
  const [carouselItems, setCarouselItems] = useState([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [newsItems, setNewsItems] = useState([]);
  const [events, setEvents] = useState([]);
  const [management, setManagement] = useState({ categories: [], members: [] });
  const [galleryItems, setGalleryItems] = useState([]);
  const [reportData, setReportData] = useState(null);
  const [siteContent, setSiteContent] = useState(null);
  const [volunteerForm, setVolunteerForm] = useState({
    name: '',
    phone: '',
    email: '',
    sevaType: 'Annadan Seva',
    availability: '',
    message: ''
  });
  const [volunteerStatus, setVolunteerStatus] = useState('');
  const [volunteerLoading, setVolunteerLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      api.getCarousel(true),
      api.getNews(),
      api.getEvents(),
      api.getTrustManagement(),
      api.getGallery(),
      localStorage.getItem('adminToken') ? api.getReports().catch(() => null) : Promise.resolve(null),
      api.getSiteContent()
    ]).then(([carouselData, newsData, eventData, trustData, galleryData, reports, content]) => {
      setCarouselItems(Array.isArray(carouselData) ? carouselData : []);
      setNewsItems(Array.isArray(newsData) ? newsData : []);
      setEvents(Array.isArray(eventData) ? eventData : []);
      setManagement({
        categories: Array.isArray(trustData?.categories) ? trustData.categories : [],
        members: Array.isArray(trustData?.members) ? trustData.members : []
      });
      setGalleryItems(Array.isArray(galleryData) ? galleryData : []);
      setReportData(reports?.message ? null : reports);
      setSiteContent(content?.message ? null : content);
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

  const latestNews = useMemo(() => {
    const featured = newsItems.filter(item => item.featuredOnHome);
    const source = featured.length ? featured : newsItems;
    return [...source]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 3);
  }, [newsItems]);

  const upcomingEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const filtered = [...events]
      .filter(event => {
        const eventDate = new Date(event.date);
        return !Number.isNaN(eventDate.getTime()) && eventDate >= today;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    const featured = filtered.filter(item => item.featuredOnHome);
    return (featured.length ? featured : filtered).slice(0, 3);
  }, [events]);

  const featuredMembers = useMemo(() => (
    [...management.members]
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .slice(0, 6)
  ), [management.members]);

  const featuredGallery = useMemo(() => {
    const featured = galleryItems.filter(item => item.featuredOnHome);
    return (featured.length ? featured : galleryItems).slice(0, 5);
  }, [galleryItems]);

  const sortedSections = useMemo(() => {
    const sections = siteContent?.sections?.length ? siteContent.sections : fallbackSections;
    return [...sections]
      .filter(section => section.enabled)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [siteContent]);

  const transparencyCards = useMemo(() => [
    { label: 'Total Donations', value: reportData?.donations?.approvedCount ?? 0, note: 'Approved contributions' },
    { label: 'Total Collected', value: `₹${Number(reportData?.donations?.total || 0).toLocaleString('en-IN')}`, note: 'All-time approved donations' },
    { label: 'This Month', value: `₹${Number(reportData?.donations?.thisMonth || 0).toLocaleString('en-IN')}`, note: 'Current month collection' },
    { label: 'Top Category', value: reportData?.donations?.topCategory?.name || 'General Donation', note: 'Most supported cause' }
  ], [reportData]);

  const countdown = useMemo(() => {
    const target = siteContent?.festivalCountdown?.eventDate ? new Date(siteContent.festivalCountdown.eventDate) : null;
    if (!target || Number.isNaN(target.getTime())) return null;
    const now = new Date();
    const diff = target.getTime() - now.getTime();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0 };
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60)
    };
  }, [siteContent]);

  const goToSlide = (index) => {
    if (!carouselItems.length) return;
    setActiveSlide((index + carouselItems.length) % carouselItems.length);
  };

  const formatDate = (date) => {
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return '-';
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

  const handleVolunteerSubmit = async (e) => {
    e.preventDefault();
    setVolunteerLoading(true);
    setVolunteerStatus('');
    const response = await api.createVolunteer(volunteerForm);
    if (response?.message && !response?._id) {
      setVolunteerStatus(response.message);
    } else {
      setVolunteerStatus('Your seva registration has been submitted.');
      setVolunteerForm({
        name: '',
        phone: '',
        email: '',
        sevaType: 'Annadan Seva',
        availability: '',
        message: ''
      });
    }
    setVolunteerLoading(false);
  };

  const renderSection = (key) => {
    if (key === 'announcement' && siteContent?.announcement?.enabled && siteContent.announcement.text) {
      return (
        <section key={key} className="section home-slim-section">
          <div className="container">
            <div className="home-announcement-bar">
              <Megaphone size={18} />
              <span>{siteContent.announcement.text}</span>
            </div>
          </div>
        </section>
      );
    }

    if (key === 'timings') {
      return (
        <section key={key} className="section home-slim-section">
          <div className="container">
            <div className="home-section-heading">
              <div>
                <span><Clock3 size={18} /> Daily Darshan & Aarti</span>
                <h2>Temple Timings</h2>
              </div>
            </div>
            <div className="home-timings-grid">
              <div className="content-card">
                <h3>Darshan Timings</h3>
                <div className="home-timing-list">
                  {(siteContent?.darshanTimings || []).map((item, index) => (
                    <article key={`darshan-${index}`}>
                      <strong>{item.label}</strong>
                      <span>{item.time}</span>
                      <p>{item.note}</p>
                    </article>
                  ))}
                </div>
              </div>
              <div className="content-card">
                <h3>Special Pooja Timings</h3>
                <div className="home-timing-list">
                  {(siteContent?.specialPoojaTimings || []).map((item, index) => (
                    <article key={`pooja-${index}`}>
                      <strong>{item.label}</strong>
                      <span>{item.time}</span>
                      <p>{item.note}</p>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      );
    }

    if (key === 'countdown' && siteContent?.festivalCountdown?.enabled) {
      return (
        <section key={key} className="section home-slim-section">
          <div className="container">
            <div className="content-card home-countdown-card">
              <div>
                <span className="home-section-chip"><Sparkles size={16} /> Festival Countdown</span>
                <h2>{siteContent.festivalCountdown.title}</h2>
                <p>{siteContent.festivalCountdown.subtitle}</p>
              </div>
              <div className="home-countdown-stats">
                <article><strong>{countdown?.days ?? '-'}</strong><span>Days</span></article>
                <article><strong>{countdown?.hours ?? '-'}</strong><span>Hours</span></article>
                <article><strong>{countdown?.minutes ?? '-'}</strong><span>Minutes</span></article>
              </div>
            </div>
          </div>
        </section>
      );
    }

    if (key === 'donationImpact' && siteContent?.donationImpact?.length) {
      return (
        <section key={key} className="section">
          <div className="container">
            <div className="home-section-heading">
              <div>
                <span><Heart size={18} /> Donation Impact</span>
                <h2>What Your Support Helps Us Do</h2>
              </div>
              <Link to="/donate" className="btn btn-outline">Support Now <ArrowRight size={17} /></Link>
            </div>
            <div className="home-impact-grid">
              {siteContent.donationImpact.map((item, index) => (
                <article key={`impact-${index}`} className="content-card home-impact-card">
                  <Heart size={20} />
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      );
    }

    if (key === 'galleryHighlights' && featuredGallery.length) {
      return (
        <section key={key} className="section">
          <div className="container">
            <div className="home-section-heading">
              <div>
                <span><ImageIcon size={18} /> Featured Highlights</span>
                <h2>Photo & Video Highlights</h2>
              </div>
              <Link to="/gallery" className="btn btn-outline">View Gallery <ArrowRight size={17} /></Link>
            </div>
            <div className="home-gallery-grid">
              {featuredGallery.map((item) => (
                <article key={item._id} className="home-gallery-card">
                  {item.type === 'video' ? (
                    <video src={item.imageUrl || item.url} muted playsInline controls />
                  ) : (
                    <img src={item.imageUrl || item.url} alt={item.title} />
                  )}
                  <div>
                    <span>{item.type === 'video' ? 'Featured Video' : 'Featured Photo'}</span>
                    <strong>{item.title || 'Temple Activity'}</strong>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      );
    }

    if (key === 'transparency' && reportData) {
      return (
        <section key={key} className="section home-transparency-band bg-mandala">
          <div className="container">
            <div className="home-section-heading">
              <div>
                <span><IndianRupee size={18} /> Trust Transparency</span>
                <h2>Donation & Reporting Overview</h2>
              </div>
            </div>
            <div className="home-transparency-grid">
              <div className="home-transparency-cards">
                {transparencyCards.map((item) => (
                  <article key={item.label} className="content-card home-transparency-card">
                    <strong>{item.value}</strong>
                    <h3>{item.label}</h3>
                    <p>{item.note}</p>
                  </article>
                ))}
              </div>
              <div className="content-card home-transparency-panel">
                <h3>Recent Approved Donations</h3>
                <div className="home-mini-donations">
                  {(reportData.recentDonations || []).slice(0, 4).map((item) => (
                    <article key={item._id}>
                      <div>
                        <strong>{item.name}</strong>
                        <span>{item.category}</span>
                      </div>
                      <b>{`₹${Number(item.amount || 0).toLocaleString('en-IN')}`}</b>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      );
    }

    if (key === 'volunteer') {
      return (
        <section key={key} className="section">
          <div className="container home-volunteer-grid">
            <div>
              <span className="home-section-chip"><HandHeart size={16} /> Volunteer / Seva Registration</span>
              <h2>Offer your time and join trust seva activities.</h2>
              <p className="text-light">
                Devotees can help with Annadan, temple cleaning, Gau Seva, event support, and trust management activities.
                Submit your details and the trust team can connect with you.
              </p>
            </div>
            <form className="content-card home-volunteer-form" onSubmit={handleVolunteerSubmit}>
              <input value={volunteerForm.name} onChange={e => setVolunteerForm({ ...volunteerForm, name: e.target.value })} placeholder="Full name" required />
              <input value={volunteerForm.phone} onChange={e => setVolunteerForm({ ...volunteerForm, phone: e.target.value })} placeholder="Phone number" required />
              <input value={volunteerForm.email} onChange={e => setVolunteerForm({ ...volunteerForm, email: e.target.value })} placeholder="Email (optional)" />
              <select value={volunteerForm.sevaType} onChange={e => setVolunteerForm({ ...volunteerForm, sevaType: e.target.value })}>
                <option>Annadan Seva</option>
                <option>Gau Seva</option>
                <option>Temple Cleaning</option>
                <option>Festival Support</option>
                <option>Trust Management Help</option>
              </select>
              <input value={volunteerForm.availability} onChange={e => setVolunteerForm({ ...volunteerForm, availability: e.target.value })} placeholder="Availability" />
              <textarea rows="4" value={volunteerForm.message} onChange={e => setVolunteerForm({ ...volunteerForm, message: e.target.value })} placeholder="Tell us how you would like to help" />
              {volunteerStatus && <p className="home-form-status">{volunteerStatus}</p>}
              <button className="btn btn-primary" type="submit" disabled={volunteerLoading}>
                {volunteerLoading ? 'Submitting...' : 'Submit Seva Request'}
              </button>
            </form>
          </div>
        </section>
      );
    }

    if (key === 'trustMessages' && siteContent?.trustMessages?.length) {
      return (
        <section key={key} className="section">
          <div className="container">
            <div className="home-section-heading">
              <div>
                <span><Megaphone size={18} /> Trust Updates</span>
                <h2>Messages from the Trust</h2>
              </div>
            </div>
            <div className="home-message-grid">
              {siteContent.trustMessages.map((item, index) => (
                <article key={`message-${index}`} className="content-card home-message-card">
                  <Quote size={20} />
                  <p>{item.message}</p>
                  <strong>{item.author}</strong>
                  <span>{item.role}</span>
                </article>
              ))}
            </div>
          </div>
        </section>
      );
    }

    if (key === 'testimonials' && siteContent?.testimonials?.length) {
      return (
        <section key={key} className="section home-testimonial-band">
          <div className="container">
            <div className="home-section-heading">
              <div>
                <span><Quote size={18} /> Devotee Experiences</span>
                <h2>What Visitors Say</h2>
              </div>
            </div>
            <div className="home-testimonial-grid">
              {siteContent.testimonials.map((item, index) => (
                <article key={`testimonial-${index}`} className="content-card home-testimonial-card">
                  <p>{item.message}</p>
                  <strong>{item.name}</strong>
                  <span>{item.location}</span>
                </article>
              ))}
            </div>
          </div>
        </section>
      );
    }

    if (key === 'timeline' && siteContent?.timeline?.length) {
      return (
        <section key={key} className="section">
          <div className="container">
            <div className="home-section-heading">
              <div>
                <span><Landmark size={18} /> Temple History</span>
                <h2>Trust & Temple Timeline</h2>
              </div>
            </div>
            <div className="home-timeline-list">
              {siteContent.timeline.map((item, index) => (
                <article key={`timeline-${index}`} className="content-card home-timeline-card">
                  <strong>{item.year}</strong>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      );
    }

    if (key === 'news' && latestNews.length) {
      return (
        <section key={key} className="section home-preview-section">
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
      );
    }

    if (key === 'events' && upcomingEvents.length) {
      return (
        <section key={key} className="section home-preview-section home-events-band bg-mandala">
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
      );
    }

    if (key === 'management' && featuredMembers.length) {
      return (
        <section key={key} className="section home-preview-section">
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
      );
    }

    return null;
  };

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
          <h1 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1.5rem', color: '#ffffff', lineHeight: 1.2, textShadow: '0 2px 24px rgba(0,0,0,0.5)' }}>
            श्री मनवट बाबा <br /> महाशिव मंदिर ट्रस्ट
          </h1>
          <p style={{ fontSize: '1.25rem', color: '#fed7aa', maxWidth: '800px', margin: '0 auto 2.5rem', fontFamily: "'Outfit', sans-serif", fontWeight: 500 }}>
            बैरमपुर, करनैलगंज - गोंडा (उत्तर प्रदेश) - पंजीकृत संस्था: 4/5/389/428/9
          </p>
          <div className="responsive-actions" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/donate" className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.125rem' }}>
              <Heart size={20} /> Donate Now
            </Link>
            <Link to="/about" className="btn" style={{ padding: '1rem 2.5rem', fontSize: '1.125rem', background: 'rgba(255,255,255,0.15)', color: '#fff', border: '2px solid rgba(255,255,255,0.5)', backdropFilter: 'blur(6px)' }}>
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

      {sortedSections.map((section) => renderSection(section.key))}
      <ReviewSection />
    </div>
  );
};

export default Home;
