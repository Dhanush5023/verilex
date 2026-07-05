import React from 'react'

export default function LogoIcon({ size = 20 }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      width={size} 
      height={size} 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      style={{ display: 'block', color: 'var(--brand-accent, #3b82f6)' }}
    >
      {/* Modern V + Checkmark + Law Pillars shield monogram */}
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7s0 6 8 10z" />
      <path d="M9 11l2 2 4-4" />
    </svg>
  )
}
