import React from "react";

/**
 * blu Original Character Avatars
 * Hand-crafted vector illustrations inspired by expressive Reddit snoos,
 * imbued with blu's unique butterfly, curiosity, and community identity.
 */

export const AVATAR_LIST = [
  {
    id: "pip",
    name: "Pip",
    tag: "The Curious Butterfly",
    description: "Always chasing new ideas and fluttering toward fascinating questions.",
    palette: {
      bg: "#ede9fe",
      border: "#c4b5fd",
      accent: "#7354b8",
      glow: "rgba(115, 84, 184, 0.25)",
    },
    svg: (
      <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">
        <defs>
          <linearGradient id="pip-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ede9fe" />
            <stop offset="100%" stopColor="#ddd6fe" />
          </linearGradient>
          <linearGradient id="pip-wing" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#pip-bg)" />
        {/* Butterfly wings on back */}
        <path d="M22 36 C10 24 6 42 22 48 C14 54 18 64 26 58 Z" fill="url(#pip-wing)" opacity="0.85" />
        <path d="M78 36 C90 24 94 42 78 48 C86 54 82 64 74 58 Z" fill="url(#pip-wing)" opacity="0.85" />
        {/* Antennae */}
        <path d="M42 28 Q34 14 30 18" stroke="#7354b8" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <circle cx="30" cy="18" r="3.5" fill="#a78bfa" />
        <path d="M58 28 Q66 14 70 18" stroke="#7354b8" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <circle cx="70" cy="18" r="3.5" fill="#a78bfa" />
        {/* Body & Face */}
        <circle cx="50" cy="54" r="28" fill="#fff7ed" stroke="#7354b8" strokeWidth="2.5" />
        {/* Blushing cheeks */}
        <circle cx="37" cy="59" r="4.5" fill="#fbcfe8" opacity="0.8" />
        <circle cx="63" cy="59" r="4.5" fill="#fbcfe8" opacity="0.8" />
        {/* Expressive Sparkle Eyes */}
        <ellipse cx="40" cy="51" rx="3.5" ry="4.5" fill="#2e1065" />
        <circle cx="38.5" cy="49.5" r="1.5" fill="#ffffff" />
        <circle cx="41.5" cy="53" r="0.8" fill="#ffffff" />
        <ellipse cx="60" cy="51" rx="3.5" ry="4.5" fill="#2e1065" />
        <circle cx="58.5" cy="49.5" r="1.5" fill="#ffffff" />
        <circle cx="61.5" cy="53" r="0.8" fill="#ffffff" />
        {/* Cute Smile */}
        <path d="M46 60 Q50 64 54 60" stroke="#7354b8" strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* Tiny Butterfly Hairclip */}
        <path d="M34 35 Q30 31 33 28 Q36 31 34 35 Z" fill="#c084fc" />
        <path d="M34 35 Q38 31 35 28 Q32 31 34 35 Z" fill="#a855f7" />
        <circle cx="34" cy="34" r="1.2" fill="#fef08a" />
      </svg>
    ),
  },
  {
    id: "luna",
    name: "Luna",
    tag: "Dreamy Stargazer",
    description: "Finds wonder in late-night thoughts and quiet celestial mysteries.",
    palette: {
      bg: "#e0e7ff",
      border: "#a5b4fc",
      accent: "#4f46e5",
      glow: "rgba(79, 70, 229, 0.25)",
    },
    svg: (
      <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">
        <defs>
          <linearGradient id="luna-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e0e7ff" />
            <stop offset="100%" stopColor="#c7d2fe" />
          </linearGradient>
          <linearGradient id="luna-hair" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#4338ca" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#luna-bg)" />
        {/* Little celestial stars background */}
        <path d="M22 24 L24 28 L28 28 L25 31 L26 35 L22 32 L18 35 L19 31 L16 28 L20 28 Z" fill="#fbbf24" opacity="0.6" transform="scale(0.55) translate(14, 18)" />
        <circle cx="78" cy="28" r="2" fill="#fbbf24" opacity="0.7" />
        <circle cx="82" cy="34" r="1.2" fill="#818cf8" />
        {/* Face */}
        <circle cx="50" cy="54" r="28" fill="#fef2f2" stroke="#4338ca" strokeWidth="2.5" />
        {/* Nightcap / Sleepy Beret */}
        <path d="M26 44 C26 28 42 22 58 24 C68 25 76 34 76 44 Z" fill="url(#luna-hair)" />
        <path d="M72 32 Q84 34 86 46 Q80 48 76 40 Z" fill="#4f46e5" />
        <circle cx="86" cy="46" r="4" fill="#fbbf24" />
        {/* Crescent moon charm */}
        <path d="M36 30 A5 5 0 0 0 42 38 A4 4 0 0 1 36 30" fill="#fde047" stroke="#ca8a04" strokeWidth="0.8" />
        {/* Peaceful sleepy eyes */}
        <path d="M37 54 Q41 57 45 54" stroke="#312e81" strokeWidth="2.4" strokeLinecap="round" fill="none" />
        <path d="M55 54 Q59 57 63 54" stroke="#312e81" strokeWidth="2.4" strokeLinecap="round" fill="none" />
        {/* Star freckles and blush */}
        <circle cx="36" cy="62" r="4" fill="#fbcfe8" opacity="0.7" />
        <circle cx="64" cy="62" r="4" fill="#fbcfe8" opacity="0.7" />
        <text x="39" y="63" fontSize="5" fill="#f59e0b">✦</text>
        {/* Gentle resting smile */}
        <path d="M47 62 Q50 65 53 62" stroke="#4338ca" strokeWidth="2" strokeLinecap="round" fill="none" />
      </svg>
    ),
  },
  {
    id: "milo",
    name: "Milo",
    tag: "Spark of Curiosity",
    description: "Radiates bright energy, playful humor, and sudden breakthroughs.",
    palette: {
      bg: "#fef3c7",
      border: "#fde047",
      accent: "#d97706",
      glow: "rgba(217, 119, 6, 0.25)",
    },
    svg: (
      <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">
        <defs>
          <linearGradient id="milo-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef3c7" />
            <stop offset="100%" stopColor="#fde68a" />
          </linearGradient>
          <linearGradient id="milo-antenna" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#milo-bg)" />
        {/* Spark Antenna on head */}
        <path d="M50 28 L50 18 L55 18 L48 10 L49 16 L44 16 Z" fill="url(#milo-antenna)" stroke="#b45309" strokeWidth="1.2" strokeLinejoin="round" />
        {/* Face */}
        <circle cx="50" cy="54" r="28" fill="#fffbeb" stroke="#b45309" strokeWidth="2.5" />
        {/* Round Scholar / Curious Glasses */}
        <circle cx="39" cy="51" r="9" fill="rgba(255, 255, 255, 0.6)" stroke="#78350f" strokeWidth="2.2" />
        <circle cx="61" cy="51" r="9" fill="rgba(255, 255, 255, 0.6)" stroke="#78350f" strokeWidth="2.2" />
        <path d="M48 51 L52 51" stroke="#78350f" strokeWidth="2.2" />
        {/* Playful Winking Eyes behind glasses */}
        <circle cx="39" cy="51" r="3.2" fill="#78350f" />
        <circle cx="38" cy="49.5" r="1.2" fill="#ffffff" />
        <path d="M57 51 Q61 48 65 51" stroke="#78350f" strokeWidth="2.6" strokeLinecap="round" fill="none" />
        {/* Cheerful Blushing */}
        <circle cx="31" cy="61" r="4" fill="#fecdd3" />
        <circle cx="69" cy="61" r="4" fill="#fecdd3" />
        {/* Big Open Happy Smile */}
        <path d="M44 62 Q50 71 56 62 Z" fill="#991b1b" stroke="#78350f" strokeWidth="1.5" />
        <path d="M46 63 Q50 65 54 63" fill="#f87171" />
      </svg>
    ),
  },
  {
    id: "echo",
    name: "Echo",
    tag: "Thoughtful Sage",
    description: "A calm observer who listens deeply and offers grounded wisdom.",
    palette: {
      bg: "#ffedd5",
      border: "#fed7aa",
      accent: "#ea580c",
      glow: "rgba(234, 88, 12, 0.25)",
    },
    svg: (
      <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">
        <defs>
          <linearGradient id="echo-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffedd5" />
            <stop offset="100%" stopColor="#fed7aa" />
          </linearGradient>
          <linearGradient id="echo-fur" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fb923c" />
            <stop offset="100%" stopColor="#ea580c" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#echo-bg)" />
        {/* Fox Ears with Butterfly wing inner details */}
        <path d="M26 36 L34 14 L46 28 Z" fill="url(#echo-fur)" stroke="#9a3412" strokeWidth="2" strokeLinejoin="round" />
        <path d="M30 32 L35 19 L42 27 Z" fill="#fef08a" />
        <path d="M74 36 L66 14 L54 28 Z" fill="url(#echo-fur)" stroke="#9a3412" strokeWidth="2" strokeLinejoin="round" />
        <path d="M70 32 L65 19 L58 27 Z" fill="#fef08a" />
        {/* Head */}
        <circle cx="50" cy="54" r="28" fill="url(#echo-fur)" stroke="#9a3412" strokeWidth="2.5" />
        {/* White Fox Muzzle & Cheeks */}
        <path d="M30 52 C30 68 40 76 50 76 C60 76 70 68 70 52 C64 56 58 56 50 60 C42 56 36 56 30 52 Z" fill="#fffaf5" />
        {/* Fox Nose */}
        <polygon points="47,62 53,62 50,65" fill="#431407" />
        {/* Gentle Kind Eyes */}
        <path d="M36 49 Q41 45 44 49" stroke="#431407" strokeWidth="2.8" strokeLinecap="round" fill="none" />
        <path d="M56 49 Q59 45 64 49" stroke="#431407" strokeWidth="2.8" strokeLinecap="round" fill="none" />
        {/* Soft Blush */}
        <circle cx="34" cy="59" r="3.5" fill="#fca5a5" opacity="0.8" />
        <circle cx="66" cy="59" r="3.5" fill="#fca5a5" opacity="0.8" />
        {/* Cozy Lilac Scarf */}
        <path d="M34 74 Q50 82 66 74 Q50 88 34 74 Z" fill="#8b5cf6" stroke="#6d28d9" strokeWidth="1.5" />
        <circle cx="58" cy="80" r="2" fill="#c4b5fd" />
      </svg>
    ),
  },
  {
    id: "bramble",
    name: "Bramble",
    tag: "Gentle Bookworm",
    description: "Kindhearted bear who loves warm tea, good books, and shared stories.",
    palette: {
      bg: "#dcfce7",
      border: "#86efac",
      accent: "#16a34a",
      glow: "rgba(22, 163, 74, 0.25)",
    },
    svg: (
      <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">
        <defs>
          <linearGradient id="bramble-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#dcfce7" />
            <stop offset="100%" stopColor="#bbf7d0" />
          </linearGradient>
          <linearGradient id="bramble-bear" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a7f3d0" />
            <stop offset="100%" stopColor="#6ee7b7" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#bramble-bg)" />
        {/* Bear Ears */}
        <circle cx="28" cy="30" r="10" fill="url(#bramble-bear)" stroke="#047857" strokeWidth="2.2" />
        <circle cx="28" cy="30" r="5.5" fill="#fbcfe8" />
        <circle cx="72" cy="30" r="10" fill="url(#bramble-bear)" stroke="#047857" strokeWidth="2.2" />
        <circle cx="72" cy="30" r="5.5" fill="#fbcfe8" />
        {/* Head */}
        <circle cx="50" cy="54" r="28" fill="url(#bramble-bear)" stroke="#047857" strokeWidth="2.5" />
        {/* Snout */}
        <ellipse cx="50" cy="62" rx="10" ry="8" fill="#ffffff" stroke="#047857" strokeWidth="1.5" />
        <ellipse cx="50" cy="58" rx="4" ry="2.8" fill="#065f46" />
        <path d="M50 60.8 L50 64.5" stroke="#065f46" strokeWidth="1.5" />
        <path d="M47 64.5 Q50 67 53 64.5" stroke="#065f46" strokeWidth="1.5" fill="none" />
        {/* Cute Wireframe Glasses */}
        <circle cx="40" cy="50" r="7.5" fill="rgba(255, 255, 255, 0.7)" stroke="#065f46" strokeWidth="2" />
        <circle cx="60" cy="50" r="7.5" fill="rgba(255, 255, 255, 0.7)" stroke="#065f46" strokeWidth="2" />
        <path d="M47.5 50 L52.5 50" stroke="#065f46" strokeWidth="2" />
        {/* Eyes inside glasses */}
        <circle cx="40" cy="50" r="2.8" fill="#064e3b" />
        <circle cx="39" cy="48.8" r="1" fill="#ffffff" />
        <circle cx="60" cy="50" r="2.8" fill="#064e3b" />
        <circle cx="59" cy="48.8" r="1" fill="#ffffff" />
        {/* Tiny Green Sprout bookmark in ear */}
        <path d="M30 20 Q33 14 38 18 Q33 22 30 20 Z" fill="#22c55e" />
      </svg>
    ),
  },
  {
    id: "nova",
    name: "Nova",
    tag: "Friendly Tinkerer",
    description: "A cheerful little bot powered by curiosity, code, and butterfly gears.",
    palette: {
      bg: "#e0f2fe",
      border: "#7dd3fc",
      accent: "#0284c7",
      glow: "rgba(2, 132, 199, 0.25)",
    },
    svg: (
      <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">
        <defs>
          <linearGradient id="nova-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e0f2fe" />
            <stop offset="100%" stopColor="#bae6fd" />
          </linearGradient>
          <linearGradient id="nova-body" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#nova-bg)" />
        {/* Antenna with Heart Light */}
        <path d="M50 25 L50 16" stroke="#0369a1" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M50 15 C47 11 43 14 46 18 L50 22 L54 18 C57 14 53 11 50 15 Z" fill="#f43f5e" />
        {/* Robot Head (Rounded Screen TV) */}
        <rect x="24" y="26" width="52" height="46" rx="16" fill="url(#nova-body)" stroke="#0369a1" strokeWidth="2.5" />
        {/* Side Bolts / Ears */}
        <rect x="19" y="42" width="5" height="14" rx="2.5" fill="#38bdf8" stroke="#0369a1" strokeWidth="1.5" />
        <rect x="76" y="42" width="5" height="14" rx="2.5" fill="#38bdf8" stroke="#0369a1" strokeWidth="1.5" />
        {/* Monitor Screen Face */}
        <rect x="29" y="31" width="42" height="36" rx="11" fill="#0f172a" />
        {/* Glowing Cyan LED Digital Eyes */}
        <ellipse cx="40" cy="46" rx="4" ry="5.5" fill="#38bdf8" />
        <circle cx="38.5" cy="44" r="1.5" fill="#ffffff" />
        <ellipse cx="60" cy="46" rx="4" ry="5.5" fill="#38bdf8" />
        <circle cx="58.5" cy="44" r="1.5" fill="#ffffff" />
        {/* Pixel Smile */}
        <path d="M44 57 Q50 62 56 57" stroke="#38bdf8" strokeWidth="2.4" strokeLinecap="round" fill="none" />
        {/* Digital Blush dots */}
        <circle cx="34" cy="54" r="1.5" fill="#f43f5e" />
        <circle cx="66" cy="54" r="1.5" fill="#f43f5e" />
        {/* Butterfly Badge on chest */}
        <circle cx="50" cy="79" r="6" fill="#7354b8" />
        <path d="M48 78 Q46 76 48 74 Q50 76 48 78 Z" fill="#c084fc" />
        <path d="M52 78 Q54 76 52 74 Q50 76 52 78 Z" fill="#a855f7" />
      </svg>
    ),
  },
  {
    id: "kiko",
    name: "Kiko",
    tag: "Cloud Sprite",
    description: "Floaty, empathetic, and always making everyone feel welcome.",
    palette: {
      bg: "#fce7f3",
      border: "#f472b6",
      accent: "#db2777",
      glow: "rgba(219, 39, 119, 0.25)",
    },
    svg: (
      <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">
        <defs>
          <linearGradient id="kiko-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fce7f3" />
            <stop offset="100%" stopColor="#fbcfe8" />
          </linearGradient>
          <linearGradient id="kiko-cloud" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#fdf2f8" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#kiko-bg)" />
        {/* Cloud Hair Tufts */}
        <circle cx="34" cy="30" r="14" fill="url(#kiko-cloud)" stroke="#db2777" strokeWidth="2" />
        <circle cx="66" cy="30" r="14" fill="url(#kiko-cloud)" stroke="#db2777" strokeWidth="2" />
        <circle cx="50" cy="24" r="15" fill="url(#kiko-cloud)" />
        <circle cx="50" cy="24" r="15" fill="none" stroke="#db2777" strokeWidth="2" strokeDasharray="30 20" />
        {/* Head */}
        <circle cx="50" cy="54" r="28" fill="url(#kiko-cloud)" stroke="#db2777" strokeWidth="2.5" />
        {/* Butterfly Ribbon Clip */}
        <path d="M26 32 C20 26 18 36 26 38 C22 42 28 46 30 40 Z" fill="#ec4899" />
        <circle cx="28" cy="36" r="2" fill="#fef08a" />
        {/* Big Joyful Closed-Eye Arc Eyes */}
        <path d="M36 51 Q41 46 46 51" stroke="#831843" strokeWidth="2.8" strokeLinecap="round" fill="none" />
        <path d="M54 51 Q59 46 64 51" stroke="#831843" strokeWidth="2.8" strokeLinecap="round" fill="none" />
        {/* Big Rosy Pink Blushing Cheeks */}
        <ellipse cx="34" cy="59" rx="5" ry="3.5" fill="#f472b6" opacity="0.6" />
        <ellipse cx="66" cy="59" rx="5" ry="3.5" fill="#f472b6" opacity="0.6" />
        {/* Sweet Smile */}
        <path d="M45 61 Q50 67 55 61" stroke="#831843" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        {/* Cute Sparkles */}
        <text x="73" y="44" fontSize="8" fill="#ec4899">✧</text>
        <text x="18" y="52" fontSize="6" fill="#ec4899">✦</text>
      </svg>
    ),
  },
  {
    id: "sunny",
    name: "Sunny",
    tag: "Warm Optimist",
    description: "Brings sunshine, gentle encouragement, and positive vibes to every circle.",
    palette: {
      bg: "#ffedd5",
      border: "#fb923c",
      accent: "#ea580c",
      glow: "rgba(234, 88, 12, 0.25)",
    },
    svg: (
      <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">
        <defs>
          <linearGradient id="sunny-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fff7ed" />
            <stop offset="100%" stopColor="#ffedd5" />
          </linearGradient>
          <linearGradient id="sunny-face" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="100%" stopColor="#fde047" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#sunny-bg)" />
        {/* Tiny Green Sprout on top */}
        <path d="M50 26 Q48 16 42 14 Q40 22 48 24 Z" fill="#4ade80" stroke="#15803d" strokeWidth="1.5" />
        <path d="M50 26 Q54 14 62 16 Q58 24 51 25 Z" fill="#22c55e" stroke="#15803d" strokeWidth="1.5" />
        {/* Tiny butterfly perched on sprout */}
        <path d="M62 14 Q65 10 67 12 Q65 15 62 14 Z" fill="#c084fc" />
        <path d="M63 15 Q66 17 65 19 Q62 17 63 15 Z" fill="#a855f7" />
        {/* Round Golden Smiling Face */}
        <circle cx="50" cy="54" r="28" fill="url(#sunny-face)" stroke="#ca8a04" strokeWidth="2.5" />
        {/* Sparkle Cheerful Eyes */}
        <ellipse cx="40" cy="51" rx="3.5" ry="4.5" fill="#713f12" />
        <circle cx="38.5" cy="49" r="1.5" fill="#ffffff" />
        <circle cx="41.5" cy="52.5" r="0.8" fill="#ffffff" />
        <ellipse cx="60" cy="51" rx="3.5" ry="4.5" fill="#713f12" />
        <circle cx="58.5" cy="49" r="1.5" fill="#ffffff" />
        <circle cx="61.5" cy="52.5" r="0.8" fill="#ffffff" />
        {/* Cheerful Peachy Blush */}
        <circle cx="33" cy="59" r="4.5" fill="#f43f5e" opacity="0.4" />
        <circle cx="67" cy="59" r="4.5" fill="#f43f5e" opacity="0.4" />
        {/* Warm Beaming Open Smile */}
        <path d="M43 61 Q50 71 57 61 Z" fill="#e11d48" stroke="#ca8a04" strokeWidth="1.5" />
        <path d="M45 62 Q50 64 55 62" fill="#fda4af" />
      </svg>
    ),
  },
];

export const AVATAR_MAP = Object.fromEntries(
  AVATAR_LIST.map((avatar) => [avatar.id, avatar])
);

/**
 * Deterministically assign a cute avatar based on a seed string (e.g. email, user id, or name)
 */
export function getDefaultAvatarId(seed = "") {
  if (!seed) return "pip";
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % AVATAR_LIST.length;
  return AVATAR_LIST[index].id;
}

/**
 * Get avatar by ID with fallback to Pip
 */
export function getAvatar(id) {
  if (id && AVATAR_MAP[id]) {
    return AVATAR_MAP[id];
  }
  return AVATAR_MAP.pip;
}

