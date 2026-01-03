"use client"

import { useState } from 'react'
import { Check, Lightbulb } from 'lucide-react'
import { getSharePlatforms, copyToClipboard, generateReferralLink } from '@/lib/referral/referral-utils'

interface ReferralShareButtonsProps {
  referralCode: string
  className?: string
}

export function ReferralShareButtons({ referralCode, className = '' }: ReferralShareButtonsProps) {
  const [copied, setCopied] = useState(false)
  const platforms = getSharePlatforms(referralCode)
  const referralLink = generateReferralLink(referralCode)

  const handleCopy = async () => {
    const success = await copyToClipboard(referralLink)
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleShare = (url: string) => {
    window.open(url, '_blank', 'width=600,height=400')
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Copy Link Section */}
      <div className="bg-gradient-to-r from-card/50 to-card/30 backdrop-blur-sm border border-white/10 rounded-xl p-4">
        <label className="text-sm font-medium text-muted-foreground mb-2 block">
          Your Referral Link
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={referralLink}
            readOnly
            className="flex-1 px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-foreground text-sm focus:outline-none focus:border-cyan-500/50"
          />
          <button
            onClick={handleCopy}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
              copied
                ? 'bg-green-500 text-white'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white'
            }`}
          >
            {copied ? (
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                Copied!
              </span>
            ) : (
              'Copy'
            )}
          </button>
        </div>
      </div>

      {/* Social Share Buttons */}
      <div>
        <label className="text-sm font-medium text-muted-foreground mb-3 block">
          Share on Social Media
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {platforms.map((platform) => (
            <button
              key={platform.name}
              onClick={() => handleShare(platform.url(referralCode, ''))}
              className={`${platform.color} text-white px-4 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2`}
            >
              <span className="text-xl">{platform.icon}</span>
              <span className="text-sm">{platform.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 backdrop-blur-sm border border-cyan-500/20 rounded-xl p-4">
        <div className="flex items-center gap-2 text-cyan-300">
          <Lightbulb className="w-6 h-6" />
          <div className="text-sm">
            <p className="font-semibold">Pro Tip:</p>
            <p className="text-cyan-300/80">Share on multiple platforms to maximize your referrals!</p>
          </div>
        </div>
      </div>
    </div>
  )
}
