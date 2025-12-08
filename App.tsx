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

  // Wood texture pattern
  const woodStyle = {
    backgroundColor: '#5d4037',
    backgroundImage: `repeating-linear-gradient(90deg, rgba(62,39,35,0.8) 0px, rgba(93,64,55,0.8) 2px, rgba(62,39,35,0.8) 4px, rgba(62,39,35,0.8) 10px)`
  };

  return (
    <div className="fixed inset-0 bg-gray-900 flex flex-col select-none touch-none overflow-hidden">

      {/* 1. MARQUEE (Top 12%) */}
      <div className="relative w-full h-[12%] bg-black flex items-center justify-center border-b-8 border-[#3e2723] shadow-lg z-20">
          {/* Neon Border Container */}
          <div className="w-[95%] h-[80%] border-4 border-cyan-400 rounded-lg shadow-[0_0_15px_#22d3ee,inset_0_0_10px_#22d3ee] flex items-center justify-center bg-black/50">
              <div className="w-full h-full border-2 border-red-500 rounded flex items-center justify-center opacity-90">
                  <h1 className="text-yellow-400 font-['Press_Start_2P'] text-xl md:text-3xl tracking-widest text-shadow-lg drop-shadow-[0_0_5px_rgba(250,204,21,0.8)]">
                      FLAG SHAGGERS
                  </h1>
              </div>
          </div>
      </div>

      {/* 2. SCREEN SECTION (Middle 48%) */}
      <div className="relative w-full h-[48%] bg-black flex items-center justify-center">
        {/* Cabinet Bezel (Dark Grey Frame) */}
        <div className="relative w-full h-full bg-[#1a1a1a] p-2 md:p-4 shadow-[inset_0_0_40px_rgba(0,0,0,0.8)] border-x-[16px] border-[#3e2723]">
            
            {/* The Actual Screen */}
            <div className="relative w-full h-full bg-black overflow-hidden rounded-xl shadow-[inset_0_0_20px_rgba(0,0,0,1)] border-4 border-[#333]">

              {/* HUD Layer */}
              {gameStarted && (
                  <div className="absolute top-0 left-0 right-0 z-30 p-2 font-['Press_Start_2P'] flex justify-between text-[10px] md:text-xs">
                      <div className="flex items-center gap-2">
                          <div className="w-6 h-6 border border-white bg-[#ffccbc] shadow-md"></div>
                          <div className="flex flex-col">
                              <span className="text-blue-400 drop-shadow-md">HERO</span>
                              <div className="w-16 md:w-24 h-2 bg-red-900 border border-white">
                                  <div className="h-full bg-yellow-400" style={{width: `${Math.max(0, health)}%`}}></div>
                              </div>
                          </div>
                      </div>

                      <div className="absolute left-1/2 -translate-x-1/2 top-2 flex flex-col items-center">
                          <span className="text-blue-200 text-[8px] mb-1">SCORE</span>
                          <div className="bg-white/10 px-2 py-1 rounded text-white shadow text-shadow-sm">
                              {score.toString().padStart(5, '0')}
                          </div>
                      </div>

                      <div className="flex items-center gap-2">
                          <div className="flex flex-col items-end">
                              <span className="text-blue-400 drop-shadow-md">GAMMON</span>
                              <div className="w-16 md:w-24 h-2 bg-red-900 border border-white">
                                  <div className="h-full bg-yellow-400" style={{width: `${Math.max(0, integrity)}%`}}></div>
                              </div>
                          </div>
                          <div className="w-6 h-6 border border-white bg-[#ff8a80] shadow-md"></div>
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
                        <h2 className="text-yellow-400 text-xl md:text-3xl font-['Press_Start_2P'] mb-6 text-shadow animate-pulse">INSERT COIN</h2>
                        
                        {gameOver && (
                          <div className="mb-4 text-center font-['Press_Start_2P']">
                              <p className="text-red-500 text-lg mb-2">GAME OVER</p>
                              <p className="text-white text-xs">SCORE: {score}</p>
                          </div>
                        )}

                        <button
                          onClick={handleStart}
                          className="animate-bounce px-4 py-3 bg-blue-700 text-white font-['Press_Start_2P'] text-xs border-4 border-blue-400 hover:bg-blue-600 shadow-[0_0_15px_#2962ff]"
                        >
                            START GAME
                        </button>
                  </div>
              )}

              {/* CRT Scanlines & Glare */}
              <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_4px,3px_100%] z-40 opacity-60"></div>
              <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_60px_rgba(0,0,0,0.7)] z-40"></div>
              <div className="absolute top-0 right-0 w-[60%] h-[40%] bg-gradient-to-bl from-white/5 to-transparent rounded-bl-[100px] pointer-events-none z-40"></div>
            </div>
        </div>
      </div>

      {/* 3. CONTROL DECK (Middle-Bottom 30%) */}
      <div className="relative w-full h-[30%] shadow-[0_-10px_20px_rgba(0,0,0,0.5)] z-10" style={woodStyle}>
          {/* Deck Top Surface - angled slightly via CSS gradient shadow */}
          <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-white/10 to-black/20"></div>
          
          <div className="w-full h-full pt-4 md:pt-8">
                <VirtualJoystick
                  onInput={handleJoystickInput}
                  onAction={handleAction}
                  onJump={handleJump}
                />
            </div>
      </div>

      {/* 4. COIN SLOTS / KICK PLATE (Bottom 10%) */}
      <div className="relative w-full h-[10%] flex items-center justify-center gap-12 border-t-4 border-[#3e2723]" style={woodStyle}>
          {/* Coin Slot 1 */}
          <div className="w-16 h-20 bg-black/80 rounded border-2 border-[#3e2723] flex flex-col items-center justify-center shadow-inner">
             <div className="w-10 h-14 bg-red-700 rounded border-2 border-red-900 shadow-[inset_0_0_5px_rgba(0,0,0,0.5)] flex items-center justify-center">
                 <div className="w-1 h-8 bg-black"></div>
             </div>
             <div className="w-10 h-1 bg-red-900 mt-1"></div>
          </div>
          
          {/* Coin Slot 2 */}
          <div className="w-16 h-20 bg-black/80 rounded border-2 border-[#3e2723] flex flex-col items-center justify-center shadow-inner">
             <div className="w-10 h-14 bg-red-700 rounded border-2 border-red-900 shadow-[inset_0_0_5px_rgba(0,0,0,0.5)] flex items-center justify-center">
                 <div className="w-1 h-8 bg-black"></div>
             </div>
             <div className="w-10 h-1 bg-red-900 mt-1"></div>
          </div>
      </div>

    </div>
  );
};

export default App;
