import { user } from "../../../assets/export";
import Button from "../../common/Button";
import { useEffect, useState } from "react";
import ErrorModal from "../../common/ErrorModal";
import { useDispatch, useSelector } from "react-redux";
import {
  getBlockedUsers,
  unblockUser,
} from "../../../redux/slices/profileSetting.slice";

export default function BlockedUsers() {
  const [openModal, setOpenModal] = useState(false);
  const { blockedUsers, isLoading } = useSelector(
    (s) => s.profileSetting || {}
  );
  const [blockedUserId, setBlockedUserId] = useState(null);
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getBlockedUsers({}));
  }, [dispatch]);
  const handleUnblock = async (id) => {
    //logic to unblock user
    await dispatch(unblockUser(id)).unwrap();
    await dispatch(getBlockedUsers({}));
  };
  return (
    <div className="space-y-6">
      <h1 className="text-[28px] font-bold tracking-[-0.018em]">
        Blocked Users
      </h1>
      <div className="space-y-3 overflow-y-auto">
       {blockedUsers?.length > 0 ? (
  blockedUsers.map((item) => (
    <div key={item._id} className="w-full flex justify-between items-center gap-4">
      <div className="flex items-center gap-2">
        <img
          src={item?.blockedUser?.profilePicture || user}
          alt=""
          className="w-[50px] h-[50px] rounded-full"
        />
        <p className="text-[14px] font-[500] text-gray-800">
          {item?.blockedUser?.name || "Username"}
        </p>
      </div>

      <Button
        type="button"
        size="md"
        variant="orange"
        loading={isLoading}
        onClick={() => {
          setBlockedUserId(item?._id);
          setOpenModal(true);
        }}
        className="px-14 flex justify-center items-center"
      >
        Unblock
      </Button>
    </div>
  ))
) : (
  <p>No Block User Found</p>
)}

      </div>
      <ErrorModal
        onConfirm={() => handleUnblock(blockedUserId)}
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        heading="Unblock User"
        message="Are you sure you want to unblock this user?"
        confirmText="Unblock"
        confirmBgColor="bg-orange-600"
        confirmHoverColor="hover:bg-orange-700"
        autoCloseDuration={2000}
      />
    </div>
  );
}
