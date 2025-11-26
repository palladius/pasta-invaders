import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  GameState, Entity, Player, Projectile, Enemy, EnemyType, Particle 
} from '../types';
import { 
  PLAYER_WIDTH, PLAYER_HEIGHT, PLAYER_SPEED, PLAYER_COOLDOWN, PLAYER_SPRITE,
  ENEMY_WIDTH, ENEMY_HEIGHT, ENEMY_PADDING, ENEMY_ROWS, ENEMY_COLS, ENEMY_CONFIG,
  ENEMY_SPEED_BASE, ENEMY_DROP_HEIGHT,
  PROJECTILE_WIDTH, PROJECTILE_HEIGHT, PROJECTILE_SPEED, PROJECTILE_SPRITE, ENEMY_PROJECTILE_SPRITE,
  PARTICLES_COUNT, SAUCE_COLOR, PASTA_COLOR
} from '../constants';

interface GameCanvasProps {
  gameState: GameState;
  setGameState: (state: GameState) => void;
  score: number;
  setScore: (score: number | ((prev: number) => number)) => void;
  setWave: (wave: number | ((prev: number) => number)) => void;
  wave: number;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ 
  gameState, setGameState, score, setScore, setWave, wave 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Game State Refs (Mutable for loop performance)
  const playerRef = useRef<Player>({ x: 0, y: 0, width: PLAYER_WIDTH, height: PLAYER_HEIGHT, speed: PLAYER_SPEED, cooldown: 0 });
  const projectilesRef = useRef<Projectile[]>([]);
  const enemiesRef = useRef<Enemy[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const keysPressed = useRef<Set<string>>(new Set());
  const frameIdRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const enemyDirectionRef = useRef<number>(1); // 1 = right, -1 = left
  const enemyMoveTimerRef = useRef<number>(0);
  const enemyShootTimerRef = useRef<number>(0);
  
  // Touch controls state
  const [touchInput, setTouchInput] = useState<{ left: boolean; right: boolean; shoot: boolean }>({
    left: false, right: false, shoot: false
  });

  // Initialize Level
  const initLevel = useCallback(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    
    // Reset Player
    playerRef.current.x = canvas.width / 2 - PLAYER_WIDTH / 2;
    playerRef.current.y = canvas.height - PLAYER_HEIGHT - 20;
    playerRef.current.cooldown = 0;

    // Clear entities
    projectilesRef.current = [];
    particlesRef.current = [];

    // Create Enemies
    const newEnemies: Enemy[] = [];
    const startX = (canvas.width - (ENEMY_COLS * (ENEMY_WIDTH + ENEMY_PADDING))) / 2;
    const startY = 50;

    for (let row = 0; row < ENEMY_ROWS; row++) {
      let type = EnemyType.TOMATO;
      if (row === 0) type = EnemyType.SPAGHETTI;
      else if (row === 1) type = EnemyType.PIZZA;
      
      // Increase difficulty by wave
      const speedMultiplier = 1 + (wave * 0.1);

      for (let col = 0; col < ENEMY_COLS; col++) {
        newEnemies.push({
          x: startX + col * (ENEMY_WIDTH + ENEMY_PADDING),
          y: startY + row * (ENEMY_HEIGHT + ENEMY_PADDING),
          width: ENEMY_WIDTH,
          height: ENEMY_HEIGHT,
          type: type,
          scoreValue: ENEMY_CONFIG[type].score * wave,
          sprite: ENEMY_CONFIG[type].sprite
        });
      }
    }
    enemiesRef.current = newEnemies;
    enemyDirectionRef.current = 1;
    enemyMoveTimerRef.current = 0;
  }, [wave]);

  // Start/Restart Game
  useEffect(() => {
    if (gameState === GameState.PLAYING) {
      // Handle resize logic once to set canvas size
      if (containerRef.current && canvasRef.current) {
        canvasRef.current.width = containerRef.current.clientWidth;
        canvasRef.current.height = containerRef.current.clientHeight;
      }
      
      // Only init level if enemies are empty (new game) or if we just transitioned to playing
      if (enemiesRef.current.length === 0) {
        initLevel();
      }

      lastTimeRef.current = performance.now();
      frameIdRef.current = requestAnimationFrame(gameLoop);
    } else {
      cancelAnimationFrame(frameIdRef.current);
    }

    return () => cancelAnimationFrame(frameIdRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState, initLevel]);

  // Input Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => keysPressed.current.add(e.code);
    const handleKeyUp = (e: KeyboardEvent) => keysPressed.current.delete(e.code);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const createExplosion = (x: number, y: number, color: string) => {
    for (let i = 0; i < PARTICLES_COUNT; i++) {
      particlesRef.current.push({
        x,
        y,
        width: 2,
        height: 2,
        dx: (Math.random() - 0.5) * 4,
        dy: (Math.random() - 0.5) * 4,
        life: 1.0,
        maxLife: 1.0,
        color: color,
        size: Math.random() * 3 + 2
      });
    }
  };

  const checkCollision = (rect1: Entity, rect2: Entity) => {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    );
  };

  const gameLoop = (time: number) => {
    if (gameState !== GameState.PLAYING) return;

    // Calculate Delta Time (optional, but good for consistency) - sticking to fixed step for simplicity in this small game
    // const deltaTime = time - lastTimeRef.current;
    lastTimeRef.current = time;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // --- UPDATE ---

    // 1. Player Movement
    if ((keysPressed.current.has('ArrowLeft') || touchInput.left) && playerRef.current.x > 0) {
      playerRef.current.x -= playerRef.current.speed;
    }
    if ((keysPressed.current.has('ArrowRight') || touchInput.right) && playerRef.current.x < canvas.width - playerRef.current.width) {
      playerRef.current.x += playerRef.current.speed;
    }

    // 2. Player Shooting
    if (playerRef.current.cooldown > 0) playerRef.current.cooldown--;
    if ((keysPressed.current.has('Space') || touchInput.shoot) && playerRef.current.cooldown <= 0) {
      projectilesRef.current.push({
        x: playerRef.current.x + playerRef.current.width / 2 - PROJECTILE_WIDTH / 2,
        y: playerRef.current.y,
        width: PROJECTILE_WIDTH,
        height: PROJECTILE_HEIGHT,
        dy: -PROJECTILE_SPEED,
        type: 'player',
        color: '#ffffff'
      });
      playerRef.current.cooldown = PLAYER_COOLDOWN;
    }

    // 3. Projectiles Movement
    projectilesRef.current.forEach(p => {
      p.y += p.dy;
      // Remove if out of bounds
      if (p.y < 0 || p.y > canvas.height) p.markedForDeletion = true;
    });

    // 4. Enemy Movement logic
    // Move side to side
    let hitEdge = false;
    // Base speed increases slightly as fewer enemies remain
    const currentEnemySpeed = ENEMY_SPEED_BASE * (1 + (wave * 0.1) + (1 - enemiesRef.current.length / (ENEMY_ROWS * ENEMY_COLS)));

    enemiesRef.current.forEach(enemy => {
      enemy.x += currentEnemySpeed * enemyDirectionRef.current;
      if (enemy.x <= 0 || enemy.x + enemy.width >= canvas.width) {
        hitEdge = true;
      }
    });

    if (hitEdge) {
      enemyDirectionRef.current *= -1;
      enemiesRef.current.forEach(enemy => {
        enemy.y += ENEMY_DROP_HEIGHT;
        // Check Game Over (Invasion)
        if (enemy.y + enemy.height >= playerRef.current.y) {
          setGameState(GameState.GAME_OVER);
        }
      });
    }

    // 5. Enemy Shooting
    if (enemiesRef.current.length > 0 && Math.random() < 0.02 * (1 + wave * 0.1)) {
      const shooter = enemiesRef.current[Math.floor(Math.random() * enemiesRef.current.length)];
      projectilesRef.current.push({
        x: shooter.x + shooter.width / 2,
        y: shooter.y + shooter.height,
        width: PROJECTILE_WIDTH,
        height: PROJECTILE_HEIGHT,
        dy: PROJECTILE_SPEED * 0.6,
        type: 'enemy',
        color: '#ef4444'
      });
    }

    // 6. Collision Detection
    projectilesRef.current.forEach(p => {
      if (p.markedForDeletion) return;

      if (p.type === 'player') {
        enemiesRef.current.forEach(e => {
          if (!e.markedForDeletion && checkCollision(p, e)) {
            e.markedForDeletion = true;
            p.markedForDeletion = true;
            setScore(prev => prev + e.scoreValue);
            createExplosion(e.x + e.width/2, e.y + e.height/2, SAUCE_COLOR);
          }
        });
      } else {
        // Enemy bullet hits player
        if (checkCollision(p, playerRef.current)) {
          p.markedForDeletion = true;
          createExplosion(playerRef.current.x + PLAYER_WIDTH/2, playerRef.current.y + PLAYER_HEIGHT/2, '#ffffff');
          setGameState(GameState.GAME_OVER);
        }
      }
    });

    // 7. Particle Updates
    particlesRef.current.forEach(p => {
      p.x += p.dx;
      p.y += p.dy;
      p.life -= 0.02;
      if (p.life <= 0) p.markedForDeletion = true;
    });

    // 8. Cleanup
    projectilesRef.current = projectilesRef.current.filter(p => !p.markedForDeletion);
    enemiesRef.current = enemiesRef.current.filter(e => !e.markedForDeletion);
    particlesRef.current = particlesRef.current.filter(p => !p.markedForDeletion);

    // 9. Check Level Clear
    if (enemiesRef.current.length === 0) {
      setWave(w => w + 1);
      initLevel();
      // Increase difficulty speed implicitly by wave variable in initLevel
    }

    // --- RENDER ---
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Stars/Background
    ctx.fillStyle = '#1e293b'; // Slate 800 stars
    for(let i=0; i<20; i++) {
       // Simple static stars for now, could animate
       ctx.fillRect((Math.sin(i)*1000 + time/10) % canvas.width, (Math.cos(i)*1000) % canvas.height, 2, 2);
    }

    // Draw Player
    ctx.font = `${PLAYER_WIDTH}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(PLAYER_SPRITE, playerRef.current.x + PLAYER_WIDTH/2, playerRef.current.y);

    // Draw Enemies
    enemiesRef.current.forEach(e => {
      ctx.font = `${e.width}px sans-serif`;
      ctx.fillText(e.sprite, e.x + e.width/2, e.y);
    });

    // Draw Projectiles
    projectilesRef.current.forEach(p => {
      if (p.type === 'player') {
         ctx.font = `16px sans-serif`;
         ctx.fillText(PROJECTILE_SPRITE, p.x + p.width/2, p.y);
      } else {
         ctx.font = `16px sans-serif`;
         ctx.fillText(ENEMY_PROJECTILE_SPRITE, p.x + p.width/2, p.y);
      }
    });

    // Draw Particles
    particlesRef.current.forEach(p => {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1.0;
    });

    frameIdRef.current = requestAnimationFrame(gameLoop);
  };

  // Handle touch start/end for controls
  const handleTouchStart = (action: 'left' | 'right' | 'shoot') => {
    setTouchInput(prev => ({ ...prev, [action]: true }));
  };
  const handleTouchEnd = (action: 'left' | 'right' | 'shoot') => {
    setTouchInput(prev => ({ ...prev, [action]: false }));
  };

  return (
    <div className={`relative w-full h-full flex flex-col overflow-hidden ${gameState === GameState.PLAYING ? 'bg-slate-900' : 'bg-transparent'}`}>
      {/* Canvas Container */}
      <div ref={containerRef} className="flex-grow relative">
        <canvas 
          ref={canvasRef} 
          className="block w-full h-full"
        />
      </div>

      {/* Mobile Controls (Visible only on touch devices mostly, or always for styling) */}
      <div className="h-24 bg-slate-800 border-t-4 border-green-600 flex items-center justify-between px-4 sm:hidden">
        <div className="flex gap-4">
           <button 
             className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center active:bg-white/30 text-3xl"
             onTouchStart={(e) => { e.preventDefault(); handleTouchStart('left'); }}
             onTouchEnd={(e) => { e.preventDefault(); handleTouchEnd('left'); }}
           >
             ⬅️
           </button>
           <button 
             className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center active:bg-white/30 text-3xl"
             onTouchStart={(e) => { e.preventDefault(); handleTouchStart('right'); }}
             onTouchEnd={(e) => { e.preventDefault(); handleTouchEnd('right'); }}
           >
             ➡️
           </button>
        </div>
        <button 
           className="w-20 h-20 bg-red-600/80 rounded-full flex items-center justify-center active:bg-red-500 border-4 border-red-800 shadow-lg"
           onTouchStart={(e) => { e.preventDefault(); handleTouchStart('shoot'); }}
           onTouchEnd={(e) => { e.preventDefault(); handleTouchEnd('shoot'); }}
        >
          <span className="text-2xl">🍴</span>
        </button>
      </div>
    </div>
  );
};

export default GameCanvas;