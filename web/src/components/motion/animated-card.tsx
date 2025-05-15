"use client"

import React, { useState, useEffect } from 'react';

interface AnimatedCardProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export default function AnimatedCard({ 
  children, 
  delay = 0, 
  className = ''
}: AnimatedCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay * 1000);
    
    return () => clearTimeout(timer);
  }, [delay]);
  
  const style: React.CSSProperties = {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'scale(1)' : 'scale(0.95)',
    transition: `opacity 0.5s ease, transform 0.5s ease`,
  };
  
  return (
    <div style={style} className={className}>
      {children}
    </div>
  );
}
