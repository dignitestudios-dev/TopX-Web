import { forwardRef } from "react";

const Button = forwardRef(
  (
    {
      children,
      variant = "",
      type,
      size = "",
      icon, 
      leftIcon, 
      disabled = false,
      loading = false,
      className = "",
      onClick,
      isToggle = false, // 👈 toggle mode
      isOn, // 👈 current toggle state (true/false)
      ...props
    },
    ref
  ) => {
    // Normal Variants
    const baseClasses =
      "inline-flex items-center font-medium rounded-[12px] transition-all duration-200";

    const variants = {
      orange: "bg-[#F85E00] hover:bg-[#e05200] text-white",
      primary: "bg-blue-600 hover:bg-blue-700 text-white",
      secondary: "bg-gray-200 hover:bg-gray-300 text-gray-900",
      danger: "bg-red-600 hover:bg-red-700 text-white",
      success: "bg-green-600 hover:bg-green-700 text-white",
      outline: "border border-gray-300 text-gray-700 hover:bg-gray-50",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base",
      xl: "px-8 py-4 text-lg",
      full: "w-full h-[48px] md:w-[500px] text-base py-2 mt-3",
    };

    // ✅ If toggle mode enable → ignore normal design
    if (isToggle) {
      return (
        <button
          ref={ref}
          onClick={onClick}
          className={`relative w-[42px] h-[25px] rounded-full transition-all duration-300 flex items-center justify-center ${
            isOn ? "bg-green-500" : "bg-gray-300"
          } ${className}`}
          {...props}
        >
          <div
            className={`absolute w-[20px] h-[20px] bg-white rounded-full shadow-md transition-all duration-300 ${
              isOn ? "translate-x-2" : "-translate-x-2"
            }`}
          />
        </button>
      );
    }

    const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;

    return (
      <button
        ref={ref}
        type={type}
        className={classes}
        disabled={disabled || loading}
        onClick={onClick}
        {...props}
      >
        {loading && (
          <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
        )}
        {leftIcon && !loading && <span className="mr-2">{leftIcon}</span>}
        {children}
        {icon && !loading && <span className="ml-2">{icon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
