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
      <section className="section bg-primary" style={{ padding: '1.75rem 0', background: 'linear-gradient(135deg, #FF6000 0%, #ea580c 50%, #c2410c 100%)', color: 'white', textAlign: 'center', boxShadow: '0 4px 20px rgba(255, 96, 0, 0.2)' }}>
        <div className="container" style={{ maxWidth: '1320px', padding: '0 1.25rem' }}>
          <h1 style={{ fontSize: '2.1rem', fontWeight: 900, marginBottom: '0.35rem', letterSpacing: '-0.3px', textShadow: '0 2px 4px rgba(0,0,0,0.15)' }}>हमारे ट्रस्ट के बारे में</h1>
          <p style={{ fontSize: '1rem', opacity: 0.96, maxWidth: '750px', margin: '0 auto', lineHeight: 1.45, fontWeight: 500 }}>
            श्री मन्वत बाबा महाशिव मंदिर ट्रस्ट के इतिहास, हमारे मिशन और इससे जुड़े समर्पित सदस्यों के बारे में जानें।
          </p>
        </div>
      </section>

      <section className="section" style={{ padding: '2.5rem 0 4rem 0', background: '#fdfbf7' }}>
        <div className="container" style={{ maxWidth: '1320px', padding: '0 1.25rem' }}>
          <div className="responsive-two-col" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.75rem', marginBottom: '2.25rem' }}>
            <div className="content-card" style={{ padding: '2rem', borderRadius: '18px', borderTop: '4px solid #FF6000', boxShadow: '0 8px 30px rgba(0,0,0,0.05)', background: '#ffffff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.25rem' }}>
                <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#fff7ed', border: '1px solid #fed7aa', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ea580c', flexShrink: 0 }}>
                  <BookOpen size={24} />
                </div>
                <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>हमारा इतिहास</h2>
              </div>
              <p className="text-light" style={{ fontSize: '0.98rem', lineHeight: 1.7, color: '#475569', margin: 0 }}>
                सदियों पहले स्थापित श्री मन्वत बाबा मंदिर आध्यात्मिकता और शांति का प्रतीक रहा है। वर्तमान ट्रस्ट का गठन मंदिर के संचालन को प्रभावी ढंग से प्रबंधित करने, पवित्र परिसर के रखरखाव को सुनिश्चित करने और मानवता एवं ईश्वर के प्रति सच्ची निष्ठा के साथ सामुदायिक सेवा गतिविधियों का आयोजन करने के लिए किया गया है।
              </p>
            </div>

            <div className="content-card" style={{ padding: '2rem', borderRadius: '18px', borderTop: '4px solid #FF6000', boxShadow: '0 8px 30px rgba(0,0,0,0.05)', background: '#ffffff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.25rem' }}>
                <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#fff7ed', border: '1px solid #fed7aa', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ea580c', flexShrink: 0 }}>
                  <Target size={24} />
                </div>
                <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>मिशन एवं दृष्टि</h2>
              </div>
              <div className="text-light" style={{ fontSize: '0.98rem', lineHeight: 1.7, color: '#475569' }}>
                <p style={{ margin: '0 0 0.75rem 0' }}>
                  <strong style={{ color: '#ea580c' }}>मिशन:</strong> आध्यात्मिक जागृति को बढ़ावा देना, हमारी समृद्ध सांस्कृतिक विरासत का संरक्षण करना और अन्नदान (भोजन दान) और गौ सेवा जैसे समर्पित सामाजिक सेवा कार्यक्रमों को लागू करके सभी जीवधारियों की सेवा करना।
                </p>
                <p style={{ margin: 0 }}>
                  <strong style={{ color: '#ea580c' }}>दृष्टि:</strong> शांति, सद्भाव और धार्मिकता से युक्त समाज का निर्माण करना जहाँ प्रत्येक प्राणी के प्रति करुणा और भक्ति का भाव हो।
                </p>
              </div>
            </div>
          </div>

          <div className="content-card trust-management-card" style={{ padding: '2rem', borderRadius: '20px', boxShadow: '0 10px 35px rgba(0,0,0,0.06)', background: '#ffffff', border: '1px solid #e2e8f0' }}>
            <div className="trust-management-header" style={{ marginBottom: '1.5rem' }}>
              <div className="trust-management-icon" style={{ background: 'linear-gradient(135deg, #FF6000 0%, #ea580c 100%)', color: 'white', width: '52px', height: '52px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(255,96,0,0.3)' }}>
                <Users size={28} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.2rem 0', color: '#0f172a' }}>ट्रस्ट प्रबंधन एवं पदाधिकारी</h2>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>मंदिर समिति, ट्रस्टी एवं सहयोगी सदस्य</p>
              </div>
            </div>

            <div className="trust-details-panel" style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '12px', padding: '1.25rem', marginBottom: '2rem' }}>
              <p className="trust-name" style={{ fontSize: '1.15rem', fontWeight: 900, color: '#9a3412', margin: '0 0 0.5rem 0' }}>{staticTrustDetails.trustName}</p>
              <div className="trust-meta-grid" style={{ color: '#c2410c', fontWeight: 700, fontSize: '0.88rem' }}>
                <span>पंजीकृत संख्या - {staticTrustDetails.registrationNumber}</span>
                <span>•</span>
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
