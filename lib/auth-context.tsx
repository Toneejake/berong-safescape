"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export type UserRole = "guest" | "kid" | "adult" | "professional" | "admin"

export interface User {
  id: number
  username: string
  name: string
  age: number
  role: UserRole
  permissions: {
    accessKids: boolean
    accessAdult: boolean
    accessProfessional: boolean
    isAdmin: boolean
  }
  isActive: boolean
  createdAt: string
}

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (username: string, password: string, name: string, age: number) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  isLoading: boolean
  isLoggingOut: boolean
  isAuthenticated: boolean
  isAuthenticating: boolean
  getRedirectPath: () => string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Helper function to determine redirect path based on user role
function determineRedirectPath(user: User | null): string {
  if (!user) return '/'

  if (user.role === 'admin') return '/admin'
  if (user.role === 'professional') return '/professional'
  if (user.role === 'adult') return '/adult'
  if (user.role === 'kid') return '/kids'

  return '/'
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error('Failed to parse stored user:', error)
        localStorage.removeItem('user')
      }
    }
    setIsLoading(false)
  }, [])

  const determinePermissions = (role: UserRole, isAdmin = false) => {
    if (isAdmin) {
      return {
        accessKids: true,
        accessAdult: true,
        accessProfessional: true,
        isAdmin: true,
      }
    }

    switch (role) {
      case "professional":
        return {
          accessKids: true,
          accessAdult: true,
          accessProfessional: true,
          isAdmin: false,
        }
      case "adult":
        return {
          accessKids: false,
          accessAdult: true,
          accessProfessional: false,
          isAdmin: false,
        }
      case "kid":
        return {
          accessKids: true,
          accessAdult: false,
          accessProfessional: false,
          isAdmin: false,
        }
      default:
        return {
          accessKids: false,
          accessAdult: false,
          accessProfessional: false,
          isAdmin: false,
        }
    }
  }

  const register = async (username: string, password: string, name: string, age: number): Promise<{ success: boolean; error?: string }> => {
    setIsAuthenticating(true)
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, name, age }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        return { success: false, error: data.error || 'Registration failed' }
      }

      setUser(data.user)
      localStorage.setItem('user', JSON.stringify(data.user))

      // Set cookie for middleware
      document.cookie = `bfp_user=${encodeURIComponent(JSON.stringify(data.user))}; path=/; max-age=${60 * 60 * 24 * 7}` // 7 days

      return { success: true }
    } catch (error: any) {
      console.error('Registration error:', error)
      return { success: false, error: 'Network error. Please try again.' }
    } finally {
      setIsAuthenticating(false)
    }
  }

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsAuthenticating(true)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        return { success: false, error: data.error || 'Login failed' }
      }

      setUser(data.user)
      localStorage.setItem('user', JSON.stringify(data.user))

      // Set cookie for middleware
      document.cookie = `bfp_user=${encodeURIComponent(JSON.stringify(data.user))}; path=/; max-age=${60 * 60 * 24 * 7}` // 7 days

      return { success: true }
    } catch (error: any) {
      console.error('Login error:', error)
      return { success: false, error: 'Network error. Please try again.' }
    } finally {
      setIsAuthenticating(false)
    }
  }

  const logout = () => {
    setIsLoggingOut(true)

    // Show loading screen for 1.5 seconds before clearing session
    setTimeout(() => {
      setUser(null)
      localStorage.removeItem('user')
      // Clear cookie
      document.cookie = 'bfp_user=; path=/; max-age=0'
      setIsLoggingOut(false)
      router.push('/')
    }, 1500)
  }

  const getRedirectPath = () => {
    return determineRedirectPath(user)
  }

  const isAuthenticated = user !== null

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading, isLoggingOut, isAuthenticated, isAuthenticating, getRedirectPath }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
