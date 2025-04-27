import React from "react";

// SVG logo for Melodic - a stylized musical note with gradient colors
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
        r="45" 
        fill="url(#melodicGradient)" 
      />
      
      {/* Musical note symbol */}
      <path 
        d="M65 30C65 27.2386 62.7614 25 60 25H55C52.2386 25 50 27.2386 50 30V62.5C47.5 60.5 44 60 40 62C35 64.5 33 70 36 74C39 78 45 78.5 50 76C54.5 73.5 56 69 56 65V38H60C62.7614 38 65 35.7614 65 33V30Z" 
        fill="white"
      />
      
      {/* Gradient definition */}
      <defs>
        <linearGradient 
          id="melodicGradient" 
          x1="15" 
          y1="15" 
          x2="85" 
          y2="85" 
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#8a2be2" />
          <stop offset="50%" stopColor="#4169e1" />
          <stop offset="100%" stopColor="#00bfff" />
        </linearGradient>
      </defs>
    </svg>
  );
}