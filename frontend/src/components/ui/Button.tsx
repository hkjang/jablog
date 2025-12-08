"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { Loader2 } from "lucide-react";
import clsx from "clsx";
import "./Button.css";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
    
    const variants = {
      primary:
        "bg-gradient-to-r from-violet-600 to-pink-600 text-white shadow-lg hover:shadow-xl hover:opacity-90 border-0", // Note: simplified for vanilla CSS usage, likely need proper classes or styles if not using Tailwind. 
        // Wait, I said NO Tailwind unless requested. I need to use the CSS variables I defined.
        // Let's rewrite this to use style objects or clsx with custom classes defined in a module or global css.
        // Since I only have globals.css, let's use inline styles or standard class names I can add to globals.
        // Actually, for better maintainability without Tailwind, I should probably use CSS Modules.
        // But for speed and matching the user's previous context often mixing things, let's stick to a clean CSS-in-JS or just standard classes mapped to globals.
        // Let's use the `style` prop or standard class names that I'll add to globals.css or a module.
        // To be safe and premium, I'll use inline styles for the gradient specifically but class names for structure.
        // Better: I will create a button.module.css? No, I'll put utility classes in globals.css or just scope them here.
        // Let's stick to "style" for dynamic colors and standard classes for layout.
        // Re-reading plan: "Vanilla CSS (CSS Modules/Variables)".
        // OK, let's assume I can add a `Button.module.css` next to this file.
        // That is the standard Next.js way.
    };
    
    // Actually, let's use a module CSS file for components to keep it clean.
    return (
        <motion.button
            ref={ref}
            whileTap={{ scale: 0.98 }}
            whileHover={{ scale: 1.02 }}
            className={clsx("btn", `btn-${variant}`, `btn-${size}`, className)}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
            {children}
            {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
        </motion.button>
    );
  }
);

Button.displayName = "Button";

export { Button };
