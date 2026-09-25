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
import { getLinkPreview, compressImageFile } from "../../../lib/helpers";
import LinkPreviewCard from "../../global/LinkPreviewCard";

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
  const [isCompressing, setIsCompressing] = useState(false);
  const MAX_IMAGES = 9;
  const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB per image
  const MAX_VIDEO_SIZE = 30 * 1024 * 1024; // 30MB per video
  const MAX_TOTAL_MEDIA_SIZE = 30 * 1024 * 1024; // 30MB total allowed media payload
  const linkData = getLinkPreview(bodyText);

  const currentTotalBytes = images.reduce(
    (sum, img) => sum + (img.fileObject?.size || 0),
    0
  );
  const currentTotalMB = (currentTotalBytes / (1024 * 1024)).toFixed(1);
  const isOverSizeLimit = currentTotalBytes > MAX_TOTAL_MEDIA_SIZE;

  const handleCloseModal = () => {
    images.forEach((img) => {
      if (img.url && img.url.startsWith("blob:")) {
        URL.revokeObjectURL(img.url);
      }
    });
    setBodyText("");
    setImages([]);
    if (typeof setIsOpen === "function") {
      setIsOpen(false);
    }
    if (typeof setSelectedType === "function") {
      setSelectedType(null);
    }
  };

  const handleImageUpload = async (e) => {
  const files = Array.from(e.target.files || []);
  if (files.length === 0) return;

  const invalidFiles = files.filter((f) => {
    if (f.type.startsWith("video/")) return false;
    return !f.type.startsWith("image/");
  });

  if (invalidFiles.length > 0) {
    ErrorToast("Only images (JPEG, PNG, WEBP) and videos are allowed!");
    e.target.value = "";
    return;
  }

  const remainingSlots = MAX_IMAGES - images.length;

  if (remainingSlots <= 0) {
    ErrorToast(`Maximum ${MAX_IMAGES} media allowed!`);
    e.target.value = "";
    return;
  }

  if (files.length > remainingSlots) {
    ErrorToast(
      `You can only add ${remainingSlots} more media item${
        remainingSlots > 1 ? "s" : ""
      }. Maximum is ${MAX_IMAGES}.`
    );
    e.target.value = "";
    return;
  }

  // ❌ 30MB se zyada file ko compress nahi karna
  const oversizedFiles = files.filter(
    (file) => file.size > MAX_VIDEO_SIZE
  );

  if (oversizedFiles.length > 0) {
    ErrorToast("File size must be 30MB or less. Please upload a file under 30MB.");
    e.target.value = "";
    return;
  }

  // Individual video limit
  const oversizedVideos = files.filter(
    (f) => f.type.startsWith("video/") && f.size > MAX_VIDEO_SIZE
  );

  if (oversizedVideos.length > 0) {
    ErrorToast("Video size must be 30MB or less!");
    e.target.value = "";
    return;
  }

  // Ab sirf 30MB ke andar images compress hongi
  setIsCompressing(true);

  let processedFiles = [];

  try {
    processedFiles = await Promise.all(
      files.map(async (file) => {
        if (file.type.startsWith("image/")) {
          return await compressImageFile(file);
        }

        return file;
      })
    );
  } catch (err) {
    console.error("Image compression error:", err);
    processedFiles = files;
  } finally {
    setIsCompressing(false);
  }

  // Compression ke baad bhi final 30MB check
  const oversizedProcessedFiles = processedFiles.filter(
    (file) => file.size > MAX_VIDEO_SIZE
  );

  if (oversizedProcessedFiles.length > 0) {
    ErrorToast(
      "File size must be 30MB or less. Please upload a smaller file."
    );
    e.target.value = "";
    return;
  }

  // Total 30MB check
  const incomingBatchSize = processedFiles.reduce(
    (sum, file) => sum + file.size,
    0
  );

  const combinedTotalSize = currentTotalBytes + incomingBatchSize;

  if (combinedTotalSize > MAX_TOTAL_MEDIA_SIZE) {
    const combinedMB = (combinedTotalSize / (1024 * 1024)).toFixed(1);

    ErrorToast(
      `Total media size exceeds the 30MB limit (${combinedMB}MB selected).`
    );

    e.target.value = "";
    return;
  }

  const newMediaItems = processedFiles.map((file) => ({
    id: Date.now() + Math.random(),
    url: URL.createObjectURL(file),
    fileObject: file,
  }));

  setImages((prev) => [...prev, ...newMediaItems]);
  e.target.value = "";
};

  const removeImage = (id) => {
    setImages((prev) => {
      const target = prev.find((img) => img.id === id);
      if (target?.url && target.url.startsWith("blob:")) {
        URL.revokeObjectURL(target.url);
      }
      return prev.filter((img) => img.id !== id);
    });
  };

  const handlePostNow = async () => {
    if (!bodyText.trim()) {
      ErrorToast("Body text is required!");
      return;
    }

    if (!selectedPages || selectedPages.length === 0) {
      ErrorToast("No page selected!");
      return;
    }

    if (images.length > MAX_IMAGES) {
      ErrorToast(`Maximum ${MAX_IMAGES} media allowed!`);
      return;
    }

    const totalMediaSize = images.reduce(
      (sum, img) => sum + (img.fileObject?.size || 0),
      0
    );
    if (totalMediaSize > MAX_TOTAL_MEDIA_SIZE) {
      const totalMB = (totalMediaSize / (1024 * 1024)).toFixed(1);
      ErrorToast(
        `Total media size (${totalMB}MB) exceeds the 30MB limit! Please remove some files to proceed.`
      );
      return;
    }

    const rawPage = selectedPages[0];
    const pageId =
      typeof rawPage === "object" ? rawPage?._id || rawPage?.id : rawPage;

    const fd = new FormData();
    selectedPages.forEach((page) => {
      const pid = typeof page === "object" ? page?._id || page?.id : page;
      if (pid) {
        fd.append("pages[]", pid);
      }
    });
    fd.append("bodyText", bodyText);

    images.forEach((img) => {
      if (img.fileObject) {
        fd.append("media", img.fileObject);
      }
    });

    try {
      if (title === "Create Story") {
        await dispatch(createStory(fd)).unwrap();
      } else {
        await dispatch(createPost(fd)).unwrap();
      }

      SuccessToast((title || "Post") + " Successfully!");

      if (pageId) {
        try {
          await dispatch(
            getPostsByPageId({ pageId, page: 1, limit: 100 })
          ).unwrap();
        } catch (err) {
          console.error("Failed to refresh posts after create:", err);
        }
      }

      handleCloseModal();
      
    } catch (err) {
      console.error("Post creation error:", err);
      const isPayloadTooLarge =
        err?.response?.status === 413 ||
        err?.status === 413 ||
        (typeof err === "string" && err.toLowerCase().includes("payload too large")) ||
        (typeof err === "string" && err.toLowerCase().includes("size exceeds"));

      const errorMessage = isPayloadTooLarge
        ? "Total media size exceeds the 30MB server limit. Please reduce the number or size of files."
        : (typeof err === "string" && err) ||
          err?.response?.data?.message ||
          err?.data?.message ||
          err?.message ||
          "Failed to create post";
      ErrorToast(errorMessage);
    }
  };

  return (
    <div>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 cursor-pointer"
            onClick={handleCloseModal}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-slideUp overflow-hidden">
              <div className="p-5 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                  <button
                    onClick={handleCloseModal}
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
                  {linkData && (
                    <div className="mt-3">
                      <p className="text-xs font-semibold text-gray-500 mb-1">
                        Link Preview
                      </p>
                      <LinkPreviewCard linkData={linkData} compact={images.length > 0} />
                    </div>
                  )}
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
                        accept="image/jpeg,image/png,image/webp,video/*"
                        multiple
                        onChange={handleImageUpload}
                        fileClassName="w-[120px] h-[120px] rounded-xl"
                      />
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-1 text-xs mt-2">
                    <span
                      className={
                        isOverSizeLimit
                          ? "text-red-600 font-semibold"
                          : "text-gray-600 font-medium"
                      }
                    >
                      {images.length}/{MAX_IMAGES} media ({currentTotalMB}MB / 30MB total)
                    </span>
                    <span className="text-gray-400">
                      (Max: 10MB/image, 30MB total)
                    </span>
                  </div>
                </div>

                {/* CTA */}
                <Button
                  onClick={handlePostNow}
                  disabled={postsLoading || isCompressing}
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