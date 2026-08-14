import { dummyprofile } from '../../assets/export'
import { useDispatch, useSelector } from 'react-redux'
import { getAllUserData } from '../../redux/slices/auth.slice';
import { useEffect } from 'react';

const Profilecard = () => {

    const dispatch = useDispatch();
    const { allUserData } = useSelector((state) => state.auth);

    useEffect(() => {
        dispatch(getAllUserData())
    }, [dispatch])

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 18) return "Good Afternoon";
        return "Good Evening";
    };

    // =======================
    // SKELETON LOADING
    // =======================
    if (!allUserData) {
        return (
            <div className="max-w-xs rounded-xl overflow-hidden border border-gray-200 bg-white p-5 animate-pulse">
                {/* Header Skeleton */}
                <div className="bg-gradient-to-r from-orange-600 to-orange-400 pt-8 pl-3 pr-3 rounded-xl h-[120px] relative">
                    <div className="absolute left-5 bottom-[-30px]">
                        <div className="h-20 w-20 rounded-full bg-gray-300"></div>
                    </div>

                    {/* Welcome message skeleton */}
                    <div className="absolute right-4 bottom-4 flex flex-col items-end gap-1.5">
                        <div className="h-5 w-28 bg-orange-300/60 rounded"></div>
                        <div className="h-3 w-20 bg-orange-300/40 rounded"></div>
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
    const firstName = allUserData?.name?.trim()?.split(" ")?.[0] || allUserData?.username || "User";

    return (
        <div>
            <div className="max-w-xs rounded-xl overflow-hidden border border-gray-200 bg-white shadow-xs">

                <div className="bg-gradient-to-r from-orange-600 to-orange-400 pt-8 pl-3 pr-3 relative">
                    <div className="flex items-center gap-4 mb-0">
                        <div className='flex items-center -mb-[60px] gap-3 pb-10 min-w-0 w-full'>

                            <img
                                src={allUserData?.profilePicture || dummyprofile}
                                loading="lazy"
                                alt="profile"
                                className="h-20 w-20 object-cover rounded-full flex-shrink-0 border-2 border-white shadow-sm"
                            />

                            <div className="text-white pb-3 flex-1 min-w-0 pr-1">
                                <span className="text-[11px] font-medium text-orange-100 uppercase tracking-wider block">
                                    {getGreeting()} 👋
                                </span>
                                <h3 className="text-[16px] font-bold leading-tight truncate mt-0.5" title={`Welcome back, ${firstName}!`}>
                                    Welcome Back!
                                </h3>
                                <p className="text-xs text-orange-100/90 font-medium truncate mt-0.5" title={`Hello, ${allUserData?.name || firstName}!`}>
                                    {allUserData?.name ? `Hello, ${firstName}!` : "Welcome to TopX"}
                                </p>
                            </div>

                        </div>
                    </div>
                </div>

                <div className="p-5 pt-8 overflow-hidden">
                    <h2 className="text-lg font-semibold text-gray-800 truncate" title={allUserData?.name || "Not Available"}>
                        {allUserData?.name || "Not Available"}
                    </h2>
                    <p className="text-sm text-gray-500 mb-2 truncate" title={allUserData?.username || "No Username"}>
                        {allUserData?.username || "No Username"}
                    </p>
                    <p className="text-sm text-gray-600 leading-snug break-words">
  {allUserData?.bio
    ? allUserData.bio.length > 100
      ? allUserData.bio.substring(0, 100) + "..."
      : allUserData.bio
    : "No Bio"}
</p>

                </div>

            </div>
        </div>
    )
}

export default Profilecard;
