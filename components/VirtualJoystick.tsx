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
    <div className="w-full h-full relative">
      {/* Joystick Group - Left Side */}
      <div className="absolute top-1/2 -translate-y-1/2 left-[15%] md:left-[20%] flex flex-col items-center">
          <div className="mb-8 text-white/40 text-[10px] font-['Press_Start_2P'] tracking-widest select-none pointer-events-none drop-shadow-[0_1px_1px_rgba(255,255,255,0.1)]">MOVE</div>
          
          <div className="relative w-32 h-32 md:w-40 md:h-40 flex items-center justify-center">
             {/* Dust Washer */}
             <div className="absolute w-24 h-24 bg-[#111] rounded-full shadow-[0_2px_4px_rgba(255,255,255,0.1),inset_0_-2px_4px_rgba(0,0,0,0.8)] border border-black/50"></div>
             
             {/* Interaction Area */}
             <div ref={joystickRef} className="absolute inset-0 z-20 touch-none cursor-pointer"></div>
             
             {/* Stick Shaft */}
             <div className="absolute w-4 h-16 bg-gradient-to-r from-gray-500 via-gray-300 to-gray-500 rounded-full shadow-[0_5px_5px_rgba(0,0,0,0.5)] z-10" style={{ transform: 'translateY(15px)' }}></div>
             
             {/* Ball Top */}
             <div ref={knobRef} className="w-12 h-12 md:w-14 md:h-14 bg-red-600 rounded-full z-30 shadow-[0_5px_15px_rgba(0,0,0,0.5),inset_-4px_-4px_10px_rgba(0,0,0,0.6),inset_4px_4px_10px_rgba(255,255,255,0.4)] pointer-events-none relative transition-transform duration-75 ease-out border border-red-800">
                 {/* Highlight */}
                 <div className="absolute top-2 left-3 w-4 h-3 bg-white/30 blur-[1px] rounded-[100%]"></div>
             </div>
          </div>
      </div>

      {/* Button Group - Right Side */}
      <div className="absolute top-1/2 -translate-y-1/2 right-[10%] md:right-[15%] flex gap-6 md:gap-10 items-end">
          
          {/* Jump Button */}
          <div className="flex flex-col items-center">
              <div className="relative w-20 h-20 md:w-24 md:h-24 flex items-center justify-center bg-black/30 rounded-full shadow-[inset_0_2px_5px_rgba(0,0,0,0.8)] border-b border-white/10">
                  <button 
                    onTouchStart={(e) => { e.preventDefault(); onJump(); }}
                    onMouseDown={(e) => { e.preventDefault(); onJump(); }}
                    className="w-14 h-14 md:w-16 md:h-16 bg-blue-600 rounded-full shadow-[0_4px_0_#1565c0,0_5px_10px_rgba(0,0,0,0.5),inset_0_2px_5px_rgba(255,255,255,0.3)] active:translate-y-[4px] active:shadow-none active:bg-blue-700 transition-transform relative overflow-hidden group touch-none"
                  >
                     <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/10 to-transparent"></div>
                  </button>
              </div>
              <span className="mt-2 text-white/40 text-[10px] font-['Press_Start_2P'] tracking-widest select-none pointer-events-none drop-shadow-[0_1px_1px_rgba(255,255,255,0.1)]">JUMP</span>
          </div>

          {/* Attack Button (Offset higher) */}
          <div className="flex flex-col items-center -mt-8 md:-mt-12">
              <div className="relative w-20 h-20 md:w-24 md:h-24 flex items-center justify-center bg-black/30 rounded-full shadow-[inset_0_2px_5px_rgba(0,0,0,0.8)] border-b border-white/10">
                  <button 
                    onTouchStart={(e) => { e.preventDefault(); onAction(); }}
                    onMouseDown={(e) => { e.preventDefault(); onAction(); }}
                    className="w-14 h-14 md:w-16 md:h-16 bg-green-600 rounded-full shadow-[0_4px_0_#2e7d32,0_5px_10px_rgba(0,0,0,0.5),inset_0_2px_5px_rgba(255,255,255,0.3)] active:translate-y-[4px] active:shadow-none active:bg-green-700 transition-transform relative overflow-hidden group touch-none"
                  >
                     <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/10 to-transparent"></div>
                  </button>
              </div>
              <span className="mt-2 text-white/40 text-[10px] font-['Press_Start_2P'] tracking-widest select-none pointer-events-none drop-shadow-[0_1px_1px_rgba(255,255,255,0.1)]">ATTACK</span>
          </div>
      </div>
    </div>
  );
};

export default VirtualJoystick;