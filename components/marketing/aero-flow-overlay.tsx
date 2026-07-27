import { cn } from "@/lib/utils";

import styles from "./aero-flow-overlay.module.css";

function cleanFlowPath(y: number) {
  return `M60,${y} C200,${y - 70} 320,${y - 90} 460,${y - 80} C650,${y - 70} 900,${y - 60} 1100,${y - 65} C1280,${y - 70} 1380,${y - 110} 1460,${y - 60} C1500,${y - 30} 1520,${y + 10} 1550,${y + 30}`;
}

function wakeFlowPath(y: number) {
  return `M60,${y} C200,${y - 50} 320,${y - 65} 460,${y - 55} C650,${y - 45} 900,${y - 40} 1100,${y - 45} C1220,${y - 50} 1280,${y - 20} 1340,${y + 30} C1400,${y + 60} 1460,${y - 10} 1500,${y + 20} C1520,${y + 35} 1535,${y + 5} 1550,${y + 15}`;
}

const FLOW_LINES = [
  { d: cleanFlowPath(190), className: cn(styles.line, styles.white, styles.speedA) },
  { d: cleanFlowPath(235), className: cn(styles.line, styles.white, styles.speedB) },
  { d: cleanFlowPath(280), className: cn(styles.line, styles.white, styles.speedC) },
  { d: cleanFlowPath(325), className: cn(styles.line, styles.white, styles.speedA) },
  { d: cleanFlowPath(370), className: cn(styles.line, styles.white, styles.speedB) },
  { d: cleanFlowPath(415), className: cn(styles.line, styles.cyan, styles.speedC) },
  { d: cleanFlowPath(460), className: cn(styles.line, styles.cyan, styles.speedA) },
  { d: cleanFlowPath(505), className: cn(styles.line, styles.cyan, styles.speedB) },
  { d: cleanFlowPath(550), className: cn(styles.line, styles.cyan, styles.speedC) },
  { d: cleanFlowPath(595), className: cn(styles.line, styles.cyan, styles.speedA) },
  { d: wakeFlowPath(640), className: cn(styles.line, styles.blue, styles.speedB) },
  { d: wakeFlowPath(685), className: cn(styles.line, styles.blue, styles.speedC) },
  { d: wakeFlowPath(730), className: cn(styles.line, styles.blue, styles.speedA) },
  { d: wakeFlowPath(770), className: cn(styles.line, styles.blue, styles.speedB) },
];

const VORTICES = [
  { x: 1350, y: 560, scale: 1 },
  { x: 1420, y: 660, scale: 1.15 },
  { x: 1380, y: 740, scale: 0.9 },
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
      {FLOW_LINES.map((line, index) => (
        <path key={index} d={line.d} className={line.className} strokeWidth={1.4} />
      ))}
      {VORTICES.map((vortex, index) => (
        <g key={index} transform={`translate(${vortex.x} ${vortex.y}) scale(${vortex.scale})`}>
          <g className={styles.vortex}>
            <path d="M-20,6 C-22,-10 -8,-22 8,-18 C22,-14 26,0 16,10 C8,18 -4,16 -8,6" strokeWidth={1.3} />
            <path d="M-10,3 C-11,-5 -3,-11 5,-9 C11,-7 13,0 8,5" strokeWidth={1.3} />
          </g>
        </g>
      ))}
    </svg>
  );
}
