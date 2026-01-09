
export type GameState = 'START' | 'PLAYING' | 'GAMEOVER';

export interface Point {
  x: number;
  y: number;
}

export interface Entity {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
}

export interface Player extends Entity {
  lives: number;
  powerLevel: number; // 1: single, 2: dual, 3: triple
  fireRateLevel: number;
  damageLevel: number;
}

export interface Enemy extends Entity {
  type: number;
  speed: number;
  oscillationRange: number;
  oscillationSpeed: number;
  scoreValue: number;
  lastShot: number;
  fireRate: number;
}

export interface Bullet extends Point {
  id: string;
  speedX: number;
  speedY: number;
  owner: 'player' | 'enemy';
  damage: number;
  isHoming?: boolean;
}

export interface Particle extends Point {
  id: string;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}

export type PowerUpType = 'SPREAD' | 'FAST' | 'POWER';

export interface PowerUp extends Point {
  id: string;
  type: PowerUpType;
  width: number;
  height: number;
  speedY: number;
}
