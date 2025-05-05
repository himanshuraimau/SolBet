"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"

interface FadeInProps {
  children: ReactNode
  delay?: number
  duration?: number
  className?: string
  direction?: "up" | "down" | "left" | "right" | "none"
  distance?: number
}

export default function FadeIn({
  children,
  delay = 0,
  duration = 0.5,
  className,
  direction = "up",
  distance = 20,
}: FadeInProps) {
  const getDirectionalProps = () => {
    switch (direction) {
      case "up":
        return { y: distance }
      case "down":
        return { y: -distance }
      case "left":
        return { x: distance }
      case "right":
        return { x: -distance }
      case "none":
        return {}
    }
  }

  return (
    <motion.div
      className={className}
      initial={{
        opacity: 0,
        ...getDirectionalProps(),
      }}
      animate={{
        opacity: 1,
        x: 0,
        y: 0,
      }}
      transition={{
        duration,
        delay,
        ease: "easeOut",
      }}
    >
      {children}
    </motion.div>
  )
}
