'use client';

import { Formik, Form, useFormikContext } from 'formik';
import * as Yup from 'yup';
import { useMutation, useQuery } from '@tanstack/react-query';
import { businessService } from '@/services/business.service';
import { Category, categoryService } from '@/services/category.service';
import { toast } from 'sonner';
import { useRouter, useParams } from 'next/navigation';
import { 
  BasicInfoSection, 
  ContactSection, 
  LocationSection, 
  WorkingHoursSection, 
  ImageUploadSection, 
  SEOSection 
} from '@/components/dashboard/add-listing';
import { Loader2, Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

const validationSchema = Yup.object({
  name: Yup.string().required('Business name is required').min(3, 'Name must be at least 3 characters'),
  slug: Yup.string().required('Slug is required').matches(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  phone: Yup.string().required('Phone is required'),
  address: Yup.string().required('Address is required'),
  categoryId: Yup.string().required('Category is required'),
  cityId: Yup.string().required('City is required'),
  description: Yup.string(),
  whatsapp: Yup.string(),
  website: Yup.string().url('Invalid URL'),
  crNumber: Yup.string(),
  latitude: Yup.number().nullable(),
  longitude: Yup.number().nullable(),
  metaTitle: Yup.string().max(60, 'Meta title should not exceed 60 characters'),
  metaDescription: Yup.string().max(160, 'Meta description should not exceed 160 characters'),
});

export default function EditListingPage() {
  const router = useRouter();
  const params = useParams();
  const businessId = params.id as string;

  // Fetch business data
  const { data: businessData, isLoading: isLoadingBusiness } = useQuery({
    queryKey: ['business', businessId],
    queryFn: () => businessService.getBusinessById(businessId),
  });

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.fetchCategories(),
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => businessService.updateBusiness(businessId, data),
    onSuccess: () => {
      toast.success('Business listing updated successfully!');
      router.push('/dashboard/my-listings');
    },
    onError: (error: any) => {
      console.error('Update business error:', error);
      toast.error(error?.message || 'Failed to update business listing');
    },
  });

  function parsePhoneNumber(phone: string | null | undefined): { countryCode: string; number: string } {
    if (!phone) return { countryCode: '+966', number: '' };
    
    // Common country codes to check
    const countryCodes = ['+966', '+971', '+965', '+974', '+973', '+968', '+961', '+962', '+20', '+1', '+44', '+91', '+92', '+33', '+49', '+81', '+86', '+61', '+27', '+234'];
    
    for (const code of countryCodes) {
      if (phone.startsWith(code)) {
        return {
          countryCode: code,
          number: phone.substring(code.length),
        };
      }
    }
    
    // Default to Saudi Arabia if no code found
    return { countryCode: '+966', number: phone };
  }

  const handleSubmit = async (values: any) => {
    try {
      // Filter out closed days from working hours
      const filteredWorkingHours: any = {};
      Object.entries(values.workingHours).forEach(([day, hours]: any) => {
        if (!hours.isClosed) {
          filteredWorkingHours[day] = {
            open: hours.open,
            close: hours.close,
          };
        }
      });

      const phoneWithCode = values.phoneCountryCode && values.phone 
        ? `${values.phoneCountryCode}${values.phone}` 
        : values.phone;
      
      const whatsappWithCode = values.whatsappCountryCode && values.whatsapp 
        ? `${values.whatsappCountryCode}${values.whatsapp}` 
        : values.whatsapp;

      const submitData = {
        ...values,
        phone: phoneWithCode,
        whatsapp: whatsappWithCode || undefined,
        latitude: values.latitude ? parseFloat(values.latitude) : undefined,
        longitude: values.longitude ? parseFloat(values.longitude) : undefined,
        workingHours: Object.keys(filteredWorkingHours).length > 0 ? filteredWorkingHours : undefined,
        // Remove country code fields from submission
        phoneCountryCode: undefined,
        whatsappCountryCode: undefined,
      };

      await updateMutation.mutateAsync(submitData);
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  if (isLoadingBusiness) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#1c4233]" />
      </div>
    );
  }

  if (!businessData) {
    return (
      <div className="max-w-7xl mx-auto py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Business not found</h2>
          <Link href="/dashboard" className="text-[#1c4233] hover:underline mt-4 inline-block">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const business = businessData;

  // Parse phone numbers to extract country codes
  const phoneParsed = parsePhoneNumber(business.phone);
  const whatsappParsed = parsePhoneNumber(business.whatsapp);

  // Prepare initial values from business data
  const initialValues = {
    name: business.name || '',
    slug: business.slug || '',
    description: business.description || '',
    email: business.email || '',
    phone: phoneParsed.number,
    phoneCountryCode: phoneParsed.countryCode,
    whatsapp: whatsappParsed.number,
    whatsappCountryCode: whatsappParsed.countryCode,
    website: business.website || '',
    address: business.address || '',
    latitude: business.latitude?.toString() || '',
    longitude: business.longitude?.toString() || '',
    categoryId: business.category?.id || '', // Changed
    cityId: business.city?.id || '', // Changed
    crNumber: business.crNumber || '',
    workingHours: prepareWorkingHours(business.workingHours), // Use helper function
    metaTitle: business.metaTitle || '',
    metaDescription: business.metaDescription || '',
    keywords: business.keywords || [],
    logo: null,
    coverImage: null,
    images: [],
    // Store existing images for display
    existingLogo: business.logo || null,
    existingCoverImage: business.coverImage || null,
    existingImages: business.images || [],
  };
  
  // Add this helper function above the component
  function prepareWorkingHours(workingHours: any) {
    const defaultHours = {
      monday: { open: '09:00', close: '18:00', isClosed: false },
      tuesday: { open: '09:00', close: '18:00', isClosed: false },
      wednesday: { open: '09:00', close: '18:00', isClosed: false },
      thursday: { open: '09:00', close: '18:00', isClosed: false },
      friday: { open: '09:00', close: '18:00', isClosed: false },
      saturday: { open: '09:00', close: '18:00', isClosed: false },
      sunday: { open: '09:00', close: '18:00', isClosed: false },
    };
  
    if (!workingHours) return defaultHours;
  
    // Mark days as closed if they don't exist in workingHours
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const result: any = {};
  
    days.forEach(day => {
      if (workingHours[day]) {
        result[day] = {
          open: workingHours[day].open,
          close: workingHours[day].close,
          isClosed: false,
        };
      } else {
        result[day] = {
          open: '09:00',
          close: '18:00',
          isClosed: true, // Mark as closed
        };
      }
    });
  
    return result;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="my-5">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Edit Listing</h1>
        <p className="text-gray-600 mt-2">
          Update your business listing details
        </p>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, isSubmitting }) => (
          <Form className="space-y-6">
            {/* Inject categories into form context */}
            <CategoryInjector categories={categoriesData?.data.categories as Category[] || []} />

            <BasicInfoSection />
            <ContactSection />
            <LocationSection />
            <WorkingHoursSection />
            <ImageUploadSection />
            <SEOSection />

            {/* Submit Button */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Your changes will be saved immediately
                </p>
                <button
                  type="submit"
                  disabled={isSubmitting || updateMutation.isPending}
                  className="flex items-center gap-2 px-8 py-3 bg-[#1c4233] hover:bg-[#245240] text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting || updateMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Update Listing
                    </>
                  )}
                </button>
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}

// Helper component to inject categories into BasicInfoSection
function CategoryInjector({ categories }: { categories: any[] }) {
  const { setFieldValue } = useFormikContext<any>();

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `window.__CATEGORIES__ = ${JSON.stringify(categories)}`,
      }}
    />
  );
}