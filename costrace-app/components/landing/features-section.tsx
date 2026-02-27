import { Activity, DollarSign, Globe } from "lucide-react";
import { AnimateOnScroll } from "./animate-on-scroll";

const features = [
  {
    icon: DollarSign,
    title: "Real-time Cost Tracking",
    description:
      "Track every API call across OpenAI, Anthropic, and Gemini. See costs broken down by model, team, and project with zero configuration.",
    metric: "$12.4K",
    metricLabel: "tracked this month",
  },
  {
    icon: Activity,
    title: "Latency Monitoring",
    description:
      "Monitor response times across all your LLM providers. Identify slow endpoints and optimize your AI pipeline performance.",
    metric: "142ms",
    metricLabel: "avg response time",
  },
  {
    icon: Globe,
    title: "Geographic Insights",
    description:
      "See where your API calls originate. Understand geographic distribution patterns and optimize for latency and compliance.",
    metric: "14",
    metricLabel: "regions tracked",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="relative py-32">
      {/* Full-width faint horizontal line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-white/[0.04]" />

      <AnimateOnScroll>
        <div className="mx-auto max-w-6xl px-6">
          {/* Header — left-aligned, not centered */}
          <div className="max-w-xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-emerald-500/70">
              {"// features"}
            </p>
            <h2 className="mt-4 text-2xl font-medium tracking-tight text-white/90 sm:text-3xl">
              Everything you need to
              <br />
              control LLM costs
            </h2>
          </div>

          {/* Features — stacked rows, not cards */}
          <div className="mt-20 space-y-0">
            {features.map((feature, i) => (
              <div key={feature.title} className="group relative">
                {/* Top border line with corner extensions */}
                <div className="relative">
                  <span className="absolute top-0 left-0 right-0 h-px bg-white/[0.06] transition-colors duration-500 group-hover:bg-emerald-500/20" />
                  {/* Left corner tick */}
                  <span className="absolute left-0 top-[-8px] h-[17px] w-px bg-white/[0.06] transition-colors duration-500 group-hover:bg-emerald-500/20" />
                </div>

                <div className="grid grid-cols-1 gap-8 py-10 md:grid-cols-[auto_1fr_auto] md:items-center md:gap-16">
                  {/* Left: number + icon */}
                  <div className="flex items-center gap-5">
                    <span className="font-mono text-[11px] text-white/50">
                      0{i + 1}
                    </span>
                    <div className="flex size-10 items-center justify-center border border-white/[0.08] bg-white/[0.03] transition-colors duration-500 group-hover:border-emerald-500/20 group-hover:bg-emerald-500/5">
                      <feature.icon className="size-4 text-white/60 transition-colors duration-500 group-hover:text-emerald-400" />
                    </div>
                  </div>

                  {/* Middle: text */}
                  <div>
                    <h3 className="text-[15px] font-medium text-white/90 transition-colors duration-500 group-hover:text-white">
                      {feature.title}
                    </h3>
                    <p className="mt-1.5 max-w-lg text-sm leading-relaxed text-white/70 transition-colors duration-500 group-hover:text-white/80">
                      {feature.description}
                    </p>
                  </div>

                  {/* Right: metric */}
                  <div className="text-right">
                    <p className="font-mono text-2xl font-light tracking-tight text-white/60 transition-colors duration-500 group-hover:text-emerald-400/80">
                      {feature.metric}
                    </p>
                    <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-white/50 transition-colors duration-500 group-hover:text-white/70">
                      {feature.metricLabel}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* Bottom border of last item */}
            <div className="relative">
              <span className="absolute top-0 left-0 right-0 h-px bg-white/[0.06]" />
              <span className="absolute left-0 top-[-8px] h-[17px] w-px bg-white/[0.06]" />
            </div>
          </div>
        </div>
      </AnimateOnScroll>
    </section>
  );
}
