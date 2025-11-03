import React, { useState } from 'react';
import { Check, X } from 'lucide-react';

export default function SuccessModal( {setIsOpen,isOpen ,title}) {

   

  return (
   <div>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-5 0"
            
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl animate-scaleUp p-8 relative">
          <button
            onClick={() => setIsOpen(false)}
            className="text-orange-500 hover:text-orange-600 transition-colors absolute top-2 right-2"
          >
            <X className="w-6 h-6" />
          </button>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-orange-500 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                  <Check className="w-10 h-10 text-white stroke-[3]" />
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {title}
                </h2>
                
                <p className="text-gray-500 text-sm">
                  Your post has been posted successfully.
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      
    </div>
  );
}