import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, X, Image as ImageIcon, Plus, Trash2, AlertTriangle, Check } from 'lucide-react';

// Assuming you have your Supabase client set up and imported
import { supabase } from '../../services/supabase.ts';

interface GalleryImage {
  id: string; // The ID from your 'vendor_images' table
  url: string; // The image_url from your 'vendor_images' table
  caption?: string; // Optional, if you decide to add a caption column later or use file name
}

const VendorGallery: React.FC = () => {
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Renamed from currentVendorId to authenticatedUserId for clarity,
  // as it initially holds the auth.uid()
  const [authenticatedUserId, setAuthenticatedUserId] = useState<string | null>(null);
  // This state will store the 'id' from the public.vendors table
  const [vendorProfileId, setVendorProfileId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Effect to get authenticated user ID, fetch vendor profile ID, and then gallery images ---
  useEffect(() => {
    const getVendorAndFetchImages = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError) {
          console.error('Supabase user fetch error:', userError);
          throw new Error(`Failed to get user: ${userError.message}`);
        }

        if (!user) {
          setAuthenticatedUserId(null);
          setVendorProfileId(null); // Clear vendor profile ID if no user
          setGalleryImages([]);
          setLoading(false);
          console.warn('No authenticated user found. Gallery will be empty. Please ensure a user is logged in.');
          return;
        }

        const currentAuthUserId = user.id;
        setAuthenticatedUserId(currentAuthUserId);

        // --- NEW LOGIC: Fetch the vendor's actual ID from the 'public.vendors' table ---
        // This is the 'id' that vendor_images.vendor_id expects
        console.log('Attempting to fetch vendor profile for user ID:', currentAuthUserId);
        const { data: vendorProfile, error: vendorProfileError } = await supabase
          .from('vendors') // This refers to your 'public.vendors' table
          .select('id')   // Select only the 'id' column
          .eq('user_id', currentAuthUserId) // Filter by the currently authenticated user's ID
          .single(); // Expecting one vendor profile per user

        if (vendorProfileError || !vendorProfile) {
          console.error("Error fetching vendor profile ID:", vendorProfileError || "Vendor profile not found for user.");
          setError(vendorProfileError?.message || "Vendor profile not found. Please ensure your vendor profile exists.");
          setVendorProfileId(null);
          setGalleryImages([]);
          setLoading(false);
          return; // Stop execution if vendor profile not found
        }

        const actualVendorId = vendorProfile.id;
        setVendorProfileId(actualVendorId); // Store the actual vendor ID

        console.log('Fetched Vendor Profile ID (from public.vendors.id):', actualVendorId);

        // --- Use the actualVendorId to fetch gallery images ---
        const { data, error: fetchError } = await supabase
          .from('vendor_images')
          .select('id, image_url')
          .eq('vendor_id', actualVendorId); // Filter by the actual vendor ID

        if (fetchError) {
          console.error('Supabase fetch error for vendor_images:', fetchError);
          throw new Error(`Error fetching gallery images: ${fetchError.message}`);
        }

        const fetchedImages: GalleryImage[] = data.map(item => ({
          id: item.id.toString(),
          url: item.image_url,
        }));
        setGalleryImages(fetchedImages);

      } catch (err: any) {
        console.error('Failed to initialize gallery:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getVendorAndFetchImages();

    // Listen for auth state changes to re-fetch when auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', _event, 'Session User ID:', session?.user?.id);
      getVendorAndFetchImages(); // Re-fetch when auth state changes
    });

    return () => {
      authListener?.subscription.unsubscribe(); // Clean up subscription
    };
  }, []); // Empty dependency array means this runs once on component mount and cleans up on unmount

  const toggleImageSelection = (id: string) => {
    setSelectedImages(prev => {
      if (prev.includes(id)) {
        return prev.filter(imageId => imageId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const clearSelection = () => {
    setSelectedImages([]);
  };

  const handleBrowseClick = () => {
    const input = fileInputRef.current;
    if (input) {
      input.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target as HTMLInputElement & { files: FileList | null };
    if (input.files) {
      setFilesToUpload(Array.from(input.files));
    }
  };

  const handleDeleteSelected = async () => {
    if (!vendorProfileId) { // Use vendorProfileId here
      alert('You must have a vendor profile to delete images.');
      return;
    }
    if (selectedImages.length === 0) {
      alert('No images selected for deletion.');
      return;
    }

    setShowDeleteConfirm(false);
    setError(null);
    setLoading(true);

    try {
      const imagesToDelete = galleryImages.filter(img => selectedImages.includes(img.id));
      const imageUrlsToDelete = imagesToDelete.map(img => img.url);

      let bucketNameFromUrl = '';
      const filePathsInStorage = imageUrlsToDelete.map(url => {
        try {
          const urlParts = new URL(url);
          const pathSegments = urlParts.pathname.split('/');
          const publicIndex = pathSegments.indexOf('public');

          if (publicIndex > -1 && pathSegments.length > publicIndex + 2) {
            bucketNameFromUrl = pathSegments[publicIndex + 1];
            return pathSegments.slice(publicIndex + 2).join('/');
          }
          throw new Error('Unexpected URL format for Supabase Storage.');
        } catch (e) {
          console.warn(`Could not parse URL for deletion: ${url}`, e);
          return '';
        }
      }).filter(Boolean);

      const BUCKET_NAME_FOR_DELETE = bucketNameFromUrl || 'vendor-images'; // Ensure this matches your bucket name

      if (filePathsInStorage.length > 0) {
        const { error: storageError } = await supabase.storage
          .from(BUCKET_NAME_FOR_DELETE)
          .remove(filePathsInStorage);

        if (storageError) {
          throw new Error(`Storage deletion failed: ${storageError.message}`);
        }
        console.log('Images deleted from storage:', filePathsInStorage);
      }

      const { error: dbError } = await supabase
        .from('vendor_images')
        .delete()
        .in('id', selectedImages); // Delete rows where 'id' is in the selectedImages array

      if (dbError) {
        throw new Error(`Database deletion failed: ${dbError.message}`);
      }
      console.log('Images deleted from database:', selectedImages);

      setGalleryImages(prev => prev.filter(img => !selectedImages.includes(img.id)));
      setSelectedImages([]);
      alert('Selected images deleted successfully!');

    } catch (err: any) {
      console.error('Error deleting images:', err);
      setError(`Failed to delete images: ${err.message}`);
      alert(`Failed to delete images: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async () => {
    if (filesToUpload.length === 0) {
      alert('Please select files to upload.');
      return;
    }
    // Use vendorProfileId, which is the actual ID from public.vendors
    if (!vendorProfileId) {
      alert('Cannot upload: Vendor profile ID not found. Please ensure your vendor profile exists.');
      return;
    }

    setError(null);
    setLoading(true);
    setShowUploadModal(false);

    try {
      const uploadedImageDetails: GalleryImage[] = [];
      const BUCKET_NAME = 'vendor-images'; // <<<<<<< CONFIRM THIS IS YOUR ACTUAL BUCKET NAME

      for (const file of filesToUpload) {
        // Create a unique file path in storage: authenticatedUserId/timestamp-filename
        // Use authenticatedUserId for the folder path as it's typically tied to the user's storage space
        const filePath = `${authenticatedUserId}/${Date.now()}-${file.name.replace(/\s+/g, '_')}`;

        console.log('Attempting to upload file:', file.name);
        console.log('File path for storage:', filePath);
        console.log('Bucket name for storage:', BUCKET_NAME);

        // 1. Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          console.error("Storage upload error:", uploadError);
          throw new Error(`Storage upload failed for ${file.name}: ${uploadError.message}`);
        }
        console.log('Storage upload successful for:', file.name, 'Data:', uploadData);

        // 2. Get the public URL for the uploaded file
        const { data: publicUrlData } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(filePath);

        if (!publicUrlData || !publicUrlData.publicUrl) {
          throw new Error(`Failed to get public URL for ${file.name}`);
        }
        const imageUrl = publicUrlData.publicUrl;
        console.log('Public URL obtained:', imageUrl);

        // 3. Insert record into 'vendor_images' table
        const imageDataToInsert = {
          // Use the fetched vendorProfileId here, NOT authenticatedUserId
          vendor_id: vendorProfileId,
          image_url: imageUrl,
        };

        console.log('Data being prepared for database insert:', imageDataToInsert);

        const { data: dbInsertData, error: dbInsertError } = await supabase
          .from('vendor_images')
          .insert(imageDataToInsert)
          .select('id, image_url');

        if (dbInsertError) {
          console.error('Database insert error:', dbInsertError);
          // If DB insert fails, attempt to delete the file from storage for cleanup
          await supabase.storage.from(BUCKET_NAME).remove([filePath]);
          throw new Error(`Database insert failed for ${file.name}: ${dbInsertError.message}`);
        }
        console.log('Database insert successful:', dbInsertData);

        const newImageRow = dbInsertData[0];
        if (!newImageRow || !newImageRow.id) {
            throw new Error(`No ID returned for inserted image ${file.name}.`);
        }

        uploadedImageDetails.push({
          id: newImageRow.id.toString(),
          url: newImageRow.image_url,
        });
      }

      setGalleryImages(prev => [...prev, ...uploadedImageDetails]);
      setFilesToUpload([]);
      alert('Photos uploaded successfully!');

    } catch (err: any) {
      console.error('Error uploading files:', err);
      setError(`Failed to upload images: ${err.message}`);
      alert(`Failed to upload images: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Gallery</h2>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm"
          >
            <Upload size={16} />
            <span>Upload Photos</span>
          </button>

          {selectedImages.length > 0 && (
            <>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
              >
                <Trash2 size={16} />
                <span>Delete Selected</span>
              </button>

              <button
                type="button"
                aria-label="Clear selection"
                onClick={clearSelection}
                className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
              >
                <X size={18} />
              </button>
            </>
          )}
        </div>
      </div>

      {selectedImages.length > 0 && (
        <div className="mb-4 p-3 bg-purple-50 dark:bg-purple-900/10 text-purple-800 dark:text-purple-300 rounded-lg flex items-center justify-between">
          <span>
            {selectedImages.length} {selectedImages.length === 1 ? 'image' : 'images'} selected
          </span>
        </div>
      )}

      {loading ? (
        <div className="text-center p-8 text-gray-500 dark:text-gray-400">Loading gallery...</div>
      ) : error ? (
        <div className="bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-4 rounded-lg text-center">
          Error: {error}
        </div>
      ) : galleryImages.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {galleryImages.map((image) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`aspect-square relative rounded-lg overflow-hidden group cursor-pointer ${
                selectedImages.includes(image.id) ? 'ring-4 ring-purple-500' : ''
              }`}
              onClick={() => toggleImageSelection(image.id)}
            >
              <img
                src={image.url}
                alt={image.caption || 'Gallery image'}
                className="w-full h-full object-cover transition group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition">
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-white text-sm truncate">{image.caption}</p>
                </div>
              </div>

              {selectedImages.includes(image.id) && (
                <div className="absolute top-2 right-2 bg-purple-600 text-white p-1 rounded-full">
                  <Check size={16} />
                </div>
              )}
            </motion.div>
          ))}

          {/* Add More Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="aspect-square border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center cursor-pointer hover:border-purple-500 dark:hover:border-purple-400 transition"
            onClick={() => setShowUploadModal(true)}
          >
            <div className="text-center">
              <Plus size={24} className="mx-auto mb-2 text-gray-400 dark:text-gray-500" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Add More Photos</p>
            </div>
          </motion.div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center">
          <div className="mb-4">
            <div className="inline-block p-4 bg-gray-100 dark:bg-gray-700 rounded-full">
              <ImageIcon size={32} className="text-gray-500 dark:text-gray-400" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No photos in your gallery
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Upload photos to showcase your services to potential customers.
          </p>
          <button
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center justify-center mx-auto"
            onClick={() => setShowUploadModal(true)}
          >
            <Upload size={18} className="mr-2" />
            Upload Photos
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/80 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-xl"
          >
            <div className="flex items-start mb-4">
              <div className="bg-red-100 dark:bg-red-900/30 rounded-full p-2 text-red-600 dark:text-red-400 mr-3">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  Delete {selectedImages.length} {selectedImages.length === 1 ? 'image' : 'images'}?
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  This action cannot be undone. These images will be permanently removed from your gallery.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSelected}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/80 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-lg w-full shadow-xl"
          >
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Upload Photos
            </h3>

            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center mb-4">
              <Upload size={32} className="mx-auto mb-3 text-gray-400 dark:text-gray-500" />
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                Drag and drop your images here, or click to browse
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Maximum file size: 5MB • Supported formats: JPEG, PNG
              </p>
              {/* HIDDEN FILE INPUT - THIS IS CRUCIAL */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
                multiple
                accept="image/jpeg, image/png"
                aria-label="Select images to upload"
              />
              <button
                onClick={handleBrowseClick} // Call the function to trigger file input
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                Select Images
              </button>
            </div>

            {/* Display selected files for upload */}
            <div className="space-y-2 mb-6">
              {filesToUpload.map((file, index) => (
                <div key={file.name + index} className="flex items-center bg-purple-50 dark:bg-purple-900/20 p-2 rounded">
                  <div className="w-12 h-12 bg-white dark:bg-gray-700 rounded mr-3 flex items-center justify-center">
                  <ImageIcon size={20} className="text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{file.name}</p>
                    {/* You can add a progress bar here if you implement actual upload progress */}
                    <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-1">
                      {/* This will be 0% initially; update width based on actual upload progress if you implement it */}
                      <div className="bg-purple-600 dark:bg-purple-400 h-full w-0 rounded-full" style={{ width: '0%' }}></div>
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label="Remove image"
                    onClick={() => setFilesToUpload(prev => prev.filter((_, i) => i !== index))} // Remove file from list
                    className="ml-2 p-1 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
              {filesToUpload.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">No files selected for upload.</p>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setFilesToUpload([]); // Clear selected files when closing modal
                }}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleFileUpload}
                disabled={filesToUpload.length === 0 || loading}
                className={`px-4 py-2 rounded-lg transition ${
                  filesToUpload.length === 0 || loading
                    ? 'bg-purple-400 text-white cursor-not-allowed'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                Upload
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default VendorGallery;