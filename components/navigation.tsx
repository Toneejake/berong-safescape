"use client"

import Link from "next/link"
import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Bell, LogOut, User, Menu, X, Home, Users, Briefcase, Baby, Shield } from "lucide-react"
import Image from "next/image"
import { NotificationPopover } from "@/components/ui/notification-popover"

export function Navigation() {
  const { user, logout, isAuthenticated } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <>
      {/* Official BFP Header */}
      <div className="bg-gradient-to-r from-red-700 to-red-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3">
            {/* Left Section - Official Title */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <Image
                  src="/bfp logo.png"
                  alt="Bureau of Fire Protection Logo"
                  width={60}
                  height={60}
                  className="object-contain"
                />
                <div>
                  <h1 className="text-xl md:text-2xl font-bold leading-tight">
                    BUREAU OF FIRE PROTECTION STA CRUZ LAGUNA
                  </h1>
                  <p className="text-sm md:text-base font-semibold text-red-10">
                    
                  </p>
                </div>
              </div>
            </div>

            {/* Right Section - Philippine Seal & Time */}
            <div className="flex items-center gap-4">
              {/* <Image
                src="/stacruz.png"
                alt="Republic of the Philippines Seal"
                width={50}
                height={50}
                className="object-contain"
              /> */}
              <div className="hidden md:block text-right">
                <p className="text-xs text-red-100">Republic of the Philippines</p>
                <p className="text-xs text-red-200">Philippine Standard Time:</p>
                <p className="text-sm font-semibold">{new Date().toLocaleString('en-US', {
                  timeZone: 'Asia/Manila',
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                })}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo Section */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                  <Image
                    src="/stacruz.png"
                    alt="Republic of the Philippines Seal"
                    width={50}
                    height={50}
                    className="object-contain"
                  />
                <div>
                  <h2 className="text-base font-bold text-red-700">Berong E-Learning</h2>
                  <p className="text-xs text-gray-600">Fire Safety Education Platform</p>
                </div>
              </div>
            </div>

            {/* Desktop Navigation Links - Right Aligned */}
            <div className="hidden md:flex items-center space-x-6">
              <Link
                href="/"
                className="flex items-center gap-2 text-gray-700 hover:text-red-70 font-medium transition-colors px-3 py-2 rounded-md hover:bg-red-50"
              >
                <Home className="h-4 w-4" />
                Dashboard
              </Link>

              {isAuthenticated && user?.permissions.accessProfessional && (
                <Link
                  href="/professional"
                  className="flex items-center gap-2 text-gray-700 hover:text-red-70 font-medium transition-colors px-3 py-2 rounded-md hover:bg-red-50"
                >
                  <Briefcase className="h-4 w-4" />
                  Professional
                </Link>
              )}

              {isAuthenticated && user?.permissions.accessAdult && (
                <Link
                  href="/adult"
                  className="flex items-center gap-2 text-gray-700 hover:text-red-700 font-medium transition-colors px-3 py-2 rounded-md hover:bg-red-50"
                >
                  <Users className="h-4 w-4" />
                  Adult
                </Link>
              )}

              {isAuthenticated && user?.permissions.accessKids && (
                <Link
                  href="/kids"
                  className="flex items-center gap-2 text-gray-700 hover:text-red-700 font-medium transition-colors px-3 py-2 rounded-md hover:bg-red-50"
                >
                  <Baby className="h-4 w-4" />
                  Kids
                </Link>
              )}

              {isAuthenticated && user?.role === "admin" && (
                <Link
                  href="/admin"
                  className="flex items-center gap-2 text-gray-700 hover:text-red-700 font-medium transition-colors px-3 py-2 rounded-md hover:bg-red-50"
                >
                  <Shield className="h-4 w-4" />
                  Admin
                </Link>
              )}
            </div>

            {/* User Section - Right Aligned */}
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <div className="hidden sm:block text-right mr-3">
                    <p className="text-sm font-semibold text-gray-90">{user?.name}</p>
                    <p className="text-xs text-gray-60 capitalize">{user?.role}</p>
                  </div>
                  {/*Notification Settings*/}
                  <NotificationPopover />
                  <Link href="/profile">
                    <Button variant="outline" size="icon" className="border-red-200 text-red-700 hover:bg-red-50">
                      <User className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={logout}
                    className="border-red-200 text-red-700 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <Link href="/auth">
                  <Button className="bg-red-700 hover:bg-red-800 text-white font-semibold px-6">
                    Sign In
                  </Button>
                </Link>
              )}

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-gray-700"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                href="/"
                className="flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium text-gray-70 hover:text-red-700 hover:bg-red-50 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Home className="h-5 w-5" />
                Dashboard
              </Link>

              {isAuthenticated && user?.permissions.accessProfessional && (
                <Link
                  href="/professional"
                  className="flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-red-700 hover:bg-red-50 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Briefcase className="h-5 w-5" />
                  Professional
                </Link>
              )}

              {isAuthenticated && user?.permissions.accessAdult && (
                <Link
                  href="/adult"
                  className="flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-red-70 hover:bg-red-50 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Users className="h-5 w-5" />
                  Adult
                </Link>
              )}

              {isAuthenticated && user?.permissions.accessKids && (
                <Link
                  href="/kids"
                  className="flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-red-70 hover:bg-red-50 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Baby className="h-5 w-5" />
                  Kids
                </Link>
              )}

              {isAuthenticated && user?.role === "admin" && (
                <Link
                  href="/admin"
                  className="flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-red-700 hover:bg-red-50 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Shield className="h-5 w-5" />
                  Admin
                </Link>
              )}

              {/* Mobile User Info */}
              {isAuthenticated && (
                <div className="px-3 py-3 border-t border-gray-200 mt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-60 capitalize">{user?.role}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={logout}
                      className="border-red-200 text-red-700 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  )
}
