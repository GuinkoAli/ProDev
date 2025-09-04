import * as React from "react";
import { cn } from "@/lib/utils";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  asChild?: boolean;
  children?: React.ReactNode;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", asChild, children, ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
    const variants: Record<string, string> = {
      default: "bg-black text-white hover:bg-black/90 focus-visible:ring-black",
      secondary:
        "bg-gray-100 text-gray-900 hover:bg-gray-200 focus-visible:ring-gray-400",
      ghost: "bg-transparent hover:bg-gray-100 text-gray-900",
    };
    const sizes: Record<string, string> = {
      sm: "h-8 px-3 text-sm",
      md: "h-10 px-4 text-sm",
      lg: "h-12 px-6 text-base",
    };

    const classes = cn(base, variants[variant], sizes[size], className);

    if (asChild && React.isValidElement(children)) {
      const childProps: Record<string, any> = { ...props };
      delete childProps.type;
      delete childProps.disabled;
      return React.cloneElement(children as React.ReactElement<any>, {
        ...childProps,
        className: cn((children as any).props?.className, classes),
        ref: ref as any,
      });
    }

    return (
      <button ref={ref} className={classes} {...props}>
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
