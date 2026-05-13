import { cn } from "@/lib/utils";

export const HealthChainLogo = ({ className, size = 40 }: { className?: string, size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 200 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn("drop-shadow-md", className)}
  >
    {/* Background Circle */}
    <circle cx="100" cy="100" r="90" fill="url(#logo_grad_bg)" />
    
    {/* Block 1 (Top Left) */}
    <rect x="45" y="45" width="50" height="50" rx="12" fill="white" fillOpacity="0.9" />
    <path d="M55 70H85M70 55V85" stroke="#00C2FF" strokeWidth="6" strokeLinecap="round" />
    
    {/* Block 2 (Bottom Right) */}
    <rect x="105" y="105" width="50" height="50" rx="12" fill="white" fillOpacity="0.9" />
    <path d="M115 130H145M130 115V145" stroke="#4ADE80" strokeWidth="6" strokeLinecap="round" />
    
    {/* Connecting Chain / Line */}
    <path d="M95 95L105 105" stroke="white" strokeWidth="8" strokeLinecap="round" strokeDasharray="1 15" />
    
    {/* Central Shield / Cross Overlay */}
    <path 
      d="M100 65L125 75V105C125 125 100 135 100 135C100 135 75 125 75 105V75L100 65Z" 
      fill="white" 
    />
    <path d="M92 95H108M100 87V103" stroke="#00C2FF" strokeWidth="5" strokeLinecap="round" />

    <defs>
      <linearGradient id="logo_grad_bg" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
        <stop stopColor="#00C2FF" />
        <stop offset="1" stopColor="#4ADE80" />
      </linearGradient>
    </defs>
  </svg>
);

export const ColorfulAiLogo = ({ className, size = 40 }: { className?: string, size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 200 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn("drop-shadow-xl", className)}
  >
    <defs>
      <linearGradient id="ai_grad" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FF0080" />
        <stop offset="0.5" stopColor="#7928CA" />
        <stop offset="1" stopColor="#0070F3" />
      </linearGradient>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="5" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    
    <circle cx="100" cy="100" r="90" fill="url(#ai_grad)" filter="url(#glow)" />
    
    {/* AI Brain/Circuit Pattern */}
    <path 
      d="M70 100C70 80 80 70 100 70C120 70 130 80 130 100C130 120 120 130 100 130C80 130 70 120 70 100Z" 
      stroke="white" 
      strokeWidth="8" 
      strokeLinecap="round" 
    />
    <circle cx="100" cy="100" r="15" fill="white" className="animate-pulse" />
    
    {/* Sparkles */}
    <path d="M150 50L155 60L165 65L155 70L150 80L145 70L135 65L145 60L150 50Z" fill="white" />
    <path d="M40 140L43 146L49 149L43 152L40 158L37 152L31 149L37 146L40 140Z" fill="white" />
  </svg>
);
