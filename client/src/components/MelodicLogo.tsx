import React from "react";

// Enhanced SVG logo for Melodic - a stylized musical note with gradient colors
export default function MelodicLogo({ size = 40 }: { size?: number }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Circle background with gradient */}
      <circle 
        cx="50" 
        cy="50" 
        r="46" 
        fill="url(#melodicGradient)" 
      />
      
      {/* Inner circle for depth */}
      <circle 
        cx="50" 
        cy="50" 
        r="42" 
        fill="url(#innerGradient)" 
      />
      
      {/* Sound waves effect */}
      <path 
        d="M85 50C85 52.5 75 55 75 55" 
        stroke="rgba(255,255,255,0.6)" 
        strokeWidth="2" 
        strokeLinecap="round"
      />
      <path 
        d="M80 40C80 45 70 50 70 50" 
        stroke="rgba(255,255,255,0.5)" 
        strokeWidth="2" 
        strokeLinecap="round"
      />
      <path 
        d="M80 60C80 55 70 50 70 50" 
        stroke="rgba(255,255,255,0.5)" 
        strokeWidth="2" 
        strokeLinecap="round"
      />
      
      {/* Enhanced musical note symbol */}
      <path 
        d="M65 30C65 27.2386 62.7614 25 60 25H55C52.2386 25 50 27.2386 50 30V62.5C47.5 60.5 44 60 40 62C35 64.5 33 70 36 74C39 78 45 78.5 50 76C54.5 73.5 56 69 56 65V38H60C62.7614 38 65 35.7614 65 33V30Z" 
        fill="white"
      />
      
      {/* Highlights on the note */}
      <path 
        d="M60 29H56V34H60C61.1046 34 62 33.1046 62 32V31C62 29.8954 61.1046 29 60 29Z" 
        fill="rgba(255,255,255,0.3)"
      />
      
      {/* Gradient definitions */}
      <defs>
        <linearGradient 
          id="melodicGradient" 
          x1="15" 
          y1="15" 
          x2="85" 
          y2="85" 
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#9F2DE0" />
          <stop offset="50%" stopColor="#4859E0" />
          <stop offset="100%" stopColor="#0CB6FF" />
        </linearGradient>
        
        <linearGradient 
          id="innerGradient" 
          x1="20" 
          y1="20" 
          x2="80" 
          y2="80" 
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#8A2BE2" />
          <stop offset="50%" stopColor="#4169E1" />
          <stop offset="100%" stopColor="#00BFFF" />
        </linearGradient>
      </defs>
    </svg>
  );
}