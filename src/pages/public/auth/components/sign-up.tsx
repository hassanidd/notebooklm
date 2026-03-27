import { useState, type ReactNode, type ChangeEvent, type FormEvent } from "react";
import {
  Eye, EyeOff, Mail, Lock, User, ArrowRight, CheckCircle2, Github,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SignupFormProps {
  onSwitchToLogin?: () => void;
}

const passwordChecks = (pw: string) => ({
  length: pw.length >= 8,
  upper: /[A-Z]/.test(pw),
  lower: /[a-z]/.test(pw),
  number: /[0-9]/.test(pw),
  special: /[^A-Za-z0-9]/.test(pw),
});

export function SignupForm({ onSwitchToLogin }: SignupFormProps) {
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "",
    password: "", confirmPassword: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [agreed, setAgreed] = useState(false);

  const checks = passwordChecks(form.password);
  const strength = Object.values(checks).filter(Boolean).length;

  const strengthLabel = strength <= 1 ? "Very weak" : strength <= 2 ? "Weak" : strength <= 3 ? "Fair" : strength <= 4 ? "Strong" : "Very strong";
  const strengthColor = strength <= 1 ? "bg-red-500" : strength <= 2 ? "bg-orange-500" : strength <= 3 ? "bg-amber-500" : strength <= 4 ? "bg-emerald-500" : "bg-emerald-600";

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError("");
    if (fieldErrors[e.target.name]) {
      setFieldErrors((prev) => { const n = { ...prev }; delete n[e.target.name]; return n; });
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.firstName.trim()) errs.firstName = "Required";
    if (!form.lastName.trim()) errs.lastName = "Required";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Valid email required";
    if (strength < 3) errs.password = "Password is too weak";
    if (form.password !== form.confirmPassword) errs.confirmPassword = "Passwords don't match";
    if (!agreed) errs.terms = "You must accept the terms";
    return errs;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setFieldErrors(errs); return; }
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setIsLoading(false);
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="text-center space-y-5 py-8">
        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="size-8 text-emerald-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Check your inbox</h2>
          <p className="text-sm text-gray-500 mt-1">
            We sent a confirmation email to{" "}
            <span className="font-semibold text-gray-700">{form.email}</span>
          </p>
        </div>
        <p className="text-xs text-gray-400 max-w-xs mx-auto">
          Click the link in the email to activate your account. It expires in 24 hours.
        </p>
        <button
          onClick={onSwitchToLogin}
          className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold"
        >
          Back to sign in
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Create your account</h2>
        <p className="text-sm text-gray-500 mt-1">Start ingesting documents in minutes. Free forever on Starter.</p>
      </div>

      {/* Social */}
      <div className="grid grid-cols-2 gap-3">
        <SocialButton icon={<GoogleIcon />} label="Google" />
        <SocialButton icon={<Github className="size-4" />} label="GitHub" />
      </div>

      <Divider />

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name row */}
        <div className="grid grid-cols-2 gap-3">
          <FormField label="First name" error={fieldErrors.firstName}>
            <InputWrapper icon={<User className="size-3.5 text-gray-400" />}>
              <input name="firstName" placeholder="Alex" value={form.firstName}
                onChange={handleChange} disabled={isLoading} className={inputCls} />
            </InputWrapper>
          </FormField>
          <FormField label="Last name" error={fieldErrors.lastName}>
            <InputWrapper>
              <input name="lastName" placeholder="Kim" value={form.lastName}
                onChange={handleChange} disabled={isLoading} className={inputCls} />
            </InputWrapper>
          </FormField>
        </div>

        <FormField label="Work email" error={fieldErrors.email}>
          <InputWrapper icon={<Mail className="size-4 text-gray-400" />}>
            <input name="email" type="email" placeholder="alex@acme.com" value={form.email}
              onChange={handleChange} disabled={isLoading} autoComplete="email" className={inputCls} />
          </InputWrapper>
        </FormField>

        <FormField label="Password" error={fieldErrors.password}>
          <InputWrapper icon={<Lock className="size-4 text-gray-400" />} trailing={
            <button type="button" onClick={() => setShowPw(!showPw)} className="text-gray-400 hover:text-gray-600 p-1">
              {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          }>
            <input name="password" type={showPw ? "text" : "password"} placeholder="Min 8 characters"
              value={form.password} onChange={handleChange} disabled={isLoading} className={inputCls} />
          </InputWrapper>

          {/* Password strength */}
          {form.password && (
            <div className="space-y-2 mt-2">
              <div className="flex items-center gap-2">
                <div className="flex flex-1 gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className={cn("h-1 flex-1 rounded-full transition-all duration-300",
                      i < strength ? strengthColor : "bg-gray-200")} />
                  ))}
                </div>
                <span className={cn("text-xs font-medium",
                  strength <= 2 ? "text-red-600" : strength <= 3 ? "text-amber-600" : "text-emerald-600"
                )}>
                  {strengthLabel}
                </span>
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                {[
                  { key: "length", label: "8+ characters" },
                  { key: "upper", label: "Uppercase" },
                  { key: "lower", label: "Lowercase" },
                  { key: "number", label: "Number" },
                  { key: "special", label: "Special char" },
                ].map(({ key, label }) => (
                  <span key={key} className={cn("flex items-center gap-1 text-[11px] font-medium",
                    checks[key as keyof typeof checks] ? "text-emerald-600" : "text-gray-400"
                  )}>
                    <span className={cn("w-1 h-1 rounded-full",
                      checks[key as keyof typeof checks] ? "bg-emerald-500" : "bg-gray-300")} />
                    {label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </FormField>

        <FormField label="Confirm password" error={fieldErrors.confirmPassword}>
          <InputWrapper icon={<Lock className="size-4 text-gray-400" />} trailing={
            <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="text-gray-400 hover:text-gray-600 p-1">
              {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          }>
            <input name="confirmPassword" type={showConfirm ? "text" : "password"} placeholder="Repeat password"
              value={form.confirmPassword} onChange={handleChange} disabled={isLoading} className={inputCls} />
          </InputWrapper>
        </FormField>

        {/* Terms */}
        <div className="space-y-1">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <div
              onClick={() => setAgreed(!agreed)}
              className={cn(
                "w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all",
                agreed ? "bg-indigo-600 border-indigo-600" : "border-gray-300"
              )}
            >
              {agreed && (
                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 12 12">
                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <span className="text-sm text-gray-600">
              I agree to the{" "}
              <a href="#" className="text-indigo-600 hover:text-indigo-700 font-medium">Terms of Service</a>
              {" "}and{" "}
              <a href="#" className="text-indigo-600 hover:text-indigo-700 font-medium">Privacy Policy</a>
            </span>
          </label>
          {fieldErrors.terms && <p className="text-xs text-red-600 pl-6">{fieldErrors.terms}</p>}
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-3 py-2.5 text-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
            {error}
          </div>
        )}

        <button type="submit" disabled={isLoading}
          className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md shadow-indigo-200">
          {isLoading ? (
            <><svg className="animate-spin size-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>Creating account…</>
          ) : (<>Create account <ArrowRight className="size-4" /></>)}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500">
        Already have an account?{" "}
        <button onClick={onSwitchToLogin} className="text-indigo-600 hover:text-indigo-700 font-semibold">
          Sign in
        </button>
      </p>
    </div>
  );
}

const inputCls = "flex-1 min-w-0 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none py-2.5";

function FormField({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">{label}</label>
      {children}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

function InputWrapper({ icon, trailing, children }: { icon?: ReactNode; trailing?: ReactNode; children: ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 h-11 bg-gray-50 border border-gray-200 rounded-xl px-3.5 focus-within:bg-white focus-within:border-indigo-400 focus-within:ring-3 focus-within:ring-indigo-50 transition-all">
      {icon}{children}{trailing}
    </div>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-px bg-gray-100" />
      <span className="text-xs text-gray-400 font-medium">or sign up with email</span>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  );
}

function SocialButton({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <button type="button" className="flex items-center justify-center gap-2 h-10 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all">
      {icon}{label}
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
