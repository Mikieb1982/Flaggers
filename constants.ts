
export const CANVAS_WIDTH = 600;
export const CANVAS_HEIGHT = 750;
export const WORLD_WIDTH = 2400; // Expanded Game World

export const GROUND_Y_HORIZON = 480; // Lower horizon for verticality
export const GROUND_Y_MAX = 730;

export const GRAVITY = 0.85; // Snappier gravity for clearer jump arcs
export const FRICTION = 0.82; // Consistent friction (retains 82% speed per frame)
export const ACCELERATION = 1.5; // High acceleration for responsive control
export const WALK_SPEED = 6.0; 
export const WALK_SPEED_Y = 3.5; 
export const JUMP_FORCE = 17; // Higher jump to compensate for gravity

export const HERO_WIDTH = 60; // Wider for muscle
export const HERO_HEIGHT = 90;

export const ENEMY_WIDTH = 50;
export const ENEMY_HEIGHT = 85;

export const TANK_WIDTH = 80;
export const TANK_HEIGHT = 95;

export const HOOLIGAN_WIDTH = 45;
export const HOOLIGAN_HEIGHT = 85;

export const ATTACK_DURATION = 15; 
export const HURT_DURATION = 20;
export const HIT_BOX_RANGE_X = 80; // Larger hitbox
export const HIT_BOX_RANGE_Y = 30;

export const SPAWN_RATE = 350;

// Flag Pole Mechanics
export const FLAG_POLE_LOCATIONS = [
    { x: 700, y: 550 },
    { x: 1400, y: 600 },
    { x: 2100, y: 500 }
];
export const FLAG_CAPTURE_RADIUS = 60;
export const FLAG_RAISE_SPEED = 0.3; // Fast raising for the player
export const FLAG_LOWER_SPEED = 0.05; // Extremely slow lowering for enemies (make it easy)

export const COMBO_WINDOW = 500;

// Power-ups
export const SPEED_BOOST_DURATION = 600; // ~10 seconds
export const INVINCIBILITY_DURATION = 400; // ~6.5 seconds
export const SPEED_MULTIPLIER = 1.6;
