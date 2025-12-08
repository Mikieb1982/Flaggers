
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
      
      const maxDist = 35; // Limited range for tighter feel
      let dx = clientX - center.current.x;
      let dy = clientY - center.current.y;
      
      const dist = Math.sqrt(dx*dx + dy*dy);
      
      if (dist > maxDist) {
        dx = (dx / dist) * maxDist;
        dy = (dy / dist) * maxDist;
      }
      
      knobRef.current.style.transform = `translate(${dx}px, ${dy}px)`;
      // Add slight tilt effect to stick shaft
      knobRef.current.style.filter = `drop-shadow(${dx * -0.2}px ${dy * -0.2}px 4px rgba(0,0,0,0.5))`;
      
      onInput(dx / maxDist, dy / maxDist);
    };

    const handleEnd = () => {
      setActive(false);
      if (knobRef.current) {
        knobRef.current.style.transform = `translate(0px, 0px)`;
        knobRef.current.style.filter = 'none';
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
    <div className="w-full h-full relative flex items-center justify-between px-6 md:px-12">
      
      {/* Joystick Group - Left Side */}
      <div className="relative flex flex-col items-center justify-center">
          {/* Label */}
          <div className="absolute -top-6 bg-black/80 px-2 py-0.5 rounded border border-gray-700 text-gray-300 text-[10px] font-['Press_Start_2P'] tracking-widest select-none pointer-events-none">MOVE</div>
          
          <div className="relative w-36 h-36 flex items-center justify-center">
             {/* Joystick Well/Recess */}
             <div className="absolute w-24 h-24 bg-[#111] rounded-full shadow-[inset_0_5px_15px_black,0_0_0_4px_#222] border-b border-gray-800"></div>

             {/* Dust Washer */}
             <div className="absolute w-16 h-16 bg-[#0a0a0a] rounded-full shadow-[0_2px_5px_rgba(0,0,0,0.8)] border border-gray-800 flex items-center justify-center">
                 <div className="w-12 h-12 rounded-full border border-gray-800 opacity-20"></div>
             </div>
             
             {/* Interaction Area */}
             <div ref={joystickRef} className="absolute inset-0 z-50 touch-none cursor-pointer rounded-full"></div>
             
             {/* Stick & Ball Top */}
             <div ref={knobRef} className="absolute z-40 pointer-events-none transition-transform duration-75 ease-out flex items-center justify-center">
                 {/* Shaft (Hidden mostly by ball but visible if tilted far) */}
                 <div className="absolute top-4 w-4 h-12 bg-gray-400 rounded-b"></div>
                 
                 {/* Ball Shadow */}
                 <div className="absolute top-4 w-12 h-12 bg-black/60 blur-md rounded-full scale-100 translate-y-2"></div>
                 
                 {/* Red Ball Top */}
                 <div className="relative w-14 h-14 bg-[#d32f2f] rounded-full shadow-[inset_-5px_-5px_15px_rgba(0,0,0,0.6),inset_5px_5px_10px_rgba(255,255,255,0.4),0_0_5px_rgba(0,0,0,0.5)] border-t border-red-400">
                     {/* Glossy Reflection */}
                     <div className="absolute top-2 left-3 w-5 h-3 bg-gradient-to-b from-white/90 to-white/10 blur-[1px] rounded-[100%] rotate-[-45deg]"></div>
                     <div className="absolute bottom-3 right-3 w-3 h-3 bg-red-900/50 blur-[2px] rounded-full"></div>
                 </div>
             </div>
          </div>
          
          {/* Directional Arrows (Decal) */}
          <div className="absolute pointer-events-none opacity-60">
             <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[10px] border-l-transparent border-r-transparent border-b-[#fdd835] absolute -top-14 left-1/2 -translate-x-1/2 drop-shadow-md"></div>
             <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[10px] border-l-transparent border-r-transparent border-t-[#fdd835] absolute top-14 left-1/2 -translate-x-1/2 drop-shadow-md"></div>
             <div className="w-0 h-0 border-t-[6px] border-b-[6px] border-r-[10px] border-t-transparent border-b-transparent border-r-[#fdd835] absolute -left-14 top-1/2 -translate-y-1/2 drop-shadow-md"></div>
             <div className="w-0 h-0 border-t-[6px] border-b-[6px] border-l-[10px] border-t-transparent border-b-transparent border-l-[#fdd835] absolute left-14 top-1/2 -translate-y-1/2 drop-shadow-md"></div>
          </div>
      </div>

      {/* Button Group - Right Side */}
      <div className="flex gap-4 md:gap-8 items-center transform rotate-[-5deg] translate-y-4">
          
          {/* Jump Button (Blue) */}
          <div className="flex flex-col items-center relative">
              <div className="absolute -top-7 text-gray-300 text-[10px] font-['Press_Start_2P'] tracking-widest select-none pointer-events-none drop-shadow-md bg-black/80 px-2 py-0.5 rounded border border-gray-700">JUMP</div>
              
              <div className="relative w-20 h-20 md:w-24 md:h-24 flex items-center justify-center">
                  {/* Outer Rim (Black Plastic) */}
                  <div className="absolute w-20 h-20 bg-black rounded-full shadow-[0_2px_4px_rgba(255,255,255,0.1),0_5px_10px_black]"></div>
                  
                  {/* Button Plunger */}
                  <button 
                    onTouchStart={(e) => { e.preventDefault(); onJump(); }}
                    onMouseDown={(e) => { e.preventDefault(); onJump(); }}
                    className="relative w-16 h-16 bg-[#2962ff] rounded-full shadow-[inset_0_0_10px_rgba(0,0,0,0.5),inset_2px_2px_5px_rgba(255,255,255,0.4),0_5px_0_#0d47a1] active:translate-y-[4px] active:shadow-[inset_0_0_15px_rgba(0,0,0,0.8)] active:bg-[#1e88e5] transition-all overflow-hidden group touch-none border-4 border-black"
                  >
                     {/* Convex shine */}
                     <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-6 bg-white/20 blur-[3px] rounded-full"></div>
                  </button>
              </div>
          </div>

          {/* Attack Button (Green) */}
          <div className="flex flex-col items-center relative -translate-y-4">
              <div className="absolute -top-7 text-gray-300 text-[10px] font-['Press_Start_2P'] tracking-widest select-none pointer-events-none drop-shadow-md bg-black/80 px-2 py-0.5 rounded border border-gray-700">HIT</div>
              
              <div className="relative w-20 h-20 md:w-24 md:h-24 flex items-center justify-center">
                   {/* Outer Rim */}
                   <div className="absolute w-20 h-20 bg-black rounded-full shadow-[0_2px_4px_rgba(255,255,255,0.1),0_5px_10px_black]"></div>

                  <button 
                    onTouchStart={(e) => { e.preventDefault(); onAction(); }}
                    onMouseDown={(e) => { e.preventDefault(); onAction(); }}
                    className="relative w-16 h-16 bg-[#43a047] rounded-full shadow-[inset_0_0_10px_rgba(0,0,0,0.5),inset_2px_2px_5px_rgba(255,255,255,0.4),0_5px_0_#1b5e20] active:translate-y-[4px] active:shadow-[inset_0_0_15px_rgba(0,0,0,0.8)] active:bg-[#4caf50] transition-all overflow-hidden group touch-none border-4 border-black"
                  >
                     <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-6 bg-white/20 blur-[3px] rounded-full"></div>
                  </button>
              </div>
          </div>
      </div>
    </div>
  );
};

export default VirtualJoystick;
