
import React, { useEffect, useRef, useState } from 'react';

interface VirtualJoystickProps {
  onInput: (x: number, y: number) => void;
  onAction: () => void;
  onJump: () => void;
}

const VirtualJoystick: React.FC<VirtualJoystickProps> = ({ onInput, onAction, onJump }) => {
  const joystickRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const center = useRef({ x: 0, y: 0 });
  const touchId = useRef<number | null>(null);

  useEffect(() => {
    const handleStart = (clientX: number, clientY: number) => {
      if (!joystickRef.current) return;
      const rect = joystickRef.current.getBoundingClientRect();
      center.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      setActive(true);
      handleMove(clientX, clientY);
    };

    const handleMove = (clientX: number, clientY: number) => {
      if (!active || !knobRef.current) return;
      
      const maxDist = 40;
      let dx = clientX - center.current.x;
      let dy = clientY - center.current.y;
      
      const dist = Math.sqrt(dx*dx + dy*dy);
      
      if (dist > maxDist) {
        dx = (dx / dist) * maxDist;
        dy = (dy / dist) * maxDist;
      }
      
      knobRef.current.style.transform = `translate(${dx}px, ${dy}px)`;
      onInput(dx / maxDist, dy / maxDist);
    };

    const handleEnd = () => {
      setActive(false);
      if (knobRef.current) {
        knobRef.current.style.transform = `translate(0px, 0px)`;
      }
      onInput(0, 0);
      touchId.current = null;
    };

    const touchStart = (e: TouchEvent) => {
        e.preventDefault(); 
        const touch = e.changedTouches[0];
        touchId.current = touch.identifier;
        handleStart(touch.clientX, touch.clientY);
    };

    const touchMove = (e: TouchEvent) => {
        e.preventDefault();
        for(let i=0; i<e.changedTouches.length; i++) {
            if (e.changedTouches[i].identifier === touchId.current) {
                handleMove(e.changedTouches[i].clientX, e.changedTouches[i].clientY);
                break;
            }
        }
    };

    const touchEnd = (e: TouchEvent) => {
        e.preventDefault();
         for(let i=0; i<e.changedTouches.length; i++) {
            if (e.changedTouches[i].identifier === touchId.current) {
                handleEnd();
                break;
            }
        }
    };

    const mouseDown = (e: MouseEvent) => {
       handleStart(e.clientX, e.clientY);
       window.addEventListener('mousemove', mouseMove);
       window.addEventListener('mouseup', mouseUp);
    };
    
    const mouseMove = (e: MouseEvent) => {
        handleMove(e.clientX, e.clientY);
    };

    const mouseUp = () => {
        handleEnd();
        window.removeEventListener('mousemove', mouseMove);
        window.removeEventListener('mouseup', mouseUp);
    };

    const el = joystickRef.current;
    if (el) {
        el.addEventListener('touchstart', touchStart, {passive: false});
        el.addEventListener('touchmove', touchMove, {passive: false});
        el.addEventListener('touchend', touchEnd, {passive: false});
        el.addEventListener('mousedown', mouseDown);
    }

    return () => {
        if (el) {
             el.removeEventListener('touchstart', touchStart);
             el.removeEventListener('touchmove', touchMove);
             el.removeEventListener('touchend', touchEnd);
             el.removeEventListener('mousedown', mouseDown);
        }
    };
  }, [active, onInput]);

  return (
    <>
      {/* Joystick Area */}
      <div 
        ref={joystickRef}
        className="absolute bottom-8 left-8 w-32 h-32 bg-gray-900/80 border-4 border-gray-600 rounded-full z-50 touch-none flex items-center justify-center shadow-[0_5px_15px_rgba(0,0,0,0.8),inset_0_5px_10px_rgba(0,0,0,0.5)]"
      >
         {/* Stick Shaft base */}
         <div className="absolute w-12 h-12 bg-gray-800 rounded-full inset-0 m-auto shadow-inner"></div>
         {/* Stick Knob */}
         <div ref={knobRef} className="w-14 h-14 bg-red-600 rounded-full shadow-[0_5px_5px_rgba(0,0,0,0.5),inset_-5px_-5px_10px_rgba(0,0,0,0.5),inset_5px_5px_10px_rgba(255,255,255,0.4)] pointer-events-none z-10 relative">
             <div className="absolute top-2 left-3 w-4 h-3 bg-white/30 rounded-full blur-[2px]"></div>
         </div>
      </div>

      {/* Action Buttons */}
      <div className="absolute bottom-8 right-8 flex gap-6 z-50 items-end">
          <div className="relative group">
            <button 
                onTouchStart={(e) => { e.preventDefault(); onJump(); }}
                onMouseDown={(e) => { e.preventDefault(); onJump(); }}
                className="w-16 h-16 bg-blue-600 rounded-full border-b-4 border-blue-900 active:border-b-0 active:translate-y-1 active:bg-blue-700 shadow-[0_5px_10px_rgba(0,0,0,0.5)] text-white/80 font-bold font-['Press_Start_2P'] text-xs relative overflow-hidden"
            >
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.4),transparent)]"></div>
                JUMP
            </button>
            <div className="absolute -bottom-6 w-full text-center text-white/50 text-[10px] font-['Press_Start_2P']">A</div>
          </div>

          <div className="relative group">
            <button 
                onTouchStart={(e) => { e.preventDefault(); onAction(); }}
                onMouseDown={(e) => { e.preventDefault(); onAction(); }}
                className="w-20 h-20 bg-red-600 rounded-full border-b-4 border-red-900 active:border-b-0 active:translate-y-1 active:bg-red-700 shadow-[0_5px_10px_rgba(0,0,0,0.5)] text-white/80 font-bold font-['Press_Start_2P'] text-xs relative overflow-hidden"
            >
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.4),transparent)]"></div>
                ATK
            </button>
            <div className="absolute -bottom-6 w-full text-center text-white/50 text-[10px] font-['Press_Start_2P']">B</div>
          </div>
      </div>
    </>
  );
};

export default VirtualJoystick;
