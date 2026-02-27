"use client";

const plans = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "",
    description: "For side projects and experimentation",
    cta: "Get Started",
    highlighted: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "$19",
    period: "/mo",
    description: "For teams shipping AI to production",
    cta: "Upgrade to Pro",
    highlighted: true,
  },
];

const features = [
  {
    name: "Traces per month",
    values: { free: "50,000", pro: "500,000" },
  },
  {
    name: "Data retention",
    values: { free: "7 days", pro: "90 days" },
  },
  {
    name: "API keys",
    values: { free: "1", pro: "Unlimited" },
  },
  {
    name: "Budget alerts",
    values: { free: "1", pro: "Unlimited" },
  },
  {
    name: "Alert channels",
    values: { free: "Email only", pro: "Email + Slack + Webhooks" },
  },
  {
    name: "Providers tracked",
    values: {
      free: "OpenAI, Anthropic, Gemini",
      pro: "OpenAI, Anthropic, Gemini",
    },
  },
  {
    name: "Cost breakdown by model",
    values: { free: "✅", pro: "✅" },
  },
  {
    name: "Geographic distribution",
    values: { free: "✅", pro: "✅" },
  },
  {
    name: "Team members",
    values: { free: "❌", pro: "Unlimited" },
  },
  {
    name: "Priority support",
    values: { free: "❌", pro: "✅" },
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="relative py-32">
      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="max-w-xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-emerald-500/70">
            {"// pricing"}
          </p>
          <h2 className="mt-4 text-2xl font-medium tracking-tight text-white/90 sm:text-3xl">
            Start free. Scale when ready.
          </h2>
        </div>

        {/* Table */}
        <div className="relative mt-16">
          {/* Extending border lines */}
          <span className="absolute left-0 top-[-12px] h-[calc(100%+24px)] w-px bg-white/[0.04]" />
          <span className="absolute right-0 top-[-12px] h-[calc(100%+24px)] w-px bg-white/[0.04]" />
          <span className="absolute top-0 left-[-12px] w-[calc(100%+24px)] h-px bg-white/[0.04]" />
          <span className="absolute bottom-0 left-[-12px] w-[calc(100%+24px)] h-px bg-white/[0.04]" />

          <div className="relative bg-white/[0.01]">
            {/* Plan headers */}
            <div
              className="grid border-b border-white/[0.04]"
              style={{
                gridTemplateColumns: `1.4fr ${plans.map(() => "1fr").join(" ")}`,
              }}
            >
              {/* Empty top-left cell */}
              <div className="p-6" />

              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative p-6 text-center ${
                    plan.highlighted ? "bg-emerald-500/[0.03]" : ""
                  }`}
                >
                  {/* Highlighted column indicator */}
                  {plan.highlighted && (
                    <span className="absolute top-0 left-0 right-0 h-px bg-emerald-500/30" />
                  )}

                  <p className="font-mono text-[10px] uppercase tracking-wider text-white/50">
                    {plan.name}
                  </p>
                  <div className="mt-2 flex items-baseline justify-center gap-0.5">
                    <span className="text-2xl font-medium tracking-tight text-white/80">
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="font-mono text-[11px] text-white/50">
                        {plan.period}
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 text-[11px] text-white/50">
                    {plan.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Feature rows */}
            {features.map((feature, i) => (
              <div
                key={feature.name}
                className="group grid border-b border-white/[0.03] transition-colors duration-300 hover:bg-white/[0.01]"
                style={{
                  gridTemplateColumns: `1.4fr ${plans.map(() => "1fr").join(" ")}`,
                }}
              >
                {/* Feature name */}
                <div className="flex items-center p-5">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[10px] text-white/30">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-[13px] text-white/60 transition-colors duration-300 group-hover:text-white/80">
                      {feature.name}
                    </span>
                  </div>
                </div>

                {/* Values for each plan */}
                {plans.map((plan) => {
                  const value =
                    feature.values[plan.id as keyof typeof feature.values];
                  const isDisabled = value === "—";
                  const isComingSoon = value === "Coming soon";

                  return (
                    <div
                      key={plan.id}
                      className={`flex items-center justify-center p-5 ${
                        plan.highlighted ? "bg-emerald-500/[0.02]" : ""
                      }`}
                    >
                      <span
                        className={`font-mono text-[12px] transition-colors duration-300 ${
                          isDisabled
                            ? "text-white/30"
                            : isComingSoon
                              ? "text-white/40 italic"
                              : plan.highlighted
                                ? "text-emerald-400/70 group-hover:text-emerald-400/90"
                                : "text-white/50 group-hover:text-white/70"
                        }`}
                      >
                        {value}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}

            {/* CTA row */}
            <div
              className="grid"
              style={{
                gridTemplateColumns: `1.4fr ${plans.map(() => "1fr").join(" ")}`,
              }}
            >
              <div className="p-6" />
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`flex items-center justify-center p-6 ${
                    plan.highlighted ? "bg-emerald-500/[0.02]" : ""
                  }`}
                >
                  {/* Button with extending lines */}
                  <div className="relative inline-block">
                    <span className="absolute left-0 top-[-5px] bottom-[-5px] w-px bg-white/[0.06]" />
                    <span className="absolute right-0 top-[-5px] bottom-[-5px] w-px bg-white/[0.06]" />
                    <span className="absolute top-0 left-[-5px] right-[-5px] h-px bg-white/[0.06]" />
                    <span className="absolute bottom-0 left-[-5px] right-[-5px] h-px bg-white/[0.06]" />

                    <button
                      className={`relative cursor-pointer px-6 py-2.5 font-mono text-[11px] uppercase tracking-wider transition-all duration-300 ${
                        plan.highlighted
                          ? "bg-emerald-500/10 text-emerald-400/70 hover:bg-emerald-500/20 hover:text-emerald-400"
                          : "bg-white/[0.02] text-white/50 hover:bg-white/[0.04] hover:text-white/70"
                      }`}
                    >
                      {plan.cta}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
