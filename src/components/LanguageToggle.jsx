import React from 'react';
import { Languages } from 'lucide-react';

const GOOGLE_TRANSLATE_SCRIPT_ID = 'google-translate-script';
const GOOGLE_TRANSLATE_ELEMENT_ID = 'google_translate_element';

const setCookie = (name, value) => {
  const expires = 'expires=Fri, 31 Dec 9999 23:59:59 GMT';
  document.cookie = `${name}=${value}; ${expires}; path=/`;

  const hostname = window.location.hostname;
  if (hostname && hostname.includes('.')) {
    document.cookie = `${name}=${value}; ${expires}; path=/; domain=.${hostname}`;
  }
};

const clearCookie = (name) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;

  const hostname = window.location.hostname;
  if (hostname && hostname.includes('.')) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.${hostname}`;
  }
};

const LanguageToggle = ({ onSelect }) => {
  const [language, setLanguage] = React.useState(localStorage.getItem('siteLanguage') || 'en');

  React.useEffect(() => {
    window.googleTranslateElementInit = () => {
      if (!window.google?.translate?.TranslateElement) return;

      new window.google.translate.TranslateElement(
        {
          pageLanguage: 'en',
          includedLanguages: 'en,hi',
          autoDisplay: false
        },
        GOOGLE_TRANSLATE_ELEMENT_ID
      );
    };

    if (!document.getElementById(GOOGLE_TRANSLATE_SCRIPT_ID)) {
      const script = document.createElement('script');
      script.id = GOOGLE_TRANSLATE_SCRIPT_ID;
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    } else if (window.google?.translate?.TranslateElement) {
      window.googleTranslateElementInit();
    }
  }, []);

  const chooseLanguage = (nextLanguage) => {
    localStorage.setItem('siteLanguage', nextLanguage);
    setLanguage(nextLanguage);
    onSelect?.();

    if (nextLanguage === 'en') {
      clearCookie('googtrans');
    } else {
      setCookie('googtrans', `/en/${nextLanguage}`);
    }

    const select = document.querySelector('.goog-te-combo');
    if (select) {
      select.value = nextLanguage;
      select.dispatchEvent(new Event('change'));
    }

    window.setTimeout(() => window.location.reload(), 250);
  };

  return (
    <div className="language-toggle notranslate" translate="no">
      <div id={GOOGLE_TRANSLATE_ELEMENT_ID} className="google-translate-shell" />
      <Languages size={16} aria-hidden="true" />
      <button
        type="button"
        className={language === 'en' ? 'active' : ''}
        onClick={() => chooseLanguage('en')}
      >
        English
      </button>
      <span aria-hidden="true">|</span>
      <button
        type="button"
        className={language === 'hi' ? 'active' : ''}
        onClick={() => chooseLanguage('hi')}
      >
        हिन्दी
      </button>
    </div>
  );
};

export default LanguageToggle;
