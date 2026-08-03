"use client";

export function TechTreeVisual() {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      <defs>
        <linearGradient id="trunk-grad" x1="200" y1="360" x2="200" y2="180" gradientUnits="userSpaceOnUse">
          <stop stopColor="#16A34A" />
          <stop offset="1" stopColor="#22C55E" />
        </linearGradient>
        <linearGradient id="node-grad" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#EC40A2" />
          <stop offset="1" stopColor="#A855F7" />
        </linearGradient>
      </defs>

      <style>{`
        /* Path Growth (Stroke Dash) */
        .animate-draw-trunk {
          stroke-dasharray: 200;
          stroke-dashoffset: 200;
          animation: drawPath 1s ease-out forwards;
        }

        .animate-draw-branch-1 {
          stroke-dasharray: 200;
          stroke-dashoffset: 200;
          animation: drawPath 0.8s ease-out 0.6s forwards;
        }

        .animate-draw-branch-2 {
          stroke-dasharray: 200;
          stroke-dashoffset: 200;
          animation: drawPath 0.8s ease-out 1.2s forwards;
        }

        /* Node Blooming (Scale & Bounce) */
        .animate-bloom-low {
          transform-origin: center;
          transform: scale(0);
          animation: bloomNode 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 1.2s forwards;
        }

        .animate-bloom-mid {
          transform-origin: center;
          transform: scale(0);
          animation: bloomNode 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 1.8s forwards;
        }

        .animate-bloom-top {
          transform-origin: center;
          transform: scale(0);
          animation: bloomNode 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 2.2s forwards;
        }

        /* Continuous Ambient Pulse for bloomed nodes */
        .animate-pulse-slow {
          transform-origin: center;
          animation: idlePulse 3s ease-in-out infinite alternate 2.8s;
        }

        @keyframes drawPath {
          to { stroke-dashoffset: 0; }
        }

        @keyframes bloomNode {
          to { transform: scale(1); }
        }

        @keyframes idlePulse {
          0% { transform: scale(1); filter: drop-shadow(0 0 0px rgba(236, 64, 162, 0)); }
          100% { transform: scale(1.15); filter: drop-shadow(0 0 8px rgba(236, 64, 162, 0.6)); }
        }
      `}</style>

      {/* Ground Base */}
      <circle cx="200" cy="360" r="6" fill="#16A34A" />

      {/* 1. Main Trunk (Rises from bottom) */}
      <path
        d="M 200 360 L 200 200"
        stroke="url(#trunk-grad)"
        strokeWidth="4"
        strokeLinecap="round"
        className="animate-draw-trunk"
      />

      {/* 2. Primary Branches (Sprout sideways) */}
      <path
        d="M 200 300 C 150 280, 120 250, 110 210"
        stroke="#22C55E"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        className="animate-draw-branch-1"
      />
      <path
        d="M 200 270 C 250 250, 280 220, 290 180"
        stroke="#22C55E"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        className="animate-draw-branch-1"
      />

      {/* 3. Secondary Tech Network Connections */}
      <path
        d="M 200 230 C 160 200, 150 160, 140 130"
        stroke="#22C55E"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        className="animate-draw-branch-2"
      />
      <path
        d="M 200 210 C 240 180, 250 150, 260 110"
        stroke="#22C55E"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        className="animate-draw-branch-2"
      />

      <path
        d="M 110 210 Q 90 180 70 170"
        stroke="#A855F7"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        strokeDasharray="4 4"
        className="animate-draw-branch-2"
      />
      <path
        d="M 290 180 Q 320 150 330 130"
        stroke="#A855F7"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        strokeDasharray="4 4"
        className="animate-draw-branch-2"
      />
      <path
        d="M 140 130 Q 130 90 150 70"
        stroke="#EC40A2"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        className="animate-draw-branch-2"
      />
      <path
        d="M 260 110 Q 280 80 260 60"
        stroke="#EC40A2"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        className="animate-draw-branch-2"
      />

      {/* 4. Lower Nodes Blooming */}
      <g className="animate-bloom-low">
        <circle cx="110" cy="210" r="10" fill="#22C55E" />
        <circle cx="290" cy="180" r="10" fill="#22C55E" />
      </g>

      {/* 5. Mid Tech Nodes Blooming */}
      <g className="animate-bloom-mid">
        <circle cx="200" cy="180" r="14" fill="url(#node-grad)" />
        <circle cx="140" cy="130" r="11" fill="url(#node-grad)" />
        <circle cx="260" cy="110" r="11" fill="url(#node-grad)" />
        <circle cx="70" cy="170" r="8" fill="#A855F7" />
        <circle cx="330" cy="130" r="8" fill="#A855F7" />
      </g>

      {/* 6. Top Blooming Crowns (With Idle Pulsing) */}
      <g className="animate-bloom-top">
        <g className="animate-pulse-slow">
          <circle cx="150" cy="70" r="11" fill="#EC40A2" />
          <circle cx="260" cy="60" r="11" fill="#EC40A2" />
          <circle cx="200" cy="90" r="18" fill="url(#node-grad)" />
        </g>
      </g>
    </svg>
  );
}