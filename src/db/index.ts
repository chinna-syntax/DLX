import Dexie, { type Table } from 'dexie'
import type { User, Listing, ListingImage } from '../types'
import { MOCK_USERS, MOCK_LISTINGS, MOCK_CONVERSATIONS, MOCK_MESSAGES } from '../utils/mockData'

/** Persisted records deliberately keep relationships as ids, not embedded documents. */
export type StudentRecord = User
export type ListingRecord = Omit<Listing, 'seller' | 'images'> & { sellerId: string }
export interface ListingImageRecord extends Omit<ListingImage, 'url'> { listingId: string; blob: Blob; previewUrl: string }
export interface FavoriteRecord { id?: number; studentId: string; listingId: string; createdAt: string }
export interface ReportRecord { id?: number; listingId: string; reporterId: string; description: string; createdAt: string }
export interface ConversationRecord { id: string; listingId: string; buyerId: string; sellerId: string; unreadCount: number; updatedAt: string }
export interface MessageRecord { id: string; conversationId: string; senderId: string; text: string; createdAt: string; read: boolean; attachments?: string[] }
export interface AppMetadataRecord { key: string; value: string }

export class CampusExchangeDatabase extends Dexie {
  Students!: Table<StudentRecord, string>; Listings!: Table<ListingRecord, string>
  ListingImages!: Table<ListingImageRecord, string>; Favorites!: Table<FavoriteRecord, number>
  Conversations!: Table<ConversationRecord, string>; Messages!: Table<MessageRecord, string>
  Reports!: Table<ReportRecord, number>; AppMetadata!: Table<AppMetadataRecord, string>
  constructor() {
    super('CampusExchangeDB')
    this.version(1).stores({
      Students: 'id, email, university, department', Listings: 'id, sellerId, category, status, createdAt, listingType',
      ListingImages: 'id, listingId, isPrimary', Favorites: '++id, [studentId+listingId], studentId, listingId',
      Conversations: 'id, [listingId+buyerId+sellerId], listingId, buyerId, sellerId, updatedAt', Messages: 'id, conversationId, createdAt', Reports: '++id, listingId, reporterId', AppMetadata: 'key'
    })
    // Keep upgrades explicit so future schema changes never silently discard local data.
    this.version(2).stores({
      Students: 'id, email, university, department', Listings: 'id, sellerId, category, status, createdAt, listingType',
      ListingImages: 'id, listingId, isPrimary', Favorites: '++id, [studentId+listingId], studentId, listingId',
      Conversations: 'id, [listingId+buyerId+sellerId], listingId, buyerId, sellerId, updatedAt', Messages: 'id, conversationId, createdAt', Reports: '++id, listingId, reporterId', AppMetadata: 'key'
    }).upgrade(async transaction => {
      await transaction.table('AppMetadata').put({ key: 'schemaVersion', value: '2' })
    })
  }
}
export const db = new CampusExchangeDatabase()

const extraUsers: User[] = [
  { id: 'u5', name: 'Vikram Singh', email: 'vikram.singh@iit.ac.in', avatar: 'https://i.pravatar.cc/150?img=12', department: 'Civil Engineering', academicYear: '1st Year', university: 'IIT Delhi', joinedAt: '2026-07-01T00:00:00Z', isVerified: true, listingsCount: 1, rating: 4.5, ratingCount: 2 },
  { id: 'u6', name: 'Aisha Khan', email: 'aisha.khan@iit.ac.in', avatar: 'https://i.pravatar.cc/150?img=32', department: 'Mathematics', academicYear: 'Postgraduate', university: 'IIT Delhi', joinedAt: '2025-08-01T00:00:00Z', isVerified: true, listingsCount: 1, rating: 4.6, ratingCount: 5 }
]
export async function seedDatabase() {
  if (await db.Students.count()) return
  const students = [...MOCK_USERS, ...extraUsers]
  const listings = [...MOCK_LISTINGS]
  while (listings.length < 15) { const source = MOCK_LISTINGS[listings.length % MOCK_LISTINGS.length]; listings.push({ ...source, id: `l${listings.length + 1}`, title: `${source.title} (Campus pick)`, seller: students[listings.length % students.length], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }) }
  await db.transaction('rw', [db.Students, db.Listings, db.ListingImages, db.Conversations, db.Messages, db.AppMetadata], async () => {
    await db.Students.bulkPut(students)
    await db.Listings.bulkPut(listings.map(({ seller, images, ...listing }) => ({ ...listing, sellerId: seller.id, status: 'AVAILABLE' as const })))
    await db.ListingImages.bulkPut(listings.flatMap(l => l.images.map(image => ({ ...image, listingId: l.id, blob: new Blob([image.url], { type: 'text/plain' }), previewUrl: image.url }))))
    await db.Conversations.bulkPut(MOCK_CONVERSATIONS.map(c => ({ id: c.id, listingId: c.listing?.id ?? 'l1', buyerId: c.participants?.[0]?.id ?? 'u1', sellerId: c.participants?.[1]?.id ?? 'u2', unreadCount: c.unreadCount, updatedAt: c.updatedAt })))
    await db.Messages.bulkPut(MOCK_MESSAGES.map(m => ({ id: m.id, conversationId: m.conversationId, senderId: m.senderId, text: m.text ?? m.content ?? '', createdAt: m.createdAt ?? m.sentAt ?? new Date().toISOString(), read: m.read ?? m.isRead ?? false })))
    await db.AppMetadata.put({ key: 'seedVersion', value: '1' })
  })
}
