'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import LoginModal from '@/components/auth/LoginModal';
import SignupModal from '@/components/auth/SignupModal';
import { useSiteSettings } from '@/hooks/useSiteSettings';

const NAV_LINKS = [
  { href: '/about', key: 'about' },
  { href: '/blog', key: 'blog' },
  { href: '/businesses', key: 'businesses' },
  { href: '/contact', key: 'contact' },
] as const;

export default function Navbar() {
  const { t, i18n } = useTranslation('common');
  const { user, isAuthenticated, logout, checkAuth } = useAuthStore();
  const { data: siteSettings } = useSiteSettings();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [signupRole, setSignupRole] = useState<'USER' | 'BUSINESS_OWNER'>('USER');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    checkAuth();
  }, [checkAuth]);

  const navbarSettings = useMemo(() => siteSettings?.navbar, [siteSettings]);
  const logoSrc = useMemo(() => navbarSettings?.logoUrl || '/logo/logo2.png', [navbarSettings]);
  const brandName = useMemo(() => navbarSettings?.brandName || t('nav.mawjood'), [navbarSettings, t]);
  const isAdmin = useMemo(() => user?.role === 'ADMIN', [user?.role]);
  const isBusinessOwner = useMemo(() => user?.role === 'BUSINESS_OWNER', [user?.role]);
  const showAuthUI = mounted;

  const toggleLanguage = useCallback(() => {
    i18n.changeLanguage(i18n.language === 'en' ? 'ar' : 'en');
  }, [i18n]);

  const handleAddBusiness = useCallback(() => {
    if (isAuthenticated) {
      if (user?.role === 'USER') {
        setSignupRole('BUSINESS_OWNER');
        setShowLoginModal(true);
      } else {
        window.location.href = '/dashboard/add-listing';
      }
    } else {
      setSignupRole('BUSINESS_OWNER');
      setShowLoginModal(true);
    }
  }, [isAuthenticated, user?.role]);

  const handleLogout = useCallback(() => {
    logout();
    setShowUserMenu(false);
  }, [logout]);

  const closeMobileMenu = useCallback(() => setIsMenuOpen(false), []);
  const toggleUserMenu = useCallback(() => setShowUserMenu(prev => !prev), []);

  return (
    <>
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center">
                <Image
                  src={logoSrc}
                  alt="Mawjood Logo"
                  width={40}
                  height={40}
                  className="h-10 w-auto"
                />
                <div className="ml-2">
                  <h1 className="text-primary hover:text-primary block text-base font-bold leading-tight">
                    {brandName}
                  </h1>
                </div>
              </Link>
            </div>

            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.key}
                    href={link.href}
                    className="text-primary transition-colors duration-200 px-3 py-2 text-sm font-medium"
                  >
                    {t(`nav.${link.key}`)}
                  </Link>
                ))}
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              {/* GTranslate Language Switcher */}

              <button
                onClick={handleAddBusiness}
                className="text-primary hover:bg-primary/10 border border-primary px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                + Add Business
              </button>
              {showAuthUI && isAuthenticated && user ? (
                <div className="relative">
                  <button
                    onClick={toggleUserMenu}
                    className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-md transition-colors"
                  >
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-semibold overflow-hidden">
                      {user.avatar ? (
                        <Image
                          src={user.avatar}
                          alt={`${user.firstName} ${user.lastName}`}
                          width={32}
                          height={32}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        `${user.firstName[0]}${user.lastName[0]}`
                      )}
                    </div>
                    <span className="text-sm font-medium">{user.firstName}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-200">
                        <p className="text-sm font-semibold text-gray-900">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                          {user.role}
                        </span>
                      </div>

                      {isAdmin && (
                        <Link href="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          Admin Dashboard
                        </Link>
                      )}

                      {isBusinessOwner && (
                        <Link href="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          Dashboard
                        </Link>
                      )}

                      <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        My Profile
                      </Link>

                      {isBusinessOwner && (
                        <Link href="/dashboard/my-listings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          My Businesses
                        </Link>
                      )}

                      <Link href="/favourites" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        Favourites
                      </Link>

                      <div className="border-t border-gray-200 mt-2 pt-2">
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : showAuthUI ? (
                <>
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="text-gray-700 hover:text-primary transition-colors duration-200 px-3 py-2 text-sm font-medium"
                  >
                    {t('nav.login')}
                  </button>
                  <button
                    onClick={() => {
                      setSignupRole('USER');
                      setShowSignupModal(true);
                    }}
                    className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors duration-200"
                  >
                    {t('nav.signup')}
                  </button>
                </>
              ) : null}
            </div>

            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(prev => !prev)}
                className="text-gray-700 hover:text-primary focus:outline-none focus:text-primary"
                aria-label="Toggle menu"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {isMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.key}
                    href={link.href}
                    className="text-gray-700 hover:text-primary block px-3 py-2 text-base font-medium"
                    onClick={closeMobileMenu}
                  >
                    {t(`nav.${link.key}`)}
                  </Link>
                ))}

                <button
                  onClick={() => {
                    handleAddBusiness();
                    closeMobileMenu();
                  }}
                  className="w-full text-left text-primary hover:bg-primary/10 border border-primary px-3 py-2 rounded-md text-base font-medium"
                >
                  + Add Business
                </button>

                <div className="pt-4 pb-3 border-t border-gray-200">
                  <div className="flex items-center justify-between px-3">
                    {/* GTranslate Language Switcher for Mobile */}
                    <div className="gtranslate_wrapper"></div>
                    <button
                      onClick={toggleLanguage}
                      className="bg-primary text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors duration-200"
                    >
                      {i18n.language === 'en' ? 'العربية' : 'English'}
                    </button>
                  </div>

                  {showAuthUI && isAuthenticated && user ? (
                    <div className="mt-3 px-3 space-y-2">
                      <div className="px-3 py-2 bg-gray-50 rounded-lg">
                        <p className="text-sm font-semibold">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>

                      {isAdmin && (
                        <Link href="/admin" className="block px-3 py-2 text-base font-medium text-gray-700" onClick={closeMobileMenu}>
                          Admin Dashboard
                        </Link>
                      )}

                      {isBusinessOwner && (
                        <Link href="/dashboard" className="block px-3 py-2 text-base font-medium text-gray-700" onClick={closeMobileMenu}>
                          Dashboard
                        </Link>
                      )}

                      <Link href="/profile" className="block px-3 py-2 text-base font-medium text-gray-700" onClick={closeMobileMenu}>
                        My Profile
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-3 py-2 text-base font-medium text-red-600"
                      >
                        Logout
                      </button>
                    </div>
                  ) : showAuthUI ? (
                    <div className="mt-3 px-3 space-y-2">
                      <button
                        onClick={() => {
                          setShowLoginModal(true);
                          closeMobileMenu();
                        }}
                        className="w-full text-gray-700 hover:text-primary block px-3 py-2 text-base font-medium text-left"
                      >
                        {t('nav.login')}
                      </button>
                      <button
                        onClick={() => {
                          setSignupRole('USER');
                          setShowSignupModal(true);
                          closeMobileMenu();
                        }}
                        className="w-full bg-primary text-white block px-3 py-2 rounded-md text-base font-medium hover:bg-primary/90 transition-colors duration-200"
                      >
                        {t('nav.signup')}
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToSignup={() => {
          setShowLoginModal(false);
          setSignupRole('USER');
          setShowSignupModal(true);
        }}
      />

      <SignupModal
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        onSwitchToLogin={() => {
          setShowSignupModal(false);
          setShowLoginModal(true);
        }}
        defaultRole={signupRole}
      />
    </>
  );
}