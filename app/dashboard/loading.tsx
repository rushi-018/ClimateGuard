export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="h-8 bg-muted rounded w-1/3 mb-2 animate-pulse"></div>
          <div className="h-4 bg-muted rounded w-2/3 animate-pulse"></div>
        </div>
        
        <div className="grid gap-6">
          {/* Map skeleton */}
          <div className="h-96 bg-muted rounded-lg animate-pulse flex items-center justify-center">
            <div className="text-muted-foreground">Loading Dashboard...</div>
          </div>
          
          {/* Cards skeleton */}
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="h-48 bg-muted rounded-lg animate-pulse"></div>
            <div className="h-48 bg-muted rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  )
}