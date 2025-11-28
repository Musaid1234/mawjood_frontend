'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Clock, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { paymentService } from '@/services/payment.service';

export default function PaymentPendingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  const paymentId = searchParams.get('paymentId');
  const tranRef = searchParams.get('tranRef');

  const fetchPaymentDetails = async () => {
    if (!paymentId) {
      setError('Payment ID not found');
      setLoading(false);
      return;
    }

    try {
      setChecking(true);
      const response = await paymentService.getPaymentById(paymentId);
      setPaymentDetails(response.data);

      // If payment status changed, redirect accordingly
      if (response.data.status === 'COMPLETED') {
        router.push(`/dashboard/payments/success?paymentId=${paymentId}&tranRef=${tranRef}`);
      } else if (response.data.status === 'FAILED') {
        router.push(`/dashboard/payments/failed?paymentId=${paymentId}&tranRef=${tranRef}`);
      }
    } catch (err) {
      console.error('Error fetching payment details:', err);
      setError('Failed to fetch payment details');
    } finally {
      setLoading(false);
      setChecking(false);
    }
  };

  useEffect(() => {
    fetchPaymentDetails();
    // Auto-refresh every 5 seconds
    const interval = setInterval(fetchPaymentDetails, 5000);
    return () => clearInterval(interval);
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
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4">
            <Clock className="h-10 w-10 text-yellow-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Pending
          </h1>
          
          <p className="text-gray-600 mb-6">
            Your payment is being processed. This may take a few moments.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-red-800">{error}</p>
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
                  <span className="font-semibold text-yellow-600">
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
              onClick={fetchPaymentDetails}
              disabled={checking}
              className="w-full bg-[#1c4233] hover:bg-[#245240]"
            >
              {checking ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Check Status
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard')}
              className="w-full"
            >
              Back to Dashboard
            </Button>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> This page will automatically refresh every 5 seconds to check your payment status.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

