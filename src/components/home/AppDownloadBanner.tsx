'use client';

import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { useSiteSettings } from '@/hooks/useSiteSettings';

export default function AppDownloadBanner() {
  const { t, i18n } = useTranslation('common');
  const { data: siteSettings } = useSiteSettings();

  const bannerSettings = siteSettings?.downloadBanner;
  const title = bannerSettings?.title ?? t('banner.title');
  const subtitle = bannerSettings?.subtitle ?? t('banner.subtitle');
  const appStoreUrl = bannerSettings?.appStoreUrl ?? '#';
  const playStoreUrl = bannerSettings?.playStoreUrl ?? '#';
  const metrics =
    bannerSettings?.metrics && bannerSettings.metrics.length > 0
      ? bannerSettings.metrics
      : [
          { label: t('banner.activeUsers'), value: '10K+' },
          { label: t('banner.rating'), value: '4.8/5' },
          { label: t('banner.cities'), value: '50+' },
        ];

  return (
    <section className="bg-gradient-primary py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            {title}
          </h2>
          <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
          {/* App Store Button */}
          <Link
            href={appStoreUrl}
            target={appStoreUrl.startsWith('http') ? '_blank' : undefined}
            rel={appStoreUrl.startsWith('http') ? 'noopener noreferrer' : undefined}
            className="group cursor-pointer transform hover:scale-105 transition-all duration-300"
          >
            <div className="bg-white rounded-2xl p-4 shadow-primary-lg hover:shadow-primary-xl transition-shadow duration-300 border border-white/20">
              <div className="flex items-center space-x-4">
                {/* Apple Logo */}
                <div className="flex-shrink-0">
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="text-gray-800"
                  >
                    <path
                      d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"
                      fill="currentColor"
                    />
                  </svg>
                </div>

                <div className="text-left">
                  <div className="text-xs text-gray-500 font-medium">
                    {t('banner.downloadOn')}
                  </div>
                  <div className="text-lg font-bold text-gray-800">
                    {t('banner.appStore')}
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center mt-2">
              <span className="text-white/80 text-sm font-medium">
                {t('banner.available')}
              </span>
            </div>
          </Link>

          {/* Google Play Store Button */}
          <Link
            href={playStoreUrl}
            target={playStoreUrl.startsWith('http') ? '_blank' : undefined}
            rel={playStoreUrl.startsWith('http') ? 'noopener noreferrer' : undefined}
            className="group cursor-pointer transform hover:scale-105 transition-all duration-300"
          >
            <div className="bg-gray-900 rounded-2xl p-4 shadow-primary-lg hover:shadow-primary-xl transition-shadow duration-300 border border-gray-800">
              <div className="flex items-center space-x-4">
                {/* Google Play Logo */}
                <div className="flex-shrink-0">
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M3.609 1.814L13.792 12L3.609 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 0 1 0 1.73l-2.808 1.626L15.5 12l2.198-1.491zM5.864 2.658L16.802 8.99l-2.302 2.302-8.636-8.634z"
                      fill="url(#gradient)"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#00D4FF" />
                        <stop offset="25%" stopColor="#00A8CC" />
                        <stop offset="50%" stopColor="#00C853" />
                        <stop offset="75%" stopColor="#FFD600" />
                        <stop offset="100%" stopColor="#FF6D00" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>

                <div className="text-left">
                  <div className="text-xs text-gray-300 font-medium">
                    {t('banner.getItOn')}
                  </div>
                  <div className="text-lg font-bold text-white">
                    {t('banner.googlePlay')}
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center mt-2">
              <span className="text-white/80 text-sm font-medium">
                {t('banner.available')}
              </span>
            </div>
          </Link>
        </div>

        {/* Additional Features */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {metrics.map((metric) => (
            <div key={metric.label} className="text-white/90">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="text-3xl font-bold text-white">{metric.value}</div>
                {/* Decorative Icon */}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor" />
                </svg>
              </div>
              <div className="text-sm">{metric.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}