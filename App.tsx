import React, { useState, useRef, useEffect } from 'react';
import GameCanvas from './components/GameCanvas';
import VirtualJoystick from './components/VirtualJoystick';

const App: React.FC = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(100);
  const [integrity, setIntegrity] = useState(100);

  const inputRef = useRef({ x: 0, y: 0, attack: false, jump: false });

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

  return (
    <div className="fixed inset-0 bg-[#111] flex flex-col overflow-hidden select-none touch-none">
      
      {/* 1. MARQUEE HEADER */}
      <div className="w-full bg-black text-[#ffeb3b] text-center py-2 md:py-4 border-b-4 md:border-b-8 border-[#333] font-['Press_Start_2P'] text-sm md:text-2xl tracking-widest uppercase z-30 shadow-[0_10px_20px_rgba(0,0,0,0.8)] relative flex-shrink-0 h-[6dvh] md:h-auto flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>
          <span className="drop-shadow-[0_0_10px_rgba(255,235,59,0.8)]">FLAG SHAGGERS</span>
      </div>

      {/* 2. MONITOR SECTION (The Game) - 2/3 height */}
      <div className="relative w-full flex flex-col justify-center items-center bg-[#222] p-2 md:p-4 shadow-inner z-20 grow-[2] basis-2/3 overflow-hidden">
          
          {/* Cabinet Texture */}
           <div className="absolute inset-0 opacity-40" 
             style={{ 
                 backgroundImage: `radial-gradient(circle at 50% 30%, #444 0%, #111 80%)`
             }}>
         </div>

          {/* Bezel Container - 4:5 Vertical Ratio */}
          <div className="relative border-[12px] md:border-[16px] border-[#444] rounded-lg shadow-2xl bg-black h-full max-h-full aspect-[4/5] max-w-full">
              
             {/* Actual Game Container */}
             <div className="relative w-full h-full overflow-hidden bg-black">
                
                {/* HUD */}
                {gameStarted && (
                <div className="absolute top-0 left-0 right-0 h-[15%] z-20 pointer-events-none font-['Press_Start_2P'] flex justify-between px-2 pt-2 md:px-4 md:pt-4">
                    
                    {/* HERO HUD */}
                    <div className="flex w-[40%] items-start">
                        <div className="w-[15%] aspect-square bg-[#ffccbc] border-2 border-white mr-2 relative shadow-lg box-content flex-shrink-0"
                            style={{
                                backgroundImage: `
                                    linear-gradient(#5d4037 30%, transparent 0),
                                    linear-gradient(90deg, #5d4037 20%, transparent 0),
                                    linear-gradient(#d50000 15%, transparent 0)
                                `,
                                backgroundSize: '100% 100%, 100% 100%, 100% 100%',
                                backgroundPosition: '0 0, 0 0, 0 30%',
                                backgroundRepeat: 'no-repeat'
                            }}
                        >
                            <div className="absolute top-[35%] w-full h-[15%] bg-[#d50000]"></div>
                            <div className="absolute top-[45%] right-[20%] w-[15%] h-[15%] bg-black"></div> 
                        </div>
                        
                        <div className="flex flex-col w-full">
                            <span className="text-white text-[2.5vmin] md:text-[10px] mb-1 tracking-widest drop-shadow-[2px_2px_0_#000] text-shadow">HERO</span>
                            <div className="w-full h-[1.5vmin] md:h-4 bg-[#b71c1c] border border-white relative shadow-sm">
                                <div 
                                className="h-full bg-[#ffea00] absolute left-0 top-0 border-r-2 border-black"
                                style={{ width: `${Math.max(0, health)}%`, transition: 'width 0.2s' }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    {/* SCORE */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 top-[10%] flex flex-col items-center">
                        <span className="text-[#ffeb3b] text-[2vmin] md:text-[10px] mb-1 tracking-widest">SCORE</span>
                        <span className="text-white text-[3vmin] md:text-sm tracking-widest drop-shadow-[2px_2px_0_#000]">
                            {score.toString().padStart(5, '0')}
                        </span>
                    </div>

                    {/* ENEMY HUD */}
                    <div className="flex w-[40%] justify-end items-start">
                        <div className="flex flex-col w-full items-end mr-2">
                            <span className="text-white text-[2.5vmin] md:text-[10px] mb-1 tracking-widest drop-shadow-[2px_2px_0_#000] text-right">GAMMON</span>
                            <div className="w-full h-[1.5vmin] md:h-4 bg-[#b71c1c] border border-white relative shadow-sm">
                                <div 
                                className="h-full bg-[#ffea00] absolute right-0 top-0 border-l-2 border-black"
                                style={{ width: `${Math.max(0, integrity)}%`, transition: 'width 0.2s' }}
                                ></div>
                            </div>
                        </div>
                        <div className="w-[15%] aspect-square bg-[#ff8a80] border-2 border-white relative shadow-lg box-content flex-shrink-0"
                            style={{
                                backgroundImage: `linear-gradient(#e57373 15%, transparent 0)`,
                                backgroundRepeat: 'no-repeat'
                            }}
                        >
                            <div className="absolute top-[40%] left-[20%] w-[15%] h-[15%] bg-black"></div>
                        </div>
                    </div>
                </div>
                )}

                {/* Title Screen */}
                {!gameStarted && (
                    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm">
                    <h1 className="text-[5vmin] md:text-3xl text-[#ffeb3b] mb-4 tracking-widest font-['Press_Start_2P'] text-center px-4 leading-snug drop-shadow-[4px_4px_0_#b71c1c]">
                        FLAG SHAGGERS
                    </h1>
                    <h2 className="text-white text-[2.5vmin] md:text-[10px] mb-8 font-['Press_Start_2P'] text-center max-w-lg leading-6 text-gray-300 px-4">
                        Defend the Roundabout! Stop the Gammon Army!
                    </h2>
                    
                    {gameOver && (
                        <div className="mb-8 text-center font-['Press_Start_2P'] animate-pulse">
                            <p className="text-[#d50000] text-[4vmin] md:text-xl mb-4">GAME OVER</p>
                            <p className="text-white text-[2.5vmin] md:text-xs">SCORE: {score}</p>
                        </div>
                    )}

                    <button 
                        onClick={handleStart}
                        className="px-6 py-3 md:px-8 md:py-4 bg-[#0d47a1] text-white text-[3vmin] md:text-xs hover:bg-[#1565c0] border-2 md:border-4 border-white active:translate-y-1 font-['Press_Start_2P'] shadow-[4px_4px_0_#000] tracking-widest"
                        >
                        {gameOver ? "TRY AGAIN" : "INSERT COIN"}
                    </button>
                    </div>
                )}

                {/* Canvas */}
                <GameCanvas 
                    gameStarted={gameStarted}
                    onScoreUpdate={setScore}
                    onHealthUpdate={setHealth}
                    onIntegrityUpdate={setIntegrity}
                    onGameOver={handleGameOver}
                    inputRef={inputRef}
                />

                {/* Retro CRT Effects */}
                <div className="absolute inset-0 pointer-events-none z-40 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,6px_100%] opacity-100 mix-blend-overlay"></div>
                <div className="absolute inset-0 pointer-events-none z-40 shadow-[inset_0_0_50px_rgba(0,0,0,0.5)] md:shadow-[inset_0_0_150px_rgba(0,0,0,0.7)]"></div>
             </div>
             
             {/* Screen Glare overlay */}
             <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none rounded-lg z-50"></div>
          </div>
      </div>

      {/* 3. CONTROL DECK (Bottom Area) - 1/3 height */}
      <div className="grow-[1] basis-1/3 relative w-full border-t-[8px] border-[#111] shadow-[inset_0_10px_20px_rgba(0,0,0,0.8)] flex flex-col items-center overflow-hidden bg-[#263238]">
          
          {/* Surface Texture */}
          <div className="absolute inset-0 opacity-20" 
               style={{ 
                   backgroundImage: `
                       linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000),
                       linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000)
                   `, 
                   backgroundSize: '20px 20px',
                   backgroundPosition: '0 0, 10px 10px'
                }}>
          </div>
          
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>

          {/* Controls Container */}
          <div className="flex-1 w-full max-w-2xl relative">
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-32 h-6 bg-yellow-500/80 border-2 border-yellow-600 -skew-x-12 flex items-center justify-center shadow-sm opacity-60">
                  <span className="text-[8px] font-['Press_Start_2P'] text-black/80 font-bold">HOW TO PLAY</span>
              </div>

              {gameStarted && (
                 <VirtualJoystick 
                    onInput={handleJoystickInput}
                    onAction={handleAction}
                    onJump={handleJump}
                 />
              )}
          </div>

          {/* Coin Return */}
          <div className="w-full bg-[#111] py-2 flex justify-center gap-16 border-t-4 border-black shadow-[0_-5px_15px_rgba(0,0,0,0.8)] z-10 shrink-0">
               {/* Coin Slot 1 */}
               <div className="flex flex-col items-center gap-1 opacity-90">
                   <div className="w-8 h-10 bg-red-800 rounded border-2 border-gray-600 shadow-[inset_0_2px_5px_rgba(0,0,0,0.8)] flex flex-col items-center justify-center relative overflow-hidden group">
                       <div className="w-1 h-5 bg-black rounded-full shadow-[0_0_2px_rgba(255,255,255,0.3)] group-hover:bg-yellow-900"></div>
                   </div>
               </div>
               
               {/* Coin Slot 2 */}
               <div className="flex flex-col items-center gap-1 opacity-90">
                   <div className="w-8 h-10 bg-red-800 rounded border-2 border-gray-600 shadow-[inset_0_2px_5px_rgba(0,0,0,0.8)] flex flex-col items-center justify-center relative overflow-hidden">
                       <div className="w-1 h-5 bg-black rounded-full shadow-[0_0_2px_rgba(255,255,255,0.3)]"></div>
                   </div>
               </div>
          </div>
      </div>

    </div>
  );
};

export default App;