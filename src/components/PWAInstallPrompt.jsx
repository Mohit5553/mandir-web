import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Don't show if user dismissed recently
      const dismissed = localStorage.getItem('pwa_prompt_dismissed');
      if (!dismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to PWA prompt: ${outcome}`);
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '80px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        width: 'calc(100% - 2rem)',
        maxWidth: '450px',
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        color: '#ffffff',
        padding: '0.9rem 1.25rem',
        borderRadius: '16px',
        boxShadow: '0 12px 35px rgba(0,0,0,0.3)',
        border: '1px solid rgba(255, 107, 0, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.85rem'
      }}
      className="pwa-install-banner"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #FF6000 0%, #ea580c 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', flexShrink: 0, boxShadow: '0 4px 12px rgba(255,96,0,0.4)' }}>
          <Smartphone size={22} />
        </div>
        <div>
          <strong style={{ display: 'block', fontSize: '0.92rem', fontWeight: 800 }}>मंदिर ऐप इंस्टॉल करें</strong>
          <span style={{ fontSize: '0.78rem', opacity: 0.85 }}>होम स्क्रीन पर जोड़ें और आसानी से लाइव दर्शन करें</span>
        </div>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button 
          type="button"
          onClick={handleInstall}
          style={{
            background: 'linear-gradient(135deg, #FF6000 0%, #ea580c 100%)',
            color: '#ffffff',
            border: 'none',
            padding: '0.45rem 0.9rem',
            borderRadius: '99px',
            fontSize: '0.82rem',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            boxShadow: '0 4px 10px rgba(255,96,0,0.3)'
          }}
        >
          <Download size={14} /> इंस्टॉल
        </button>
        <button 
          type="button"
          onClick={handleDismiss}
          style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.2rem' }}
          aria-label="बंद करें"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
