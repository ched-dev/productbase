import { useEffect, useState } from 'react'
import type { CachedUser } from '@/types'
import { refreshAuth, userLogin, userLogout, userSignUp } from '@/lib/pb/auth'
import { getCachedUser } from '@/lib/pb'
import type { SignInInfo, SignUpInfo } from '@/types/Auth'

export function useAuth() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<CachedUser | null>(null)

  useEffect(() => {
    refreshAuth().then(() => {
      setUser(getCachedUser())
      setLoading(false)
    })
  }, [])

  /**
   * Login the user to the pocketbase backend
   */
  const login = async (account: SignInInfo) => {
    const result = await userLogin(account)
    setUser(result.user ?? null)
  }

  /**
   * Sign up the user for an account in pocketbase (a user of the app)
   */
  const signup = async (account: SignUpInfo) => {
    await userSignUp(account)
  }

  /**
   * Logout the currently authed user
   */
  const logout = async () => {
    await userLogout()
    setUser(null)
  }

  return { loading, user, login, signup, logout }
}
