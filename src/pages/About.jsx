import { useEffect, useState } from 'react';
import { Image as ImageIcon, Target, BookOpen, Users, ShieldCheck, FileText, MapPin } from 'lucide-react';
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
  const [siteContent, setSiteContent] = useState(null);

  useEffect(() => {
    Promise.all([
      api.getTrustManagement().catch(() => fallbackManagement),
      api.getSiteContent().catch(() => null)
    ]).then(([trustData, contentData]) => {
      if (trustData && !trustData.message) {
        setManagement({
          categories: Array.isArray(trustData.categories) ? trustData.categories : fallbackManagement.categories,
          members: Array.isArray(trustData.members) ? trustData.members : fallbackManagement.members
        });
      }
      if (contentData && !contentData.message) {
        setSiteContent(contentData);
      }
    });
  }, []);

  const sortedCategories = Array.isArray(management.categories) 
    ? [...management.categories].sort((a, b) => (a.order || 0) - (b.order || 0)) 
    : [];
  const sortedMembers = Array.isArray(management.members) 
    ? [...management.members].sort((a, b) => (a.order || 0) - (b.order || 0)) 
    : [];

  const categoryTitleMap = {
    'Office Bearers': 'मुख्य पदाधिकारी (Office Bearers)',
    'office': 'मुख्य पदाधिकारी (Office Bearers)',
    'supporting': 'सहयोगी सदस्य (Supporting Members)',
    'trustees': 'ट्रस्टी मंडल (Trust Board)'
  };

  const renderAvatar = (member, size = 'md') => {
    const dimensions = size === 'sm' ? { w: '38px', h: '38px', fs: '0.9rem' } : { w: '52px', h: '52px', fs: '1.25rem' };
    
    if (member.photoUrl) {
      return (
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <img 
            src={member.photoUrl} 
            alt={member.name} 
            style={{ 
              width: dimensions.w, 
              height: dimensions.h, 
              borderRadius: '50%', 
              objectFit: 'cover', 
              border: '2.5px solid #ffffff', 
              boxShadow: '0 0 0 2px #fed7aa, 0 4px 12px rgba(255,96,0,0.18)',
              display: 'block'
            }} 
          />
        </div>
      );
    }

    const initial = member.name ? member.name.trim().charAt(0) : 'म';
    return (
      <div 
        style={{ 
          width: dimensions.w, 
          height: dimensions.h, 
          borderRadius: '50%', 
          background: 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)', 
          border: '2px solid #ffffff', 
          boxShadow: '0 0 0 2px #ffedd5, 0 4px 10px rgba(255,96,0,0.12)',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          color: '#9a3412', 
          fontWeight: 900, 
          fontSize: dimensions.fs, 
          flexShrink: 0,
          fontFamily: 'inherit'
        }}
      >
        {initial}
      </div>
    );
  };

  const renderCategory = (category) => {
    const categoryMembers = sortedMembers.filter(member => member.category === category.key);
    if (categoryMembers.length === 0) return null;

    const displayTitle = categoryTitleMap[category.name] || categoryTitleMap[category.key] || category.name;

    if (category.displayType === 'namesOnly') {
      return (
        <div key={category._id || category.key} style={{ marginTop: '2.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.1rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '0.6rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>{displayTitle}</h3>
            <span style={{ background: '#fff7ed', color: '#c2410c', padding: '0.25rem 0.75rem', borderRadius: '99px', fontSize: '0.8rem', fontWeight: 800, border: '1px solid #fed7aa' }}>
              {categoryMembers.length} सदस्य
            </span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem' }}>
            {categoryMembers.map(member => (
              <div 
                key={member._id || member.name} 
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '0.6rem', 
                  background: '#ffffff', 
                  border: '1px solid #e2e8f0', 
                  borderRadius: '99px', 
                  padding: '0.35rem 1rem 0.35rem 0.35rem',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                  transition: 'transform 0.2s'
                }}
              >
                {renderAvatar(member, 'sm')}
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1e293b' }}>{member.name}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div key={category._id || category.key} style={{ marginTop: '2.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.35rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '0.65rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 900, color: '#0f172a' }}>{displayTitle}</h3>
          <span style={{ background: '#fff7ed', color: '#c2410c', padding: '0.28rem 0.85rem', borderRadius: '99px', fontSize: '0.82rem', fontWeight: 800, border: '1px solid #fed7aa', boxShadow: '0 2px 6px rgba(255,96,0,0.05)' }}>
            {categoryMembers.length} सदस्य
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '1.25rem' }}>
          {categoryMembers.map(member => (
            <div 
              key={member._id || `${member.role}-${member.name}`} 
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
              className="executive-member-card"
            >
              {/* Decorative top accent line */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #ff6b00 0%, #ea580c 100%)' }} />

              {renderAvatar(member)}
              
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', fontWeight: 800, color: '#c2410c', background: '#fff7ed', padding: '0.2rem 0.6rem', borderRadius: '99px', border: '1px solid #fed7aa', marginBottom: '0.35rem' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ea580c' }}></span>
                  {member.role}
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {member.name}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const defaultHistory = "सदियों पहले स्थापित श्री मन्वत बाबा मंदिर आध्यात्मिकता और शांति का प्रतीक रहा है। वर्तमान ट्रस्ट का गठन मंदिर के संचालन को प्रभावी ढंग से प्रबंधित करने, पवित्र परिसर के रखरखाव को सुनिश्चित करने और मानवता एवं ईश्वर के प्रति सच्ची निष्ठा के साथ सामुदायिक सेवा गतिविधियों का आयोजन करने के लिए किया गया है।";
  const defaultMission = "आध्यात्मिक जागृति को बढ़ावा देना, हमारी समृद्ध सांस्कृतिक विरासत का संरक्षण करना और अन्नदान (भोजन दान) और गौ सेवा जैसे समर्पित सामाजिक सेवा कार्यक्रमों को लागू करके सभी जीवधारियों की सेवा करना।";
  const defaultVision = "शांति, सद्भाव और धार्मिकता से युक्त समाज का निर्माण करना जहाँ प्रत्येक प्राणी के प्रति करुणा और भक्ति का भाव हो।";

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
                {siteContent?.aboutHistory || defaultHistory}
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
                  <strong style={{ color: '#ea580c' }}>मिशन:</strong> {siteContent?.aboutMission || defaultMission}
                </p>
                <p style={{ margin: 0 }}>
                  <strong style={{ color: '#ea580c' }}>दृष्टि:</strong> {siteContent?.aboutVision || defaultVision}
                </p>
              </div>
            </div>
          </div>

          <div className="content-card trust-management-card" style={{ padding: '2.25rem', borderRadius: '20px', boxShadow: '0 10px 35px rgba(0,0,0,0.05)', background: '#ffffff', border: '1px solid #e2e8f0' }}>
            <div className="trust-management-header" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div className="trust-management-icon" style={{ background: 'linear-gradient(135deg, #FF6000 0%, #ea580c 100%)', color: 'white', width: '50px', height: '50px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(255,96,0,0.3)', flexShrink: 0 }}>
                <Users size={26} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, margin: '0 0 0.15rem 0', color: '#0f172a' }}>ट्रस्ट प्रबंधन एवं पदाधिकारी</h2>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>मंदिर समिति, ट्रस्टी एवं सहयोगी सदस्य</p>
              </div>
            </div>

            {/* Premium Trust Details Panel */}
            <div 
              style={{ 
                background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)', 
                border: '1px solid #fed7aa', 
                borderRadius: '16px', 
                padding: '1.35rem 1.5rem', 
                marginBottom: '1.75rem',
                boxShadow: '0 4px 16px rgba(255, 96, 0, 0.04)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <ShieldCheck size={22} color="#ea580c" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#9a3412', margin: 0 }}>
                  {staticTrustDetails.trustName}
                </h3>
              </div>
              <div style={{ display: 'flex', gap: '0.85rem 1.25rem', flexWrap: 'wrap', alignItems: 'center', fontSize: '0.88rem' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#ffffff', padding: '0.35rem 0.85rem', borderRadius: '10px', border: '1px solid #fed7aa', boxShadow: '0 1px 3px rgba(0,0,0,0.03)', color: '#475569', fontWeight: 600 }}>
                  <FileText size={15} color="#ea580c" /> पंजीकृत संख्या: <strong style={{ color: '#0f172a' }}>{staticTrustDetails.registrationNumber}</strong>
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#ffffff', padding: '0.35rem 0.85rem', borderRadius: '10px', border: '1px solid #fed7aa', boxShadow: '0 1px 3px rgba(0,0,0,0.03)', color: '#475569', fontWeight: 600 }}>
                  <MapPin size={15} color="#ea580c" /> स्थान: <strong style={{ color: '#0f172a' }}>{staticTrustDetails.address}</strong>
                </span>
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
