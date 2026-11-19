import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import type { ReactNode } from 'react'
import type { User, AuthState } from '@/types'
import { authService } from '@/services/auth'
import { tokenStore } from '@/services/storage'
import { seedDatabase } from '../db'

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>
  register: (data: Record<string, unknown>) => Promise<void>
  logout: () => void
  switchProfile: (userId: string) => Promise<void>
  updateUser: (user: Partial<User>) => Promise<void>
}
const AuthContext = createContext<AuthContextValue | null>(null)
const message = (error: { message?: string } | undefined) => error?.message ?? 'Something went wrong'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, token: tokenStore.get(), isAuthenticated: Boolean(tokenStore.get()), isLoading: true })
  useEffect(() => {
    void seedDatabase()
    if (!tokenStore.get()) { setState(s => ({ ...s, isLoading: false })); return }
    authService.me().then(result => {
      if (result.success && result.data) setState({ user: result.data, token: tokenStore.get(), isAuthenticated: true, isLoading: false })
      else { tokenStore.clear(); setState({ user: null, token: null, isAuthenticated: false, isLoading: false }) }
    }).catch(() => setState({ user: null, token: null, isAuthenticated: false, isLoading: false }))
  }, [])
  const login = useCallback(async (email: string, password: string) => {
    setState(s => ({ ...s, isLoading: true }))
    const result = await authService.login({ email, password })
    if (!result.success || !result.data) { setState(s => ({ ...s, isLoading: false })); throw new Error(message((result as any).error)) }
    setState({ user: result.data.user, token: result.data.token, isAuthenticated: true, isLoading: false })
  }, [])
  const register = useCallback(async (data: Record<string, unknown>) => {
    setState(s => ({ ...s, isLoading: true }))
    const result = await authService.register(data as never)
    if (!result.success || !result.data) { setState(s => ({ ...s, isLoading: false })); throw new Error(message((result as any).error)) }
    setState({ user: result.data.user, token: result.data.token, isAuthenticated: true, isLoading: false })
  }, [])
  const logout = useCallback(() => { void authService.logout(); setState({ user: null, token: null, isAuthenticated: false, isLoading: false }) }, [])
  const switchProfile = useCallback(async (userId: string) => {
    tokenStore.set(userId)
    const result = await authService.me()
    if (result.success && result.data) setState({ user: result.data, token: userId, isAuthenticated: true, isLoading: false })
  }, [])
  const updateUser = useCallback(async (updates: Partial<User>) => {
    const result = await authService.updateProfile(updates)
    if (!result.success || !result.data) throw new Error(message((result as any).error))
    const updatedUser = result.data
    setState(s => ({ ...s, user: updatedUser }))
  }, [])
  return <AuthContext.Provider value={{ ...state, login, register, logout, switchProfile, updateUser }}>{children}</AuthContext.Provider>
}
export function useAuth() { const ctx = useContext(AuthContext); if (!ctx) throw new Error('useAuth must be used within AuthProvider'); return ctx }



