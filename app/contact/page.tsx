"use client"

import { Mail, MessageSquare, Clock, MapPin } from 'lucide-react'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Contact Us
            </span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Have questions? We're here to help. Reach out and we'll get back to you as soon as possible.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {/* Contact Methods */}
          <div className="lg:col-span-1 space-y-6">
            {/* Email Support */}
            <div className="bg-card rounded-lg p-6 border border-border">
              <div className="w-12 h-12 bg-cyan-500/10 rounded-lg flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Email Support</h3>
              <p className="text-muted-foreground mb-4">
                For general inquiries, support questions, or feedback
              </p>
              <a 
                href="mailto:support@nexural.io"
                className="text-cyan-400 hover:text-cyan-300 font-semibold"
              >
                support@nexural.io
              </a>
            </div>

            {/* Discord Community */}
            <div className="bg-card rounded-lg p-6 border border-border">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Discord Community</h3>
              <p className="text-muted-foreground mb-4">
                Fastest way to get help from our community and team
              </p>
              <a 
                href="https://discord.gg/fTS3Nedk"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 font-semibold"
              >
                Join Our Discord →
              </a>
            </div>

            {/* Response Times */}
            <div className="bg-card rounded-lg p-6 border border-border">
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Response Times</h3>
              <div className="space-y-2 text-muted-foreground">
                <p><strong>Discord:</strong> Usually within 1 hour</p>
                <p><strong>Email:</strong> Within 24 hours</p>
                <p><strong>Critical Issues:</strong> Priority support</p>
              </div>
            </div>

            {/* Business Inquiries */}
            <div className="bg-card rounded-lg p-6 border border-border">
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Other Contacts</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-semibold mb-1">Business Inquiries:</p>
                  <a href="mailto:business@nexural.io" className="text-cyan-400 hover:text-cyan-300">
                    business@nexural.io
                  </a>
                </div>
                <div>
                  <p className="font-semibold mb-1">Privacy & Data:</p>
                  <a href="mailto:privacy@nexural.io" className="text-cyan-400 hover:text-cyan-300">
                    privacy@nexural.io
                  </a>
                </div>
                <div>
                  <p className="font-semibold mb-1">Legal:</p>
                  <a href="mailto:legal@nexural.io" className="text-cyan-400 hover:text-cyan-300">
                    legal@nexural.io
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-lg p-8 border border-border">
              <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium mb-2">
                    Subject *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    required
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="">Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="support">Technical Support</option>
                    <option value="account">Account Question</option>
                    <option value="feedback">Feedback</option>
                    <option value="partnership">Partnership Opportunity</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={8}
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                    placeholder="Tell us how we can help..."
                  />
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>Note:</strong> For urgent issues or fastest response, please use our Discord community. 
                    Email responses may take up to 24 hours.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl transition-all transform hover:scale-105"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* FAQ Quick Links */}
        <div className="bg-card rounded-lg p-8 border border-border">
          <h2 className="text-2xl font-bold mb-6 text-center">Common Questions</h2>
          <p className="text-center text-muted-foreground mb-8">
            Before contacting us, check if your question is answered in our FAQ
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-background rounded-lg p-6 border border-border">
              <h3 className="font-semibold mb-2">Getting Started</h3>
              <p className="text-sm text-muted-foreground mb-4">
                How to join Discord, subscribe, and access features
              </p>
              <a href="/faq#getting-started" className="text-cyan-400 hover:text-cyan-300 text-sm font-semibold">
                View FAQ →
              </a>
            </div>

            <div className="bg-background rounded-lg p-6 border border-border">
              <h3 className="font-semibold mb-2">Community Access</h3>
              <p className="text-sm text-muted-foreground mb-4">
                How to join, Discord access, and platform features
              </p>
              <a href="/faq#pricing" className="text-cyan-400 hover:text-cyan-300 text-sm font-semibold">
                View FAQ →
              </a>
            </div>

            <div className="bg-background rounded-lg p-6 border border-border">
              <h3 className="font-semibold mb-2">Technical Support</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Troubleshooting, account issues, and platform help
              </p>
              <a href="/faq#technical" className="text-cyan-400 hover:text-cyan-300 text-sm font-semibold">
                View FAQ →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
