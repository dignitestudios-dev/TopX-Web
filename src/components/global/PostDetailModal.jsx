import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function PostImageViewerModal({ post, isOpen, onClose }) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    if (!isOpen) return null;

    // Handle both array and string formats
    const images = Array.isArray(post.postimage) 
        ? post.postimage.filter(img => img) 
        : (post.postimage ? [post.postimage] : []);
    
    if (images.length === 0) return null;

    const currentImage = images[currentImageIndex];

    const goToPrevious = (e) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const goToNext = (e) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    const handleClose = () => {
        setCurrentImageIndex(0);
        onClose();
    };

    return (
        <div 
            className="fixed inset-0 bg-black flex items-center justify-center z-50 p-4"
            onClick={handleClose}
        >
            {/* Modal Container */}
            <div 
                className="relative w-full max-w-4xl max-h-[95vh] flex flex-col bg-black rounded-lg overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-4 border-b border-gray-700 flex items-center justify-between bg-black">
                    <div className="flex items-center gap-3">
                        <img
                            src={post.avatar}
                            alt={post.user}
                            className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                            <h3 className="font-semibold text-white text-sm">{post.user}</h3>
                            <p className="text-gray-500 text-xs">{post.username} · {post.time}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-white hover:bg-gray-900 p-2 rounded-full transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Post Text */}
                <div className="px-4 py-3 bg-black border-b border-gray-700">
                    <p className="text-white text-sm leading-relaxed">
                        {post.text}
                    </p>
                </div>

                {/* Image Container */}
                <div className="flex-1 flex items-center justify-center bg-black relative overflow-hidden">
                    <img
                        src={currentImage}
                        alt="post"
                        className="max-w-full max-h-full object-contain"
                    />

                    {/* Previous Button */}
                    {images.length > 1 && (
                        <button
                            onClick={goToPrevious}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-gray-800 p-2 rounded-full transition bg-black bg-opacity-50"
                        >
                            <ChevronLeft className="w-8 h-8" />
                        </button>
                    )}

                    {/* Next Button */}
                    {images.length > 1 && (
                        <button
                            onClick={goToNext}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-gray-800 p-2 rounded-full transition bg-black bg-opacity-50"
                        >
                            <ChevronRight className="w-8 h-8" />
                        </button>
                    )}

                    {/* Image Counter */}
                    {images.length > 1 && (
                        <div className="absolute top-4 right-4 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-xs font-medium">
                            {currentImageIndex + 1} / {images.length}
                        </div>
                    )}
                </div>

                {/* Image Indicators (Dots) */}
                {images.length > 1 && (
                    <div className="p-3 bg-black border-t border-gray-700 flex gap-2 justify-center">
                        {images.map((_, index) => (
                            <button
                                key={index}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setCurrentImageIndex(index);
                                }}
                                className={`transition ${
                                    index === currentImageIndex 
                                        ? 'bg-white w-6 h-1.5' 
                                        : 'bg-gray-600 w-1.5 h-1.5'
                                } rounded-full`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}