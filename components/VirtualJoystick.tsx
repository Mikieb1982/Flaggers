import React, { useEffect, useRef, useCallback } from 'react';

interface VirtualJoystickProps {
  onInput: (x: number, y: number) => void;
  onAction: () => void;
  onJump: () => void;
}

const VirtualJoystick: React.FC<VirtualJoystickProps> = ({ onInput, onAction, onJump }) => {
  const joystickRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const active = useRef(false);
  const center = useRef({ x: 0, y: 0 });
  const touchId = useRef<number | null>(null);

  const handleEnd = useCallback(() => {
    active.current = false;
    if (knobRef.current) {
      knobRef.current.style.transform = `translate(0px, 0px)`;
    }
    onInput(0, 0);
    touchId.current = null;
  }, [onInput]);

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!active.current || !knobRef.current) return;
    
    const maxDist = 30; // Increased max distance for more range
    let dx = clientX - center.current.x;
    let dy = clientY - center.current.y;
    
    const dist = Math.sqrt(dx*dx + dy*dy);
    
    if (dist > maxDist) {
      dx = (dx / dist) * maxDist;
      dy = (dy / dist) * maxDist;
    }
    
    knobRef.current.style.transform = `translate(${dx}px, ${dy}px)`;
    onInput(dx / maxDist, dy / maxDist);
  }, [onInput]);


  const handleStart = useCallback((clientX: number, clientY: number) => {
    if (!joystickRef.current) return;
    const rect = joystickRef.current.getBoundingClientRect();
    center.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    active.current = true;
    handleMove(clientX, clientY);
  }, [handleMove]);


  useEffect(() => {
    const el = joystickRef.current;

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
  }, [handleStart, handleMove, handleEnd]);

  return (
    <div className="w-full h-full relative flex items-center justify-between px-6 md:px-12 py-4">
      
      {/* 1. LEFT: JOYSTICK */}
      <div className="relative flex flex-col items-center justify-center w-1/3">
          <div className="mb-2 text-gray-300/60 text-[10px] font-['Press_Start_2P'] tracking-widest select-none">MOVE</div>
          
          <div className="relative w-32 h-32 flex items-center justify-center">
             {/* Dust Washer */}
             <div className="absolute w-24 h-24 bg-black/80 rounded-full shadow-[0_2px_4px_rgba(255,255,255,0.1)] border border-gray-700"></div>
             
             {/* Joystick Shaft Base */}
             <div className="absolute w-8 h-8 bg-gray-400 rounded-full shadow-inner"></div>

             {/* Interaction Area */}
             <div ref={joystickRef} className="absolute inset-0 z-50 touch-none cursor-pointer"></div>
             
             {/* Ball Top (Enhanced) */}
             <div ref={knobRef} className="absolute z-40 pointer-events-none transition-transform duration-75 ease-out flex items-center justify-center">
                 <div className="absolute top-4 w-10 h-10 bg-black/40 blur-md rounded-full scale-110"></div>
                 
                 {/* Shiny Red Ball with better highlights */}
                 <div className="relative w-14 h-14 bg-red-700 rounded-full shadow-[inset_-6px_-8px_12px_rgba(0,0,0,0.7),inset_6px_6px_10px_rgba(255,255,255,0.5),0_6px_12px_rgba(0,0,0,0.6)] border-b-2 border-red-900">
                     {/* Glossy highlight */}
                     <div className="absolute top-2 left-3 w-5 h-4 bg-white/60 blur-[3px] rounded-full rotate-[-45deg]"></div>
                     {/* Darker shadow point */}
                     <div className="absolute bottom-1 right-2 w-3 h-3 bg-black/20 rounded-full blur-[1px]"></div>
                 </div>
             </div>
          </div>
      </div>

      {/* 2. CENTER: INSTRUCTION STICKER */}
      <div className="flex flex-col items-center justify-center w-1/3 opacity-90 transform translate-y-4">
          <div className="bg-[#fbc02d] text-black font-['Press_Start_2P'] text-[8px] md:text-[10px] px-3 py-1 border-2 border-black/20 shadow-lg -rotate-1 text-center leading-tight tracking-tighter">
              HOW TO PLAY
          </div>
          <div className="mt-2 flex gap-1">
               <div className="w-10 h-4 bg-gray-800 rounded border border-gray-600 shadow-inner"></div>
               <div className="w-10 h-4 bg-gray-800 rounded border border-gray-600 shadow-inner"></div>
          </div>
      </div>

      {/* 3. RIGHT: BUTTONS (Blue & Green) */}
      <div className="flex gap-4 md:gap-8 items-center justify-center w-1/3">
          
          {/* Jump Button (BLUE - Enhanced) */}
          <div className="flex flex-col items-center gap-2">
              <button 
                onTouchStart={(e) => { e.preventDefault(); onJump(); }}
                onMouseDown={(e) => { e.preventDefault(); onJump(); }}
                className="relative w-16 h-16 md:w-18 md:h-18 rounded-full bg-blue-600 border-4 border-gray-400 shadow-[0_6px_0_#1e3a8a,0_8px_15px_rgba(0,0,0,0.6)] active:translate-y-[6px] active:shadow-none transition-all duration-75 group"
              >
                 {/* Plastic Bezel Highlight */}
                 <div className="absolute inset-2 rounded-full border border-blue-400/70 bg-gradient-to-br from-blue-400/30 to-transparent"></div>
              </button>
              <span className="text-gray-400 text-[8px] md:text-[10px] font-['Press_Start_2P'] tracking-widest">JUMP</span>
          </div>

          {/* Attack Button (GREEN - Enhanced) */}
          <div className="flex flex-col items-center gap-2 mt-8">
              <button 
                onTouchStart={(e) => { e.preventDefault(); onAction(); }}
                onMouseDown={(e) => { e.preventDefault(); onAction(); }}
                className="relative w-16 h-16 md:w-18 md:h-18 rounded-full bg-green-500 border-4 border-gray-400 shadow-[0_6px_0_#14532d,0_8px_15px_rgba(0,0,0,0.6)] active:translate-y-[6px] active:shadow-none transition-all duration-75 group"
              >
                  {/* Plastic Bezel Highlight */}
                  <div className="absolute inset-2 rounded-full border border-green-400/70 bg-gradient-to-br from-green-400/30 to-transparent"></div>
              </button>
              <span className="text-gray-400 text-[8px] md:text-[10px] font-['Press_Start_2P'] tracking-widest">ATTACK</span>
          </div>
      </div>
      
    </div>
  );
};

export default VirtualJoystick;
