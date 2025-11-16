import { useFormikContext } from 'formik';
import { Image as ImageIcon, Upload, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

interface GalleryImage {
  url: string;
  alt?: string;
}

export default function ImageUploadSection() {
  const { values, setFieldValue } = useFormikContext<any>();
  const [logoPrev, setLogoPrev] = useState<string | null>(null);
  const [coverPrev, setCoverPrev] = useState<string | null>(null);
  const [galleryPrev, setGalleryPrev] = useState<GalleryImage[]>([]);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Set existing images on mount
  useEffect(() => {
    if (values.existingLogo && !logoPrev) {
      setLogoPrev(typeof values.existingLogo === 'string' ? values.existingLogo : values.existingLogo.url);
    }
    if (values.existingCoverImage && !coverPrev) {
      setCoverPrev(typeof values.existingCoverImage === 'string' ? values.existingCoverImage : values.existingCoverImage.url);
    }
    if (values.existingImages && values.existingImages.length > 0 && galleryPrev.length === 0) {
      // Handle both old format (string[]) and new format (object[])
      const formattedImages = values.existingImages.map((img: any) => 
        typeof img === 'string' ? { url: img, alt: '' } : img
      );
      setGalleryPrev(formattedImages);
    }
  }, [values.existingLogo, values.existingCoverImage, values.existingImages]);

  const handleFileChange = (field: string, file: File | null, isMultiple = false) => {
    if (!file) return;

    if (isMultiple) {
      const currentFiles = values[field] || [];
      setFieldValue(field, [...currentFiles, file]);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setGalleryPrev(prev => [...prev, { url: reader.result as string, alt: '' }]);
      };
      reader.readAsDataURL(file);
    } else {
      setFieldValue(field, file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        if (field === 'logo') setLogoPrev(reader.result as string);
        if (field === 'coverImage') setCoverPrev(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMultipleFiles = (files: File[]) => {
    if (files.length === 0) return;
    
    // Get current files from formik
    const currentFiles = values.images || [];
    const newFiles = [...currentFiles, ...files];
    
    // Update formik with all files at once
    setFieldValue('images', newFiles);
    
    // Read all files and update preview
    const newPreviews: GalleryImage[] = [];
    let loadedCount = 0;
    
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push({ url: reader.result as string, alt: '' });
        loadedCount++;
        
        // When all files are loaded, update the preview state once
        if (loadedCount === files.length) {
          setGalleryPrev(prev => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeGalleryImage = (index: number) => {
    const isExistingImage = index < (values.existingImages?.length || 0);
    
    if (isExistingImage) {
      const newExistingImages = [...(values.existingImages || [])];
      newExistingImages.splice(index, 1);
      setFieldValue('existingImages', newExistingImages);
    } else {
      const adjustedIndex = index - (values.existingImages?.length || 0);
      const newImages = [...(values.images || [])];
      newImages.splice(adjustedIndex, 1);
      setFieldValue('images', newImages);
    }
    
    const newPreviews = [...galleryPrev];
    newPreviews.splice(index, 1);
    setGalleryPrev(newPreviews);
    setFieldValue('galleryImages', newPreviews);
  };

  const updateGalleryImageAlt = (index: number, alt: string) => {
    const newPreviews = [...galleryPrev];
    newPreviews[index] = { ...newPreviews[index], alt };
    setGalleryPrev(newPreviews);
    
    setFieldValue('galleryImages', newPreviews);
    
    if (index < (values.existingImages?.length || 0)) {
      const newExistingImages = [...(values.existingImages || [])];
      if (typeof newExistingImages[index] === 'string') {
        newExistingImages[index] = { url: newExistingImages[index], alt };
      } else {
        newExistingImages[index] = { ...newExistingImages[index], alt };
      }
      setFieldValue('existingImages', newExistingImages);
    }
  };
  
  // Sync galleryPrev to formik whenever it changes
  useEffect(() => {
    if (galleryPrev.length > 0) {
      setFieldValue('galleryImages', galleryPrev);
    }
  }, [galleryPrev]);

  const removeLogo = () => {
    setFieldValue('logo', null);
    setFieldValue('existingLogo', null);
    setFieldValue('logoAlt', '');
    setLogoPrev(null);
  };

  const removeCover = () => {
    setFieldValue('coverImage', null);
    setFieldValue('existingCoverImage', null);
    setFieldValue('coverImageAlt', '');
    setCoverPrev(null);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-pink-50 rounded-lg">
          <ImageIcon className="w-5 h-5 text-pink-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Logo & Gallery</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Logo Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Logo
          </label>
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange('logo', e.target.files?.[0] || null)}
              className="hidden"
              id="logo-upload"
            />
            <label
              htmlFor="logo-upload"
              className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#1c4233] transition-colors bg-gray-50"
            >
              {logoPrev ? (
                <div className="relative w-full h-full group">
                  <Image src={logoPrev} alt={values.logoAlt || "Logo preview"} fill className="object-contain p-2" />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      removeLogo();
                    }}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Drop files here to upload</p>
                </>
              )}
            </label>
          </div>
          {logoPrev && (
            <div className="mt-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Alt Text
              </label>
              <input
                type="text"
                value={values.logoAlt || ''}
                onChange={(e) => setFieldValue('logoAlt', e.target.value)}
                placeholder="Describe the logo for accessibility"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1c4233]"
              />
            </div>
          )}
          <p className="mt-2 text-xs text-gray-500">Maximum file size: 2 MB</p>
        </div>

        {/* Cover Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Featured Image
          </label>
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange('coverImage', e.target.files?.[0] || null)}
              className="hidden"
              id="cover-upload"
            />
            <label
              htmlFor="cover-upload"
              className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#1c4233] transition-colors bg-gray-50"
            >
              {coverPrev ? (
                <div className="relative w-full h-full group">
                  <Image src={coverPrev} alt={values.coverImageAlt || "Cover preview"} fill className="object-cover rounded-lg" />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      removeCover();
                    }}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Drop files here to upload</p>
                </>
              )}
            </label>
          </div>
          {coverPrev && (
            <div className="mt-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Alt Text
              </label>
              <input
                type="text"
                value={values.coverImageAlt || ''}
                onChange={(e) => setFieldValue('coverImageAlt', e.target.value)}
                placeholder="Describe the featured image for accessibility"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1c4233]"
              />
            </div>
          )}
          <p className="mt-2 text-xs text-gray-500">Maximum file size: 2 MB</p>
        </div>

        {/* Gallery Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Image Gallery
          </label>
          <div className="relative">
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                if (files.length > 0) {
                  handleMultipleFiles(files);
                }
                // Reset input to allow selecting same files again
                if (galleryInputRef.current) {
                  galleryInputRef.current.value = '';
                }
              }}
              className="hidden"
              id="gallery-upload"
            />
            <label
              htmlFor="gallery-upload"
              className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#1c4233] transition-colors bg-gray-50"
            >
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">Drop files here to upload</p>
            </label>
          </div>
          <p className="mt-2 text-xs text-gray-500">Maximum file size: 2 MB</p>
        </div>
      </div>

      {/* Gallery Previews */}
      {galleryPrev.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Gallery Images ({galleryPrev.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {galleryPrev.map((img, index) => (
              <div key={index} className="space-y-2">
                <div className="relative group">
                  <Image
                    src={img.url}
                    alt={img.alt || `Gallery ${index + 1}`}
                    width={200}
                    height={150}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeGalleryImage(index)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Alt Text
                  </label>
                  <input
                    type="text"
                    value={img.alt || ''}
                    onChange={(e) => updateGalleryImageAlt(index, e.target.value)}
                    placeholder="Describe this image for accessibility"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1c4233]"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
