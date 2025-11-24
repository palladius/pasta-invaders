import { EnemyType } from './types';

export const PLAYER_WIDTH = 40;
export const PLAYER_HEIGHT = 40;
export const PLAYER_SPEED = 5; // pixel movement
export const PLAYER_COOLDOWN = 25; // frames between shots

export const ENEMY_WIDTH = 32;
export const ENEMY_HEIGHT = 32;
export const ENEMY_PADDING = 15;
export const ENEMY_ROWS = 4;
export const ENEMY_COLS = 8;
export const ENEMY_SPEED_BASE = 1;
export const ENEMY_DROP_HEIGHT = 20;

export const PROJECTILE_WIDTH = 6;
export const PROJECTILE_HEIGHT = 12;
export const PROJECTILE_SPEED = 7;

export const ENEMY_CONFIG: Record<EnemyType, { sprite: string; score: number }> = {
  [EnemyType.TOMATO]: { sprite: '🍅', score: 10 },
  [EnemyType.PIZZA]: { sprite: '🍕', score: 20 },
  [EnemyType.SPAGHETTI]: { sprite: '🍝', score: 30 },
  [EnemyType.WINE]: { sprite: '🍷', score: 100 },
};

export const PLAYER_SPRITE = '👨‍🍳';
export const PROJECTILE_SPRITE = '🍴'; // Fork
export const ENEMY_PROJECTILE_SPRITE = '💧'; // Olive oil drop

export const PARTICLES_COUNT = 8;
export const SAUCE_COLOR = '#ef4444'; // Red
export const PASTA_COLOR = '#fde047'; // Yellow