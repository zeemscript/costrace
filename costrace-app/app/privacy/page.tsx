import Link from "next/link";

export const metadata = {
  title: "Privacy Policy - Costrace",
  description: "Privacy policy for Costrace - LLM cost tracking platform",
};

export default function PrivacyPage() {
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
        <h1 className="text-4xl font-bold text-white">Privacy Policy</h1>
        <p className="mt-2 text-sm text-white/50">
          Last updated:{" "}
          {new Date().toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </p>

        <div className="prose prose-invert mt-12 max-w-none">
          <section className="mb-12">
            <h2 className="mb-4 text-2xl font-semibold text-white">
              1. Introduction
            </h2>
            <p className="text-white/70 leading-relaxed">
              Costrace ("we," "our," or "us") is committed to protecting your
              privacy. This Privacy Policy explains how we collect, use,
              disclose, and safeguard your information when you use our LLM cost
              tracking platform.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="mb-4 text-2xl font-semibold text-white">
              2. Information We Collect
            </h2>

            <h3 className="mb-3 mt-6 text-xl font-medium text-white/90">
              2.1 Information You Provide
            </h3>
            <ul className="list-disc space-y-2 pl-6 text-white/70">
              <li>Account information (email, username from github)</li>
              <li>Team and organization details</li>
              <li>Payment information (processed securely through Polar)</li>
              <li>Support communications</li>
            </ul>

            <h3 className="mb-3 mt-6 text-xl font-medium text-white/90">
              2.2 Usage Data
            </h3>
            <ul className="list-disc space-y-2 pl-6 text-white/70">
              <li>LLM API usage logs and costs</li>
              <li>Model and provider information</li>
              <li>Token consumption and request metrics</li>
              <li>Alert configurations and notifications</li>
            </ul>

            <h3 className="mb-3 mt-6 text-xl font-medium text-white/90">
              2.3 Technical Data
            </h3>
            <ul className="list-disc space-y-2 pl-6 text-white/70">
              <li>IP addresses and device information</li>
              <li>Browser type and version</li>
              <li>Access times and referring URLs</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="mb-4 text-2xl font-semibold text-white">
              3. How We Use Your Information
            </h2>
            <p className="mb-4 text-white/70 leading-relaxed">
              We use your information to:
            </p>
            <ul className="list-disc space-y-2 pl-6 text-white/70">
              <li>Provide and maintain our services</li>
              <li>Track and analyze your LLM usage and costs</li>
              <li>
                Send you alerts and notifications based on your preferences
              </li>
              <li>Process payments and manage subscriptions</li>
              <li>Improve our platform and develop new features</li>
              <li>Communicate with you about updates, security, and support</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="mb-4 text-2xl font-semibold text-white">
              4. Data Security
            </h2>
            <p className="text-white/70 leading-relaxed">
              We implement industry-standard security measures to protect your
              data, including:
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-6 text-white/70">
              <li>Encryption of data in transit and at rest</li>
              <li>Secure authentication and API key management</li>
              <li>Regular security audits and updates</li>
              <li>Access controls and monitoring</li>
            </ul>
            <p className="mt-4 text-white/70 leading-relaxed">
              However, no method of transmission over the internet is 100%
              secure. While we strive to protect your data, we cannot guarantee
              absolute security.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="mb-4 text-2xl font-semibold text-white">
              5. Data Retention
            </h2>
            <p className="text-white/70 leading-relaxed">
              We retain your data for as long as your account is active or as
              needed to provide services. Free tier data is retained for 7 days,
              while Pro tier data is retained for 90 days. You can request
              deletion of your data at any time by contacting support.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="mb-4 text-2xl font-semibold text-white">
              6. Third-Party Services
            </h2>
            <p className="mb-4 text-white/70 leading-relaxed">
              We use the following third-party services:
            </p>
            <ul className="list-disc space-y-2 pl-6 text-white/70">
              <li>
                <strong>Polar</strong> - Payment processing and subscription
                management
              </li>
              <li>
                <strong>Cloud hosting providers</strong> - Infrastructure and
                data storage
              </li>
            </ul>
            <p className="mt-4 text-white/70 leading-relaxed">
              These services have their own privacy policies, and we encourage
              you to review them.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="mb-4 text-2xl font-semibold text-white">
              7. Your Rights
            </h2>
            <p className="mb-4 text-white/70 leading-relaxed">
              You have the right to:
            </p>
            <ul className="list-disc space-y-2 pl-6 text-white/70">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Export your data</li>
              <li>Opt-out of marketing communications</li>
              <li>Withdraw consent at any time</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="mb-4 text-2xl font-semibold text-white">
              8. Children's Privacy
            </h2>
            <p className="text-white/70 leading-relaxed">
              Costrace is not intended for users under the age of 13. We do not
              knowingly collect personal information from children under 13. If
              you become aware that a child has provided us with personal
              information, please contact us.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="mb-4 text-2xl font-semibold text-white">
              9. Changes to This Policy
            </h2>
            <p className="text-white/70 leading-relaxed">
              We may update this Privacy Policy from time to time. We will
              notify you of any changes by posting the new policy on this page
              and updating the "Last updated" date. Your continued use of
              Costrace after changes constitutes acceptance of the updated
              policy.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="mb-4 text-2xl font-semibold text-white">
              10. Contact Us
            </h2>
            <p className="text-white/70 leading-relaxed">
              If you have questions about this Privacy Policy or our data
              practices, please contact us at:
            </p>
            <p className="mt-4 text-white/70">
              <a
                href="mailto:support@costrace.dev"
                className="text-emerald-400 hover:text-emerald-300"
              >
                support@costrace.dev
              </a>
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-white/[0.06] py-8">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="text-sm text-white/50">
            <Link href="/terms" className="hover:text-white/70">
              Terms of Service
            </Link>
            {" · "}
            <Link href="/support" className="hover:text-white/70">
              Support
            </Link>
            {" · "}
            <Link href="/" className="hover:text-white/70">
              Home
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
