"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUserStore } from "@/stores/user-store";
import { UserI } from "@/types/user";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useUserStore((s) => s.setAuth);

  useEffect(() => {
    const token = searchParams.get("token");
    const userEncoded = searchParams.get("user");

    if (!token || !userEncoded) {
      router.replace("/");
      return;
    }

    try {
      // Decode base64url (RawURLEncoding from Go backend)
      const base64 = userEncoded.replace(/-/g, "+").replace(/_/g, "/");
      const user: UserI = JSON.parse(atob(base64));
      setAuth(user, token);
      router.replace("/dashboard");
    } catch {
      router.replace("/");
    }
  }, [searchParams, setAuth, router]);

  return null;
}

export default function AuthCallbackPage() {
  return (
    <Suspense>
      <CallbackHandler />
    </Suspense>
  );
}
