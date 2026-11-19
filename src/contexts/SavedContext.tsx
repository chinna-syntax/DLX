import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import type { ReactNode } from 'react'
import { listingsService } from '@/services/listings'
import { idOf } from '@/services/storage'
import { useAuth } from './AuthContext'
interface SavedContextValue { savedIds: Set<string>; toggleSaved: (id: string) => Promise<void>; isSaved: (id: string) => boolean }
const SavedContext = createContext<SavedContextValue | null>(null)
export function SavedProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  useEffect(() => {
    if (!isAuthenticated) { setSavedIds(new Set()); return }
    listingsService.getSaved().then(r => { if (r.success && r.data) setSavedIds(new Set(r.data.data.map(x => idOf(x)))) })
  }, [isAuthenticated])
  const toggleSaved = useCallback(async (id: string) => {
    const result = await listingsService.toggleSave(id)
    if (result.success && result.data) setSavedIds(prev => { const next = new Set(prev); result.data!.saved ? next.add(id) : next.delete(id); return next })
  }, [])
  const isSaved = useCallback((id: string) => savedIds.has(id), [savedIds])
  return <SavedContext.Provider value={{ savedIds, toggleSaved, isSaved }}>{children}</SavedContext.Provider>
}
export function useSaved() { const ctx = useContext(SavedContext); if (!ctx) throw new Error('useSaved must be used within SavedProvider'); return ctx }


