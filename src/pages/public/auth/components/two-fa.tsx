import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup } from "@/components/ui/field";
import { useAuth } from "@/contexts/auth";
import { useTranslation } from "react-i18next";
import { OTPInput } from "@/components/ui/otp-input";

interface TwoFAProps {
  onBack?: () => void;
}

export function TwoFA({ onBack }: TwoFAProps) {
  const { t } = useTranslation();
  const { verify2FA, pendingUsername } = useAuth();
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleOTPChange = (value: string) => {
    setCode(value);
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      setError(t("auth.forms.twoFA.invalidCodeLength"));
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      await verify2FA(code);
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? t("auth.forms.twoFA.errorMessage"),
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div className="space-y-1.5 text-center">
        <h1 className="text-foreground text-2xl font-bold tracking-tight">
          {t("auth.forms.twoFA.title")}
        </h1>
        <p className="text-muted-foreground text-sm">
          {t("auth.forms.twoFA.description")}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <FieldGroup className="gap-4">
          {/* Username badge */}
          <Field className="items-center gap-1 text-center">
            <span className="bg-muted text-foreground/80 inline-block rounded-full px-4 py-1 text-sm font-medium">
              {pendingUsername}
            </span>
          </Field>

          {/* OTP */}
          <Field className="gap-2">
            <div className="flex justify-center">
              <OTPInput
                value={code}
                onChange={handleOTPChange}
                disabled={isLoading}
              />
            </div>
          </Field>

          {/* Error */}
          {error && (
            <div className="bg-destructive/10 text-destructive rounded-lg px-3 py-2 text-center text-xs">
              {error}
            </div>
          )}

          {/* Actions */}
          <Button
            type="submit"
            disabled={isLoading || code.length !== 6}
            className="shadow-primary/20 h-11 w-full rounded-lg text-sm font-medium shadow-md"
          >
            {isLoading
              ? t("auth.forms.twoFA.loadingText")
              : t("auth.forms.twoFA.submitButton")}
          </Button>

          {onBack && (
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              disabled={isLoading}
              className="h-11 w-full rounded-lg text-sm"
            >
              {t("auth.forms.twoFA.backButton")}
            </Button>
          )}
        </FieldGroup>
      </form>
    </div>
  );
}
