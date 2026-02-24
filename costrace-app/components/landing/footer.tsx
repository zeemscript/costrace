import Link from "next/link";

const columns = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "Changelog", href: "#" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "https://docs.costrace.dev" },
      { label: "GitHub", href: "https://github.com/ikotun-dev/costrace" },
      { label: "Support", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative pt-24 pb-12">
      {/* Top border with extending corners */}
      <div className="absolute top-0 left-1/2 w-full max-w-6xl -translate-x-1/2 px-6">
        <div className="relative">
          <span className="absolute top-0 left-0 right-0 h-px bg-white/[0.04]" />
          <span className="absolute left-0 top-[-8px] h-[17px] w-px bg-white/[0.04]" />
          <span className="absolute right-0 top-[-8px] h-[17px] w-px bg-white/[0.04]" />
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-2 gap-12 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          {/* Logo + tagline */}
          <div className="col-span-2 md:col-span-1">
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
            <p className="mt-4 max-w-[220px] text-[13px] leading-relaxed text-white/20">
              Track your LLM costs with confidence.
            </p>

            {/* Install hint */}
            <div className="mt-6 flex items-center gap-3">
              <span className="h-px w-6 bg-white/[0.06]" />
              <code className="font-mono text-[11px] text-white/10">
                uv add costrace
              </code>
            </div>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/25">
                {col.title}
              </h3>
              <ul className="mt-5 flex flex-col gap-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-[13px] text-white/20 transition-colors duration-300 hover:text-white/50"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar with extending corner */}
        <div className="relative mt-16 pt-6">
          <span className="absolute top-0 left-0 right-0 h-px bg-white/[0.04]" />
          <span className="absolute left-0 top-[-6px] h-[13px] w-px bg-white/[0.04]" />

          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <p className="font-mono text-[10px] uppercase tracking-wider text-white/10">
              &copy; {new Date().getFullYear()} costrace. All rights reserved.
            </p>

            <div className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-emerald-500/30" />
              <span className="font-mono text-[10px] text-white/10">
                all systems operational
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
