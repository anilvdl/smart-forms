import pencilWrite from "@smartforms/shared/assets/icons/pencil-write-transparent.png";

export default function Logo() {
  return (
    <svg
      width="240"
      height="45"
      viewBox="0 0 200 65"
      xmlns="http://www.w3.org/2000/svg"
      className="logo-svg"
      role="img"
      aria-label="SmartForms Logo"
    >
      <style>{`
        /* Bars */
        .bar {
          opacity: 0;
          transform-origin: center;
          transform: translateX(-100px) skewX(-20deg);
          animation: slideIn 0.6s ease-out forwards;
        }
        .bar2 { animation-delay: 0.3s; }
        .bar3 { animation-delay: 0.6s; }
        .bar1 { fill: #ff6600; }
        .bar2 { fill: #007ACC; }
        .bar3 { fill: #8E44AD; }

        @keyframes slideIn {
          to {
            opacity: 1;
            transform: translateX(0) skewX(-20deg);
          }
        }

        /* Field lines */
        .field-line {
          stroke:white;
          stroke-width: 4;
          stroke-linecap: round;
          opacity: 0;
          animation: fadeLine 0.4s ease-in 0.8s forwards;
        }
        .field-line2 {
          stroke: white;
          stroke-width: 4;
          stroke-linecap: round;
          opacity: 0;
          animation: fadeLine 0.4s ease-in 1.1s forwards;
        }
        @keyframes fadeLine {
          to { opacity: 1; }
        }

        /* —— Scribble under bar3 —— */
        .scribble {
          stroke: white;
          stroke-width: 4;
          stroke-linecap: round;
          opacity: 0;
          animation: fadeScribble 0.4s ease-in 1.4s forwards;
        }
        @keyframes fadeScribble {
          to { opacity: 1; }
        }

        /* —— Pencil fades in after scribble —— */
        .pencil {
          opacity: 0;
          animation: fadePencil 0.4s ease-in forwards;
          animation-delay: 1.4s; /* along with scribble */
        }
        @keyframes fadePencil {
          to { opacity: 1; }
        }

        /* Wordmark */
        .logo-text {
          font-family: Circular, -apple-system, BlinkMacSystemFont, "Segoe UI", roboto, oxygen-sans, ubuntu, cantarell, "Helvetica Neue", sans-serif;
          font-size: 30px;
          font-weight: 700;
          fill: #222;
          opacity: 0;
          animation: fadeInText 0.5s ease-in 1.5s forwards;
          transition: fill 0.3s;
        }
        @keyframes fadeInText {
          to { opacity: 1; }
        }
        .logo-svg:hover .logo-text {
          fill: #ff6600;
        }
      `}</style>

      {/* Bars */}
      <rect className="bar bar1" x={10}  y={16} width={40} height={40} rx={10} />
      <rect className="bar bar2" x={30}  y={16} width={40} height={40} rx={10} />
      <rect className="bar bar3" x={50} y={16} width={40} height={40} rx={10} />

      {/* Field lines on bar1 */}
      <line className="field-line" x1={15} y1={31} x2={28} y2={31} />
      <line className="field-line2" x1={10} y1={44} x2={23} y2={44} />

      {/* Field lines on bar2 */}
      <line className="field-line" x1={35} y1={31} x2={48} y2={31} />
      <line className="field-line2" x1={30} y1={44} x2={43} y2={44} />

      {/* Field lines on bar3 */}
      <line className="field-line" x1={55} y1={31} x2={85} y2={31} />
      <line className="scribble" x1={55} y1={45} x2={75} y2={45} />

      {/* Pencil icon riding on bar3 */}
      <image
        className="pencil"
        href={pencilWrite.src}
        x={55}
        y={15}
        width={35}
        height={40}
        preserveAspectRatio="xMidYMid slice"
      />

      {/* Wordmark */}
      <text className="logo-text" x={95} y={48}>
        SmartForms
      </text>
    </svg>
  );
}