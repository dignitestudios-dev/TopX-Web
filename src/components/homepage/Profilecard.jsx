import { dummyprofile, profilehigh } from '../../assets/export'
import { useSelector } from 'react-redux'

const Profilecard = () => {

    const{user} = useSelector((state)=>state.auth);

    console.log(user,"user");

    return (
        <div>
            <div className="max-w-xs rounded-xl overflow-hidden border border-gray-200 bg-white">
                {/* Top Section */}
                <div className="bg-gradient-to-r from-orange-600 to-orange-400 pt-8 pl-3">
                    <div className="flex items-center gap-4 mb-0">
                        <div className='flex items-center -mb-[60px] gap-4 pb-10'>
                            <img
                                src={user.profilePicture || dummyprofile}
                                alt="Profile"
                                className="w-20 h-20 rounded-full"
                            />
                            <div className="text-white flex gap-6 pb-3">
                                <div className="text-center">
                                    <div className="text-[17px] font-[600]">{user.postsCount || "0"}</div>
                                    <div className="text-xs">Posts</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-[17px] font-[600]">{user.followingCount || "0"}</div>
                                    <div className="text-xs">Followers</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-[17px] font-[600]">{user.followersCount || "0"}</div>
                                    <div className="text-xs">Following</div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="p-5 pt-8">
                    <h2 className="text-lg font-semibold text-gray-800">{user.name || "Not Avaiable"}</h2>
                    <p className="text-sm text-gray-500 mb-2">{user.username || "No Username"}</p>
                    <p className="text-sm text-gray-600 leading-snug">
                        {user.bio || "No Bio"}
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Profilecard