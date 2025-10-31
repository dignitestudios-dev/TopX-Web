import React, { useState } from 'react';
import { ChevronRight, X } from 'lucide-react';
import KnowledgeAllPostCard from './KnowledgeAllPostCard';

export default function KnowledgePostCard() {
  const [selectedCar, setSelectedCar] = useState(null);
const [selectedBrand, setSelectedBrand] = useState('');
const knowledgePost = {
    cars: [
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
      },
      type:"cars"
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
  ],
Makeup: [

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
      },
      type:"Makeup"
    }
  ],
    Sports: [

    {
      id: 1,
      name: 'Tesla Model Safsafsafsaffsafsafsaffsafsafsafsa',
      gradient: 'from-blue-600 to-blue-400',
      description: 'Lorem ipsum.',
      
    },
    {
      id: 1,
      name: 'Tesla Model Safsafsafsaffsafsafsaffsafsafsafsa',
      gradient: 'from-blue-600 to-blue-400',
      description: 'Lorem ipsum.',
      
    },
    {
      id: 1,
      name: 'Tesla Model Safsafsafsaffsafsafsaffsafsafsafsa',
      gradient: 'from-blue-600 to-blue-400',
      description: 'Lorem ipsum.',
      
    },
    {
      id: 1,
      name: 'Tesla Model Safsafsafsaffsafsafsaffsafsafsafsa',
      gradient: 'from-blue-600 to-blue-400',
      description: 'Lorem ipsum.',
      
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
      },
      type:"Sports"
    }
  ],
}
  
  return (
    <div className="py-4 ">
<div className="space-y-6">

  {/* Agar koi brand select nai hui → Categories dikhana */}
  {!selectedBrand && Object.entries(knowledgePost).map(([categoryName, posts]) => (
    <div
      key={categoryName}
      className="bg-white rounded-[15px] drop-shadow-[0px_0px_10px_rgba(0,0,0,0.2)] p-4"
    >
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-[14px] font-[600] text-[#000000] capitalize">
          {categoryName}
        </h1>

        <ChevronRight 
          onClick={() => setSelectedBrand(categoryName)} 
          className="w-5 h-5 text-[#E56F41] cursor-pointer" 
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-8 gap-6">
        {posts.slice(0, 7).map((post) => (
          <div
            key={post.id}
            onClick={() => setSelectedCar(post)}
            className={`bg-gradient-to-br ${post.gradient} rounded-3xl p-3 h-[106px] w-[106px] flex items-center justify-center text-center cursor-pointer`}
          >
            
            <div className="w-full">
                <p className='w-full text-[8px] font-[600] text-black leading-tight  break-words' >
              {post.name}
                </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  ))}

  {/* ✅ Agar brand select ho jaye → Sirf us brand ke posts dikhana */}
  {selectedBrand && (
    <div className="bg-white rounded-[15px] drop-shadow-[0px_0px_10px_rgba(0,0,0,0.2)] p-4 ">
      {/* Back Button */}
 <h1 className="text-[14px] font-[600] text-[#000000] capitalize mb-2">
          {selectedBrand}
        </h1>

      <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-8 gap-4 ">
        {knowledgePost[selectedBrand].map((post) => (
          <div
            key={post.id}
            onClick={() => setSelectedCar(post)}
            className={`bg-gradient-to-br ${post.gradient} rounded-3xl text-wrap p-3 h-[106px] w-[106px] flex items-center justify-center text-center cursor-pointer`}
          >
            <div className="w-full">
                <p className='w-full text-[8px] font-[600] text-black leading-tight  break-words' >
              {post.name}
                </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )}

</div>





    </div>
  );
}