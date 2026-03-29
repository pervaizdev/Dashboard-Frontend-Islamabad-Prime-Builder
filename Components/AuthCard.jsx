"use client";

const AuthCard = ({ children, className = "" }) => {
  return (
    <div
      className={`rounded-3xl border border-[#c29e6d]/25 bg-white/8 p-8 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur-2xl sm:p-10 ${className}`}
    >
      {children}
    </div>
  );
};

export default AuthCard;