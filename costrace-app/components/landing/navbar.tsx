"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Docs", href: "https://docs.costrace.dev" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-500 ${
        scrolled ? "bg-background/60 backdrop-blur-xl" : "bg-transparent"
      }`}
    >
      {/* Full-width bottom line */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-px transition-colors duration-500 ${
          scrolled ? "bg-white/[0.06]" : "bg-transparent"
        }`}
      />

      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-3">
          {/* Logo mark with extending lines */}
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

        {/* Desktop nav — separated by faint dots */}
        <nav className="hidden items-center md:flex">
          {navLinks.map((link, i) => (
            <div key={link.label} className="flex items-center">
              {i > 0 && (
                <span className="mx-5 size-[3px] rounded-full bg-white/[0.08]" />
              )}
              <a
                href={link.href}
                className="font-mono text-[11px] uppercase tracking-wider text-white/50 transition-colors duration-300 hover:text-white/70"
              >
                {link.label}
              </a>
            </div>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-5 md:flex">
          <Link
            href="/auth"
            className="font-mono text-[11px] uppercase tracking-wider text-white/50 transition-colors duration-300 hover:text-white/70"
          >
            Sign in
          </Link>

          {/* Get Started button with extending lines */}
          <div className="relative inline-block">
            <span className="absolute left-0 top-[-5px] bottom-[-5px] w-px bg-emerald-500/25" />
            <span className="absolute right-0 top-[-5px] bottom-[-5px] w-px bg-emerald-500/25" />
            <span className="absolute top-0 left-[-5px] right-[-5px] h-px bg-emerald-500/25" />
            <span className="absolute bottom-0 left-[-5px] right-[-5px] h-px bg-emerald-500/25" />

            <Link
              href="/auth"
              className="relative flex items-center gap-2 bg-emerald-500/10 px-5 py-2 font-mono text-[11px] uppercase tracking-wider text-emerald-400/70 transition-all duration-300 hover:bg-emerald-500/15 hover:text-emerald-400"
            >
              <span className="size-1 rounded-full bg-emerald-400/50" />
              Get Started
            </Link>
          </div>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-white/30 transition-colors hover:text-white/60 md:hidden"
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-white/[0.04] bg-background/95 backdrop-blur-xl md:hidden">
          <div className="mx-auto max-w-6xl px-6 py-5">
            <div className="flex flex-col gap-1">
              {navLinks.map((link, i) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="group flex items-center gap-3 py-3"
                >
                  <span className="font-mono text-[10px] text-white/30">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-mono text-[12px] uppercase tracking-wider text-white/50 transition-colors group-hover:text-white/70">
                    {link.label}
                  </span>
                </a>
              ))}
            </div>

            <div className="relative my-4">
              <span className="absolute top-0 left-0 right-0 h-px bg-white/[0.04]" />
              <span className="absolute left-0 top-[-6px] h-[13px] w-px bg-white/[0.04]" />
            </div>

            {/* Mobile CTA */}
            <div className="relative">
              <span className="absolute left-0 top-[-5px] bottom-[-5px] w-px bg-emerald-500/20" />
              <span className="absolute right-0 top-[-5px] bottom-[-5px] w-px bg-emerald-500/20" />
              <span className="absolute top-0 left-[-5px] right-[-5px] h-px bg-emerald-500/20" />
              <span className="absolute bottom-0 left-[-5px] right-[-5px] h-px bg-emerald-500/20" />

              <Link
                href="/auth"
                onClick={() => setMobileOpen(false)}
                className="flex w-full items-center justify-center gap-2 bg-emerald-500/10 py-3 font-mono text-[11px] uppercase tracking-wider text-emerald-400/70"
              >
                <span className="size-1 rounded-full bg-emerald-400/50" />
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
