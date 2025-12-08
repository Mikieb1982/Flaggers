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

  // Enhanced Walnut Wood Texture for 3D realism
  const woodStyle = {
    backgroundColor: '#38251e', // Dark Brown base
    backgroundImage: `
      repeating-linear-gradient(90deg, rgba(0,0,0,0.15) 0px, rgba(0,0,0,0.15) 2px, transparent 4px, transparent 10px),
      repeating-linear-gradient(0deg, rgba(255,255,255,0.07) 0px, rgba(255,255,255,0.07) 1px, transparent 2px, transparent 12px),
      linear-gradient(135deg, #4e342e 0%, #3e2723 50%, #4e342e 100%)
    `,
    backgroundBlendMode: 'overlay, overlay, normal'
  };

  return (
    <div className="fixed inset-0 bg-gray-900 flex flex-col select-none touch-none overflow-hidden font-sans">

      {/* 1. MARQUEE (Top 12%) */}
      <div className="relative w-full h-[12%] bg-[#1a1a1a] flex items-center justify-center border-b-8 border-[#2d1b16] shadow-2xl z-20">
          {/* Neon Box */}
          <div className="w-[92%] h-[80%] rounded-lg border-[4px] border-cyan-400 shadow-[0_0_15px_#22d3ee,inset_0_0_20px_rgba(34,211,238,0.5)] flex items-center justify-center bg-black overflow-hidden relative">
              {/* Inner Red Border and Glow */}
              <div className="absolute inset-1 rounded border-3 border-red-500 shadow-[0_0_8px_#ef4444] opacity-80 pointer-events-none"></div>
              
              {/* Text */}
              <h1 className="text-[#fbbf24] font-['Press_Start_2P'] text-xl md:text-3xl tracking-widest drop-shadow-[0_0_10px_rgba(251,191,36,0.9)] z-10">
                  FLAG SHAGGERS
              </h1>
              
              {/* Scanline overlay for the sign */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,0,0,0.3)_50%)] bg-[length:100%_4px] pointer-events-none opacity-40"></div>
          </div>
      </div>

      {/* 2. SCREEN SECTION (Middle 48%) */}
      <div className="relative w-full h-[48%] bg-black flex items-center justify-center">
        {/* Cabinet Bezel - Wood Frame with deep recess */}
        <div className="relative w-full h-full p-2 md:p-3" style={woodStyle}>
          {/* Bezel Gloss / Metal Layer */}
          <div className="w-full h-full bg-[#111] rounded-xl p-3 md:p-5 border-4 border-[#333] shadow-[inset_0_0_30px_rgba(0,0,0,1),_0_0_50px_rgba(0,0,0,0.8)]">
            
            {/* The Actual Screen with Curvature Effect */}
            <div className="relative w-full h-full bg-black overflow-hidden rounded-lg border-2 border-[#111] shadow-[inset_0_0_40px_rgba(0,0,0,1)]">
              
              {/* HUD Layer (Game content is here) */}
              {gameStarted && (
                  <div className="absolute top-0 left-0 right-0 z-30 p-3 font-['Press_Start_2P'] flex justify-between text-[10px] md:text-xs pointer-events-none">
                      <div className="flex items-center gap-2">
                          <div className="w-8 h-8 border-2 border-white bg-[#ffccbc] shadow-sm pixelated"></div>
                          <div className="flex flex-col gap-1">
                              <span className="text-blue-300 drop-shadow-md tracking-wider">HERO</span>
                              <div className="w-20 md:w-28 h-2 bg-red-900 border border-white/50">
                                  <div className="h-full bg-yellow-400 transition-all duration-300" style={{width: `${Math.max(0, health)}%`}}></div>
                              </div>
                          </div>
                      </div>

                      <div className="absolute left-1/2 -translate-x-1/2 top-2 flex flex-col items-center">
                          <span className="text-yellow-200/80 text-[8px] mb-1 tracking-widest">HIGH SCORE</span>
                          <div className="bg-black/40 px-3 py-1 rounded text-white shadow-[0_2px_0_rgba(255,255,255,0.1)]">
                              {score.toString().padStart(6, '0')}
                          </div>
                      </div>

                      <div className="flex items-center gap-2">
                          <div className="flex flex-col items-end gap-1">
                              <span className="text-red-400 drop-shadow-md tracking-wider">GAMMON</span>
                              <div className="w-20 md:w-28 h-2 bg-red-900 border border-white/50">
                                  <div className="h-full bg-yellow-400 transition-all duration-300" style={{width: `${Math.max(0, integrity)}%`}}></div>
                              </div>
                          </div>
                          <div className="w-8 h-8 border-2 border-white bg-[#ff8a80] shadow-sm pixelated"></div>
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
                  <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-[1px]">
                        <h2 className="text-yellow-400 text-2xl md:text-4xl font-['Press_Start_2P'] mb-8 text-shadow-lg animate-pulse">INSERT COIN</h2>
                        
                        {gameOver && (
                          <div className="mb-6 text-center font-['Press_Start_2P']">
                              <p className="text-red-500 text-lg mb-2 animate-bounce">GAME OVER</p>
                              <p className="text-gray-300 text-xs">SCORE: {score}</p>
                          </div>
                        )}

                        <button
                          onClick={handleStart}
                          className="group relative px-8 py-4 bg-blue-600 text-white font-['Press_Start_2P'] text-sm border-b-4 border-r-4 border-blue-800 hover:bg-blue-500 hover:scale-105 active:border-0 active:translate-y-1 transition-all"
                        >
                            START GAME
                        </button>
                  </div>
              )}

              {/* CRT Screen Effects */}
              <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.15)_50%),linear-gradient(90deg,rgba(255,0,0,0.08),rgba(0,255,0,0.03),rgba(0,0,255,0.08))] bg-[length:100%_4px,6px_100%] z-40 opacity-100 mix-blend-overlay"></div>
              <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_80px_rgba(0,0,0,0.8)] z-40"></div>
              
              {/* Screen Reflection/Curvature - Use a strong gradient for a glassy look */}
              <div className="absolute inset-0 pointer-events-none z-40">
                  <div className="absolute top-0 right-0 w-[80%] h-[120%] bg-gradient-to-l from-white/10 to-transparent skew-x-[-15deg] opacity-70"></div>
                  <div className="absolute top-0 left-0 w-[50%] h-[50%] bg-white/5 rounded-full blur-2xl"></div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* 3. CONTROL DECK (Middle-Bottom 30%) */}
      <div className="relative w-full h-[30%] shadow-[0_-10px_30px_rgba(0,0,0,0.7)] z-10 overflow-hidden" style={woodStyle}>
          {/* Deck Texture Overlay (Checkered Pattern) */}
          <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%), linear-gradient(-45deg, #000 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #000 75%), linear-gradient(-45deg, transparent 75%, #000 75%)',
              backgroundSize: '20px 20px',
              backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
          }}></div>
          
          {/* Deck Top Shadow Gradient for 3D Angle */}
          <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/70 to-transparent pointer-events-none"></div>

          <div className="w-full h-full relative">
                <VirtualJoystick
                  onInput={handleJoystickInput}
                  onAction={handleAction}
                  onJump={handleJump}
                />
            </div>
      </div>

      {/* 4. COIN SLOTS (Bottom 10%) */}
      <div className="relative w-full h-[10%] flex items-center justify-center gap-16 border-t-8 border-[#2d1b16] bg-[#3e2723]" style={woodStyle}>
          {/* Coin Slot 1 */}
          <CoinSlot />
          {/* Coin Slot 2 */}
          <CoinSlot />
      </div>

    </div>
  );
};

// Sub-component for the Coin Slot visual
const CoinSlot = () => (
  <div className="relative w-16 h-20 bg-[#1a1a1a] rounded border-4 border-[#5d4037] flex flex-col items-center justify-start py-2 shadow-[0_5px_8px_rgba(0,0,0,0.5),inset_0_0_10px_rgba(0,0,0,0.7)]">
      {/* Red Light Button (Recessed look) */}
      <div className="w-10 h-12 bg-red-700 rounded-sm border-t border-l border-red-500 border-b-2 border-r-2 border-red-900 shadow-[inset_0_0_8px_rgba(0,0,0,0.8)] flex items-center justify-center mb-1 relative overflow-hidden">
          {/* Coin Slot Hole */}
          <div className="w-1 h-6 bg-black rounded-full shadow-[0_0_2px_rgba(255,255,255,0.2)]"></div>
          {/* Glow */}
          <div className="absolute inset-0 bg-red-500/20 animate-pulse pointer-events-none"></div>
      </div>
      {/* Coin Return Button (Metal Look) */}
      <div className="w-10 h-3 bg-zinc-500 rounded-sm border border-zinc-600 shadow-inner flex items-center justify-center">
        <div className="w-8 h-1 bg-black/30 rounded-full"></div>
      </div>
  </div>
);

export default App;
