"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { ProfileCompletionModal } from "@/components/profile-completion-modal"
import { trackDailyLogin } from "@/lib/engagement-tracker"

interface ProfileCheckWrapperProps {
  children: React.ReactNode
}

export function ProfileCheckWrapper({ children }: ProfileCheckWrapperProps) {
  const { user, isLoading } = useAuth()
  const [showModal, setShowModal] = useState(false)
  const [hasTrackedLogin, setHasTrackedLogin] = useState(false)

  useEffect(() => {
    // Check if user needs to complete profile
    if (!isLoading && user && user.role !== "admin") {
      // Check profileCompleted flag
      if (user.profileCompleted === false) {
        setShowModal(true)
      }
      
      // Track daily login (only once per session)
      if (!hasTrackedLogin) {
        trackDailyLogin()
        setHasTrackedLogin(true)
      }
    }
  }, [user, isLoading, hasTrackedLogin])

  const handleProfileComplete = () => {
    setShowModal(false)
    // Refresh page to update user data
    window.location.reload()
  }

  if (isLoading) {
    return <>{children}</>
  }

  return (
    <>
      {children}
      {showModal && user && (
        <ProfileCompletionModal
          isOpen={showModal}
          onComplete={handleProfileComplete}
        />
      )}
    </>
  )
}
