'use client';

import { useState } from 'react';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import the map to avoid SSR issues
const Map = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-gray-200 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading map...</p>
      </div>
    </div>
  ),
});

interface Business {
  name: string;
  address: string;
  city: {
    name: string;
  };
  latitude?: number;
  longitude?: number;
}

interface Props {
  business: Business;
}

export default function LocationSection({ business }: Props) {
  const hasCoordinates = business.latitude && business.longitude;

  const openInGoogleMaps = () => {
    if (hasCoordinates) {
      const url = `https://www.google.com/maps/search/?api=1&query=${business.latitude},${business.longitude}`;
      window.open(url, '_blank');
    } else {
      const address = encodeURIComponent(`${business.address}, ${business.city.name}`);
      const url = `https://www.google.com/maps/search/?api=1&query=${address}`;
      window.open(url, '_blank');
    }
  };

  const getDirections = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude: userLat, longitude: userLng } = position.coords;
          const url = hasCoordinates
            ? `https://www.google.com/maps/dir/${userLat},${userLng}/${business.latitude},${business.longitude}`
            : `https://www.google.com/maps/dir/${userLat},${userLng}/${encodeURIComponent(business.address + ', ' + business.city.name)}`;
          window.open(url, '_blank');
        },
        () => {
          // Fallback if geolocation fails
          openInGoogleMaps();
        }
      );
    } else {
      openInGoogleMaps();
    }
  };

  return (
    <section id="location" className="bg-white rounded-lg shadow-sm p-6 scroll-mt-48">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-lg">
          <MapPin className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Location</h2>
      </div>

      {/* Address */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-gray-600 mt-1 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-gray-900 font-medium">{business.address}</p>
            <p className="text-gray-600 text-sm mt-1">{business.city.name}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={getDirections}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          <Navigation className="w-5 h-5" />
          Get Directions
        </button>
        
        <button
          onClick={openInGoogleMaps}
          className="flex items-center gap-2 border-2 border-gray-300 hover:border-gray-400 text-gray-700 px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          <ExternalLink className="w-5 h-5" />
          Open in Maps
        </button>
      </div>

      {/* Map */}
      {hasCoordinates ? (
        <div className="rounded-lg overflow-hidden border border-gray-200">
          <Map
            latitude={business.latitude!}
            longitude={business.longitude!}
            businessName={business.name}
          />
        </div>
      ) : (
        <div className="w-full h-[400px] bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
          <div className="text-center p-6">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">Map coordinates not available</p>
            <p className="text-gray-500 text-sm mt-2">Use the buttons above to view in Google Maps</p>
          </div>
        </div>
      )}
    </section>
  );
}
