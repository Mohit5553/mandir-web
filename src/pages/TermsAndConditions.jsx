import React from 'react';

const TermsAndConditions = () => {
  return (
    <div className="container" style={{ padding: '4rem 1rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem', textAlign: 'center', color: 'var(--color-primary)' }}>Terms and Conditions</h1>
      
      <div className="content-card" style={{ padding: '2.5rem', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: 'none', lineHeight: '1.8' }}>
        <p><strong>Effective Date:</strong> June 2026</p>

        <h3 style={{ marginTop: '1.5rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>1. Acceptance of Terms</h3>
        <p>By accessing or using the Shree Manvat Baba Mahashiv Mandir Trust application, you agree to be bound by these Terms and Conditions. If you do not agree to all the terms, please do not use the app.</p>

        <h3 style={{ marginTop: '1.5rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>2. Use of the App</h3>
        <p>You agree to use this application only for lawful purposes. You are prohibited from violating or attempting to violate the security of the application or using it to distribute any malicious code.</p>

        <h3 style={{ marginTop: '1.5rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>3. Donations</h3>
        <p>All donations made through the application are voluntary and final. We do not provide refunds for donations once they have been processed successfully. Please review your amount carefully before confirming the payment.</p>

        <h3 style={{ marginTop: '1.5rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>4. Intellectual Property</h3>
        <p>All content included on this app, such as text, graphics, logos, images, and software, is the property of Shree Manvat Baba Mahashiv Mandir Trust or its content suppliers and is protected by copyright laws.</p>

        <h3 style={{ marginTop: '1.5rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>5. Limitation of Liability</h3>
        <p>Shree Manvat Baba Mahashiv Mandir Trust shall not be liable for any direct, indirect, incidental, special, or consequential damages resulting from the use or inability to use our services.</p>

        <h3 style={{ marginTop: '1.5rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>6. Contact Information</h3>
        <p>If you have any queries regarding these Terms and Conditions, please contact us at:</p>
        <p><strong>Phone:</strong> +91 9792939973</p>
        <p><strong>Email:</strong> mahashivmandirtrusts@gmail.com</p>
        <p><strong>Address:</strong> Bairampur, Colonelganj, Gonda (U.P.)</p>
      </div>
    </div>
  );
};

export default TermsAndConditions;
