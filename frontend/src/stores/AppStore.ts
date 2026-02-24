import { create } from 'zustand'

export type AppStore = {
  loaded: boolean
  setLoaded: (loaded: boolean) => void
}

const useAppStore = create<AppStore>()((set, get) => ({
  loaded: false,
  setLoaded: (loaded) => set({ loaded }),
}))

export default useAppStore
