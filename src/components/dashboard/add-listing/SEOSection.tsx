import { useFormikContext } from 'formik';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

export default function SEOSection() {
  const { values, handleChange, handleBlur } = useFormikContext<any>();
  const [showSEO, setShowSEO] = useState(false);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 rounded-lg">
            <Search className="w-5 h-5 text-indigo-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">SEO Settings</h2>
        </div>
        <button
          type="button"
          onClick={() => setShowSEO(!showSEO)}
          className="flex items-center gap-2 text-sm font-medium text-[#1c4233] hover:text-[#245240]"
        >
          {showSEO ? (
            <>
              <ChevronUp className="w-4 h-4" />
              Hide
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              Show
            </>
          )}
        </button>
      </div>

      {showSEO && (
        <div className="space-y-6 pt-4 border-t">
          {/* Meta Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meta Title
            </label>
            <input
              type="text"
              name="metaTitle"
              value={values.metaTitle}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Elite Men's Salon - Best Barber Shop in Riyadh"
              maxLength={60}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1c4233] focus:border-transparent"
            />
            <div className="flex justify-between mt-1">
              <p className="text-sm text-gray-500">Recommended: 50-60 characters</p>
              <p className="text-sm text-gray-500">{values.metaTitle?.length || 0}/60</p>
            </div>
          </div>

          {/* Meta Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meta Description
            </label>
            <textarea
              name="metaDescription"
              value={values.metaDescription}
              onChange={handleChange}
              onBlur={handleBlur}
              rows={3}
              placeholder="Professional men's grooming services in Riyadh. Book your appointment today!"
              maxLength={160}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1c4233] focus:border-transparent resize-none"
            />
            <div className="flex justify-between mt-1">
              <p className="text-sm text-gray-500">Recommended: 120-160 characters</p>
              <p className="text-sm text-gray-500">{values.metaDescription?.length || 0}/160</p>
            </div>
          </div>

          {/* Keywords Suggestion */}
          {/* <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Suggested Keywords
            </label>
            <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg">
              <span className="px-3 py-1 bg-white border border-gray-300 rounded-full text-sm text-gray-600">
                Coming soon
              </span>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              We'll suggest relevant keywords based on your business category
            </p>
          </div> */}
        </div>
      )}
    </div>
  );
}