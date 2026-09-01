import { motion } from "framer-motion";

export function ToranSvg({ className = "" }: { className?: string }) {
  const pennants = Array.from({ length: 9 }, (_, index) => index);

  return (
    <svg className={className} viewBox="0 0 900 130" fill="none" aria-hidden="true">
      <motion.path
        className="toran-thread"
        d="M30 34 C170 88 300 -12 450 36 C610 86 728 -8 870 34"
        stroke="#8B1E2D"
        strokeWidth="4"
        animate={{ pathLength: [0.75, 1, 0.75] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      {pennants.map((item) => {
        const x = 74 + item * 94;
        const color = item % 2 ? "#E63946" : "#FFB703";
        return (
          <g key={item}>
            <motion.g
              style={{ transformOrigin: `${x}px 40px` }}
              animate={{ rotate: item % 2 ? [-2, 3, -2] : [2, -3, 2] }}
              transition={{ duration: 2.8 + item * 0.1, repeat: Infinity, ease: "easeInOut" }}
            >
              <circle cx={x} cy="38" r="10" fill="#fff7ed" stroke="#8B1E2D" strokeWidth="3" />
              <path d={`M${x - 28} 49 L${x + 28} 49 L${x} 95 Z`} fill={color} opacity="0.95" />
              <path d={`M${x - 15} 56 Q${x} 70 ${x + 15} 56`} stroke="#fff7ed" strokeWidth="3" />
              <line x1={x} y1="94" x2={x} y2="112" stroke="#8B1E2D" strokeWidth="3" />
              <motion.path
                d={`M${x - 10} 112 Q${x} 124 ${x + 10} 112 Z`}
                fill="#FFB703"
                animate={{ rotate: [-5, 5, -5] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.g>
          </g>
        );
      })}
    </svg>
  );
}

export function RotatingMandala({ className = "" }: { className?: string }) {
  return (
    <motion.svg
      className={className}
      viewBox="0 0 120 120"
      fill="none"
      aria-hidden="true"
      animate={{ rotate: 360 }}
      transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
    >
      <circle cx="60" cy="60" r="52" stroke="#FFB703" strokeWidth="2" />
      <circle cx="60" cy="60" r="24" stroke="#E63946" strokeWidth="2" />
      {Array.from({ length: 16 }, (_, index) => (
        <path
          key={index}
          d="M60 8 C68 30 68 42 60 56 C52 42 52 30 60 8Z"
          fill={index % 2 ? "rgba(230,57,70,0.22)" : "rgba(255,183,3,0.24)"}
          transform={`rotate(${index * 22.5} 60 60)`}
        />
      ))}
      <circle cx="60" cy="60" r="7" fill="#8B1E2D" />
    </motion.svg>
  );
}

export function MandalaDivider({ label }: { label: string }) {
  return (
    <section className="relative mx-auto flex max-w-7xl items-center gap-4 px-6 py-8">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-400 to-rose-600" />
      <div className="relative flex items-center gap-3 text-center">
        <RotatingMandala className="h-10 w-10" />
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-rose-800">{label}</p>
        <RotatingMandala className="h-10 w-10" />
      </div>
      <div className="h-px flex-1 bg-gradient-to-r from-rose-600 via-amber-400 to-transparent" />
    </section>
  );
}
