import { useState } from 'react';
import { useFormikContext } from 'formik';
import { Shield, CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { crService, type CRFullInfo } from '@/services/cr.service';
import { toast } from 'sonner';

export default function CRVerificationSection() {
  const { values, errors, touched, handleChange, handleBlur, setFieldValue } = useFormikContext<any>();
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    status: 'success' | 'error' | null;
    data?: CRFullInfo;
    message?: string;
  }>({ status: null });

  const handleVerify = async () => {
    const crNumber = values.crNumber?.trim();

    if (!crNumber) {
      toast.error('Please enter a CR number');
      return;
    }

    if (!/^\d{10}$/.test(crNumber)) {
      toast.error('CR number must be exactly 10 digits');
      return;
    }

    setIsVerifying(true);
    setVerificationResult({ status: null });

    try {
      const result = await crService.verifyFull(crNumber, 'ar');

      // Check if CR is active
      if (result.status.id !== 1) {
        // Status is not active
        setVerificationResult({
          status: 'error',
          message: `Commercial Registration status: ${result.status.name}. Only active CRs can be verified.`,
        });
        toast.error(`CR Status: ${result.status.name}`);
        return;
      }

      setVerificationResult({
        status: 'success',
        data: result,
        message: 'CR verified successfully',
      });

      // Auto-fill form fields from CR data
      if (result.name && !values.name) {
        setFieldValue('name', result.name);
      }

      if (result.contactInfo) {
        if (result.contactInfo.email && !values.email) {
          setFieldValue('email', result.contactInfo.email);
        }
        if (result.contactInfo.websiteUrl && !values.website) {
          setFieldValue('website', result.contactInfo.websiteUrl);
        }
        if (result.contactInfo.phoneNo && !values.phone) {
          // Extract phone number without country code if present
          const phoneNo = result.contactInfo.phoneNo.replace(/^(\+966|966|0)/, '');
          setFieldValue('phone', phoneNo);
        }
      }

      toast.success('CR verified successfully! Some fields have been auto-filled.');
    } catch (error: any) {
      console.error('CR Verification Error:', error);
      setVerificationResult({
        status: 'error',
        message: error.message || 'Failed to verify CR number',
      });
      toast.error(error.message || 'Failed to verify CR number');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-green-50 rounded-lg">
          <Shield className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">CR Verification</h2>
          <p className="text-sm text-gray-500 mt-1">
            Verify your business Commercial Registration (optional)
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* CR Number Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Commercial Registration (CR) Number
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              name="crNumber"
              value={values.crNumber || ''}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                setFieldValue('crNumber', value);
                setVerificationResult({ status: null });
              }}
              onBlur={handleBlur}
              placeholder="Enter 10-digit CR number"
              maxLength={10}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1c4233] focus:border-transparent"
            />
            <button
              type="button"
              onClick={handleVerify}
              disabled={isVerifying || !values.crNumber || values.crNumber.length !== 10}
              className="px-6 py-3 bg-[#1c4233] text-white rounded-lg font-medium hover:bg-[#152f26] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 min-w-[120px] justify-center"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  Verify
                </>
              )}
            </button>
          </div>
          {touched.crNumber && errors.crNumber && (
            <p className="mt-1 text-sm text-red-600">{errors.crNumber as string}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            Enter your 10-digit Commercial Registration number to verify your business
          </p>
        </div>

        {/* Verification Result */}
        {verificationResult.status && (
          <div
            className={`p-4 rounded-lg border ${
              verificationResult.status === 'success'
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}
          >
            <div className="flex items-start gap-3">
              {verificationResult.status === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p
                  className={`font-medium ${
                    verificationResult.status === 'success' ? 'text-green-900' : 'text-red-900'
                  }`}
                >
                  {verificationResult.message}
                </p>
                {verificationResult.data && (
                  <div className="mt-3 space-y-2 text-sm text-green-700">
                    <div>
                      <span className="font-medium">Business Name:</span> {verificationResult.data.name}
                    </div>
                    <div>
                      <span className="font-medium">CR Number:</span> {verificationResult.data.crNumber}
                    </div>
                    <div>
                      <span className="font-medium">Status:</span> {verificationResult.data.status.name}
                    </div>
                    <div>
                      <span className="font-medium">Entity Type:</span>{' '}
                      {verificationResult.data.entityType.formName}
                    </div>
                    {verificationResult.data.headquarterCityName && (
                      <div>
                        <span className="font-medium">City:</span>{' '}
                        {verificationResult.data.headquarterCityName}
                      </div>
                    )}
                    {verificationResult.data.activities && verificationResult.data.activities.length > 0 && (
                      <div>
                        <span className="font-medium">Activities:</span>
                        <ul className="mt-1 ml-4 list-disc space-y-1">
                          {verificationResult.data.activities.slice(0, 3).map((activity) => (
                            <li key={activity.id}>{activity.name}</li>
                          ))}
                          {verificationResult.data.activities.length > 3 && (
                            <li className="text-green-600">
                              +{verificationResult.data.activities.length - 3} more
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Info Notice */}
        <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 text-sm text-blue-700">
            <p className="font-medium">Why verify your CR?</p>
            <ul className="mt-2 space-y-1 ml-4 list-disc">
              <li>Builds trust with customers</li>
              <li>Auto-fills business information</li>
              <li>Verified badge on your listing</li>
              <li>Higher search ranking</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

