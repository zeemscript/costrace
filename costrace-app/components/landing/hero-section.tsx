import Image from "next/image";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-36 pb-24">
      {/* Faint grid background */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:64px_64px]" />

      {/* Centered emerald glow — very subtle */}
      <div className="pointer-events-none absolute top-0 left-1/2 h-[600px] w-[800px] -translate-x-1/2 bg-emerald-500/[0.04] blur-[120px]" />

      <div className="relative mx-auto max-w-6xl px-6">
        {/* Top section — badge + headline */}
        <div className="flex flex-col items-start">
          {/* Badge with full-width lines */}
          <div className="relative inline-flex items-center bg-emerald-500/10 px-4 py-1.5">
            <span className="absolute left-0 top-[-7px] bottom-[-7px] w-px bg-emerald-950" />
            <span className="absolute right-0 top-[-7px] bottom-[-7px] w-px bg-emerald-950" />
            {/*<span className="absolute top-0 left-[calc(-50vw+50%)] right-[calc(-50vw+50%)] h-px bg-emerald-950" />*/}
            {/*<span className="absolute bottom-0 left-[calc(-50vw+50%)] right-[calc(-50vw+50%)] h-px bg-emerald-950" />*/}

            <span className="relative font-mono text-[11px] uppercase tracking-wider text-emerald-400/80">
              Now tracking OpenAI, Anthropic &amp; Gemini
            </span>
          </div>

          {/* Headline — left aligned */}
          <h1 className="mt-8 max-w-3xl text-4xl font-medium leading-[1.1] tracking-tight text-white/90 sm:text-5xl md:text-6xl">
            Stop guessing
            <br />
            your LLM costs.
          </h1>

          {/* Subtext */}
          <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-white/30">
            Track every API call, monitor costs in real-time, and get alerts
            before your budget runs out. One line of code.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex items-center gap-6">
            {/* Primary CTA */}
            <div className="relative inline-block">
              <span className="absolute left-0 top-[-6px] bottom-[-6px] w-px bg-emerald-500/25" />
              <span className="absolute right-0 top-[-6px] bottom-[-6px] w-px bg-emerald-500/25" />
              <span className="absolute top-0 left-[-6px] right-[-6px] h-px bg-emerald-500/25" />
              <span className="absolute bottom-0 left-[-6px] right-[-6px] h-px bg-emerald-500/25" />

              <Link
                href="/auth"
                className="relative flex items-center gap-2 bg-emerald-500/15 px-7 py-3 font-mono text-[11px] uppercase tracking-wider text-emerald-400/80 transition-all duration-300 hover:bg-emerald-500/25 hover:text-emerald-400"
              >
                <span className="size-1.5 rounded-full bg-emerald-400/50" />
                Get Started Free
              </Link>
            </div>

            {/* Secondary CTA */}

            <a
              href="https://docs.costrace.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[11px] uppercase tracking-wider text-white/20 transition-colors duration-300 hover:text-white/50"
            >
              Read the docs →
            </a>
          </div>
        </div>

        {/* Install hint */}
        <div className="mt-16 flex items-center gap-4">
          <span className="h-px w-8 bg-white/[0.06]" />
          <code className="font-mono text-[12px] text-white/15">
            uv add costrace / npm install costrace
          </code>
        </div>

        {/* Dashboard screenshot */}
        <div className="relative mt-10 max-w-full">
          {/* Glow */}
          <div className="pointer-events-none absolute -inset-4 bg-gradient-to-b from-emerald-600/15 via-emerald-500/5 to-transparent blur-3xl" />

          {/* Frame with extending lines */}
          <div className="relative">
            <span className="absolute left-0 top-[-40px] bottom-[-40px] w-px bg-emerald-950" />
            <span className="absolute right-0 top-[-40px] bottom-[-40px] w-px bg-emerald-950" />
            <span className="absolute top-0 left-[-40px] right-[-40px] h-px bg-emerald-950" />
            <span className="absolute bottom-0 left-[-40px] right-[-40px] h-px bg-emerald-950" />

            {/* Corner markers — small crosses at intersections */}
            {/* Top-left */}
            <span className="absolute top-[-3px] left-[-3px] size-[7px] border border-emerald-500/20 bg-background" />
            {/* Top-right */}
            <span className="absolute top-[-3px] right-[-3px] size-[7px] border border-emerald-500/20 bg-background" />
            {/* Bottom-left */}
            <span className="absolute bottom-[-3px] left-[-3px] size-[7px] border border-emerald-500/20 bg-background" />
            {/* Bottom-right */}
            <span className="absolute bottom-[-3px] right-[-3px] size-[7px] border border-emerald-500/20 bg-background" />

            <div className="relative overflow-hidden border border-emerald-950">
              <Image
                src="/desktop-dashboard.png"
                alt="Costrace Dashboard"
                width={1900}
                height={1200}
                className="w-full"
                priority
              />
              <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
