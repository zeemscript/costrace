import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Costrace — LLM Cost, Token & Latency Tracking",
  description:
    "Open-source observability for LLM APIs. Track cost, token usage, and latency across OpenAI, Anthropic, and Google Gemini in real time — with zero code changes.",
  keywords: [
    "LLM",
    "cost tracking",
    "observability",
    "OpenAI",
    "Anthropic",
    "Gemini",
    "token usage",
    "latency",
    "API monitoring",
  ],
  openGraph: {
    type: "website",
    siteName: "Costrace",
    title: "Costrace — LLM Cost, Token & Latency Tracking",
    description:
      "Open-source observability for LLM APIs. Track cost, token usage, and latency across OpenAI, Anthropic, and Google Gemini in real time — with zero code changes.",
    images: [
      {
        url: "/desktop-dashboard.png",
        width: 1200,
        height: 630,
        alt: "Costrace dashboard showing LLM cost and latency analytics",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Costrace — LLM Cost, Token & Latency Tracking",
    description:
      "Open-source observability for LLM APIs. Track cost, token usage, and latency across OpenAI, Anthropic, and Google Gemini in real time — with zero code changes.",
    images: ["/desktop-dashboard.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#18181b",
              border: "1px solid #06591e",
              color: "#f4f4f5",
              borderRadius: "1px",
              fontSize: "13px",
            },
          }}
        />
      </body>
    </html>
  );
}
