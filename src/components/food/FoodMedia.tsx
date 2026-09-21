import { CATEGORY_MEDIA } from '../../data/categoryMedia'
import { cn } from '../../lib/cn'
import type { Donation } from '../../types/donation'
import { MediaArt } from '../brand/MediaArt'
import { Photo } from '../ui/Photo'
import { CATEGORY_META } from './presentation'

type FoodMediaProps = Pick<Donation, 'category' | 'imageUrl'> & { className?: string; priority?: boolean }

/**
 * Listing visual, in priority order: the listing's own photo → the category's photo slot →
 * the category's MediaArt treatment. Always decorative: the title beside it carries the meaning.
 */
export function FoodMedia({ category, imageUrl, className, priority }: FoodMediaProps) {
  const meta = CATEGORY_META[category]
  const slot = CATEGORY_MEDIA[meta.slot]
  const Icon = meta.icon

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt=""
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className={cn('photo', className)}
      />
    )
  }
  if (slot.src) return <Photo photo={slot} decorative priority={priority} className={className} />
  return <MediaArt tone={slot.art} glyph={<Icon aria-hidden="true" />} className={className} />
}
