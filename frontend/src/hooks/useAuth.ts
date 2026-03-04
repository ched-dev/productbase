import { userLogin, userLogout, userSignUp } from '@/lib/pb/auth'
import type { SignInInfo, SignUpInfo } from '@/types/Auth'
import useAppStore from '@/stores/AppStore'

/**
 * A thin wrapper around the global AppStore auth values and actions
 */
export function useAuth() {
  const appStore = useAppStore()

  /**
   * Login the user to the pocketbase backend
   */
  const login = async (account: SignInInfo) => {
    const { user } = await userLogin(account)
    appStore.setUser(user ?? null)
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
    appStore.setUser(null)
  }

  /**
   * Refresh the authentication token and update the user
   */
  const refreshAuth = async () => {
    return appStore.refreshAuth()
  }

  return {
    loading: !appStore.authLoaded,
    user: appStore.user,
    login,
    signup,
    logout,
    refreshAuth
  }
}
