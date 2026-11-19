import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import { db, seedDatabase } from './db'
import { authService } from './services/auth'
import { listingsService } from './services/listings'
import { tokenStore } from './services/storage'
import { conversationsService } from './services/conversations'
import { reportsService } from './services/local'

describe('CampusExchangeDB', () => {
  beforeEach(async () => { await db.delete(); await db.open() })
  it('seeds the local marketplace with profiles and listings', async () => {
    await seedDatabase()
    expect(await db.Students.count()).toBe(6)
    expect(await db.Listings.count()).toBe(15)
  })
  it('supports owner-only lifecycle, favorites, and blob images', async () => {
    await seedDatabase()
    await authService.login({ email: 'arjun.sharma@iit.ac.in', password: 'local' })
    const created = await listingsService.create({ title: 'Test item', description: 'Local', category: 'Other', condition: 'Good', listingType: 'sell', price: 10, tags: [], images: [new File(['image'], 'test.jpg', { type: 'image/jpeg' })] })
    expect(created.success).toBe(true)
    const listing = (created as any).data
    expect(await db.ListingImages.where('listingId').equals(listing.id).count()).toBe(1)
    expect((await listingsService.toggleSave(listing.id) as any).data?.saved).toBe(true)
    expect((await listingsService.updateStatus(listing.id, 'RESERVED') as any).data?.status).toBe('RESERVED')
    tokenStore.set('u2')
    expect((await listingsService.delete(listing.id)).success).toBe(false)
    tokenStore.set('u1')
    expect((await listingsService.delete(listing.id)).success).toBe(true)
    const conversation = await db.Conversations.get('c1')
    expect(conversation?.buyerId).toBe('u1')
    expect(conversation?.listingId).toBe('l1')
    const messages = await db.Messages.where('conversationId').equals('c1').toArray()
    expect(messages[0]).toMatchObject({ text: expect.any(String), createdAt: expect.any(String), read: expect.any(Boolean) })
    await conversationsService.sendMessage('c1', 'read contract')
    expect((await db.Messages.where('conversationId').equals('c1').toArray()).some(m => m.text === 'read contract')).toBe(true)
    await reportsService.create('l1', 'test description')
    expect((await db.Reports.where('listingId').equals('l1').first())?.description).toBe('test description')
  })
})
