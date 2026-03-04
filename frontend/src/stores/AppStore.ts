import { refreshAuth } from '@/lib/pb/auth'
import { User } from '@/types'
import { create } from 'zustand'

export type AppStore = {
  authLoaded: boolean
  user: User | null
  setUser: (user: User | null) => void
  refreshAuth: () => void
}

const useAppStore = create<AppStore>()((set, get) => ({
  authLoaded: false,
  user: null,
  /**
   * For setting the user after login, logout, etc.
   */
  setUser: (user) => set({ user }),
  /**
   * Refresh the auth token and set the user with latest info
   * Sets to null if user is not authed
   */
  refreshAuth: () => {
    set({ authLoaded: false })
    refreshAuth().then((user) => {
      set({
        authLoaded: true,
        user
      })
    }).catch((e) => {
      console.error('Failed to refresh auth', e)
    })
  }
}))

// initial auth refresh
useAppStore.getState().refreshAuth()

export default useAppStore
