import { useEffect, useState } from "react";
import { X, Search } from "lucide-react";
import Input from "../common/Input";
import Button from "../common/Button";
import { useDispatch, useSelector } from "react-redux";
import { getFollowersFollowing } from "../../redux/slices/auth.slice";
import { useNavigate } from "react-router";
const UserSkeleton = () => (
  <div className="flex items-center justify-between p-3 rounded-xl animate-pulse">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-gray-200" />
      <div className="space-y-2">
        <div className="w-28 h-3 bg-gray-200 rounded" />
        <div className="w-20 h-3 bg-gray-200 rounded" />
      </div>
    </div>
    <div className="w-16 h-8 bg-gray-200 rounded-lg" />
  </div>
);

export default function FollowersFollowingModal({
  isOpen,
  setIsOpen,
  title,
  type,
  otherProfile,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate("");
  const dispatch = useDispatch();
  const { followersFollowing, isLoading } = useSelector((state) => state?.auth);
  useEffect(() => {
    dispatch(
      getFollowersFollowing({
        type: type,
        page: 1,
        limit: 10,
        userId: otherProfile,
      })
    );
  }, [type]);
  const filteredUsers = followersFollowing?.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={() => setIsOpen(false)}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden p-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-orange-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="py-5">
            {/* Search */}
            <div className="relative mb-4">
              <Input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                iconLeft={<Search />}
                size="md"
              />
            </div>

            {/* Users List */}
            <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
              {isLoading ? (
                [...Array(6)].map((_, index) => <UserSkeleton key={index} />)
              ) : filteredUsers?.length > 0 ? (
                filteredUsers.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-orange-50 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          user.profilePicture ||
                          "https://via.placeholder.com/40"
                        }
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          @{user.username}
                        </p>
                      </div>
                    </div>

                    <Button
                      onClick={() =>
                        navigate("/other-profile", {
                          state: { id: user },
                        })
                      }
                      size="sm"
                      variant="outline"
                    >
                      View
                    </Button>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center py-8">
                  <p className="text-gray-500">No users found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
