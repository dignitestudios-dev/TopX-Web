import { forwardRef } from "react";

const Button = forwardRef(
  (
    {
      children,
      variant = "",
      size = "",
      icon, // right icon
      leftIcon, // left icon
      disabled = false,
      loading = false,
      className = "",
      onClick,
      ...props
    },
    ref
  ) => {
    const baseClasses =
      "inline-flex items-center  font-medium rounded-[12px] transition-all duration-200";

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
      full: "w-full h-[48px] md:w-[500px] text-base py-2 mt-3 inline-flex items-center justify-center",
    };

    const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || loading}
        onClick={onClick}
        {...props}
      >
        {/* Loader */}
        {loading && (
          <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
        )}

        {/* Left Icon */}
        {leftIcon && !loading && (
          <span className="mr-2 flex items-center">{leftIcon}</span>
        )}

        {/* Button Text */}
        {children}

        {/* Right Icon */}
        {icon && !loading && (
          <span className="ml-2 flex items-center">{icon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
