
import React, { useRef, useEffect, useState } from 'react';
import { 
  GameState, Entity, EntityType, EntityState, Direction, Particle 
} from '../types';
import { 
  CANVAS_WIDTH, CANVAS_HEIGHT, GRAVITY, FRICTION, ACCELERATION, WALK_SPEED, WALK_SPEED_Y,
  JUMP_FORCE, GROUND_Y_HORIZON, GROUND_Y_MAX, HERO_WIDTH, HERO_HEIGHT,
  ENEMY_WIDTH, ENEMY_HEIGHT, ATTACK_DURATION, HIT_BOX_RANGE_X, HIT_BOX_RANGE_Y,
  SPAWN_RATE, HURT_DURATION, LAMP_POST_X, LAMP_POST_Z_DEPTH, ROUNDABOUT_X, ROUNDABOUT_Z_DEPTH
} from '../constants';
import { drawEnvironment, drawEntity, drawShadow, drawParticles, drawForeground } from './SpriteRenderer';

interface GameCanvasProps {
  onScoreUpdate: (score: number) => void;
  onHealthUpdate: (health: number) => void;
  onIntegrityUpdate: (integrity: number) => void;
  onGameOver: (won: boolean) => void;
  inputRef: React.MutableRefObject<{x: number, y: number, attack: boolean, jump: boolean}>;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ 
  onScoreUpdate, onHealthUpdate, onIntegrityUpdate, onGameOver, inputRef 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);
  const keys = useRef<{ [key: string]: boolean }>({});
  
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
      shoutTimer: 0
    },
    enemies: [],
    particles: [],
    score: 0,
    suburbanIntegrity: 100,
    gameOver: false,
    gameWon: false,
    wave: 1,
    cameraShake: 0
  });

  const frameCount = useRef(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keys.current[e.code] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keys.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

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

  const performAttack = (attacker: Entity, type: 'PUNCH' | 'KICK') => {
    if (attacker.state === EntityState.ATTACK || attacker.state === EntityState.HURT) return;

    attacker.state = EntityState.ATTACK;
    attacker.stateTimer = ATTACK_DURATION;
    
    if (attacker.type === EntityType.HERO) {
         const offset = attacker.direction === Direction.RIGHT ? 60 : -60;
         const words = ['FACTS!', 'LOGIC!', 'READ!', 'STUDY!', 'CITE!'];
         const word = words[Math.floor(Math.random() * words.length)];
         spawnParticle(attacker.x + offset, attacker.y, attacker.height / 2, '#81d4fa', word);
    }

    const targets = attacker.type === EntityType.HERO ? gameState.current.enemies : [gameState.current.hero];
    let hitSomething = false;

    targets.forEach(target => {
        if (target.state === EntityState.DYING || target.state === EntityState.DEAD) return;

        const dx = Math.abs(attacker.x - target.x);
        const dy = Math.abs(attacker.y - target.y); 
        const dz = Math.abs(attacker.z - target.z);
        
        const correctDirection = (attacker.direction === Direction.RIGHT && target.x > attacker.x) ||
                                 (attacker.direction === Direction.LEFT && target.x < attacker.x);

        if (dx < HIT_BOX_RANGE_X && dy < HIT_BOX_RANGE_Y && dz < 20 && correctDirection) {
            hitSomething = true;
            target.health -= 25;
            target.state = EntityState.HURT;
            target.stateTimer = HURT_DURATION;
            target.isHit = true;
            
            target.vx = attacker.direction * 10;
            target.vz = 5;

            const impacts = ['EDUCATED!', 'CITED!', 'SOURCED!', 'LEARN!'];
            const randomImpact = impacts[Math.floor(Math.random() * impacts.length)];
            spawnParticle(target.x, target.y, target.height + target.z, '#ffea00', randomImpact);

            if (target.health <= 0) {
                target.state = EntityState.DYING;
                target.stateTimer = 30;
                if (target.type !== EntityType.HERO) {
                    gameState.current.score += target.scoreValue;
                    onScoreUpdate(gameState.current.score);
                }
            }
        }
    });
  };

  const update = () => {
    if (gameState.current.gameOver) return;
    
    const { hero, enemies } = gameState.current;
    frameCount.current++;

    // --- Input Handling ---
    let inputX = 0;
    let inputY = 0;
    
    // Keyboard inputs
    if (keys.current['ArrowLeft']) inputX -= 1;
    if (keys.current['ArrowRight']) inputX += 1;
    if (keys.current['ArrowUp']) inputY -= 1;
    if (keys.current['ArrowDown']) inputY += 1;

    // Joystick Override
    if (inputRef.current.x !== 0 || inputRef.current.y !== 0) {
        inputX = inputRef.current.x;
        inputY = inputRef.current.y;
    } else {
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
            // Heavy friction while attacking
            hero.vx *= 0.6;
            hero.vy *= 0.6;
        } 
        else if (jump && hero.z === 0 && hero.state !== EntityState.ATTACK) {
             hero.vz = JUMP_FORCE;
        }
        else if (hero.state !== EntityState.ATTACK) {
            // --- MOVEMENT PHYSICS ---
            if (inputX !== 0 || inputY !== 0) {
                hero.state = EntityState.WALK;
                if (inputX !== 0) hero.direction = inputX > 0 ? Direction.RIGHT : Direction.LEFT;
                
                // Acceleration
                hero.vx += inputX * ACCELERATION;
                hero.vy += inputY * ACCELERATION;

                // Dust particles
                if (hero.z === 0 && frameCount.current % 15 === 0) {
                    spawnParticle(hero.x, hero.y, 0, '#cfd8dc');
                }
            } else {
                // No input
                if (hero.z === 0) hero.state = EntityState.IDLE;
                
                // Friction
                hero.vx *= FRICTION;
                hero.vy *= FRICTION;
            }

            // Cap Speeds
            // X-Axis
            if (Math.abs(hero.vx) > WALK_SPEED) hero.vx = Math.sign(hero.vx) * WALK_SPEED;
            // Y-Axis (Slower depth movement)
            if (Math.abs(hero.vy) > WALK_SPEED_Y) hero.vy = Math.sign(hero.vy) * WALK_SPEED_Y;

            // Snap to zero if very slow
            if (Math.abs(hero.vx) < 0.1) hero.vx = 0;
            if (Math.abs(hero.vy) < 0.1) hero.vy = 0;
        }
    } else {
        // Hurt/Dying friction
        hero.vx *= FRICTION;
        hero.vy *= FRICTION;
    }

    hero.x += hero.vx;
    hero.y += hero.vy;
    hero.z += hero.vz;
    hero.vz -= GRAVITY;
    if (hero.z < 0) { hero.z = 0; hero.vz = 0; }
    
    hero.x = Math.max(HERO_WIDTH/2, Math.min(CANVAS_WIDTH - HERO_WIDTH/2, hero.x));
    hero.y = Math.max(GROUND_Y_HORIZON, Math.min(GROUND_Y_MAX, hero.y));

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

    // --- ENEMY SPAWNING ---
    if (frameCount.current % (SPAWN_RATE / Math.ceil(gameState.current.wave/2)) === 0 && enemies.length < 5) {
        const isFlagger = Math.random() > 0.4; 
        const spawnRight = Math.random() > 0.5;
        const shouts = [
            'FLAG\nSHAGGER',
            'LUV ME\nFLAG',
            'SIMPLE\nAS',
            'ATE\nNONCES',
            'PROPER\nBREXIT',
            'ENGLAND\nTIL I DIE'
        ];
        const randomShout = shouts[Math.floor(Math.random() * shouts.length)];

        const newEnemy: Entity = {
            id: `enemy_${Date.now()}`,
            type: isFlagger ? EntityType.ENEMY_FLAGGER : EntityType.ENEMY_PAINTER,
            x: spawnRight ? CANVAS_WIDTH + 50 : -50,
            y: Math.random() * (GROUND_Y_MAX - GROUND_Y_HORIZON) + GROUND_Y_HORIZON,
            z: 0,
            vx: 0, vy: 0, vz: 0,
            width: ENEMY_WIDTH,
            height: ENEMY_HEIGHT,
            direction: spawnRight ? Direction.LEFT : Direction.RIGHT,
            state: EntityState.WALK,
            health: 40 + (gameState.current.wave * 10),
            maxHealth: 40 + (gameState.current.wave * 10),
            stateTimer: 0,
            attackCooldown: 0,
            scoreValue: 100,
            color: 'red',
            isHit: false,
            shoutText: randomShout,
            shoutTimer: 180 
        };
        enemies.push(newEnemy);
    }

    // --- ENEMY AI ---
    enemies.forEach(enemy => {
        if (enemy.state === EntityState.DEAD) return;

        // Apply Physics
        enemy.x += enemy.vx;
        enemy.y += enemy.vy;
        enemy.z += enemy.vz;
        enemy.vz -= GRAVITY;
        if (enemy.z < 0) { enemy.z = 0; enemy.vz = 0; }
        enemy.y = Math.max(GROUND_Y_HORIZON, Math.min(GROUND_Y_MAX, enemy.y));

        if (enemy.shoutTimer && enemy.shoutTimer > 0) {
            enemy.shoutTimer--;
            if (enemy.shoutTimer <= 0) enemy.shoutText = undefined;
        } else if (enemy.state !== EntityState.DYING && enemy.state !== EntityState.HURT) {
            // Random Taunt Chance
            if (Math.random() < 0.005) {
                 const taunts = [
                     "Who are ya?", 
                     "Come on then!", 
                     "Get out\nmy pub", 
                     "Absolute\nUnit", 
                     "Nuff said", 
                     "Jog on", 
                     "Soft lad",
                     "Bang out\nof order"
                 ];
                 enemy.shoutText = taunts[Math.floor(Math.random() * taunts.length)];
                 enemy.shoutTimer = 120;
            }
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
            if (enemy.stateTimer <= 0) {
                enemy.state = EntityState.DEAD;
            }
            return;
        }

        if (enemy.state === EntityState.ATTACK) {
            enemy.stateTimer--;
            if (enemy.stateTimer <= 0) enemy.state = EntityState.IDLE;
            return; 
        }

        // Logic
        const distToHeroX = Math.abs(enemy.x - hero.x);
        const distToHeroY = Math.abs(enemy.y - hero.y);

        if (distToHeroX < 150 && distToHeroY < 50 && hero.health > 0) {
             // Aggro on Hero
             if (enemy.state === EntityState.ACTION) {
                 enemy.state = EntityState.IDLE;
                 spawnParticle(enemy.x, enemy.y, 50, '#fff', 'Oi!');
             }
             
             if (distToHeroX > 40) {
                 enemy.vx = (hero.x - enemy.x > 0 ? 1 : -1) * (WALK_SPEED * 0.4); // Slower than hero
                 enemy.direction = enemy.vx > 0 ? Direction.RIGHT : Direction.LEFT;
                 enemy.state = EntityState.WALK;
                 
                 if (frameCount.current % 15 === 0) spawnParticle(enemy.x, enemy.y, 0, '#cfd8dc');

             } else {
                 enemy.vx = 0;
                 enemy.direction = hero.x > enemy.x ? Direction.RIGHT : Direction.LEFT;
                 if (Math.random() < 0.02) { 
                     performAttack(enemy, 'PUNCH');
                 }
             }
             
             if (distToHeroY > 5) {
                 enemy.vy = (hero.y - enemy.y > 0 ? 1 : -1) * (WALK_SPEED * 0.25);
             } else {
                 enemy.vy = 0;
             }
        } else {
            // Objective Seeking
            let targetX = 0;
            let targetY = 0;

            if (enemy.type === EntityType.ENEMY_FLAGGER) {
                targetX = LAMP_POST_X - 10;
                targetY = LAMP_POST_Z_DEPTH;
            } else {
                targetX = ROUNDABOUT_X;
                targetY = ROUNDABOUT_Z_DEPTH;
            }

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
                // Simple velocity for AI
                enemy.vx = Math.cos(angle) * (WALK_SPEED * 0.4);
                enemy.vy = Math.sin(angle) * (WALK_SPEED * 0.4);
                enemy.direction = enemy.vx > 0 ? Direction.RIGHT : Direction.LEFT;
                
                if (frameCount.current % 15 === 0) spawnParticle(enemy.x, enemy.y, 0, '#cfd8dc');
            }
        }
    });

    // Particle Updates
    for (let i = gameState.current.particles.length - 1; i >= 0; i--) {
        const p = gameState.current.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;
        p.vz -= GRAVITY;
        p.life--;
        if (p.z < 0) { p.z = 0; p.vz *= -0.5; p.vx *= 0.8; }
        if (p.life <= 0) gameState.current.particles.splice(i, 1);
    }

    gameState.current.enemies = gameState.current.enemies.filter(e => e.state !== EntityState.DEAD);

    if (gameState.current.suburbanIntegrity <= 0 || hero.health <= 0) {
        gameState.current.gameOver = true;
        onGameOver(false);
    }
    
    if (gameState.current.score > gameState.current.wave * 1500) {
        gameState.current.wave++;
        hero.health = Math.min(hero.maxHealth, hero.health + 30);
        onHealthUpdate(hero.health);
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

    drawEnvironment(ctx, CANVAS_WIDTH, CANVAS_HEIGHT, gameState.current.suburbanIntegrity);

    const allEntities = [gameState.current.hero, ...gameState.current.enemies];
    allEntities.sort((a, b) => a.y - b.y);

    allEntities.forEach(e => drawShadow(ctx, e));
    allEntities.forEach(e => drawEntity(ctx, e, frameCount.current));
    drawParticles(ctx, gameState.current.particles);
    
    drawForeground(ctx, CANVAS_WIDTH, CANVAS_HEIGHT);
  };

  const loop = () => {
    update();
    render();
    onHealthUpdate(gameState.current.hero.health);
    frameRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    frameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

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
