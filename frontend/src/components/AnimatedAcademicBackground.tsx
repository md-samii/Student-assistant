import React, { useEffect, useRef } from 'react';

/**
 * AnimatedAcademicBackground
 * 
 * A subtle, minimal, seamless animated wallpaper background featuring
 * original academic, engineering, AI, and career outline doodles.
 * 
 * Features:
 * - Subtle continuous floating & drifting animations.
 * - Gentle mouse parallax response on desktop without React re-renders.
 * - Seamless SVG doodle wallpaper pattern inspired by the reference aesthetic.
 * - Automatic Light Botanical and Dark Forest mode color adaptation.
 * - Respects prefers-reduced-motion and touch devices.
 * - Strictly pointer-events-none and non-intrusive.
 */

// --- Individual Academic Vector Doodles ---

const CapIcon = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c3 3 9 3 12 0v-5" />
  </svg>
);

const BookIcon = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
    <path d="M6 6h10M6 10h10M6 14h6" />
  </svg>
);

const CodeBracketsIcon = ({ size = 26 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
    <line x1="14" y1="4" x2="10" y2="20" />
  </svg>
);

const CodeBracesIcon = ({ size = 26 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 4a3 3 0 0 0-3 3v2a3 3 0 0 1-3 3 3 3 0 0 1 3 3v2a3 3 0 0 0 3 3" />
    <path d="M17 4a3 3 0 0 1 3 3v2a3 3 0 0 0 3 3 3 3 0 0 0-3 3v2a3 3 0 0 1-3 3" />
  </svg>
);

const DocumentIcon = ({ size = 26 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="9" y1="13" x2="15" y2="13" />
    <line x1="9" y1="17" x2="13" y2="17" />
  </svg>
);

const SparkleIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
  </svg>
);

const NeuralNodesIcon = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="5" cy="12" r="2.5" />
    <circle cx="12" cy="5" r="2.5" />
    <circle cx="12" cy="19" r="2.5" />
    <circle cx="19" cy="12" r="2.5" />
    <line x1="7.5" y1="12" x2="16.5" y2="12" />
    <line x1="6.8" y1="10.2" x2="10.2" y2="6.8" />
    <line x1="6.8" y1="13.8" x2="10.2" y2="17.2" />
    <line x1="13.8" y1="6.8" x2="17.2" y2="10.2" />
    <line x1="13.8" y1="17.2" x2="17.2" y2="13.8" />
  </svg>
);

const CertificateIcon = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="14" rx="2" />
    <circle cx="12" cy="10" r="3" />
    <path d="m10 17 2 4 2-4" />
  </svg>
);

const SearchIcon = ({ size = 26 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7" />
    <line x1="21" y1="21" x2="16" y2="16" />
    <path d="M11 8a3 3 0 0 0-3 3" />
  </svg>
);

const BriefcaseIcon = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="14" x="2" y="7" rx="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    <line x1="12" y1="12" x2="12" y2="12.01" />
  </svg>
);

const LightbulbIcon = ({ size = 26 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18h6" />
    <path d="M10 22h4" />
    <path d="M15 14c.7-.7 1.5-1.8 1.8-3a5.8 5.8 0 0 0-11.6 0c.3 1.2 1.1 2.3 1.8 3" />
  </svg>
);

const ChartIcon = ({ size = 26 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3v18h18" />
    <path d="m19 9-5 5-4-4-3 3" />
  </svg>
);

const QuizIcon = ({ size = 26 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="3" width="16" height="18" rx="2" />
    <path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 1.5-2 2-2 3" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const PencilIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    <path d="m15 5 4 4" />
  </svg>
);

const ChecklistIcon = ({ size = 26 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 11 3 3L22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </svg>
);

const CircuitIcon = ({ size = 26 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="7" y="7" width="10" height="10" rx="1.5" />
    <line x1="2" y1="9" x2="7" y2="9" />
    <line x1="2" y1="15" x2="7" y2="15" />
    <line x1="17" y1="9" x2="22" y2="9" />
    <line x1="17" y1="15" x2="22" y2="15" />
    <line x1="9" y1="2" x2="9" y2="7" />
    <line x1="15" y1="2" x2="15" y2="7" />
    <line x1="9" y1="17" x2="9" y2="22" />
    <line x1="15" y1="17" x2="15" y2="22" />
  </svg>
);

const FlaskIcon = ({ size = 26 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 2v7.31L4.69 18.2A2 2 0 0 0 6.42 21h11.16a2 2 0 0 0 1.73-2.8L14 9.31V2" />
    <path d="M8.5 2h7" />
    <path d="M14 9h-4" />
  </svg>
);

const CompassIcon = ({ size = 26 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="5" r="2" />
    <path d="m3.5 22 7.7-15" />
    <path d="m20.5 22-7.7-15" />
    <path d="M7 16h10" />
  </svg>
);

const TargetIcon = ({ size = 26 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const BookmarkIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
  </svg>
);

const TerminalIcon = ({ size = 26 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="4 17 10 11 4 5" />
    <line x1="12" y1="19" x2="20" y2="19" />
  </svg>
);

// --- Strategic Organically Scattered Doodle Items ---

interface DoodleDef {
  id: string;
  component: React.ComponentType<{ size?: number }>;
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
  size: number;
  rotation: number;
  floatClass: string;
  delay: number;
  parallaxDepth: number; // multiplier for cursor drift
  opacity: number;
}

const DOODLES: DoodleDef[] = [
  // Upper Perimeter & Corners
  { id: 'cap-1', component: CapIcon, x: 5, y: 12, size: 34, rotation: -8, floatClass: 'academic-doodle-float-1', delay: 0, parallaxDepth: 0.9, opacity: 0.48 },
  { id: 'lightbulb-1', component: LightbulbIcon, x: 18, y: 18, size: 30, rotation: 8, floatClass: 'academic-doodle-float-2', delay: 5, parallaxDepth: 1.0, opacity: 0.44 },
  { id: 'checklist-1', component: ChecklistIcon, x: 10, y: 24, size: 30, rotation: -5, floatClass: 'academic-doodle-float-1', delay: 2.5, parallaxDepth: 0.75, opacity: 0.46 },
  { id: 'cap-2', component: CapIcon, x: 38, y: 9, size: 28, rotation: 12, floatClass: 'academic-doodle-float-2', delay: 1.2, parallaxDepth: 0.7, opacity: 0.44 },
  { id: 'flask-1', component: FlaskIcon, x: 50, y: 11, size: 28, rotation: -6, floatClass: 'academic-doodle-float-1', delay: 2.4, parallaxDepth: 0.8, opacity: 0.45 },
  { id: 'sparkle-3', component: SparkleIcon, x: 62, y: 8, size: 24, rotation: 18, floatClass: 'academic-doodle-float-3', delay: 3.6, parallaxDepth: -0.65, opacity: 0.48 },
  { id: 'doc-2', component: DocumentIcon, x: 70, y: 14, size: 28, rotation: 6, floatClass: 'academic-doodle-float-3', delay: 1.8, parallaxDepth: -0.6, opacity: 0.42 },
  { id: 'search-1', component: SearchIcon, x: 80, y: 20, size: 30, rotation: -10, floatClass: 'academic-doodle-float-3', delay: 1, parallaxDepth: -0.6, opacity: 0.43 },
  { id: 'code-1', component: CodeBracketsIcon, x: 92, y: 14, size: 32, rotation: 6, floatClass: 'academic-doodle-float-2', delay: 1.5, parallaxDepth: -0.8, opacity: 0.45 },

  // Mid-Upper Flanks & Interior Gaps
  { id: 'code-2', component: CodeBracketsIcon, x: 3, y: 38, size: 28, rotation: -12, floatClass: 'academic-doodle-float-2', delay: 0.7, parallaxDepth: -0.7, opacity: 0.42 },
  { id: 'book-1', component: BookIcon, x: 12, y: 36, size: 36, rotation: 4, floatClass: 'academic-doodle-float-3', delay: 3, parallaxDepth: 0.7, opacity: 0.46 },
  { id: 'compass-1', component: CompassIcon, x: 26, y: 30, size: 28, rotation: -10, floatClass: 'academic-doodle-float-1', delay: 4.2, parallaxDepth: 0.9, opacity: 0.44 },
  { id: 'target-1', component: TargetIcon, x: 74, y: 30, size: 28, rotation: 14, floatClass: 'academic-doodle-float-2', delay: 2.9, parallaxDepth: -0.85, opacity: 0.45 },
  { id: 'sparkle-1', component: SparkleIcon, x: 86, y: 34, size: 28, rotation: 12, floatClass: 'academic-doodle-float-1', delay: 2, parallaxDepth: 1.1, opacity: 0.52 },
  { id: 'neural-2', component: NeuralNodesIcon, x: 96, y: 28, size: 28, rotation: -14, floatClass: 'academic-doodle-float-3', delay: 1.7, parallaxDepth: 0.8, opacity: 0.42 },

  // Center Flanks & Mid-Zone
  { id: 'quiz-1', component: QuizIcon, x: 4, y: 52, size: 32, rotation: 6, floatClass: 'academic-doodle-float-1', delay: 3.5, parallaxDepth: 0.85, opacity: 0.46 },
  { id: 'sparkle-2', component: SparkleIcon, x: 24, y: 48, size: 24, rotation: 45, floatClass: 'academic-doodle-float-2', delay: 4.8, parallaxDepth: 1.2, opacity: 0.50 },
  { id: 'circuit-2', component: CircuitIcon, x: 75, y: 50, size: 30, rotation: -8, floatClass: 'academic-doodle-float-1', delay: 3.8, parallaxDepth: -0.75, opacity: 0.44 },
  { id: 'pencil-1', component: PencilIcon, x: 94, y: 46, size: 28, rotation: -15, floatClass: 'academic-doodle-float-2', delay: 2.8, parallaxDepth: -1.0, opacity: 0.48 },

  // Mid-Lower & Transition Zone
  { id: 'bookmark-1', component: BookmarkIcon, x: 19, y: 62, size: 26, rotation: 10, floatClass: 'academic-doodle-float-1', delay: 3.1, parallaxDepth: 0.8, opacity: 0.45 },
  { id: 'cert-1', component: CertificateIcon, x: 7, y: 72, size: 34, rotation: 5, floatClass: 'academic-doodle-float-3', delay: 4, parallaxDepth: 0.8, opacity: 0.46 },
  { id: 'terminal-1', component: TerminalIcon, x: 31, y: 66, size: 26, rotation: -6, floatClass: 'academic-doodle-float-3', delay: 4.4, parallaxDepth: -0.7, opacity: 0.43 },
  { id: 'cert-2', component: CertificateIcon, x: 68, y: 64, size: 28, rotation: 8, floatClass: 'academic-doodle-float-2', delay: 2.1, parallaxDepth: 0.85, opacity: 0.44 },
  { id: 'circuit-1', component: CircuitIcon, x: 82, y: 72, size: 32, rotation: 8, floatClass: 'academic-doodle-float-1', delay: 4.5, parallaxDepth: -0.85, opacity: 0.44 },
  { id: 'neural-1', component: NeuralNodesIcon, x: 93, y: 64, size: 34, rotation: -6, floatClass: 'academic-doodle-float-2', delay: 0.8, parallaxDepth: -0.9, opacity: 0.44 },

  // Lower Perimeter & Ground Zone
  { id: 'checklist-2', component: ChecklistIcon, x: 3, y: 84, size: 28, rotation: 12, floatClass: 'academic-doodle-float-2', delay: 4.1, parallaxDepth: -0.9, opacity: 0.44 },
  { id: 'chart-1', component: ChartIcon, x: 16, y: 88, size: 32, rotation: 2, floatClass: 'academic-doodle-float-3', delay: 1.2, parallaxDepth: 0.65, opacity: 0.42 },
  { id: 'doc-1', component: DocumentIcon, x: 26, y: 78, size: 32, rotation: -6, floatClass: 'academic-doodle-float-2', delay: 0.5, parallaxDepth: 0.9, opacity: 0.42 },
  { id: 'pencil-2', component: PencilIcon, x: 38, y: 86, size: 26, rotation: 20, floatClass: 'academic-doodle-float-2', delay: 3.3, parallaxDepth: 0.7, opacity: 0.42 },
  { id: 'sparkle-4', component: SparkleIcon, x: 50, y: 90, size: 24, rotation: -25, floatClass: 'academic-doodle-float-3', delay: 0.9, parallaxDepth: -0.8, opacity: 0.48 },
  { id: 'doc-3', component: DocumentIcon, x: 62, y: 88, size: 28, rotation: -5, floatClass: 'academic-doodle-float-1', delay: 2.7, parallaxDepth: 0.75, opacity: 0.43 },
  { id: 'braces-1', component: CodeBracesIcon, x: 72, y: 88, size: 30, rotation: 4, floatClass: 'academic-doodle-float-3', delay: 3.2, parallaxDepth: -0.7, opacity: 0.44 },
  { id: 'briefcase-1', component: BriefcaseIcon, x: 88, y: 84, size: 34, rotation: -4, floatClass: 'academic-doodle-float-1', delay: 2.2, parallaxDepth: -0.7, opacity: 0.45 },
  { id: 'braces-2', component: CodeBracesIcon, x: 95, y: 80, size: 28, rotation: -10, floatClass: 'academic-doodle-float-1', delay: 3.9, parallaxDepth: -0.75, opacity: 0.43 },
];

export default function AnimatedAcademicBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const targetPos = useRef({ x: 0, y: 0 });
  const currentPos = useRef({ x: 0, y: 0 });
  const animFrameId = useRef<number | null>(null);

  useEffect(() => {
    // Check for pointer device & reduced-motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    if (prefersReducedMotion || !canHover) {
      return;
    }

    const handlePointerMove = (e: PointerEvent) => {
      // Normalize to range [-1, 1] relative to viewport center
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      targetPos.current = { x: nx, y: ny };
    };

    const updateParallax = () => {
      // Smooth lerp easing
      currentPos.current.x += (targetPos.current.x - currentPos.current.x) * 0.06;
      currentPos.current.y += (targetPos.current.y - currentPos.current.y) * 0.06;

      if (containerRef.current) {
        containerRef.current.style.setProperty('--mouse-x', currentPos.current.x.toFixed(4));
        containerRef.current.style.setProperty('--mouse-y', currentPos.current.y.toFixed(4));
      }

      animFrameId.current = requestAnimationFrame(updateParallax);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    animFrameId.current = requestAnimationFrame(updateParallax);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none text-[#134e2f] dark:text-[#86d5a4]"
      style={{
        // Default CSS custom properties in case JS is disabled or before first move
        ['--mouse-x' as string]: '0',
        ['--mouse-y' as string]: '0',
      }}
    >
      {/* 1. Subtle Botanical Ambient Glows */}
      <div className="absolute top-[8%] left-[10%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-[#97f3b5]/25 to-[#134e2f]/10 blur-3xl academic-ambient-glow" />
      <div className="absolute top-[50%] right-[8%] w-[550px] h-[550px] rounded-full bg-gradient-to-bl from-[#97f3b5]/20 to-[#134e2f]/10 blur-3xl academic-ambient-glow" style={{ animationDelay: '5s' }} />
      <div className="absolute bottom-[10%] left-[15%] w-[450px] h-[450px] rounded-full bg-gradient-to-tr from-[#97f3b5]/20 to-[#134e2f]/8 blur-3xl academic-ambient-glow" style={{ animationDelay: '9s' }} />

      {/* 2. Seamless Tiling Academic Wallpaper Texture (240x240 repeat tile) */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.15] dark:opacity-[0.11] transition-opacity duration-300"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="academic-doodle-wallpaper"
            width="240"
            height="240"
            patternUnits="userSpaceOnUse"
          >
            {/* Miniature Scattered Vector Doodles */}
            {/* Book at 25, 25 */}
            <g transform="translate(25, 25) scale(0.65)" stroke="currentColor" fill="none" strokeWidth="1.5">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
              <path d="M6 6h10M6 10h10" />
            </g>

            {/* Code </> at 145, 30 */}
            <g transform="translate(145, 30) scale(0.6)" stroke="currentColor" fill="none" strokeWidth="1.5">
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
              <line x1="14" y1="4" x2="10" y2="20" />
            </g>

            {/* Mini Flask at 80, 35 */}
            <g transform="translate(80, 30) scale(0.55)" stroke="currentColor" fill="none" strokeWidth="1.5">
              <path d="M10 2v7.31L4.69 18.2A2 2 0 0 0 6.42 21h11.16a2 2 0 0 0 1.73-2.8L14 9.31V2" />
              <path d="M8.5 2h7M14 9h-4" />
            </g>

            {/* Cap at 80, 90 */}
            <g transform="translate(80, 90) scale(0.65)" stroke="currentColor" fill="none" strokeWidth="1.5">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </g>

            {/* Sparkle at 195, 80 */}
            <g transform="translate(195, 80) scale(0.55)" stroke="currentColor" fill="none" strokeWidth="1.5">
              <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
            </g>

            {/* Mini Target at 140, 85 */}
            <g transform="translate(138, 85) scale(0.55)" stroke="currentColor" fill="none" strokeWidth="1.5">
              <circle cx="12" cy="12" r="9" />
              <circle cx="12" cy="12" r="5" />
              <circle cx="12" cy="12" r="1.5" />
            </g>

            {/* Document at 25, 145 */}
            <g transform="translate(25, 145) scale(0.6)" stroke="currentColor" fill="none" strokeWidth="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="9" y1="13" x2="15" y2="13" />
            </g>

            {/* Code Braces { } at 85, 145 */}
            <g transform="translate(82, 142) scale(0.55)" stroke="currentColor" fill="none" strokeWidth="1.5">
              <path d="M7 4a3 3 0 0 0-3 3v2a3 3 0 0 1-3 3 3 3 0 0 1 3 3v2a3 3 0 0 0 3 3" />
              <path d="M17 4a3 3 0 0 1 3 3v2a3 3 0 0 0 3 3 3 3 0 0 0-3 3v2a3 3 0 0 1-3 3" />
            </g>

            {/* Briefcase at 160, 150 */}
            <g transform="translate(160, 150) scale(0.6)" stroke="currentColor" fill="none" strokeWidth="1.5">
              <rect width="20" height="14" x="2" y="7" rx="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </g>

            {/* Lightbulb at 100, 190 */}
            <g transform="translate(100, 190) scale(0.6)" stroke="currentColor" fill="none" strokeWidth="1.5">
              <path d="M9 18h6M10 22h4" />
              <path d="M15 14c.7-.7 1.5-1.8 1.8-3a5.8 5.8 0 0 0-11.6 0c.3 1.2 1.1 2.3 1.8 3" />
            </g>

            {/* Pencil at 205, 200 */}
            <g transform="translate(205, 200) scale(0.55)" stroke="currentColor" fill="none" strokeWidth="1.5">
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            </g>

            {/* Mini Checklist at 45, 80 */}
            <g transform="translate(40, 80) scale(0.5)" stroke="currentColor" fill="none" strokeWidth="1.5">
              <path d="m9 11 3 3L22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </g>

            {/* Discrete Micro Accent Dots (just like the reference wallpaper) */}
            <circle cx="65" cy="55" r="1.5" fill="currentColor" />
            <circle cx="115" cy="30" r="1.5" fill="currentColor" />
            <circle cx="180" cy="45" r="1.5" fill="currentColor" />
            <circle cx="130" cy="115" r="1.5" fill="currentColor" />
            <circle cx="215" cy="130" r="1.5" fill="currentColor" />
            <circle cx="50" cy="210" r="1.5" fill="currentColor" />
            <circle cx="145" cy="180" r="1.5" fill="currentColor" />
            <circle cx="170" cy="95" r="1.5" fill="currentColor" />
            <circle cx="35" cy="115" r="1.5" fill="currentColor" />
            <circle cx="225" cy="35" r="1.5" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#academic-doodle-wallpaper)" />
      </svg>

      {/* 3. Floating Interactive Academic Doodles */}
      <div className="absolute inset-0 w-full h-full">
        {DOODLES.map((doodle) => {
          const Icon = doodle.component;
          return (
            <div
              key={doodle.id}
              className="absolute pointer-events-none transition-transform duration-100 ease-out"
              style={{
                left: `${doodle.x}%`,
                top: `${doodle.y}%`,
                transform: `translate3d(calc(var(--mouse-x, 0) * ${doodle.parallaxDepth * 25}px), calc(var(--mouse-y, 0) * ${doodle.parallaxDepth * 25}px), 0)`,
              }}
            >
              <div
                className={doodle.floatClass}
                style={{
                  animationDelay: `${doodle.delay}s`,
                  opacity: doodle.opacity,
                  transform: `rotate(${doodle.rotation}deg)`,
                }}
              >
                <Icon size={doodle.size} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
