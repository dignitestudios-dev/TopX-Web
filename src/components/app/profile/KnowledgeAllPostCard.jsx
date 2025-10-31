import React, { useState } from 'react';
import { ChevronRight, X } from 'lucide-react';

export default function KnowledgeAllPostCard() {
  const [selectedBrand, setSelectedBrand] = useState('Ferrari');
  const [selectedCar, setSelectedCar] = useState(null);

  const brands = ['Ferrari', 'Bugatti', 'Lamborghini', 'Porsche'];

  const carsByBrand = {
    Ferrari: [
      {
        id: 1,
        name: 'Ferrari F8 Tributo',
        gradient: 'from-blue-600 to-blue-400',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        specs: { topSpeed: '340 km/h', acceleration: '0-100 in 2.9s', range: '380 km', power: '720 hp' }
      },
      {
        id: 2,
        name: 'Ferrari SF90',
        gradient: 'from-yellow-400 via-pink-300 to-purple-300',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        specs: { topSpeed: '340 km/h', acceleration: '0-100 in 2.5s', range: '420 km', power: '1000 hp' }
      },
      {
        id: 3,
        name: 'Ferrari 488',
        gradient: 'from-green-500 to-green-400',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        specs: { topSpeed: '330 km/h', acceleration: '0-100 in 3.0s', range: '370 km', power: '670 hp' }
      },
      {
        id: 4,
        name: 'Ferrari Roma',
        gradient: 'from-orange-400 via-pink-300 to-purple-300',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        specs: { topSpeed: '320 km/h', acceleration: '0-100 in 3.4s', range: '400 km', power: '620 hp' }
      },
      {
        id: 5,
        name: 'Ferrari 812',
        gradient: 'from-green-500 to-green-400',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        specs: { topSpeed: '340 km/h', acceleration: '0-100 in 2.9s', range: '380 km', power: '800 hp' }
      },
      {
        id: 6,
        name: 'Ferrari Portofino',
        gradient: 'from-orange-400 via-pink-300 to-purple-300',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        specs: { topSpeed: '320 km/h', acceleration: '0-100 in 3.5s', range: '410 km', power: '600 hp' }
      },
      {
        id: 7,
        name: 'Ferrari Monza',
        gradient: 'from-blue-700 to-blue-500',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        specs: { topSpeed: '340 km/h', acceleration: '0-100 in 2.9s', range: '360 km', power: '810 hp' }
      },
      {
        id: 8,
        name: 'Ferrari GTC4',
        gradient: 'from-green-600 to-green-400',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        specs: { topSpeed: '335 km/h', acceleration: '0-100 in 3.4s', range: '430 km', power: '690 hp' }
      },
      {
        id: 9,
        name: 'Ferrari 296 GTB',
        gradient: 'from-green-500 to-green-400',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        specs: { topSpeed: '330 km/h', acceleration: '0-100 in 2.9s', range: '400 km', power: '830 hp' }
      },
      {
        id: 10,
        name: 'Ferrari Daytona',
        gradient: 'from-blue-600 to-blue-400',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        specs: { topSpeed: '340 km/h', acceleration: '0-100 in 2.8s', range: '370 km', power: '840 hp' }
      },
      {
        id: 11,
        name: 'Ferrari F12',
        gradient: 'from-yellow-400 via-pink-300 to-purple-300',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        specs: { topSpeed: '340 km/h', acceleration: '0-100 in 3.1s', range: '390 km', power: '740 hp' }
      },
      {
        id: 12,
        name: 'Ferrari LaFerrari',
        gradient: 'from-blue-700 to-blue-500',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        specs: { topSpeed: '350 km/h', acceleration: '0-100 in 2.4s', range: '350 km', power: '950 hp' }
      }
    ],
    Bugatti: [
      {
        id: 1,
        name: 'Bugatti Chiron',
        gradient: 'from-blue-700 to-blue-500',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        specs: { topSpeed: '420 km/h', acceleration: '0-100 in 2.4s', range: '400 km', power: '1500 hp' }
      },
      {
        id: 2,
        name: 'Bugatti Veyron',
        gradient: 'from-green-500 to-green-400',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        specs: { topSpeed: '408 km/h', acceleration: '0-100 in 2.5s', range: '380 km', power: '1200 hp' }
      },
      {
        id: 3,
        name: 'Bugatti Divo',
        gradient: 'from-orange-400 via-pink-300 to-purple-300',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        specs: { topSpeed: '380 km/h', acceleration: '0-100 in 2.4s', range: '390 km', power: '1500 hp' }
      },
      {
        id: 4,
        name: 'Bugatti Centodieci',
        gradient: 'from-blue-600 to-blue-400',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        specs: { topSpeed: '380 km/h', acceleration: '0-100 in 2.4s', range: '400 km', power: '1600 hp' }
      }
    ],
    Lamborghini: [
      {
        id: 1,
        name: 'Lamborghini Aventador',
        gradient: 'from-green-500 to-green-400',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        specs: { topSpeed: '350 km/h', acceleration: '0-100 in 2.9s', range: '400 km', power: '740 hp' }
      },
      {
        id: 2,
        name: 'Lamborghini Huracan',
        gradient: 'from-blue-700 to-blue-500',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        specs: { topSpeed: '325 km/h', acceleration: '0-100 in 3.2s', range: '420 km', power: '640 hp' }
      },
      {
        id: 3,
        name: 'Lamborghini Urus',
        gradient: 'from-orange-400 via-pink-300 to-purple-300',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        specs: { topSpeed: '305 km/h', acceleration: '0-100 in 3.6s', range: '500 km', power: '650 hp' }
      },
      {
        id: 4,
        name: 'Lamborghini Sian',
        gradient: 'from-green-600 to-green-400',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        specs: { topSpeed: '350 km/h', acceleration: '0-100 in 2.8s', range: '380 km', power: '819 hp' }
      }
    ],
    Porsche: [
      {
        id: 1,
        name: 'Porsche 911 Turbo',
        gradient: 'from-blue-600 to-blue-400',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        specs: { topSpeed: '320 km/h', acceleration: '0-100 in 2.7s', range: '450 km', power: '650 hp' }
      },
      {
        id: 2,
        name: 'Porsche Taycan',
        gradient: 'from-yellow-400 via-pink-300 to-purple-300',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        specs: { topSpeed: '260 km/h', acceleration: '0-100 in 2.8s', range: '500 km', power: '761 hp' }
      },
      {
        id: 3,
        name: 'Porsche Cayenne',
        gradient: 'from-green-500 to-green-400',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        specs: { topSpeed: '286 km/h', acceleration: '0-100 in 3.9s', range: '520 km', power: '550 hp' }
      },
      {
        id: 4,
        name: 'Porsche Panamera',
        gradient: 'from-blue-700 to-blue-500',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        specs: { topSpeed: '310 km/h', acceleration: '0-100 in 3.1s', range: '480 km', power: '630 hp' }
      }
    ]
  };

  const currentCars = carsByBrand[selectedBrand];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto border-4 border-blue-500 rounded-2xl p-6 bg-white">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold text-gray-800">Car</h1>
          <ChevronRight className="w-8 h-8 text-gray-400" />
        </div>

        <div className="flex gap-3 mb-6 flex-wrap">
          {brands.map((brand) => (
            <button
              key={brand}
              onClick={() => setSelectedBrand(brand)}
              className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                selectedBrand === brand
                  ? 'bg-orange-500 text-white shadow-lg'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {brand}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {currentCars.map((car) => (
            <div
              key={car.id}
              onClick={() => setSelectedCar(car)}
              className={`bg-gradient-to-br ${car.gradient} rounded-3xl p-6 min-h-40 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl`}
            >
              <div className="text-white text-center h-full flex flex-col justify-center">
                <p className="text-xs leading-relaxed drop-shadow-md opacity-90">
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