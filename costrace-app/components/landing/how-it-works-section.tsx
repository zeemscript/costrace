import { AnimateOnScroll } from "./animate-on-scroll";

const steps = [
  {
    number: "01",
    title: "Install the SDK",
    description:
      "Add Costrace to your project with a single command. (This sample is for the python sdk)",
    code: "uv add costrace-sdk",
    lang: "bash",
  },
  {
    number: "02",
    title: "Initialize with one line",
    description: "Pass your API key and you're ready to go.",
    code: 'costrace.init(api_key="ct_...")',
    lang: "python",
  },
  {
    number: "03",
    title: "View your dashboard",
    description:
      "Traces appear automatically as you call OpenAI, Anthropic, or Gemini.",
    code: "# That's it. No other config.",
    lang: "python",
  },
];

export function HowItWorksSection() {
  return (
    <section className="relative py-32">
      <AnimateOnScroll>
        <div className="mx-auto max-w-6xl px-6">
          {/* Header — left-aligned, consistent with features */}
          <div className="max-w-xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-emerald-500/70">
              {"// setup"}
            </p>
            <h2 className="mt-4 text-2xl font-medium tracking-tight text-white/90 sm:text-3xl">
              Two lines of code.
              <br />
              That&apos;s the entire setup.
            </h2>
          </div>

          {/* Steps — vertical timeline layout */}
          <div className="relative mt-20">
            {/* Vertical connecting line */}
            {/*<span className="absolute left-[15px] top-0 bottom-0 w-px bg-white/[0.06] md:left-[19px]" />*/}

            <div className="space-y-12">
              {steps.map((step) => (
                <div
                  key={step.number}
                  className="group relative grid grid-cols-1 gap-6 md:grid-cols-[200px_1fr] md:gap-12"
                >
                  {/* Left: number + title */}
                  <div className="flex items-start gap-4 md:flex-col md:gap-2">
                    {/* Number dot on the line */}
                    <div className="relative z-10 flex size-[31px] shrink-0 items-center justify-center border border-white/[0.08] bg-zinc-950 font-mono text-[10px] text-white/60 transition-colors duration-500 group-hover:border-emerald-500/20 group-hover:text-emerald-400/80 md:size-[39px] md:text-[11px]">
                      {step.number}
                    </div>
                    <div>
                      <h3 className="text-[15px] font-medium text-white/80 transition-colors duration-500 group-hover:text-white">
                        {step.title}
                      </h3>
                      <p className="mt-1 text-sm text-white/60 transition-colors duration-500 group-hover:text-white/80">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Right: code block */}
                  <div className="relative ml-0 md:ml-0">
                    {/* Corner ticks */}
                    <span className="absolute left-0 top-[-6px] h-[calc(100%+12px)] w-px bg-white/[0.06] transition-colors duration-500 group-hover:bg-emerald-500/15" />
                    <span className="absolute right-0 top-[-6px] h-[calc(100%+12px)] w-px bg-white/[0.06] transition-colors duration-500 group-hover:bg-emerald-500/15" />
                    <span className="absolute top-0 left-[-6px] w-[calc(100%+12px)] h-px bg-white/[0.06] transition-colors duration-500 group-hover:bg-emerald-500/15" />
                    <span className="absolute bottom-0 left-[-6px] w-[calc(100%+12px)] h-px bg-white/[0.06] transition-colors duration-500 group-hover:bg-emerald-500/15" />

                    <div className="flex items-center justify-between gap-3 overflow-x-auto bg-white/[0.02] px-4 py-4 sm:px-5">
                      <code className="whitespace-nowrap font-mono text-[13px] text-white/60 transition-colors duration-500 group-hover:text-emerald-400/90">
                        {step.code}
                      </code>
                      <span className="shrink-0 font-mono text-[9px] uppercase tracking-wider text-white/50">
                        {step.lang}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AnimateOnScroll>
    </section>
  );
}
