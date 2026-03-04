import { useEffect, useState } from 'react'
import type { User } from '@/types/User'
import { refreshAuth, userLogin, userLogout, userSignUp } from '@/lib/pb/auth'
import { usePbClient } from '@/lib/pb/client'
import type { SignInInfo, SignUpInfo } from '@/types/Auth'

const pb = usePbClient()

export function useAuth() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    refreshAuth().then(() => {
      setUser(pb.authStore.record as User | null)
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
