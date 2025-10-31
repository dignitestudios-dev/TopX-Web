
import React from 'react';
import { Edit } from 'lucide-react';
import { profilehigh } from '../../../assets/export';

export default function LargeProfile() {
    return (
        <div className=" rounded-2xl overflow-hidden border  bg-white shadow-sm  ">
            
                {/* Top Orange Section */}
                <div className="bg-gradient-to-l from-[#DE4B12] to-[#E56F41]  ">
                   <div className='flex relative -bottom-[62px]  px-4 gap-3'>
                    <div className='relative '>
                        <img src={profilehigh} alt="" className='w-[135px] h-[135px] rounded-full' />
                        <button className='absolute bottom-1 right-2 w-9 h-9 bg-gradient-to-l from-[#DE4B12] to-[#E56F41] rounded-full flex items-center justify-center'>
                        <Edit className="w-6 h-6 text-white" />
                        </button>
                    </div>
<div className=" flex items-end gap-12">
                            {/* Name Section */}
                            <div>
                                <h2 className="text-[18px] font-[500] text-[#000000]">Mike Smith</h2>
                                <p className="text-[14px] font-[400] text-[#18181899]">@mikesmith35</p>
                            </div>

                            {/* Stats Section */}
                         
                                <div className="text-center">
                                    <div className="text-[18px] font-[500] text-[#000000]">130</div>
                                    <div className="text-[14px] font-[400] text-[#18181899]">Posts</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-[18px] font-[500] text-[#000000]">679</div>
                                    <div className="text-[14px] font-[400] text-[#18181899]">Followers</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-[18px] font-[500] text-[#000000]">449</div>
                                    <div className="text-[14px] font-[400] text-[#18181899]">Following</div>
                                </div>
                    
                   </div>
                </div>

                {/* Bottom White Section - Bio */}
                <div className="pt-20 px-8 pb-8 bg-slate-50">
                    <p className="text-[14px] font-[400] text-[#413b3b99]">
                        Lorem ipsum dolor sit amet consectetur. Et blandit ut enim potenti orci. Massa cursus integer enim ac id pretium etiam. Eleifend ornare dictumst ut bibendum ipsum. Etiam condimentum vitae vel id amet.
                    </p>
                </div>
            </div>
        </div>
    );
}