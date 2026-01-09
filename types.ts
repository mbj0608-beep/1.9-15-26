
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
}

export interface Player extends Entity {
  speed: number;
}

export interface Enemy extends Entity {
  type: number;
  speed: number;
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
}

export interface Particle extends Point {
  id: string;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}
