import type { InputHTMLAttributes, LabelHTMLAttributes } from "react";
import { cn } from "../lib/cn";

export function Input({
  className,
  type = "text",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-card px-3 text-sm placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-danger",
        className,
      )}
      {...props}
    />
  );
}

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("text-sm font-medium leading-none", className)} {...props} />;
}
