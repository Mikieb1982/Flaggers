
import React, { useState, useRef, useEffect } from 'react';
import GameCanvas from './components/GameCanvas';
import VirtualJoystick from './components/VirtualJoystick';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './constants';

const App: React.FC = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(100);
  const [integrity, setIntegrity] = useState(100);
  const [scale, setScale] = useState(1);

  const inputRef = useRef({ x: 0, y: 0, attack: false, jump: false });

  useEffect(() => {
    const handleResize = () => {
      const scaleY = window.innerHeight / CANVAS_HEIGHT;
      setScale(scaleY);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleStart = () => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setHealth(100);
    setIntegrity(100);
    inputRef.current = { x: 0, y: 0, attack: false, jump: false };
  };

  const handleGameOver = (won: boolean) => {
    setGameOver(true);
    setGameStarted(false);
  };

  const handleJoystickInput = (x: number, y: number) => {
      inputRef.current.x = x;
      inputRef.current.y = y;
  };

  const handleAction = () => {
      inputRef.current.attack = true;
  };
  
  const handleJump = () => {
      inputRef.current.jump = true;
  };

  // Wood texture pattern
  const woodStyle = {
    backgroundColor: '#5d4037',
    backgroundImage: `repeating-linear-gradient(90deg, rgba(62,39,35,0.8) 0px, rgba(93,64,55,0.8) 2px, rgba(62,39,35,0.8) 4px, rgba(62,39,35,0.8) 10px)`
  };

  // Checkerboard pattern for control deck
  const checkerStyle = {
    backgroundColor: '#37474f',
    backgroundImage: `
      linear-gradient(45deg, #263238 25%, transparent 25%), 
      linear-gradient(-45deg, #263238 25%, transparent 25%), 
      linear-gradient(45deg, transparent 75%, #263238 75%), 
      linear-gradient(-45deg, transparent 75%, #263238 75%)
    `,
    backgroundSize: '24px 24px',
    backgroundPosition: '0 0, 0 12px, 12px -12px, -12px 0px'
  };

  return (
    <div className="fixed inset-0 bg-[#000] flex flex-col items-center justify-center overflow-hidden select-none touch-none">
      
      {/* ARCADE CABINET CONTAINER */}
      <div 
        className="relative flex flex-col shadow-2xl overflow-hidden rounded-t-xl" 
        style={{...woodStyle, width: CANVAS_WIDTH, height: CANVAS_HEIGHT, transform: `scale(${scale})`}}
      >
        
        {/* 1. MARQUEE SECTION */}
        <div className="h-[12%] w-full bg-black relative flex items-center justify-center p-4 z-20 border-b-8 border-[#3e2723] shadow-lg">
           {/* Neon Box */}
           <div className="w-full h-full border-4 border-cyan-400 rounded-2xl flex items-center justify-center shadow-[0_0_15px_#22d3ee,inset_0_0_15px_#22d3ee] bg-black/80 relative overflow-hidden">
               {/* Grid BG */}
               <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'linear-gradient(#22d3ee 1px, transparent 1px), linear-gradient(90deg, #22d3ee 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
               
               <h1 className="text-[#ffeb3b] font-['Press_Start_2P'] text-2xl md:text-4xl tracking-widest text-center uppercase drop-shadow-[4px_4px_0_rgba(0,0,0,1)] z-10" style={{ textShadow: '0 0 10px #ffeb3b' }}>
                   FLAG SHAGGERS
               </h1>
               
               {/* Neon Tubing Highlights */}
               <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[20%] h-[2px] bg-white blur-[2px]"></div>
               <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[20%] h-[2px] bg-white blur-[2px]"></div>
           </div>
           
           {/* Speaker Grills (Visual) */}
           <div className="absolute left-6 top-1/2 -translate-y-1/2 space-y-2 opacity-50 hidden md:block">
              <div className="w-16 h-1 bg-black rounded-full shadow-[0_1px_0_#5d4037]"></div>
              <div className="w-16 h-1 bg-black rounded-full shadow-[0_1px_0_#5d4037]"></div>
              <div className="w-16 h-1 bg-black rounded-full shadow-[0_1px_0_#5d4037]"></div>
           </div>
           <div className="absolute right-6 top-1/2 -translate-y-1/2 space-y-2 opacity-50 hidden md:block">
              <div className="w-16 h-1 bg-black rounded-full shadow-[0_1px_0_#5d4037]"></div>
              <div className="w-16 h-1 bg-black rounded-full shadow-[0_1px_0_#5d4037]"></div>
              <div className="w-16 h-1 bg-black rounded-full shadow-[0_1px_0_#5d4037]"></div>
           </div>
        </div>

        {/* 2. SCREEN SECTION (Recessed) */}
        <div className="relative flex-grow bg-[#1a1a1a] p-4 md:p-8 flex items-center justify-center shadow-[inset_0_10px_30px_rgba(0,0,0,1)]">
            
            {/* Monitor Bezel */}
            <div className="relative w-full h-full bg-[#111] rounded-2xl p-4 md:p-8 shadow-[0_0_0_1px_#333,0_0_0_8px_#111,0_0_20px_rgba(0,0,0,0.8)] border-b border-gray-800">
                
                {/* Screen Content */}
                <div className="relative w-full h-full bg-black overflow-hidden rounded-lg shadow-[inset_0_0_20px_rgba(0,0,0,1)] border-2 border-[#222]">
                    
                    {/* HUD Layer */}
                    {gameStarted && (
                        <div className="absolute top-0 left-0 right-0 z-30 p-2 font-['Press_Start_2P'] flex justify-between text-xs md:text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 md:w-10 md:h-10 border-2 border-white bg-[#ffccbc] shadow-md"></div>
                                <div className="flex flex-col">
                                    <span className="text-blue-400 drop-shadow-md">HERO</span>
                                    <div className="w-24 md:w-32 h-3 bg-red-900 border border-white">
                                        <div className="h-full bg-yellow-400" style={{width: `${Math.max(0, health)}%`}}></div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="absolute left-1/2 -translate-x-1/2 top-2 flex flex-col items-center">
                                <span className="text-blue-200 text-[10px] mb-1">SCORE</span>
                                <div className="bg-white/10 px-2 py-1 rounded text-white shadow text-shadow-sm">
                                    {score.toString().padStart(5, '0')}
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="flex flex-col items-end">
                                    <span className="text-blue-400 drop-shadow-md">GAMMON</span>
                                    <div className="w-24 md:w-32 h-3 bg-red-900 border border-white">
                                        <div className="h-full bg-yellow-400" style={{width: `${Math.max(0, integrity)}%`}}></div>
                                    </div>
                                </div>
                                <div className="w-8 h-8 md:w-10 md:h-10 border-2 border-white bg-[#ff8a80] shadow-md"></div>
                            </div>
                        </div>
                    )}

                    {/* Game Canvas */}
                    <GameCanvas 
                        gameStarted={gameStarted}
                        onScoreUpdate={setScore}
                        onHealthUpdate={setHealth}
                        onIntegrityUpdate={setIntegrity}
                        onGameOver={handleGameOver}
                        inputRef={inputRef}
                    />

                    {/* Title Screen Overlay */}
                    {!gameStarted && (
                        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-[2px]">
                             <h2 className="text-yellow-400 text-2xl md:text-4xl font-['Press_Start_2P'] mb-8 text-shadow">INSERT COIN</h2>
                             
                             {gameOver && (
                                <div className="mb-6 text-center font-['Press_Start_2P'] animate-pulse">
                                    <p className="text-red-500 text-xl mb-2">GAME OVER</p>
                                    <p className="text-white text-sm">SCORE: {score}</p>
                                </div>
                            )}

                             <button 
                                onClick={handleStart}
                                className="animate-bounce px-6 py-4 bg-blue-700 text-white font-['Press_Start_2P'] text-sm border-4 border-blue-400 hover:bg-blue-600 shadow-[0_0_15px_#2962ff]"
                             >
                                 START GAME
                             </button>
                        </div>
                    )}

                    {/* CRT Effects */}
                    <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_4px,3px_100%] z-40"></div>
                    <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_80px_rgba(0,0,0,0.6)] z-40"></div>
                    {/* Screen Glare */}
                    <div className="absolute top-0 right-0 w-[60%] h-[40%] bg-gradient-to-bl from-white/5 to-transparent rounded-bl-[100px] pointer-events-none z-40"></div>
                </div>
            </div>
        </div>

        {/* 3. CONTROL DECK */}
        <div className="relative h-[280px] w-full border-t-8 border-[#212121] shadow-[0_-5px_10px_rgba(0,0,0,0.5)] z-20 flex flex-col" style={checkerStyle}>
             {/* Deck Highlight Gradient */}
             <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-black/40 pointer-events-none"></div>

             {/* Joystick & Buttons */}
             <div className="flex-grow w-full z-20 pt-8">
                 <VirtualJoystick 
                    onInput={handleJoystickInput}
                    onAction={handleAction}
                    onJump={handleJump}
                 />
             </div>
        </div>
        
        {/* 4. COIN SLOTS (Bottom Panel) */}
        <div className="h-[120px] w-full border-t-4 border-black shadow-[inset_0_10px_20px_rgba(0,0,0,0.6)] flex items-center justify-center gap-16" style={woodStyle}>
            {/* Slot 1 */}
            <div className="flex flex-col items-center opacity-90 group cursor-pointer" onClick={handleStart}>
                <div className="w-12 h-16 bg-[#b71c1c] rounded border-4 border-[#5d4037] shadow-[inset_0_2px_5px_rgba(0,0,0,0.5),0_2px_5px_rgba(255,255,255,0.1)] flex items-center justify-center relative">
                    {/* Light */}
                    <div className={`absolute inset-0 bg-red-500 opacity-0 group-hover:opacity-30 transition-opacity ${!gameStarted ? 'animate-pulse' : ''}`}></div>
                    <div className="w-1 h-8 bg-black rounded-full shadow-[0_0_2px_rgba(255,255,255,0.4)]"></div>
                </div>
                <div className="w-8 h-6 bg-black mt-1 border-2 border-[#5d4037]"></div>
            </div>

            {/* Slot 2 */}
            <div className="flex flex-col items-center opacity-90">
                <div className="w-12 h-16 bg-[#b71c1c] rounded border-4 border-[#5d4037] shadow-[inset_0_2px_5px_rgba(0,0,0,0.5),0_2px_5px_rgba(255,255,255,0.1)] flex items-center justify-center relative">
                    <div className="w-1 h-8 bg-black rounded-full shadow-[0_0_2px_rgba(255,255,255,0.4)]"></div>
                </div>
                <div className="w-8 h-6 bg-black mt-1 border-2 border-[#5d4037]"></div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default App;
