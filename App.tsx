import React, { useState, useRef } from 'react';
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
    <div className="min-h-screen bg-[#111] flex flex-col items-center justify-center p-0 overflow-hidden select-none touch-none">
      
      {/* Arcade Cabinet Container */}
      <div className="relative group w-full max-w-[800px] bg-black shadow-2xl overflow-hidden border-4 border-[#222]">
        
        {/* GAME HEADER - YELLOW TEXT */}
        <div className="w-full bg-black text-[#ffeb3b] text-center py-3 border-b-4 border-white/20 font-['Press_Start_2P'] text-xl tracking-widest uppercase z-30 relative shadow-[0_4px_0_rgba(0,0,0,0.5)]">
            FLAG SHAGGERS
        </div>

        <div className="relative aspect-[8/5] w-full">
            {/* HUD */}
            {gameStarted && (
            <div className="absolute top-0 left-0 right-0 h-[80px] z-20 pointer-events-none font-['Press_Start_2P'] flex justify-between px-4 pt-4">
                
                {/* HERO HUD */}
                <div className="flex w-[350px] items-start">
                    {/* CSS Pixel Art Face: Hero */}
                    <div className="w-[48px] h-[48px] bg-[#ffccbc] border-2 border-white mr-3 relative shadow-lg box-content"
                         style={{
                             backgroundImage: `
                                linear-gradient(#5d4037 12px, transparent 0), /* Hair Top */
                                linear-gradient(90deg, #5d4037 8px, transparent 0), /* Hair Left */
                                linear-gradient(to left, #5d4037 4px, transparent 0), /* Hair Right */
                                linear-gradient(#d50000 6px, transparent 0) /* Headband */
                             `,
                             backgroundSize: '100% 100%, 100% 100%, 100% 100%, 100% 6px',
                             backgroundPosition: '0 0, 0 0, 0 0, 0 12px',
                             backgroundRepeat: 'no-repeat'
                         }}
                    >
                         <div className="absolute top-[12px] w-full h-[6px] bg-[#d50000]"></div>
                         <div className="absolute top-[22px] right-[8px] w-[6px] h-[6px] bg-black"></div> {/* Eye */}
                         <div className="absolute top-[20px] left-[6px] w-[8px] h-[3px] bg-[#3e2723]"></div> {/* Brow */}
                         <div className="absolute bottom-[8px] right-[10px] w-[12px] h-[3px] bg-[#dca293]"></div> {/* Mouth */}
                    </div>
                    
                    <div className="flex flex-col w-full">
                        <span className="text-white text-xs mb-1 tracking-widest drop-shadow-[2px_2px_0_#000] text-shadow">HERO</span>
                        <div className="w-full h-6 bg-[#b71c1c] border-2 border-white relative shadow-[2px_2px_0_#000]">
                            <div 
                            className="h-full bg-[#ffea00] absolute left-0 top-0 border-r-2 border-black"
                            style={{ width: `${Math.max(0, health)}%`, transition: 'width 0.2s' }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* SCORE */}
                <div className="absolute left-1/2 transform -translate-x-1/2 top-4 flex flex-col items-center">
                    <span className="text-[#ffeb3b] text-xs mb-1 tracking-widest">SCORE</span>
                    <span className="text-white text-xl tracking-widest drop-shadow-[3px_3px_0_#000]">
                        {score.toString().padStart(5, '0')}
                    </span>
                </div>

                {/* ENEMY HUD */}
                <div className="flex w-[350px] justify-end items-start">
                    <div className="flex flex-col w-full items-end mr-3">
                        <span className="text-white text-xs mb-1 tracking-widest drop-shadow-[2px_2px_0_#000]">FLAG SHAGGER</span>
                        <div className="w-full h-6 bg-[#b71c1c] border-2 border-white relative shadow-[2px_2px_0_#000]">
                            <div 
                            className="h-full bg-[#ffea00] absolute right-0 top-0 border-l-2 border-black"
                            style={{ width: `${Math.max(0, integrity)}%`, transition: 'width 0.2s' }}
                            ></div>
                        </div>
                    </div>
                    {/* CSS Pixel Art Face: Gammon */}
                    <div className="w-[48px] h-[48px] bg-[#ff8a80] border-2 border-white relative shadow-lg box-content"
                          style={{
                             backgroundImage: `
                                linear-gradient(#e57373 4px, transparent 0) /* Sunburn Top */
                             `,
                             backgroundRepeat: 'no-repeat'
                         }}
                    >
                        <div className="absolute top-[18px] left-[10px] w-[6px] h-[6px] bg-black"></div> {/* Eye */}
                        <div className="absolute top-[16px] left-[8px] w-[10px] h-[2px] bg-[#b71c1c]"></div> {/* Angry Brow */}
                        <div className="absolute bottom-[10px] left-[12px] w-[14px] h-[6px] bg-[#b71c1c]"></div> {/* Shouting Mouth */}
                    </div>
                </div>
            </div>
            )}

            {/* Title Screen */}
            {!gameStarted && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm">
                <h1 className="text-3xl md:text-5xl text-[#ffeb3b] mb-4 tracking-widest font-['Press_Start_2P'] text-center px-4 leading-snug drop-shadow-[4px_4px_0_#b71c1c]">
                    FLAG SHAGGERS
                </h1>
                <h2 className="text-white text-sm md:text-md mb-8 font-['Press_Start_2P'] text-center max-w-lg leading-6 text-gray-300">
                    Defend the Roundabout! Stop the Gammon Army!
                </h2>
                
                {gameOver && (
                    <div className="mb-8 text-center font-['Press_Start_2P'] animate-pulse">
                        <p className="text-[#d50000] text-2xl mb-4">GAME OVER</p>
                        <p className="text-white text-sm">SCORE: {score}</p>
                    </div>
                )}

                <button 
                    onClick={handleStart}
                    className="px-8 py-4 bg-[#0d47a1] text-white text-sm md:text-lg hover:bg-[#1565c0] border-4 border-white active:translate-y-1 font-['Press_Start_2P'] shadow-[4px_4px_0_#000] tracking-widest"
                    >
                    {gameOver ? "TRY AGAIN" : "INSERT COIN"}
                </button>
                </div>
            )}

            <GameCanvas 
            onScoreUpdate={setScore}
            onHealthUpdate={setHealth}
            onIntegrityUpdate={setIntegrity}
            onGameOver={handleGameOver}
            inputRef={inputRef}
            />

            {/* Retro CRT Effects */}
            <div className="absolute inset-0 pointer-events-none z-40 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,6px_100%] opacity-100 mix-blend-overlay"></div>
            <div className="absolute inset-0 pointer-events-none z-40 shadow-[inset_0_0_150px_rgba(0,0,0,0.7)]"></div>

            {/* Virtual Controls */}
            {gameStarted && (
                <VirtualJoystick 
                    onInput={handleJoystickInput}
                    onAction={handleAction}
                    onJump={handleJump}
                />
            )}
        </div>
      </div>
    </div>
  );
};

export default App;