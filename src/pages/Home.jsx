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
  { key: 'announcement', label: 'सूचना पट्टी', enabled: true, order: 1 },
  { key: 'timings', label: 'दर्शन एवं आरती समय', enabled: true, order: 2 },
  { key: 'countdown', label: 'महोत्सव उलटी गिनती', enabled: true, order: 3 },
  { key: 'donationImpact', label: 'दान का प्रभाव', enabled: true, order: 4 },
  { key: 'galleryHighlights', label: 'गैलरी झलकियां', enabled: true, order: 5 },
  { key: 'transparency', label: 'पारदर्शी प्रबंधन', enabled: true, order: 6 },
  { key: 'volunteer', label: 'स्वयंसेवक पंजीकरण', enabled: true, order: 7 },
  { key: 'trustMessages', label: 'ट्रस्ट संदेश', enabled: true, order: 8 },
  { key: 'testimonials', label: 'श्रद्धालु अनुभव', enabled: true, order: 9 },
  { key: 'timeline', label: 'विकास यात्रा', enabled: true, order: 10 },
  { key: 'news', label: 'नवीनतम समाचार', enabled: true, order: 11 },
  { key: 'events', label: 'आगामी आयोजन', enabled: true, order: 12 },
  { key: 'management', label: 'ट्रस्ट प्रबंधन', enabled: true, order: 13 }
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
      .slice(0, 4)
  ), [management.members]);

  const featuredGallery = useMemo(() => {
    return galleryItems.filter(item => item.featuredOnHome).slice(0, 6);
  }, [galleryItems]);

  const sortedSections = useMemo(() => {
    const sections = siteContent?.sections?.length ? siteContent.sections : fallbackSections;
    return [...sections]
      .filter(section => section.enabled)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [siteContent]);

  const transparencyCards = useMemo(() => [
    { label: 'कुल दान संख्या', value: reportData?.donations?.approvedCount ?? 0, note: 'स्वीकृत योगदान' },
    { label: 'कुल एकत्रित राशि', value: `₹${Number(reportData?.donations?.total || 0).toLocaleString('hi-IN')}`, note: 'अब तक प्राप्त स्वीकृत दान' },
    { label: 'इस माह दान', value: `₹${Number(reportData?.donations?.thisMonth || 0).toLocaleString('hi-IN')}`, note: 'वर्तमान माह का संग्रह' },
    { label: 'मुख्य सेवा श्रेणी', value: reportData?.donations?.topCategory?.name || 'सामान्य दान', note: 'सर्वाधिक समर्थित सेवा' }
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
    return parsed.toLocaleDateString('hi-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const renderAvatar = (member) => {
    if (member.photoUrl) {
      return (
        <img 
          src={member.photoUrl} 
          alt={member.name} 
          style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #ffffff', boxShadow: '0 0 0 2px #fed7aa, 0 3px 8px rgba(255,96,0,0.12)', flexShrink: 0 }} 
        />
      );
    }
    const initial = member.name ? member.name.trim().charAt(0) : 'म';
    return (
      <div 
        style={{ 
          width: '48px', 
          height: '48px', 
          borderRadius: '50%', 
          background: 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)', 
          border: '2px solid #ffffff', 
          boxShadow: '0 0 0 2px #ffedd5, 0 3px 8px rgba(255,96,0,0.1)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          color: '#9a3412', 
          fontWeight: 900, 
          fontSize: '1.15rem', 
          flexShrink: 0 
        }}
      >
        {initial}
      </div>
    );
  };

  const handleVolunteerSubmit = async (e) => {
    e.preventDefault();
    setVolunteerLoading(true);
    setVolunteerStatus('');
    const response = await api.createVolunteer(volunteerForm);
    if (response?.message && !response?._id) {
      setVolunteerStatus(response.message);
    } else {
      setVolunteerStatus('आपकी सेवा पंजीकरण की जानकारी सफलतापूर्वक प्राप्त हो गई है।');
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
                <span><Clock3 size={18} /> दैनिक दर्शन एवं आरती समय</span>
                <h2>मंदिर दर्शन एवं आरती समय</h2>
              </div>
            </div>
            <div className="home-timings-grid">
              <div className="content-card">
                <h3>दर्शन समय</h3>
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
                <h3>विशेष पूजा एवं आरती समय</h3>
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
                <span className="home-section-chip"><Sparkles size={16} /> महोत्सव उलटी गिनती</span>
                <h2>{siteContent.festivalCountdown.title}</h2>
                <p>{siteContent.festivalCountdown.subtitle}</p>
              </div>
              <div className="home-countdown-stats">
                <article><strong>{countdown?.days ?? '-'}</strong><span>दिन</span></article>
                <article><strong>{countdown?.hours ?? '-'}</strong><span>घंटे</span></article>
                <article><strong>{countdown?.minutes ?? '-'}</strong><span>मिनट</span></article>
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
                <span><Heart size={18} /> दान का प्रभाव</span>
                <h2>आपके सहयोग से होने वाले कार्य</h2>
              </div>
              <Link to="/donate" className="btn btn-outline">सहयोग करें <ArrowRight size={17} /></Link>
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
                <span><ImageIcon size={18} /> मुख्य झलकियां</span>
                <h2>छायाचित्र एवं वीडियो झलकियां</h2>
              </div>
              <Link to="/gallery" className="btn btn-outline">गैलरी देखें <ArrowRight size={17} /></Link>
            </div>
            <div className="home-gallery-grid">
              {featuredGallery.map((item) => (
                <article key={item._id} className="home-gallery-card">
                  {item.type === 'video' ? (
                    <video
                      src={item.imageUrl || item.url}
                      muted
                      playsInline
                      controls
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <img
                      src={item.imageUrl || item.url || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop'}
                      alt={item.title || 'मंदिर दर्शन'}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop';
                      }}
                    />
                  )}
                  <div>
                    <span>{item.type === 'video' ? 'विशेष वीडियो' : 'विशेष फोटो'}</span>
                    <strong>{item.title || 'मंदिर गतिविधि'}</strong>
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
                <span><IndianRupee size={18} /> पारदर्शी प्रबंधन</span>
                <h2>दान एवं वित्तीय विवरण</h2>
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
                <h3>हाल ही में स्वीकृत दान</h3>
                <div className="home-mini-donations">
                  {(reportData.recentDonations || []).slice(0, 4).map((item) => (
                    <article key={item._id}>
                      <div>
                        <strong>{item.name}</strong>
                        <span>{item.category}</span>
                      </div>
                      <b>{`₹${Number(item.amount || 0).toLocaleString('hi-IN')}`}</b>
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
        <section key={key} className="section home-volunteer-section">
          <div className="container home-volunteer-grid" style={{ alignItems: 'center', gap: '2.5rem' }}>
            <div>
              <span className="home-section-chip" style={{ marginBottom: '0.85rem' }}><HandHeart size={16} /> स्वयंसेवक / सेवा पंजीकरण</span>
              <h2 style={{ fontSize: '2.1rem', fontWeight: 900, lineHeight: 1.25, margin: '0 0 0.85rem 0', color: '#0f172a' }}>
                अपना समय अर्पित करें और मंदिर सेवा कार्यों से जुड़ें।
              </h2>
              <p className="text-light" style={{ fontSize: '0.98rem', lineHeight: 1.6, color: '#475569', margin: '0 0 1.5rem 0' }}>
                भक्तजन अन्नदान, मंदिर स्वच्छता, गौ सेवा, पर्व आयोजनों तथा ट्रस्ट प्रबंधन कार्यों में सहयोग कर सकते हैं।
                अपनी जानकारी दर्ज करें, ट्रस्ट समिति आपसे संपर्क करेगी।
              </p>

              {/* Informative Seva Cards to balance left and right columns */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div style={{ padding: '0.85rem 1rem', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#ffffff', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 800 }}>🍲</div>
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.88rem', color: '#9a3412', fontWeight: 800 }}>अन्नदान सेवा</strong>
                    <span style={{ fontSize: '0.76rem', color: '#c2410c' }}>प्रसाद वितरण</span>
                  </div>
                </div>

                <div style={{ padding: '0.85rem 1rem', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#ffffff', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 800 }}>🧹</div>
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.88rem', color: '#9a3412', fontWeight: 800 }}>मंदिर स्वच्छता</strong>
                    <span style={{ fontSize: '0.76rem', color: '#c2410c' }}>पवित्र परिसर सेवा</span>
                  </div>
                </div>

                <div style={{ padding: '0.85rem 1rem', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#ffffff', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 800 }}>🐄</div>
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.88rem', color: '#9a3412', fontWeight: 800 }}>गौ सेवा</strong>
                    <span style={{ fontSize: '0.76rem', color: '#c2410c' }}>गौ माता सेवा</span>
                  </div>
                </div>

                <div style={{ padding: '0.85rem 1rem', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#ffffff', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 800 }}>🎉</div>
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.88rem', color: '#9a3412', fontWeight: 800 }}>उत्सव सेवा</strong>
                    <span style={{ fontSize: '0.76rem', color: '#c2410c' }}>पर्व एवं आयोजन</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Compact Form */}
            <form className="content-card home-volunteer-form" onSubmit={handleVolunteerSubmit} style={{ padding: '1.75rem', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <input value={volunteerForm.name} onChange={e => setVolunteerForm({ ...volunteerForm, name: e.target.value })} placeholder="पूरा नाम *" required />
                <input value={volunteerForm.phone} onChange={e => setVolunteerForm({ ...volunteerForm, phone: e.target.value })} placeholder="मोबाइल नंबर *" required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <input value={volunteerForm.email} onChange={e => setVolunteerForm({ ...volunteerForm, email: e.target.value })} placeholder="ई-मेल (वैकल्पिक)" />
                <select value={volunteerForm.sevaType} onChange={e => setVolunteerForm({ ...volunteerForm, sevaType: e.target.value })}>
                  <option value="Annadan Seva">अन्नदान सेवा</option>
                  <option value="Gau Seva">गौ सेवा</option>
                  <option value="Temple Cleaning">मंदिर स्वच्छता सेवा</option>
                  <option value="Festival Support">उत्सव एवं आयोजन सेवा</option>
                  <option value="Trust Management Help">ट्रस्ट प्रबंधन सहयोग</option>
                </select>
              </div>
              <input value={volunteerForm.availability} onChange={e => setVolunteerForm({ ...volunteerForm, availability: e.target.value })} placeholder="समय उपलब्धता (जैसे: रविवार/प्रतिदिन)" />
              <textarea rows="2" value={volunteerForm.message} onChange={e => setVolunteerForm({ ...volunteerForm, message: e.target.value })} placeholder="आप किस प्रकार सेवा करना चाहते हैं, संक्षेप में बताएं..." style={{ resize: 'vertical' }} />
              {volunteerStatus && <p className="home-form-status">{volunteerStatus}</p>}
              <button className="btn btn-primary" type="submit" disabled={volunteerLoading} style={{ padding: '0.85rem', fontWeight: 800, fontSize: '0.98rem' }}>
                {volunteerLoading ? 'जमा हो रहा है...' : '🙌 सेवा आवेदन जमा करें'}
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
                <span><Megaphone size={18} /> ट्रस्ट संदेश</span>
                <h2>ट्रस्ट पदाधिकारियों के संदेश</h2>
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
                <span><Quote size={18} /> भक्तों के अनुभव</span>
                <h2>श्रद्धालुओं की विचार अभिव्यक्ति</h2>
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
                <span><Landmark size={18} /> मंदिर इतिहास</span>
                <h2>ट्रस्ट एवं मंदिर विकास यात्रा</h2>
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
                <span><Newspaper size={18} /> समाचार</span>
                <h2>नवीनतम घोषणाएँ एवं समाचार</h2>
              </div>
              <Link to="/news" className="btn btn-outline">सभी देखें <ArrowRight size={17} /></Link>
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
                <span><Calendar size={18} /> कार्यक्रम</span>
                <h2>आगामी धार्मिक आयोजन</h2>
              </div>
              <Link to="/events" className="btn btn-outline">सभी देखें <ArrowRight size={17} /></Link>
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
        <section key={key} className="section home-preview-section" style={{ paddingBottom: '1rem' }}>
          <div className="container">
            <div className="home-section-heading">
              <div>
                <span><Users size={18} /> मंदिर प्रबंधन</span>
                <h2>ट्रस्ट प्रबंध समिति सदस्य</h2>
              </div>
              <Link to="/about" className="btn btn-outline">सभी देखें <ArrowRight size={17} /></Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
              {featuredMembers.map(member => (
                <div 
                  key={member._id || `${member.role}-${member.name}`} 
                  className="executive-member-card"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.1rem',
                    padding: '1.1rem 1.35rem',
                    background: 'linear-gradient(180deg, #ffffff 0%, #fafafa 100%)',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                >
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #ff6b00 0%, #ea580c 100%)' }} />
                  {renderAvatar(member)}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', fontWeight: 800, color: '#c2410c', background: '#fff7ed', padding: '0.2rem 0.6rem', borderRadius: '99px', border: '1px solid #fed7aa', marginBottom: '0.35rem' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ea580c' }}></span>
                      {member.role || 'ट्रस्ट सदस्य'}
                    </div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {member.name}
                    </div>
                  </div>
                </div>
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
            <button type="button" className="home-carousel-nav prev" onClick={() => goToSlide(activeSlide - 1)} aria-label="पिछली स्लाइड">
              <ChevronLeft size={22} />
            </button>
            <button type="button" className="home-carousel-nav next" onClick={() => goToSlide(activeSlide + 1)} aria-label="अगली स्लाइड">
              <ChevronRight size={22} />
            </button>
          </>
        )}

        <div className="container home-hero-content" style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1.5rem', color: '#ffffff', lineHeight: 1.2, textShadow: '0 2px 24px rgba(0,0,0,0.5)' }}>
            श्री मन्वत बाबा <br /> महाशिव मंदिर ट्रस्ट
          </h1>
          <p style={{ fontSize: '1.25rem', color: '#fed7aa', maxWidth: '800px', margin: '0 auto 2.5rem', fontWeight: 500 }}>
            बैरमपुर, करनैलगंज - गोंडा (उत्तर प्रदेश) - पंजीकृत संस्था संख्या: 4/5/389/428/9
          </p>
          <div className="responsive-actions" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/donate" className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.125rem' }}>
              <Heart size={20} /> दान अर्पित करें
            </Link>
            <Link to="/about" className="btn" style={{ padding: '1rem 2.5rem', fontSize: '1.125rem', background: 'rgba(255,255,255,0.15)', color: '#fff', border: '2px solid rgba(255,255,255,0.5)', backdropFilter: 'blur(6px)' }}>
              अधिक जानें
            </Link>
          </div>
        </div>

        {carouselItems.length > 1 && (
          <div className="home-carousel-dots" aria-label="कैरोसेल नेविगेशन">
            {carouselItems.map((item, index) => (
              <button
                key={item._id || index}
                type="button"
                className={index === activeSlide ? 'active' : ''}
                onClick={() => goToSlide(index)}
                aria-label={`स्लाइड ${index + 1} पर जाएं`}
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
