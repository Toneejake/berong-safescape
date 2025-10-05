"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export type UserRole = "guest" | "kid" | "adult" | "professional" | "admin"

export interface User {
  id: number
  email: string
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
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (email: string, password: string, name: string, age: number) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  isAuthenticated: boolean
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing session on mount
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const storedUser = localStorage.getItem("bfp_user")
      if (storedUser) {
        const userData = JSON.parse(storedUser)
        setUser(userData)
      }
    } catch (error) {
      console.error("Error checking auth status:", error)
      localStorage.removeItem("bfp_user")
    } finally {
      setLoading(false)
    }
  }

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

  const register = async (email: string, password: string, name: string, age: number): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true)

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name, age }),
      })

      const data = await response.json()

      if (response.ok) {
        // Registration successful
        return { success: true }
      } else {
        return { success: false, error: data.error || 'Registration failed' }
      }
    } catch (error) {
      console.error("Registration error:", error)
      return { success: false, error: 'Network error occurred' }
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true)

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        const userWithPermissions = {
          ...data.user,
          permissions: determinePermissions(data.user.role, data.user.role === 'admin')
        }

        setUser(userWithPermissions)
        localStorage.setItem("bfp_user", JSON.stringify(userWithPermissions))

        // Set HTTP cookie for middleware (development-friendly)
        document.cookie = `bfp_user=${encodeURIComponent(JSON.stringify(userWithPermissions))}; path=/; max-age=86400`

        return { success: true }
      } else {
        return { success: false, error: data.error || 'Login failed' }
      }
    } catch (error) {
      console.error("Login error:", error)
      return { success: false, error: 'Network error occurred' }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("bfp_user")
    // Clear HTTP cookie
    document.cookie = "bfp_user=; path=/; max-age=0; samesite=strict"
    // Clear any server-side sessions if needed
    fetch('/api/auth/logout', { method: 'POST' }).catch(console.error)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        register,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
