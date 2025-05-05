"use client"

import Link from "next/link"
import { Twitter, Github, DiscIcon as Discord } from "lucide-react"
import { motion } from "framer-motion"

export default function Footer() {
  return (
    <footer className="bg-linear-to-r from-accent-navy via-secondary-purple to-accent-navy text-text-pearl">
      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* Top section with logo and social links */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="mb-6 md:mb-0"
          >
            <Link href="/" className="flex items-center">
              <span className="font-heading text-3xl font-bold text-gradient-primary">SolBet</span>
            </Link>
            <p className="mt-2 text-sm text-text-pearl/70 max-w-md">
              The premier decentralized betting platform on Solana. Create or join bets on any topic with transparent
              odds.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex space-x-6"
          >
            <Link href="https://twitter.com" className="hover:text-primary-yellow transition-colors group">
              <span className="sr-only">Twitter</span>
              <div className="p-3 rounded-full bg-white/10 group-hover:bg-white/20 transition-all">
                <Twitter className="h-5 w-5" />
              </div>
            </Link>
            <Link href="https://github.com" className="hover:text-primary-yellow transition-colors group">
              <span className="sr-only">GitHub</span>
              <div className="p-3 rounded-full bg-white/10 group-hover:bg-white/20 transition-all">
                <Github className="h-5 w-5" />
              </div>
            </Link>
            <Link href="https://discord.com" className="hover:text-primary-yellow transition-colors group">
              <span className="sr-only">Discord</span>
              <div className="p-3 rounded-full bg-white/10 group-hover:bg-white/20 transition-all">
                <Discord className="h-5 w-5" />
              </div>
            </Link>
          </motion.div>
        </div>

        {/* Middle section with links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-8 border-t border-b border-white/10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <h3 className="text-sm font-semibold mb-4 text-primary-yellow">Platform</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/browse" className="text-sm hover:text-primary-yellow transition-colors">
                  Browse Bets
                </Link>
              </li>
              <li>
                <Link href="/create-bet" className="text-sm hover:text-primary-yellow transition-colors">
                  Create Bet
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-sm hover:text-primary-yellow transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/analytics" className="text-sm hover:text-primary-yellow transition-colors">
                  Analytics
                </Link>
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <h3 className="text-sm font-semibold mb-4 text-primary-yellow">Resources</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/#how-it-works" className="text-sm hover:text-primary-yellow transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="text-sm hover:text-primary-yellow transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-sm hover:text-primary-yellow transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/community" className="text-sm hover:text-primary-yellow transition-colors">
                  Community
                </Link>
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            viewport={{ once: true }}
          >
            <h3 className="text-sm font-semibold mb-4 text-primary-yellow">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-sm hover:text-primary-yellow transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-sm hover:text-primary-yellow transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-sm hover:text-primary-yellow transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm hover:text-primary-yellow transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            viewport={{ once: true }}
          >
            <h3 className="text-sm font-semibold mb-4 text-primary-yellow">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/terms" className="text-sm hover:text-primary-yellow transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm hover:text-primary-yellow transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-sm hover:text-primary-yellow transition-colors">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link href="/compliance" className="text-sm hover:text-primary-yellow transition-colors">
                  Compliance
                </Link>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Bottom section with copyright */}
        <div className="mt-8 flex flex-col md:flex-row justify-between items-center">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            viewport={{ once: true }}
            className="text-sm text-text-pearl/60"
          >
            &copy; {new Date().getFullYear()} SolBet. All rights reserved.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            viewport={{ once: true }}
            className="mt-4 md:mt-0"
          >
            <div className="inline-flex items-center space-x-2">
              <span className="text-xs text-text-pearl/60">Powered by</span>
              <span className="text-gradient-primary font-medium">Solana</span>
              <div className="h-2 w-2 rounded-full bg-accent-green animate-pulse"></div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="relative overflow-hidden h-1">
        <div className="absolute inset-0 bg-primary-gradient"></div>
      </div>
    </footer>
  )
}
