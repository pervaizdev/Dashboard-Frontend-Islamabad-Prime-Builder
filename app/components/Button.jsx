"use client";

const Button = ({
  children,
  type = "button",
  onClick,
  disabled,
  className = "",
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-70 ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;