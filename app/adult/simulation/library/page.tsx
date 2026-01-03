'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Search, 
  Grid3X3, 
  List, 
  Copy, 
  Trash2, 
  Edit, 
  Eye, 
  Globe, 
  Lock, 
  User,
  ArrowLeft,
  Plus,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface FloorPlan {
  id: number
  name: string
  description: string | null
  thumbnail: string | null
  uploaderName: string
  isPublic: boolean
  userId: number
  clonedFromId: number | null
  exitCount: number
  processingMethod: string
  createdAt: string
  updatedAt: string
  isOwner: boolean
  canEdit: boolean
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function FloorPlanLibraryPage() {
  const router = useRouter()
  const [floorPlans, setFloorPlans] = useState<FloorPlan[]>([])
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'mine' | 'public'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  
  // Dialog states
  const [cloneDialogOpen, setCloneDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<FloorPlan | null>(null)
  const [cloneName, setCloneName] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  const fetchFloorPlans = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams({
        filter,
        page: '1',
        limit: '20',
        ...(search && { search })
      })
      
      const response = await fetch(`/api/floor-plans?${params}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch floor plans')
      }
      
      setFloorPlans(data.floorPlans)
      setPagination(data.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFloorPlans()
  }, [filter])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchFloorPlans()
  }

  const handleClone = async () => {
    if (!selectedPlan) return
    
    try {
      setActionLoading(true)
      const response = await fetch(`/api/floor-plans/${selectedPlan.id}/clone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: cloneName || `${selectedPlan.name} (Copy)` })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to clone floor plan')
      }
      
      setCloneDialogOpen(false)
      setCloneName('')
      setSelectedPlan(null)
      fetchFloorPlans()
      
      // Optionally navigate to the cloned plan
      // router.push(`/adult/simulation?floorPlanId=${data.floorPlan.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clone')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedPlan) return
    
    try {
      setActionLoading(true)
      const response = await fetch(`/api/floor-plans/${selectedPlan.id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete floor plan')
      }
      
      setDeleteDialogOpen(false)
      setSelectedPlan(null)
      fetchFloorPlans()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete')
    } finally {
      setActionLoading(false)
    }
  }

  const handleUseFloorPlan = (plan: FloorPlan) => {
    // Navigate to simulation with this floor plan
    router.push(`/adult/simulation?floorPlanId=${plan.id}`)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="container mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Floor Plan Library</h1>
            <p className="text-muted-foreground">Browse, clone, and manage floor plans for simulation</p>
          </div>
        </div>
        <Button onClick={() => router.push('/adult/simulation')}>
          <Plus className="h-4 w-4 mr-2" />
          Create New
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <Input
            placeholder="Search floor plans..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" variant="secondary">
            <Search className="h-4 w-4" />
          </Button>
        </form>
        
        <div className="flex gap-2">
          <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="mine">My Plans</TabsTrigger>
              <TabsTrigger value="public">Public</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Empty State */}
      {!loading && floorPlans.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Grid3X3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No floor plans found</h3>
            <p className="text-muted-foreground mb-4">
              {filter === 'mine' 
                ? "You haven't created any floor plans yet." 
                : "No floor plans match your search criteria."}
            </p>
            <Button onClick={() => router.push('/adult/simulation')}>
              Create Your First Floor Plan
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Floor Plans Grid */}
      {!loading && floorPlans.length > 0 && (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          : "flex flex-col gap-3"
        }>
          {floorPlans.map((plan) => (
            <Card key={plan.id} className={viewMode === 'list' ? "flex flex-row" : ""}>
              {/* Thumbnail */}
              <div className={`bg-muted flex items-center justify-center ${
                viewMode === 'grid' ? 'h-40' : 'w-32 h-24'
              }`}>
                {plan.thumbnail ? (
                  <img 
                    src={plan.thumbnail} 
                    alt={plan.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Grid3X3 className="h-12 w-12 text-muted-foreground" />
                )}
              </div>
              
              <div className="flex-1">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base line-clamp-1">{plan.name}</CardTitle>
                    <Badge variant={plan.isPublic ? "default" : "secondary"}>
                      {plan.isPublic ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center gap-1 text-xs">
                    <User className="h-3 w-3" />
                    {plan.uploaderName}
                    {plan.clonedFromId && (
                      <Badge variant="outline" className="ml-2 text-xs">Cloned</Badge>
                    )}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="pb-2">
                  <div className="flex gap-2 text-xs text-muted-foreground">
                    <span>{plan.exitCount} exits</span>
                    <span>•</span>
                    <span>{plan.processingMethod}</span>
                    <span>•</span>
                    <span>{formatDate(plan.createdAt)}</span>
                  </div>
                </CardContent>
                
                <CardFooter className="gap-2 pt-0">
                  <Button 
                    size="sm" 
                    onClick={() => handleUseFloorPlan(plan)}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Use
                  </Button>
                  
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      setSelectedPlan(plan)
                      setCloneName(`${plan.name} (Copy)`)
                      setCloneDialogOpen(true)
                    }}
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Clone
                  </Button>
                  
                  {plan.isOwner && (
                    <>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => router.push(`/adult/simulation?floorPlanId=${plan.id}&edit=true`)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => {
                          setSelectedPlan(plan)
                          setDeleteDialogOpen(true)
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                </CardFooter>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <Button
            variant="outline"
            disabled={pagination.page <= 1}
            onClick={() => {/* Implement pagination */}}
          >
            Previous
          </Button>
          <span className="flex items-center px-4">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => {/* Implement pagination */}}
          >
            Next
          </Button>
        </div>
      )}

      {/* Clone Dialog */}
      <Dialog open={cloneDialogOpen} onOpenChange={setCloneDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clone Floor Plan</DialogTitle>
            <DialogDescription>
              Create a copy of "{selectedPlan?.name}" that you can edit.
              The original will remain unchanged.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Name for your copy"
              value={cloneName}
              onChange={(e) => setCloneName(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCloneDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleClone} disabled={actionLoading}>
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Clone Floor Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Floor Plan</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedPlan?.name}"? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={actionLoading}>
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
