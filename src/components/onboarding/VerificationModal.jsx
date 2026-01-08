import { useEffect, useMemo, useRef, useState } from "react";

import Modal from "react-modal";
import { useSelector } from "react-redux";

export default function VerificationModal({
  isOpen = false,
  onClose,
  email = "",
  phone = "",
  onVerify,
  onResend,
  isVerifying = false,
  length = 5,
  isType,
}) {
  const [values, setValues] = useState(Array.from({ length }, () => ""));
  const [timer, setTimer] = useState(0);

  const{user} = useSelector((state)=>state.auth);

  console.log(user,"user")

  const inputsRef = useRef([]);


  const handleResendClick = async () => {
    if (onResend) onResend();

    setValues(Array.from({length},()=>""));

    setTimer(30); // start 15 sec timer

    setTimeout(()=>{
      focusIndex(0);
    },0)
  };


  useEffect(() => {
    if (timer === 0) return;

    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);



  useEffect(() => {
    if (!isOpen) setValues(Array.from({ length }, () => ""));
  }, [isOpen, length]);

  const code = useMemo(() => values.join("").trim(), [values]);

  const mask = useMemo(() => {
    if (!email && !phone || typeof email !== "string" || typeof phone !== "string") return "";
    const [user, domain] = email.split("@");
    if (!domain) return email;
    const maskedUser = user.length <= 2 ? "**" : `${user[0]}${"*".repeat(Math.max(2, user.length - 2))}${user[user.length - 1]}`;
    return `${maskedUser}@${domain}`;
  }, [email, phone]);

  const focusIndex = (i) => {
    const el = inputsRef.current[i];
    if (el) el.focus();
  };

  const handleChange = (i, v) => {
    const d = v.replace(/\D/g, "").slice(-1);
    const next = [...values];
    next[i] = d;
    setValues(next);
    if (d && i < length - 1) focusIndex(i + 1);
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace") {
      if (values[i]) {
        const next = [...values];
        next[i] = "";
        setValues(next);
      } else if (i > 0) {
        focusIndex(i - 1);
      }
    }
  };

  const handlePaste = (i, e) => {
    e.preventDefault();
    const text = (e.clipboardData.getData("text") || "").replace(/\D/g, "");
    if (!text) return;
    const next = [...values];
    let idx = i;
    for (const ch of text.slice(0, length - i)) {
      next[idx++] = ch;
    }
    setValues(next);
    focusIndex(Math.min(i + text.length, length - 1));
  };

  const submit = () => {
    if (onVerify) onVerify(code);
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      overlayClassName="fixed inset-0 bg-black/40 flex items-center justify-center p-4"
      className="bg-white w-full max-w-[520px] rounded-[28px] outline-none relative"
      shouldCloseOnOverlayClick
    >
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
      </button>

      <div className="px-8 pt-12 pb-8 text-center">
        <h2 className="text-[28px] md:text-[32px] font-bold">Verification</h2>
        <p className="mt-2 text-[#565656] leading-7">
          Enter the OTP code sent to <br /> {isType === "email" ? email : phone}
        </p>

        <div className="mt-6 flex items-center justify-center gap-3">
          {values.map((v, i) => {
            const isFocused = false;
            return (
              <div key={i} className="w-[64px] h-[64px] md:w-[72px] md:h-[72px]">
                <input
                  ref={(el) => (inputsRef.current[i] = el)}
                  inputMode="numeric"
                  type="tel"
                  maxLength={1}
                  value={v}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  onPaste={(e) => handlePaste(i, e)}
                  className={`w-full h-full text-center text-xl md:text-2xl font-semibold rounded-[16px] border transition focus:outline-none ${v
                      ? "bg-[#FFF2EB] border-transparent text-[#F85E00]"
                      : "bg-[#F9FAFA] border-[#E5E7EB] text-[#111]"
                    } ${isFocused ? "ring-2 ring-[#F85E00]" : ""}`}
                />
              </div>
            );
          })}
        </div>

        <div className="mt-6 text-[15px]">
          <span className="text-[#111]">Didn’t receive code? </span>
          <button
            type="button"
            onClick={handleResendClick}
            disabled={timer > 0}
            className={`font-semibold ${timer > 0 ? "text-gray-400 cursor-not-allowed" : "text-[#F85E00] hover:underline"
              }`}
          >
            {timer > 0 ? `Resend in ${timer}s` : "Resend now"}
          </button>

        </div>

        <button
          type="button"
          onClick={submit}
          disabled={code.length !== length || isVerifying}
          className="mt-6 w-full md:w-[420px] h-[56px] bg-[#F85E00] text-white rounded-[16px] disabled:opacity-60 disabled:cursor-not-allowed font-semibold"
        >
          {isVerifying ? "Verifying..." : "Verify"}
        </button>
      </div>
    </Modal>
  );
}

