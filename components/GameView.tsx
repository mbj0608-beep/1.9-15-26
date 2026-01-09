
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GameState, Player, Enemy, Bullet, Particle, PowerUp, PowerUpType } from '../types';
import { ASSETS, GAME_WIDTH, GAME_HEIGHT, ENEMY_CONFIGS, STAGE_LENGTH } from '../constants';

interface GameViewProps {
  gameState: GameState;
  onGameOver: (score: number) => void;
}

const GameView: React.FC<GameViewProps> = ({ gameState, onGameOver }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  
  // Game Logic Refs
  // Removed unused speed property to match Player interface
  const playerRef = useRef<Player>({
    id: 'player',
    x: GAME_WIDTH / 2,
    y: GAME_HEIGHT - 120,
    width: 60,
    height: 60,
    hp: 1,
    maxHp: 1,
    lives: 3,
    powerLevel: 1,
    fireRateLevel: 1,
    damageLevel: 1
  });
  
  const bulletsRef = useRef<Bullet[]>([]);
  const enemiesRef = useRef<Enemy[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const powerUpsRef = useRef<PowerUp[]>([]);
  const scoreRef = useRef(0);
  const lastEnemySpawnRef = useRef(0);
  const bgPosRef = useRef(0);
  const gameTimeRef = useRef(0);
  const stageTimeRef = useRef(0);
  const levelRef = useRef(1);
  const shakeRef = useRef(0);
  const invincibilityRef = useRef(0);
  const imagesRef = useRef<Record<string, HTMLImageElement>>({});
  const inputRef = useRef({ x: GAME_WIDTH / 2, y: GAME_HEIGHT - 120, isPressed: false });

  const [uiScore, setUiScore] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [levelProgress, setLevelProgress] = useState(0);
  const [bannerText, setBannerText] = useState<string | null>(null);
  const [playerLives, setPlayerLives] = useState(3);

  useEffect(() => {
    const urls = Object.values(ASSETS);
    urls.forEach(url => {
      const img = new Image();
      img.src = url;
      img.onload = () => { imagesRef.current[url] = img; };
    });
  }, []);

  const resetGame = useCallback(() => {
    // Removed unused speed property to match Player interface
    playerRef.current = { 
      id: 'player', x: GAME_WIDTH / 2, y: GAME_HEIGHT - 120, width: 60, height: 60, 
      hp: 1, maxHp: 1, lives: 3, powerLevel: 1, fireRateLevel: 1, damageLevel: 1 
    };
    bulletsRef.current = [];
    enemiesRef.current = [];
    particlesRef.current = [];
    powerUpsRef.current = [];
    scoreRef.current = 0;
    lastEnemySpawnRef.current = 0;
    gameTimeRef.current = 0;
    stageTimeRef.current = 0;
    levelRef.current = 1;
    shakeRef.current = 0;
    invincibilityRef.current = 0;
    setUiScore(0);
    setCurrentLevel(1);
    setLevelProgress(0);
    setPlayerLives(3);
    setBannerText("任务开始");
    setTimeout(() => setBannerText(null), 2000);
  }, []);

  const spawnExplosion = (x: number, y: number, color: string, count = 12) => {
    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        id: Math.random().toString(),
        x, y,
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() - 0.5) * 12,
        life: 1.0,
        color,
        size: Math.random() * 5 + 2
      });
    }
  };

  const spawnPowerUp = (x: number, y: number) => {
    if (Math.random() > 0.15) return; // 15% drop rate
    const types: PowerUpType[] = ['SPREAD', 'FAST', 'POWER'];
    const type = types[Math.floor(Math.random() * types.length)];
    powerUpsRef.current.push({
      id: Math.random().toString(),
      x, y,
      type,
      width: 30,
      height: 30,
      speedY: 2
    });
  };

  const onPlayerHit = () => {
    if (invincibilityRef.current > 0) return;
    
    playerRef.current.lives -= 1;
    setPlayerLives(playerRef.current.lives);
    shakeRef.current = 15;
    spawnExplosion(playerRef.current.x, playerRef.current.y, '#ffffff', 30);
    
    // Reset Power Ups
    playerRef.current.powerLevel = 1;
    playerRef.current.fireRateLevel = 1;
    playerRef.current.damageLevel = 1;

    if (playerRef.current.lives <= 0) {
      onGameOver(scoreRef.current);
    } else {
      invincibilityRef.current = 120; // ~2 seconds at 60fps
    }
  };

  const update = useCallback((delta: number) => {
    if (gameState !== 'PLAYING') return;

    gameTimeRef.current += delta;
    stageTimeRef.current += delta;
    
    if (shakeRef.current > 0) shakeRef.current -= 0.5;
    if (invincibilityRef.current > 0) invincibilityRef.current -= 1;

    // Stage Progression
    const progress = (stageTimeRef.current / STAGE_LENGTH) * 100;
    setLevelProgress(Math.min(100, progress));

    if (stageTimeRef.current >= STAGE_LENGTH) {
      stageTimeRef.current = 0;
      levelRef.current += 1;
      setCurrentLevel(levelRef.current);
      setBannerText(`第 ${levelRef.current} 关`);
      setTimeout(() => setBannerText(null), 2000);
    }

    const difficultyFactor = 1 + (levelRef.current - 1) * 0.3;
    const spawnInterval = Math.max(300, 1600 / difficultyFactor);

    bgPosRef.current = (bgPosRef.current + 3) % GAME_HEIGHT;

    // Smooth Player Movement
    const p = playerRef.current;
    p.x += (inputRef.current.x - p.x) * 0.15;
    p.y += (inputRef.current.y - p.y) * 0.15;
    p.x = Math.max(p.width / 2, Math.min(GAME_WIDTH - p.width / 2, p.x));
    p.y = Math.max(p.height / 2, Math.min(GAME_HEIGHT - p.height / 2, p.y));

    // Player Shooting
    const fireInterval = Math.max(60, 150 - (p.fireRateLevel - 1) * 30);
    if (inputRef.current.isPressed && gameTimeRef.current % fireInterval < delta) {
       const bulletSpeed = -14;
       const damage = p.damageLevel;
       
       if (p.powerLevel === 1) {
         bulletsRef.current.push({ id: Math.random().toString(), x: p.x, y: p.y - 30, speedX: 0, speedY: bulletSpeed, owner: 'player', damage });
       } else if (p.powerLevel === 2) {
         bulletsRef.current.push({ id: Math.random().toString(), x: p.x - 15, y: p.y - 30, speedX: 0, speedY: bulletSpeed, owner: 'player', damage });
         bulletsRef.current.push({ id: Math.random().toString(), x: p.x + 15, y: p.y - 30, speedX: 0, speedY: bulletSpeed, owner: 'player', damage });
       } else {
         bulletsRef.current.push({ id: Math.random().toString(), x: p.x, y: p.y - 30, speedX: 0, speedY: bulletSpeed, owner: 'player', damage });
         bulletsRef.current.push({ id: Math.random().toString(), x: p.x - 25, y: p.y - 20, speedX: -2, speedY: bulletSpeed, owner: 'player', damage });
         bulletsRef.current.push({ id: Math.random().toString(), x: p.x + 25, y: p.y - 20, speedX: 2, speedY: bulletSpeed, owner: 'player', damage });
       }
    }

    // Spawn Enemies
    if (gameTimeRef.current - lastEnemySpawnRef.current > spawnInterval) {
      const config = ENEMY_CONFIGS[Math.floor(Math.random() * ENEMY_CONFIGS.length)];
      const maxHp = config.hp + Math.floor(levelRef.current / 2);
      enemiesRef.current.push({
        id: Math.random().toString(),
        x: Math.random() * (GAME_WIDTH - config.width) + config.width / 2,
        y: -config.height,
        ...config,
        hp: maxHp,
        maxHp: maxHp,
        speed: config.speed * (1 + (levelRef.current - 1) * 0.1),
        lastShot: gameTimeRef.current
      });
      lastEnemySpawnRef.current = gameTimeRef.current;
    }

    // Entities Logic
    bulletsRef.current = bulletsRef.current.filter(b => {
      b.x += b.speedX; b.y += b.speedY;
      return b.y > -50 && b.y < GAME_HEIGHT + 50 && b.x > -50 && b.x < GAME_WIDTH + 50;
    });

    particlesRef.current = particlesRef.current.filter(p => {
      p.x += p.vx; p.y += p.vy;
      p.life -= 0.025;
      return p.life > 0;
    });

    powerUpsRef.current = powerUpsRef.current.filter(pu => {
      pu.y += pu.speedY;
      // Collection
      if (Math.abs(pu.x - p.x) < p.width/2 && Math.abs(pu.y - p.y) < p.height/2) {
        if (pu.type === 'SPREAD') p.powerLevel = Math.min(3, p.powerLevel + 1);
        if (pu.type === 'FAST') p.fireRateLevel = Math.min(4, p.fireRateLevel + 1);
        if (pu.type === 'POWER') p.damageLevel = Math.min(5, p.damageLevel + 1);
        spawnExplosion(pu.x, pu.y, '#10b981', 10);
        return false;
      }
      return pu.y < GAME_HEIGHT + 50;
    });

    enemiesRef.current = enemiesRef.current.filter(e => {
      e.y += e.speed;
      if (gameTimeRef.current - e.lastShot > e.fireRate / difficultyFactor) {
        bulletsRef.current.push({ id: Math.random().toString(), x: e.x, y: e.y + e.height / 2, speedX: 0, speedY: 6, owner: 'enemy', damage: 1 });
        e.lastShot = gameTimeRef.current;
      }
      if (Math.abs(e.x - p.x) < (e.width + p.width) * 0.35 && Math.abs(e.y - p.y) < (e.height + p.height) * 0.35) {
        onPlayerHit();
        return false;
      }
      return e.y < GAME_HEIGHT + 100;
    });

    // Collision Detection
    bulletsRef.current.forEach((b, bIdx) => {
      if (b.owner === 'player') {
        enemiesRef.current.forEach(e => {
          if (Math.abs(b.x - e.x) < e.width / 2 && Math.abs(b.y - e.y) < e.height / 2) {
            e.hp -= b.damage;
            bulletsRef.current.splice(bIdx, 1);
            if (e.hp <= 0) {
              scoreRef.current += e.scoreValue;
              setUiScore(scoreRef.current);
              spawnExplosion(e.x, e.y, '#f59e0b', 15);
              spawnPowerUp(e.x, e.y);
              shakeRef.current = 5;
            } else {
              spawnExplosion(b.x, b.y, '#ffffff', 3);
            }
          }
        });
      } else if (Math.abs(b.x - p.x) < p.width / 4 && Math.abs(b.y - p.y) < p.height / 4) {
        onPlayerHit();
      }
    });

    enemiesRef.current = enemiesRef.current.filter(e => e.hp > 0);
  }, [gameState, onGameOver]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    if (shakeRef.current > 0) {
      ctx.translate((Math.random() - 0.5) * shakeRef.current, (Math.random() - 0.5) * shakeRef.current);
    }

    // Background
    const bgImg = imagesRef.current[ASSETS.BACKGROUND];
    if (bgImg) {
      ctx.drawImage(bgImg, 0, bgPosRef.current, GAME_WIDTH, GAME_HEIGHT);
      ctx.drawImage(bgImg, 0, bgPosRef.current - GAME_HEIGHT, GAME_WIDTH, GAME_HEIGHT);
    }

    // Particles
    particlesRef.current.forEach(p => {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
    });
    ctx.globalAlpha = 1.0;

    // Power Ups
    powerUpsRef.current.forEach(pu => {
      ctx.fillStyle = pu.type === 'SPREAD' ? '#10b981' : pu.type === 'FAST' ? '#3b82f6' : '#f43f5e';
      ctx.shadowBlur = 10; ctx.shadowColor = ctx.fillStyle;
      ctx.beginPath();
      ctx.rect(pu.x - pu.width/2, pu.y - pu.height/2, pu.width, pu.height);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(pu.type[0], pu.x, pu.y + 5);
    });

    // Enemies & Health Bars
    enemiesRef.current.forEach(e => {
      const config = ENEMY_CONFIGS.find(c => c.type === e.type);
      const img = imagesRef.current[config?.asset || ''];
      if (img) {
        ctx.save();
        ctx.translate(e.x, e.y);
        ctx.drawImage(img, -e.width / 2, -e.height / 2, e.width, e.height);
        
        // Health bar
        const barW = e.width * 0.8;
        const barH = 4;
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(-barW/2, -e.height/2 - 10, barW, barH);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(-barW/2, -e.height/2 - 10, barW * (e.hp / e.maxHp), barH);
        ctx.restore();
      }
    });

    // Player
    const player = playerRef.current;
    if (invincibilityRef.current % 10 < 5) {
      const pImg = imagesRef.current[ASSETS.PLAYER];
      if (pImg) {
        ctx.save();
        ctx.translate(player.x, player.y);
        const tilt = (inputRef.current.x - player.x) * 0.08;
        ctx.rotate(tilt * (Math.PI / 180));
        ctx.shadowBlur = 15; ctx.shadowColor = '#3b82f6';
        ctx.drawImage(pImg, -player.width / 2, -player.height / 2, player.width, player.height);
        ctx.restore();
      }
    }

    // Bullets
    bulletsRef.current.forEach(b => {
      ctx.shadowBlur = 8;
      if (b.owner === 'player') {
        ctx.fillStyle = '#60a5fa'; ctx.shadowColor = '#60a5fa';
        ctx.fillRect(b.x - 2, b.y - 12, 4, 24);
      } else {
        ctx.fillStyle = '#ef4444'; ctx.shadowColor = '#ef4444';
        ctx.beginPath(); ctx.arc(b.x, b.y, 5, 0, Math.PI * 2); ctx.fill();
      }
      ctx.shadowBlur = 0;
    });

    ctx.restore();
  }, []);

  const loop = useCallback((time: number) => {
    update(16);
    draw();
    requestRef.current = requestAnimationFrame(loop);
  }, [update, draw]);

  useEffect(() => {
    if (gameState === 'PLAYING') {
      resetGame();
      requestRef.current = requestAnimationFrame(loop);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, [gameState, loop, resetGame]);

  const handleInput = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = GAME_WIDTH / rect.width;
    const scaleY = GAME_HEIGHT / rect.height;
    inputRef.current.x = (clientX - rect.left) * scaleX;
    inputRef.current.y = (clientY - rect.top) * scaleY - 60;
  };

  return (
    <div className="relative w-full h-full select-none touch-none overflow-hidden font-sans">
      <canvas
        ref={canvasRef}
        width={GAME_WIDTH}
        height={GAME_HEIGHT}
        className="w-full h-full bg-slate-900"
        onMouseMove={(e) => handleInput(e.clientX, e.clientY)}
        onMouseDown={() => inputRef.current.isPressed = true}
        onMouseUp={() => inputRef.current.isPressed = false}
        onTouchMove={(e) => {
          if (e.touches[0]) handleInput(e.touches[0].clientX, e.touches[0].clientY);
          inputRef.current.isPressed = true;
        }}
        onTouchStart={() => inputRef.current.isPressed = true}
        onTouchEnd={() => inputRef.current.isPressed = false}
      />
      
      {gameState === 'PLAYING' && (
        <>
          <div className="absolute top-0 left-0 right-0 h-1 bg-white/10 overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-300 ease-linear shadow-[0_0_10px_#3b82f6]" 
              style={{ width: `${levelProgress}%` }}
            />
          </div>
          
          <div className="absolute top-4 left-0 right-0 flex justify-between px-6 pointer-events-none">
            <div className="flex flex-col">
              <div className="flex gap-1 mb-1">
                {[...Array(3)].map((_, i) => (
                  <span key={i} className={`text-xl transition-opacity duration-300 ${i < playerLives ? 'opacity-100' : 'opacity-20'}`}>❤️</span>
                ))}
              </div>
              <span className="text-blue-400 text-[10px] font-black uppercase tracking-widest opacity-80">第 {currentLevel} 关</span>
              <span className="text-4xl font-mono text-white tabular-nums tracking-tighter drop-shadow-md">
                {uiScore.toLocaleString()}
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-red-400 text-[10px] font-black uppercase tracking-widest opacity-80">任务时间</span>
              <span className="text-xl font-mono text-white/90">
                {Math.floor(gameTimeRef.current / 1000)}s
              </span>
              <div className="mt-2 flex gap-2">
                {playerRef.current.powerLevel > 1 && <span className="text-[10px] bg-green-500/30 border border-green-500 text-green-300 px-1 rounded">多道</span>}
                {playerRef.current.fireRateLevel > 1 && <span className="text-[10px] bg-blue-500/30 border border-blue-500 text-blue-300 px-1 rounded">极速</span>}
                {playerRef.current.damageLevel > 1 && <span className="text-[10px] bg-red-500/30 border border-red-500 text-red-300 px-1 rounded">强力</span>}
              </div>
            </div>
          </div>

          {bannerText && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
              <div className="bg-blue-600/20 backdrop-blur-md border-y border-blue-400/50 w-full py-4 flex flex-col items-center animate-bounce">
                <h2 className="text-white text-4xl font-black italic tracking-tighter">{bannerText}</h2>
                <p className="text-blue-300 text-xs font-bold uppercase tracking-[0.3em]">全速出击</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GameView;
