'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Eye, EyeOff, Search } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  authService,
  type RegisterData,
  type SocialProvider,
  type RegisterResponse,
} from '@/services/auth.service';
import { useAuthStore } from '@/store/authStore';
import { countryCodes as allCountryCodes, defaultCountryCode } from '@/data/countryCodes';

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
  defaultRole?: 'USER' | 'BUSINESS_OWNER';
}

type GoogleCredentialResponse = {
  credential?: string;
};

type FacebookLoginResponse = {
  status: 'connected' | 'not_authorized' | 'unknown';
  authResponse?: {
    accessToken: string;
  };
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
          }) => void;
          prompt: (
            callback?: (notification: {
              isNotDisplayed: () => boolean;
              isSkippedMoment: () => boolean;
              getNotDisplayedReason: () => string | null;
              getSkippedReason: () => string | null;
            }) => void
          ) => void;
          cancel?: () => void;
        };
      };
    };
    FB?: {
      init: (config: { appId: string; cookie: boolean; xfbml: boolean; version: string }) => void;
      login: (
        callback: (response: FacebookLoginResponse) => void,
        options?: { scope?: string; return_scopes?: boolean }
      ) => void;
    };
    fbAsyncInit?: () => void;
  }
}

export default function SignupModal({
  isOpen,
  onClose,
  onSwitchToLogin,
  defaultRole = 'USER',
}: SignupModalProps) {
  const { login } = useAuthStore();

  const [formData, setFormData] = useState<RegisterData>({
    email: '',
    phone: '',
    password: '',
    firstName: '',
    lastName: '',
    role: defaultRole,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [registerAsBusiness, setRegisterAsBusiness] = useState(defaultRole === 'BUSINESS_OWNER');
  const [countryCode, setCountryCode] = useState(defaultCountryCode);
  const [countrySearch, setCountrySearch] = useState('');
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  
  const [googleReady, setGoogleReady] = useState(false);
  const [googleButtonRendered, setGoogleButtonRendered] = useState(false);
  const [facebookReady, setFacebookReady] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [otpStep, setOtpStep] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [otpError, setOtpError] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const facebookAppId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;

  const countryDropdownRef = useRef<HTMLDivElement>(null);
  const countrySearchInputRef = useRef<HTMLInputElement>(null);

  const countrySearchAliases: Record<string, string[]> = useMemo(
    () => ({
      '+966': ['ksa', 'kingdom of saudi arabia', 'saudi'],
      '+971': ['uae', 'emirates'],
      '+44': ['uk', 'britain', 'england'],
      '+1': ['usa', 'united states', 'america', 'canada', 'us'],
    }),
    []
  );

  const filteredCountryCodes = useMemo(() => {
    const normalizedSearch = countrySearch.trim().toLowerCase();
    if (!normalizedSearch) {
      return allCountryCodes;
    }

    const sanitizedSearch = normalizedSearch.replace(/[^a-z0-9+]/g, '');

    return allCountryCodes.filter((item) => {
      const normalizedCountry = item.country.toLowerCase();
      const normalizedCode = item.code.toLowerCase();
      const countryNoSpaces = normalizedCountry.replace(/\s+/g, '');
      const acronym =
        item.country
          .match(/\b[A-Za-z]/g)
          ?.join('')
          .toLowerCase() ?? '';
      const aliases = countrySearchAliases[item.code] || [];

      return (
        normalizedCountry.includes(normalizedSearch) ||
        countryNoSpaces.includes(sanitizedSearch) ||
        normalizedCode.includes(sanitizedSearch) ||
        acronym.includes(sanitizedSearch.replace(/[^a-z]/g, '')) ||
        aliases.some((alias) => alias.toLowerCase().includes(normalizedSearch))
      );
    });
  }, [countrySearch, countrySearchAliases]);

  const selectedCountry = useMemo(
    () => allCountryCodes.find((item) => item.code === countryCode),
    [countryCode]
  );

  const formattedPhone = useMemo(() => {
    const trimmed = formData.phone.trim();
    if (!trimmed) {
      return '';
    }
    return trimmed.startsWith('+') ? trimmed : `${countryCode}${trimmed.replace(/^0+/, '')}`;
  }, [formData.phone, countryCode]);

  const handleSocialAuth = useCallback(
    async (provider: SocialProvider, token: string, options?: { phone?: string }) => {
      try {
        setLoading(true);
        setError('');
        const response = await authService.socialLogin({
          provider,
          token,
          phone: options?.phone,
          role: registerAsBusiness ? 'BUSINESS_OWNER' : 'USER',
        });
        login(response.data.user, response.data.token, response.data.refreshToken);
        onClose();
      } catch (err: any) {
        const providerName = provider === 'google' ? 'Google' : 'Facebook';
        setError(err?.message || `Unable to sign up with ${providerName}. Please try again.`);
      } finally {
        setLoading(false);
      }
    },
    [login, onClose, registerAsBusiness]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    const field = e.target.name;
    setFormErrors((prev) => {
      if (!prev[field]) {
        return prev;
      }
      const { [field]: _removed, ...rest } = prev;
      return rest;
    });
  };

  const handleBusinessToggle = (checked: boolean) => {
    setRegisterAsBusiness(checked);
    setFormData((prev) => ({
      ...prev,
      role: checked ? 'BUSINESS_OWNER' : 'USER',
    }));
  };

  useEffect(() => {
    if (!googleClientId || googleReady) {
      return;
    }

    const initializeGoogle = () => {
      if (!window.google?.accounts?.id) {
        return;
      }
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: (credentialResponse: GoogleCredentialResponse) => {
          if (credentialResponse?.credential) {
            handleSocialAuth('google', credentialResponse.credential, {
              phone: formattedPhone || undefined,
            });
          }
        },
      });
      setGoogleReady(true);
    };

    if (window.google?.accounts?.id) {
      initializeGoogle();
      return;
    }

    const existingScript = document.getElementById('google-client-script');
    if (existingScript) {
      existingScript.addEventListener('load', initializeGoogle);
      return () => {
        existingScript.removeEventListener('load', initializeGoogle);
      };
    }

    const script = document.createElement('script');
    script.id = 'google-client-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogle;
    document.body.appendChild(script);

    return () => {
      script.onload = null;
    };
  }, [googleClientId, googleReady, handleSocialAuth, formattedPhone]);

  useEffect(() => {
    if (!isOpen || !googleReady || !window.google?.accounts?.id) {
      return;
    }
    
    const timer = setTimeout(() => {
      const container = document.getElementById('google-signup-button');
      const googleId = window.google?.accounts?.id as any;
      
      if (container && googleId?.renderButton) {
        try {
          container.innerHTML = '';
          googleId.renderButton(container, {
            type: 'standard',
            theme: 'filled_blue',
            size: 'large',
            shape: 'rectangular',
            text: 'continue_with',
            logo_alignment: 'left',
            width: 320,
          } as any);
          setGoogleButtonRendered(true);
        } catch (error) {
          console.error('Google button render error:', error);
          setGoogleButtonRendered(false);
        }
      } else {
        setGoogleButtonRendered(false);
      }
    }, 100); // 100ms delay
  
    return () => clearTimeout(timer);
  }, [googleReady, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setGoogleButtonRendered(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!facebookAppId || facebookReady) {
      return;
    }

    if (window.FB) {
      setFacebookReady(true);
      return;
    }

    window.fbAsyncInit = () => {
      window.FB?.init({
        appId: facebookAppId,
        cookie: true,
        xfbml: false,
        version: 'v18.0',
      });
      setFacebookReady(true);
    };

    if (document.getElementById('facebook-jssdk')) {
      return;
    }

    const script = document.createElement('script');
    script.id = 'facebook-jssdk';
    script.src = 'https://connect.facebook.net/en_US/sdk.js';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      delete window.fbAsyncInit;
    };
  }, [facebookAppId, facebookReady]);

  const handleGoogleSignup = () => {
    if (!googleClientId) {
      setError('Google sign-up is not configured.');
      return;
    }

    if (!window.google?.accounts?.id || !googleReady) {
      setError('Google sign-up is not ready yet. Please try again shortly.');
      return;
    }

    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed()) {
        setError('Google sign-in could not be displayed. Please check your browser settings.');
      } else if (notification.isSkippedMoment()) {
        setError('Google sign-in was dismissed. Please try again.');
      }
    });
  };

  const handleFacebookSignup = () => {
    if (!facebookAppId) {
      setError('Facebook sign-up is not configured.');
      return;
    }

    if (!facebookReady && window.FB) {
      setFacebookReady(true);
    }

    if (!window.FB || typeof window.FB.login !== 'function') {
      setError('Facebook sign-up is still loading. Please try again in a moment.');
      return;
    }

    setError('');
    window.FB.login(
      (response: FacebookLoginResponse) => {
        if (response.authResponse?.accessToken) {
          handleSocialAuth('facebook', response.authResponse.accessToken, {
            phone: formattedPhone || undefined,
          });
        } else {
          setLoading(false);
          setError('Facebook sign-up was cancelled.');
        }
      },
      { scope: 'email' }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otpStep) {
      return;
    }

    const validationErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      validationErrors.firstName = 'First name is required.';
    }

    if (!formData.lastName.trim()) {
      validationErrors.lastName = 'Last name is required.';
    }

    if (!formData.email.trim()) {
      validationErrors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      validationErrors.email = 'Enter a valid email address.';
    }

    const numericPhone = formData.phone.replace(/\D/g, '');
    if (!numericPhone.length) {
      validationErrors.phone = 'Phone number is required.';
    } else if (numericPhone.length < 9 || numericPhone.length > 15) {
      validationErrors.phone = 'Phone number must be between 9 and 15 digits.';
    }

    if (!formData.password.trim()) {
      validationErrors.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      validationErrors.password = 'Password must be at least 6 characters.';
    }

    if (!agreeToTerms) {
      validationErrors.terms = 'You must agree to the terms and privacy policy.';
    }

    if (!formattedPhone) {
      validationErrors.phone = validationErrors.phone || 'Please provide a valid phone number.';
    }

    if (Object.keys(validationErrors).length) {
      setFormErrors(validationErrors);
      setError('');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setFormErrors({});
      setOtpError('');

      const response: RegisterResponse = await authService.register({
        ...formData,
        phone: formattedPhone,
      });

      const nextEmail = response.data?.email || formData.email.trim();
      setPendingEmail(nextEmail);
      setOtpStep(true);
      setOtpValue('');
      setOtpError('');
      toast.success('We sent a verification code to your email. Enter it below to verify your account.');
    } catch (err: any) {
      setError(err?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    const targetEmail = (pendingEmail || formData.email || '').trim().toLowerCase();

    if (!targetEmail) {
      setOtpError('Missing email address. Please restart the sign-up process.');
      return;
    }

    if (!otpValue.trim()) {
      setOtpError('Please enter the verification code.');
      return;
    }

    try {
      setLoading(true);
      setOtpError('');
      setError('');

      const response = await authService.verifyEmailOTP({
        email: targetEmail,
        otp: otpValue.trim(),
      });

      login(response.data.user, response.data.token, response.data.refreshToken);
      toast.success('Account verified successfully!');
      onClose();
    } catch (err: any) {
      setOtpError(err?.message || 'Invalid or expired verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    const targetEmail = (pendingEmail || formData.email || '').trim();
    if (!targetEmail) {
      setOtpError('Unable to resend code. Please restart the sign-up process.');
      return;
    }

    try {
      setResendLoading(true);
      await authService.sendEmailOTP(targetEmail);
      toast.success('A new verification code has been sent to your email.');
      setOtpError('');
    } catch (err: any) {
      setOtpError(err?.message || 'Failed to resend the verification code. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleBackToForm = () => {
    setOtpStep(false);
    setOtpValue('');
    setOtpError('');
    setPendingEmail('');
    setResendLoading(false);
    setError('');
  };

  const resetOnClose = useCallback(() => {
    setFormData({
      email: '',
      phone: '',
      password: '',
      firstName: '',
      lastName: '',
      role: defaultRole,
    });
    setShowPassword(false);
    setLoading(false);
    setError('');
    setAgreeToTerms(false);
    setRegisterAsBusiness(defaultRole === 'BUSINESS_OWNER');
    setCountryCode(defaultCountryCode);
    setCountrySearch('');
    setCountryDropdownOpen(false);
    setFormErrors({});
    setOtpStep(false);
    setOtpValue('');
    setOtpError('');
    setPendingEmail('');
    setResendLoading(false);
  }, [defaultRole]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        countryDropdownRef.current &&
        !countryDropdownRef.current.contains(event.target as Node)
      ) {
        setCountryDropdownOpen(false);
        setCountrySearch('');
      }
    };

    if (countryDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [countryDropdownOpen]);

  useEffect(() => {
    if (countryDropdownOpen) {
      setCountrySearch('');
      requestAnimationFrame(() => {
        countrySearchInputRef.current?.focus();
      });
    }
  }, [countryDropdownOpen]);

  useEffect(() => {
    if (!isOpen) {
      resetOnClose();
    }
  }, [isOpen, resetOnClose]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-xl w-[calc(100vw-0.5rem)] max-w-[calc(100vw-0.5rem)] max-h-[98vh] overflow-y-auto p-3 sm:p-6">
        <DialogHeader className="px-0 sm:px-0">
          <DialogTitle className="text-xl sm:text-2xl font-bold text-center">Create Account</DialogTitle>
          <DialogDescription className="text-center text-xs sm:text-sm">
            Sign up for a seamless experience
          </DialogDescription>
        </DialogHeader>

        {!otpStep ? (
          <form onSubmit={handleSubmit} noValidate className="space-y-3 sm:space-y-4 px-0 sm:px-0">
            {error ? (
              <div className="rounded-lg bg-red-50 p-2 sm:p-3 text-xs sm:text-sm text-red-700">{error}</div>
            ) : null}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              <div>
                <label className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-medium text-gray-700">First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Enter your first name"
                  className="w-full rounded-lg border border-gray-300 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:border-transparent focus:ring-2 focus:ring-primary"
                  disabled={loading}
                />
                {formErrors.firstName ? (
                  <p className="mt-1 text-xs sm:text-sm text-red-600">{formErrors.firstName}</p>
                ) : null}
              </div>
              <div>
                <label className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-medium text-gray-700">Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Enter your last name"
                  className="w-full rounded-lg border border-gray-300 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:border-transparent focus:ring-2 focus:ring-primary"
                  disabled={loading}
                />
                {formErrors.lastName ? (
                  <p className="mt-1 text-xs sm:text-sm text-red-600">{formErrors.lastName}</p>
                ) : null}
              </div>
            </div>

            <div>
              <label className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-medium text-gray-700">Email Address *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email address"
                className="w-full rounded-lg border border-gray-300 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:border-transparent focus:ring-2 focus:ring-primary"
                disabled={loading}
              />
              {formErrors.email ? (
                <p className="mt-1 text-xs sm:text-sm text-red-600">{formErrors.email}</p>
              ) : null}
            </div>

            <div>
              <label className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-medium text-gray-700">Phone Number *</label>
              <div className="flex flex-col gap-2">
                <div className="relative" ref={countryDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setCountryDropdownOpen((prev) => !prev)}
                    className="w-full rounded-lg border border-gray-300 bg-gray-50 px-2 sm:px-3 py-2 sm:py-3 flex items-center justify-between text-xs sm:text-sm font-medium"
                    disabled={loading}
                  >
                    <span>
                      {selectedCountry ? `${selectedCountry.code} ${selectedCountry.country}` : countryCode}
                    </span>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </button>
                  {countryDropdownOpen ? (
                    <div className="absolute z-50 mt-2 w-full rounded-lg border border-gray-200 bg-white shadow-lg">
                      <div className="flex items-center gap-2 px-2 sm:px-3 py-1.5 sm:py-2 border-b border-gray-100">
                        <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
                        <input
                          ref={countrySearchInputRef}
                          type="text"
                          placeholder="Search country or code"
                          value={countrySearch}
                          onChange={(e) => setCountrySearch(e.target.value)}
                          className="w-full bg-transparent text-xs sm:text-sm focus:outline-none"
                        />
                      </div>
                      <div className="max-h-40 sm:max-h-48 overflow-y-auto">
                        {filteredCountryCodes.map((item) => (
                          <button
                            key={item.code}
                            type="button"
                            className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-left text-xs sm:text-sm hover:bg-gray-100"
                            onClick={() => {
                              setCountryCode(item.code);
                              setCountryDropdownOpen(false);
                              setCountrySearch('');
                              setFormErrors((prev) => {
                                if (!prev.phone) return prev;
                                const { phone, ...rest } = prev;
                                return rest;
                              });
                            }}
                          >
                            {item.code} {item.country}
                          </button>
                        ))}
                        {!filteredCountryCodes.length ? (
                          <p className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-500">No results found</p>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                </div>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={(e) => {
                    const numericValue = e.target.value.replace(/\D/g, '');
                    const limitedValue = numericValue.slice(0, 15);
                    setFormData((prev) => ({
                      ...prev,
                      phone: limitedValue,
                    }));
                    if (formErrors.phone) {
                      setFormErrors((prev) => {
                        const { phone, ...rest } = prev;
                        return rest;
                      });
                    }
                  }}
                  placeholder="Enter phone number (9-15 digits)"
                  maxLength={15}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className="w-full rounded-lg border border-gray-300 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:border-transparent focus:ring-2 focus:ring-primary"
                  disabled={loading}
                />
              </div>
              {formErrors.phone ? (
                <p className="mt-1 text-xs sm:text-sm text-red-600">{formErrors.phone}</p>
              ) : null}
            </div>

            <div>
              <label className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-medium text-gray-700">Password *</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min. 6 characters"
                  className="w-full rounded-lg border border-gray-300 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:border-transparent focus:ring-2 focus:ring-primary pr-10 sm:pr-10"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
                </button>
              </div>
              {formErrors.password ? (
                <p className="mt-1 text-xs sm:text-sm text-red-600">{formErrors.password}</p>
              ) : null}
            </div>

            <div className="flex items-center justify-between rounded-lg">
              <span className="text-xs sm:text-sm font-medium text-gray-700">Register as a Business?</span>
              <button
                type="button"
                onClick={() => handleBusinessToggle(!registerAsBusiness)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  registerAsBusiness ? 'bg-primary' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                    registerAsBusiness ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                checked={agreeToTerms}
                onChange={(e) => {
                  setAgreeToTerms(e.target.checked);
                  if (formErrors.terms) {
                    setFormErrors((prev) => {
                      const { terms, ...rest } = prev;
                      return rest;
                    });
                  }
                }}
                className="mt-0.5 sm:mt-1 h-3.5 w-3.5 sm:h-4 sm:w-4 rounded border-gray-300 text-primary focus:ring-primary flex-shrink-0"
                disabled={loading}
              />
              <label htmlFor="terms" className="text-xs sm:text-sm text-gray-600 leading-tight">
                I agree to{' '}
                <Link href="/terms" className="text-primary hover:underline">
                  Terms and Conditions
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
              </label>
            </div>
            {formErrors.terms ? (
              <p className="-mt-2 text-xs sm:text-sm text-red-600">{formErrors.terms}</p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>

            <div className="relative my-4 sm:my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-xs sm:text-sm">
                <span className="bg-white px-2 text-gray-500">Or</span>
              </div>
            </div>

            <div className="space-y-2 sm:space-y-3 flex flex-col items-center">
              <div
                id="google-signup-button"
                className={`flex justify-center ${!googleClientId ? 'cursor-not-allowed opacity-50' : ''}`}
                style={{ width: '100%', maxWidth: '320px' }}
              />
              {!googleButtonRendered && (
                <button
                  type="button"
                  onClick={handleGoogleSignup}
                  disabled={loading || !googleClientId}
                  className="flex items-center justify-center gap-2 sm:gap-3 rounded-lg border border-gray-300 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 bg-white w-full max-w-[320px]"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 533.5 544.3" className="h-4 w-4 sm:h-5 sm:w-5">
                    <path
                      fill="#4285f4"
                      d="M533.5 278.4c0-17.4-1.5-34.1-4.3-50.4H272v95.4h147.5c-6.4 34.5-25.9 63.8-55.2 83.5v68h89.1c52.2-48 80.1-118.7 80.1-196.5z"
                    />
                    <path
                      fill="#34a853"
                      d="M272 544.3c74.7 0 137.4-24.5 183.2-66.4l-89.1-68c-24.7 16.6-56.4 26.4-94.1 26.4-72.4 0-133.9-48.9-155.8-114.6H23.6v71.9C69 476.2 164.4 544.3 272 544.3z"
                    />
                    <path
                      fill="#fbbc04"
                      d="M116.2 321.7c-10.5-31.4-10.5-65.4 0-96.8v-71.9H23.6c-32 64.1-32 141.6 0 205.7l92.6-37z"
                    />
                    <path
                      fill="#ea4335"
                      d="M272 107.7c39.1-.6 76.7 13.8 105.5 40.9l78.7-78.7C409.1 24.1 346.4-.4 272 0 164.4 0 69 68.1 23.6 171.1l92.6 71.9C138.1 156.6 199.6 107.7 272 107.7z"
                    />
                  </svg>
                  <span className="text-xs sm:text-sm">Continue with Google</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleFacebookSignup}
                disabled={loading || !facebookAppId}
                className="flex items-center justify-center gap-2 sm:gap-3 rounded-lg border border-gray-300 bg-white py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 w-full max-w-[320px]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4 sm:h-5 sm:w-5">
                  <path
                    d="M22.675 0h-21.35C.596 0 0 .596 0 1.326v21.348C0 23.404.596 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.894-4.788 4.659-4.788 1.325 0 2.464.099 2.795.143v3.24l-1.918.001c-1.504 0-1.796.715-1.796 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.403 24 24 23.404 24 22.674V1.326C24 .596 23.403 0 22.675 0z"
                    fill="#1877f2"
                  />
                </svg>
                <span className="text-xs sm:text-sm">Continue with Facebook</span>
              </button>
            </div>

            <div className="text-center text-xs sm:text-sm text-gray-600">
              Already have an account?{' '}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="font-semibold text-primary hover:underline"
              >
                Login
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} noValidate className="space-y-4 sm:space-y-6 px-0 sm:px-0">
            {otpError ? (
              <div className="rounded-lg bg-red-50 p-2 sm:p-3 text-xs sm:text-sm text-red-700">{otpError}</div>
            ) : null}
            {error ? (
              <div className="rounded-lg bg-red-50 p-2 sm:p-3 text-xs sm:text-sm text-red-700">{error}</div>
            ) : null}

            <p className="text-center text-xs sm:text-sm text-gray-600">
              We sent a verification code to{' '}
              <span className="font-medium text-gray-800 break-all">{pendingEmail || formData.email}</span>.
              Enter the code below to verify your account.
            </p>

            <div>
              <label className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-medium text-gray-700">
                Verification Code
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="\d*"
                maxLength={6}
                value={otpValue}
                onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter the 4-digit code"
                className="w-full rounded-lg border border-gray-300 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base focus:border-transparent focus:ring-2 focus:ring-primary"
                disabled={loading}
              />
            </div>

            <div className="flex items-center justify-between text-xs sm:text-sm">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendLoading || loading}
                className="text-primary hover:underline disabled:cursor-not-allowed disabled:text-gray-400"
              >
                {resendLoading ? 'Sending…' : 'Resend code'}
              </button>
              <button type="button" onClick={handleBackToForm} className="text-gray-500 hover:underline">
                Go back
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Verifying…' : 'Verify & Continue'}
            </button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
