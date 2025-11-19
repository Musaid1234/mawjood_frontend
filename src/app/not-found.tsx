import Link from 'next/link';
import { Metadata } from 'next';
import { Home, Search, ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: '404 - Page Not Found | Mawjood',
  description: 'The page you are looking for could not be found. Return to Mawjood homepage to discover local businesses in Saudi Arabia.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full text-center">
        {/* 404 Number */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-primary/20 select-none">404</h1>
        </div>

        {/* Error Message */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Oops! Page Not Found
          </h2>
          <p className="text-xl text-gray-600 mb-2">
            The page you are looking for might have been removed,
          </p>
          <p className="text-xl text-gray-600">
            had its name changed, or is temporarily unavailable.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
          >
            <Home className="w-5 h-5" />
            Go to Homepage
          </Link>
          <Link
            href="/businesses"
            className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-primary font-semibold px-8 py-3 rounded-lg border-2 border-primary transition-colors"
          >
            <Search className="w-5 h-5" />
            Explore Businesses
          </Link>
        </div>

        {/* Helpful Links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <Link
            href="/about"
            className="text-gray-600 hover:text-primary transition-colors"
          >
            About Us
          </Link>
          <Link
            href="/blog"
            className="text-gray-600 hover:text-primary transition-colors"
          >
            Blog
          </Link>
          <Link
            href="/contact"
            className="text-gray-600 hover:text-primary transition-colors"
          >
            Contact
          </Link>
          <Link
            href="/privacy"
            className="text-gray-600 hover:text-primary transition-colors"
          >
            Privacy Policy
          </Link>
        </div>

        {/* Decorative Elements */}
        <div className="mt-16 flex justify-center gap-2">
          <div className="w-3 h-3 bg-primary/30 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="w-3 h-3 bg-primary/30 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-3 h-3 bg-primary/30 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
}
