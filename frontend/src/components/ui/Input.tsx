"use client";

import React from "react";
import clsx from "clsx";
import "./Input.css"; 

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, ...props }, ref) => {
    return (
      <div className="input-wrapper">
        {label && <label className="input-label">{label}</label>}
        <div className="input-container">
          {icon && <div className="input-icon">{icon}</div>}
          <input
            className={clsx(
              "input-field",
              icon && "input-with-icon",
              error && "input-error",
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {error && <span className="input-error-msg">{error}</span>}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
