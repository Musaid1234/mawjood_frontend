import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star } from 'lucide-react';

interface RecentReview {
  id: string;
  rating: number;
  comment: string | null;
  businessName: string;
  userName: string;
  userAvatar: string | null;
  createdAt: string;
}

interface RecentActivitiesProps {
  reviews: RecentReview[];
}

export default function RecentActivities({ reviews }: RecentActivitiesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activities</CardTitle>
      </CardHeader>
      <CardContent className="max-h-[305px] overflow-y-auto">
        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div 
                key={review.id} 
                className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className={`p-3 rounded-full ${
                  review.rating >= 4 ? 'bg-yellow-100' : 
                  review.rating >= 3 ? 'bg-orange-100' : 'bg-red-100'
                }`}>
                  <Star className={`h-5 w-5 ${
                    review.rating >= 4 ? 'text-yellow-600' : 
                    review.rating >= 3 ? 'text-orange-600' : 'text-red-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <p className="text-gray-900">
                    <span className="font-medium">{review.userName}</span> left a review{' '}
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                      review.rating >= 4 ? 'bg-green-100 text-green-800' : 
                      review.rating >= 3 ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {review.rating.toFixed(1)}
                    </span>{' '}
                    on <span className="font-medium">{review.businessName}</span>
                  </p>
                  {review.comment && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                      "{review.comment}"
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-27 text-gray-500">
            <Star className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p>No recent reviews yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}