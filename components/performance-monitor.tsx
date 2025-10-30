"use client"

import { useEffect } from 'react'
import { performanceService } from '@/lib/performance-optimization'

/**
 * Background performance monitoring component
 * Runs silently without any UI impact
 */
export function PerformanceMonitor() {
  useEffect(() => {
    // Initialize performance monitoring when app loads
    const initPerformance = async () => {
      try {
        // Performance monitoring is automatically initialized in the service constructor
        // Just ensure the service is instantiated
        performanceService.getMetrics() // This initializes the service if not already done
        
        // Set up memory monitoring
        const monitorMemory = () => {
          try {
            if ('memory' in performance) {
              const memoryInfo = (performance as any).memory
              console.debug('[Performance] Memory usage:', {
                used: Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024) + 'MB',
                total: Math.round(memoryInfo.totalJSHeapSize / 1024 / 1024) + 'MB',
                limit: Math.round(memoryInfo.jsHeapSizeLimit / 1024 / 1024) + 'MB'
              })
            }
          } catch (error) {
            console.debug('[Performance] Memory monitoring not available')
          }
        }
        
        // Monitor memory every 30 seconds
        const memoryInterval = setInterval(monitorMemory, 30000)
        
        // Clean up function
        return () => {
          clearInterval(memoryInterval)
        }
      } catch (error) {
        console.debug('[Performance] Monitoring initialization failed:', error)
      }
    }

    const cleanup = initPerformance()
    
    return () => {
      cleanup?.then(cleanupFn => cleanupFn?.())
    }
  }, [])

  // This component renders nothing - it's purely for background monitoring
  return null
}

// Explicit export for better module resolution
export default PerformanceMonitor