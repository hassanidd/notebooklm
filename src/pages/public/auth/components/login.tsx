import { useState, type ReactNode, type ChangeEvent, type FormEvent } from "react";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Github } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoginFormProps {
  onSwitchToSignUp?: () => void;
  onForgotPassword?: () => void;
  onTwoFA?: () => void;
}

export function LoginForm({ onSwitchToSignUp, onForgotPassword, onTwoFA }: LoginFormProps) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("Please fill in all fields.");
      return;
    }
    setIsLoading(true);
    setError("");
    // Simulate API call — demo: trigger 2FA flow
    await new Promise((r) => setTimeout(r, 900));
    setIsLoading(false);
    onTwoFA?.();
  };

  return (
    <div className="space-y-7">
      {/* Heading */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Welcome back</h2>
        <p className="text-sm text-gray-500 mt-1">Sign in to your VectorFlow workspace</p>
      </div>

      {/* Social buttons */}
      <div className="grid grid-cols-2 gap-3">
        <SocialButton icon={<GoogleIcon />} label="Google" />
        <SocialButton icon={<Github className="size-4" />} label="GitHub" />
      </div>

      <Divider />

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Work email">
          <InputWrapper icon={<Mail className="size-4 text-gray-400" />}>
            <input
              name="email"
              type="email"
              placeholder="alex@acme.com"
              value={form.email}
              onChange={handleChange}
              disabled={isLoading}
              autoComplete="email"
              className={inputCls}
            />
          </InputWrapper>
        </FormField>

        <FormField
          label="Password"
          action={
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
            >
              Forgot password?
            </button>
          }
        >
          <InputWrapper icon={<Lock className="size-4 text-gray-400" />} trailing={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          }>
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              disabled={isLoading}
              autoComplete="current-password"
              className={inputCls}
            />
          </InputWrapper>
        </FormField>

        {/* Remember me */}
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <div
            onClick={() => setRememberMe(!rememberMe)}
            className={cn(
              "w-4 h-4 rounded border-2 flex items-center justify-center transition-all flex-shrink-0",
              rememberMe ? "bg-indigo-600 border-indigo-600" : "border-gray-300"
            )}
          >
            {rememberMe && (
              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 12 12">
                <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <span className="text-sm text-gray-600">Keep me signed in for 30 days</span>
        </label>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-3 py-2.5 text-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md shadow-indigo-200"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin size-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Signing in…
            </>
          ) : (
            <>
              Sign in
              <ArrowRight className="size-4" />
            </>
          )}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500">
        Don't have an account?{" "}
        <button
          onClick={onSwitchToSignUp}
          className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors"
        >
          Create one free
        </button>
      </p>
    </div>
  );
}

// ── Shared sub-components ──────────────────────────────────────────────────

const inputCls =
  "flex-1 min-w-0 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none py-2.5";

function FormField({
  label, action, children
}: {
  label: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">{label}</label>
        {action}
      </div>
      {children}
    </div>
  );
}

function InputWrapper({
  icon, trailing, children
}: {
  icon?: ReactNode;
  trailing?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5 h-11 bg-gray-50 border border-gray-200 rounded-xl px-3.5 focus-within:bg-white focus-within:border-indigo-400 focus-within:ring-3 focus-within:ring-indigo-50 transition-all">
      {icon}
      {children}
      {trailing}
    </div>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-px bg-gray-100" />
      <span className="text-xs text-gray-400 font-medium">or continue with email</span>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  );
}

function SocialButton({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <button
      type="button"
      className="flex items-center justify-center gap-2 h-10 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
    >
      {icon}
      {label}
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}
