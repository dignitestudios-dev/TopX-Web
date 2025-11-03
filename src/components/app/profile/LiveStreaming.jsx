import React, { useState } from 'react';
import { X, Search } from 'lucide-react';
import Button from '../../common/Button';

export default function LiveStreaming({ setIsOpen, isOpen, title ,setSelectedType }) {
  const [searchQuery, setSearchQuery] = useState('');

  const pages = [
    { id: 1, name: "Mike's Basketball", image: '🏀' },
    { id: 2, name: "Mike's Fitness", image: '💪' },
    { id: 3, name: "Mike's Opinions", image: '💭' },
    { id: 4, name: "Mike's Cooking", image: '👨‍🍳' },
    { id: 5, name: "Mike's Cars", image: '🚗' }
  ];

  const filteredPages = pages.filter(page =>
    page.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleGoLive = (pageName) => {
    console.log(`Going live on: ${pageName}`);
    setIsOpen(false);
  };

  return (
    <div>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={() => setIsOpen(false)}
          />
          
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-slideUp overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {title}
                  </h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-orange-500 hover:text-orange-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="relative mb-5">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                  />
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {filteredPages.map((page) => (
                    <div
                      key={page.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-orange-400 to-orange-600 rounded-full text-2xl shadow-md">
                          {page.image}
                        </div>
                        <span className="text-gray-900 font-semibold text-base">
                          {page.name}
                        </span>
                      </div>
                      <Button
                        onClick={() => handleGoLive(page.name)}
                        className="  text-white  "
                        variant="orange"
                        size="md"
                      >
                        Go live
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

     
    </div>
  );
}