import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Bell, Heart, ArrowRight } from 'lucide-react';

const Home = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="hero" style={{
        background: 'linear-gradient(135deg, #FFF0E6 0%, #FFFFFF 100%)',
        padding: '6rem 0',
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center'
      }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <img src="/src/assets/trust_logo.png" alt="Trust Logo" style={{ height: '120px', width: '120px', borderRadius: '50%', marginBottom: '2rem', boxShadow: 'var(--shadow-lg)', border: '4px solid white' }} onError={(e) => e.target.style.display = 'none'} />
          <h1 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--color-primary-dark)', lineHeight: 1.2 }}>
            श्री मनवट बाबा <br /> महाशिव मन्दिर ट्रस्ट
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--color-text-light)', maxWidth: '800px', margin: '0 auto 2.5rem' }}>
            बैरमपुर, करनैलगंज - गोण्डा (उत्तर प्रदेश) - पंजीकृत संख्या: 4/5/389/428/9
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/donate" className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.125rem' }}>
              <Heart size={20} /> Donate Now
            </Link>
            <Link to="/about" className="btn btn-outline" style={{ padding: '1rem 2.5rem', fontSize: '1.125rem' }}>
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Access Cards */}
      <section className="section">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            
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
                <Heart size={32} />
              </div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Make a Donation</h3>
              <p style={{ color: 'var(--color-text-light)', marginBottom: '1.5rem', flexGrow: 1 }}>
                Support temple construction, Annadan, and Gau Seva initiatives.
              </p>
              <Link to="/donate" style={{ color: 'var(--color-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Donate Online <ArrowRight size={18} />
              </Link>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
