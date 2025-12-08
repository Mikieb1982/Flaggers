
import React, { useState, useRef, useEffect } from 'react';
import GameCanvas from './components/GameCanvas';
import VirtualJoystick from './components/VirtualJoystick';

const App: React.FC = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false); // Track win state
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(100);
  const [integrity, setIntegrity] = useState(0); // Renamed visually to Sovereignty

  const inputRef = useRef({ x: 0, y: 0, attack: false, jump: false });

  const handleStart = () => {
    setGameStarted(true);
    setGameOver(false);
    setGameWon(false);
    setScore(0);
    setHealth(100);
    setIntegrity(0);
    inputRef.current = { x: 0, y: 0, attack: false, jump: false };
  };

  const handleGameOver = (won: boolean) => {
    setGameOver(true);
    setGameWon(won);
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

  // Realistic Wood Grain & Varnish
  const cabinetStyle = {
    backgroundColor: '#2d1b15',
    backgroundImage: `
      linear-gradient(90deg, rgba(0,0,0,0.4) 0%, transparent 10%, transparent 90%, rgba(0,0,0,0.6) 100%),
      repeating-linear-gradient(0deg, transparent 0, transparent 2px, rgba(0,0,0,0.1) 3px),
      url("https://www.transparenttextures.com/patterns/wood-pattern.png")
    `,
    backgroundBlendMode: 'multiply',
    boxShadow: 'inset 0 0 50px rgba(0,0,0,0.8), 0 20px 50px rgba(0,0,0,0.5)'
  };

  // Textured Plastic for Control Deck
  const deckStyle = {
    backgroundColor: '#263238',
    backgroundImage: `
      radial-gradient(circle at 50% 0, rgba(255,255,255,0.1), transparent 70%),
      linear-gradient(45deg, #1c252a 25%, transparent 25%, transparent 75%, #1c252a 75%, #1c252a),
      linear-gradient(45deg, #1c252a 25%, transparent 25%, transparent 75%, #1c252a 75%, #1c252a)
    `,
    backgroundSize: '100% 100%, 20px 20px, 20px 20px',
    backgroundPosition: '0 0, 0 0, 10px 10px'
  };

  return (
    <div className="fixed inset-0 bg-[#0f0f0f] flex justify-center overflow-hidden touch-none select-none">
      
      {/* ARCADE CABINET CONTAINER */}
      <div className="relative w-full h-[100dvh] max-w-md flex flex-col shadow-2xl overflow-hidden" style={cabinetStyle}>
        
        {/* 1. MARQUEE SECTION */}
        <div className="shrink-0 w-full bg-black relative flex items-center justify-center z-20 border-b-[6px] border-[#1a1a1a] shadow-[0_10px_20px_rgba(0,0,0,0.5)] h-[10dvh] min-h-[3.5rem] max-h-24">
           {/* Side Bolts */}
           <div className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-gradient-to-br from-gray-400 to-gray-700 shadow-inner"></div>
           <div className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-gradient-to-br from-gray-400 to-gray-700 shadow-inner"></div>

           {/* Neon Box */}
           <div className="w-[90%] h-[80%] rounded-xl flex items-center justify-center relative overflow-hidden bg-black border-[3px] border-[#333]">
               {/* Internal Glow */}
               <div className="absolute inset-0 bg-gradient-to-r from-red-900/50 via-blue-500/20 to-red-900/50 blur-xl"></div>
               
               {/* Grid Texture */}
               <div className="absolute inset-0 opacity-40" style={{backgroundImage: 'linear-gradient(blue 1px, transparent 1px), linear-gradient(90deg, red 1px, transparent 1px)', backgroundSize: '20px 20px', filter: 'blur(0.5px)'}}></div>

               {/* Neon Border */}
               <div className="absolute inset-2 border-2 border-blue-400 rounded-lg shadow-[0_0_15px_blue,inset_0_0_10px_red] opacity-80"></div>
               
               {/* Title Text */}
               <h1 className="relative text-[#ffeb3b] font-['Press_Start_2P'] text-xl md:text-2xl tracking-widest text-center uppercase z-10 scale-y-110" 
                   style={{ 
                       textShadow: '0 0 10px #ffeb3b, 4px 4px 0px #000',
                       transform: 'skewX(-5deg)'
                   }}>
                   FLAG SHAGGERS
               </h1>
               
               {/* Gloss Overlay */}
               <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>
           </div>
        </div>

        {/* 2. SCREEN SECTION */}
        <div className="flex-1 min-h-0 w-full bg-[#050505] p-2 md:p-3 flex items-center justify-center relative shadow-[inset_0_0_50px_rgba(0,0,0,1)]">
            
            {/* Monitor Bezel */}
            <div className="relative w-full h-full bg-[#111] rounded-lg border-[12px] border-[#1a1a1a] shadow-[inset_2px_2px_5px_rgba(255,255,255,0.05),0_0_20px_black] flex items-center justify-center overflow-hidden">
                <div className="absolute bottom-2 left-4 w-12 h-2 flex gap-1 opacity-30">
                    {[1,2,3,4].map(i => <div key={i} className="w-1 h-full bg-gray-500 rounded-full"></div>)}
                </div>
                <div className="absolute bottom-2 right-4 w-12 h-2 flex gap-1 opacity-30">
                    {[1,2,3,4].map(i => <div key={i} className="w-1 h-full bg-gray-500 rounded-full"></div>)}
                </div>

                {/* Screen Content */}
                <div className="relative w-full h-full flex items-center justify-center bg-black rounded overflow-hidden shadow-[inset_0_0_30px_rgba(0,0,0,1)]">
                    
                    {/* HUD */}
                    {gameStarted && (
                        <div className="absolute top-4 left-0 right-0 z-30 px-4 font-['Press_Start_2P'] w-full flex flex-col pointer-events-none">
                            {/* Top Row: Names and Score */}
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-blue-400 text-[10px] md:text-xs tracking-widest drop-shadow-[2px_2px_0_#000] bg-black/50 px-1">GAMMON</span>
                                <div className="flex flex-col items-center">
                                    <span className="text-[#bbb] text-[8px] mb-1 drop-shadow-md">SCORE</span>
                                    <span className="text-white text-sm md:text-base tracking-widest drop-shadow-[2px_2px_0_#000]">
                                        {score.toString().padStart(6, '0')}
                                    </span>
                                </div>
                                <span className="text-red-400 text-[10px] md:text-xs tracking-widest drop-shadow-[2px_2px_0_#000] bg-black/50 px-1">LIBERAL ELITES</span>
                            </div>

                            {/* Bottom Row: Bars */}
                            <div className="flex justify-between items-center gap-2 md:gap-4">
                                {/* Hero Health */}
                                <div className="flex-1 h-5 bg-[#263238] border-2 border-white/80 skew-x-[-15deg] relative shadow-[3px_3px_0_rgba(0,0,0,0.6)] overflow-hidden">
                                     <div className="h-full bg-gradient-to-b from-blue-400 via-blue-500 to-blue-700 transition-all duration-200" style={{width: `${Math.max(0, health)}%`}}></div>
                                     <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/40"></div>
                                </div>

                                {/* VS Icon */}
                                <div className="w-8 h-8 flex items-center justify-center text-[10px] text-yellow-500 font-bold bg-black border border-yellow-900 rounded-full shadow-lg z-10">VS</div>

                                {/* Sovereignty Bar */}
                                <div className="flex-1 h-5 bg-[#263238] border-2 border-white/80 skew-x-[15deg] relative shadow-[3px_3px_0_rgba(0,0,0,0.6)] overflow-hidden">
                                     <div className="h-full bg-gradient-to-b from-red-400 via-white to-blue-500 transition-all duration-200 ml-auto" style={{width: `${Math.max(0, integrity)}%`}}></div>
                                     <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/40"></div>
                                     <div className="absolute inset-0 flex items-center justify-center text-[6px] text-black font-bold opacity-70">SOVEREIGNTY</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Game Canvas Component */}
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
                        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/85 backdrop-blur-sm px-4">
                             {/* Retro Game Title Logo */}
                             <div className="mb-10 text-center transform -rotate-2 w-full">
                                 <h2 className="text-[#ffee58] text-4xl md:text-5xl font-['Press_Start_2P'] text-shadow-[4px_4px_0_#b71c1c,6px_6px_0_#000] leading-tight tracking-wider">
                                     FLAG<br/>SHAGGERS
                                 </h2>
                                 <div className="text-white text-[8px] md:text-[10px] font-['Press_Start_2P'] mt-4 tracking-widest opacity-80 leading-relaxed uppercase max-w-sm mx-auto">
                                     STOPPING THE BOATS, WITH FLAGS, INLAND
                                 </div>
                             </div>
                             
                             {gameOver && (
                                <div className="mb-8 text-center font-['Press_Start_2P'] animate-pulse bg-black/50 p-4 border border-red-900">
                                    <p className={`text-2xl mb-2 text-shadow-md ${gameWon ? 'text-green-500' : 'text-red-500'}`}>
                                        {gameWon ? "WELL DONE, YOU WON SO\nNOW EVERYONE LOSES!" : "GAME OVER"}
                                    </p>
                                    <p className="text-gray-300 text-xs">FINAL SCORE: {score}</p>
                                </div>
                            )}

                             <button 
                                onClick={handleStart}
                                className="group relative px-8 py-4 bg-transparent outline-none"
                             >
                                 <div className="absolute inset-0 bg-blue-600 skew-x-[-10deg] border-b-4 border-blue-900 shadow-[0_0_20px_rgba(37,99,235,0.6)] transition-transform group-active:translate-y-1 group-active:border-b-0"></div>
                                 <span className="relative text-white font-['Press_Start_2P'] text-sm tracking-wider animate-pulse">INSERT COIN</span>
                             </button>
                             
                             <div className="absolute bottom-8 text-[8px] text-gray-500 font-['Press_Start_2P']">
                                 © 1989 GAMMON SOFT LTD
                             </div>
                        </div>
                    )}

                    {/* CRT Scanlines & Effects */}
                    <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_4px,3px_100%] z-40 opacity-40 mix-blend-overlay"></div>
                    
                    {/* Screen Glare */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-white/5 pointer-events-none z-40 rounded-lg"></div>
                    <div className="absolute top-0 right-0 w-[40%] h-[30%] bg-gradient-to-bl from-white/10 to-transparent rounded-bl-[100px] pointer-events-none z-40 blur-lg"></div>
                </div>
            </div>
        </div>

        {/* 3. CONTROL DECK */}
        <div className="shrink-0 w-full border-t-[4px] border-[#111] shadow-[0_-10px_30px_rgba(0,0,0,0.8)] z-20 flex flex-col relative h-[35dvh] min-h-[260px] pb-[env(safe-area-inset-bottom)]" style={deckStyle}>
             {/* Lip shadow */}
             <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-black/80 to-transparent pointer-events-none z-10"></div>

             {/* Screw Heads */}
             <div className="absolute top-3 left-3 w-3 h-3 rounded-full bg-gray-400 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.5),1px_1px_2px_rgba(0,0,0,0.8)] flex items-center justify-center opacity-80"><div className="w-2 h-0.5 bg-gray-600 rotate-45"></div></div>
             <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-gray-400 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.5),1px_1px_2px_rgba(0,0,0,0.8)] flex items-center justify-center opacity-80"><div className="w-2 h-0.5 bg-gray-600 rotate-12"></div></div>
             <div className="absolute bottom-3 left-3 w-3 h-3 rounded-full bg-gray-400 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.5),1px_1px_2px_rgba(0,0,0,0.8)] flex items-center justify-center opacity-80"><div className="w-2 h-0.5 bg-gray-600 rotate-90"></div></div>
             <div className="absolute bottom-3 right-3 w-3 h-3 rounded-full bg-gray-400 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.5),1px_1px_2px_rgba(0,0,0,0.8)] flex items-center justify-center opacity-80"><div className="w-2 h-0.5 bg-gray-600 rotate-45"></div></div>

             {/* Controls Area */}
             <div className="flex-grow w-full z-20 pt-8 pb-2">
                 <VirtualJoystick 
                    onInput={handleJoystickInput}
                    onAction={handleAction}
                    onJump={handleJump}
                 />
             </div>

             {/* Coin Slots */}
             <div className="shrink-0 h-16 w-full bg-[#1a1a1a] border-t border-[#333] flex justify-center gap-16 pb-2 items-center relative shadow-[inset_0_2px_10px_black]">
                 <div className="absolute inset-x-8 top-2 bottom-2 bg-[#212121] rounded border border-[#333] opacity-50"></div>
                 
                 <div className="w-10 h-14 bg-[#b71c1c] rounded border-[2px] border-[#5d4037] shadow-[0_2px_5px_rgba(0,0,0,0.8),inset_0_2px_5px_rgba(255,255,255,0.2)] flex flex-col items-center justify-start py-2 relative z-10">
                    <div className="w-6 h-1 bg-black rounded-full mb-1 border border-red-900"></div>
                    <div className="w-1.5 h-6 bg-black rounded-full shadow-[0_0_2px_rgba(255,255,255,0.2)] border border-red-900"></div>
                    <div className="absolute bottom-1 w-full text-center text-[6px] text-[#ffeb3b] font-bold font-sans tracking-tighter opacity-80">25p</div>
                    <div className="absolute inset-0 bg-red-500/10 animate-pulse rounded pointer-events-none"></div>
                 </div>

                 <div className="w-10 h-14 bg-[#b71c1c] rounded border-[2px] border-[#5d4037] shadow-[0_2px_5px_rgba(0,0,0,0.8),inset_0_2px_5px_rgba(255,255,255,0.2)] flex flex-col items-center justify-start py-2 relative z-10">
                    <div className="w-6 h-1 bg-black rounded-full mb-1 border border-red-900"></div>
                    <div className="w-1.5 h-6 bg-black rounded-full shadow-[0_0_2px_rgba(255,255,255,0.2)] border border-red-900"></div>
                    <div className="absolute bottom-1 w-full text-center text-[6px] text-[#ffeb3b] font-bold font-sans tracking-tighter opacity-80">25p</div>
                    <div className="absolute inset-0 bg-red-500/10 animate-pulse rounded pointer-events-none" style={{animationDelay: '0.5s'}}></div>
                 </div>
             </div>
        </div>

      </div>
    </div>
  );
};

export default App;
