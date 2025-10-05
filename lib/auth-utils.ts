import bcrypt from 'bcryptjs'
import { prisma } from './prisma'
import type { UserRole } from '@prisma/client'

export interface CreateUserData {
  email: string
  password: string
  name: string
  age: number
}

export interface LoginCredentials {
  email: string
  password: string
}

export class AuthService {
  static async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 12)
  }

  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword)
  }

  static determineRole(age: number): UserRole {
    if (age <= 14) return 'kid'
    if (age >= 15 && age <= 17) return 'adult'
    return 'adult' // 18+ defaults to adult, can be upgraded to professional by admin
  }

  static getPermissions(role: UserRole, isAdmin = false) {
    if (isAdmin) {
      return {
        accessKids: true,
        accessAdult: true,
        accessProfessional: true,
        isAdmin: true,
      }
    }

    switch (role) {
      case 'professional':
        return {
          accessKids: true,
          accessAdult: true,
          accessProfessional: true,
          isAdmin: false,
        }
      case 'adult':
        return {
          accessKids: false,
          accessAdult: true,
          accessProfessional: false,
          isAdmin: false,
        }
      case 'kid':
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

  static async createUser(userData: CreateUserData) {
    try {
      const { email, password, name, age } = userData

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      })

      if (existingUser) {
        return { success: false, error: 'User already exists' }
      }

      const role = this.determineRole(age)
      const permissions = this.getPermissions(role)

      const hashedPassword = await this.hashPassword(password)

      const newUser = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          age,
          role,
          isActive: true,
        },
        select: {
          id: true,
          email: true,
          name: true,
          age: true,
          role: true,
          isActive: true,
          createdAt: true,
        }
      })

      return {
        success: true,
        user: {
          ...newUser,
          permissions
        }
      }
    } catch (error) {
      console.error('Error creating user:', error)
      return { success: false, error: 'Failed to create user' }
    }
  }

  static async authenticateUser(credentials: LoginCredentials) {
    try {
      const { email, password } = credentials

      const user = await prisma.user.findUnique({
        where: { email }
      })

      if (!user || !user.isActive) {
        return { success: false, error: 'Invalid credentials' }
      }

      const isValidPassword = await this.verifyPassword(password, user.password)

      if (!isValidPassword) {
        return { success: false, error: 'Invalid credentials' }
      }

      const permissions = this.getPermissions(user.role, user.role === 'admin')

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          age: user.age,
          role: user.role,
          permissions,
          isActive: user.isActive,
          createdAt: user.createdAt,
        }
      }
    } catch (error) {
      console.error('Error authenticating user:', error)
      return { success: false, error: 'Authentication failed' }
    }
  }

  static async getUserById(id: number) {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          name: true,
          age: true,
          role: true,
          isActive: true,
          createdAt: true,
        }
      })

      if (!user) return null

      const permissions = this.getPermissions(user.role, user.role === 'admin')

      return {
        ...user,
        permissions
      }
    } catch (error) {
      console.error('Error fetching user:', error)
      return null
    }
  }

  static async updateUserRole(userId: number, newRole: UserRole, adminUserId: number) {
    try {
      // Verify admin is making the change
      const adminUser = await prisma.user.findUnique({
        where: { id: adminUserId }
      })

      if (!adminUser || adminUser.role !== 'admin') {
        return { success: false, error: 'Unauthorized' }
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { role: newRole },
        select: {
          id: true,
          email: true,
          name: true,
          age: true,
          role: true,
          isActive: true,
        }
      })

      const permissions = this.getPermissions(newRole, newRole === 'admin')

      return {
        success: true,
        user: {
          ...updatedUser,
          permissions
        }
      }
    } catch (error) {
      console.error('Error updating user role:', error)
      return { success: false, error: 'Failed to update role' }
    }
  }

  static async getAllUsers() {
    try {
      const users = await prisma.user.findMany({
        where: { isActive: true },
        select: {
          id: true,
          email: true,
          name: true,
          age: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' }
      })

      return users.map(user => ({
        ...user,
        permissions: this.getPermissions(user.role, user.role === 'admin')
      }))
    } catch (error) {
      console.error('Error fetching users:', error)
      return []
    }
  }
}
