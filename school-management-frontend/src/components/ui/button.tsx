import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva("inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:pointer-events-none disabled:opacity-50", {
  variants: { variant: { default: "bg-[var(--primary)] text-white shadow-lg shadow-teal-950/15 hover:-translate-y-0.5 hover:bg-[var(--primary-strong)]", outline: "border border-[var(--border)] bg-[var(--panel)] text-[var(--foreground)] hover:bg-[var(--muted)]", ghost: "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]", amber: "bg-[var(--accent)] text-[var(--accent-foreground)] hover:-translate-y-0.5 hover:bg-[var(--accent-strong)]" }, size: { default: "h-11 px-5", sm: "h-9 px-3.5", lg: "h-12 px-6", icon: "h-10 w-10" } },
  defaultVariants: { variant: "default", size: "default" },
});
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}
export function Button({ className, variant, size, ...props }: ButtonProps) { return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />; }
