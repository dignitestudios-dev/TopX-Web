import React, { useState } from 'react';
import { ChevronRight, X } from 'lucide-react';

export default function KnowledgePostCard() {
  const [selectedCar, setSelectedCar] = useState(null);

  const cars = [

    {
      id: 1,
      name: 'Tesla Model S',
      gradient: 'from-blue-600 to-blue-400',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      specs: {
        topSpeed: '322 km/h',
        acceleration: '0-100 in 2.1s',
        range: '652 km',
        power: '1020 hp'
      }
    },
    {
      id: 2,
      name: 'Porsche 911',
      gradient: 'from-yellow-400 via-pink-300 to-purple-300',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      specs: {
        topSpeed: '308 km/h',
        acceleration: '0-100 in 3.2s',
        range: '450 km',
        power: '450 hp'
      }
    },
    {
      id: 3,
      name: 'Lamborghini Aventador',
      gradient: 'from-green-500 to-green-400',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      specs: {
        topSpeed: '350 km/h',
        acceleration: '0-100 in 2.9s',
        range: '400 km',
        power: '740 hp'
      }
    },
    {
      id: 4,
      name: 'BMW M5',
      gradient: 'from-blue-700 to-blue-500',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      specs: {
        topSpeed: '305 km/h',
        acceleration: '0-100 in 3.4s',
        range: '500 km',
        power: '625 hp'
      }
    },
    {
      id: 5,
      name: 'Ferrari F8',
      gradient: 'from-orange-400 via-pink-300 to-purple-300',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      specs: {
        topSpeed: '340 km/h',
        acceleration: '0-100 in 2.9s',
        range: '380 km',
        power: '720 hp'
      }
    },
    {
      id: 6,
      name: 'Audi RS6',
      gradient: 'from-green-600 to-green-400',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      specs: {
        topSpeed: '305 km/h',
        acceleration: '0-100 in 3.6s',
        range: '520 km',
        power: '600 hp'
      }
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-5xl font-bold text-gray-800">Car</h1>
          <ChevronRight className="w-8 h-8 text-gray-400" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-8  gap-6">
          {cars.map((car) => (
            <div
              key={car.id}
              onClick={() => setSelectedCar(car)}
              className={`bg-gradient-to-br ${car.gradient} rounded-3xl p-3 h-[106px] w-[106px] `}
            >
              <div className=" text-center">
                
                <p className="text-[4px] font-[600] text-black">
                  {car.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedCar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 relative animate-fadeIn">
            <button
              onClick={() => setSelectedCar(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-8 h-8" />
            </button>

            <div className={`bg-gradient-to-br ${selectedCar.gradient} rounded-2xl p-8 mb-6`}>
              <h2 className="text-4xl font-bold text-white text-center drop-shadow-lg">
                {selectedCar.name}
              </h2>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Description</h3>
                <p className="text-gray-600 leading-relaxed">{selectedCar.description}</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Specifications</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-500 mb-1">Top Speed</p>
                    <p className="text-lg font-bold text-gray-800">{selectedCar.specs.topSpeed}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-500 mb-1">Acceleration</p>
                    <p className="text-lg font-bold text-gray-800">{selectedCar.specs.acceleration}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-500 mb-1">Range</p>
                    <p className="text-lg font-bold text-gray-800">{selectedCar.specs.range}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-500 mb-1">Power</p>
                    <p className="text-lg font-bold text-gray-800">{selectedCar.specs.power}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}