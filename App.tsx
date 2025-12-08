import React, { useState, useRef } from 'react';
import GameCanvas from './components/GameCanvas';
import VirtualJoystick from './components/VirtualJoystick';

// This component is not in the image, but the original code had it.
// Let's keep it simple for now and maybe remove it later if it's not needed.
// The image shows two red slots.
const CoinSlot = () => (
    <div className="relative w-12 h-24 bg-red-800 border-2 border-red-900 rounded-md shadow-inner flex items-center justify-center">
        <div className="w-1 h-8 bg-black"></div>
    </div>
);


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

  // Main container for the arcade machine look
  return (
    <div className="fixed inset-0 bg-black flex flex-col font-sans select-none touch-none">

      {/* Top Part of the Cabinet (Marquee) */}
      <div className="relative w-full h-[15%] bg-[#1a1a1a] flex items-center justify-center border-b-4 border-gray-800 shadow-lg">
          <div className="w-[90%] h-[70%] rounded-lg border-2 border-cyan-400 bg-black shadow-[0_0_15px_#22d3ee,inset_0_0_10px_rgba(34,211,238,0.4)] flex items-center justify-center p-1">
              <h1 className="text-yellow-300 font-['Press_Start_2P'] text-2xl md:text-4xl tracking-wider drop-shadow-[0_0_5px_rgba(251,191,36,0.7)]">
                  FLAG SHAGGERS
              </h1>
          </div>
      </div>

      {/* Middle Part (Screen) */}
      <div className="relative w-full h-[50%] bg-gray-800 flex items-center justify-center p-4 border-y-8 border-gray-900">
        <div className="w-full h-full bg-black border-4 border-gray-600 rounded-lg shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] p-2">
            <div className="relative w-full h-full bg-black overflow-hidden rounded">
              {/* Game HUD */}
              {gameStarted && (
                  <div className="absolute top-0 left-0 right-0 z-30 p-2 font-['Press_Start_2P'] flex justify-between text-xs pointer-events-none text-white">
                      <div className="flex items-center gap-2">
                          <span className="text-blue-400">HERO</span>
                          <div className="w-24 h-4 bg-gray-700 border border-gray-500"><div className="h-full bg-yellow-400" style={{width: `${health}%`}}></div></div>
                      </div>
                       <div className="flex flex-col items-center">
                          <span>SCORE</span>
                          <span>{score.toString().padStart(6, '0')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                           <div className="w-24 h-4 bg-gray-700 border border-gray-500"><div className="h-full bg-red-500" style={{width: `${integrity}%`}}></div></div>
                          <span className="text-red-400">GAMMON</span>
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

              {/* Game Over / Start Screen */}
              {!gameStarted && (
                  <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/70">
                        <h2 className="text-yellow-400 text-3xl font-['Press_Start_2P'] mb-6 animate-pulse">INSERT COIN</h2>
                        {gameOver && (
                          <div className="mb-4 text-center font-['Press_Start_2P']">
                              <p className="text-red-500 text-lg mb-2">GAME OVER</p>
                              <p className="text-white text-sm">SCORE: {score}</p>
                          </div>
                        )}
                        <button
                          onClick={handleStart}
                          className="px-6 py-3 bg-blue-600 text-white font-['Press_Start_2P'] text-sm border-b-4 border-blue-800 hover:bg-blue-500 active:border-b-0 active:translate-y-1"
                        >
                            START
                        </button>
                  </div>
              )}
                {/* CRT screen effect */}
              <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.15)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_3px,3px_100%]" />
              <div className="absolute inset-0 pointer-events-none rounded-lg shadow-[inset_0_0_80px_rgba(0,0,0,1)]" />

            </div>
        </div>
      </div>

      {/* Bottom Part (Controls and Coin Slot) */}
      <div className="relative w-full h-[35%] bg-[#1a1a1a] flex flex-col">
          {/* Control Deck */}
          <div className="relative w-full h-[75%] border-b-4 border-gray-800" style={{
              backgroundColor: '#3a3a3a',
              backgroundImage: 'linear-gradient(45deg, #222 25%, transparent 25%), linear-gradient(-45deg, #222 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #222 75%), linear-gradient(-45deg, transparent 75%, #222 75%)',
              backgroundSize: '10px 10px',
              backgroundPosition: '0 0, 0 5px, 5px -5px, -5px 0px'
          }}>
              <VirtualJoystick
                onInput={handleJoystickInput}
                onAction={handleAction}
                onJump={handleJump}
              />
          </div>
          {/* Coin Slot Area */}
          <div className="w-full h-[25%] flex items-center justify-center gap-12" style={{
              backgroundColor: '#38251e',
              backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.05), rgba(255,255,255,0.05) 1px, transparent 1px, transparent 10px)'
          }}>
              <CoinSlot />
              <CoinSlot />
          </div>
      </div>

    </div>
  );
};

export default App;
