import { db, seedDatabase } from '../db'
import { listingsService } from './listings'
export const usersService = {
  async getById(id: string) { await seedDatabase(); const user = await db.Students.get(id); return user ? { success: true as const, data: user } : { success: false as const, error: { message: 'Profile not found' } } },
  async getListings(id: string) { const response = await listingsService.getAll(); if (!response.success) return response; return { ...response, data: { ...response.data, data: response.data.data.filter(l => l.seller.id === id) } } },
  async getStats(id: string) { await seedDatabase(); const records = await db.Listings.where('sellerId').equals(id).toArray(); return { success: true as const, data: { total: records.length, available: records.filter(record => record.status === 'AVAILABLE' || record.status === 'RESERVED').length, exchanged: records.filter(record => record.status === 'EXCHANGED').length } } }
}
