import React from "react";
import clsx from "clsx";

export const Button = ({
  className = "",
  variant = "primary",
  disabled = false,
  children,
  ...props
}) => {
  const base =
    "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variants = {
    primary:
      "bg-primary text-primary-foreground hover:opacity-90 focus:ring-[var(--ring)]",
    secondary:
      "bg-secondary text-secondary-foreground hover:bg-secondary/80 focus:ring-[var(--ring)]",
    destructive:
      "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:ring-[var(--ring)]",
    muted:
      "bg-muted text-muted-foreground hover:bg-muted/80 focus:ring-[var(--ring)]",
  };

  const disabledClasses = disabled
    ? "opacity-50 cursor-not-allowed"
    : "cursor-pointer";

  return (
    <button
      className={clsx(base, variants[variant], disabledClasses, className)}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
