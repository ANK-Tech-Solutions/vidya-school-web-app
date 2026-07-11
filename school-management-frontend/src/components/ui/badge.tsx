import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
const variants = cva("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold", { variants: { variant: { default: "bg-teal-500/12 text-teal-700 dark:text-teal-300", amber: "bg-amber-400/20 text-amber-800 dark:text-amber-200", slate: "bg-slate-500/10 text-slate-600 dark:text-slate-300" } }, defaultVariants: { variant: "default" } });
export function Badge({ className, variant, ...props }: HTMLAttributes<HTMLSpanElement> & VariantProps<typeof variants>) { return <span className={cn(variants({ variant }), className)} {...props} />; }
