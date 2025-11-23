export enum EntityType {
  HERO = 'HERO',
  ENEMY_FLAGGER = 'ENEMY_FLAGGER',
  ENEMY_PAINTER = 'ENEMY_PAINTER',
}

export enum EntityState {
  IDLE = 'IDLE',
  WALK = 'WALK',
  ATTACK = 'ATTACK',
  HURT = 'HURT',
  DYING = 'DYING',
  DEAD = 'DEAD',
  ACTION = 'ACTION', // Putting up flag or painting
}

export enum Direction {
  LEFT = -1,
  RIGHT = 1,
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Entity {
  id: string;
  type: EntityType;
  x: number;
  y: number; // Depth (ground plane)
  z: number; // Jump height
  vx: number;
  vy: number;
  vz: number;
  width: number;
  height: number;
  direction: Direction;
  state: EntityState;
  health: number;
  maxHealth: number;
  stateTimer: number; // For animation duration
  attackCooldown: number;
  targetId?: string; // For AI
  color: string;
  isHit: boolean;
  scoreValue: number;
  shoutText?: string;
  shoutTimer?: number;
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  color: string;
  text?: string;
}

export interface GameState {
  hero: Entity;
  enemies: Entity[];
  particles: Particle[];
  score: number;
  suburbanIntegrity: number; // 0-100, if 0 lose
  gameOver: boolean;
  gameWon: boolean;
  wave: number;
  cameraShake: number;
}