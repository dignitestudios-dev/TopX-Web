import React, { useEffect } from 'react';
import { Edit } from 'lucide-react';
import { profilehigh } from '../../../assets/export';
import { useDispatch, useSelector } from 'react-redux';
import { getAllUserData } from '../../../redux/slices/auth.slice';

export default function LargeProfile({ setIsEditProfile }) {

    const dispatch = useDispatch();
    
    const { allUserData } = useSelector((state) => state.auth);

    useEffect(()=>{
        dispatch(getAllUserData())
    },[])

    // ========================
    // NO DATA FOUND UI
    // ========================
    if (!allUserData) {
        return (
            <div className="rounded-2xl overflow-hidden border bg-white shadow-sm p-8 flex items-center justify-center h-[250px]">
                <p className="text-gray-400 text-[16px] font-medium">
                    No Profile Data Found
                </p>
            </div>
        );
    }

    return (
        <div className="rounded-2xl overflow-hidden border bg-white shadow-sm">

            {/* Top Orange Section */}
            <div className="bg-gradient-to-l from-[#DE4B12] to-[#E56F41]">
                <div className='flex relative -bottom-[62px] px-4 gap-3'>
                    <div className='relative'>
                        <img 
                            src={allUserData?.profilePicture || profilehigh} 
                            alt="" 
                            className='w-[135px] h-[135px] rounded-full object-cover'
                        />

                        {/* Edit Button */}
                        <button 
                            onClick={() => setIsEditProfile(true)} 
                            className='absolute bottom-1 right-2 w-9 h-9 bg-gradient-to-l from-[#DE4B12] to-[#E56F41] rounded-full flex items-center justify-center'
                        >
                            <Edit className="w-6 h-6 text-white" />
                        </button>
                    </div>

                    <div className="flex items-end gap-12">
                        
                        {/* Name Section */}
                        <div>
                            <h2 className="text-[18px] font-[500] text-[#000000]">
                                {allUserData.name || "No Name"}
                            </h2>
                            <p className="text-[14px] font-[400] text-[#18181899]">
                                {allUserData.username || "No Username"}
                            </p>
                        </div>

                        {/* Stats Section */}
                        <div className="text-center">
                            <div className="text-[18px] font-[500] text-[#000000]">
                                {allUserData.postsCount || "0"}
                            </div>
                            <div className="text-[14px] font-[400] text-[#18181899]">Posts</div>
                        </div>

                        <div className="text-center">
                            <div className="text-[18px] font-[500] text-[#000000]">
                                {allUserData.followersCount || "0"}
                            </div>
                            <div className="text-[14px] font-[400] text-[#18181899]">Followers</div>
                        </div>

                        <div className="text-center">
                            <div className="text-[18px] font-[500] text-[#000000]">
                                {allUserData.followingCount || "0"}
                            </div>
                            <div className="text-[14px] font-[400] text-[#18181899]">Following</div>
                        </div>

                    </div>
                </div>

                {/* Bottom White Section - Bio */}
                <div className="pt-20 px-8 pb-8 bg-slate-50">
                    <p className="text-[14px] font-[400] text-[#413b3b99]">
                        {allUserData.bio || "No Bio Available"}
                    </p>
                </div>
            </div>

        </div>
    );
}
