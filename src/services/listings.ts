import type { Listing, ListingPreview, PaginatedResponse, SearchParams, CreateListingFormData, ListingStatus } from '@/types'
import { db, seedDatabase, type ListingRecord } from '../db'
import { tokenStore } from './storage'
const result = <T>(data: T) => ({ success: true as const, data })
const localImage = (listing: ListingRecord) => {
  const text = `${listing.title} ${listing.category}`.toLowerCase()
  if (text.includes('calculator')) return '/images/calculator.jpg'
  if (text.includes('badminton') || text.includes('sport')) return '/images/badminton.jpg'
  if (text.includes('raspberry') || text.includes('arduino') || text.includes('project')) return '/images/arduino.jpg'
  if (text.includes('drawing') || text.includes('pencil')) return '/images/drawing-kit.jpg'
  if (text.includes('headphone') || text.includes('audio')) return '/images/headphones.jpg'
  if (text.includes('lab')) return '/images/lab-coat.jpg'
  if (text.includes('lamp')) return '/images/desk-lamp.jpg'
  return text.includes('book') || text.includes('text') ? '/images/book.jpg' : '/images/calculator.jpg'
}
const page = (data: ListingPreview[], page = 1, limit = 50): PaginatedResponse<ListingPreview> => {
  const start = Math.max(0, page - 1) * limit
  return { data: data.slice(start, start + limit), total: data.length, page, limit, hasMore: start + limit < data.length }
}
async function hydrate(record: ListingRecord): Promise<Listing> {
  const seller = await db.Students.get(record.sellerId)
  const images = await db.ListingImages.where('listingId').equals(record.id).toArray()
  const hydratedImages = images.map(i => ({ id: i.id, url: i.blob?.type.startsWith('image/') ? URL.createObjectURL(i.blob) : (i.previewUrl.startsWith('http') ? localImage(record) : i.previewUrl), alt: i.alt, isPrimary: i.isPrimary }))
  return { ...record, seller: seller!, images: hydratedImages.length ? hydratedImages : [{ id: `${record.id}-fallback`, url: localImage(record), alt: record.title, isPrimary: true }] }
}
const preview = (l: Listing, saved = false): ListingPreview => ({ id: l.id, title: l.title, price: l.price, listingType: l.listingType, category: l.category, condition: l.condition, status: l.status, primaryImage: l.images.find(i => i.isPrimary)?.url, seller: { id: l.seller.id, name: l.seller.name, academicYear: l.seller.academicYear, avatar: l.seller.avatar }, savedCount: l.savedCount, createdAt: l.createdAt, isSaved: saved })
export async function compressImage(file: Blob, max = 1200): Promise<Blob> {
  if (typeof createImageBitmap === 'undefined') return file
  const bitmap = await createImageBitmap(file); const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas'); canvas.width = bitmap.width * scale; canvas.height = bitmap.height * scale
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  return new Promise(resolve => canvas.toBlob(blob => resolve(blob ?? file), 'image/jpeg', 0.82))
}
export const listingsService = {
  async getAll(params?: SearchParams) { await seedDatabase(); let records = await db.Listings.toArray(); const q = params?.query?.toLowerCase(); records = records.filter(l => (params?.availability ? (params.availability === 'Available' ? l.status === 'AVAILABLE' : l.status === 'RESERVED') : (l.status === 'AVAILABLE' || l.status === 'RESERVED')) && (!q || `${l.title} ${l.description} ${l.tags.join(' ')}`.toLowerCase().includes(q)) && (!params?.category || l.category === params.category) && (!params?.condition || l.condition === params.condition) && (!params?.listingType || l.listingType === params.listingType)); const saved = new Set((await db.Favorites.where('studentId').equals(tokenStore.get() ?? '').toArray()).map(x => x.listingId)); const data = await Promise.all(records.map(hydrate)); return result(page(data.map(l => preview(l, saved.has(l.id))), params?.page, params?.limit)) },
  async getById(id: string) { await seedDatabase(); const l = await db.Listings.get(id); return l ? result(await hydrate(l)) : { success: false as const, error: { message: 'Listing not found' } } },
  async create(data: CreateListingFormData) { const seller = await db.Students.get(tokenStore.get() ?? ''); if (!seller) return { success: false as const, error: { message: 'Select a profile first.' } }; const id = crypto.randomUUID(); const listing: ListingRecord = { id, title: data.title, description: data.description, price: data.price ?? null, listingType: data.listingType, category: data.category, condition: data.condition, status: 'AVAILABLE', sellerId: seller.id, tags: data.tags ?? [], location: data.location, viewCount: 0, savedCount: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), exchangeFor: data.exchangeFor }; await db.Listings.add(listing); for (const [index, file] of (data.images ?? []).entries()) { const blob = await compressImage(file); await db.ListingImages.add({ id: crypto.randomUUID(), listingId: id, blob, previewUrl: URL.createObjectURL(blob), alt: data.title, isPrimary: index === 0 }) } return result(await hydrate(listing)) },
  async update(id: string, data: Partial<CreateListingFormData>) { const l = await db.Listings.get(id); if (!l || l.sellerId !== tokenStore.get()) return { success: false as const, error: { message: 'Only the owner can edit this listing.' } }; const { images: _images, ...safe } = data; const updated = { ...l, ...safe, updatedAt: new Date().toISOString() } as ListingRecord; await db.Listings.put(updated); return result(await hydrate(updated)) },
  async delete(id: string) { const l = await db.Listings.get(id); if (!l || l.sellerId !== tokenStore.get()) return { success: false as const, error: { message: 'Only the owner can delete this listing.' } }; await db.transaction('rw', [db.Listings, db.ListingImages, db.Favorites], async () => { await db.Listings.delete(id); await db.ListingImages.where('listingId').equals(id).delete(); await db.Favorites.where('listingId').equals(id).delete() }); return result(undefined) },
  async getMyListings() { const records = await db.Listings.where('sellerId').equals(tokenStore.get() ?? '').toArray(); const data = await Promise.all(records.map(hydrate)); return result(page(data.map(l => preview(l)))) },
  async getSaved() { const ids = await db.Favorites.where('studentId').equals(tokenStore.get() ?? '').toArray(); const data = await Promise.all(ids.map(x => db.Listings.get(x.listingId))); return result(page((await Promise.all(data.filter(Boolean).map(x => hydrate(x!)))).map(l => preview(l, true)))) },
  async toggleSave(id: string) { const studentId = tokenStore.get(); if (!studentId) return { success: false as const, error: { message: 'Select a profile first.' } }; const existing = await db.Favorites.where('[studentId+listingId]').equals([studentId, id]).first(); if (existing?.id) { await db.Favorites.delete(existing.id); return result({ saved: false }) } await db.Favorites.add({ studentId, listingId: id, createdAt: new Date().toISOString() }); return result({ saved: true }) },
  async updateStatus(id: string, status: ListingStatus) { const l = await db.Listings.get(id); if (!l || l.sellerId !== tokenStore.get()) return { success: false as const, error: { message: 'Only the owner can change status.' } }; if (!['AVAILABLE', 'RESERVED', 'EXCHANGED'].includes(status)) return { success: false as const, error: { message: 'Invalid listing status.' } }; const transitions: Record<ListingStatus, ListingStatus[]> = { AVAILABLE: ['RESERVED', 'EXCHANGED'], RESERVED: ['AVAILABLE', 'EXCHANGED'], EXCHANGED: [] }; if (l.status !== status && !transitions[l.status].includes(status)) return { success: false as const, error: { message: `Cannot transition from ${l.status}.` } }; const updated = { ...l, status, updatedAt: new Date().toISOString() }; await db.Listings.put(updated); return result(await hydrate(updated)) },
  markSold(id: string) { return this.updateStatus(id, 'EXCHANGED') }
}
