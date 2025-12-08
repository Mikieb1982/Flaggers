import React, { useEffect, useRef } from 'react';

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

  useEffect(() => {
    const handleStart = (clientX: number, clientY: number) => {
      if (!joystickRef.current) return;
      const rect = joystickRef.current.getBoundingClientRect();
      center.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      active.current = true;
      handleMove(clientX, clientY);
    };

    const handleMove = (clientX: number, clientY: number) => {
      if (!active.current || !knobRef.current) return;
      
      const maxDist = 25;
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
      active.current = false;
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderDirectionalArrow = (rotation: string) => (
      <div className={`absolute w-3 h-3 bg-yellow-400 ${rotation} transform`} style={{clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'}}></div>
  )

  return (
    <div className="w-full h-full flex items-center justify-around px-4">

      {/* Left side: Joystick */}
      <div className="flex flex-col items-center">
          <span className="text-gray-400 font-['Press_Start_2P'] text-xs mb-2">MOVE</span>
          <div className="relative w-40 h-40 flex items-center justify-center">
              {/* Base with directional arrows */}
              <div className="absolute w-full h-full rounded-full bg-black flex items-center justify-center">
                  {renderDirectionalArrow('top-3')}
                  {renderDirectionalArrow('bottom-3 rotate-180')}
                  {renderDirectionalArrow('left-3 -rotate-90')}
                  {renderDirectionalArrow('right-3 rotate-90')}
              </div>

              <div ref={joystickRef} className="absolute w-32 h-32 rounded-full bg-gray-800 border-4 border-gray-900 shadow-inner z-10" />
              
              <div ref={knobRef} className="absolute z-20 w-16 h-16 pointer-events-none transition-transform duration-75 ease-out">
                <div className="relative w-full h-full bg-red-600 rounded-full border-2 border-red-800 shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
                    <div className="absolute top-2 left-2 w-4 h-4 bg-white/50 rounded-full blur-sm" />
                </div>
              </div>
          </div>
      </div>

      {/* Right side: Buttons */}
      <div className="flex items-center gap-6">
          <div className="flex flex-col items-center">
            <span className="text-gray-400 font-['Press_Start_2P'] text-xs mb-2">JUMP</span>
            <button 
              onTouchStart={(e) => { e.preventDefault(); onJump(); }}
              onMouseDown={(e) => { e.preventDefault(); onJump(); }}
              className="relative w-24 h-24 rounded-full bg-gray-700 border-4 border-gray-800 shadow-lg active:shadow-inner"
            >
              <div className="absolute inset-2 rounded-full bg-blue-500 border-2 border-blue-700 shadow-[inset_0_0_15px_rgba(0,0,0,0.6)]">
                <div className="absolute top-3 left-3 w-8 h-8 bg-white/30 rounded-full blur-md" />
              </div>
            </button>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-gray-400 font-['Press_Start_2P'] text-xs mb-2">ATTACK</span>
            <button 
              onTouchStart={(e) => { e.preventDefault(); onAction(); }}
              onMouseDown={(e) => { e.preventDefault(); onAction(); }}
              className="relative w-24 h-24 rounded-full bg-gray-700 border-4 border-gray-800 shadow-lg active:shadow-inner"
            >
              <div className="absolute inset-2 rounded-full bg-green-500 border-2 border-green-700 shadow-[inset_0_0_15px_rgba(0,0,0,0.6)]">
                <div className="absolute top-3 left-3 w-8 h-8 bg-white/30 rounded-full blur-md" />
              </div>
            </button>
          </div>
      </div>

    </div>
  );
};

export default VirtualJoystick;
