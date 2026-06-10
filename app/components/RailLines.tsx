export default function RailLines() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>

      {/* ══ LEFT RAIL ══ */}
      <div className="absolute top-0 w-px" style={{ left: "12%", height: "128px", background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.55) 60%, rgba(255,255,255,0.35))" }} />
      <div className="absolute w-px overflow-hidden" style={{ left: "12%", top: "calc(128px + 24px)", bottom: 0, background: "rgba(255,255,255,0.18)" }}>
        <div className="absolute inset-x-0 h-32" style={{ background: "linear-gradient(to bottom, transparent, rgba(59,130,246,0.7), rgba(255,255,255,0.3), transparent)", animation: "scan-line 2.8s linear infinite" }} />
      </div>

      {/* Left crosshair */}
      <div className="absolute" style={{ left: "calc(12% - 20px)", top: "120px" }}>
        <div className="absolute h-px" style={{ width: "20px", top: "8px", left: 0, background: "rgba(255,255,255,0.6)" }} />
        <div className="absolute w-px" style={{ height: "18px", left: "20px", top: 0, background: "rgba(255,255,255,0.6)" }} />
        <div className="absolute w-2 h-2 rounded-full" style={{ left: "20px", top: "8px", marginLeft: "-4px", marginTop: "-4px", background: "#fff", boxShadow: "0 0 8px rgba(59,130,246,0.9), 0 0 2px #fff" }} />
      </div>

      {/* Left tick marks */}
      {[200, 320, 460, 600, 760].map((top, i) => (
        <div key={i} className="absolute h-px" style={{ left: "calc(12% - 12px)", top, width: "12px", background: i % 2 === 0 ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.15)" }} />
      ))}

      {/* Left vertical label */}
      <div className="absolute text-[9px] font-mono tracking-widest select-none" style={{ left: "calc(12% - 52px)", top: "220px", color: "rgba(255,255,255,0.30)", writingMode: "vertical-rl", textOrientation: "mixed", transform: "rotate(180deg)", letterSpacing: "0.15em" }}>
        AXIOM · BASE · EIP-7702
      </div>

      {/* Left scan dot */}
      <div className="absolute w-px overflow-hidden" style={{ left: "calc(12% - 1px)", top: "calc(128px + 24px)", bottom: 0 }}>
        <div className="absolute w-1 h-8 rounded-full" style={{ left: "-2px", background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.6), transparent)", animation: "scan-line 4s linear infinite", animationDelay: "0.7s" }} />
      </div>

      {/* ══ RIGHT RAIL ══ */}
      <div className="absolute top-0 w-px" style={{ right: "12%", height: "128px", background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.55) 60%, rgba(255,255,255,0.35))" }} />
      <div className="absolute w-px overflow-hidden" style={{ right: "12%", top: "calc(128px + 24px)", bottom: 0, background: "rgba(255,255,255,0.18)" }}>
        <div className="absolute inset-x-0 h-32" style={{ background: "linear-gradient(to bottom, transparent, rgba(139,92,246,0.7), rgba(255,255,255,0.3), transparent)", animation: "scan-line 2.8s linear infinite", animationDelay: "1.4s" }} />
      </div>

      {/* Right crosshair */}
      <div className="absolute" style={{ right: "calc(12% - 20px)", top: "120px" }}>
        <div className="absolute h-px" style={{ width: "20px", top: "8px", right: 0, background: "rgba(255,255,255,0.6)" }} />
        <div className="absolute w-px" style={{ height: "18px", right: "20px", top: 0, background: "rgba(255,255,255,0.6)" }} />
        <div className="absolute w-2 h-2 rounded-full" style={{ right: "20px", top: "8px", marginRight: "-4px", marginTop: "-4px", background: "#fff", boxShadow: "0 0 8px rgba(139,92,246,0.9), 0 0 2px #fff" }} />
      </div>

      {/* Right tick marks */}
      {[200, 320, 460, 600, 760].map((top, i) => (
        <div key={i} className="absolute h-px" style={{ right: "calc(12% - 12px)", top, width: "12px", background: i % 2 === 0 ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.15)" }} />
      ))}

      {/* Right vertical label */}
      <div className="absolute text-[9px] font-mono tracking-widest select-none" style={{ right: "calc(12% - 52px)", top: "220px", color: "rgba(255,255,255,0.30)", writingMode: "vertical-rl", textOrientation: "mixed", letterSpacing: "0.15em" }}>
        VENICE · X402 · 1SHOT
      </div>

      {/* Right scan dot */}
      <div className="absolute w-px overflow-hidden" style={{ right: "calc(12% - 1px)", top: "calc(128px + 24px)", bottom: 0 }}>
        <div className="absolute w-1 h-8 rounded-full" style={{ left: "-2px", background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.6), transparent)", animation: "scan-line 4s linear infinite", animationDelay: "2.1s" }} />
      </div>

    </div>
  );
}
