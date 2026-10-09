import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import Navbarlandingpage from "../../components/global/Navbarlandingpage";
import { bg, Mask, topxlogout } from "../../assets/export";
import { setPendingReferralCode, isValidReferralCode } from "../../lib/referralStorage";
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";

export default function ReferralRedirect() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [referralCode, setReferralCode] = useState(null);

  useEffect(() => {
    const rawCode = searchParams.get("code") || searchParams.get("ref");
    if (isValidReferralCode(rawCode)) {
      const clean = rawCode.trim();
      setReferralCode(clean);
      setPendingReferralCode(clean);
    }
  }, [searchParams]);

  const handleCreateAccount = () => {
    navigate("/auth/signup");
  };

  const handleSignIn = () => {
    navigate("/auth/login");
  };

  return (
    <div className="overflow-hidden bg-gradient-to-br from-orange-50 via-white to-orange-50 min-h-screen relative flex flex-col justify-between">
      {/* Navbar */}
      <Navbarlandingpage />

      {/* Decorative Background Assets */}
      <div className="absolute top-0 left-0 pointer-events-none">
        <img src={bg} alt="" className="w-[320px] h-[320px] opacity-60" />
      </div>

      {/* Main Hero Card */}
      <main className="relative max-w-2xl mx-auto px-6 py-12 sm:py-16 text-center z-10 my-auto">
        {/* Brand Logo */}
        <div className="flex justify-center mb-8">
          <img
            src={topxlogout}
            alt="TopX Logo"
            className="w-[120px] h-[120px] object-contain drop-shadow-sm"
          />
        </div>

        {/* Invited Badge */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-orange-100/80 text-orange-700 text-xs font-semibold mb-4 border border-orange-200">
          <Sparkles size={14} />
          <span>Special Invitation</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
          You&apos;ve Been Invited to Join TopX
        </h1>

        {/* Suggested Product Copy */}
        <p className="text-base sm:text-lg text-gray-600 mb-8 max-w-lg mx-auto leading-relaxed">
          You&apos;ve been invited to join TopX. Create a new account to get started.
        </p>

        {/* Referral Code Indicator (if present) */}
        {referralCode && (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-orange-200 shadow-2xs mb-8">
            <CheckCircle2 size={16} className="text-emerald-500" />
            <span className="text-xs text-gray-500 font-medium">Invite Code:</span>
            <span className="text-xs font-bold font-mono text-gray-800 tracking-wider">
              {referralCode}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="max-w-md mx-auto space-y-3">
          <button
            type="button"
            onClick={handleCreateAccount}
            className="w-full bg-gradient-to-r from-[#E56F41] to-[#DE4B12] hover:opacity-95 text-white font-bold py-4 px-6 rounded-xl transition duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 cursor-pointer text-base"
          >
            <span>Create New Account</span>
            <ArrowRight size={18} />
          </button>

          <button
            type="button"
            onClick={handleSignIn}
            className="w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3.5 px-6 rounded-xl border border-gray-200 transition duration-200 cursor-pointer text-sm"
          >
            Already have an account? Sign In
          </button>
        </div>

        <p className="text-xs text-gray-400 mt-6">
          Existing accounts can sign in normally; invitations apply only to new accounts.
        </p>
      </main>

      {/* Decorative Bottom Corner */}
      <div className="absolute bottom-0 right-0 pointer-events-none">
        <img src={Mask} alt="" className="w-[240px] h-[240px] opacity-70" />
      </div>

      {/* Footer */}
      <footer className="px-6 py-6 border-t border-gray-200/80 text-center relative z-10 bg-white/40 backdrop-blur-xs">
        <p className="text-gray-400 text-xs">
          Copyright © {new Date().getFullYear()} TopX. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
