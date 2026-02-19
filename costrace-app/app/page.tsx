import { Github } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4">
      <div className="w-full max-w-[400px] space-y-8 rounded-sm border border-zinc-200 bg-white p-10 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">

        {/* Header */}
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Welcome back
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Sign in to your account to continue.
          </p>
        </div>

        {/* Action Button */}
        <div className="space-y-4">
          <Link href="http://localhost:8080/auth/github" className="group relative flex h-12 w-full items-center justify-center gap-3 rounded-sm bg-zinc-900 px-4 text-sm font-semibold text-white transition-all hover:bg-zinc-800 active:scale-[0.98] dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200">
            <Github className="h-5 w-5 transition-transform group-hover:scale-110" />
            Continue with GitHub
          </Link>


          <button
            className="h-12 w-full rounded-sm border border-zinc-200 bg-transparent text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800/50"
          >
            Cancel
          </button>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            By clicking continue, you agree to our{" "}
            <a href="#" className="underline underline-offset-4 hover:text-zinc-900 dark:hover:text-zinc-300">
              Terms of Service
            </a>.
          </p>
        </div>
      </div>
    </div>
  );
}