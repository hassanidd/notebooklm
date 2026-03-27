import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth";
import { InputPassword } from "@/components/ui/input-password";
import { useTranslation } from "react-i18next";

interface LoginFormProps {
  onSwitchToSignUp?: () => void;
}

export function LoginForm({ onSwitchToSignUp }: LoginFormProps) {
  const { t } = useTranslation();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      await login(formData.username, formData.password);
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? t("auth.forms.login.errorMessage"),
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 px-2 lg:px-0">
      {/* Heading */}
      <div className="mb-12 space-y-1.5 text-center">
        <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
          {t("auth.forms.login.title")}
        </h1>
        <p className="text-muted-foreground text-sm">
          {t("auth.forms.login.description")}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <FieldGroup className="gap-4">
          <Field className="gap-1.5">
            <FieldLabel
              htmlFor="username"
              className="text-foreground/80 text-xs font-medium tracking-wide"
            >
              {t("auth.forms.login.usernameLabel")}
            </FieldLabel>
            <Input
              id="username"
              name="username"
              type="username"
              placeholder={t("auth.forms.login.usernamePlaceholder")}
              className="border-border/60 bg-muted/30 focus:border-primary/50 focus:ring-primary/20 h-11 rounded-lg text-sm transition-colors focus:ring-2"
              value={formData.username}
              onChange={handleInputChange}
              required
              disabled={isLoading}
            />
          </Field>

          <Field className="gap-1.5">
            <div className="flex items-center justify-between">
              <FieldLabel
                htmlFor="password"
                className="text-foreground/80 text-xs font-medium tracking-wide"
              >
                {t("auth.forms.login.passwordLabel")}
              </FieldLabel>
            </div>
            <InputPassword
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="border-border/60 bg-muted/30 focus:border-primary/50 focus:ring-primary/20 h-11 rounded-lg text-sm transition-colors focus:ring-2"
              disabled={isLoading}
            />
            <a
              href="#"
              className="text-foreground/50 hover:text-primary text-end text-xs transition-colors"
            >
              {t("auth.forms.login.forgotPassword")}
            </a>
          </Field>

          {/* Error message */}
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
              ? t("auth.forms.login.loadingText")
              : t("auth.forms.login.submitButton")}
          </Button>
        </FieldGroup>
      </form>

      {/* Switch link */}
      <FieldDescription className="text-center text-sm">
        {t("auth.forms.login.noAccountText")}{" "}
        <Button
          variant="link"
          size="sm"
          onClick={onSwitchToSignUp}
          className="text-primary h-auto p-0 text-sm font-semibold"
        >
          {t("auth.forms.login.signUpLink")}
        </Button>
      </FieldDescription>
    </div>
  );
}
