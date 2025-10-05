"use client"

import { useEffect, useState } from "react"
import { Navigation } from "@/components/navigation"
import { ImageCarousel } from "@/components/image-carousel"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Target, Eye, Phone, MapPin, Mail, Flame, Users, Briefcase, ArrowRight, Sparkles } from "lucide-react"
import { bfpInfo, type CarouselImage } from "@/lib/mock-data"
import Link from "next/link"

export default function HomePage() {
  const [carouselImages, setCarouselImages] = useState<CarouselImage[]>([])
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<{
    permissions: { accessProfessional: boolean; accessAdult: boolean; accessKids: boolean }
  } | null>(null)

  useEffect(() => {
    // Load carousel images from database
    const loadCarouselImages = async () => {
      try {
        const response = await fetch('/api/content/carousel')
        if (response.ok) {
          const images = await response.json()
          setCarouselImages(images)
        } else {
          console.error('Failed to load carousel images')
        }
      } catch (error) {
        console.error('Error loading carousel images:', error)
      }
    }

    loadCarouselImages()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Carousel */}
        <section className="mb-12">{carouselImages.length > 0 && <ImageCarousel images={carouselImages} />}</section>

        {/* Welcome Section */}
        <section className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4 text-balance">
            Welcome to Berong E-Learning Platform
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto text-pretty">
            Your comprehensive fire safety education hub powered by BFP Sta Cruz. Learn, practice, and master fire
            safety skills through our interactive platform.
          </p>
        </section>

        {/* Quick Stats */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="border-l-4 border-l-primary">
            <CardHeader className="pb-3">
              <CardTitle className="text-2xl font-bold text-primary">24/7</CardTitle>
              <CardDescription>Emergency Response</CardDescription>
            </CardHeader>
          </Card>
          <Card className="border-l-4 border-l-secondary">
            <CardHeader className="pb-3">
              <CardTitle className="text-2xl font-bold text-secondary">1000+</CardTitle>
              <CardDescription>Lives Saved</CardDescription>
            </CardHeader>
          </Card>
          <Card className="border-l-4 border-l-accent">
            <CardHeader className="pb-3">
              <CardTitle className="text-2xl font-bold text-accent">50+</CardTitle>
              <CardDescription>Trained Professionals</CardDescription>
            </CardHeader>
          </Card>
          <Card className="border-l-4 border-l-primary">
            <CardHeader className="pb-3">
              <CardTitle className="text-2xl font-bold text-primary">15</CardTitle>
              <CardDescription>Years of Service</CardDescription>
            </CardHeader>
          </Card>
        </section>

        {/* About BFP Sta Cruz */}
        <section className="mb-12">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Shield className="h-8 w-8 text-primary" />
                <CardTitle className="text-2xl">About BFP Sta Cruz</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-foreground leading-relaxed text-pretty">{bfpInfo.about}</p>
            </CardContent>
          </Card>
        </section>

        {/* Mission and Vision */}
        <section className="grid md:grid-cols-2 gap-6 mb-12">
          <Card className="bg-gradient-to-br from-primary/5 to-secondary/5">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Target className="h-8 w-8 text-primary" />
                <CardTitle className="text-2xl text-primary">Our Mission</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-foreground leading-relaxed text-pretty">{bfpInfo.mission}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-accent/5 to-secondary/5">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Eye className="h-8 w-8 text-accent" />
                <CardTitle className="text-2xl text-accent">Our Vision</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-foreground leading-relaxed text-pretty">{bfpInfo.vision}</p>
            </CardContent>
          </Card>
        </section>

        {/* Learning Sections */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8 text-foreground">Explore Our Learning Sections</h2>
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {(!isAuthenticated || user?.permissions.accessProfessional) && (
              <Link href={isAuthenticated ? "/professional" : "/auth"}>
                <Card className="hover:shadow-xl transition-all cursor-pointer border-l-4 border-l-accent h-full">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <Briefcase className="h-8 w-8 text-accent" />
                      <CardTitle className="text-2xl">Professional</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4 text-pretty">
                      Advanced fire safety training for professionals and emergency responders.
                    </p>
                    <div className="flex items-center gap-2 text-sm text-accent font-semibold">
                      <span>Video Courses</span>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                    {!isAuthenticated && <p className="text-xs text-muted-foreground mt-2">Login required</p>}
                  </CardContent>
                </Card>
              </Link>
            )}

            {(!isAuthenticated || user?.permissions.accessAdult) && (
              <Link href={isAuthenticated ? "/adult" : "/auth"}>
                <Card className="hover:shadow-xl transition-all cursor-pointer border-l-4 border-l-secondary h-full">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <Users className="h-8 w-8 text-secondary" />
                      <CardTitle className="text-2xl">Adult</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4 text-pretty">
                      Essential fire safety knowledge for adults and homeowners.
                    </p>
                    <div className="flex items-center gap-2 text-sm text-secondary font-semibold">
                      <span>Blog Articles</span>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                    {!isAuthenticated && <p className="text-xs text-muted-foreground mt-2">Login required</p>}
                  </CardContent>
                </Card>
              </Link>
            )}

            {(!isAuthenticated || user?.permissions.accessKids) && (
              <Link href={isAuthenticated ? "/kids" : "/auth"}>
                <Card className="hover:shadow-xl transition-all cursor-pointer border-l-4 border-l-primary h-full">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <Sparkles className="h-8 w-8 text-primary" />
                      <CardTitle className="text-2xl">Kids</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4 text-pretty">
                      Fun and interactive fire safety education for children.
                    </p>
                    <div className="flex items-center gap-2 text-sm text-primary font-semibold">
                      <span>Games & Activities</span>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                    {!isAuthenticated && <p className="text-xs text-muted-foreground mt-2">Login required</p>}
                  </CardContent>
                </Card>
              </Link>
            )}
          </div>
        </section>

        {/* Contact Information */}
        <section>
          <Card className="bg-gradient-to-r from-primary to-secondary text-primary-foreground">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-3">
                <Flame className="h-8 w-8" />
                Contact BFP Sta Cruz
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold mb-1">Address</p>
                    <p className="text-white/90 text-sm">{bfpInfo.contact.address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold mb-1">Phone</p>
                    <p className="text-white/90 text-sm">{bfpInfo.contact.phone}</p>
                    <p className="text-white/90 text-sm font-bold">Emergency: {bfpInfo.contact.emergency}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold mb-1">Email</p>
                    <p className="text-white/90 text-sm">{bfpInfo.contact.email}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-muted-foreground">© 2025 Bureau of Fire Protection Sta Cruz. All rights reserved.</p>
          <p className="text-muted-foreground text-sm mt-2">Serving our community with dedication and excellence.</p>
        </div>
      </footer>
    </div>
  )
}
