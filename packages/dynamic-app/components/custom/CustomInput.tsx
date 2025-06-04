import React, { forwardRef } from "react";

interface CustomInputProps {
  value?: string;
  onClick?: () => void;
  placeholder?: string;
  icon: React.ReactNode;
}

const CustomInput = forwardRef<HTMLInputElement, CustomInputProps>(
  ({ value, onClick, placeholder, icon }, ref) => (
    <div className="custom-input-wrapper">
      <input
        ref={ref}
        className="custom-input"
        value={value}
        onClick={onClick}
        placeholder={placeholder}
        readOnly
      />
      <span className="custom-input-icon" onClick={onClick}>
        {icon}
      </span>
    </div>
  )
);

export default CustomInput;
