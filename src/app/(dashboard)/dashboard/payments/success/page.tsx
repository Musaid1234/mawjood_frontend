'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { paymentService } from '@/services/payment.service';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const paymentId = searchParams.get('paymentId');
  const tranRef = searchParams.get('tranRef');

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      if (!paymentId) {
        setError('Payment ID not found');
        setLoading(false);
        return;
      }

      try {
        const response = await paymentService.getPaymentById(paymentId);
        setPaymentDetails(response.data);
      } catch (err) {
        console.error('Error fetching payment details:', err);
        setError('Failed to fetch payment details');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentDetails();
  }, [paymentId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#1c4233]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Successful!
          </h1>
          
          <p className="text-gray-600 mb-6">
            Your payment has been processed successfully.
          </p>

          {error && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-yellow-800">{error}</p>
            </div>
          )}

          {paymentDetails && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-semibold text-gray-900">
                    {paymentDetails.currency} {paymentDetails.amount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-semibold text-green-600">
                    {paymentDetails.status}
                  </span>
                </div>
                {tranRef && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Transaction Ref:</span>
                    <span className="font-mono text-xs text-gray-900">
                      {tranRef}
                    </span>
                  </div>
                )}
                {paymentDetails.description && (
                  <div className="pt-2 border-t border-gray-200">
                    <p className="text-sm text-gray-600">{paymentDetails.description}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Button
              onClick={() => router.push('/dashboard/subscriptions')}
              className="w-full bg-[#1c4233] hover:bg-[#245240]"
            >
              Go to Subscriptions
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard')}
              className="w-full"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

