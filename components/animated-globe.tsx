"use client"

import { useEffect, useRef } from "react"

export function AnimatedGlobe() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * window.devicePixelRatio
      canvas.height = rect.height * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    let animationId: number
    let rotation = 0

    const drawGlobe = () => {
      const centerX = canvas.offsetWidth / 2
      const centerY = canvas.offsetHeight / 2
      const radius = Math.max(10, Math.min(centerX, centerY) - 20)

      // Clear canvas
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)

      // Draw globe outline
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
      ctx.strokeStyle = "rgba(101, 163, 204, 0.6)"
      ctx.lineWidth = 2
      ctx.stroke()

      // Draw latitude lines
      for (let i = 1; i < 6; i++) {
        const y = centerY + radius * Math.cos((i * Math.PI) / 6) * 0.8
        ctx.beginPath()
        ctx.ellipse(centerX, y, radius * 0.9, radius * 0.2, 0, 0, Math.PI * 2)
        ctx.strokeStyle = "rgba(101, 163, 204, 0.3)"
        ctx.lineWidth = 1
        ctx.stroke()
      }

      // Draw longitude lines
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI) / 4 + rotation
        ctx.beginPath()
        const ellipseRadiusX = Math.max(1, radius * Math.abs(Math.cos(angle)))
        ctx.ellipse(centerX, centerY, ellipseRadiusX, radius, angle, 0, Math.PI * 2)
        ctx.strokeStyle = "rgba(101, 163, 204, 0.3)"
        ctx.lineWidth = 1
        ctx.stroke()
      }

      // Draw climate risk points (simulated data points)
      const riskPoints = [
        { lat: 0.3, lng: 0.5, risk: "high" },
        { lat: -0.2, lng: -0.3, risk: "medium" },
        { lat: 0.6, lng: 0.8, risk: "low" },
        { lat: -0.4, lng: 0.2, risk: "high" },
        { lat: 0.1, lng: -0.6, risk: "medium" },
      ]

      riskPoints.forEach((point) => {
        const x = centerX + point.lng * radius * Math.cos(rotation)
        const y = centerY + point.lat * radius

        // Only draw points on the visible hemisphere
        if (Math.cos(point.lng + rotation) > 0) {
          ctx.beginPath()
          ctx.arc(x, y, 4, 0, Math.PI * 2)

          switch (point.risk) {
            case "high":
              ctx.fillStyle = "rgba(248, 113, 113, 0.8)"
              break
            case "medium":
              ctx.fillStyle = "rgba(251, 191, 36, 0.8)"
              break
            case "low":
              ctx.fillStyle = "rgba(34, 197, 94, 0.8)"
              break
          }

          ctx.fill()

          // Add glow effect
          ctx.shadowColor = ctx.fillStyle
          ctx.shadowBlur = 10
          ctx.fill()
          ctx.shadowBlur = 0
        }
      })

      rotation += 0.005
      animationId = requestAnimationFrame(drawGlobe)
    }

    drawGlobe()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return <canvas ref={canvasRef} className="w-full h-full" style={{ width: "100%", height: "100%" }} />
}
