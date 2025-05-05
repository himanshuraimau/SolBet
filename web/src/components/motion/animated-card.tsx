"use client"

import type React from "react"

import { useState, useRef, type ReactNode } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface AnimatedCardProps {
  children: ReactNode
  className?: string
  hoverScale?: number
  rotateIntensity?: number
  glareIntensity?: number
  showGlare?: boolean
}

export default function AnimatedCard({
  children,
  className,
  hoverScale = 1.05,
  rotateIntensity = 10,
  glareIntensity = 0.2,
  showGlare = true,
}: AnimatedCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !isHovered) return

    const rect = cardRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    // Calculate normalized position (-1 to 1)
    const normalizedX = (e.clientX - centerX) / (rect.width / 2)
    const normalizedY = (e.clientY - centerY) / (rect.height / 2)

    // Throttle updates to reduce layout shifts
    requestAnimationFrame(() => {
      setMousePosition({ x: normalizedX, y: normalizedY })
    })
  }

  return (
    <motion.div
      ref={cardRef}
      className={cn("relative overflow-hidden", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setIsHovered(false)}
      animate={{
        scale: isHovered ? hoverScale : 1,
        rotateY: isHovered ? -mousePosition.x * rotateIntensity : 0,
        rotateX: isHovered ? mousePosition.y * rotateIntensity : 0,
      }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 15,
      }}
      style={{
        transformStyle: "preserve-3d",
      }}
    >
      {children}

      {showGlare && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${50 + mousePosition.x * 50}% ${
              50 + mousePosition.y * 50
            }%, rgba(255, 255, 255, ${isHovered ? glareIntensity : 0}), transparent 100%)`,
          }}
          animate={{
            opacity: isHovered ? 1 : 0,
          }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 15,
          }}
        />
      )}
    </motion.div>
  )
}
