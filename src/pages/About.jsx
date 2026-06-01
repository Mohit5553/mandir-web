import React from 'react';
import { Target, BookOpen, Users } from 'lucide-react';

const About = () => {
  return (
    <div className="about-page">
      <section className="section bg-primary" style={{ padding: '4rem 0', color: 'white', textAlign: 'center' }}>
        <div className="container">
          <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem' }}>About Our Trust</h1>
          <p style={{ fontSize: '1.25rem', opacity: 0.9, maxWidth: '600px', margin: '0 auto' }}>
            Learn about our history, our mission, and the people behind Shree Mandir Trust.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: '800px' }}>
          
          <div className="content-card" style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <BookOpen size={32} color="var(--color-primary)" />
              <h2 style={{ margin: 0 }}>Our History</h2>
            </div>
            <p className="text-light">
              Established centuries ago, Shree Mandir has served as a beacon of spirituality and peace. 
              The present Trust was formed to effectively manage the temple operations, ensure the 
              maintenance of the holy premises, and organize community service activities in true 
              devotion to humanity and the divine.
            </p>
          </div>

          <div className="content-card" style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <Target size={32} color="var(--color-primary)" />
              <h2 style={{ margin: 0 }}>Mission & Vision</h2>
            </div>
            <p className="text-light">
              <strong>Mission:</strong> To foster spiritual awakening, preserve our rich cultural heritage, 
              and implement dedicated social service programs like Annadan (food donation) and Gau Seva 
              (cow protection) to serve all living beings.
              <br/><br/>
              <strong>Vision:</strong> A society united in peace, living in harmony, and driven by 
              compassion and righteousness.
            </p>
          </div>

          <div className="content-card" style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <Users size={32} color="var(--color-primary)" />
              <h2 style={{ margin: 0 }}>Trust Management</h2>
            </div>
            <div className="text-light">
              <p style={{ marginBottom: '1rem', fontWeight: 600, color: 'var(--color-primary)' }}>
                श्री मनवट बाबा महाशिव मन्दिर ट्रस्ट (Shree Manvat Baba Mahashiv Mandir Trust)
                <br />
                पंजीकृत संख्या - 4/5/389/428/9
                <br />
                बैरमपुर, करनैलगंज - गोण्डा (उत्तर प्रदेश)
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <p><strong>अध्यक्ष:</strong> सुनील मौर्य</p>
                  <p><strong>सचिव:</strong> मुकेश मौर्य</p>
                  <p><strong>मंत्री:</strong> रामकृष्ण पांडे</p>
                  <p><strong>व्यवस्थापक:</strong> रघुनाथ पंडित</p>
                  <p><strong>सहयोगी:</strong> इंद्राज वर्मा</p>
                </div>
                <div>
                  <p><strong>कोषाध्यक्ष:</strong> दिलीप कुमार मौर्य</p>
                  <p><strong>उपाध्यक्ष:</strong> रामजन्म पांडे</p>
                  <p><strong>संरक्षक:</strong> कप्तान मौर्य प्रधान</p>
                  <p><strong>लेखक:</strong> रघुनाथ पंडित</p>
                </div>
              </div>

              <div style={{ marginTop: '1.5rem' }}>
                <p><strong>सहयोगी सदस्य:</strong></p>
                <p style={{ fontSize: '0.9rem', lineHeight: '1.4' }}>
                  विनोद वकील वर्मा, संजय पांडे, बाबू पांडे, आशीष मौर्य, प्रकाश वर्मा, संतोष चौहान, दीपक मौर्य, ननके प्रजापति, चिमनलाल गौतम, प्रदीप पांडे, राजेश निषाद, दीपक सोनी, ननके प्रजापति, करनैलगंज रविंद्र वर्मा, रमेश वर्मा, अवधेश चौहान, आशीष सोनी, कन्या चौराहा, राजू सिंह, दिनेश सोनी छठको, मौर्य
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
};

export default About;
