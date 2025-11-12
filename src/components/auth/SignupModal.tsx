'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { authService, RegisterData } from '@/services/auth.service';
import { useAuthStore } from '@/store/authStore';

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
  defaultRole?: 'USER' | 'BUSINESS_OWNER';
}

export default function SignupModal({
  isOpen,
  onClose,
  onSwitchToLogin,
  defaultRole = 'USER'
}: SignupModalProps) {
  const { t } = useTranslation('common');
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
  const [countryCode, setCountryCode] = useState('+966');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleBusinessToggle = (checked: boolean) => {
    setRegisterAsBusiness(checked);
    setFormData(prev => ({
      ...prev,
      role: checked ? 'BUSINESS_OWNER' : 'USER'
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.password) {
      setError('Please fill all fields');
      return;
    }

    if (!agreeToTerms) {
      setError('Please agree to Terms and Conditions');
      return;
    }

    const trimmedPhone = formData.phone.trim();
    const formattedPhone = trimmedPhone.startsWith('+')
      ? trimmedPhone
      : `${countryCode}${trimmedPhone.replace(/^0+/, '')}`;

    try {
      setLoading(true);
      setError('');
      const response = await authService.register({
        ...formData,
        phone: formattedPhone,
      });
      login(response.data.user, response.data.token, response.data.refreshToken);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Create Account
          </DialogTitle>
          <DialogDescription className="text-center">
            Sign up for a seamless experience
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-lg text-sm bg-red-50 text-red-700">
              {error}
            </div>
          )}

          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name *
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="John"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name *
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Doe"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={loading}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              disabled={loading}
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <div className="flex gap-2">
              <select
                className="px-3 py-3 border border-gray-300 rounded-lg bg-gray-50"
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
              >
                <option value="+966">+966</option>
                <option value="+1">+1</option>
                <option value="+91">+91</option>
              </select>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="5XXXXXXXX"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={loading}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Min. 6 characters"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          {/* Register as Business Toggle */}
          <div className="flex items-center justify-between rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">
                Register as a Business?
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleBusinessToggle(!registerAsBusiness)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${registerAsBusiness ? 'bg-primary' : 'bg-gray-300'
                }`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${registerAsBusiness ? 'translate-x-5' : 'translate-x-1'
                  }`}
              />
            </button>

          </div>

          {/* Terms Checkbox */}
          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="terms"
              checked={agreeToTerms}
              onChange={(e) => setAgreeToTerms(e.target.checked)}
              className="mt-1 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
            />
            <label htmlFor="terms" className="text-sm text-gray-600">
              I agree to{' '}
              <a href="/terms" className="text-primary hover:underline">
                Terms and Conditions
              </a>{' '}
              and{' '}
              <a href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </a>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-primary font-semibold hover:underline"
              >
                Login
              </button>
            </p>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}