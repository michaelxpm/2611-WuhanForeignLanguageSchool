import { useRef, useState } from 'react';
import { MobileJoystickInput } from './GirlWalker';

interface MobileJoystickProps {
  inputRef: React.MutableRefObject<MobileJoystickInput>;
}

export function MobileJoystick({ inputRef }: MobileJoystickProps) {
  const padRef = useRef<HTMLDivElement>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const [sprinting, setSprinting] = useState(false);

  const updateStick = (clientX: number, clientY: number) => {
    const el = padRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const maxR = rect.width * 0.38;
    let dx = clientX - cx;
    let dy = clientY - cy;
    const dist = Math.hypot(dx, dy);
    if (dist > maxR) {
      dx = (dx / dist) * maxR;
      dy = (dy / dist) * maxR;
    }
    setKnob({ x: dx, y: dy });
    inputRef.current.x = dx / maxR;
    inputRef.current.y = -dy / maxR;
  };

  const resetStick = () => {
    setKnob({ x: 0, y: 0 });
    inputRef.current.x = 0;
    inputRef.current.y = 0;
  };

  return (
    <div className="absolute bottom-20 left-4 right-4 z-20 flex items-end justify-between pointer-events-none">
      {/* Left Virtual Thumbstick */}
      <div
        ref={padRef}
        className="pointer-events-auto relative w-28 h-28 rounded-full bg-slate-900/55 border border-slate-500/50 backdrop-blur-md touch-none flex items-center justify-center shadow-xl"
        onTouchStart={(e) => {
          if (e.touches[0]) updateStick(e.touches[0].clientX, e.touches[0].clientY);
        }}
        onTouchMove={(e) => {
          if (e.touches[0]) updateStick(e.touches[0].clientX, e.touches[0].clientY);
        }}
        onTouchEnd={resetStick}
        onTouchCancel={resetStick}
      >
        <div
          className="w-11 h-11 rounded-full bg-sky-400/80 border border-white/70 shadow-md"
          style={{ transform: `translate(${knob.x}px, ${knob.y}px)` }}
        />
      </div>

      {/* Right Sprint Button */}
      <button
        type="button"
        className={`pointer-events-auto px-4 py-3 rounded-full text-xs font-bold border backdrop-blur-md shadow-xl touch-none ${
          sprinting
            ? 'bg-amber-500 text-slate-950 border-amber-200'
            : 'bg-slate-900/65 text-slate-100 border-slate-500/50'
        }`}
        onTouchStart={() => {
          setSprinting(true);
          inputRef.current.sprint = true;
        }}
        onTouchEnd={() => {
          setSprinting(false);
          inputRef.current.sprint = false;
        }}
        onTouchCancel={() => {
          setSprinting(false);
          inputRef.current.sprint = false;
        }}
      >
        加速跑
      </button>
    </div>
  );
}
