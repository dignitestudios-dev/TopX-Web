import React from "react";

const Card = ({ children, className = "", padding = "p-4", hover = false, ...props }) => {
  const baseClasses =
    "bg-white  rounded-[12px] border border-[0.8px] ";
  const hoverClasses = hover ? "hover:shadow-lg cursor-pointer" : "";
  const classes = `${baseClasses} ${hoverClasses} ${padding} ${className}`;

  return (
    <div className={classes} {...props} >
      {children}
    </div>
  );
};

export default Card;