import { AnimateOnScroll } from "./animate-on-scroll";
import { AnthropicLogo, GeminiLogo, OpenAILogo } from "./provider-logos";

const providers = [
  { name: "OpenAI", Logo: OpenAILogo },
  { name: "Anthropic", Logo: AnthropicLogo },
  { name: "Google Gemini", Logo: GeminiLogo },
];

export function ProvidersSection() {
  return (
    <section className="relative py-20">
      <AnimateOnScroll>
        <div className="mx-auto max-w-6xl px-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-emerald-500/70">
            {"// integrations"}
          </p>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-12 md:gap-0 md:divide-x md:divide-white/[0.06]">
            {providers.map(({ name, Logo }) => (
              <div
                key={name}
                className="group relative flex flex-col items-center gap-3 px-16 py-6"
              >
                <Logo className="size-6 text-white/50 transition-colors duration-500 group-hover:text-white/70" />
                <span className="font-mono text-[11px] uppercase tracking-wider text-white/50 transition-colors duration-500 group-hover:text-white/70">
                  {name}
                </span>

                {/* Hover tick — appears below on hover */}
                <span className="absolute bottom-0 left-1/2 h-0 w-px -translate-x-1/2 bg-emerald-500/40 transition-all duration-500 group-hover:h-3" />
              </div>
            ))}
          </div>

          {/* Bottom border with extending corners */}
          <div className="relative mt-4">
            <span className="absolute top-0 left-0 right-0 h-px bg-white/[0.04]" />
            <span className="absolute left-[calc(50%-200px)] top-[-8px] h-[17px] w-px bg-white/[0.04]" />
            <span className="absolute right-[calc(50%-200px)] top-[-8px] h-[17px] w-px bg-white/[0.04]" />
          </div>
        </div>
      </AnimateOnScroll>
    </section>
  );
}
