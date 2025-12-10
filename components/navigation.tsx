"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Bell, LogOut, User, Menu, X, Home, Users, Briefcase, Baby, Shield } from "lucide-react"
import Image from "next/image"
import { NotificationPopover } from "@/components/ui/notification-popover"

export function Navigation() {
  const { user, logout, isAuthenticated } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [currentTime, setCurrentTime] = useState<string>("")

  // Update time every minute
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleString('en-US', {
        timeZone: 'Asia/Manila',
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }))
    }
    updateTime()
    const interval = setInterval(updateTime, 60000)
    return () => clearInterval(interval)
  }, [])

  return (
    <nav className="bg-red-700 sticky top-0 z-50 shadow-xl relative overflow-hidden">
      {/* Background Image Layer - 10% opacity */}
      <div
        className="absolute inset-0 opacity-10 bg-cover bg-center"
        style={{ backgroundImage: "url('/bfp-firefighters-in-action.jpg')" }}
      />

      {/* Content Layer - Full opacity */}
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">

            {/* LEFT SECTION: Logo + Branding */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {/* Logo */}
              <Image
                src="/bfp logo.png"
                alt="Bureau of Fire Protection Logo"
                width={55}
                height={55}
                className="rounded-full bg-white p-1 object-contain shadow-md"
              />

              {/* Branding */}
              <div>
                <h1 className="text-white text-sm md:text-base font-bold leading-tight whitespace-nowrap">
                  BUREAU OF FIRE PROTECTION STA CRUZ LAGUNA
                </h1>
                <p className="text-yellow-400 font-semibold text-xs md:text-sm">Berong E-Learning</p>
                <p className="text-gray-300 text-xs">Fire Safety Education Platform</p>
              </div>
            </div>

            {/* CENTER SECTION: Nav Links - Desktop */}
            <div className="hidden lg:flex items-center gap-1 flex-grow justify-center">
              <Link
                href="/"
                className="text-white font-semibold text-xs hover:bg-red-600 transition-colors px-3 py-1 rounded"
              >
                DASHBOARD
              </Link>

              {isAuthenticated && user?.permissions.accessProfessional && (
                <Link
                  href="/professional"
                  className="text-white font-semibold text-xs hover:bg-red-600 transition-colors px-3 py-1 rounded"
                >
                  PROFESSIONAL
                </Link>
              )}

              {isAuthenticated && user?.permissions.accessAdult && (
                <Link
                  href="/adult"
                  className="text-white font-semibold text-xs hover:bg-red-600 transition-colors px-3 py-1 rounded"
                >
                  ADULTS
                </Link>
              )}

              {isAuthenticated && user?.permissions.accessKids && (
                <Link
                  href="/kids"
                  className="text-white font-semibold text-xs hover:bg-red-600 transition-colors px-3 py-1 rounded"
                >
                  KIDS
                </Link>
              )}

              {isAuthenticated && user?.role === "admin" && (
                <Link
                  href="/admin"
                  className="text-white font-semibold text-xs hover:bg-red-600 transition-colors px-3 py-1 rounded"
                >
                  ADMIN
                </Link>
              )}
            </div>

            {/* RIGHT SECTION: Time + User Info + Icon Buttons */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {/* Time + User Info Column */}
              <div className="text-right hidden md:block">
                <p className="text-gray-300 text-xs whitespace-nowrap mb-1">
                  {currentTime}
                </p>
                {isAuthenticated && (
                  <>
                    <p className="text-white font-semibold text-sm">{user?.name}</p>
                    <p className="text-yellow-400 text-xs capitalize">{user?.role}</p>
                  </>
                )}
              </div>

              {/* Icon Buttons */}
              {isAuthenticated ? (
                <div className="flex gap-2">
                  <NotificationPopover />
                  <Link href="/profile">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 border-white text-white hover:bg-red-600 hover:border-white bg-transparent"
                    >
                      <User className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={logout}
                    className="h-9 w-9 border-white text-white hover:bg-red-600 hover:border-white bg-transparent"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Link href="/auth">
                  <Button className="bg-yellow-500 hover:bg-yellow-400 text-red-900 font-bold px-6 shadow-md">
                    Sign In
                  </Button>
                </Link>
              )}

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-white hover:bg-red-600"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-red-600 bg-red-800">
            <div className="px-4 py-3 space-y-1">
              <Link
                href="/"
                className="flex items-center gap-3 px-3 py-3 rounded-md text-white font-semibold hover:bg-red-700 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Home className="h-5 w-5" />
                Dashboard
              </Link>

              {isAuthenticated && user?.permissions.accessProfessional && (
                <Link
                  href="/professional"
                  className="flex items-center gap-3 px-3 py-3 rounded-md text-white font-semibold hover:bg-red-700 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Briefcase className="h-5 w-5" />
                  Professional
                </Link>
              )}

              {isAuthenticated && user?.permissions.accessAdult && (
                <Link
                  href="/adult"
                  className="flex items-center gap-3 px-3 py-3 rounded-md text-white font-semibold hover:bg-red-700 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Users className="h-5 w-5" />
                  Adults
                </Link>
              )}

              {isAuthenticated && user?.permissions.accessKids && (
                <Link
                  href="/kids"
                  className="flex items-center gap-3 px-3 py-3 rounded-md text-white font-semibold hover:bg-red-700 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Baby className="h-5 w-5" />
                  Kids
                </Link>
              )}

              {isAuthenticated && user?.role === "admin" && (
                <Link
                  href="/admin"
                  className="flex items-center gap-3 px-3 py-3 rounded-md text-white font-semibold hover:bg-red-700 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Shield className="h-5 w-5" />
                  Admin
                </Link>
              )}

              {/* Mobile User Info */}
              {isAuthenticated && (
                <div className="px-3 py-3 border-t border-red-600 mt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-semibold">{user?.name}</p>
                      <p className="text-yellow-400 text-sm capitalize">{user?.role}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={logout}
                      className="border-white text-white hover:bg-red-600 bg-transparent"
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
      </div>
    </nav>
  )
}
