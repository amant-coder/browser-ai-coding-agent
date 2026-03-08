import { useAuthStore } from '@/store/authStore'

export function useAuth() {
  const store = useAuthStore()
  return {
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    token: store.token,
    login: store.login,
    register: store.register,
    logout: store.logout,
    refreshUser: store.refreshUser,
  }
}
