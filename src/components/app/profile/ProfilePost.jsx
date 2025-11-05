import React from 'react';
import { Plus, MoreVertical, Backpack } from 'lucide-react';
import { IoChevronBackOutline } from 'react-icons/io5';
import { auth, authBg } from '../../../assets/export';


export default function ProfilePost({setIsProfilePostOpen}) {

  return (
    <div className="">
      <div className="">
        <div className="bg-white rounded-[15px] overflow-hidden ">
          {/* Orange Header Background */}
          <div className="h-28 bg-gradient-to-l from-[#DE4B12] to-[#E56F41] p-2">
            <div onClick={() => setIsProfilePostOpen(false)} className="flex items-center justify-center bg-white w-[30px] h-[30px] rounded-full ">

            <IoChevronBackOutline  className="w-4 h-4 text-[#DE4B12]" />
            </div>
          </div>
          
          {/* Profile Section */}
          <div className="px-4 pb-6">
            <div className="flex items-start justify-between -mt-12">
              {/* Profile Image with Plus Button and Info */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className='w-[135px] h-[135px] rounded-full'>
                    <img 
                      src={authBg} 
                      alt="Profile"
                     className='w-[135px] h-[135px] rounded-full'
                    />
                  </div>
                  <button className="absolute bottom-0 right-0 w-9 h-9 bg-orange-500 rounded-full flex items-center justify-center  hover:bg-orange-600 transition-colors shadow-md">
                    <Plus className="w-5 h-5 text-white" />
                  </button>
                </div>
                
                {/* Page Name and Followers */}
                <div className="mt-12">
                  <h1 className="text-[18px] font-[500] text-[#000000] mb-2">Mike's Basketball</h1>
                  <div className="flex items-center gap-[70px] relative">
                    <div className=" flex items-center  ">
                    <img src={auth} alt={auth} className="w-[24px] h-[24px] rounded-full absolute top-0 left-0" />
                    <img src={auth} alt={auth} className="w-[24px] h-[24px] rounded-full absolute top-0 left-5" />
                    <img src={auth} alt={auth} className="w-[24px] h-[24px] rounded-full absolute top-0 left-10" />
                </div>
                    <span className="text-gray-600 font-medium text-sm"><span className="text-[#000000]">50+</span> Follows</span>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center gap-2 mt-14">
                <button className="px-6 py-2 border-2 border-orange-500 text-orange-500 font-semibold rounded-lg hover:bg-orange-50 transition-colors text-sm">
                  Start A Live Chat
                </button>
                <button className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors">
                  <MoreVertical className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Hashtags */}
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="text-gray-400 text-sm">#Loremipsum</span>
              <span className="text-gray-400 text-sm">#Loremipsum</span>
              <span className="text-gray-400 text-sm">#Loremipsum</span>
            </div>

            {/* Description and Button */}
            <div className="flex items-start justify-between gap-4">
              <p className="text-gray-500 text-sm leading-relaxed flex-1">
                Lorem ipsum dolor sit amet consectetur. Et blandit ut enim potenti orci. Massa cursus integer enim ac id pretium etiam. Eleifend ornare dictumst ut bibendum ipsum. Etiam condimentum vitae vel id amet.
              </p>
              
              <button className="px-6 py-2.5 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-colors shadow-md whitespace-nowrap">
                Create Post
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}