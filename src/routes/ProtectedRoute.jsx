import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router";
import Cookies from "js-cookie";
import { useDispatch, useSelector } from "react-redux";
import { getAllUserData } from "../redux/slices/auth.slice";
import { getOnboardingStatus } from "../lib/helpers";
import { FiLoader } from "react-icons/fi";

const ProtectedRoute = ({ children }) => {
  const token = Cookies.get("access_token");
  const location = useLocation();
  const dispatch = useDispatch();
  const { allUserData, user } = useSelector((state) => state.auth);
  const currentUser = allUserData || user;

  const [loading, setLoading] = useState(!currentUser && !!token);

  useEffect(() => {
    if (token && !currentUser) {
      dispatch(getAllUserData())
        .unwrap()
        .catch((err) => {
          console.error("Failed to load user in ProtectedRoute:", err);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [token, currentUser, dispatch]);

  if (!token) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F2F2F2]">
        <FiLoader className="w-8 h-8 animate-spin text-[#F85E00]" />
      </div>
    );
  }

  if (currentUser) {
    const status = getOnboardingStatus(currentUser);
    if (!status.isCompleted) {
      return (
        <Navigate
          to="/auth/signup"
          state={{ step: status.step }}
          replace
        />
      );
    }
  }

  return children;
};

export default ProtectedRoute;

