import React, { useState, useEffect } from 'react';
import GameCanvas from './components/GameCanvas';
import { GameState } from './types';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [score, setScore] = useState(0);
  const [wave, setWave] = useState(1);
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem('pasta-invaders-highscore');
    if (stored) setHighScore(parseInt(stored, 10));
  }, []);

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('pasta-invaders-highscore', score.toString());
    }
  }, [score, highScore]);

  const startGame = () => {
    setScore(0);
    setWave(1);
    setGameState(GameState.PLAYING);
  };

  return (
    <div className="w-full h-screen flex flex-col bg-slate-900 text-white font-sans">
      {/* Header HUD */}
      <header className="flex justify-between items-center p-4 bg-slate-800 border-b-4 border-red-600 shadow-md z-10">
        <div className="flex flex-col">
          <h1 className="text-xl md:text-2xl font-bold text-green-500 retro-text tracking-widest uppercase">Pasta Invaders</h1>
          <span className="text-xs text-slate-400">Defend the Kitchen!</span>
        </div>
        <div className="flex gap-6 text-sm md:text-lg font-mono">
          <div className="flex flex-col items-center">
            <span className="text-slate-400 text-xs">SCORE</span>
            <span className="text-yellow-400 font-bold">{score.toString().padStart(5, '0')}</span>
          </div>
          <div className="flex flex-col items-center">
             <span className="text-slate-400 text-xs">WAVE</span>
             <span className="text-white font-bold">{wave}</span>
          </div>
          <div className="hidden md:flex flex-col items-center">
             <span className="text-slate-400 text-xs">HIGH</span>
             <span className="text-green-400 font-bold">{highScore.toString().padStart(5, '0')}</span>
          </div>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="flex-grow relative">
        <GameCanvas 
          gameState={gameState} 
          setGameState={setGameState}
          score={score}
          setScore={setScore}
          wave={wave}
          setWave={setWave}
        />

        {/* Overlay: Menu */}
        {gameState === GameState.MENU && (
          <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center z-20 text-center p-4">
            <div className="mb-8 animate-bounce text-6xl">👨‍🍳</div>
            <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-500 via-white to-red-500 mb-4 drop-shadow-sm retro-text">
              PASTA INVADERS
            </h1>
            <p className="text-slate-300 mb-8 max-w-md leading-relaxed">
              The flying food is attacking! Use your forks to pop the pepperoni and splash the sauce.
              <br/>
              <span className="text-sm text-slate-500 mt-2 block">(Arrow keys to move, Space to shoot)</span>
            </p>
            <button 
              onClick={startGame}
              className="px-8 py-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg shadow-lg border-b-4 border-green-800 active:border-0 active:translate-y-1 transition-all text-xl retro-text"
            >
              START COOKING
            </button>
          </div>
        )}

        {/* Overlay: Game Over */}
        {gameState === GameState.GAME_OVER && (
          <div className="absolute inset-0 bg-red-900/90 flex flex-col items-center justify-center z-20 text-center p-4">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-2 retro-text">MAMMA MIA!</h2>
            <p className="text-xl text-red-200 mb-6">The kitchen is lost.</p>
            
            <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm border border-white/20 mb-8 max-w-lg w-full">
              <div className="flex justify-around mb-4">
                 <div className="flex flex-col">
                   <span className="text-xs uppercase tracking-wider text-slate-300">Final Score</span>
                   <span className="text-3xl font-bold text-yellow-400">{score}</span>
                 </div>
                 <div className="flex flex-col">
                   <span className="text-xs uppercase tracking-wider text-slate-300">Wave Reached</span>
                   <span className="text-3xl font-bold text-white">{wave}</span>
                 </div>
              </div>
              
            </div>

            <button 
              onClick={startGame}
              className="px-8 py-4 bg-white text-red-900 hover:bg-gray-100 font-bold rounded-lg shadow-lg border-b-4 border-gray-300 active:border-0 active:translate-y-1 transition-all text-xl retro-text"
            >
              TRY AGAIN
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;