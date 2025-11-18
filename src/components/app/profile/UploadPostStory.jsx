import React, { useState } from 'react';
import { X } from 'lucide-react';
import Button from '../../common/Button';
import Input from '../../common/Input';
import { useDispatch } from "react-redux";
import { createPost } from "../../../redux/slices/posts.slice";
import { ErrorToast, SuccessToast } from "../../global/Toaster";

export default function UploadPostStory({ setIsOpen, isOpen, setSelectedType, title, selectedPages }) {
  const dispatch = useDispatch();

  const [bodyText, setBodyText] = useState('');
  const [images, setImages] = useState([]);
  const MAX_IMAGES = 6;


  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);

    const remainingSlots = MAX_IMAGES - images.length;
    if (remainingSlots <= 0) {
      ErrorToast(`Maximum ${MAX_IMAGES} media allowed!`);
      return;
    }

    const filesToAdd = files.slice(0, remainingSlots);

    filesToAdd.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => [...prev, {
          id: Date.now() + Math.random(),
          url: reader.result,
          fileObject: file
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (id) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  // ======================
  // VALIDATION + API SEND
  // ======================
  const handlePostNow = () => {
    if (!bodyText.trim()) {
      ErrorToast("Body text is required!");
      return;
    }

    if (images.length === 0) {
      ErrorToast("Please upload at least one photo or video!");
      return;
    }

    if (!selectedPages || selectedPages.length === 0) {
      ErrorToast("No page selected!");
      return;
    }

    const pageId = selectedPages[0];

    const fd = new FormData();
    selectedPages.forEach((selectedPages) => {
      fd.append("pages[]", selectedPages);
    });
    fd.append("bodyText", bodyText);

    // media
    images.forEach((img) => {
      fd.append("media", img.fileObject);
    });

    dispatch(createPost(fd))
      .unwrap()
      .then(() => {
        SuccessToast("Post Created Successfully!");

        // reset
        setBodyText('');
        setImages([]);
        setSelectedType("Done");
      })
      .catch((err) => {
        ErrorToast(err || "Failed to create post");
      });
  };

  return (
    <div>
      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50" />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-slideUp overflow-hidden">

              <div className="p-5 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-orange-500 hover:text-orange-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-5 max-h-[70vh] overflow-y-auto">

                {/* BODY TEXT */}
                <div className="mb-5">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Body Text
                  </label>

                  <textarea
                    value={bodyText}
                    onChange={(e) => setBodyText(e.target.value)}
                    placeholder="Write your content here..."
                    rows="4"
                    className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 resize-none transition-all"
                  />
                </div>

                {/* MEDIA UPLOAD */}
                <div className="mb-5">
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Upload Photos or Videos
                  </label>

                  <div className="grid grid-cols-3 gap-3">
                    {images.map((image) => (
                      <div key={image.id} className="relative group">
                        <img
                          src={image.url}
                          alt="Uploaded"
                          className="w-[120px] h-[120px] object-cover rounded-xl"
                        />
                        <button
                          onClick={() => removeImage(image.id)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center hover:bg-gray-700 transition"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}

                    {images.length < MAX_IMAGES && (
                      <Input
                        type="file"
                        accept="image/*,video/*"
                        multiple
                        onChange={handleImageUpload}
                        fileClassName="w-[120px] h-[120px] rounded-xl"
                      />
                    )}
                  </div>

                  <p className="text-xs text-gray-500 mt-2">
                    {images.length}/{MAX_IMAGES} media uploaded
                  </p>
                </div>

                {/* CTA */}
                <Button
                  onClick={handlePostNow}
                  className="w-full flex justify-center"
                  size="lg"
                  variant="orange"
                >
                  Post Now
                </Button>

              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
