import type { Conversation, Message, PaginatedResponse } from '@/types'
import { db, seedDatabase } from '../db'
import { tokenStore } from './storage'
const wrap = <T>(data: T) => ({ success: true as const, data })
export const conversationsService = {
  async getAll() { await seedDatabase(); const uid = tokenStore.get(); const records = (await db.Conversations.toArray()).filter(c => !uid || c.buyerId === uid || c.sellerId === uid); const data = await Promise.all(records.map(async c => { const messages = await db.Messages.where('conversationId').equals(c.id).sortBy('createdAt'); const unreadCount = uid ? messages.filter(m => !m.read && m.senderId !== uid).length : 0; const last = messages[messages.length - 1]; return { ...c, unreadCount, lastMessage: last ? { ...last, content: last.text, sentAt: last.createdAt, isRead: last.read } : undefined, participants: [], listingId: c.listingId } as unknown as Conversation })); return wrap({ data, total: data.length, page: 1, limit: 50, hasMore: false } as PaginatedResponse<Conversation>) },
  async getById(id: string) { const c = await db.Conversations.get(id); return c ? wrap({ ...c, participants: [] } as unknown as Conversation) : { success: false as const, error: { message: 'Conversation not found' } } },
  async getMessages(id: string) { const data = (await db.Messages.where('conversationId').equals(id).sortBy('createdAt')).map(m => ({ ...m, content: m.text, sentAt: m.createdAt, isRead: m.read })); return wrap({ data, total: data.length, page: 1, limit: 100, hasMore: false } as PaginatedResponse<Message>) },
  async sendMessage(id: string, content: string) {
    const senderId = tokenStore.get()
    const conversation = await db.Conversations.get(id)
    if (!conversation || !senderId || ![conversation.buyerId, conversation.sellerId].includes(senderId)) return { success: false as const, error: { message: 'You cannot send messages in this conversation.' } }
    const record = { id: crypto.randomUUID(), conversationId: id, senderId, text: content, createdAt: new Date().toISOString(), read: false }
    await db.transaction('rw', [db.Messages, db.Conversations], async () => {
      await db.Messages.add(record)
      await db.Conversations.update(id, { unreadCount: conversation.unreadCount + 1, updatedAt: record.createdAt })
    })
    return wrap({ ...record, content, sentAt: record.createdAt, isRead: false } as Message)
  },
  async startConversation(listingId: string, content: string) {
    const listing = await db.Listings.get(listingId); const me = await db.Students.get(tokenStore.get() ?? ''); const seller = listing && await db.Students.get(listing.sellerId)
    if (!listing || !me || !seller) return { success: false as const, error: { message: 'Select a profile first.' } }
    if (me.id === seller.id) return { success: false as const, error: { message: 'You cannot message yourself.' } }
    const existing = await db.Conversations.where('[listingId+buyerId+sellerId]').equals([listingId, me.id, seller.id]).first()
    if (existing) { const sent = await this.sendMessage(existing.id, content); return sent.success ? wrap({ ...existing, updatedAt: new Date().toISOString() } as unknown as Conversation) : sent }
    const conversation = { id: crypto.randomUUID(), listingId, buyerId: me.id, sellerId: seller.id, unreadCount: 0, updatedAt: new Date().toISOString() }
    await db.Conversations.add(conversation); await this.sendMessage(conversation.id, content); return wrap(conversation as unknown as Conversation)
  },
  async markRead(id: string) { const currentId = tokenStore.get(); const conversation = await db.Conversations.get(id); if (!conversation || !currentId) return { success: false as const, error: { message: 'Conversation not found.' } }; const records = await db.Messages.where('conversationId').equals(id).toArray(); const unread = records.filter(message => !message.read && message.senderId !== currentId); await db.transaction('rw', [db.Messages, db.Conversations], async () => { await db.Messages.bulkPut(unread.map(message => ({ ...message, read: true }))); await db.Conversations.update(id, { unreadCount: Math.max(0, conversation.unreadCount - unread.length) }) }); return wrap({ updated: unread.length }) }
}
