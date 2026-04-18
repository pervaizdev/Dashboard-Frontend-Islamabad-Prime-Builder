"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const Input = ({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  prefix,
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isPasswordField = type === "password";
  const inputType = isPasswordField 
    ? (isPasswordVisible ? "text" : "password") 
    : type;

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-[#c29e6d]">
          {label}
        </label>
      )}

      <div className="relative group">
        {prefix && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center border-r border-[#c29e6d]/30 pr-3 z-10">
            {prefix}
          </div>
        )}
        <input
          type={inputType}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full rounded-xl border border-[#c29e6d]/30 bg-white/10 ${prefix ? "pl-30" : "px-4"} py-3 text-sm text-white placeholder:text-[#cbb89a]/70 outline-none transition-all duration-300 focus:border-[#c29e6d] focus:bg-white/15 focus:ring-2 focus:ring-[#c29e6d]/30 pr-12`}
        />
        {isPasswordField && (
          <button
            type="button"
            onClick={() => setIsPasswordVisible(!isPasswordVisible)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#c29e6d]/50 hover:text-[#c29e6d] transition-colors"
          >
            {isPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </div>
  );
};

export default Input;