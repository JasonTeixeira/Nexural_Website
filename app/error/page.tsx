"use client"

import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import Link from "next/link"

export default function ErrorPage() {
  const searchParams = useSearchParams()
  const message = searchParams.get("message") || "An unknown error occurred"

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="max-w-md mx-auto px-4">
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <CardTitle className="text-red-400">Something went wrong</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-300">{message}</p>
            <div className="space-y-2">
              <Link href="/dashboard">
                <Button className="w-full bg-teal-500 hover:bg-teal-600 text-black">Try Again</Button>
              </Link>
              <Link href="/">
                <Button
                  variant="outline"
                  className="w-full border-gray-700 text-white hover:bg-gray-800 bg-transparent"
                >
                  Go Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
