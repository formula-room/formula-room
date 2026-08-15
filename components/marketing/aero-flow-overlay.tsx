import { cn } from "@/lib/utils";

import styles from "./aero-flow-overlay.module.css";

// Short, zone-specific streamlines only — front wing, floor edge, rear
// wheel, diffuser and wake. Deliberately sparse: this is secondary,
// restrained ambient motion around the car, not a field covering the canvas.
const EXTERNAL_LINES = [
  { d: "M70,640 C140,610 220,615 300,635", gradient: "fadeWhite", className: cn(styles.line, styles.speedA) },
  { d: "M60,682 C130,662 210,664 292,678", gradient: "fadeCyan", className: cn(styles.line, styles.speedC) },
  { d: "M480,748 C700,738 950,741 1180,745", gradient: "fadeCyan", className: cn(styles.line, styles.speedB) },
  { d: "M1235,612 C1298,592 1358,597 1408,618", gradient: "fadeWhite", className: cn(styles.line, styles.speedA) },
  { d: "M1298,702 C1358,732 1418,716 1468,682", gradient: "fadeBlue", className: cn(styles.line, styles.speedC) },
  { d: "M1458,542 C1498,562 1518,592 1498,622", gradient: "fadeBlue", className: cn(styles.line, styles.speedB) },
  { d: "M1478,602 C1518,632 1538,656 1512,686", gradient: "fadeBlue", className: cn(styles.line, styles.speedA) },
];

const VORTICES = [
  { x: 1400, y: 648, scale: 0.85 },
  { x: 1478, y: 598, scale: 0.7 },
];

export function AeroFlowOverlay() {
  return (
    <svg
      className={styles.svg}
      viewBox="0 0 1600 900"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="fadeWhite" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#F8FAFC" stopOpacity="0" />
          <stop offset="22%" stopColor="#F8FAFC" stopOpacity="0.26" />
          <stop offset="78%" stopColor="#F8FAFC" stopOpacity="0.26" />
          <stop offset="100%" stopColor="#F8FAFC" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="fadeCyan" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#7DE0EB" stopOpacity="0" />
          <stop offset="22%" stopColor="#7DE0EB" stopOpacity="0.28" />
          <stop offset="78%" stopColor="#7DE0EB" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#7DE0EB" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="fadeBlue" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#60A5E6" stopOpacity="0" />
          <stop offset="22%" stopColor="#60A5E6" stopOpacity="0.24" />
          <stop offset="78%" stopColor="#60A5E6" stopOpacity="0.24" />
          <stop offset="100%" stopColor="#60A5E6" stopOpacity="0" />
        </linearGradient>
      </defs>
      {EXTERNAL_LINES.map((line, index) => (
        <path key={index} d={line.d} stroke={`url(#${line.gradient})`} strokeWidth={1.1} className={line.className} />
      ))}
      {VORTICES.map((vortex, index) => (
        <g key={index} transform={`translate(${vortex.x} ${vortex.y}) scale(${vortex.scale})`}>
          <g className={styles.vortex}>
            <path d="M-20,6 C-22,-10 -8,-22 8,-18 C22,-14 26,0 16,10 C8,18 -4,16 -8,6" strokeWidth={1.1} />
            <path d="M-10,3 C-11,-5 -3,-11 5,-9 C11,-7 13,0 8,5" strokeWidth={1.1} />
          </g>
        </g>
      ))}
    </svg>
  );
}
