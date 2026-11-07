'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

// Defensive runtime patch for Google Translate DOM mutations colliding with React Fiber reconciler
if (typeof window !== 'undefined' && typeof Node === 'function' && Node.prototype) {
  try {
    if (!Node.prototype._stoofiTranslatePatched) {
      Node.prototype._stoofiTranslatePatched = true;
      const origRemoveChild = Node.prototype.removeChild;
      Node.prototype.removeChild = function (child) {
        if (child && child.parentNode !== this) {
          if (child.parentNode) {
            return child.parentNode.removeChild(child);
          }
          return child;
        }
        return origRemoveChild.apply(this, arguments);
      };

      const origInsertBefore = Node.prototype.insertBefore;
      Node.prototype.insertBefore = function (newNode, referenceNode) {
        if (referenceNode && referenceNode.parentNode !== this) {
          if (referenceNode.parentNode) {
            return referenceNode.parentNode.insertBefore(newNode, referenceNode);
          }
          return origInsertBefore.call(this, newNode, null);
        }
        return origInsertBefore.apply(this, arguments);
      };

      const origReplaceChild = Node.prototype.replaceChild;
      Node.prototype.replaceChild = function (newChild, oldChild) {
        if (oldChild && oldChild.parentNode !== this) {
          if (oldChild.parentNode) {
            return oldChild.parentNode.replaceChild(newChild, oldChild);
          }
          return newChild;
        }
        return origReplaceChild.apply(this, arguments);
      };
    }
  } catch (_) {}
}

export default function GoogleTranslate() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Restore saved language after GT widget loads
    const restoreLanguage = () => {
      let savedLang = 'EN';
      try {
        savedLang = localStorage.getItem('stoofi_lang') || 'EN';
      } catch (_) {}

      const langMap = { UR: 'ur', AR: 'ar', EN: 'en' };
      const targetLang = langMap[savedLang] || 'en';

      const tryRestore = () => {
        // If English, clear or reset if combo is set to another lang
        if (targetLang === 'en') {
          const sel = document.querySelector('.goog-te-combo');
          if (sel && sel.value && sel.value !== 'en' && sel.value !== '') {
            sel.value = 'en';
            sel.dispatchEvent(new Event('change', { bubbles: true }));
          }
          return true;
        }

        // Try doGTranslate
        if (typeof window.doGTranslate === 'function') {
          window.doGTranslate(`en|${targetLang}`);
          return true;
        }

        // Try select element
        const sel = document.querySelector('.goog-te-combo');
        if (sel) {
          if (sel.value !== targetLang) {
            sel.value = targetLang;
            sel.dispatchEvent(new Event('change', { bubbles: true }));
          }
          return true;
        }
        return false;
      };

      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (tryRestore() || attempts > 20) {
          clearInterval(interval);
        }
      }, 500);
    };

    // Wait for GT widget to initialize
    const timer = setTimeout(restoreLanguage, 1500);
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
        src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
      />
    </>
  );
}

