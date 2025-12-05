'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { CheckCircle2, XCircle, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

function mapStatus(respStatus: string | null) {
  if (!respStatus) {
    return { type: 'unknown' as const, label: 'Unknown', description: 'No payment status was provided.' };
  }

  const code = respStatus.toUpperCase();

  if (code === 'A' || code === 'S') {
    return {
      type: 'success' as const,
      label: 'Payment Successful',
      description: 'Your payment has been authorized successfully.',
    };
  }

  if (code === 'C') {
    return {
      type: 'cancelled' as const,
      label: 'Payment Cancelled',
      description: 'You cancelled the payment on the PayTabs page.',
    };
  }

  if (code === 'D' || code === 'E' || code === 'V') {
    return {
      type: 'failed' as const,
      label: 'Payment Failed',
      description: 'The payment could not be completed. Please try again or use a different card.',
    };
  }

  if (code === 'H' || code === 'P') {
    return {
      type: 'pending' as const,
      label: 'Payment Pending',
      description: 'Your payment is being processed. This may take a few moments.',
    };
  }

  return {
    type: 'unknown' as const,
    label: 'Unknown Status',
    description: 'We received an unrecognized payment status. Please check your transactions.',
  };
}

export default function PaymentStatusPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const respStatus = searchParams.get('respStatus') || searchParams.get('response_status');
  const respMessage = searchParams.get('respMessage') || searchParams.get('response_message');
  const tranRef = searchParams.get('tranRef') || searchParams.get('tran_ref');

  const statusInfo = useMemo(() => mapStatus(respStatus), [respStatus]);

  const Icon =
    statusInfo.type === 'success'
      ? CheckCircle2
      : statusInfo.type === 'failed' || statusInfo.type === 'cancelled'
      ? XCircle
      : Clock;

  const iconColor =
    statusInfo.type === 'success'
      ? 'text-green-600'
      : statusInfo.type === 'failed' || statusInfo.type === 'cancelled'
      ? 'text-red-600'
      : 'text-yellow-600';

  const badgeBg =
    statusInfo.type === 'success'
      ? 'bg-green-100 text-green-800'
      : statusInfo.type === 'failed' || statusInfo.type === 'cancelled'
      ? 'bg-red-100 text-red-800'
      : statusInfo.type === 'pending'
      ? 'bg-yellow-100 text-yellow-800'
      : 'bg-gray-100 text-gray-800';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-4
            ${statusInfo.type === 'success' ? 'bg-green-100' :
              statusInfo.type === 'failed' || statusInfo.type === 'cancelled' ? 'bg-red-100' :
              'bg-yellow-100'}
          `}>
            <Icon className={`h-10 w-10 ${iconColor}`} />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">{statusInfo.label}</h1>

          <p className="text-gray-600 mb-4">{statusInfo.description}</p>

          {respMessage && (
            <div className="mb-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${badgeBg}`}>
                {respMessage}
              </span>
            </div>
          )}

          {tranRef && (
            <div className="bg-gray-50 rounded-lg p-3 mb-4 text-left">
              <p className="text-xs text-gray-500 mb-1">Transaction Reference</p>
              <p className="text-sm font-mono break-all text-gray-900">{tranRef}</p>
            </div>
          )}

          <div className="space-y-3 mt-4">
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

          <p className="mt-6 text-xs text-gray-500">
            If this status looks incorrect, please check your transactions in the dashboard or contact support with
            your transaction reference.
          </p>
        </div>
      </div>
    </div>
  );
}


