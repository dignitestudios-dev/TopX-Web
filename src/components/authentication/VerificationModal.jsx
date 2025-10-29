import { useEffect, useMemo, useRef, useState } from "react";
import Modal from "react-modal";
import { useNavigate } from "react-router";

export default function VerificationModal({
  isOpen = false,
  onClose,
  email = "",
  onVerify, // will run verification API
  onResend,
  isVerifying = false,
  length = 4,
  isType,
  mode = "", // <-- "forget" OR "delete"
}) {
  const [values, setValues] = useState(Array.from({ length }, () => ""));
  const inputsRef = useRef([]);
  const navigate = useNavigate();
console.log(isOpen);
  useEffect(() => {
    if (!isOpen) setValues(Array.from({ length }, () => ""));
  }, [isOpen, length]);

  const code = useMemo(() => values.join("").trim(), [values]);

  const handleChange = (i, v) => {
    const d = v.replace(/\D/g, "").slice(-1);
    const next = [...values];
    next[i] = d;
    setValues(next);
    if (d && i < length - 1) {
      inputsRef.current[i + 1]?.focus();
    }
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace") {
      if (!values[i] && i > 0) {
        inputsRef.current[i - 1]?.focus();
      }
      const next = [...values];
      next[i] = "";
      setValues(next);
    }
  };

  const handlePaste = (i, e) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!text) return;

    const next = [...values];
    let idx = i;

    for (const ch of text.slice(0, length - i)) {
      next[idx++] = ch;
    }
    setValues(next);
    inputsRef.current[Math.min(i + text.length, length - 1)]?.focus();
  };

  const submit = () => {
  if (code.length !== length) return;

  if (mode === "forget") {
    navigate("/auth/update-password");
  } 

  onClose(); // modal close bhi ho jaye
};
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      overlayClassName="fixed inset-0 bg-black/40 flex items-center justify-center p-4"
      className="bg-white w-full max-w-[520px] rounded-[28px] outline-none relative"
    >
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
      >
        ✕
      </button>

      <div className="px-8 pt-12 pb-8 text-center">
        <h2 className="text-[28px] font-bold">Verification</h2>
        <p className="mt-2 text-[#565656]">Enter the OTP sent to {email}</p>

        <div className="mt-6 flex justify-center gap-3">
          {values.map((v, i) => (
            <input
              key={i}
              ref={(el) => (inputsRef.current[i] = el)}
              type="tel"
              maxLength={1}
              value={v}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={(e) => handlePaste(i, e)}
              className={`w-[64px] h-[64px] rounded-[16px] text-center text-xl font-semibold border
                ${
                  v
                    ? "bg-[#FFF2EB] border-transparent text-[#F85E00]"
                    : "bg-[#F9FAFA] border-[#E5E7EB]"
                }`}
            />
          ))}
        </div>
        <div className="mt-6 text-[15px]">
          {" "}
          <span className="text-[#111]">Didn’t receive code? </span>{" "}
          <button
            type="button"
            onClick={onResend}
            className="text-[#F85E00] font-semibold hover:underline"
          >
            {" "}
            Resend now{" "}
          </button>{" "}
        </div>
        <button
          disabled={code.length !== length || isVerifying}
          onClick={submit}
          className="mt-6 w-full h-[56px] bg-[#F85E00] text-white rounded-[16px] disabled:opacity-60"
        >
          {isVerifying ? "Verifying..." : "Verify"}
        </button>
      </div>
    </Modal>
  );
}
