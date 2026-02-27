"use client";

import { useState } from "react";

const languages = ["Python", "Node.js"] as const;
const providers = ["OpenAI", "Anthropic", "Gemini"] as const;
type Lang = (typeof languages)[number];
type Provider = (typeof providers)[number];

const codeSnippets: Record<Lang, Record<Provider, React.ReactNode>> = {
  Python: {
    OpenAI: (
      <>
        <span className="text-violet-400">import</span>{" "}
        <span className="text-white">costrace</span>
        {"\n"}
        <span className="text-violet-400">from</span>{" "}
        <span className="text-white">openai</span>{" "}
        <span className="text-violet-400">import</span>{" "}
        <span className="text-white">OpenAI</span>
        {"\n\n"}
        <span className="text-white">costrace</span>
        <span className="text-zinc-400">.</span>
        <span className="text-blue-400">init</span>
        <span className="text-zinc-400">(</span>
        <span className="text-white">api_key</span>
        <span className="text-zinc-400">=</span>
        <span className="text-emerald-400">&quot;ct_your_api_key&quot;</span>
        <span className="text-zinc-400">)</span>
        {"\n\n"}
        <span className="text-zinc-500">
          # Use OpenAI as you normally would
        </span>
        {"\n"}
        <span className="text-white">client</span>
        <span className="text-zinc-400"> = </span>
        <span className="text-blue-400">OpenAI</span>
        <span className="text-zinc-400">()</span>
        {"\n"}
        <span className="text-white">response</span>
        <span className="text-zinc-400"> = </span>
        <span className="text-white">client</span>
        <span className="text-zinc-400">.</span>
        <span className="text-white">chat</span>
        <span className="text-zinc-400">.</span>
        <span className="text-white">completions</span>
        <span className="text-zinc-400">.</span>
        <span className="text-blue-400">create</span>
        <span className="text-zinc-400">(</span>
        {"\n"}
        <span className="text-white">{"    "}model</span>
        <span className="text-zinc-400">=</span>
        <span className="text-emerald-400">&quot;gpt-4o&quot;</span>
        <span className="text-zinc-400">,</span>
        {"\n"}
        <span className="text-white">{"    "}messages</span>
        <span className="text-zinc-400">=</span>
        <span className="text-zinc-400">[{"{"}</span>
        <span className="text-emerald-400">&quot;role&quot;</span>
        <span className="text-zinc-400">: </span>
        <span className="text-emerald-400">&quot;user&quot;</span>
        <span className="text-zinc-400">, </span>
        <span className="text-emerald-400">&quot;content&quot;</span>
        <span className="text-zinc-400">: </span>
        <span className="text-emerald-400">&quot;Hello!&quot;</span>
        <span className="text-zinc-400">{"}"}]</span>
        {"\n"}
        <span className="text-zinc-400">)</span>
        {"\n\n"}
        <span className="text-zinc-500">
          # Cost, latency, and tokens tracked automatically
        </span>
      </>
    ),
    Anthropic: (
      <>
        <span className="text-violet-400">import</span>{" "}
        <span className="text-white">costrace</span>
        {"\n"}
        <span className="text-violet-400">from</span>{" "}
        <span className="text-white">anthropic</span>{" "}
        <span className="text-violet-400">import</span>{" "}
        <span className="text-white">Anthropic</span>
        {"\n\n"}
        <span className="text-white">costrace</span>
        <span className="text-zinc-400">.</span>
        <span className="text-blue-400">init</span>
        <span className="text-zinc-400">(</span>
        <span className="text-white">api_key</span>
        <span className="text-zinc-400">=</span>
        <span className="text-emerald-400">&quot;ct_your_api_key&quot;</span>
        <span className="text-zinc-400">)</span>
        {"\n\n"}
        <span className="text-zinc-500">
          # Use Anthropic as you normally would
        </span>
        {"\n"}
        <span className="text-white">client</span>
        <span className="text-zinc-400"> = </span>
        <span className="text-blue-400">Anthropic</span>
        <span className="text-zinc-400">()</span>
        {"\n"}
        <span className="text-white">message</span>
        <span className="text-zinc-400"> = </span>
        <span className="text-white">client</span>
        <span className="text-zinc-400">.</span>
        <span className="text-white">messages</span>
        <span className="text-zinc-400">.</span>
        <span className="text-blue-400">create</span>
        <span className="text-zinc-400">(</span>
        {"\n"}
        <span className="text-white">{"    "}model</span>
        <span className="text-zinc-400">=</span>
        <span className="text-emerald-400">
          &quot;claude-sonnet-4-20250514&quot;
        </span>
        <span className="text-zinc-400">,</span>
        {"\n"}
        <span className="text-white">{"    "}max_tokens</span>
        <span className="text-zinc-400">=</span>
        <span className="text-orange-300">1024</span>
        <span className="text-zinc-400">,</span>
        {"\n"}
        <span className="text-white">{"    "}messages</span>
        <span className="text-zinc-400">=</span>
        <span className="text-zinc-400">[{"{"}</span>
        <span className="text-emerald-400">&quot;role&quot;</span>
        <span className="text-zinc-400">: </span>
        <span className="text-emerald-400">&quot;user&quot;</span>
        <span className="text-zinc-400">, </span>
        <span className="text-emerald-400">&quot;content&quot;</span>
        <span className="text-zinc-400">: </span>
        <span className="text-emerald-400">&quot;Hello!&quot;</span>
        <span className="text-zinc-400">{"}"}]</span>
        {"\n"}
        <span className="text-zinc-400">)</span>
        {"\n\n"}
        <span className="text-zinc-500">
          # Cost, latency, and tokens tracked automatically
        </span>
      </>
    ),
    Gemini: (
      <>
        <span className="text-violet-400">import</span>{" "}
        <span className="text-white">costrace</span>
        {"\n"}
        <span className="text-violet-400">from</span>{" "}
        <span className="text-white">google</span>
        <span className="text-zinc-400">.</span>
        <span className="text-white">genai</span>{" "}
        <span className="text-violet-400">import</span>{" "}
        <span className="text-white">Client</span>
        {"\n\n"}
        <span className="text-white">costrace</span>
        <span className="text-zinc-400">.</span>
        <span className="text-blue-400">init</span>
        <span className="text-zinc-400">(</span>
        <span className="text-white">api_key</span>
        <span className="text-zinc-400">=</span>
        <span className="text-emerald-400">&quot;ct_your_api_key&quot;</span>
        <span className="text-zinc-400">)</span>
        {"\n\n"}
        <span className="text-zinc-500">
          # Use Gemini as you normally would
        </span>
        {"\n"}
        <span className="text-white">client</span>
        <span className="text-zinc-400"> = </span>
        <span className="text-blue-400">Client</span>
        <span className="text-zinc-400">()</span>
        {"\n"}
        <span className="text-white">response</span>
        <span className="text-zinc-400"> = </span>
        <span className="text-white">client</span>
        <span className="text-zinc-400">.</span>
        <span className="text-white">models</span>
        <span className="text-zinc-400">.</span>
        <span className="text-blue-400">generate_content</span>
        <span className="text-zinc-400">(</span>
        {"\n"}
        <span className="text-white">{"    "}model</span>
        <span className="text-zinc-400">=</span>
        <span className="text-emerald-400">&quot;gemini-2.0-flash&quot;</span>
        <span className="text-zinc-400">,</span>
        {"\n"}
        <span className="text-white">{"    "}contents</span>
        <span className="text-zinc-400">=</span>
        <span className="text-emerald-400">&quot;Hello!&quot;</span>
        {"\n"}
        <span className="text-zinc-400">)</span>
        {"\n\n"}
        <span className="text-zinc-500">
          # Cost, latency, and tokens tracked automatically
        </span>
      </>
    ),
  },
  "Node.js": {
    OpenAI: (
      <>
        <span className="text-violet-400">import</span>{" "}
        <span className="text-zinc-400">* </span>
        <span className="text-violet-400">as</span>{" "}
        <span className="text-white">costrace</span>{" "}
        <span className="text-violet-400">from</span>{" "}
        <span className="text-emerald-400">&quot;costrace&quot;</span>
        <span className="text-zinc-400">;</span>
        {"\n"}
        <span className="text-violet-400">import</span>{" "}
        <span className="text-white">OpenAI</span>{" "}
        <span className="text-violet-400">from</span>{" "}
        <span className="text-emerald-400">&quot;openai&quot;</span>
        <span className="text-zinc-400">;</span>
        {"\n\n"}
        <span className="text-white">costrace</span>
        <span className="text-zinc-400">.</span>
        <span className="text-blue-400">init</span>
        <span className="text-zinc-400">(</span>
        <span className="text-emerald-400">&quot;ct_your_api_key&quot;</span>
        <span className="text-zinc-400">);</span>
        {"\n\n"}
        <span className="text-zinc-500">
          {"// "}Use OpenAI as you normally would
        </span>
        {"\n"}
        <span className="text-violet-400">const</span>{" "}
        <span className="text-white">client</span>
        <span className="text-zinc-400"> = </span>
        <span className="text-violet-400">new</span>{" "}
        <span className="text-blue-400">OpenAI</span>
        <span className="text-zinc-400">();</span>
        {"\n"}
        <span className="text-violet-400">const</span>{" "}
        <span className="text-white">response</span>
        <span className="text-zinc-400"> = </span>
        <span className="text-violet-400">await</span>{" "}
        <span className="text-white">client</span>
        <span className="text-zinc-400">.</span>
        <span className="text-white">chat</span>
        <span className="text-zinc-400">.</span>
        <span className="text-white">completions</span>
        <span className="text-zinc-400">.</span>
        <span className="text-blue-400">create</span>
        <span className="text-zinc-400">({"{"}</span>
        {"\n"}
        <span className="text-white">{"    "}model</span>
        <span className="text-zinc-400">: </span>
        <span className="text-emerald-400">&quot;gpt-4o&quot;</span>
        <span className="text-zinc-400">,</span>
        {"\n"}
        <span className="text-white">{"    "}messages</span>
        <span className="text-zinc-400">: [{"{"} </span>
        <span className="text-white">role</span>
        <span className="text-zinc-400">: </span>
        <span className="text-emerald-400">&quot;user&quot;</span>
        <span className="text-zinc-400">, </span>
        <span className="text-white">content</span>
        <span className="text-zinc-400">: </span>
        <span className="text-emerald-400">&quot;Hello!&quot;</span>
        <span className="text-zinc-400"> {"}"}]</span>
        {"\n"}
        <span className="text-zinc-400">{"})"}</span>
        <span className="text-zinc-400">;</span>
        {"\n\n"}
        <span className="text-zinc-500">
          {"// "}Cost, latency, and tokens tracked automatically
        </span>
      </>
    ),
    Anthropic: (
      <>
        <span className="text-violet-400">import</span>{" "}
        <span className="text-zinc-400">* </span>
        <span className="text-violet-400">as</span>{" "}
        <span className="text-white">costrace</span>{" "}
        <span className="text-violet-400">from</span>{" "}
        <span className="text-emerald-400">&quot;costrace&quot;</span>
        <span className="text-zinc-400">;</span>
        {"\n"}
        <span className="text-violet-400">import</span>{" "}
        <span className="text-white">Anthropic</span>{" "}
        <span className="text-violet-400">from</span>{" "}
        <span className="text-emerald-400">&quot;@anthropic-ai/sdk&quot;</span>
        <span className="text-zinc-400">;</span>
        {"\n\n"}
        <span className="text-white">costrace</span>
        <span className="text-zinc-400">.</span>
        <span className="text-blue-400">init</span>
        <span className="text-zinc-400">(</span>
        <span className="text-emerald-400">&quot;ct_your_api_key&quot;</span>
        <span className="text-zinc-400">);</span>
        {"\n\n"}
        <span className="text-zinc-500">
          {"// "}Use Anthropic as you normally would
        </span>
        {"\n"}
        <span className="text-violet-400">const</span>{" "}
        <span className="text-white">client</span>
        <span className="text-zinc-400"> = </span>
        <span className="text-violet-400">new</span>{" "}
        <span className="text-blue-400">Anthropic</span>
        <span className="text-zinc-400">();</span>
        {"\n"}
        <span className="text-violet-400">const</span>{" "}
        <span className="text-white">message</span>
        <span className="text-zinc-400"> = </span>
        <span className="text-violet-400">await</span>{" "}
        <span className="text-white">client</span>
        <span className="text-zinc-400">.</span>
        <span className="text-white">messages</span>
        <span className="text-zinc-400">.</span>
        <span className="text-blue-400">create</span>
        <span className="text-zinc-400">({"{"}</span>
        {"\n"}
        <span className="text-white">{"    "}model</span>
        <span className="text-zinc-400">: </span>
        <span className="text-emerald-400">
          &quot;claude-sonnet-4-20250514&quot;
        </span>
        <span className="text-zinc-400">,</span>
        {"\n"}
        <span className="text-white">{"    "}max_tokens</span>
        <span className="text-zinc-400">: </span>
        <span className="text-orange-300">1024</span>
        <span className="text-zinc-400">,</span>
        {"\n"}
        <span className="text-white">{"    "}messages</span>
        <span className="text-zinc-400">: [{"{"} </span>
        <span className="text-white">role</span>
        <span className="text-zinc-400">: </span>
        <span className="text-emerald-400">&quot;user&quot;</span>
        <span className="text-zinc-400">, </span>
        <span className="text-white">content</span>
        <span className="text-zinc-400">: </span>
        <span className="text-emerald-400">&quot;Hello!&quot;</span>
        <span className="text-zinc-400"> {"}"}]</span>
        {"\n"}
        <span className="text-zinc-400">{"})"}</span>
        <span className="text-zinc-400">;</span>
        {"\n\n"}
        <span className="text-zinc-500">
          {"// "}Cost, latency, and tokens tracked automatically
        </span>
      </>
    ),
    Gemini: (
      <>
        <span className="text-violet-400">import</span>{" "}
        <span className="text-zinc-400">* </span>
        <span className="text-violet-400">as</span>{" "}
        <span className="text-white">costrace</span>{" "}
        <span className="text-violet-400">from</span>{" "}
        <span className="text-emerald-400">&quot;costrace&quot;</span>
        <span className="text-zinc-400">;</span>
        {"\n"}
        <span className="text-violet-400">import</span>{" "}
        <span className="text-zinc-400">{"{ "}</span>
        <span className="text-white">GoogleGenAI</span>
        <span className="text-zinc-400">{" }"}</span>{" "}
        <span className="text-violet-400">from</span>{" "}
        <span className="text-emerald-400">&quot;@google/genai&quot;</span>
        <span className="text-zinc-400">;</span>
        {"\n\n"}
        <span className="text-white">costrace</span>
        <span className="text-zinc-400">.</span>
        <span className="text-blue-400">init</span>
        <span className="text-zinc-400">(</span>
        <span className="text-emerald-400">&quot;ct_your_api_key&quot;</span>
        <span className="text-zinc-400">);</span>
        {"\n\n"}
        <span className="text-zinc-500">
          {"// "}Use Gemini as you normally would
        </span>
        {"\n"}
        <span className="text-violet-400">const</span>{" "}
        <span className="text-white">ai</span>
        <span className="text-zinc-400"> = </span>
        <span className="text-violet-400">new</span>{" "}
        <span className="text-blue-400">GoogleGenAI</span>
        <span className="text-zinc-400">({"{"} </span>
        <span className="text-white">apiKey</span>
        <span className="text-zinc-400">: </span>
        <span className="text-white">process</span>
        <span className="text-zinc-400">.</span>
        <span className="text-white">env</span>
        <span className="text-zinc-400">.</span>
        <span className="text-white">GEMINI_API_KEY</span>
        <span className="text-zinc-400"> {"}"});</span>
        {"\n"}
        <span className="text-violet-400">const</span>{" "}
        <span className="text-white">response</span>
        <span className="text-zinc-400"> = </span>
        <span className="text-violet-400">await</span>{" "}
        <span className="text-white">ai</span>
        <span className="text-zinc-400">.</span>
        <span className="text-white">models</span>
        <span className="text-zinc-400">.</span>
        <span className="text-blue-400">generateContent</span>
        <span className="text-zinc-400">({"{"}</span>
        {"\n"}
        <span className="text-white">{"    "}model</span>
        <span className="text-zinc-400">: </span>
        <span className="text-emerald-400">&quot;gemini-2.0-flash&quot;</span>
        <span className="text-zinc-400">,</span>
        {"\n"}
        <span className="text-white">{"    "}contents</span>
        <span className="text-zinc-400">: </span>
        <span className="text-emerald-400">&quot;Hello!&quot;</span>
        {"\n"}
        <span className="text-zinc-400">{"})"}</span>
        <span className="text-zinc-400">;</span>
        {"\n\n"}
        <span className="text-zinc-500">
          {"// "}Cost, latency, and tokens tracked automatically
        </span>
      </>
    ),
  },
};

export function SdkShowcaseSection() {
  const [activeLang, setActiveLang] = useState<Lang>("Python");
  const [activeProvider, setActiveProvider] = useState<Provider>("OpenAI");

  return (
    <section className="relative py-32">
      <div className="mx-auto max-w-6xl px-6">
        {/* Header — left-aligned */}
        <div className="max-w-xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-emerald-500/70">
            {"// integration"}
          </p>
          <h2 className="mt-4 text-2xl font-medium tracking-tight text-white/90 sm:text-3xl">
            One line. Every provider.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-white/60">
            Add Costrace to your project and every LLM API call is tracked
            automatically. No wrappers, no config files.
          </p>
        </div>

        {/* Code block with extending-line border */}
        <div className="relative mt-16">
          {/* Extending border lines */}
          <span className="absolute left-0 top-[-10px] h-[calc(100%+20px)] w-px bg-white/[0.04]" />
          <span className="absolute right-0 top-[-10px] h-[calc(100%+20px)] w-px bg-white/[0.04]" />
          <span className="absolute top-0 left-[-10px] w-[calc(100%+20px)] h-px bg-white/[0.04]" />
          <span className="absolute bottom-0 left-[-10px] w-[calc(100%+20px)] h-px bg-white/[0.04]" />

          <div className="relative bg-white/[0.01]">
            {/* Tab bar */}
            <div className="flex items-center justify-between border-b border-white/[0.04]">
              {/* Language tabs */}
              <div className="flex">
                {languages.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setActiveLang(lang)}
                    className={`relative cursor-pointer px-5 py-3.5 font-mono text-[11px] uppercase tracking-wider transition-colors duration-300 ${
                      activeLang === lang
                        ? "text-white/80"
                        : "text-white/50 hover:text-white/70"
                    }`}
                  >
                    {lang}
                    {activeLang === lang && (
                      <span className="absolute bottom-0 left-0 right-0 h-px bg-emerald-500/50" />
                    )}
                  </button>
                ))}
              </div>

              {/* Provider tabs */}
              <div className="flex gap-1 pr-3">
                {providers.map((provider) => (
                  <button
                    key={provider}
                    onClick={() => setActiveProvider(provider)}
                    className={`cursor-pointer px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-all duration-300 ${
                      activeProvider === provider
                        ? "bg-emerald-500/10 text-emerald-400/70"
                        : "text-white/40 hover:text-white/60"
                    }`}
                  >
                    {provider}
                  </button>
                ))}
              </div>
            </div>

            {/* Code area */}
            <pre className="overflow-x-auto p-6 font-mono text-[13px] leading-relaxed">
              <code>{codeSnippets[activeLang][activeProvider]}</code>
            </pre>

            {/* Bottom status bar */}
            <div className="flex items-center justify-between border-t border-white/[0.04] px-5 py-2.5">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-emerald-500/50" />
                  <span className="font-mono text-[10px] text-white/50">
                    auto-instrumented
                  </span>
                </span>
                <span className="font-mono text-[10px] text-white/30">
                  cost · latency · tokens
                </span>
              </div>
              <span className="font-mono text-[10px] text-white/30">
                {activeLang === "Python" ? "python" : "typescript"} ·{" "}
                {activeProvider.toLowerCase()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
