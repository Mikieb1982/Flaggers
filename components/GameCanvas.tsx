
import React, { useRef, useEffect } from 'react';
import { 
  GameState, Entity, EntityType, EntityState, Direction, Particle, Pickup 
} from '../types';
import { 
  CANVAS_WIDTH, CANVAS_HEIGHT, WORLD_WIDTH, GRAVITY, FRICTION, ACCELERATION, WALK_SPEED, WALK_SPEED_Y,
  JUMP_FORCE, GROUND_Y_HORIZON, GROUND_Y_MAX, HERO_WIDTH, HERO_HEIGHT,
  ENEMY_WIDTH, ENEMY_HEIGHT, TANK_WIDTH, TANK_HEIGHT, HOOLIGAN_WIDTH, HOOLIGAN_HEIGHT,
  ATTACK_DURATION, HIT_BOX_RANGE_X, HIT_BOX_RANGE_Y,
  SPAWN_RATE, HURT_DURATION, LAMP_POST_X, LAMP_POST_Z_DEPTH, ROUNDABOUT_X, ROUNDABOUT_Z_DEPTH,
  COMBO_WINDOW, SPEED_BOOST_DURATION, INVINCIBILITY_DURATION, SPEED_MULTIPLIER
} from '../constants';
import { drawEnvironment, drawEntity, drawShadow, drawParticles, drawForeground, drawPickup } from './SpriteRenderer';

interface GameCanvasProps {
  gameStarted: boolean;
  onScoreUpdate: (score: number) => void;
  onHealthUpdate: (health: number) => void;
  onIntegrityUpdate: (integrity: number) => void;
  onGameOver: (won: boolean) => void;
  inputRef: React.MutableRefObject<{x: number, y: number, attack: boolean, jump: boolean}>;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ 
  gameStarted, onScoreUpdate, onHealthUpdate, onIntegrityUpdate, onGameOver, inputRef 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const accumulatorRef = useRef<number>(0);
  const keys = useRef<{ [key: string]: boolean }>({});
  
  // Track gameStarted via ref to avoid stale closures in the loop
  const gameStartedRef = useRef(gameStarted);
  
  // Track last known values to prevent spamming React state updates
  const lastReportedHealth = useRef(100);

  const gameState = useRef<GameState>({
    hero: {
      id: 'hero',
      type: EntityType.HERO,
      x: 100,
      y: 350,
      z: 0,
      vx: 0,
      vy: 0,
      vz: 0,
      width: HERO_WIDTH,
      height: HERO_HEIGHT,
      direction: Direction.RIGHT,
      state: EntityState.IDLE,
      health: 100,
      maxHealth: 100,
      stateTimer: 0,
      attackCooldown: 0,
      color: 'blue',
      isHit: false,
      scoreValue: 0,
      shoutText: '',
      shoutTimer: 0,
      comboStage: 0,
      lastAttackTime: 0,
      speedBoostTimer: 0,
      invincibilityTimer: 0
    },
    enemies: [],
    particles: [],
    pickups: [],
    score: 0,
    suburbanIntegrity: 100,
    gameOver: false,
    gameWon: false,
    wave: 1,
    cameraShake: 0,
    cameraX: 0
  });

  const frameCount = useRef(0);
  const FIXED_TIME_STEP = 1000 / 60; // 60 updates per second

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default scrolling for game keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'KeyZ'].includes(e.code)) {
         e.preventDefault(); 
      }
      keys.current[e.code] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keys.current[e.code] = false;
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Update ref when prop changes
  useEffect(() => {
    gameStartedRef.current = gameStarted;

    // --- RESET GAME STATE WHEN START IS CLICKED ---
    if (gameStarted) {
        // Clear keys to prevent stuck inputs
        keys.current = {};
        
        gameState.current = {
          hero: {
            id: 'hero',
            type: EntityType.HERO,
            x: 100,
            y: 350,
            z: 0,
            vx: 0,
            vy: 0,
            vz: 0,
            width: HERO_WIDTH,
            height: HERO_HEIGHT,
            direction: Direction.RIGHT,
            state: EntityState.IDLE,
            health: 100,
            maxHealth: 100,
            stateTimer: 0,
            attackCooldown: 0,
            color: 'blue',
            isHit: false,
            scoreValue: 0,
            shoutText: '',
            shoutTimer: 0,
            comboStage: 0,
            lastAttackTime: 0,
            speedBoostTimer: 0,
            invincibilityTimer: 0
          },
          enemies: [],
          particles: [],
          pickups: [],
          score: 0,
          suburbanIntegrity: 100,
          gameOver: false,
          gameWon: false,
          wave: 1,
          cameraShake: 0,
          cameraX: 0
        };
        frameCount.current = 0;
        lastReportedHealth.current = 100;
        // Trigger initial updates
        onScoreUpdate(0);
        onHealthUpdate(100);
        onIntegrityUpdate(100);
    }
  }, [gameStarted, onScoreUpdate, onHealthUpdate, onIntegrityUpdate]);

  const spawnParticle = (x: number, y: number, z: number, color: string, text?: string) => {
      gameState.current.particles.push({
          id: Math.random().toString(),
          x, y, z,
          vx: (Math.random() - 0.5) * 4,
          vy: (Math.random() - 0.5) * 2,
          vz: text ? 2 : Math.random() * 3 + 1,
          life: text ? 40 : 20,
          color,
          text
      });
  };

  const spawnPickup = (x: number, y: number, z: number) => {
      const rand = Math.random();
      let type: 'TEA' | 'CRUMPET' | 'SPEED' | 'INVINCIBILITY' = 'TEA';

      if (rand > 0.9) type = 'INVINCIBILITY';
      else if (rand > 0.8) type = 'SPEED';
      else if (rand > 0.5) type = 'TEA';
      else type = 'CRUMPET';

      gameState.current.pickups.push({
          id: Math.random().toString(),
          type,
          x, y, z,
          life: 800 // ~13 seconds
      });
  };

  const performAttack = (attacker: Entity, type: 'PUNCH' | 'KICK') => {
    if (attacker.state === EntityState.ATTACK || attacker.state === EntityState.HURT) return;

    attacker.state = EntityState.ATTACK;
    attacker.stateTimer = ATTACK_DURATION;
    
    let damage = 25;
    let knockback = 10;
    
    // Combo Logic for Hero
    if (attacker.type === EntityType.HERO) {
        const now = Date.now();
        if (now - (attacker.lastAttackTime || 0) < COMBO_WINDOW) {
            attacker.comboStage = ((attacker.comboStage || 0) + 1) % 3;
        } else {
            attacker.comboStage = 0;
        }
        attacker.lastAttackTime = now;

        if (attacker.comboStage === 1) { damage = 35; knockback = 15; } // Hook
        if (attacker.comboStage === 2) { damage = 50; knockback = 25; } // Overhead Smash
        
        const offset = attacker.direction === Direction.RIGHT ? 60 : -60;
        const words = ['SOURCE?', 'CONTEXT!', 'NUANCE!', 'SPELLING!', 'GRAMMAR!', 'HISTORY!', 'DATA!'];
        const word = words[Math.floor(Math.random() * words.length)];
        spawnParticle(attacker.x + offset, attacker.y, attacker.height / 2, '#81d4fa', word);
    } else {
        // Enemy Damage Scaling
        if (attacker.type === EntityType.ENEMY_TANK) {
            damage = 40;
            knockback = 15;
        } else if (attacker.type === EntityType.ENEMY_HOOLIGAN) {
            damage = 15;
            knockback = 5;
        }
    }

    const targets = attacker.type === EntityType.HERO ? gameState.current.enemies : [gameState.current.hero];

    targets.forEach(target => {
        if (target.state === EntityState.DYING || target.state === EntityState.DEAD) return;

        // INVINCIBILITY CHECK
        if (target.type === EntityType.HERO && (target.invincibilityTimer || 0) > 0) {
            // Deflect effect
            if (attacker.type !== EntityType.HERO) {
                spawnParticle(target.x, target.y, target.height/2, '#fff', 'BLOCK!');
            }
            return;
        }

        const dx = Math.abs(attacker.x - target.x);
        const dy = Math.abs(attacker.y - target.y); 
        const dz = Math.abs(attacker.z - target.z);
        
        const correctDirection = (attacker.direction === Direction.RIGHT && target.x > attacker.x) ||
                                 (attacker.direction === Direction.LEFT && target.x < attacker.x);

        if (dx < HIT_BOX_RANGE_X && dy < HIT_BOX_RANGE_Y && dz < 20 && correctDirection) {
            target.health -= damage;
            target.state = EntityState.HURT;
            target.stateTimer = HURT_DURATION;
            target.isHit = true;
            
            // Knockback logic
            let finalKnockback = knockback;
            // Tanks resist knockback
            if (target.type === EntityType.ENEMY_TANK) finalKnockback *= 0.2;
            
            target.vx = attacker.direction * finalKnockback;
            target.vz = 5;

            const impacts = ['SCHOOLED!', 'DEBUNKED!', 'CITED!', 'REVIEWED!', 'FACT CHECK!'];
            const randomImpact = impacts[Math.floor(Math.random() * impacts.length)];
            spawnParticle(target.x, target.y, target.height + target.z, '#ffea00', randomImpact);

            if (target.health <= 0) {
                target.state = EntityState.DYING;
                target.stateTimer = 30;
                if (target.type !== EntityType.HERO) {
                    gameState.current.score += target.scoreValue;
                    onScoreUpdate(gameState.current.score);
                    
                    // Drop chance
                    if (Math.random() < 0.25) {
                        spawnPickup(target.x, target.y, target.z);
                    }
                }
            }
        }
    });
  };

  const update = () => {
    if (gameState.current.gameOver) return;
    
    const { hero, enemies } = gameState.current;
    frameCount.current++;
    const isGameRunning = gameStartedRef.current;

    // --- CAMERA LOGIC ---
    if (isGameRunning) {
        // Target is hero position, but biased to the left (hero is at 1/3 of screen)
        let targetCamX = hero.x - (CANVAS_WIDTH * 0.35);
        
        // Clamp Target
        targetCamX = Math.max(0, Math.min(targetCamX, WORLD_WIDTH - CANVAS_WIDTH));
        
        // Smooth Lerp
        const lerpFactor = 0.1;
        gameState.current.cameraX += (targetCamX - gameState.current.cameraX) * lerpFactor;
        
        // Clamp final
        gameState.current.cameraX = Math.max(0, Math.min(gameState.current.cameraX, WORLD_WIDTH - CANVAS_WIDTH));
    }

    // --- INPUT HANDLING ---
    // Only process input and movement if Game Started
    if (isGameRunning) {
        let inputX = 0;
        let inputY = 0;
        
        // Check joystick first
        if (Math.abs(inputRef.current.x) > 0.1 || Math.abs(inputRef.current.y) > 0.1) {
            inputX = inputRef.current.x;
            inputY = inputRef.current.y;
        } else {
            // Check Keyboard
            if (keys.current['ArrowLeft']) inputX -= 1;
            if (keys.current['ArrowRight']) inputX += 1;
            if (keys.current['ArrowUp']) inputY -= 1;
            if (keys.current['ArrowDown']) inputY += 1;
            
            // Normalize keyboard diagonal
            const mag = Math.sqrt(inputX * inputX + inputY * inputY);
            if (mag > 1) {
                inputX /= mag;
                inputY /= mag;
            }
        }

        let jump = keys.current['Space'];
        let attack = keys.current['KeyZ'];

        if (inputRef.current.jump) {
            jump = true;
            inputRef.current.jump = false; 
        }
        if (inputRef.current.attack) {
            attack = true;
            inputRef.current.attack = false; 
        }

        if (hero.state !== EntityState.HURT && hero.state !== EntityState.DYING) {
            if (attack) {
                performAttack(hero, 'PUNCH');
                hero.vx *= 0.6;
                hero.vy *= 0.6;
            } 
            else if (jump && hero.z === 0 && hero.state !== EntityState.ATTACK) {
                hero.vz = JUMP_FORCE;
            }
            else if (hero.state !== EntityState.ATTACK) {
                if (Math.abs(inputX) > 0.01 || Math.abs(inputY) > 0.01) {
                    hero.state = EntityState.WALK;
                    if (inputX !== 0) hero.direction = inputX > 0 ? Direction.RIGHT : Direction.LEFT;
                    
                    const isAirborne = hero.z > 0;
                    // Reduced control in air, high accel on ground
                    let currentAccel = isAirborne ? ACCELERATION * 0.3 : ACCELERATION;
                    
                    // SPEED BOOST MULTIPLIER
                    if (hero.speedBoostTimer && hero.speedBoostTimer > 0) {
                        currentAccel *= SPEED_MULTIPLIER;
                    }

                    hero.vx += inputX * currentAccel;
                    hero.vy += inputY * currentAccel;
                    
                    if (hero.z === 0 && frameCount.current % 15 === 0) {
                        spawnParticle(hero.x, hero.y, 0, '#cfd8dc');
                    }
                } else {
                    if (hero.z === 0) hero.state = EntityState.IDLE;
                    
                    // Arcade Physics: High friction on ground (snappy stop), Low friction in air (momentum)
                    const currentFric = hero.z > 0 ? 0.9 : FRICTION;
                    hero.vx *= currentFric;
                    hero.vy *= currentFric;
                }
                
                // Speed Clamping (affected by Boost)
                let maxSpeedX = WALK_SPEED;
                let maxSpeedY = WALK_SPEED_Y;
                if (hero.speedBoostTimer && hero.speedBoostTimer > 0) {
                    maxSpeedX *= SPEED_MULTIPLIER;
                    maxSpeedY *= SPEED_MULTIPLIER;
                }

                if (Math.abs(hero.vx) > maxSpeedX) hero.vx = Math.sign(hero.vx) * maxSpeedX;
                if (Math.abs(hero.vy) > maxSpeedY) hero.vy = Math.sign(hero.vy) * maxSpeedY;
                
                // Zero out small velocities to prevent micro-sliding
                if (Math.abs(hero.vx) < 0.1) hero.vx = 0;
                if (Math.abs(hero.vy) < 0.1) hero.vy = 0;
            }
        } else {
            hero.vx *= FRICTION;
            hero.vy *= FRICTION;
        }

        hero.x += hero.vx;
        hero.y += hero.vy;
        hero.z += hero.vz;
        hero.vz -= GRAVITY;
        if (hero.z < 0) { hero.z = 0; hero.vz = 0; }
        
        // Bounds Checking (Against WORLD WIDTH now)
        hero.x = Math.max(HERO_WIDTH/2, Math.min(WORLD_WIDTH - HERO_WIDTH/2, hero.x));
        hero.y = Math.max(GROUND_Y_HORIZON, Math.min(GROUND_Y_MAX, hero.y));

        // Manage Timers
        if (hero.state === EntityState.ATTACK) {
            hero.stateTimer--;
            if (hero.stateTimer <= 0) hero.state = EntityState.IDLE;
        }
        if (hero.state === EntityState.HURT) {
            hero.stateTimer--;
            if (hero.stateTimer <= 0) {
                hero.state = EntityState.IDLE;
                hero.isHit = false;
            }
        }
        if (hero.speedBoostTimer && hero.speedBoostTimer > 0) hero.speedBoostTimer--;
        if (hero.invincibilityTimer && hero.invincibilityTimer > 0) hero.invincibilityTimer--;

        // Pickup Collection
        for (let i = gameState.current.pickups.length - 1; i >= 0; i--) {
            const p = gameState.current.pickups[i];
            const dx = Math.abs(hero.x - p.x);
            const dy = Math.abs(hero.y - p.y);
            const dz = Math.abs(hero.z - p.z);
            
            if (dx < 40 && dy < 20 && dz < 40) {
                // Collect
                if (p.type === 'TEA') {
                    hero.health = Math.min(hero.maxHealth, hero.health + 20);
                    spawnParticle(hero.x, hero.y, hero.height, '#4caf50', 'HEALTH!');
                    onHealthUpdate(hero.health);
                } else if (p.type === 'CRUMPET') {
                    gameState.current.score += 500;
                    spawnParticle(hero.x, hero.y, hero.height, '#ffeb3b', 'BONUS!');
                    onScoreUpdate(gameState.current.score);
                } else if (p.type === 'SPEED') {
                    hero.speedBoostTimer = SPEED_BOOST_DURATION;
                    spawnParticle(hero.x, hero.y, hero.height, '#00b0ff', 'SPEED!');
                } else if (p.type === 'INVINCIBILITY') {
                    hero.invincibilityTimer = INVINCIBILITY_DURATION;
                    spawnParticle(hero.x, hero.y, hero.height, '#ffd700', 'POWER!');
                }
                gameState.current.pickups.splice(i, 1);
            }
        }

    } else {
        // --- ATTRACT MODE (Game not started) ---
        // Just keep hero idle
        hero.state = EntityState.IDLE;
        hero.vx = 0; hero.vy = 0; hero.z = 0;
        hero.x = 100;
        hero.y = 350;
    }

    // --- ENEMY LOGIC (Only if Game Started) ---
    if (isGameRunning) {
        // Spawning
        const wave = gameState.current.wave;
        const maxEnemies = 4 + wave;
        
        if (frameCount.current % (SPAWN_RATE / Math.ceil(wave/2)) === 0 && enemies.length < maxEnemies) {
            const spawnRight = Math.random() > 0.5;
            const shouts = ['I SHAG\nFLAGS', 'LUV ME\nFLAG', 'SIMPLE\nAS', 'ATE\nNONCES', 'PROPER\nBREXIT', 'ENGLAND\nTIL I DIE'];
            const randomShout = shouts[Math.floor(Math.random() * shouts.length)];

            // Enemy Type Selection Logic
            let eType = EntityType.ENEMY_FLAGGER;
            const rand = Math.random();
            let width = ENEMY_WIDTH;
            let height = ENEMY_HEIGHT;
            let hp = 40 + (wave * 10);
            let scoreVal = 100;
            
            if (wave >= 4 && rand < 0.15) {
                eType = EntityType.ENEMY_TANK;
                width = TANK_WIDTH;
                height = TANK_HEIGHT;
                hp = 120 + (wave * 20);
                scoreVal = 500;
            } else if (wave >= 2 && rand < 0.35) {
                eType = EntityType.ENEMY_HOOLIGAN;
                width = HOOLIGAN_WIDTH;
                height = HOOLIGAN_HEIGHT;
                hp = 30 + (wave * 5);
                scoreVal = 200;
            } else if (rand > 0.6) {
                eType = EntityType.ENEMY_PAINTER;
            }

            // Spawn relative to camera viewport
            const camX = gameState.current.cameraX;
            const spawnX = spawnRight ? camX + CANVAS_WIDTH + 50 : camX - 50;

            const newEnemy: Entity = {
                id: `enemy_${Date.now()}_${Math.random()}`,
                type: eType,
                x: spawnX,
                y: Math.random() * (GROUND_Y_MAX - GROUND_Y_HORIZON) + GROUND_Y_HORIZON,
                z: 0,
                vx: 0, vy: 0, vz: 0,
                width: width,
                height: height,
                direction: spawnRight ? Direction.LEFT : Direction.RIGHT,
                state: EntityState.WALK,
                health: hp,
                maxHealth: hp,
                stateTimer: 0,
                attackCooldown: 0,
                scoreValue: scoreVal,
                color: 'red',
                isHit: false,
                shoutText: randomShout,
                shoutTimer: 180 
            };
            enemies.push(newEnemy);
        }

        // Enemy Updates
        enemies.forEach(enemy => {
            if (enemy.state === EntityState.DEAD) return;

            enemy.x += enemy.vx;
            enemy.y += enemy.vy;
            enemy.z += enemy.vz;
            enemy.vz -= GRAVITY;
            if (enemy.z < 0) { enemy.z = 0; enemy.vz = 0; }
            enemy.y = Math.max(GROUND_Y_HORIZON, Math.min(GROUND_Y_MAX, enemy.y));

            if (enemy.shoutTimer && enemy.shoutTimer > 0) {
                enemy.shoutTimer--;
                if (enemy.shoutTimer <= 0) enemy.shoutText = undefined;
            } else if (enemy.state !== EntityState.DYING && enemy.state !== EntityState.HURT && enemy.state !== EntityState.PRE_ATTACK && enemy.state !== EntityState.ATTACK) {
                if (Math.random() < 0.005) {
                    const taunts = ["Who are ya?", "Come on then!", "Get out\nmy pub", "Absolute\nUnit", "Nuff said", "Jog on", "Soft lad", "Bang out\nof order"];
                    enemy.shoutText = taunts[Math.floor(Math.random() * taunts.length)];
                    enemy.shoutTimer = 120;
                }
            }

            if (enemy.state === EntityState.PRE_ATTACK) {
                enemy.stateTimer--;
                if (enemy.stateTimer <= 0) {
                    performAttack(enemy, 'PUNCH');
                }
                return; // Stop moving while winding up
            }

            if (enemy.state === EntityState.HURT) {
                enemy.stateTimer--;
                if (enemy.stateTimer <= 0) {
                    enemy.state = EntityState.IDLE;
                    enemy.isHit = false;
                }
                return;
            }
            if (enemy.state === EntityState.DYING) {
                enemy.stateTimer--;
                if (enemy.stateTimer <= 0) enemy.state = EntityState.DEAD;
                return;
            }
            if (enemy.state === EntityState.ATTACK) {
                enemy.stateTimer--;
                if (enemy.stateTimer <= 0) enemy.state = EntityState.IDLE;
                return; 
            }

            // AI Logic
            const distToHeroX = Math.abs(enemy.x - hero.x);
            const distToHeroY = Math.abs(enemy.y - hero.y);

            // Aggressive Types target Hero more often
            const isAggressive = enemy.type === EntityType.ENEMY_HOOLIGAN || enemy.type === EntityType.ENEMY_TANK;
            const aggroRange = isAggressive ? 600 : 150; // Hooligans/Tanks see hero from far away

            if (distToHeroX < aggroRange && distToHeroY < (isAggressive ? 150 : 50) && hero.health > 0) {
                if (enemy.state === EntityState.ACTION) {
                    enemy.state = EntityState.IDLE;
                    spawnParticle(enemy.x, enemy.y, 50, '#fff', 'Oi!');
                }
                
                // Stop distance
                const stopDist = enemy.type === EntityType.ENEMY_HOOLIGAN ? 30 : 40;

                if (distToHeroX > stopDist) {
                    // Different speeds
                    let speedMod = 0.4;
                    if (enemy.type === EntityType.ENEMY_HOOLIGAN) speedMod = 0.7; // Fast
                    if (enemy.type === EntityType.ENEMY_TANK) speedMod = 0.2; // Slow

                    enemy.vx = (hero.x - enemy.x > 0 ? 1 : -1) * (WALK_SPEED * speedMod); 
                    enemy.direction = enemy.vx > 0 ? Direction.RIGHT : Direction.LEFT;
                    enemy.state = EntityState.WALK;
                    if (frameCount.current % 15 === 0) spawnParticle(enemy.x, enemy.y, 0, '#cfd8dc');
                } else {
                    enemy.vx = 0;
                    enemy.direction = hero.x > enemy.x ? Direction.RIGHT : Direction.LEFT;
                    
                    // Attack chance
                    let attackProb = 0.02;
                    if (enemy.type === EntityType.ENEMY_HOOLIGAN) attackProb = 0.04;
                    
                    if (enemy.state !== EntityState.PRE_ATTACK && enemy.state !== EntityState.ATTACK && Math.random() < attackProb) {
                        enemy.state = EntityState.PRE_ATTACK;
                        enemy.stateTimer = enemy.type === EntityType.ENEMY_HOOLIGAN ? 10 : 25; // Hooligans telegraph faster
                    }
                }
                
                if (distToHeroY > 5) {
                    let speedModY = 0.25;
                    if (enemy.type === EntityType.ENEMY_HOOLIGAN) speedModY = 0.4;
                     if (enemy.type === EntityType.ENEMY_TANK) speedModY = 0.15;

                    enemy.vy = (hero.y - enemy.y > 0 ? 1 : -1) * (WALK_SPEED * speedModY);
                } else {
                    enemy.vy = 0;
                }
            } else {
                // Objective Seeking (Flaggers/Painters only)
                if (isAggressive) {
                    // Hooligans/Tanks wander if no hero
                    enemy.state = EntityState.IDLE;
                    enemy.vx = 0; enemy.vy = 0;
                } else {
                    let targetX = enemy.type === EntityType.ENEMY_FLAGGER ? LAMP_POST_X - 10 : ROUNDABOUT_X;
                    let targetY = enemy.type === EntityType.ENEMY_FLAGGER ? LAMP_POST_Z_DEPTH : ROUNDABOUT_Z_DEPTH;

                    const distToObjX = Math.abs(enemy.x - targetX);
                    const distToObjY = Math.abs(enemy.y - targetY);

                    if (distToObjX < 15 && distToObjY < 15) {
                        enemy.vx = 0; enemy.vy = 0;
                        enemy.state = EntityState.ACTION;
                        if (frameCount.current % 60 === 0) {
                            gameState.current.suburbanIntegrity -= 1.5;
                            onIntegrityUpdate(gameState.current.suburbanIntegrity);
                        }
                    } else {
                        enemy.state = EntityState.WALK;
                        const angle = Math.atan2(targetY - enemy.y, targetX - enemy.x);
                        enemy.vx = Math.cos(angle) * (WALK_SPEED * 0.4);
                        enemy.vy = Math.sin(angle) * (WALK_SPEED * 0.4);
                        enemy.direction = enemy.vx > 0 ? Direction.RIGHT : Direction.LEFT;
                        if (frameCount.current % 15 === 0) spawnParticle(enemy.x, enemy.y, 0, '#cfd8dc');
                    }
                }
            }
        });
    }

    // Particle Updates (Always run for atmosphere)
    for (let i = gameState.current.particles.length - 1; i >= 0; i--) {
        const p = gameState.current.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;
        p.vz -= GRAVITY;
        p.life--;
        if (p.z < 0) { p.z = 0; p.vz *= -0.5; p.vx *= 0.8; p.vy *= 0.8; p.vy *= 0.8; p.vy *= 0.8; }
        if (p.life <= 0) gameState.current.particles.splice(i, 1);
    }

    // Pickup Updates
    for (let i = gameState.current.pickups.length - 1; i >= 0; i--) {
        const p = gameState.current.pickups[i];
        p.life--;
        if (p.life <= 0) gameState.current.pickups.splice(i, 1);
    }

    gameState.current.enemies = gameState.current.enemies.filter(e => e.state !== EntityState.DEAD);

    // Only check Game Over if game started
    if (isGameRunning && (gameState.current.suburbanIntegrity <= 0 || hero.health <= 0)) {
        gameState.current.gameOver = true;
        onGameOver(false);
    }
    
    if (isGameRunning && gameState.current.score > gameState.current.wave * 1500) {
        gameState.current.wave++;
        hero.health = Math.min(hero.maxHealth, hero.health + 30);
    }
  };

  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (gameState.current.hero.state === EntityState.HURT) {
        const shake = (Math.random() - 0.5) * 10;
        ctx.translate(shake, shake);
    }

    // Draw Background & Environment with Camera Offset
    drawEnvironment(ctx, CANVAS_WIDTH, CANVAS_HEIGHT, gameState.current.suburbanIntegrity, gameState.current.cameraX);

    // Apply Camera Transform for World Entities
    ctx.save();
    ctx.translate(-Math.floor(gameState.current.cameraX), 0);

    const allEntities = [gameState.current.hero, ...gameState.current.enemies];
    
    // Sort pickups and entities by Y
    const drawables = [
        ...allEntities.map(e => ({type: 'ENTITY', obj: e, y: e.y})),
        ...gameState.current.pickups.map(p => ({type: 'PICKUP', obj: p, y: p.y}))
    ];
    drawables.sort((a, b) => a.y - b.y);

    allEntities.forEach(e => drawShadow(ctx, e));
    
    drawables.forEach(d => {
        if (d.type === 'ENTITY') {
            drawEntity(ctx, d.obj as Entity, frameCount.current);
        } else {
            drawPickup(ctx, d.obj as Pickup, frameCount.current);
        }
    });

    drawParticles(ctx, gameState.current.particles);
    
    ctx.restore(); // Restore camera transform

    // Draw Foreground (Parallax)
    drawForeground(ctx, CANVAS_WIDTH, CANVAS_HEIGHT, gameState.current.cameraX);
  };

  const loop = (timestamp: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = timestamp;
    
    const deltaTime = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;
    
    accumulatorRef.current += deltaTime;

    // Cap accumulator to prevent death spiral on lag spikes
    if (accumulatorRef.current > 200) accumulatorRef.current = 200;

    while (accumulatorRef.current >= FIXED_TIME_STEP) {
        update();
        accumulatorRef.current -= FIXED_TIME_STEP;
    }

    render();
    
    // Only update health if changed to avoid spamming React Render
    if (gameStartedRef.current && Math.abs(gameState.current.hero.health - lastReportedHealth.current) > 0.1) {
        lastReportedHealth.current = gameState.current.hero.health;
        onHealthUpdate(gameState.current.hero.health);
    }

    frameRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    frameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameRef.current);
  }, []); // Run once on mount

  return (
    <canvas 
      ref={canvasRef} 
      width={CANVAS_WIDTH} 
      height={CANVAS_HEIGHT}
      className="block w-full h-full bg-black cursor-none"
      style={{ imageRendering: 'pixelated' }}
    />
  );
};

export default GameCanvas;
