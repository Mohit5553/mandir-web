import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="container" style={{ padding: '4rem 1rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem', textAlign: 'center', color: 'var(--color-primary)' }}>Privacy Policy</h1>
      
      <div className="content-card" style={{ padding: '2.5rem', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: 'none', lineHeight: '1.8' }}>
        <p><strong>Effective Date:</strong> June 2026</p>

        <h3 style={{ marginTop: '1.5rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>1. Information We Collect</h3>
        <p>We may collect personal information such as your name, email address, phone number, and address when you interact with our app (e.g., when making a donation, subscribing to newsletters, or registering as a volunteer).</p>

        <h3 style={{ marginTop: '1.5rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>2. How We Use Your Information</h3>
        <p>Your information is used to process donations, send updates about trust activities, respond to inquiries, and improve our services. We do not sell or share your personal information with third parties for marketing purposes.</p>

        <h3 style={{ marginTop: '1.5rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>3. Data Security</h3>
        <p>We implement reasonable security measures, such as encryption and secure servers, to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>

        <h3 style={{ marginTop: '1.5rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>4. Third-Party Links</h3>
        <p>Our app may contain links to external sites (such as payment gateways). We are not responsible for the privacy practices or content of these third-party websites.</p>

        <h3 style={{ marginTop: '1.5rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>5. Changes to This Policy</h3>
        <p>We reserve the right to modify this Privacy Policy at any time. Any changes will be updated on this page with the revised date.</p>

        <h3 style={{ marginTop: '1.5rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>6. Contact Us</h3>
        <p>If you have any questions or concerns regarding this Privacy Policy, please contact us at:</p>
        <p><strong>Phone:</strong> +91 9792939973</p>
        <p><strong>Email:</strong> mahashivmandirtrusts@gmail.com</p>
        <p><strong>Address:</strong> Bairampur, Colonelganj, Gonda (U.P.)</p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
