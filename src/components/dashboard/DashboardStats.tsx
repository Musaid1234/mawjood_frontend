import { Building2, Eye, Heart, Star } from 'lucide-react';
import StatsCard from './StatsCard';

interface DashboardStatsProps {
  activeListings: number;
  totalViews: number;
  todayViews: number;
  totalFavourites: number;
  totalReviews: number;
  averageRating: number;
}

export default function DashboardStats({ 
  activeListings, 
  totalViews, 
  todayViews, 
  totalFavourites, 
  totalReviews, 
  averageRating 
}: DashboardStatsProps) {
  const formatViews = (views: number) => {
    return views >= 1000 ? `${(views / 1000).toFixed(1)}K` : views;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCard
        title="Active Listings"
        value={activeListings}
        icon={Building2}
        colorClass="bg-[#1c4233]"
      />
      
      <StatsCard
        title="Total Views"
        value={formatViews(totalViews)}
        icon={Eye}
        colorClass="bg-[#245240]"
        subtitle={`${todayViews} today`}
      />
      
      <StatsCard
        title="Reviews"
        value={totalReviews}
        icon={Star}
        colorClass="bg-[#2d624d]"
        subtitle={`${averageRating.toFixed(1)} avg rating`}
      />

<StatsCard
        title="Favorites"
        value={totalFavourites}
        icon={Heart}
        colorClass="bg-[#36725a]"
      />
    </div>
  );
}