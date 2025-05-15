"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Coins, TrendingUp, Shield, Zap } from "lucide-react"
import { motion, useAnimation, useInView } from "framer-motion"

// Fallback component for when 3D visualization fails to load
const FallbackVisualization = () => (
  <div className="h-full w-full flex items-center justify-center bg-linear-to-r from-secondary-purple/30 to-primary-yellow/30 rounded-lg">
    <div className="text-center p-6">
      <div className="text-primary-yellow text-xl font-bold mb-3">SolBet Blockchain</div>
      <div className="text-text-pearl mb-4">Decentralized betting on Solana</div>
      <div className="flex justify-center">
        <div className="h-3 w-3 rounded-full bg-primary-yellow animate-pulse mr-2"></div>
        <div
          className="h-3 w-3 rounded-full bg-secondary-purple animate-pulse mr-2"
          style={{ animationDelay: "0.3s" }}
        ></div>
        <div className="h-3 w-3 rounded-full bg-primary-yellow animate-pulse" style={{ animationDelay: "0.6s" }}></div>
      </div>
    </div>
  </div>
)


export default function Hero() {
  const controls = useAnimation()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const [poolSize, setPoolSize] = useState(1245789)
  const [activeBets, setActiveBets] = useState(328)
  const [visualizationError, setVisualizationError] = useState(false)

  useEffect(() => {
    if (isInView) {
      controls.start("visible")
    }
  }, [controls, isInView])

  // Simulate live updates to pool size
  useEffect(() => {
    const interval = setInterval(() => {
      setPoolSize((prev) => prev + Math.floor(Math.random() * 1000 - 200))
      setActiveBets((prev) => prev + Math.floor(Math.random() * 3 - 1))
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
    },
  }

  return (
    <div className="relative isolate overflow-hidden bg-linear-to-b from-background via-background to-accent-navy/10">
      {/* Animated background elements */}
      <div className="absolute inset-0 -z-10">
        <HeroBackground />
      </div>

      <div
        className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8 lg:py-40"
        ref={ref}
      >
        <motion.div
          className="mx-auto text-center max-w-3xl"
          variants={containerVariants}
          initial="hidden"
          animate={controls}
        >
          <motion.div variants={itemVariants} className="flex gap-x-4 items-center justify-center">
            <div className="rounded-full bg-primary-yellow/10 px-3 py-1 text-sm font-semibold leading-6 text-primary-yellow ring-1 ring-inset ring-primary-yellow/20">
              Decentralized Betting
            </div>
            <div className="h-2 w-2 rounded-full bg-accent-green animate-pulse"></div>
            <span className="text-sm text-muted-foreground">Live on Solana</span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="mt-10 mx-auto text-4xl font-bold tracking-tight text-foreground sm:text-6xl uppercase heading-shadow"
          >
            <span className="text-gradient-primary">Bet</span> on Anything,{" "}
            <span className="text-gradient-secondary">Win</span> with Confidence
          </motion.h1>

          <motion.p variants={itemVariants} className="mt-6 text-lg leading-8 text-muted-foreground">
            SolBet is the premier decentralized betting platform on Solana. Create or join bets on any topic, with
            transparent odds and instant payouts secured by blockchain technology.
          </motion.p>

          <motion.div variants={itemVariants} className="mt-10 flex items-center gap-x-6 justify-center">
            <Button asChild size="lg" className="bg-primary-gradient text-text-plum hover-scale">
              <Link href="/browse">
                Browse Bets
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="hover-scale">
              <Link href="/#how-it-works">How It Works</Link>
            </Button>
          </motion.div>

          {/* Feature highlights */}
          <motion.div variants={containerVariants} className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
            <FeatureHighlight
              icon={<Shield className="h-5 w-5 text-primary-yellow" />}
              title="Secure"
              description="Blockchain-backed bets"
            />
            <FeatureHighlight
              icon={<Coins className="h-5 w-5 text-primary-yellow" />}
              title="Instant"
              description="Immediate payouts"
            />
            <FeatureHighlight
              icon={<TrendingUp className="h-5 w-5 text-primary-yellow" />}
              title="Transparent"
              description="Real-time odds"
            />
            <FeatureHighlight
              icon={<Zap className="h-5 w-5 text-primary-yellow" />}
              title="Fast"
              description="Solana-powered speed"
            />
          </motion.div>
        </motion.div>

      </div>
    </div>
  )
}

function FeatureHighlight({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
      }}
      className="flex flex-col items-center p-3 rounded-lg bg-white/5 backdrop-blur-xs border border-white/10"
    >
      <div className="rounded-full bg-white/10 p-2 mb-2">{icon}</div>
      <h3 className="text-sm font-medium">{title}</h3>
      <p className="text-xs text-muted-foreground text-center">{description}</p>
    </motion.div>
  )
}

function HeroBackground() {
  return (
    <div className="absolute inset-0">
      {/* Grid pattern */}
      <div className="absolute inset-0 bg-grid-white/10 bg-[length:50px_50px] opacity-20" />

      {/* Gradient orbs */}
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary-yellow opacity-10 rounded-full filter blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-secondary-purple opacity-10 rounded-full filter blur-3xl" />

      {/* Animated gradient */}
      <motion.div
        className="absolute inset-0 bg-linear-to-tr from-secondary-purple/5 via-transparent to-primary-yellow/5"
        animate={{
          background: [
            "linear-gradient(to top right, rgba(106,48,204,0.05), transparent, rgba(255,221,0,0.05))",
            "linear-gradient(to top right, rgba(255,221,0,0.05), transparent, rgba(106,48,204,0.05))",
            "linear-gradient(to top right, rgba(106,48,204,0.05), transparent, rgba(255,221,0,0.05))",
          ],
        }}
        transition={{
          duration: 10,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
        }}
      />
    </div>
  )
}

function AnimatedBorder() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <motion.div
        className="absolute inset-0 rounded-lg border border-white/20"
        animate={{
          boxShadow: [
            "0 0 0 0 rgba(255, 221, 0, 0)",
            "0 0 0 3px rgba(255, 221, 0, 0.3)",
            "0 0 0 0 rgba(255, 221, 0, 0)",
          ],
        }}
        transition={{
          duration: 2,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "loop",
        }}
      />
    </div>
  )
}
