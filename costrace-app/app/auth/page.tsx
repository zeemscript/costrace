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

  const isValidEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleRequestMagicLink = async () => {
    if (!email) return;
    if (!isValidEmail(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }
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
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4">
      {/* Background grid */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:64px_64px]" />

      {/* Subtle glow */}
      <div className="pointer-events-none absolute top-1/3 left-1/2 h-[400px] w-[500px] -translate-x-1/2 -translate-y-1/2 bg-emerald-500/[0.03] blur-[100px]" />

      <div className="relative w-full max-w-[380px]">
        {/* Header — above the card */}
        <div className="mb-10">
          <div className="flex items-center gap-3">
            {/* Logo mark */}
            <div className="relative">
              <span className="absolute left-[-4px] top-0 bottom-0 w-px bg-emerald-500/30" />
              <span className="absolute top-[-4px] left-0 right-0 h-px bg-emerald-500/30" />
              <div className="flex size-7 items-center justify-center bg-emerald-500/10">
                <span className="font-mono text-[11px] font-bold text-emerald-400">
                  C
                </span>
              </div>
            </div>
            <span className="font-mono text-[13px] tracking-tight text-white/60">
              costrace
            </span>
          </div>

          <h1 className="mt-6 text-xl font-medium tracking-tight text-white/90">
            Sign in
          </h1>
          <p className="mt-1.5 text-[13px] text-white/25">
            Continue to your dashboard.
          </p>
        </div>

        {/* Card with extending lines */}
        <div className="relative">
          <span className="absolute left-0 top-[-10px] h-[calc(100%+20px)] w-px bg-white/[0.04]" />
          <span className="absolute right-0 top-[-10px] h-[calc(100%+20px)] w-px bg-white/[0.04]" />
          <span className="absolute top-0 left-[-10px] w-[calc(100%+20px)] h-px bg-white/[0.04]" />
          <span className="absolute bottom-0 left-[-10px] w-[calc(100%+20px)] h-px bg-white/[0.04]" />

          {/* Corner markers */}
          <span className="absolute top-[-3px] left-[-3px] size-[7px] border border-white/[0.08] bg-background" />
          <span className="absolute top-[-3px] right-[-3px] size-[7px] border border-white/[0.08] bg-background" />
          <span className="absolute bottom-[-3px] left-[-3px] size-[7px] border border-white/[0.08] bg-background" />
          <span className="absolute bottom-[-3px] right-[-3px] size-[7px] border border-white/[0.08] bg-background" />

          <div className="relative bg-white/[0.01] p-8">
            <div className="space-y-3">
              {/* GitHub button */}
              <button
                onClick={initiateGithubAuth}
                className="group relative flex h-11 w-full cursor-pointer items-center justify-center gap-3 bg-white/[0.05] font-mono text-[11px] uppercase tracking-wider text-white/50 transition-all duration-300 hover:bg-white/[0.08] hover:text-white/70 active:scale-[0.98]"
              >
                <Github className="size-4 transition-transform duration-300 group-hover:scale-110" />
                Continue with GitHub
              </button>

              {/* Divider */}
              <div className="flex items-center gap-4 py-2">
                <span className="h-px flex-1 bg-white/[0.04]" />
                <span className="font-mono text-[10px] uppercase tracking-wider text-white/10">
                  or
                </span>
                <span className="h-px flex-1 bg-white/[0.04]" />
              </div>

              {showEmail ? (
                sent ? (
                  /* Success state */
                  <div className="py-4 text-center">
                    <div className="mx-auto mb-3 flex size-10 items-center justify-center bg-emerald-500/10">
                      <Mail className="size-4 text-emerald-400/60" />
                    </div>
                    <p className="text-[13px] font-medium text-white/60">
                      Check your inbox
                    </p>
                    <p className="mt-1.5 text-[12px] text-white/20">
                      A login link was sent to{" "}
                      <span className="text-white/40">{email}</span>
                      .
                      <br />
                      It expires in 15 minutes.
                    </p>
                  </div>
                ) : (
                  <>
                    <Input
                      type="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleRequestMagicLink()
                      }
                      className="h-11 w-full border-0 bg-white/[0.03] px-4 font-mono text-[12px] text-white/60 placeholder:text-white/15 ring-1 ring-white/[0.06] transition-all duration-300 focus:bg-white/[0.05] focus:ring-emerald-500/20 focus:outline-none rounded-none"
                    />

                    <button
                      onClick={handleRequestMagicLink}
                      disabled={loading || !email}
                      className="flex h-11 w-full cursor-pointer items-center justify-center gap-2.5 bg-emerald-500/10 font-mono text-[11px] uppercase tracking-wider text-emerald-400/60 transition-all duration-300 hover:bg-emerald-500/15 hover:text-emerald-400/80 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <ScanEye className="size-3.5" />
                      {loading ? "Sending..." : "Send magic link"}
                    </button>
                  </>
                )
              ) : (
                <button
                  onClick={() => setShowEmail(true)}
                  className="flex h-11 w-full cursor-pointer items-center justify-center gap-3 bg-white/[0.02] font-mono text-[11px] uppercase tracking-wider text-white/25 transition-all duration-300 hover:bg-white/[0.04] hover:text-white/40"
                >
                  <Mail className="size-4" />
                  Continue with Email
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-[11px] text-white/15">
            By continuing, you agree to our{" "}
            <a
              href="/terms"
              className="text-white/25 underline underline-offset-4 transition-colors hover:text-white/40"
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
