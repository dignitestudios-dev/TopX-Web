import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";

export default function ReferralRedirect() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");
    if (code) {
      // signup page with referral code
      navigate(`/auth/signup?ref=${code}`, { replace: true });
    } else {
      // agar code na ho
      navigate("/auth/signup", { replace: true });
    }
  }, [navigate, searchParams]);

  return null; // kuch render nahi hoga
}
