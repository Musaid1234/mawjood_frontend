'use client';

import { useEffect } from 'react';

export default function GTranslate() {
  useEffect(() => {
    // Only load GTranslate on client side
    if (typeof window !== 'undefined') {
      // Set GTranslate settings
      (window as any).gtranslateSettings = {
        default_language: 'en',
        languages: ['en', 'ar', 'fr', 'es', 'de', 'it', 'ja', 'ko', 'ru', 'hi', 'bn', 'pa', 'ta', 'te', 'th', 'tr', 'ur', 'vi', 'zh-TW'],
        wrapper_selector: '.gtranslate_wrapper',
      };

      // Load GTranslate script
      const script = document.createElement('script');
      script.src = 'https://cdn.gtranslate.net/widgets/latest/float.js';
      script.defer = true;
      document.body.appendChild(script);

      return () => {
        // Cleanup: remove script when component unmounts
        const existingScript = document.querySelector(
          'script[src="https://cdn.gtranslate.net/widgets/latest/float.js"]'
        );
        if (existingScript) {
          existingScript.remove();
        }
      };
    }
  }, []);

  return <div className="gtranslate_wrapper" suppressHydrationWarning></div>;
}

