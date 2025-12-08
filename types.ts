
export enum EntityType {
  PLAYER_GAMMON = 'PLAYER_GAMMON',
  ENEMY_LAWYER = 'ENEMY_LAWYER',
  ENEMY_TEACHER = 'ENEMY_TEACHER',
  ENEMY_LIBRARIAN = 'ENEMY_LIBRARIAN',
}

export enum EntityState {
  IDLE = 'IDLE',
  WALK = 'WALK',
  ATTACK = 'ATTACK',
  PRE_ATTACK = 'PRE_ATTACK',
  HURT = 'HURT',
  DYING = 'DYING',
  DEAD = 'DEAD',
  ACTION = 'ACTION', // Putting up flag or taking it down
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

export interface FlagPole {
    id: number;
    x: number;
    y: number; // Z-depth base
    raiseLevel: number; // 0 to 100
    isContested: boolean;
    isFullyRaised: boolean;
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
  flagPoles: FlagPole[];
  score: number;
  sovereignty: number; // Replaces Integrity
  gameOver: boolean;
  gameWon: boolean;
  wave: number;
  cameraShake: number;
  cameraX: number;
}
