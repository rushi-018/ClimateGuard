export default function GlobalLoading() {
  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="h-8 bg-muted rounded w-1/3 mb-2 animate-pulse"></div>
          <div className="h-4 bg-muted rounded w-2/3 animate-pulse"></div>
        </div>
        
        <div className="grid gap-6">
          {/* Global map skeleton */}
          <div className="h-[70vh] bg-muted rounded-lg animate-pulse flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
              <div className="text-muted-foreground">Loading Global Climate View...</div>
            </div>
          </div>
          
          {/* Statistics skeleton */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="h-32 bg-muted rounded-lg animate-pulse"></div>
            <div className="h-32 bg-muted rounded-lg animate-pulse"></div>
            <div className="h-32 bg-muted rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  )
}