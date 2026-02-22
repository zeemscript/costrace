"use client";
import { initiateGithubAuth, requestEmailLink } from "@/api/auth";
import { Input } from "@/components/ui/input";
import { Github, Mail, ScanEye } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function LoginPage() {
  const [showEmail, setShowEmail] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleRequestMagicLink = async () => {
    if (!email) return;
    try {
      setLoading(true);
      await requestEmailLink(email);
      setSent(true);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.error ?? "Failed to send login link. Try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4">
      <div className="w-full max-w-[400px] space-y-8 rounded-sm border border-zinc-200 bg-white p-10 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        {/* Header */}
        <div className="space-y-2 text-center">
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Welcome back
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Sign in to your account to continue.
          </p>
        </div>

        {/* Buttons */}
        <div className="space-y-4">
          <button
            onClick={initiateGithubAuth}
            className="group relative flex h-12 w-full items-center justify-center gap-3 rounded-xs bg-zinc-900 px-4 text-sm font-semibold text-white transition-all hover:bg-zinc-800 active:scale-[0.98] dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
          >
            <Github className="h-5 w-5 transition-transform group-hover:scale-110" />
            Continue with GitHub
          </button>

          {showEmail ? (
            sent ? (
              <div className="rounded-sm border border-zinc-200 dark:border-zinc-800 px-4 py-5 text-center space-y-1">
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Check your inbox
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  A login link was sent to{" "}
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">
                    {email}
                  </span>
                  . It expires in 15 minutes.
                </p>
              </div>
            ) : (
              <>
                <Input
                  type="email"
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleRequestMagicLink()
                  }
                  className="w-full h-12 rounded-xs border border-zinc-200 bg-transparent px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800/50"
                />

                <button
                  onClick={handleRequestMagicLink}
                  disabled={loading || !email}
                  className="h-12 w-full rounded-xs border border-zinc-200 bg-transparent text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800/50 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ScanEye className="h-5 w-5" />
                  {loading ? "Sending..." : "Get Link"}
                </button>
              </>
            )
          ) : (
            <button
              onClick={() => setShowEmail(true)}
              className="h-12 w-full rounded-sm border border-zinc-200 bg-transparent text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800/50 flex items-center justify-center gap-3"
            >
              <Mail className="h-5 w-5" />
              Continue with Email
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            By clicking continue, you agree to our{" "}
            <a
              href="#"
              className="underline underline-offset-4 hover:text-zinc-900 dark:hover:text-zinc-300"
            >
              Terms of Service
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
