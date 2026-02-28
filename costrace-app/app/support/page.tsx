import { Book, Github, Mail, MessageSquare } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Support - Costrace",
  description: "Get help and support for Costrace - LLM cost tracking platform",
};

export default function SupportPage() {
  const supportOptions = [
    {
      icon: Mail,
      title: "Email Support",
      description: "Get help from our support team",
      action: "support@costrace.dev",
      href: "mailto:support@costrace.dev",
      badge: "24-48h response",
    },
    {
      icon: Book,
      title: "Documentation",
      description: "Browse our comprehensive guides",
      action: "Read the docs",
      href: "https://docs.costrace.dev",
      badge: "Getting started",
    },
    {
      icon: Github,
      title: "GitHub",
      description: "Report bugs and request features",
      action: "Soon",
      href: "#",
      badge: "Open source",
    },
    {
      icon: MessageSquare,
      title: "Community",
      description: "Join discussions with other users",
      action: "Coming soon",
      href: "#",
      badge: "Coming soon",
    },
  ];

  return (
    <div className="min-h-screen bg-black">
      <header className="border-b border-white/[0.06]">
        <div className="mx-auto max-w-6xl px-6 py-6">
          <Link href="/" className="group flex items-center gap-3">
            <div className="relative">
              <span className="absolute left-[-4px] top-0 bottom-0 w-px bg-emerald-500/30" />
              <span className="absolute top-[-4px] left-0 right-0 h-px bg-emerald-500/30" />
              <div className="flex size-7 items-center justify-center bg-emerald-500/10">
                <span className="font-mono text-[11px] font-bold text-emerald-400">
                  C
                </span>
              </div>
            </div>
            <span className="font-mono text-[13px] tracking-tight text-white/60 transition-colors duration-300 group-hover:text-white/90">
              costrace
            </span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white">How can we help?</h1>
          <p className="mt-4 text-lg text-white/60">
            Choose the best way to get in touch with our team
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2">
          {supportOptions.map((option) => {
            const Icon = option.icon;
            const isDisabled = option.href === "#";

            return (
              <a
                key={option.title}
                href={option.href}
                className={`group relative rounded-xs border border-white/[0.06] bg-white/[0.02] p-8 transition-all hover:border-emerald-500/30 hover:bg-white/[0.04] ${
                  isDisabled ? "pointer-events-none opacity-50" : ""
                }`}
                target={option.href.startsWith("http") ? "_blank" : undefined}
                rel={
                  option.href.startsWith("http")
                    ? "noopener noreferrer"
                    : undefined
                }
              >
                <div className="flex items-start gap-4">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 group-hover:bg-emerald-500/20">
                    <Icon
                      className="size-6 text-emerald-400"
                      strokeWidth={1.5}
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-xl font-semibold text-white">
                        {option.title}
                      </h3>
                      <span className="shrink-0 rounded-full bg-white/[0.06] px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-white/50">
                        {option.badge}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-white/60">
                      {option.description}
                    </p>

                    <p className="mt-4 text-sm font-medium text-emerald-400">
                      {option.action} →
                    </p>
                  </div>
                </div>
              </a>
            );
          })}
        </div>

        <div className="mt-20 rounded-xs border border-white/[0.06] bg-white/[0.02] p-8">
          <h2 className="text-2xl font-semibold text-white">
            Frequently Asked Questions
          </h2>

          <div className="mt-8 space-y-8">
            <div>
              <h3 className="text-lg font-medium text-white">
                How do I get started with Costrace?
              </h3>
              <p className="mt-2 text-white/70 leading-relaxed">
                Install the Costrace SDK using{" "}
                <code className="rounded bg-white/[0.06] px-2 py-1 font-mono text-sm text-emerald-400">
                  uv add costrace-sdk/pip install costrace-sdk
                </code>{" "}
                or{" "}
                <code className="rounded bg-white/[0.06] px-2 py-1 font-mono text-sm text-emerald-400">
                  npm install costrace/pnpm add costrace
                </code>
                , then initialize it in your code with your API key. Check our{" "}
                <a
                  href="https://docs.costrace.dev"
                  className="text-emerald-400 hover:text-emerald-300"
                >
                  documentation
                </a>{" "}
                for detailed setup instructions.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-white">
                Which LLM providers are supported?
              </h3>
              <p className="mt-2 text-white/70 leading-relaxed">
                Costrace supports all major LLM providers including OpenAI,
                Anthropic, Google (Gemini). We automatically detect and track
                costs across all providers.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-white">
                How does pricing work?
              </h3>
              <p className="mt-2 text-white/70 leading-relaxed">
                We offer a free tier with 50,000 traces per month and 7-day
                retention. Our Pro plan is $19/month and includes 500,000
                traces, 90-day retention, unlimited API keys, team features, and
                priority support.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-white">
                Can I cancel my subscription anytime?
              </h3>
              <p className="mt-2 text-white/70 leading-relaxed">
                Yes, you can cancel your subscription at any time from your
                billing page. You'll retain Pro features until the end of your
                current billing period. No refunds are provided for partial
                months.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-white">
                Is my data secure?
              </h3>
              <p className="mt-2 text-white/70 leading-relaxed">
                Yes. We encrypt all data in transit and at rest. API keys are
                securely stored and never exposed. We follow industry best
                practices for security and compliance. Read our{" "}
                <Link
                  href="/privacy"
                  className="text-emerald-400 hover:text-emerald-300"
                >
                  Privacy Policy
                </Link>{" "}
                for more details.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-white">
                Can I use Costrace for team collaboration?
              </h3>
              <p className="mt-2 text-white/70 leading-relaxed">
                Yes! Pro users can create teams, invite members, and collaborate
                on cost tracking. Each team gets shared dashboards, alerts, and
                analytics.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-white/60">
            Still have questions?{" "}
            <a
              href="mailto:support@costrace.dev"
              className="text-emerald-400 hover:text-emerald-300"
            >
              Email us at support@costrace.dev
            </a>
          </p>
        </div>
      </main>

      <footer className="border-t border-white/[0.06] py-8">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <p className="text-sm text-white/50">
            <Link href="/privacy" className="hover:text-white/70">
              Privacy Policy
            </Link>
            {" · "}
            <Link href="/terms" className="hover:text-white/70">
              Terms of Service
            </Link>
            {" · "}
            <Link href="/" className="hover:text-white/70">
              Home
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
