import { CSSProperties } from "react";

interface SkaterAvatarProps {
  size?: number;
  username?: string;
  variant?: "default" | "cool" | "chill" | "hype";
}

// Generate a consistent color based on username
const getColorFromString = (str: string): string => {
  const colors = [
    "#ef4444", "#f97316", "#eab308", "#22c55e", 
    "#14b8a6", "#06b6d4", "#3b82f6", "#8b5cf6", 
    "#ec4899", "#f43f5e"
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

// Get variant based on username
const getVariantFromString = (str: string): "default" | "cool" | "chill" | "hype" => {
  const variants: ("default" | "cool" | "chill" | "hype")[] = ["default", "cool", "chill", "hype"];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return variants[Math.abs(hash) % variants.length];
};

export function SkaterAvatar({ size = 100, username = "Player", variant }: SkaterAvatarProps) {
  const accentColor = getColorFromString(username);
  const characterVariant = variant || getVariantFromString(username);
  
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      {/* Background circle */}
      <circle cx="50" cy="50" r="48" fill="#1f2937" stroke={accentColor} strokeWidth="3" />
      
      {/* Character based on variant */}
      {characterVariant === "default" && <DefaultSkater accentColor={accentColor} />}
      {characterVariant === "cool" && <CoolSkater accentColor={accentColor} />}
      {characterVariant === "chill" && <ChillSkater accentColor={accentColor} />}
      {characterVariant === "hype" && <HypeSkater accentColor={accentColor} />}
    </svg>
  );
}

// Default skater - snapback cap, hoodie
function DefaultSkater({ accentColor }: { accentColor: string }) {
  return (
    <g>
      {/* Body/Hoodie */}
      <path
        d="M30 95 L30 68 Q30 60 40 58 L60 58 Q70 60 70 68 L70 95"
        fill="#374151"
      />
      {/* Hoodie details */}
      <path d="M45 65 L50 75 L55 65" stroke="#4b5563" strokeWidth="2" fill="none" />
      
      {/* Head */}
      <ellipse cx="50" cy="45" rx="18" ry="20" fill="#fbbf24" />
      
      {/* Hair peeking from cap */}
      <path d="M35 38 Q32 32 38 30" stroke="#1f2937" strokeWidth="3" fill="none" />
      
      {/* Snapback Cap */}
      <path
        d="M32 40 Q32 28 50 25 Q68 28 68 40 L68 42 L32 42 Z"
        fill={accentColor}
      />
      <rect x="30" y="41" width="40" height="5" fill={accentColor} />
      <rect x="28" y="45" width="15" height="3" rx="1" fill={accentColor} />
      
      {/* Eyes */}
      <ellipse cx="43" cy="45" rx="3" ry="3.5" fill="#1f2937" />
      <ellipse cx="57" cy="45" rx="3" ry="3.5" fill="#1f2937" />
      <circle cx="44" cy="44" r="1" fill="#fff" />
      <circle cx="58" cy="44" r="1" fill="#fff" />
      
      {/* Slight smile */}
      <path d="M45 54 Q50 58 55 54" stroke="#1f2937" strokeWidth="2" fill="none" strokeLinecap="round" />
      
      {/* Logo on hoodie */}
      <circle cx="50" cy="78" r="8" fill={accentColor} opacity="0.8" />
    </g>
  );
}

// Cool skater - sunglasses, beanie
function CoolSkater({ accentColor }: { accentColor: string }) {
  return (
    <g>
      {/* Body/Jacket */}
      <path
        d="M30 95 L30 68 Q30 60 40 58 L60 58 Q70 60 70 68 L70 95"
        fill="#1f2937"
      />
      {/* Jacket zipper */}
      <line x1="50" y1="60" x2="50" y2="90" stroke="#6b7280" strokeWidth="2" />
      
      {/* Head */}
      <ellipse cx="50" cy="45" rx="18" ry="20" fill="#d4a574" />
      
      {/* Beanie */}
      <path
        d="M30 42 Q30 25 50 22 Q70 25 70 42"
        fill={accentColor}
      />
      <rect x="30" y="38" width="40" height="6" fill={accentColor} />
      <rect x="30" y="38" width="40" height="3" fill="#111827" opacity="0.3" />
      {/* Beanie fold */}
      <circle cx="50" cy="22" r="4" fill={accentColor} />
      
      {/* Sunglasses */}
      <rect x="35" y="42" width="12" height="8" rx="2" fill="#1f2937" />
      <rect x="53" y="42" width="12" height="8" rx="2" fill="#1f2937" />
      <line x1="47" y1="46" x2="53" y2="46" stroke="#1f2937" strokeWidth="2" />
      {/* Reflection on glasses */}
      <line x1="38" y1="44" x2="42" y2="48" stroke="#fff" strokeWidth="1" opacity="0.5" />
      <line x1="56" y1="44" x2="60" y2="48" stroke="#fff" strokeWidth="1" opacity="0.5" />
      
      {/* Smirk */}
      <path d="M44 55 Q52 58 56 54" stroke="#1f2937" strokeWidth="2" fill="none" strokeLinecap="round" />
    </g>
  );
}

// Chill skater - bucket hat, relaxed
function ChillSkater({ accentColor }: { accentColor: string }) {
  return (
    <g>
      {/* Body/Oversized tee */}
      <path
        d="M28 95 L28 70 Q28 62 38 58 L62 58 Q72 62 72 70 L72 95"
        fill="#f3f4f6"
      />
      {/* Graphic on shirt */}
      <circle cx="50" cy="78" r="10" fill={accentColor} />
      
      {/* Head */}
      <ellipse cx="50" cy="46" rx="17" ry="19" fill="#8b6914" />
      
      {/* Bucket hat */}
      <ellipse cx="50" cy="32" rx="22" ry="8" fill={accentColor} />
      <path
        d="M32 32 Q32 22 50 20 Q68 22 68 32"
        fill={accentColor}
      />
      
      {/* Sleepy/chill eyes */}
      <path d="M40 46 L47 46" stroke="#1f2937" strokeWidth="3" strokeLinecap="round" />
      <path d="M53 46 L60 46" stroke="#1f2937" strokeWidth="3" strokeLinecap="round" />
      
      {/* Relaxed smile */}
      <path d="M44 54 Q50 56 56 54" stroke="#1f2937" strokeWidth="2" fill="none" strokeLinecap="round" />
      
      {/* Earbuds */}
      <circle cx="32" cy="50" r="3" fill="#fff" stroke="#e5e7eb" />
      <circle cx="68" cy="50" r="3" fill="#fff" stroke="#e5e7eb" />
    </g>
  );
}

// Hype skater - excited, helmet maybe?
function HypeSkater({ accentColor }: { accentColor: string }) {
  return (
    <g>
      {/* Body/Graphic hoodie */}
      <path
        d="M30 95 L30 68 Q30 60 40 58 L60 58 Q70 60 70 68 L70 95"
        fill={accentColor}
      />
      {/* Hoodie pocket */}
      <path d="M38 78 L62 78 L62 88 Q50 90 38 88 Z" fill="#111827" opacity="0.2" />
      
      {/* Head */}
      <ellipse cx="50" cy="45" rx="18" ry="20" fill="#fbbf24" />
      
      {/* Wild hair */}
      <path d="M35 30 Q30 20 40 22 Q35 15 45 18 Q45 10 55 15 Q60 10 62 20 Q70 18 68 28" 
        fill="#1f2937" />
      
      {/* Wide excited eyes */}
      <ellipse cx="42" cy="44" rx="5" ry="6" fill="#fff" />
      <ellipse cx="58" cy="44" rx="5" ry="6" fill="#fff" />
      <ellipse cx="43" cy="45" rx="3" ry="3.5" fill="#1f2937" />
      <ellipse cx="59" cy="45" rx="3" ry="3.5" fill="#1f2937" />
      <circle cx="44" cy="44" r="1.5" fill="#fff" />
      <circle cx="60" cy="44" r="1.5" fill="#fff" />
      
      {/* Big smile */}
      <path d="M40 54 Q50 62 60 54" stroke="#1f2937" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Teeth */}
      <path d="M43 55 L43 58 M47 56 L47 59 M53 56 L53 59 M57 55 L57 58" stroke="#fff" strokeWidth="2" />
      
      {/* Sweat drops (excited) */}
      <path d="M72 35 Q74 40 72 42" fill="#06b6d4" />
      <path d="M75 42 Q76 45 75 46" fill="#06b6d4" />
    </g>
  );
}

// Profile avatar with image or default character
interface ProfileAvatarProps {
  src?: string | null;
  size?: number;
  username?: string;
  onClick?: () => void;
  editable?: boolean;
}

export function ProfileAvatar({ src, size = 100, username = "Player", onClick, editable = false }: ProfileAvatarProps) {
  const containerStyle: CSSProperties = {
    width: size,
    height: size,
    borderRadius: "50%",
    overflow: "hidden",
    cursor: onClick ? "pointer" : "default",
    position: "relative",
    flexShrink: 0,
  };

  const imageStyle: CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  };

  const editOverlayStyle: CSSProperties = {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: "8px",
    background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
    color: "#fff",
    fontSize: size * 0.12,
    textAlign: "center",
    fontWeight: 600,
  };

  return (
    <div style={containerStyle} onClick={onClick} role={onClick ? "button" : undefined} tabIndex={onClick ? 0 : undefined}>
      {src ? (
        <img src={src} alt={username} style={imageStyle} />
      ) : (
        <SkaterAvatar size={size} username={username} />
      )}
      {editable && (
        <div style={editOverlayStyle}>
          {src ? "Change" : "Add Photo"}
        </div>
      )}
    </div>
  );
}

