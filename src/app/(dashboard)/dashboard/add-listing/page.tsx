'use client';

import { Formik, Form, useFormikContext } from 'formik';
import * as Yup from 'yup';
import { useMutation, useQuery } from '@tanstack/react-query';
import { businessService } from '@/services/business.service';
import { categoryService } from '@/services/category.service';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { 
  BasicInfoSection, 
  ContactSection, 
  LocationSection, 
  WorkingHoursSection, 
  ImageUploadSection, 
  SEOSection 
} from '@/components/dashboard/add-listing';
import { Loader2, Save } from 'lucide-react';

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

const initialValues = {
  name: '',
  slug: '',
  description: '',
  email: '',
  phone: '',
  whatsapp: '',
  website: '',
  address: '',
  latitude: '',
  longitude: '',
  categoryId: '',
  cityId: '',
  crNumber: '',
  workingHours: {
    monday: { open: '09:00', close: '18:00', isClosed: false },
    tuesday: { open: '09:00', close: '18:00', isClosed: false },
    wednesday: { open: '09:00', close: '18:00', isClosed: false },
    thursday: { open: '09:00', close: '18:00', isClosed: false },
    friday: { open: '09:00', close: '18:00', isClosed: false },
    saturday: { open: '09:00', close: '18:00', isClosed: false },
    sunday: { open: '09:00', close: '18:00', isClosed: false },
  },
  metaTitle: '',
  metaDescription: '',
  keywords: [],
  logo: null,
  coverImage: null,
  images: [],
};

export default function AddListingPage() {
  const router = useRouter();

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.fetchCategories(),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => businessService.createBusiness(data),
    onSuccess: (data) => {
      toast.success('Business listing created successfully! Pending admin approval.');
      router.push('/dashboard');
    },
    onError: (error: any) => {
      console.error('Create business error:', error);
      toast.error(error?.message || 'Failed to create business listing');
    },
  });

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

      const submitData = {
        ...values,
        latitude: values.latitude ? parseFloat(values.latitude) : undefined,
        longitude: values.longitude ? parseFloat(values.longitude) : undefined,
        workingHours: Object.keys(filteredWorkingHours).length > 0 ? filteredWorkingHours : undefined,
      };

      await createMutation.mutateAsync(submitData);
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="my-5">
        <h1 className="text-3xl font-bold text-gray-900">Add New Listing</h1>
        <p className="text-gray-600 mt-2">
          Fill in the details below to create your business listing
        </p>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, isSubmitting }) => (
          <Form className="space-y-6">
            {/* Inject categories into form context */}
            <CategoryInjector categories={categoriesData?.data || []} />

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
                  Your listing will be reviewed by our team before going live
                </p>
                <button
                  type="submit"
                  disabled={isSubmitting || createMutation.isPending}
                  className="flex items-center gap-2 px-8 py-3 bg-[#1c4233] hover:bg-[#245240] text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting || createMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Create Listing
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