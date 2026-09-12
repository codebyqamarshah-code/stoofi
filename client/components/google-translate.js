'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

export default function GoogleTranslate() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Restore saved language after GT widget loads
    const restoreLanguage = () => {
      const savedLang = localStorage.getItem('stoofi_lang');
      if (!savedLang || savedLang === 'EN') return;

      const langMap = { UR: 'ur', AR: 'ar' };
      const targetLang = langMap[savedLang];
      if (!targetLang) return;

      const tryRestore = () => {
        // Try doGTranslate
        if (typeof window.doGTranslate === 'function') {
          window.doGTranslate(`en|${targetLang}`);
          return true;
        }
        // Try select element
        const sel = document.querySelector('.goog-te-combo');
        if (sel) {
          sel.value = targetLang;
          sel.dispatchEvent(new Event('change', { bubbles: true }));
          return true;
        }
        return false;
      };

      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (tryRestore() || attempts > 30) {
          clearInterval(interval);
        }
      }, 500);
    };

    // Wait for GT widget to initialize
    const timer = setTimeout(restoreLanguage, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) return null;

  return (
    <>
      {/* Hidden GT element — positioned off-screen but accessible to JS */}
      <div
        id="google_translate_element"
        suppressHydrationWarning
        style={{ position: 'absolute', top: '-9999px', left: '-9999px', opacity: 0, pointerEvents: 'none' }}
      />
      <Script
        id="google-translate-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.googleTranslateElementInit = function() {
              if (window.google && window.google.translate) {
                new window.google.translate.TranslateElement({
                  pageLanguage: 'en',
                  includedLanguages: 'en,ur,ar',
                  autoDisplay: false,
                  layout: google.translate.TranslateElement.InlineLayout.SIMPLE
                }, 'google_translate_element');
              }
            };
          `
        }}
      />
      <Script
        id="google-translate-script"
        strategy="afterInteractive"
        src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
      />
    </>
  );
}

