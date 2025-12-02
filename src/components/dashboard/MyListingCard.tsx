'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Star, MapPin, Eye, Edit, Trash2, Building2 } from 'lucide-react';
import { Business } from '@/services/business.service';
import { useState } from 'react';

interface MyListingCardProps {
  business: Business;
  onDelete?: (id: string) => void;
}

export default function MyListingCard({ business, onDelete }: MyListingCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const isExpired = business.status === 'EXPIRED' || business.status === 'INACTIVE';

  const handleDelete = () => {
    setIsDeleting(true);
    onDelete?.(business.id);
    // Reset after a delay (the mutation will handle the actual deletion)
    setTimeout(() => setIsDeleting(false), 3000);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      <div className="flex flex-col md:flex-row">
        {/* Image Section */}
        <div className="relative w-full md:w-64 h-48 md:h-auto bg-gray-100">
          {(business.coverImage || business.logo) ? (
            <Image
              src={business.coverImage || business.logo || ''}
              alt={business.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Building2 className="w-16 h-16 text-gray-400" />
            </div>
          )}
          {/* Status Badge */}
          <div className="absolute top-4 left-4">
            {business.status === 'PENDING' && (
              <span className="bg-yellow-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                Pending
              </span>
            )}
            {business.status === 'APPROVED' && business.isVerified && (
              <span className="bg-green-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                Approved
              </span>
            )}
            {business.status === 'REJECTED' && (
              <span className="bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                Rejected
              </span>
            )}
            {business.status === 'SUSPENDED' && (
              <span className="bg-orange-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                Suspended
              </span>
            )}
            {isExpired && (
              <span className="bg-gray-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                Expired
              </span>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 p-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between">
            <div className="flex-1">
              {/* Business Name */}
              <Link 
                href={`/businesses/${business.slug}`}
                className="group"
              >
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors">
                  {business.name}
                </h3>
              </Link>

              {/* Address */}
              <div className="flex items-start mt-2 text-gray-600">
                <MapPin className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" />
                <p className="text-sm">{business.address}</p>
              </div>

              {/* Rating and Reviews */}
              <div className="flex items-center mt-3 bg-yellow-50 w-fit px-3 py-1.5 rounded-lg">
                <div className="flex items-center">
                  {[...Array(5)].map((_, index) => (
                    <Star
                      key={index}
                      className={`w-4 h-4 ${
                        index < Math.floor(business.averageRating)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700">
                  {business.totalReviews} Reviews
                </span>
              </div>

              {/* Views (if available) */}
              <div className="flex items-center mt-3 text-gray-500">
                <Eye className="w-4 h-4 mr-2" />
                <span className="text-sm">Views tracked</span>
              </div>

              {/* Category */}
              <div className="mt-3">
                <span className="inline-block bg-primary/10 text-primary text-xs font-medium px-3 py-1 rounded-full">
                  {business.category.name}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex md:flex-col gap-2 mt-4 md:mt-0 md:ml-4">
              <Link 
                href={`/dashboard/edit-listing/${business.id}`}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors font-medium"
              >
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </Link>
              
              {onDelete && (
                <button
                  onClick={() => onDelete(business.id)}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

