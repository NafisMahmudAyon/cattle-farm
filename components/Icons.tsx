import React from 'react'
import { cn } from './cn'

interface IconsProps extends React.SVGProps<SVGSVGElement> {
  className?: string
}

export const Farms: React.FC<IconsProps> = ({ className = "", ...rest }) => {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("size-5", className)}
      {...rest}
    >
      <path
        d="M9 28H3V6l3-2 3 2zm10 0h-6V6l3-2 3 2zm10 0h-6V6l3-2 3 2zM19 8h4v4h-4zM9 8h4v4H9zm10 12h4v4h-4zM9 20h4v4H9z"
        style={{
          fill: "none",
          stroke: "currentcolor",
          strokeWidth: 2,
          strokeLinecap: "round",
          strokeLinejoin: "round",
          strokeMiterlimit: 10,
        }}
      />
    </svg>
  )
}

export const Location: React.FC<IconsProps> = ({ className = "", ...rest }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("size-5", className)}
      {...rest}
    >
      <path d="M15.92 15.23 18.35 11a7.27 7.27 0 0 0 0-7.35 7.35 7.35 0 0 0-12.72 0 7.27 7.27 0 0 0 0 7.35l2.43 4.21C4 15.71 0 17 0 19.5 0 22.59 6.22 24 12 24s12-1.41 12-4.5c0-2.5-4-3.79-8.08-4.27M7.37 4.67A5.34 5.34 0 1 1 16.62 10L12 18l-4.62-8a5.31 5.31 0 0 1-.01-5.33M12 22c-6.6 0-10-1.75-10-2.5 0-.53 2.15-1.95 7.18-2.38l1.35 2.33a1.7 1.7 0 0 0 2.94 0l1.35-2.33C19.85 17.55 22 19 22 19.5c0 .75-3.4 2.5-10 2.5" fill='currentColor' />
      <circle cx={12} cy={7} r={2} fill='currentColor' />
    </svg>
  );
}