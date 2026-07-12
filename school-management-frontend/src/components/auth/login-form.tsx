"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { motion } from "framer-motion";
import { Eye, EyeOff, LockKeyhole, UserRound } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { API_URL, homeRouteForRoles } from "@/lib/constants";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/stores/auth-store";
import { BrandingSync } from "@/components/layout/branding-sync";
import { useBrandingStore } from "@/stores/branding-store";

const schema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});
type Values = z.infer<typeof schema>;

function loginErrorMessage(error: unknown): { title: string; description: string } {
  if (isAxiosError(error)) {
    if (!error.response) {
      return {
        title: "Can't reach the API",
        description: `No response from ${API_URL}. The backend may be waking up — wait about a minute and try again.`,
      };
    }
    if (error.response.status === 401 || error.response.status === 400) {
      return { title: "We couldn't sign you in", description: "Check your credentials and try again." };
    }
    if (error.response.status === 403) {
      return {
        title: "Access blocked",
        description: "The API rejected this request (often CORS). Confirm CORS_ALLOWED_ORIGINS includes this site.",
      };
    }
    const apiMessage = (error.response.data as { message?: string } | undefined)?.message;
    return {
      title: "Sign-in failed",
      description: apiMessage ?? `API error ${error.response.status}`,
    };
  }
  return { title: "We couldn't sign you in", description: "Check your credentials and try again." };
}

export function LoginForm() {
  const [visible, setVisible] = useState(false);
  const { setAuth } = useAuthStore();
  const branding = useBrandingStore();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: Values) => {
    try {
      const auth = await authService.login(values);
      setAuth(auth);
      window.location.assign(homeRouteForRoles(auth.user.roles));
    } catch (error) {
      const message = loginErrorMessage(error);
      toast.error(message.title, { description: message.description });
    }
  };

  return (
    <><BrandingSync /><motion.form
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      onSubmit={handleSubmit(onSubmit)}
      className="glass-panel w-full max-w-md rounded-3xl p-6 sm:p-8"
    >
      <div className="mb-7">
        <div className="mb-5 flex items-center gap-3"><img src={branding.appIconUrl} alt="" className="h-10 w-10 rounded-xl object-cover" /><span className="font-display text-lg font-bold">{branding.appName}</span></div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--primary)]">Welcome back</p>
        <h2 className="mt-2 font-display text-3xl font-bold tracking-tight">Sign in to your route</h2>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">Use your school account to continue.</p>
      </div>
      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <div className="relative">
            <UserRound className="pointer-events-none absolute left-3.5 top-3 text-[var(--muted-foreground)]" size={17} />
            <Input
              id="username"
              autoComplete="username"
              placeholder="Your username"
              className="pl-10"
              aria-invalid={!!errors.username}
              {...register("username")}
            />
          </div>
          {errors.username && <p className="text-xs text-red-500">{errors.username.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-3.5 top-3 text-[var(--muted-foreground)]" size={17} />
            <Input
              id="password"
              type={visible ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Your password"
              className="pl-10 pr-10"
              aria-invalid={!!errors.password}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setVisible(!visible)}
              aria-label={visible ? "Hide password" : "Show password"}
              className="absolute right-2.5 top-2.5 rounded-lg p-1 text-[var(--muted-foreground)]"
            >
              {visible ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
        </div>
        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
          {isSubmitting ? "Signing you in…" : "Continue to dashboard"}
        </Button>
      </div>
      <p className="mt-6 rounded-xl bg-[var(--muted)] px-3 py-2.5 text-center text-xs text-[var(--muted-foreground)]">
        Demo access: <strong className="text-[var(--foreground)]">superadmin · admin · vehicle1 · teacher1 · driver1 · parent1 / Password@123</strong>
      </p>
    </motion.form></>
  );
}
