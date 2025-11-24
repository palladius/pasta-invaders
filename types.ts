export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER',
  VICTORY = 'VICTORY'
}

export interface Entity {
  x: number;
  y: number;
  width: number;
  height: number;
  markedForDeletion?: boolean;
}

export interface Player extends Entity {
  speed: number;
  cooldown: number;
}

export interface Projectile extends Entity {
  dy: number;
  type: 'player' | 'enemy';
  color: string;
}

export enum EnemyType {
  TOMATO = 'TOMATO',
  PIZZA = 'PIZZA',
  SPAGHETTI = 'SPAGHETTI',
  WINE = 'WINE' // Boss or special
}

export interface Enemy extends Entity {
  type: EnemyType;
  scoreValue: number;
  sprite: string;
}

export interface Particle extends Entity {
  dx: number;
  dy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface GameConfig {
  canvasWidth: number;
  canvasHeight: number;
}