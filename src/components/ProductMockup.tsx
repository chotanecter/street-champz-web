type ProductType = "tee" | "hoodie" | "joggers" | "cap" | "deck" | "stickers" | "bag" | "socks" | "grip" | "bundle-hoodie-sweats" | "bundle-tee-hat" | "bundle-full";

interface ProductMockupProps {
  type: ProductType;
  size?: number;
  logoPosition?: "center" | "chest" | "leg";
}

export function ProductMockup({ type, size = 120, logoPosition = "center" }: ProductMockupProps) {
  const renderProduct = () => {
    switch (type) {
      case "tee":
        return <TeeShirt size={size} logoPosition={logoPosition} />;
      case "hoodie":
        return <Hoodie size={size} />;
      case "joggers":
        return <Joggers size={size} />;
      case "cap":
        return <Cap size={size} />;
      case "deck":
        return <Deck size={size} />;
      case "grip":
        return <GripTape size={size} />;
      case "stickers":
        return <Stickers size={size} />;
      case "bag":
        return <Bag size={size} />;
      case "socks":
        return <Socks size={size} />;
      case "bundle-hoodie-sweats":
        return <BundleHoodieSweats size={size} />;
      case "bundle-tee-hat":
        return <BundleTeeHat size={size} />;
      case "bundle-full":
        return <BundleFull size={size} />;
      default:
        return <TeeShirt size={size} logoPosition={logoPosition} />;
    }
  };

  return (
    <div style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {renderProduct()}
    </div>
  );
}

// Clean T-Shirt mockup - Black with large center logo (matching real product)
function TeeShirt({ size, logoPosition }: { size: number; logoPosition: string }) {
  const isChest = logoPosition === "chest";
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      {/* T-Shirt body - black */}
      <path
        d="M30 25 L20 30 L15 45 L25 48 L25 85 L75 85 L75 48 L85 45 L80 30 L70 25 L65 20 L58 22 L50 25 L42 22 L35 20 Z"
        fill="#1a1a1a"
        stroke="#2a2a2a"
        strokeWidth="1"
      />
      {/* Collar - crew neck */}
      <ellipse cx="50" cy="23" rx="8" ry="4" fill="#0f0f0f" stroke="#2a2a2a" strokeWidth="0.5" />
      {/* Sleeve hems */}
      <path d="M15 45 L25 48" stroke="#2a2a2a" strokeWidth="1" />
      <path d="M85 45 L75 48" stroke="#2a2a2a" strokeWidth="1" />
      
      {/* Logo - LARGE CENTER position (matching real product) */}
      <image
        href="/logo.png"
        x={isChest ? 52 : 32}
        y={isChest ? 35 : 38}
        width={isChest ? 18 : 36}
        height={isChest ? 18 : 36}
        preserveAspectRatio="xMidYMid meet"
      />
    </svg>
  );
}

// Clean Hoodie mockup - Black with left chest logo (matching real product)
function Hoodie({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      {/* Hoodie body - black */}
      <path
        d="M28 30 L18 35 L12 55 L22 58 L22 88 L78 88 L78 58 L88 55 L82 35 L72 30 L68 25 L62 28 L50 32 L38 28 L32 25 Z"
        fill="#1a1a1a"
        stroke="#2a2a2a"
        strokeWidth="1"
      />
      {/* Hood */}
      <path
        d="M32 25 Q32 12 50 8 Q68 12 68 25"
        fill="#1a1a1a"
        stroke="#2a2a2a"
        strokeWidth="1"
      />
      {/* Hood opening */}
      <ellipse cx="50" cy="20" rx="12" ry="8" fill="#0f0f0f" />
      {/* Front kangaroo pocket */}
      <path
        d="M30 65 Q50 68 70 65 L70 82 Q50 85 30 82 Z"
        fill="#0f0f0f"
        stroke="#2a2a2a"
        strokeWidth="0.5"
      />
      {/* Pocket opening line */}
      <path
        d="M35 73 Q50 75 65 73"
        fill="none"
        stroke="#2a2a2a"
        strokeWidth="0.5"
      />
      {/* Drawstrings */}
      <line x1="45" y1="28" x2="44" y2="42" stroke="#4a4a4a" strokeWidth="1" />
      <line x1="55" y1="28" x2="56" y2="42" stroke="#4a4a4a" strokeWidth="1" />
      {/* Drawstring tips */}
      <circle cx="44" cy="43" r="1.5" fill="#4a4a4a" />
      <circle cx="56" cy="43" r="1.5" fill="#4a4a4a" />
      
      {/* Logo - LEFT CHEST position (matching real product) */}
      <image
        href="/logo.png"
        x={52}
        y={36}
        width={18}
        height={18}
        preserveAspectRatio="xMidYMid meet"
      />
    </svg>
  );
}

// Clean Joggers/Sweatpants mockup - Black with left thigh logo (matching real product)
function Joggers({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      {/* Waistband - elastic with drawstring */}
      <path
        d="M25 8 L75 8 L75 18 L25 18 Z"
        fill="#0f0f0f"
        stroke="#2a2a2a"
        strokeWidth="1"
      />
      {/* Drawstring */}
      <line x1="45" y1="13" x2="42" y2="22" stroke="#3a3a3a" strokeWidth="1" />
      <line x1="55" y1="13" x2="58" y2="22" stroke="#3a3a3a" strokeWidth="1" />
      {/* Drawstring tips */}
      <circle cx="42" cy="23" r="1" fill="#3a3a3a" />
      <circle cx="58" cy="23" r="1" fill="#3a3a3a" />
      
      {/* Left leg */}
      <path
        d="M25 18 L47 18 L47 50 L44 85 L30 85 L25 50 Z"
        fill="#1a1a1a"
        stroke="#2a2a2a"
        strokeWidth="1"
      />
      {/* Right leg */}
      <path
        d="M53 18 L75 18 L75 50 L70 85 L56 85 L53 50 Z"
        fill="#1a1a1a"
        stroke="#2a2a2a"
        strokeWidth="1"
      />
      {/* Crotch area */}
      <path
        d="M47 18 L53 18 L53 50 L50 55 L47 50 Z"
        fill="#1a1a1a"
        stroke="#2a2a2a"
        strokeWidth="1"
      />
      {/* Elastic cuffs */}
      <rect x="30" y="83" width="14" height="5" rx="2" fill="#0f0f0f" stroke="#2a2a2a" strokeWidth="0.5" />
      <rect x="56" y="83" width="14" height="5" rx="2" fill="#0f0f0f" stroke="#2a2a2a" strokeWidth="0.5" />
      {/* Side pockets (zippered) */}
      <line x1="28" y1="25" x2="30" y2="45" stroke="#2a2a2a" strokeWidth="1" />
      <line x1="72" y1="25" x2="70" y2="45" stroke="#2a2a2a" strokeWidth="1" />
      
      {/* Logo on LEFT THIGH (matching real product) */}
      <image
        href="/logo.png"
        x={24}
        y={35}
        width={20}
        height={20}
        preserveAspectRatio="xMidYMid meet"
      />
    </svg>
  );
}

// Clean Snapback Cap mockup - Black with front logo (matching real product)
function Cap({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      {/* Cap crown - 6 panel structured snapback */}
      <path
        d="M18 52 Q18 22 50 15 Q82 22 82 52 L82 58 L18 58 Z"
        fill="#1a1a1a"
        stroke="#2a2a2a"
        strokeWidth="1"
      />
      {/* Bill/Brim - flat brim snapback style */}
      <path
        d="M12 58 L88 58 L92 62 Q92 74 88 76 L12 76 Q8 74 8 62 Z"
        fill="#1a1a1a"
        stroke="#2a2a2a"
        strokeWidth="1"
      />
      {/* Bill underside - darker */}
      <path
        d="M15 62 L85 62 L88 72 L12 72 Z"
        fill="#0f0f0f"
      />
      {/* Top button */}
      <circle cx="50" cy="15" r="3" fill="#2a2a2a" />
      {/* Panel seams - 6 panel construction */}
      <line x1="50" y1="15" x2="50" y2="58" stroke="#2a2a2a" strokeWidth="0.5" />
      <line x1="34" y1="20" x2="28" y2="58" stroke="#2a2a2a" strokeWidth="0.5" />
      <line x1="66" y1="20" x2="72" y2="58" stroke="#2a2a2a" strokeWidth="0.5" />
      {/* Eyelets for ventilation */}
      <circle cx="30" cy="35" r="1.5" fill="#2a2a2a" />
      <circle cx="70" cy="35" r="1.5" fill="#2a2a2a" />
      
      {/* Logo on FRONT PANEL - large and prominent (matching real product) */}
      <image
        href="/logo.png"
        x={30}
        y={28}
        width={40}
        height={26}
        preserveAspectRatio="xMidYMid meet"
      />
    </svg>
  );
}

// Horizontal Skateboard Deck mockup
function Deck({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      {/* Deck - horizontal skateboard shape with nose and tail kicks */}
      <path
        d="M8 50 Q5 45 8 40 L15 38 Q20 35 25 38 L75 38 Q80 35 85 38 L92 40 Q95 45 92 50 Q95 55 92 60 L85 62 Q80 65 75 62 L25 62 Q20 65 15 62 L8 60 Q5 55 8 50 Z"
        fill="#8B5A2B"
        stroke="#5D3A1A"
        strokeWidth="1.5"
      />
      {/* Grip tape */}
      <path
        d="M15 40 Q20 38 25 40 L75 40 Q80 38 85 40 L85 60 Q80 62 75 60 L25 60 Q20 62 15 60 Z"
        fill="#1a1a1a"
      />
      {/* Wood grain lines */}
      <line x1="20" y1="42" x2="20" y2="58" stroke="#6B4423" strokeWidth="0.5" opacity="0.5" />
      <line x1="80" y1="42" x2="80" y2="58" stroke="#6B4423" strokeWidth="0.5" opacity="0.5" />
      
      {/* Logo centered on grip tape */}
      <image
        href="/logo.png"
        x={38}
        y={42}
        width={24}
        height={16}
        preserveAspectRatio="xMidYMid meet"
      />
      
      {/* Trucks (metal hardware) */}
      <rect x="22" y="48" width="12" height="4" rx="1" fill="#6b7280" />
      <rect x="66" y="48" width="12" height="4" rx="1" fill="#6b7280" />
      {/* Wheels */}
      <circle cx="24" cy="50" r="3" fill="#4b5563" stroke="#374151" />
      <circle cx="32" cy="50" r="3" fill="#4b5563" stroke="#374151" />
      <circle cx="68" cy="50" r="3" fill="#4b5563" stroke="#374151" />
      <circle cx="76" cy="50" r="3" fill="#4b5563" stroke="#374151" />
    </svg>
  );
}

// Sticker Pack mockup
function Stickers({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      {/* Scattered small stickers in background */}
      <rect x="12" y="15" width="18" height="18" rx="2" fill="#ef4444" transform="rotate(-12 21 24)" />
      <rect x="70" y="12" width="16" height="16" rx="2" fill="#22c55e" transform="rotate(8 78 20)" />
      <rect x="8" y="60" width="15" height="15" rx="2" fill="#eab308" transform="rotate(5 15 67)" />
      <rect x="75" y="65" width="14" height="14" rx="2" fill="#8b5cf6" transform="rotate(-5 82 72)" />
      <rect x="60" y="75" width="12" height="12" rx="2" fill="#06b6d4" transform="rotate(10 66 81)" />
      
      {/* Main logo sticker - prominent */}
      <rect x="28" y="30" width="44" height="44" rx="4" fill="#ffffff" stroke="#e5e7eb" strokeWidth="2" />
      
      {/* Logo on main sticker */}
      <image
        href="/logo.png"
        x={33}
        y={35}
        width={34}
        height={34}
        preserveAspectRatio="xMidYMid meet"
      />
    </svg>
  );
}

// Backpack/Skate Bag mockup
function Bag({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      {/* Main bag body */}
      <path
        d="M25 25 L75 25 L78 85 Q78 90 73 90 L27 90 Q22 90 22 85 Z"
        fill="#1f2937"
        stroke="#374151"
        strokeWidth="1"
      />
      {/* Top handle/straps */}
      <path
        d="M35 25 Q35 15 50 12 Q65 15 65 25"
        fill="none"
        stroke="#374151"
        strokeWidth="4"
      />
      <path
        d="M35 25 Q35 17 50 14 Q65 17 65 25"
        fill="none"
        stroke="#1f2937"
        strokeWidth="2"
      />
      {/* Top zipper */}
      <line x1="30" y1="28" x2="70" y2="28" stroke="#6b7280" strokeWidth="2" />
      <circle cx="45" cy="28" r="2" fill="#9ca3af" />
      {/* Front pocket */}
      <rect x="30" y="50" width="40" height="28" rx="3" fill="#111827" stroke="#374151" strokeWidth="0.5" />
      {/* Pocket zipper */}
      <line x1="35" y1="53" x2="65" y2="53" stroke="#6b7280" strokeWidth="1" />
      
      {/* Logo on front pocket - small */}
      <image
        href="/logo.png"
        x={40}
        y={58}
        width={20}
        height={16}
        preserveAspectRatio="xMidYMid meet"
      />
    </svg>
  );
}

// Socks mockup - pair of crew socks
function Socks({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      {/* Left sock */}
      <path
        d="M18 15 L32 15 L32 55 L34 60 L34 72 Q34 78 28 80 L18 82 Q12 82 12 76 L12 70 L14 65 L14 55 L18 55 Z"
        fill="#FFFFFF"
        stroke="#d1d5db"
        strokeWidth="1"
      />
      {/* Left sock cuff band */}
      <rect x="16" y="15" width="18" height="10" fill="#1f2937" stroke="#374151" strokeWidth="0.5" />
      {/* Left sock stripe */}
      <rect x="16" y="25" width="18" height="3" fill="#1f2937" />
      
      {/* Right sock */}
      <path
        d="M58 15 L72 15 L72 55 L74 60 L74 72 Q74 78 68 80 L58 82 Q52 82 52 76 L52 70 L54 65 L54 55 L58 55 Z"
        fill="#FFFFFF"
        stroke="#d1d5db"
        strokeWidth="1"
      />
      {/* Right sock cuff band */}
      <rect x="56" y="15" width="18" height="10" fill="#1f2937" stroke="#374151" strokeWidth="0.5" />
      {/* Right sock stripe */}
      <rect x="56" y="25" width="18" height="3" fill="#1f2937" />
      
      {/* Small logos on cuffs */}
      <image
        href="/logo.png"
        x={18}
        y={16}
        width={14}
        height={8}
        preserveAspectRatio="xMidYMid meet"
      />
      <image
        href="/logo.png"
        x={58}
        y={16}
        width={14}
        height={8}
        preserveAspectRatio="xMidYMid meet"
      />
    </svg>
  );
}

// Grip Tape mockup - standard popsicle skateboard deck shape (8" x 32" ratio = 1:4)
function GripTape({ size }: { size: number }) {
  // Use wider aspect ratio for skateboard shape
  const width = size * 1.8;
  const height = size * 0.6;
  
  return (
    <svg width={width} height={height} viewBox="0 0 180 50" fill="none">
      {/* Grip tape - popsicle deck shape (smooth sides, rounded ends) */}
      <path
        d="M15 5
           L165 5
           Q178 5 178 25
           Q178 45 165 45
           L15 45
           Q2 45 2 25
           Q2 5 15 5 Z"
        fill="#1a1a1a"
        stroke="#2a2a2a"
        strokeWidth="1.5"
      />
      
      {/* Grip texture - sandpaper dots */}
      {[...Array(4)].map((_, row) => (
        [...Array(28)].map((_, col) => (
          <circle
            key={`${row}-${col}`}
            cx={18 + col * 5.2}
            cy={14 + row * 8 + (col % 2) * 3}
            r="0.8"
            fill="#2a2a2a"
          />
        ))
      )).flat()}
      
      {/* Logo centered on grip tape */}
      <image
        href="/logo.png"
        x={65}
        y={12}
        width={50}
        height={26}
        preserveAspectRatio="xMidYMid meet"
      />
    </svg>
  );
}

// Bundle: Hoodie + Sweats - Black matching real products
function BundleHoodieSweats({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      {/* Hoodie (smaller, top-left) */}
      <g transform="translate(-5, -5) scale(0.6)">
        <path
          d="M28 30 L18 35 L12 55 L22 58 L22 88 L78 88 L78 58 L88 55 L82 35 L72 30 L68 25 L62 28 L50 32 L38 28 L32 25 Z"
          fill="#1a1a1a"
          stroke="#2a2a2a"
          strokeWidth="1"
        />
        <path
          d="M32 25 Q32 12 50 8 Q68 12 68 25"
          fill="#1a1a1a"
          stroke="#2a2a2a"
          strokeWidth="1"
        />
        <ellipse cx="50" cy="20" rx="12" ry="8" fill="#0f0f0f" />
        <path d="M32 68 Q50 72 68 68 L68 80 Q50 82 32 80 Z" fill="#0f0f0f" />
        <image href="/logo.png" x={52} y={38} width={18} height={18} preserveAspectRatio="xMidYMid meet" />
      </g>
      
      {/* Joggers (smaller, bottom-right) */}
      <g transform="translate(40, 35) scale(0.6)">
        <path d="M25 8 L75 8 L75 18 L25 18 Z" fill="#0f0f0f" stroke="#2a2a2a" strokeWidth="1" />
        <path d="M25 18 L47 18 L47 50 L44 85 L30 85 L25 50 Z" fill="#1a1a1a" stroke="#2a2a2a" strokeWidth="1" />
        <path d="M53 18 L75 18 L75 50 L70 85 L56 85 L53 50 Z" fill="#1a1a1a" stroke="#2a2a2a" strokeWidth="1" />
        <path d="M47 18 L53 18 L53 50 L50 55 L47 50 Z" fill="#1a1a1a" stroke="#2a2a2a" strokeWidth="1" />
        <rect x="30" y="83" width="14" height="5" rx="2" fill="#0f0f0f" />
        <rect x="56" y="83" width="14" height="5" rx="2" fill="#0f0f0f" />
        <image href="/logo.png" x={24} y={35} width={18} height={18} preserveAspectRatio="xMidYMid meet" />
      </g>
    </svg>
  );
}

// Bundle: T-Shirt + Hat - Black matching real products
function BundleTeeHat({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      {/* T-Shirt (smaller, left side) - BLACK */}
      <g transform="translate(-8, 15) scale(0.6)">
        <path
          d="M30 25 L20 30 L15 45 L25 48 L25 85 L75 85 L75 48 L85 45 L80 30 L70 25 L65 20 L58 22 L50 25 L42 22 L35 20 Z"
          fill="#1a1a1a"
          stroke="#2a2a2a"
          strokeWidth="1"
        />
        <ellipse cx="50" cy="23" rx="8" ry="4" fill="#0f0f0f" stroke="#2a2a2a" strokeWidth="0.5" />
        <image href="/logo.png" x={35} y={38} width={30} height={30} preserveAspectRatio="xMidYMid meet" />
      </g>
      
      {/* Cap (smaller, right side) - BLACK */}
      <g transform="translate(45, 10) scale(0.55)">
        <path d="M18 52 Q18 22 50 15 Q82 22 82 52 L82 58 L18 58 Z" fill="#1a1a1a" stroke="#2a2a2a" strokeWidth="1" />
        <path d="M12 58 L88 58 L92 62 Q92 74 88 76 L12 76 Q8 74 8 62 Z" fill="#1a1a1a" stroke="#2a2a2a" strokeWidth="1" />
        <path d="M15 62 L85 62 L88 72 L12 72 Z" fill="#0f0f0f" />
        <circle cx="50" cy="15" r="3" fill="#2a2a2a" />
        <image href="/logo.png" x={30} y={28} width={40} height={26} preserveAspectRatio="xMidYMid meet" />
      </g>
    </svg>
  );
}

// Bundle: Full Package (Hat, Grip, Hoodie, Sweats, T-Shirt) - All BLACK
function BundleFull({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      {/* Hoodie (center back) - BLACK */}
      <g transform="translate(25, 5) scale(0.45)">
        <path
          d="M28 30 L18 35 L12 55 L22 58 L22 88 L78 88 L78 58 L88 55 L82 35 L72 30 L68 25 L62 28 L50 32 L38 28 L32 25 Z"
          fill="#1a1a1a"
          stroke="#2a2a2a"
          strokeWidth="1"
        />
        <path d="M32 25 Q32 12 50 8 Q68 12 68 25" fill="#1a1a1a" stroke="#2a2a2a" strokeWidth="1" />
        <ellipse cx="50" cy="20" rx="12" ry="8" fill="#0f0f0f" />
        <path d="M32 68 Q50 72 68 68 L68 80 Q50 82 32 80 Z" fill="#0f0f0f" />
      </g>
      
      {/* T-Shirt (left) - BLACK */}
      <g transform="translate(-5, 25) scale(0.4)">
        <path
          d="M30 25 L20 30 L15 45 L25 48 L25 85 L75 85 L75 48 L85 45 L80 30 L70 25 L65 20 L58 22 L50 25 L42 22 L35 20 Z"
          fill="#1a1a1a"
          stroke="#2a2a2a"
          strokeWidth="1"
        />
        <ellipse cx="50" cy="23" rx="8" ry="4" fill="#0f0f0f" stroke="#2a2a2a" strokeWidth="0.5" />
      </g>
      
      {/* Joggers (right) - BLACK */}
      <g transform="translate(55, 30) scale(0.4)">
        <path d="M25 8 L75 8 L75 18 L25 18 Z" fill="#0f0f0f" stroke="#2a2a2a" strokeWidth="1" />
        <path d="M25 18 L47 18 L47 50 L44 85 L30 85 L25 50 Z" fill="#1a1a1a" stroke="#2a2a2a" strokeWidth="1" />
        <path d="M53 18 L75 18 L75 50 L70 85 L56 85 L53 50 Z" fill="#1a1a1a" stroke="#2a2a2a" strokeWidth="1" />
        <rect x="30" y="83" width="14" height="4" rx="2" fill="#0f0f0f" />
        <rect x="56" y="83" width="14" height="4" rx="2" fill="#0f0f0f" />
      </g>
      
      {/* Cap (top right) - BLACK */}
      <g transform="translate(60, -5) scale(0.35)">
        <path d="M18 52 Q18 22 50 15 Q82 22 82 52 L82 58 L18 58 Z" fill="#1a1a1a" stroke="#2a2a2a" strokeWidth="1" />
        <path d="M12 58 L88 58 L92 62 Q92 74 88 76 L12 76 Q8 74 8 62 Z" fill="#1a1a1a" stroke="#2a2a2a" strokeWidth="1" />
        <path d="M15 62 L85 62 L88 72 L12 72 Z" fill="#0f0f0f" />
      </g>
      
      {/* Grip tape (bottom center) - BLACK */}
      <g transform="translate(30, 65) scale(0.35)">
        <rect x="20" y="10" width="60" height="50" rx="5" fill="#1a1a1a" stroke="#2a2a2a" strokeWidth="1" />
        <image href="/logo.png" x={35} y={20} width={30} height={20} preserveAspectRatio="xMidYMid meet" />
      </g>
    </svg>
  );
}
