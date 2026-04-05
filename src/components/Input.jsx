"use client";

const Input = ({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
}) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-[#c29e6d]">
          {label}
        </label>
      )}

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-xl border border-[#c29e6d]/30 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-[#cbb89a]/70 outline-none transition-all duration-300 focus:border-[#c29e6d] focus:bg-white/15 focus:ring-2 focus:ring-[#c29e6d]/30"
      />
    </div>
  );
};

export default Input;