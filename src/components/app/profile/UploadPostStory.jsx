import React, { useState } from "react";
import { X } from "lucide-react";
import Button from "../../common/Button";
import Input from "../../common/Input";
import { useDispatch, useSelector } from "react-redux";
import {
  createPost,
  createStory,
  getPostsByPageId,
} from "../../../redux/slices/posts.slice";
import { ErrorToast, SuccessToast } from "../../global/Toaster";

export default function UploadPostStory({
  setIsOpen,
  isOpen,
  setSelectedType,
  title,
  selectedPages,
}) {
  const dispatch = useDispatch();
  const { postsLoading } = useSelector((state) => state.posts);
  const [bodyText, setBodyText] = useState("");
  const [images, setImages] = useState([]);
  const MAX_IMAGES = 6;

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);

    // ✅ Image ho toh sirf JPG/PNG, video sab allowed
    const invalidFiles = files.filter((f) => {
      if (f.type.startsWith("video/")) return false;
      return f.type !== "image/jpeg" && f.type !== "image/png";
    });

    if (invalidFiles.length > 0) {
      ErrorToast("Only JPG, PNG images and videos are allowed!");
      return;
    }

    // ✅ Image 5MB se zyada nahi honi chahiye
    const oversizedImages = files.filter(
      (f) => f.type.startsWith("image/") && f.size > 5 * 1024 * 1024
    );

    if (oversizedImages.length > 0) {
      ErrorToast("Image size must be less than 5MB!");
      return;
    }

    const remainingSlots = MAX_IMAGES - images.length;
    if (remainingSlots <= 0) {
      ErrorToast(`Maximum ${MAX_IMAGES} media allowed!`);
      return;
    }

    const filesToAdd = files.slice(0, remainingSlots);

    filesToAdd.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages((prev) => [
          ...prev,
          {
            id: Date.now() + Math.random(),
            url: reader.result,
            fileObject: file,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (id) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handlePostNow = () => {
    if (!bodyText.trim()) {
      ErrorToast("Body text is required!");
      return;
    }

    if (!selectedPages || selectedPages.length === 0) {
      ErrorToast("No page selected!");
      return;
    }

    const pageId = selectedPages[0];

    const fd = new FormData();
    selectedPages.forEach((page) => {
      fd.append("pages[]", page);
    });
    fd.append("bodyText", bodyText);

    images.forEach((img) => {
      fd.append("media", img.fileObject);
    });

    dispatch(title == "Create Story" ? createStory(fd) : createPost(fd))
      .unwrap()
      .then(async () => {
        if (pageId) {
          try {
            await dispatch(
              getPostsByPageId({ pageId, page: 1, limit: 100 })
            ).unwrap();
          } catch (err) {
            console.error("Failed to refresh posts after create:", err);
          }
        }

        SuccessToast(title + " Successfully!");

        setBodyText("");
        setImages([]);

        if (setSelectedType) {
          setSelectedType("Done");
        }
        if (setIsOpen) {
          setIsOpen(false);
        }
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
                        {image.fileObject?.type?.startsWith("video/") ? (
                          <video
                            src={image.url}
                            className="w-[120px] h-[120px] object-cover rounded-xl"
                            controls={false}
                            muted
                          />
                        ) : (
                          <img
                            src={image.url}
                            alt="Uploaded"
                            className="w-[120px] h-[120px] object-cover rounded-xl"
                          />
                        )}
                        <button
                          onClick={() => removeImage(image.id)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center hover:bg-gray-700 transition z-10"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        {image.fileObject?.type?.startsWith("video/") && (
                          <div className="absolute bottom-1 left-1 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded">
                            Video
                          </div>
                        )}
                      </div>
                    ))}

                    {images.length < MAX_IMAGES && (
                      <Input
                        type="file"
                        accept="image/jpeg,image/png,video/*"
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
                  disabled={postsLoading}
                  className="w-full flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  size="lg"
                  variant="orange"
                >
                  {postsLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Posting...</span>
                    </>
                  ) : (
                    "Post Now"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}