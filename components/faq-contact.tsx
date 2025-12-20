"use client"

import { Mail, MessageCircle, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function FAQContact() {
  return (
    <section className="w-full py-16 px-5">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Still Have Questions?</h2>
          <p className="text-xl text-muted-foreground">
            Our team is here to help clarify our educational methodology and platform features
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                Email Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Get detailed answers to your questions about our educational content and platform features.
              </p>
              <div className="space-y-2 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Response time: 24-48 hours
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Educational questions only
                </div>
              </div>
              <Button className="w-full" asChild>
                <a href="mailto:education@nexuraltrading.com">Send Email</a>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-blue-500" />
                Community Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Join our educational community to learn from other members and participate in discussions.
              </p>
              <div className="space-y-2 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Active community discussions
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Peer learning opportunities
                </div>
              </div>
              <Button variant="outline" className="w-full bg-transparent" asChild>
                <a href="/pricing">Join Community</a>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8 bg-primary/5 border-primary/20">
          <CardContent className="p-8 text-center">
            <h3 className="text-xl font-semibold mb-4">Important Reminder</h3>
            <p className="text-muted-foreground">
              We provide educational support only. We cannot and do not provide personalized investment advice,
              recommendations, or guarantees. All investment decisions are your responsibility. Please consult with
              qualified financial advisors for personalized investment guidance.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
