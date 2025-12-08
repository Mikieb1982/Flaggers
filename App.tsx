
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
  const appRef = useRef<HTMLDivElement>(null);

  const inputRef = useRef({ x: 0, y: 0, attack: false, jump: false });

  useEffect(() => {
    const handleResize = () => {
      if (!appRef.current) return;

      const { clientWidth, clientHeight } = appRef.current;
      const scaleX = clientWidth / CANVAS_WIDTH;
      const scaleY = clientHeight / CANVAS_HEIGHT;
      const newScale = Math.min(scaleX, scaleY);
      setScale(newScale);
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

  // Wood texture pattern for the arcade cabinet body
  const woodStyle = {
    backgroundColor: '#5d4037',
    backgroundImage: `repeating-linear-gradient(90deg, rgba(62,39,35,0.8) 0px, rgba(93,64,55,0.8) 2px, rgba(62,39,35,0.8) 4px, rgba(62,39,35,0.8) 10px)`
  };


  return (
    <div ref={appRef} className="fixed inset-0 bg-black flex items-center justify-center select-none touch-none overflow-hidden">

      {/* ARCADE CABINET CONTAINER - Scaled to fit screen */}
      <div
        className="relative flex flex-col"
        style={{
          width: `${CANVAS_WIDTH}px`,
          height: `${CANVAS_HEIGHT}px`,
          transform: `scale(${scale})`,
          transformOrigin: 'center center'
        }}
      >

        {/* 1. SCREEN SECTION (Top Half) */}
        <div className="w-full h-1/2 bg-black flex items-center justify-center p-4">
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

        {/* 2. CONTROL DECK (Bottom Half) */}
        <div className="relative w-full h-1/2" style={woodStyle}>
            <div className="w-full h-full pt-8">
                 <VirtualJoystick
                    onInput={handleJoystickInput}
                    onAction={handleAction}
                    onJump={handleJump}
                 />
             </div>
        </div>

      </div>
    </div>
  );
};

export default App;
