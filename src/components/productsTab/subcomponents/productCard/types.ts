import type { Product } from '../../../../store/types'

export interface ProductCardProps {
  product: Product
  onScrape: (id: string) => void
  onCopy: (id: string) => Promise<void>
  onRemove: (id: string) => void
}
