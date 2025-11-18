import { forwardRef } from "react";
import CountrySelector from "./Flag";

const Input = forwardRef(
  (
    {
      label,
      type = "",
      placeholder = "",
      variant = "default",
      size = "",
      iconLeft,
      iconRight,
      error,
      touched,
      className = "",
      onChange,
      value,
      preview,
      options = [], // radio ya select ke liye
      showCountrySelector = false, // 👈 manually control kar sakta hai
      fileClassName = "",
      ...props
    },
    ref
  ) => {
    const hasError = error && touched;

    const baseClasses = `
      w-full rounded-[12px] outline-none border 
      transition-all duration-200 placeholder-gray-400 
      ${hasError ? "border-red-500" : "border-gray-300"}
    `;

    const variants = {
      default: "bg-[#F8F8F899]",
      outline: "bg-transparent border",
      filled: "bg-gray-100 border-transparent",
    };

    const sizes = {
      sm: "h-[36px] text-sm px-3",
      md: "h-[43px] text-[16px] px-3",
      lg: "h-[50px] text-base px-4",
      full: "w-full h-[43px] text-base px-4",
    };

    const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;
    const fileClasses = ` ${fileClassName}`;
    // 📁 File Upload Input
    if (type === "file") {
      return (
        <div className={`flex flex-col  gap-2 `}>
          {label && (
            <label className="text-[14px] font-[500] text-gray-800">
              {label}
            </label>
          )}

          <label
            htmlFor={props.id || "file-input"}
            className={`${fileClasses} flex items-center justify-center border-2 border-dashed border-orange-400 rounded-full bg-[#FFF5F2] cursor-pointer overflow-hidden`}
          >
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="object-fill rounded-full " // Restrict size
              />
            ) : (
              <span className="text-orange-400 text-3xl">+</span>
            )}

            <input
              id={props.id || "file-input"}
              ref={ref}
              type="file"
              accept="image/*"
              onChange={onChange}
              className="hidden"
              {...props}
            />
          </label>

          {hasError && (
            <p className="text-red-600 text-sm font-medium">{error}</p>
          )}
        </div>
      );
    }

    // 🔘 Radio Input
    if (type === "radio") {
      return (
        <div className="flex flex-col space-y-2">
          {label && (
            <label className="text-[14px] font-[500] text-gray-800">
              {label}
            </label>
          )}

          <div className="flex flex-col items-start space-y-2">
            {options.map((opt) => (
              <label
                key={opt.value}
                className="flex items-center space-x-2 cursor-pointer text-[14px] font-[500]"
              >
                <input
                  type="radio"
                  name={props.name}
                  value={opt.value}
                  checked={value === opt.value}
                  onChange={onChange}
                  className="w-5 h-5 accent-black outline-none"
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>

          {hasError && (
            <p className="text-red-600 text-sm font-medium">{error}</p>
          )}
        </div>
      );
    }

    // 🔽 Select Dropdown Input
    if (type === "select") {
      return (
        <div className="flex flex-col gap-1 w-full">
          {label && (
            <label className="text-[14px] font-[500] text-gray-800">
              {label}
            </label>
          )}
          <select
            ref={ref}
            onChange={onChange}
            value={value}
            className={`${classes}`}
            {...props}
          >
            <option value="">Select...</option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {hasError && (
            <p className="text-red-600 text-sm font-medium">{error}</p>
          )}
        </div>
      );
    }

    // ✏️ Normal Text / Password / Email Input
    return (
      <div className="flex flex-col gap-1 w-full">
        {label && (
          <label className="text-[14px] font-[500] text-gray-800">
            {label}
          </label>
        )}
        <div className="relative flex items-center gap-2">
          {showCountrySelector && 
          <div className="flex items-center gap-1 px-4 py-2 bg-white border border-gray-300 rounded-[12px] hover:border-gray-400 transition-colors">
           <img src="https://flagcdn.com/w40/us.png" alt="" />
            <p>+1</p>
          </div>} {/* 👈 manual toggle */}
          {iconLeft && (
            <span className="absolute left-3 ">{iconLeft}</span>
          )}
          <input
            ref={ref}
            type={type}
            placeholder={placeholder}
            onChange={onChange}
            value={value}
            className={`${classes} ${iconLeft ? "pl-10" : ""} ${iconRight ? "pr-10" : ""
              }`}
            {...props}
          />
          {iconRight && <span className="absolute right-3">{iconRight}</span>}
        </div>
        {hasError && (
          <p className="text-red-600 text-sm font-medium">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
