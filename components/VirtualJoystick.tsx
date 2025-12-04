
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
    <div className="w-full h-full relative flex items-center justify-between px-4 md:px-12">
      
      {/* Joystick Group - Left Side */}
      <div className="relative flex flex-col items-center justify-center">
          {/* Label on Panel */}
          <div className="absolute -top-6 text-gray-400 text-xs md:text-sm font-['Press_Start_2P'] tracking-widest select-none pointer-events-none opacity-80" style={{ textShadow: '1px 1px 0 rgba(0,0,0,0.5)' }}>MOVE</div>
          
          <div className="relative w-32 h-32 md:w-40 md:h-40 flex items-center justify-center">
             {/* Recessed Well */}
             <div className="absolute w-24 h-24 bg-[#050505] rounded-full shadow-[inset_0_5px_10px_rgba(0,0,0,0.8)] border-b border-gray-800"></div>

             {/* Dust Washer */}
             <div className="absolute w-20 h-20 bg-[#111] rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.5)] border border-gray-900"></div>
             
             {/* Interaction Area */}
             <div ref={joystickRef} className="absolute inset-0 z-50 touch-none cursor-pointer"></div>
             
             {/* Moving Assembly (Ball Top) */}
             <div ref={knobRef} className="absolute z-40 pointer-events-none transition-transform duration-75 ease-out flex items-center justify-center">
                 {/* Drop Shadow of Ball */}
                 <div className="absolute top-2 w-12 h-12 bg-black/50 blur-sm rounded-full scale-90"></div>
                 
                 {/* Ball */}
                 <div className="relative w-14 h-14 bg-gradient-to-br from-red-500 to-red-700 rounded-full shadow-[inset_-4px_-6px_10px_rgba(0,0,0,0.4),inset_4px_4px_10px_rgba(255,255,255,0.3)] border border-red-800">
                     {/* Specular Highlight */}
                     <div className="absolute top-3 left-3 w-4 h-2.5 bg-white/70 blur-[2px] rounded-[100%] rotate-[-45deg]"></div>
                 </div>
             </div>
          </div>
          
          {/* Directional Arrows (Decal) */}
          <div className="absolute pointer-events-none opacity-40">
             <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[10px] border-l-transparent border-r-transparent border-b-yellow-500 absolute -top-16 left-1/2 -translate-x-1/2"></div>
             <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[10px] border-l-transparent border-r-transparent border-t-yellow-500 absolute top-16 left-1/2 -translate-x-1/2"></div>
             <div className="w-0 h-0 border-t-[6px] border-b-[6px] border-r-[10px] border-t-transparent border-b-transparent border-r-yellow-500 absolute -left-16 top-1/2 -translate-y-1/2"></div>
             <div className="w-0 h-0 border-t-[6px] border-b-[6px] border-l-[10px] border-t-transparent border-b-transparent border-l-yellow-500 absolute left-16 top-1/2 -translate-y-1/2"></div>
          </div>
      </div>

      {/* Button Group - Right Side */}
      <div className="flex gap-6 md:gap-12 items-center">
          
          {/* Jump Button (Blue) */}
          <div className="flex flex-col items-center relative">
              <div className="absolute -top-8 text-gray-400 text-xs md:text-sm font-['Press_Start_2P'] tracking-widest select-none pointer-events-none opacity-80" style={{ textShadow: '1px 1px 0 rgba(0,0,0,0.5)' }}>JUMP</div>
              
              <div className="relative w-20 h-20 md:w-24 md:h-24 flex items-center justify-center">
                  {/* Bezel Ring */}
                  <div className="absolute w-full h-full rounded-full bg-gradient-to-b from-gray-300 to-gray-500 shadow-[0_4px_8px_rgba(0,0,0,0.6),inset_0_1px_2px_rgba(255,255,255,0.5)]"></div>
                  
                  {/* Button Plunger */}
                  <button 
                    onTouchStart={(e) => { e.preventDefault(); onJump(); }}
                    onMouseDown={(e) => { e.preventDefault(); onJump(); }}
                    className="relative w-14 h-14 md:w-16 md:h-16 bg-blue-500 rounded-full shadow-[0_5px_0_#1565c0,inset_0_5px_10px_rgba(255,255,255,0.4)] active:translate-y-[4px] active:shadow-[inset_0_5px_10px_rgba(0,0,0,0.4)] active:bg-blue-600 transition-all overflow-hidden group touch-none border-2 border-blue-700"
                  >
                     <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-6 bg-white/20 blur-[2px] rounded-full"></div>
                  </button>
              </div>
          </div>

          {/* Attack Button (Green) */}
          <div className="flex flex-col items-center relative">
              <div className="absolute -top-8 text-gray-400 text-xs md:text-sm font-['Press_Start_2P'] tracking-widest select-none pointer-events-none opacity-80" style={{ textShadow: '1px 1px 0 rgba(0,0,0,0.5)' }}>ATTACK</div>
              
              <div className="relative w-20 h-20 md:w-24 md:h-24 flex items-center justify-center">
                   {/* Bezel Ring */}
                   <div className="absolute w-full h-full rounded-full bg-gradient-to-b from-gray-300 to-gray-500 shadow-[0_4px_8px_rgba(0,0,0,0.6),inset_0_1px_2px_rgba(255,255,255,0.5)]"></div>

                  <button 
                    onTouchStart={(e) => { e.preventDefault(); onAction(); }}
                    onMouseDown={(e) => { e.preventDefault(); onAction(); }}
                    className="relative w-14 h-14 md:w-16 md:h-16 bg-green-500 rounded-full shadow-[0_5px_0_#2e7d32,inset_0_5px_10px_rgba(255,255,255,0.4)] active:translate-y-[4px] active:shadow-[inset_0_5px_10px_rgba(0,0,0,0.4)] active:bg-green-600 transition-all overflow-hidden group touch-none border-2 border-green-700"
                  >
                     <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-6 bg-white/20 blur-[2px] rounded-full"></div>
                  </button>
              </div>
          </div>
      </div>
    </div>
  );
};

export default VirtualJoystick;
