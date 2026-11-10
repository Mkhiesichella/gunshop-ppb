import { useState } from 'react'
import { Share2, Check } from 'lucide-react'

/**
 * SHARE LINK for a catalog item.
 * Link format: https://<your-domain>/?gun=<id>   (read again in App.jsx -> SharedGun)
 *
 * - Mobile / supporting browsers : Web Share API (native share sheet)
 * - Otherwise                    : copy the link to the clipboard
 */
export default function ShareButton({ gun, withLabel = false }) {
  const [copied, setCopied] = useState(false)

  // local-only demo items have no server id, so they can't be shared
  if (!gun?.id || String(gun.id).startsWith('local-')) return null

  const url = `${window.location.origin}/?gun=${encodeURIComponent(gun.id)}`

  const handleShare = async (e) => {
    e.stopPropagation() // do not trigger the card's onClick
    try {
      if (navigator.share) {
        await navigator.share({ title: gun.name, text: `Check out ${gun.name} at Bore & Barrel`, url })
        return
      }
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* user cancelled the share sheet */
    }
  }

  return (
    <button type="button" className={withLabel ? 'btn btn--outline' : 'fav-btn'}
      onClick={handleShare} aria-label={`Share link for ${gun.name}`}
      title={copied ? 'Link copied!' : 'Share link'}>
      {copied ? <Check size={16} /> : <Share2 size={16} />}
      {withLabel && (copied ? 'Link copied!' : 'Share')}
    </button>
  )
}
