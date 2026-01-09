
import React, { useState, useCallback } from 'react';
import GameView from './components/GameView';
import { GameState } from './types';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('START');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('sky-strike-highscore');
    return saved ? parseInt(saved, 10) : 0;
  });

  const handleGameOver = useCallback((finalScore: number) => {
    setScore(finalScore);
    setGameState('GAMEOVER');
    if (finalScore > highScore) {
      setHighScore(finalScore);
      localStorage.setItem('sky-strike-highscore', finalScore.toString());
    }
  }, [highScore]);

  const startGame = () => {
    setScore(0);
    setGameState('PLAYING');
  };

  return (
    <div className="relative w-full h-screen bg-black flex items-center justify-center overflow-hidden">
      <div className="relative w-full max-w-[450px] aspect-[9/16] bg-slate-900 shadow-2xl shadow-blue-500/20 overflow-hidden">
        {gameState === 'START' && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm p-6 text-center">
            <h1 className="text-5xl font-black text-white mb-2 italic tracking-tighter">
              天际<span className="text-blue-500">突击</span>
            </h1>
            <p className="text-blue-300 mb-8 uppercase tracking-widest text-sm font-bold">王牌飞行员</p>
            <div className="space-y-4 w-full max-w-xs">
              <button
                onClick={startGame}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-8 rounded-full transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/50"
              >
                开始任务
              </button>
              <div className="text-slate-400 text-xs mt-4">
                滑动控制移动与射击<br/>击落所有敌机
              </div>
            </div>
            {highScore > 0 && (
              <div className="mt-12 text-blue-400/60 font-mono">
                最高分: {highScore.toLocaleString()}
              </div>
            )}
          </div>
        )}

        {gameState === 'GAMEOVER' && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-red-950/80 backdrop-blur-md p-6 text-center">
            <h2 className="text-4xl font-black text-white mb-2 italic tracking-tighter">任务失败</h2>
            <div className="text-6xl font-mono text-white mb-8 tabular-nums tracking-tight">
              {score.toLocaleString()}
            </div>
            <div className="space-y-4 w-full max-w-xs">
              <button
                onClick={startGame}
                className="w-full bg-white text-red-900 font-bold py-4 px-8 rounded-full transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-white/20"
              >
                重新开始
              </button>
              <button
                onClick={() => setGameState('START')}
                className="w-full bg-transparent border-2 border-white/20 text-white font-bold py-4 px-8 rounded-full transition-all hover:bg-white/10"
              >
                主菜单
              </button>
            </div>
          </div>
        )}

        <GameView 
          gameState={gameState} 
          onGameOver={handleGameOver}
        />
      </div>
    </div>
  );
};

export default App;
