import { db } from '../db'
import { tokenStore } from './storage'
import type { ListingImage } from '@/types'

/** Small typed repositories for the stores that do not need a dedicated page yet. */
export const imagesService = {
  list: (listingId: string) => db.ListingImages.where('listingId').equals(listingId).toArray(),
  add: async (listingId: string, image: ListingImage) => { const blob = await (await fetch(image.url)).blob().catch(() => new Blob([image.url])); await db.ListingImages.put({ ...image, listingId, blob, previewUrl: image.url }); return image }
}

export const reportsService = {
  create: async (listingId: string, reason: string) => {
    const reporterId = tokenStore.get()
    if (!reporterId) throw new Error('Select a local profile first.')
    return db.Reports.add({ listingId, reporterId, description: reason, createdAt: new Date().toISOString() })
  },
  listForListing: (listingId: string) => db.Reports.where('listingId').equals(listingId).toArray()
}

export const profilesService = {
  list: () => db.Students.toArray(),
  select: (id: string) => { tokenStore.set(id); return db.Students.get(id) }
}
