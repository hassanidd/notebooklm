import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputPassword } from "@/components/ui/input-password";
import { useAuth } from "@/contexts/auth";
import { useTranslation } from "react-i18next";
import type { SignUpData } from "@/types/auth-types";
import { z } from "zod";

const signUpSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(50, "Username must be at most 50 characters")
      .regex(/^[a-zA-Z0-9_-]+$/, "Only letters, numbers, hyphens & underscores")
      .refine((v) => !v.includes("@"), "Use the email field for '@'")
      .refine((v) => !v.includes("."), "Use the email field for '.'"),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    password: z
      .string()
      .min(8, "Min 8 characters")
      .regex(/[A-Z]/, "One uppercase letter")
      .regex(/[a-z]/, "One lowercase letter")
      .regex(/[0-9]/, "One number")
      .regex(/[^A-Za-z0-9]/, "One special character"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

interface SignupFormProps {
  onSwitchToLogin?: () => void;
}

export function SignupForm({ onSwitchToLogin }: SignupFormProps) {
  const { t } = useTranslation();
  const { signup } = useAuth();
  const [formData, setFormData] = useState<
    SignUpData & { confirmPassword: string }
  >({
    email: "",
    username: "",
    firstName: "",
    lastName: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const passwordChecks = {
    minLength: formData.password.length >= 8,
    hasUppercase: /[A-Z]/.test(formData.password),
    hasLowercase: /[a-z]/.test(formData.password),
    hasNumber: /[0-9]/.test(formData.password),
    hasSpecial: /[^A-Za-z0-9]/.test(formData.password),
  };

  const strength = Object.values(passwordChecks).filter(Boolean).length;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setFieldErrors({});

    try {
      signUpSchema.parse(formData);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        err.issues.forEach((issue) => {
          errors[issue.path[0] as string] = issue.message;
        });
        setFieldErrors(errors);
        setIsLoading(false);
        return;
      }
    }

    const { confirmPassword: _, ...signUpPayload } = formData;
    try {
      await signup(signUpPayload);
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? t("auth.forms.signup.errors.signupFailed"),
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Shared input class
  const inputCls =
    "border-border/60 bg-muted/30 focus:border-primary/50 focus:ring-primary/20 h-11 rounded-lg text-sm transition-colors focus:ring-2";
  const labelCls = "text-foreground/80 text-xs font-medium tracking-wide ";

  return (
    <div className="space-y-5">
      {/* Heading */}
      <div className="mb-10 space-y-1.5 text-center">
        <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
          {t("auth.forms.signup.title")}
        </h1>
        <p className="text-muted-foreground text-sm">
          {t("auth.forms.signup.description")}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <FieldGroup className="gap-3">
          {/* Name row */}
          <div className="grid grid-cols-2 gap-3">
            <Field className="gap-1.5">
              <FieldLabel htmlFor="firstName" className={labelCls}>
                {t("auth.forms.signup.firstNameLabel")}
              </FieldLabel>
              <Input
                id="firstName"
                name="firstName"
                placeholder={t("auth.forms.signup.firstNamePlaceholder")}
                value={formData.firstName}
                onChange={handleInputChange}
                required
                className={inputCls}
                disabled={isLoading}
              />
              {fieldErrors.firstName && (
                <FieldError>{fieldErrors.firstName}</FieldError>
              )}
            </Field>
            <Field className="gap-1.5">
              <FieldLabel htmlFor="lastName" className={labelCls}>
                {t("auth.forms.signup.lastNameLabel")}
              </FieldLabel>
              <Input
                id="lastName"
                name="lastName"
                placeholder={t("auth.forms.signup.lastNamePlaceholder")}
                value={formData.lastName}
                onChange={handleInputChange}
                required
                className={inputCls}
                disabled={isLoading}
              />
              {fieldErrors.lastName && (
                <FieldError>{fieldErrors.lastName}</FieldError>
              )}
            </Field>
          </div>

          <Field className="gap-1.5">
            <FieldLabel htmlFor="username" className={labelCls}>
              {t("auth.forms.signup.usernameLabel")}
            </FieldLabel>
            <Input
              id="username"
              name="username"
              placeholder={t("auth.forms.signup.usernamePlaceholder")}
              value={formData.username}
              onChange={handleInputChange}
              required
              className={inputCls}
              disabled={isLoading}
            />
            {fieldErrors.username && (
              <FieldError>{fieldErrors.username}</FieldError>
            )}
            <p className="text-muted-foreground text-[10px]">
              Letters, numbers, hyphens & underscores only
            </p>
          </Field>

          <Field className="gap-1.5">
            <FieldLabel htmlFor="email" className={labelCls}>
              {t("auth.forms.signup.emailLabel")}
            </FieldLabel>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder={t("auth.forms.signup.emailPlaceholder")}
              value={formData.email}
              onChange={handleInputChange}
              required
              className={inputCls}
              disabled={isLoading}
            />
            {fieldErrors.email && <FieldError>{fieldErrors.email}</FieldError>}
          </Field>

          <Field className="gap-1.5">
            <FieldLabel htmlFor="password" className={labelCls}>
              {t("auth.forms.signup.passwordLabel")}
            </FieldLabel>
            <InputPassword
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className={inputCls}
              disabled={isLoading}
            />
            {fieldErrors.password && (
              <FieldError>{fieldErrors.password}</FieldError>
            )}

            {/* Strength indicator */}
            <div className="flex items-center gap-2">
              <div className="flex flex-1 gap-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <div
                    key={i}
                    className="h-1 flex-1 rounded-full transition-colors duration-300"
                    style={{
                      backgroundColor:
                        i < strength
                          ? strength <= 2
                            ? "var(--destructive)"
                            : strength <= 3
                              ? "#f59e0b"
                              : "#10b981"
                          : "var(--border)",
                    }}
                  />
                ))}
              </div>
              <span className="text-muted-foreground text-[10px] font-medium">
                {strength}/5
              </span>
            </div>
          </Field>

          <Field className="gap-1.5">
            <FieldLabel htmlFor="confirmPassword" className={labelCls}>
              {t("auth.forms.signup.confirmPasswordLabel")}
            </FieldLabel>
            <InputPassword
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              className={inputCls}
              disabled={isLoading}
            />
            {fieldErrors.confirmPassword && (
              <FieldError>{fieldErrors.confirmPassword}</FieldError>
            )}
            <p className="text-muted-foreground text-[10px]">
              {t("auth.forms.signup.confirmPasswordDescription")}
            </p>
          </Field>

          {/* Error */}
          {error && (
            <div className="bg-destructive/10 text-destructive rounded-lg px-3 py-2 text-xs">
              {error}
            </div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            disabled={isLoading}
            className="shadow-primary/20 hover:shadow-primary/30 mt-6 h-11 w-full rounded-lg text-sm font-medium shadow-md transition-shadow hover:shadow-lg"
          >
            {isLoading
              ? t("auth.forms.signup.loadingText")
              : t("auth.forms.signup.submitButton")}
          </Button>
        </FieldGroup>
      </form>

      {/* Switch link */}
      <FieldDescription className="text-center text-sm">
        {t("auth.forms.signup.hasAccountText")}{" "}
        <Button
          variant="link"
          size="sm"
          onClick={onSwitchToLogin}
          className="text-primary h-auto p-0 text-sm font-semibold"
        >
          {t("auth.forms.signup.signInLink")}
        </Button>
      </FieldDescription>
    </div>
  );
}

// Inline field error
function FieldError({ children }: { children: React.ReactNode }) {
  return <p className="text-destructive text-xs">{children}</p>;
}
