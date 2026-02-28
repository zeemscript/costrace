import Link from "next/link";

export const metadata = {
  title: "Terms of Service - Costrace",
  description: "Terms of service for Costrace - LLM cost tracking platform",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black">
      <header className="border-b border-white/[0.06]">
        <div className="mx-auto max-w-4xl px-6 py-6">
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

      <main className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="text-4xl font-bold text-white">Terms of Service</h1>
        <p className="mt-2 text-sm text-white/50">
          Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </p>

        <div className="prose prose-invert mt-12 max-w-none">
          <section className="mb-12">
            <h2 className="mb-4 text-2xl font-semibold text-white">1. Acceptance of Terms</h2>
            <p className="text-white/70 leading-relaxed">
              By accessing or using Costrace, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use our service.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="mb-4 text-2xl font-semibold text-white">2. Description of Service</h2>
            <p className="text-white/70 leading-relaxed">
              Costrace is a platform that tracks and analyzes costs associated with Large Language Model (LLM) API usage. We provide tools to monitor spending, set alerts, and gain insights into your AI infrastructure costs across multiple providers.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="mb-4 text-2xl font-semibold text-white">3. Account Registration</h2>
            <p className="mb-4 text-white/70 leading-relaxed">To use Costrace, you must:</p>
            <ul className="list-disc space-y-2 pl-6 text-white/70">
              <li>Provide accurate and complete registration information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Be at least 13 years of age</li>
              <li>Notify us immediately of any unauthorized account access</li>
              <li>Be responsible for all activities under your account</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="mb-4 text-2xl font-semibold text-white">4. Subscription Plans</h2>
            
            <h3 className="mb-3 mt-6 text-xl font-medium text-white/90">4.1 Free Tier</h3>
            <ul className="list-disc space-y-2 pl-6 text-white/70">
              <li>50,000 traces per month</li>
              <li>7-day data retention</li>
              <li>1 API key</li>
              <li>Limited features as described on our pricing page</li>
            </ul>

            <h3 className="mb-3 mt-6 text-xl font-medium text-white/90">4.2 Pro Tier</h3>
            <ul className="list-disc space-y-2 pl-6 text-white/70">
              <li>500,000 traces per month</li>
              <li>90-day data retention</li>
              <li>Unlimited API keys and budget alerts</li>
              <li>Advanced features including team collaboration and priority support</li>
            </ul>

            <h3 className="mb-3 mt-6 text-xl font-medium text-white/90">4.3 Payment and Billing</h3>
            <p className="text-white/70 leading-relaxed">
              Subscriptions are billed monthly in advance. All payments are processed securely through Polar. Prices are subject to change with 30 days' notice. You are responsible for all applicable taxes.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="mb-4 text-2xl font-semibold text-white">5. Cancellation and Refunds</h2>
            <p className="mb-4 text-white/70 leading-relaxed">
              You may cancel your subscription at any time. Cancellations take effect at the end of your current billing period. You will retain Pro features until that date. We do not offer refunds for partial months or unused features.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="mb-4 text-2xl font-semibold text-white">6. Acceptable Use</h2>
            <p className="mb-4 text-white/70 leading-relaxed">You agree NOT to:</p>
            <ul className="list-disc space-y-2 pl-6 text-white/70">
              <li>Use the service for any illegal purposes</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Reverse engineer or decompile our software</li>
              <li>Share your API keys or account credentials</li>
              <li>Overload our servers or interfere with service operation</li>
              <li>Use the service to transmit malware or harmful code</li>
              <li>Violate the rights of others or our intellectual property</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="mb-4 text-2xl font-semibold text-white">7. Data and Privacy</h2>
            <p className="text-white/70 leading-relaxed">
              Your use of Costrace is subject to our Privacy Policy. We collect and process your LLM usage data to provide our services. You retain ownership of your data and can export or delete it at any time. We do not share your usage data with third parties except as required by law or described in our Privacy Policy.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="mb-4 text-2xl font-semibold text-white">8. API Keys and Security</h2>
            <p className="text-white/70 leading-relaxed">
              You are solely responsible for securing your API keys. We encrypt API keys at rest and in transit, but you must keep them confidential. Immediately revoke and regenerate any exposed keys. We are not liable for costs incurred from unauthorized use of your API keys.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="mb-4 text-2xl font-semibold text-white">9. Service Availability</h2>
            <p className="text-white/70 leading-relaxed">
              We strive for high availability but do not guarantee uninterrupted service. We may perform maintenance, updates, or experience downtime. We are not liable for service interruptions or data loss resulting from system failures.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="mb-4 text-2xl font-semibold text-white">10. Intellectual Property</h2>
            <p className="text-white/70 leading-relaxed">
              Costrace, our logo, and all related marks are our property. Our software, documentation, and content are protected by copyright and other intellectual property laws. You may not use our marks or content without written permission.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="mb-4 text-2xl font-semibold text-white">11. Limitation of Liability</h2>
            <p className="text-white/70 leading-relaxed">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, COSTRACE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES RESULTING FROM:
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-6 text-white/70">
              <li>Your use or inability to use the service</li>
              <li>Unauthorized access to or alteration of your data</li>
              <li>Any conduct or content of third parties on the service</li>
              <li>Any content obtained from the service</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="mb-4 text-2xl font-semibold text-white">12. Indemnification</h2>
            <p className="text-white/70 leading-relaxed">
              You agree to indemnify and hold Costrace harmless from any claims, damages, losses, liabilities, and expenses (including attorney's fees) arising from your use of the service, violation of these terms, or infringement of any third-party rights.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="mb-4 text-2xl font-semibold text-white">13. Termination</h2>
            <p className="text-white/70 leading-relaxed">
              We reserve the right to suspend or terminate your account at any time for violations of these terms, fraudulent activity, or other reasons at our discretion. Upon termination, your right to use the service ceases immediately. Provisions regarding liability, indemnification, and intellectual property survive termination.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="mb-4 text-2xl font-semibold text-white">14. Modifications to Terms</h2>
            <p className="text-white/70 leading-relaxed">
              We may modify these terms at any time. We will notify users of material changes via email or through the service. Your continued use after changes constitutes acceptance of the modified terms. If you do not agree to changes, you must stop using the service.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="mb-4 text-2xl font-semibold text-white">15. Governing Law</h2>
            <p className="text-white/70 leading-relaxed">
              These terms are governed by and construed in accordance with applicable laws. Any disputes shall be resolved in the appropriate courts, and you consent to the jurisdiction and venue of such courts.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="mb-4 text-2xl font-semibold text-white">16. Contact Information</h2>
            <p className="text-white/70 leading-relaxed">
              For questions about these Terms of Service, please contact us at:
            </p>
            <p className="mt-4 text-white/70">
              <a href="mailto:support@costrace.dev" className="text-emerald-400 hover:text-emerald-300">
                support@costrace.dev
              </a>
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-white/[0.06] py-8">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="text-sm text-white/50">
            <Link href="/privacy" className="hover:text-white/70">Privacy Policy</Link>
            {" · "}
            <Link href="/support" className="hover:text-white/70">Support</Link>
            {" · "}
            <Link href="/" className="hover:text-white/70">Home</Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
