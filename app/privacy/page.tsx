import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | Nexural Trading',
  description: 'Privacy Policy for Nexural Trading platform - How we collect, use, and protect your data',
}

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-card rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">
            Last Updated: November 11, 2025
          </p>

          <div className="space-y-8 text-foreground">
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
              <p className="mb-4">
                Nexural Trading ("we", "us", or "our") respects your privacy and is committed to protecting your personal data. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Service.
              </p>
              <p className="font-semibold">
                By using our Service, you agree to the collection and use of information in accordance with this policy.
              </p>
            </section>

            {/* 1. Information We Collect */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
              
              <h3 className="text-xl font-semibold mt-4 mb-2">1.1 Information You Provide</h3>
              <p className="mb-4">We collect information you directly provide when you:</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li><strong>Create an account:</strong> Email address, name, password</li>
                <li><strong>Subscribe:</strong> Payment information (processed by Stripe)</li>
                <li><strong>Contact us:</strong> Name, email, message content</li>
                <li><strong>Join Discord:</strong> Discord username and ID</li>
                <li><strong>Use features:</strong> Trading preferences, settings, feedback</li>
              </ul>

              <h3 className="text-xl font-semibold mt-4 mb-2">1.2 Automatically Collected Information</h3>
              <p className="mb-4">When you use our Service, we automatically collect:</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li><strong>Usage data:</strong> Pages visited, features used, time spent</li>
                <li><strong>Device information:</strong> Browser type, OS, device model</li>
                <li><strong>Log data:</strong> IP address, access times, referring URLs</li>
                <li><strong>Cookies:</strong> Session data, preferences, analytics</li>
              </ul>

              <h3 className="text-xl font-semibold mt-4 mb-2">1.3 Third-Party Data</h3>
              <p className="mb-4">We may receive information from:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Authentication providers:</strong> Google OAuth (if used)</li>
                <li><strong>Payment processors:</strong> Stripe (payment confirmation)</li>
                <li><strong>Analytics services:</strong> Google Analytics, Vercel Analytics</li>
                <li><strong>Communication platforms:</strong> Discord, email services</li>
              </ul>
            </section>

            {/* 2. How We Use Your Information */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
              <p className="mb-4">We use your information to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Provide services:</strong> Account management, access to features</li>
                <li><strong>Process payments:</strong> Billing, subscription management</li>
                <li><strong>Communicate:</strong> Service updates, support responses, newsletters</li>
                <li><strong>Improve service:</strong> Analytics, bug fixes, new features</li>
                <li><strong>Personalize experience:</strong> Customized content, recommendations</li>
                <li><strong>Security:</strong> Fraud prevention, account protection</li>
                <li><strong>Compliance:</strong> Legal obligations, terms enforcement</li>
                <li><strong>Marketing:</strong> Promotional emails (with your consent)</li>
              </ul>
            </section>

            {/* 3. Legal Basis for Processing (GDPR) */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Legal Basis for Processing (GDPR)</h2>
              <p className="mb-4">For EU users, we process your data based on:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Consent:</strong> You agreed to receive marketing emails</li>
                <li><strong>Contract:</strong> Necessary to provide our Service</li>
                <li><strong>Legitimate interests:</strong> Analytics, security, improvement</li>
                <li><strong>Legal obligation:</strong> Tax, anti-fraud requirements</li>
              </ul>
            </section>

            {/* 4. Information Sharing */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Information Sharing and Disclosure</h2>
              <p className="mb-4">We may share your information with:</p>
              
              <h3 className="text-xl font-semibold mt-4 mb-2">4.1 Service Providers</h3>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li><strong>Supabase:</strong> Database and authentication</li>
                <li><strong>Stripe:</strong> Payment processing</li>
                <li><strong>Resend:</strong> Email delivery</li>
                <li><strong>Vercel:</strong> Hosting and infrastructure</li>
                <li><strong>Discord:</strong> Community platform</li>
                <li><strong>Google Analytics:</strong> Usage analytics</li>
              </ul>

              <h3 className="text-xl font-semibold mt-4 mb-2">4.2 Legal Requirements</h3>
              <p className="mb-4">We may disclose information if required by law or to:</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Comply with legal processes</li>
                <li>Enforce our Terms of Service</li>
                <li>Protect rights, property, or safety</li>
                <li>Prevent fraud or security threats</li>
              </ul>

              <h3 className="text-xl font-semibold mt-4 mb-2">4.3 Business Transfers</h3>
              <p className="mb-4">
                If we merge with, are acquired by, or sell assets to another company, 
                your information may be transferred as part of that transaction.
              </p>

              <h3 className="text-xl font-semibold mt-4 mb-2">4.4 With Your Consent</h3>
              <p>
                We may share information for other purposes with your explicit consent.
              </p>
            </section>

            {/* 5. Cookies and Tracking */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Cookies and Tracking Technologies</h2>
              <p className="mb-4">We use cookies and similar technologies to:</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li><strong>Essential cookies:</strong> Session management, authentication</li>
                <li><strong>Preference cookies:</strong> Remember your settings</li>
                <li><strong>Analytics cookies:</strong> Understand usage patterns</li>
                <li><strong>Marketing cookies:</strong> Track ad performance (if applicable)</li>
              </ul>
              <p className="font-semibold">
                You can control cookies through your browser settings. Note that disabling 
                cookies may limit functionality.
              </p>
            </section>

            {/* 6. Data Security */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Data Security</h2>
              <p className="mb-4">
                We implement industry-standard security measures to protect your data:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Encryption in transit (HTTPS/TLS)</li>
                <li>Encryption at rest (database)</li>
                <li>Secure authentication (hashed passwords)</li>
                <li>Regular security audits</li>
                <li>Access controls and monitoring</li>
                <li>DDoS protection</li>
              </ul>
              <p className="font-semibold text-yellow-600 dark:text-yellow-500">
                However, no method of transmission or storage is 100% secure. 
                We cannot guarantee absolute security.
              </p>
            </section>

            {/* 7. Data Retention */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Data Retention</h2>
              <p className="mb-4">We retain your information:</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li><strong>Active accounts:</strong> As long as your account is active</li>
                <li><strong>Closed accounts:</strong> Up to 90 days (for recovery)</li>
                <li><strong>Legal requirements:</strong> As required by law (tax records, etc.)</li>
                <li><strong>Analytics:</strong> Aggregated data indefinitely</li>
              </ul>
              <p>
                After retention periods, we securely delete or anonymize your data.
              </p>
            </section>

            {/* 8. Your Rights (GDPR & CCPA) */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Your Privacy Rights</h2>
              
              <h3 className="text-xl font-semibold mt-4 mb-2">8.1 GDPR Rights (EU Users)</h3>
              <p className="mb-4">You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li><strong>Access:</strong> Request a copy of your data</li>
                <li><strong>Rectification:</strong> Correct inaccurate data</li>
                <li><strong>Erasure:</strong> Request deletion ("right to be forgotten")</li>
                <li><strong>Restriction:</strong> Limit processing of your data</li>
                <li><strong>Portability:</strong> Receive data in machine-readable format</li>
                <li><strong>Object:</strong> Object to processing for marketing</li>
                <li><strong>Withdraw consent:</strong> Opt out at any time</li>
              </ul>

              <h3 className="text-xl font-semibold mt-4 mb-2">8.2 CCPA Rights (California Residents)</h3>
              <p className="mb-4">You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Know what data we collect</li>
                <li>Request deletion of your data</li>
                <li>Opt out of data "sales" (we don't sell data)</li>
                <li>Non-discrimination for exercising rights</li>
              </ul>

              <h3 className="text-xl font-semibold mt-4 mb-2">8.3 How to Exercise Rights</h3>
              <p className="mb-4">
                To exercise these rights, contact us at <strong>privacy@nexural.io</strong>
              </p>
              <p>
                We will respond within 30 days and may verify your identity before processing requests.
              </p>
            </section>

            {/* 9. International Data Transfers */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">9. International Data Transfers</h2>
              <p className="mb-4">
                Your data may be transferred to and processed in countries other than your own. 
                We ensure adequate protection through:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Standard Contractual Clauses (EU)</li>
                <li>Privacy Shield frameworks (where applicable)</li>
                <li>Vendor agreements requiring data protection</li>
              </ul>
            </section>

            {/* 10. Children's Privacy */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Children's Privacy</h2>
              <p className="mb-4">
                Our Service is not intended for users under 18 years of age. 
                We do not knowingly collect data from children.
              </p>
              <p>
                If you believe we have collected data from a child, please contact us immediately 
                and we will delete it.
              </p>
            </section>

            {/* 11. Third-Party Links */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">11. Third-Party Links</h2>
              <p className="mb-4">
                Our Service may contain links to third-party websites (YouTube, Discord, etc.). 
                We are not responsible for their privacy practices.
              </p>
              <p className="font-semibold">
                We recommend reviewing the privacy policies of any third-party sites you visit.
              </p>
            </section>

            {/* 12. Marketing Communications */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">12. Marketing Communications</h2>
              <p className="mb-4">
                We may send you marketing emails about new features, promotions, or content.
              </p>
              <p className="mb-4">
                <strong>You can opt out at any time by:</strong>
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Clicking "unsubscribe" in any email</li>
                <li>Updating preferences in your account settings</li>
                <li>Contacting support@nexural.io</li>
              </ul>
            </section>

            {/* 13. Do Not Track */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">13. Do Not Track Signals</h2>
              <p>
                Our Service does not currently respond to Do Not Track (DNT) browser signals. 
                We may implement DNT support in the future.
              </p>
            </section>

            {/* 14. Changes to Privacy Policy */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">14. Changes to This Privacy Policy</h2>
              <p className="mb-4">
                We may update this Privacy Policy periodically. Changes are effective immediately upon posting.
              </p>
              <p className="mb-4">
                Material changes will be communicated via:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Email notification</li>
                <li>Service announcement</li>
                <li>Updated "Last Updated" date</li>
              </ul>
            </section>

            {/* 15. Contact Us */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">15. Contact Us</h2>
              <p className="mb-4">
                For questions or concerns about this Privacy Policy or our data practices, contact us:
              </p>
              <div className="bg-card border border-border rounded-lg p-4">
                <p><strong>Nexural Trading - Privacy Team</strong></p>
                <p>Email: privacy@nexural.io</p>
                <p>Support: support@nexural.io</p>
                <p>Data Protection Officer: dpo@nexural.io</p>
                <p>Website: https://nexural.io/privacy</p>
              </div>
            </section>

            {/* Consent */}
            <section className="border-t pt-6 mt-8">
              <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4">
                <p className="font-semibold mb-2">Your Consent</p>
                <p className="text-sm">
                  By using our Service, you consent to our Privacy Policy and agree to its terms. 
                  If you do not agree, please discontinue use of the Service.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
