"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useActionState, useEffect, useState } from "react";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { AuthForm } from "@/components/chat/auth-form";
import { SubmitButton } from "@/components/chat/submit-button";
import { toast } from "@/components/chat/toast";
import { type RegisterActionState, register } from "../actions";

export default function Page() {
  const router = useRouter();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [isSuccessful, setIsSuccessful] = useState(false);

  const [state, formAction] = useActionState<RegisterActionState, FormData>(
    register,
    { status: "idle" }
  );

  const { update: updateSession } = useSession();

  // biome-ignore lint/correctness/useExhaustiveDependencies: router and updateSession are stable refs
  useEffect(() => {
    if (state.status === "user_exists") {
      toast({ type: "error", description: t("auth.accountExists", "Account already exists!") });
    } else if (state.status === "failed") {
      toast({ type: "error", description: t("auth.failedCreate", "Failed to create account!") });
    } else if (state.status === "invalid_data") {
      toast({
        type: "error",
        description: t("auth.failedValidation", "Failed validating your submission!"),
      });
    } else if (state.status === "success") {
      toast({ type: "success", description: t("auth.accountCreated", "Account created!") });
      setIsSuccessful(true);
      updateSession();
      // If there's a redirect param, go there after registration
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get("redirect") ?? "/";
      router.push(redirect);
    }
  }, [state.status, t]);

  const handleSubmit = (formData: FormData) => {
    setEmail(formData.get("email") as string);
    formAction(formData);
  };

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">{t("auth.createAccount")}</h1>
      <p className="text-sm text-muted-foreground">{t("auth.getStartedFree")}</p>
      <AuthForm action={handleSubmit} defaultEmail={email}>
        <SubmitButton isSuccessful={isSuccessful}>{t("auth.signUp")}</SubmitButton>
        <p className="text-center text-[13px] text-muted-foreground">
          {`${t("auth.haveAccount")} `}
          <Link
            className="text-foreground underline-offset-4 hover:underline"
            href="/login"
          >
            {t("auth.signIn")}
          </Link>
        </p>
      </AuthForm>
    </>
  );
}
