import type { User, LoginFormData, RegisterFormData } from '@/types'
import { db, seedDatabase } from '../db'
import { tokenStore } from './storage'
const ok = <T>(data: T) => ({ success: true as const, data })
const fail = (message: string) => ({ success: false as const, error: { message } })
export const authService = {
  async login(data: LoginFormData) {
    await seedDatabase()
    let user = await db.Students.where('email').equals(data.email).first()
    if (!user) return fail('No local profile found for this email.')
    tokenStore.set(user.id)
    return ok({ user, token: user.id })
  },
  async register(data: RegisterFormData) {
    await seedDatabase()
    const user: User = { id: crypto.randomUUID(), name: data.name, email: data.email, department: data.department, academicYear: data.academicYear, university: data.university, hostelBlock: data.hostelBlock, phone: data.phone, joinedAt: new Date().toISOString(), isVerified: false, listingsCount: 0, rating: 0, ratingCount: 0 }
    await db.Students.add(user); await db.AppMetadata.put({ key: `auth:${user.id}`, value: JSON.stringify({ email: user.email, password: data.password }) }); tokenStore.set(user.id)
    return ok({ user, token: user.id })
  },
  async logout() { tokenStore.clear() },
  async me() { await seedDatabase(); const user = await db.Students.get(tokenStore.get() ?? ''); return user ? ok(user) : fail('Select a local profile to continue.') },
  async updateProfile(data: Partial<User>) { const id = tokenStore.get(); if (!id) return fail('Select a profile first.'); const user = await db.Students.get(id); if (!user) return fail('Profile not found.'); const updated = { ...user, ...data, id }; await db.Students.put(updated); return ok(updated) }
}

