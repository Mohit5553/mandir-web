import { useEffect, useState } from 'react';
import { Image as ImageIcon, Target, BookOpen, Users } from 'lucide-react';
import { api } from '../services/api';

const staticTrustDetails = {
  trustName: 'श्री मनवत बाबा महाशिव मन्दिर ट्रस्ट (Shree Manvat Baba Mahashiv Mandir Trust)',
  registrationNumber: '4/5/389/428/9',
  address: 'बैरमपुर, करनैलगंज - गोण्डा (उत्तर प्रदेश)'
};

const fallbackManagement = {
  categories: [
    { _id: 'office', key: 'office', name: 'Office Bearers', displayType: 'roleName', order: 1 },
    { _id: 'supporting', key: 'supporting', name: 'सहयोगी सदस्य', displayType: 'namesOnly', order: 2 }
  ],
  members: [
    { _id: '1', role: 'अध्यक्ष', name: 'सुनील मौर्य', category: 'office', order: 1 },
    { _id: '2', role: 'सचिव', name: 'मुकेश मौर्य', category: 'office', order: 2 },
    { _id: '3', role: 'मंत्री', name: 'रामकृष्ण पांडे', category: 'office', order: 3 },
    { _id: '4', role: 'व्यवस्थापक', name: 'रघुनाथ पंडित', category: 'office', order: 4 },
    { _id: '5', role: 'सहयोगी', name: 'इंद्राज वर्मा', category: 'office', order: 5 },
    { _id: '6', role: 'कोषाध्यक्ष', name: 'दिलीप कुमार मौर्य', category: 'office', order: 6 },
    { _id: '7', role: 'उपाध्यक्ष', name: 'रामजन्म पांडे', category: 'office', order: 7 },
    { _id: '8', role: 'संरक्षक', name: 'कप्तान मौर्य प्रधान', category: 'office', order: 8 },
    { _id: '9', role: 'लेखक', name: 'रघुनाथ पंडित', category: 'office', order: 9 }
  ]
};

const About = () => {
  const [management, setManagement] = useState(fallbackManagement);

  useEffect(() => {
    api.getTrustManagement()
      .then(data => {
        if (data && !data.message) {
          setManagement({
            categories: Array.isArray(data.categories) ? data.categories : fallbackManagement.categories,
            members: Array.isArray(data.members) ? data.members : fallbackManagement.members
          });
        }
      })
      .catch(() => setManagement(fallbackManagement));
  }, []);

  const sortedCategories = [...management.categories].sort((a, b) => (a.order || 0) - (b.order || 0));
  const sortedMembers = [...management.members].sort((a, b) => (a.order || 0) - (b.order || 0));

  const renderAvatar = (member, size = 'md') => (
    member.photoUrl ? (
      <img className={`trust-member-avatar trust-member-avatar-${size}`} src={member.photoUrl} alt={member.name} />
    ) : (
      <span className={`trust-member-avatar trust-member-avatar-${size} trust-member-photo-icon`} aria-label="No photo uploaded">
        <ImageIcon size={size === 'sm' ? 16 : 22} />
      </span>
    )
  );

  const renderCategory = (category) => {
    const categoryMembers = sortedMembers.filter(member => member.category === category.key);
    if (categoryMembers.length === 0) return null;

    if (category.displayType === 'namesOnly') {
      return (
        <div key={category._id || category.key} className="trust-category trust-supporting-category">
          <div className="trust-category-heading">
            <h3>{category.name}</h3>
            <span>{categoryMembers.length} members</span>
          </div>
          <div className="trust-supporting-list">
            {categoryMembers.map(member => (
              <div key={member._id || member.name} className="trust-supporting-chip">
                {renderAvatar(member, 'sm')}
                <span>{member.name}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div key={category._id || category.key} className="trust-category">
        <div className="trust-category-heading">
          <h3>{category.name}</h3>
          <span>{categoryMembers.length} members</span>
        </div>
        <div className="trust-office-grid">
          {categoryMembers.map(member => (
            <div key={member._id || `${member.role}-${member.name}`} className="trust-member-card">
              {renderAvatar(member)}
              <div className="trust-member-copy">
                <span>{member.role}</span>
                <strong>{member.name}</strong>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

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

          <div className="content-card trust-management-card" style={{ marginBottom: '2rem' }}>
            <div className="trust-management-header">
              <div className="trust-management-icon">
                <Users size={30} />
              </div>
              <div>
                <h2>Trust Management</h2>
                <p>Temple committee and supporting members</p>
              </div>
            </div>

            <div className="trust-details-panel">
              <p className="trust-name">{staticTrustDetails.trustName}</p>
              <div className="trust-meta-grid">
                <span>पंजीकृत संख्या - {staticTrustDetails.registrationNumber}</span>
                <span>{staticTrustDetails.address}</span>
              </div>
            </div>

            {sortedCategories.map(renderCategory)}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
