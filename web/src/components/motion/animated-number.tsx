"use client"

import { useEffect, useState } from "react"
import { motion, useSpring, useMotionValue, useTransform } from "framer-motion"

interface AnimatedNumberProps {
  value: number
  duration?: number
  formatValue?: (value: number) => string
  className?: string
}

export default function AnimatedNumber({
  value,
  duration = 1,
  formatValue = (v) => v.toFixed(2),
  className,
}: AnimatedNumberProps) {
  const [prevValue, setPrevValue] = useState(value)
  const springValue = useSpring(prevValue, { duration: duration * 1000 })
  const displayValue = useMotionValue(prevValue)
  const rounded = useTransform(displayValue, (latest) => formatValue(latest))

  useEffect(() => {
    setPrevValue(value)
    springValue.set(value)

    const unsubscribe = springValue.onChange((latest) => {
      displayValue.set(latest)
    })

    return unsubscribe
  }, [value, springValue, displayValue])

  return <motion.span className={className}>{rounded}</motion.span>
}
