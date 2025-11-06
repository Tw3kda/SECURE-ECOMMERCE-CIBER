import React from "react";
import clsx from "clsx";

export const Card = ({ className = "", children, ...props }) => (
  <div
    className={clsx(
      "rounded-[var(--radius)] border border-border bg-card text-card-foreground shadow-[var(--shadow-elegant)] transition-[var(--transition-smooth)]",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export const CardHeader = ({ className = "", children }) => (
  <div className={clsx("p-4 border-b border-border", className)}>{children}</div>
);

export const CardContent = ({ className = "", children }) => (
  <div className={clsx("p-4", className)}>{children}</div>
);

export const CardFooter = ({ className = "", children }) => (
  <div className={clsx("p-4 border-t border-border", className)}>{children}</div>
);

export const CardTitle = ({ className = "", children }) => (
  <h3 className={clsx("text-lg font-semibold leading-tight text-foreground", className)}>
    {children}
  </h3>
);

export const CardDescription = ({ className = "", children }) => (
  <p className={clsx("text-sm text-muted-foreground", className)}>{children}</p>
);
