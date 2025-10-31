'use client';

import { Star, MapPin, Phone, Globe, Heart, Share2, CheckCircle, StarIcon } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

interface Business {
  id: string;
  name: string;
  description: string;
  phone?: string;
  whatsapp?: string;
  website?: string;
  address: string;
  averageRating: number;
  totalReviews: number;
  isVerified: boolean;
  status: string;
  category: {
    id: string;
    name: string;
    icon?: string;
  };
  city: {
    id: string;
    name: string;
  };
  workingHours?: {
    [key: string]: {
      open: string;
      close: string;
      isClosed?: boolean;
    };
  } | null;
}

interface Props {
  business: Business;
}

export default function BusinessHeader({ business }: Props) {
  const [isSaved, setIsSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const getCurrentDayStatus = () => {
    if (!business.workingHours) return false;
    
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDay = days[new Date().getDay()];
    const todayHours = business.workingHours[currentDay];
    
    if (!todayHours || todayHours.isClosed) return false;
    
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [openHour, openMin] = todayHours.open.split(':').map(Number);
    const [closeHour, closeMin] = todayHours.close.split(':').map(Number);
    
    const openTime = openHour * 60 + openMin;
    const closeTime = closeHour * 60 + closeMin;
    
    return currentTime >= openTime && currentTime <= closeTime;
  };
  
  const isOpen = getCurrentDayStatus();

  const handleShare = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: business.name,
          text: business.description,
          url: url,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    // TODO: Implement actual save functionality with backend
  };

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-4">
          {/* Left: Business Info */}
          <div className="flex-1 w-full">
            {/* Business Name & Verified Badge */}
            <div className="flex items-start gap-3 mb-2">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                {business.name}
              </h1>
            </div>

            {/* Rating, Category, and Status */}
            <div className="flex flex-wrap items-center gap-3 md:gap-4 mb-3 text-sm md:text-base">
              {/* Rating */}
              {business.averageRating > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-green-600 text-white px-2.5 py-1 rounded font-bold text-sm">
                    <span>{business.averageRating.toFixed(1)}</span>
                    <Star className="w-3.5 h-3.5 fill-current" />
                  </div>
                  <span className="text-gray-600">
                    {business.totalReviews} {business.totalReviews === 1 ? 'Review' : 'Reviews'}
                  </span>
                </div>
              )}


              {/* Category */}
              <div className="flex items-center gap-2">
                {business.category.icon && (
                  <Image 
                    src={business.category.icon} 
                    alt="" 
                    width={18} 
                    height={18}
                    className="object-contain"
                  />
                )}
                <span className="text-gray-700 font-medium">{business.category.name}</span>
              </div>


              {/* Status */}
              <span className={`px-3 py-1 rounded-full text-xs md:text-sm font-semibold ${
                isOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {isOpen ? 'Open' : 'Closed'}
              </span>
            </div>

            {/* Location */}
            <div className="flex items-start gap-2 text-gray-600 mb-4">
              <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span className="text-sm md:text-base">
                {business.address}
              </span>
            </div>

            {/* Action Buttons - Mobile Optimized */}
            <div className="flex flex-wrap items-center gap-2 md:gap-3">
              {business.phone && (
                <a
                  href={`tel:${business.phone}`}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 md:px-6 py-2 md:py-2.5 rounded-lg font-semibold transition-colors text-sm md:text-base"
                >
                  <Phone className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="hidden sm:inline">Call Now</span>
                  <span className="sm:hidden">Call</span>
                </a>
              )}

              {business.whatsapp && (
                <a
                  href={`https://wa.me/${business.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 md:px-6 py-2 md:py-2.5 rounded-lg font-semibold transition-colors text-sm md:text-base"
                >
                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                  </svg>
                  WhatsApp
                </a>
              )}

              {business.website && (
                <a
                  href={business.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 border-2 border-gray-300 hover:border-gray-400 text-gray-700 px-4 md:px-6 py-2 md:py-2.5 rounded-lg font-semibold transition-colors text-sm md:text-base"
                >
                  <Globe className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="hidden sm:inline">Website</span>
                  <span className="sm:hidden">Site</span>
                </a>
              )}

              <button 
                onClick={handleSave}
                className={`flex items-center gap-2 border-2 ${
                  isSaved 
                    ? 'border-red-500 text-red-500 bg-red-50' 
                    : 'border-gray-300 hover:border-red-500 hover:text-red-500 text-gray-700'
                } px-4 md:px-6 py-2 md:py-2.5 rounded-lg font-semibold transition-colors text-sm md:text-base`}
              >
                <Heart className={`w-4 h-4 md:w-5 md:h-5 ${isSaved ? 'fill-current' : ''}`} />
                <span className="hidden sm:inline">{isSaved ? 'Saved' : 'Save'}</span>
              </button>

              <button 
                onClick={() => {}}
                className="flex items-center gap-2 border-2 border-gray-300 hover:border-gray-400 text-gray-700 px-4 md:px-6 py-2 md:py-2.5 rounded-lg font-semibold transition-colors text-sm md:text-base relative"
              >
                <StarIcon className="w-4 h-4 md:w-5 md:h-5" />
                <span className="hidden sm:inline">Write A review</span>
              </button>

              <button 
                onClick={handleShare}
                className="flex items-center gap-2 border-2 border-gray-300 hover:border-gray-400 text-gray-700 px-4 md:px-6 py-2 md:py-2.5 rounded-lg font-semibold transition-colors text-sm md:text-base relative"
              >
                <Share2 className="w-4 h-4 md:w-5 md:h-5" />
                <span className="hidden sm:inline">Share</span>
                {copied && (
                  <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-1 rounded whitespace-nowrap">
                    Link copied!
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}