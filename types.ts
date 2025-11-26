export enum EntityType {
  HERO = 'HERO',
  ENEMY_FLAGGER = 'ENEMY_FLAGGER',
  ENEMY_PAINTER = 'ENEMY_PAINTER',
  ENEMY_HOOLIGAN = 'ENEMY_HOOLIGAN',
  ENEMY_TANK = 'ENEMY_TANK',
}

export enum EntityState {
  IDLE = 'IDLE',
  WALK = 'WALK',
  ATTACK = 'ATTACK',
  PRE_ATTACK = 'PRE_ATTACK',
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
  comboStage?: number; // 0, 1, 2
  lastAttackTime?: number;
  
  // Power-up timers
  speedBoostTimer?: number;
  invincibilityTimer?: number;
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

export interface Pickup {
    id: string;
    type: 'TEA' | 'CRUMPET' | 'SPEED' | 'INVINCIBILITY';
    x: number;
    y: number;
    z: number;
    life: number;
}

export interface GameState {
  hero: Entity;
  enemies: Entity[];
  particles: Particle[];
  pickups: Pickup[];
  score: number;
  suburbanIntegrity: number; // 0-100, if 0 lose
  gameOver: boolean;
  gameWon: boolean;
  wave: number;
  cameraShake: number;
  cameraX: number;
}