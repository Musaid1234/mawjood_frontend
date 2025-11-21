'use client';

import { useEffect, useRef } from 'react';

interface GTranslateProps {
  className?: string;
  id?: string;
}

// Global flag to ensure script is only loaded once
let scriptLoaded = false;

export default function GTranslate({ className = '', id = 'gtranslate-navbar' }: GTranslateProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    const loadScript = () => {
      // Check if script already exists
      const existingScript = document.querySelector('script[src*="gtranslate.net"]');
      
      if (!existingScript && !scriptLoaded) {
        scriptLoaded = true;
        
        // Set GTranslate settings before loading script
        (window as any).gtranslateSettings = {
          default_language: 'en',
          languages: ['en', 'ar', 'fr', 'es', 'de', 'ja', 'ko', 'ru', 'hi', 'tr', 'ur', 'zh-TW'],
          wrapper_selector: '.gtranslate_wrapper',
        };

        // Load GTranslate script
        const script = document.createElement('script');
        script.src = 'https://cdn.gtranslate.net/widgets/latest/dropdown.js';
        script.defer = true;
        script.async = true;
        script.id = 'gtranslate-script';
        document.body.appendChild(script);
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(loadScript, 100);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      id={id} 
      className={`gtranslate_wrapper ${className}`} 
      suppressHydrationWarning
    />
  );
}

