import { dummyprofile } from '../../assets/export'
import { useDispatch, useSelector } from 'react-redux'
import { getAllUserData } from '../../redux/slices/auth.slice';
import { useEffect } from 'react';

const Profilecard = () => {

    const dispatch = useDispatch();
    const { allUserData } = useSelector((state) => state.auth);

    useEffect(() => {
        dispatch(getAllUserData())
    }, [])



    // =======================
    // SKELETON LOADING
    // =======================
    if (!allUserData) {
        return (
            <div className="max-w-xs rounded-xl overflow-hidden border border-gray-200 bg-white p-5 animate-pulse">
                {/* Header Skeleton */}
                <div className="bg-gradient-to-r from-orange-600 to-orange-400 pt-8 pl-3 rounded-xl h-[120px] relative">
                    <div className="absolute left-5 bottom-[-30px]">
                        <div className="h-20 w-20 rounded-full bg-gray-300"></div>
                    </div>

                    {/* Stats skeleton */}
                    <div className="absolute right-4 bottom-4 flex gap-6">
                        <div className="h-6 w-10 bg-gray-300 rounded"></div>
                        <div className="h-6 w-10 bg-gray-300 rounded"></div>
                        <div className="h-6 w-10 bg-gray-300 rounded"></div>
                    </div>
                </div>

                {/* Text skeletons */}
                <div className="mt-12">
                    <div className="h-4 w-32 bg-gray-300 rounded mb-3"></div>
                    <div className="h-3 w-20 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 w-full bg-gray-200 rounded mb-1"></div>
                    <div className="h-3 w-5/6 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    // =======================
    // REAL DATA VIEW
    // =======================
    return (
        <div>
            <div className="max-w-xs rounded-xl overflow-hidden border border-gray-200 bg-white">

                <div className="bg-gradient-to-r from-orange-600 to-orange-400 pt-8 pl-3 relative">
                    <div className="flex items-center gap-4 mb-0">
                        <div className='flex items-center -mb-[60px] gap-4 pb-10'>

                            <img
                                src={allUserData?.profilePicture || dummyprofile}
                                loading="lazy"
                                alt="profile"
                                className="h-20 w-20 rounded-full"
                            />

                            <div className="text-white flex gap-6 pb-3">
                                <div className="text-center">
                                    <div className="text-[17px] font-[600]">{allUserData?.postsCount || "0"}</div>
                                    <div className="text-xs">Posts</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-[17px] font-[600]">{allUserData?.followingCount || "0"}</div>
                                    <div className="text-xs">Followers</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-[17px] font-[600]">{allUserData?.followersCount || "0"}</div>
                                    <div className="text-xs">Following</div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                <div className="p-5 pt-8">
                    <h2 className="text-lg font-semibold text-gray-800">{allUserData?.name || "Not Available"}</h2>
                    <p className="text-sm text-gray-500 mb-2">{allUserData?.username || "No Username"}</p>
                    <p className="text-sm text-gray-600 leading-snug">{allUserData?.bio || "No Bio"}</p>
                </div>

            </div>
        </div>
    )
}

export default Profilecard;
