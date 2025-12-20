"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Target } from "lucide-react"

export function DecisionFramework() {
  return (
    <section className="py-24 px-4 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        {/* Story Hook */}
        <div className="max-w-4xl mx-auto mb-16 text-center">
          <Badge variant="outline" className="px-4 py-2 text-sm font-medium mb-6">
            Decision Process
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-8">
            How This Saved Me $100,000
          </h2>
          <div className="space-y-6 text-lg text-muted-foreground">
            <p>
              In 2018, I almost bought a "hot" AI stock. Great story, huge hype, everyone was buying.
            </p>
            <p>
              But it failed <span className="text-destructive font-semibold">metric #3: EPS was decelerating</span>.
            </p>
            <p>
              I passed. The stock crashed <span className="text-destructive font-semibold">80% in 6 months</span>.
            </p>
            <p className="text-foreground font-semibold text-xl pt-4">
              That's the power of a systematic approach - it protects you from your own emotions.
            </p>
          </div>
        </div>

        <div className="text-center space-y-4 mb-16">
          <h3 className="text-3xl md:text-4xl font-bold text-foreground">The Exact Process I Use</h3>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            A systematic approach that eliminates emotion and ensures consistent results
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Must Pass Section */}
          <Card className="border-2 border-destructive/20 bg-destructive/5">
            <CardHeader>
              <div className="flex items-center gap-3">
                <XCircle className="w-8 h-8 text-destructive" />
                <div>
                  <CardTitle className="text-2xl text-foreground">Must Pass ALL 10 Critical Metrics</CardTitle>
                  <p className="text-muted-foreground mt-1">Non-negotiable requirements</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-destructive rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-semibold text-foreground">If ANY of the 10 critical metrics fail:</p>
                    <p className="text-muted-foreground text-sm mt-1">→ Immediately disqualify the stock</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-destructive rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-semibold text-foreground">No exceptions policy:</p>
                    <p className="text-muted-foreground text-sm mt-1">→ Regardless of other factors or market hype</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-destructive rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-semibold text-foreground">Success rate:</p>
                    <p className="text-muted-foreground text-sm mt-1">→ Only ~2-3% of stocks pass this screen</p>
                  </div>
                </div>
              </div>

              <div className="bg-destructive/10 p-4 rounded-lg border border-destructive/20">
                <p className="text-sm font-medium text-destructive">
                  ⚠️ This strict filtering is what separates winners from losers
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Nice to Have Section */}
          <Card className="border-2 border-primary/20 bg-primary/5">
            <CardHeader>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-primary" />
                <div>
                  <CardTitle className="text-2xl text-foreground">Nice-to-Haves Improve Conviction</CardTitle>
                  <p className="text-muted-foreground mt-1">Optimization factors</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-semibold text-foreground">Strong performance on nice-to-haves:</p>
                    <p className="text-muted-foreground text-sm mt-1">→ Increases position size</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-semibold text-foreground">Higher conviction trades:</p>
                    <p className="text-muted-foreground text-sm mt-1">→ Extends holding period</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-semibold text-foreground">Quality assurance:</p>
                    <p className="text-muted-foreground text-sm mt-1">→ Reduces monitoring frequency</p>
                  </div>
                </div>
              </div>

              <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                <p className="text-sm font-medium text-primary">
                  ✅ These factors help rank and optimize the final candidates
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Process Flow */}
        <div className="mt-16">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center text-foreground flex items-center justify-center gap-3">
                <Target className="w-8 h-8 text-primary" />
                Our Two-Phase Process
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-destructive text-white rounded-full flex items-center justify-center font-bold text-sm">
                      1
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">Critical Metrics Screen</h3>
                  </div>
                  <div className="ml-11 space-y-2">
                    <p className="text-muted-foreground">
                      Pass Rate Required:{" "}
                      <span className="font-semibold text-foreground">10/10 critical metrics above threshold</span>
                    </p>
                    <p className="text-muted-foreground">
                      Failure Rate:{" "}
                      <span className="font-semibold text-destructive">
                        If any 1 critical metric fails = disqualify
                      </span>
                    </p>
                    <p className="text-muted-foreground">
                      Success Rate:{" "}
                      <span className="font-semibold text-primary">Only ~2-3% of stocks pass this screen</span>
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm">
                      2
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">Nice-to-Have Enhancement</h3>
                  </div>
                  <div className="ml-11 space-y-2">
                    <p className="text-muted-foreground">Score the nice-to-haves for remaining candidates</p>
                    <p className="text-muted-foreground">Use to rank and size positions</p>
                    <p className="text-muted-foreground">Determine entry timing and price targets</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Real Examples */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-foreground text-center mb-8">Real Examples</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Success Example */}
            <Card className="border-2 border-green-500/20 bg-green-500/5">
              <CardHeader>
                <CardTitle className="text-xl text-foreground flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  The Winner
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-semibold text-foreground mb-2">Stock: High-Growth Tech Company</p>
                  <div className="space-y-2 text-sm">
                    <p className="text-muted-foreground">
                      ✅ <span className="font-semibold text-foreground">Passed all 10 critical metrics</span>
                    </p>
                    <p className="text-muted-foreground">
                      ✅ <span className="font-semibold text-foreground">Scored 8/10 on nice-to-haves</span>
                    </p>
                    <p className="text-muted-foreground">
                      ✅ <span className="font-semibold text-foreground">Strong institutional backing</span>
                    </p>
                  </div>
                </div>
                <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/20">
                  <p className="font-semibold text-green-500 text-lg mb-1">Result: +127% in 18 months</p>
                  <p className="text-sm text-muted-foreground">
                    The system identified this winner before the crowd
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Avoided Loss Example */}
            <Card className="border-2 border-red-500/20 bg-red-500/5">
              <CardHeader>
                <CardTitle className="text-xl text-foreground flex items-center gap-2">
                  <XCircle className="w-6 h-6 text-red-500" />
                  The Disaster Avoided
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-semibold text-foreground mb-2">Stock: Hyped AI Company</p>
                  <div className="space-y-2 text-sm">
                    <p className="text-muted-foreground">
                      ❌ <span className="font-semibold text-destructive">Failed metric #1 (EPS growth decelerating)</span>
                    </p>
                    <p className="text-muted-foreground">
                      ✅ <span className="font-semibold text-foreground">Passed all other 9 metrics</span>
                    </p>
                    <p className="text-muted-foreground">
                      ⚠️ <span className="font-semibold text-foreground">Huge media hype and buzz</span>
                    </p>
                  </div>
                </div>
                <div className="bg-red-500/10 p-4 rounded-lg border border-red-500/20">
                  <p className="font-semibold text-red-500 text-lg mb-1">Result: Avoided -65% loss</p>
                  <p className="text-sm text-muted-foreground">
                    One failed metric saved me from disaster
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Key Takeaway */}
        <div className="mt-16 max-w-4xl mx-auto">
          <Card className="border-2 border-primary/20 bg-primary/5">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold text-foreground mb-4">
                The Key Takeaway
              </h3>
              <p className="text-lg text-muted-foreground mb-4">
                The system doesn't just find winners - it protects you from losers.
              </p>
              <p className="text-foreground font-semibold">
                In investing, avoiding big losses is just as important as finding big winners.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
