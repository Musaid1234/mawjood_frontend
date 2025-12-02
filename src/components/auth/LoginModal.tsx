'use client';

import { useCallback, useEffect, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { authService, type SocialProvider } from '@/services/auth.service';
import { useAuthStore } from '@/store/authStore';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignup: () => void;
}

type LoginMethod = 'password' | 'otp';

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

export default function LoginModal({ isOpen, onClose, onSwitchToSignup }: LoginModalProps) {
  const { login } = useAuthStore();

  const [method, setMethod] = useState<LoginMethod>('password');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const [googleButtonRendered, setGoogleButtonRendered] = useState(false);
  const [facebookReady, setFacebookReady] = useState(false);

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const facebookAppId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;

  const handleSocialAuth = useCallback(
    async (provider: SocialProvider, token: string) => {
      try {
        setLoading(true);
        setError('');
        const response = await authService.socialLogin({ provider, token });
        login(response.data.user, response.data.token, response.data.refreshToken);
        onClose();
      } catch (err: any) {
        const providerName = provider === 'google' ? 'Google' : 'Facebook';
        setError(err?.message || `Unable to authenticate with ${providerName}. Please try again.`);
      } finally {
        setLoading(false);
      }
    },
    [login, onClose]
  );

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
            handleSocialAuth('google', credentialResponse.credential);
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
  }, [googleClientId, googleReady, handleSocialAuth]);

  useEffect(() => {
    if (!isOpen || !googleReady || !window.google?.accounts?.id) {
      return;
    }
    
    // Small delay to ensure modal is fully rendered
    const timer = setTimeout(() => {
      const container = document.getElementById('google-signin-button');
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

  const handleFacebookLogin = () => {
    if (!facebookAppId) {
      setError('Facebook login is not configured.');
      return;
    }

    if (!facebookReady && window.FB) {
      setFacebookReady(true);
    }

    if (!window.FB || typeof window.FB.login !== 'function') {
      setError('Facebook login is still loading. Please try again in a moment.');
      return;
    }

    setError('');
    window.FB.login(
      (response: FacebookLoginResponse) => {
        if (response.authResponse?.accessToken) {
          handleSocialAuth('facebook', response.authResponse.accessToken);
        } else {
          setLoading(false);
          setError('Facebook login was cancelled.');
        }
      },
      { scope: 'email' }
    );
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      setError('Please fill all fields');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await authService.loginWithPassword({ identifier, password });
      login(response.data.user, response.data.token, response.data.refreshToken);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async () => {
    if (!identifier) {
      setError('Please enter email or phone');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const isEmail = identifier.includes('@');
      if (isEmail) {
        await authService.sendEmailOTP(identifier);
      } else {
        await authService.sendPhoneOTP(identifier);
      }

      setOtpSent(true);
      setError('OTP sent successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      setError('Please enter OTP');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const isEmail = identifier.includes('@');
      const response = isEmail
        ? await authService.verifyEmailOTP({ email: identifier, otp })
        : await authService.verifyPhoneOTP({ phone: identifier, otp });

      login(response.data.user, response.data.token, response.data.refreshToken);
      onClose();
    } catch (err: any) {
      setError(err.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setIdentifier('');
    setPassword('');
    setOtp('');
    setOtpSent(false);
    setError('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="sm:max-w-md w-[calc(100vw-1rem)]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Log in
          </DialogTitle>
          <DialogDescription className="text-center">
            Access your Mawjood account instantly
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Method Toggle */}
          <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
            <button
              type="button"
              onClick={() => {
                setMethod('password');
                resetForm();
              }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                method === 'password'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Password
            </button>
            <button
              type="button"
              onClick={() => {
                setMethod('otp');
                resetForm();
              }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                method === 'otp'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              OTP
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div
              className={`p-3 rounded-lg text-sm ${
                error.includes('successfully') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}
            >
              {error}
            </div>
          )}

          {/* Password Login Form */}
          {method === 'password' && (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email or Phone
                </label>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Enter email or phone"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          )}

          {/* OTP Login Form */}
          {method === 'otp' && (
            <div className="space-y-4">
              {!otpSent ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email or Phone
                    </label>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Enter email or phone"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    disabled={loading}
                  />
                  </div>

                  <button
                    type="button"
                    onClick={handleSendOTP}
                    disabled={loading}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Sending...' : 'Send OTP'}
                  </button>
                </>
              ) : (
                <form onSubmit={handleVerifyOTP} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enter OTP
                    </label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter 4-digit OTP"
                      maxLength={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-center text-2xl tracking-widest"
                      disabled={loading}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Verifying...' : 'Verify OTP'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setOtpSent(false)}
                    className="w-full text-primary hover:underline text-sm"
                  >
                    Resend OTP
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or</span>
            </div>
          </div>

          {/* Social Login */}
          <div className="space-y-3 flex flex-col items-center">
            <div
              id="google-signin-button"
              className={`flex justify-center ${!googleClientId ? 'opacity-50 cursor-not-allowed' : ''}`}
              style={{ width: '320px', maxWidth: '100%' }}
            />
            {!googleButtonRendered && (
              <button
                type="button"
                onClick={() => {
                  if (!googleClientId) {
                    setError('Google login is not configured.');
                    return;
                  }
                  if (!window.google?.accounts?.id) {
                    setError('Google sign-in is still loading. Please try again in a moment.');
                    return;
                  }
                  window.google.accounts.id.prompt();
                }}
                disabled={loading || !googleClientId}
                className="flex items-center justify-center gap-3 border border-gray-300 rounded-lg py-3 font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white"
                style={{ width: '320px', maxWidth: '100%' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 533.5 544.3" className="h-5 w-5">
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
                Continue with Google
              </button>
            )}
            <button
              type="button"
              onClick={handleFacebookLogin}
              disabled={loading || !facebookAppId}
              className="flex items-center justify-center gap-3 border border-gray-300 rounded-lg py-3 font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white"
              style={{ width: '320px', maxWidth: '100%' }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path
                  d="M22.675 0h-21.35C.596 0 0 .596 0 1.326v21.348C0 23.404.596 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.894-4.788 4.659-4.788 1.325 0 2.464.099 2.795.143v3.24l-1.918.001c-1.504 0-1.796.715-1.796 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.403 24 24 23.404 24 22.674V1.326C24 .596 23.403 0 22.675 0z"
                  fill="#1877f2"
                />
              </svg>
              Continue with Facebook
            </button>
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <button onClick={onSwitchToSignup} className="text-primary font-semibold hover:underline">
                Sign up
              </button>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
