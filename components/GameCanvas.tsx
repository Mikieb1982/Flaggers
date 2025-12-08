
import React, { useRef, useEffect } from 'react';
import { 
  GameState, Entity, EntityType, EntityState, Direction, Particle, Pickup, FlagPole 
} from '../types';
import { 
  CANVAS_WIDTH, CANVAS_HEIGHT, WORLD_WIDTH, GRAVITY, FRICTION, ACCELERATION, WALK_SPEED, WALK_SPEED_Y,
  JUMP_FORCE, GROUND_Y_HORIZON, GROUND_Y_MAX, HERO_WIDTH, HERO_HEIGHT,
  ENEMY_WIDTH, ENEMY_HEIGHT, TANK_WIDTH, TANK_HEIGHT, HOOLIGAN_WIDTH, HOOLIGAN_HEIGHT,
  ATTACK_DURATION, HIT_BOX_RANGE_X, HIT_BOX_RANGE_Y,
  SPAWN_RATE, HURT_DURATION, FLAG_POLE_LOCATIONS, FLAG_CAPTURE_RADIUS, FLAG_RAISE_SPEED, FLAG_LOWER_SPEED,
  COMBO_WINDOW, SPEED_BOOST_DURATION, INVINCIBILITY_DURATION, SPEED_MULTIPLIER
} from '../constants';
import { drawEnvironment, drawEntity, drawShadow, drawParticles, drawForeground, drawPickup, drawFlagPole } from './SpriteRenderer';

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
  
  const gameStartedRef = useRef(gameStarted);
  const lastReportedHealth = useRef(100);

  const gameState = useRef<GameState>({
    hero: {
      id: 'hero',
      type: EntityType.PLAYER_GAMMON,
      x: 100,
      y: 350,
      z: 0,
      vx: 0, vy: 0, vz: 0,
      width: HERO_WIDTH, // Reusing existing const
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
    flagPoles: [],
    score: 0,
    sovereignty: 0, 
    gameOver: false,
    gameWon: false,
    wave: 1,
    cameraShake: 0,
    cameraX: 0
  });

  const frameCount = useRef(0);
  const FIXED_TIME_STEP = 1000 / 60;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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

  useEffect(() => {
    gameStartedRef.current = gameStarted;

    if (gameStarted) {
        keys.current = {};
        
        // Init Flag Poles (Start DOWN)
        const flags: FlagPole[] = FLAG_POLE_LOCATIONS.map((loc, i) => ({
            id: i,
            x: loc.x,
            y: loc.y,
            raiseLevel: 0,
            isContested: false,
            isFullyRaised: false
        }));

        gameState.current = {
          hero: {
            id: 'hero',
            type: EntityType.PLAYER_GAMMON,
            x: 100,
            y: 350,
            z: 0,
            vx: 0, vy: 0, vz: 0,
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
          flagPoles: flags,
          score: 0,
          sovereignty: 0,
          gameOver: false,
          gameWon: false,
          wave: 1,
          cameraShake: 0,
          cameraX: 0
        };
        frameCount.current = 0;
        lastReportedHealth.current = 100;
        onScoreUpdate(0);
        onHealthUpdate(100);
        onIntegrityUpdate(0); // Start at 0, build to 100
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
          life: 800
      });
  };

  const performAttack = (attacker: Entity, type: 'PUNCH' | 'KICK') => {
    if (attacker.state === EntityState.ATTACK || attacker.state === EntityState.HURT) return;

    attacker.state = EntityState.ATTACK;
    attacker.stateTimer = ATTACK_DURATION;
    
    let damage = 25;
    let knockback = 10;
    
    // Player Combo Logic
    if (attacker.type === EntityType.PLAYER_GAMMON) {
        const now = Date.now();
        if (now - (attacker.lastAttackTime || 0) < COMBO_WINDOW) {
            attacker.comboStage = ((attacker.comboStage || 0) + 1) % 3;
        } else {
            attacker.comboStage = 0;
        }
        attacker.lastAttackTime = now;

        if (attacker.comboStage === 1) { damage = 35; knockback = 15; } 
        if (attacker.comboStage === 2) { damage = 50; knockback = 25; } 
        
        const offset = attacker.direction === Direction.RIGHT ? 60 : -60;
        const words = ['BOSH!', 'SIMPLE AS!', 'SORTED!', 'AV IT!', 'BREXIT!', 'TWO WORLD WARS!'];
        const word = words[Math.floor(Math.random() * words.length)];
        spawnParticle(attacker.x + offset, attacker.y, attacker.height / 2, '#ef5350', word);
    } else {
        // Enemy Damage Scaling
        damage = 10; // Professionals are weaker physically but numerous
        if (attacker.type === EntityType.ENEMY_LAWYER) damage = 15;
    }

    const targets = attacker.type === EntityType.PLAYER_GAMMON ? gameState.current.enemies : [gameState.current.hero];

    targets.forEach(target => {
        if (target.state === EntityState.DYING || target.state === EntityState.DEAD) return;

        if (target.type === EntityType.PLAYER_GAMMON && (target.invincibilityTimer || 0) > 0) {
            if (attacker.type !== EntityType.PLAYER_GAMMON) {
                spawnParticle(target.x, target.y, target.height/2, '#fff', 'IGNORED!');
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
            
            target.vx = attacker.direction * knockback;
            target.vz = 5;

            // Impact Text depending on who got hit
            const enemyImpacts = ['CANCELLED!', 'WOKE!', 'TRIGGERED!', 'SNOWFLAKE!'];
            const playerImpacts = ['LAWSUIT!', 'DATA!', 'LOGIC!', 'FACTS!'];
            
            const impacts = target.type === EntityType.PLAYER_GAMMON ? playerImpacts : enemyImpacts;
            const randomImpact = impacts[Math.floor(Math.random() * impacts.length)];
            spawnParticle(target.x, target.y, target.height + target.z, '#ffea00', randomImpact);

            if (target.health <= 0) {
                target.state = EntityState.DYING;
                target.stateTimer = 30;
                if (target.type !== EntityType.PLAYER_GAMMON) {
                    gameState.current.score += target.scoreValue;
                    onScoreUpdate(gameState.current.score);
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
    
    const { hero, enemies, flagPoles } = gameState.current;
    frameCount.current++;
    const isGameRunning = gameStartedRef.current;

    if (isGameRunning) {
        let targetCamX = hero.x - (CANVAS_WIDTH * 0.35);
        targetCamX = Math.max(0, Math.min(targetCamX, WORLD_WIDTH - CANVAS_WIDTH));
        const lerpFactor = 0.1;
        gameState.current.cameraX += (targetCamX - gameState.current.cameraX) * lerpFactor;
        gameState.current.cameraX = Math.max(0, Math.min(gameState.current.cameraX, WORLD_WIDTH - CANVAS_WIDTH));
    }

    if (isGameRunning) {
        let inputX = 0;
        let inputY = 0;
        
        if (Math.abs(inputRef.current.x) > 0.1 || Math.abs(inputRef.current.y) > 0.1) {
            inputX = inputRef.current.x;
            inputY = inputRef.current.y;
        } else {
            if (keys.current['ArrowLeft']) inputX -= 1;
            if (keys.current['ArrowRight']) inputX += 1;
            if (keys.current['ArrowUp']) inputY -= 1;
            if (keys.current['ArrowDown']) inputY += 1;
            
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
                hero.vx *= 0.8;
                hero.vy *= 0.8;
            } 
            else if (jump && hero.z === 0 && hero.state !== EntityState.ATTACK) {
                hero.vz = JUMP_FORCE;
            }
            else if (hero.state !== EntityState.ATTACK) {
                if (Math.abs(inputX) > 0.01 || Math.abs(inputY) > 0.01) {
                    hero.state = EntityState.WALK;
                    if (inputX !== 0) hero.direction = inputX > 0 ? Direction.RIGHT : Direction.LEFT;
                    
                    const isAirborne = hero.z > 0;
                    let currentAccel = isAirborne ? ACCELERATION * 0.4 : ACCELERATION;
                    
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
                }
                
                const currentFric = hero.z > 0 ? 0.95 : FRICTION;
                hero.vx *= currentFric;
                hero.vy *= currentFric;
                
                if (Math.abs(hero.vx) < 0.1) hero.vx = 0;
                if (Math.abs(hero.vy) < 0.1) hero.vy = 0;

                let maxSpeedX = WALK_SPEED;
                let maxSpeedY = WALK_SPEED_Y;
                if (hero.speedBoostTimer && hero.speedBoostTimer > 0) {
                    maxSpeedX *= SPEED_MULTIPLIER;
                    maxSpeedY *= SPEED_MULTIPLIER;
                }

                if (Math.abs(hero.vx) > maxSpeedX) hero.vx = Math.sign(hero.vx) * maxSpeedX;
                if (Math.abs(hero.vy) > maxSpeedY) hero.vy = Math.sign(hero.vy) * maxSpeedY;
            }
        } else {
            hero.vx *= 0.9;
            hero.vy *= 0.9;
        }

        hero.x += hero.vx;
        hero.y += hero.vy;
        hero.z += hero.vz;
        hero.vz -= GRAVITY;
        if (hero.z < 0) { hero.z = 0; hero.vz = 0; }
        
        hero.x = Math.max(HERO_WIDTH/2, Math.min(WORLD_WIDTH - HERO_WIDTH/2, hero.x));
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
        if (hero.speedBoostTimer && hero.speedBoostTimer > 0) hero.speedBoostTimer--;
        if (hero.invincibilityTimer && hero.invincibilityTimer > 0) hero.invincibilityTimer--;

        // Taunts for Player
        if (hero.state !== EntityState.DYING && hero.state !== EntityState.HURT && Math.random() < 0.003) {
            const taunts = [
                "can't say anything\nthese days", 
                "if you say you're\nEnglish you get\narrested and thrown\nin jail", 
                "Ingerland", 
                "make britun\ngrate again", 
                "am not racist\nbut", 
                "simple as",
                "two world wars\nand one world cup",
                "bloody woke\nnonsense"
            ];
            hero.shoutText = taunts[Math.floor(Math.random() * taunts.length)];
            hero.shoutTimer = 180;
        }
        if (hero.shoutTimer && hero.shoutTimer > 0) {
            hero.shoutTimer--;
            if (hero.shoutTimer <= 0) hero.shoutText = undefined;
        }

        for (let i = gameState.current.pickups.length - 1; i >= 0; i--) {
            const p = gameState.current.pickups[i];
            const dx = Math.abs(hero.x - p.x);
            const dy = Math.abs(hero.y - p.y);
            const dz = Math.abs(hero.z - p.z);
            
            if (dx < 40 && dy < 20 && dz < 40) {
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
        hero.state = EntityState.IDLE;
        hero.vx = 0; hero.vy = 0; hero.z = 0;
        hero.x = 100;
        hero.y = 350;
    }

    // --- FLAG POLE LOGIC (FLIPPED) ---
    if (isGameRunning) {
        let totalRaise = 0;
        
        flagPoles.forEach(pole => {
            let heroPresent = false;
            let enemyCount = 0;

            const hDistX = Math.abs(hero.x - pole.x);
            const hDistY = Math.abs(hero.y - pole.y);
            if (hDistX < FLAG_CAPTURE_RADIUS && hDistY < FLAG_CAPTURE_RADIUS / 2) {
                heroPresent = true;
                if (hero.state === EntityState.IDLE || hero.state === EntityState.WALK) {
                    hero.state = EntityState.ACTION; // Raising animation
                }
            } else if (hero.state === EntityState.ACTION) {
                // Check if interacting with any other flag
                // Simplified: Just reset if away from current pole loop? 
                // No, state reset happens in movement logic if input is pressed.
            }

            enemies.forEach(enemy => {
                if (enemy.state !== EntityState.DEAD && enemy.state !== EntityState.DYING) {
                    const eDistX = Math.abs(enemy.x - pole.x);
                    const eDistY = Math.abs(enemy.y - pole.y);
                    if (eDistX < FLAG_CAPTURE_RADIUS && eDistY < FLAG_CAPTURE_RADIUS / 2) {
                        enemyCount++;
                        if (enemy.state === EntityState.IDLE || enemy.state === EntityState.WALK) {
                             enemy.state = EntityState.ACTION; 
                        }
                    } else if (enemy.state === EntityState.ACTION && enemy.targetId === `flag_${pole.id}`) {
                        enemy.state = EntityState.IDLE;
                    }
                }
            });

            pole.isContested = heroPresent && enemyCount > 0;
            
            if (pole.isContested) {
                // Stalemate
            } else if (heroPresent) {
                pole.raiseLevel += FLAG_RAISE_SPEED * 1.5; // Hero raises faster
            } else if (enemyCount > 0) {
                pole.raiseLevel -= FLAG_LOWER_SPEED * enemyCount;
            }

            pole.raiseLevel = Math.max(0, Math.min(100, pole.raiseLevel));
            pole.isFullyRaised = pole.raiseLevel >= 100;
            
            totalRaise += pole.raiseLevel;
        });

        // "Sovereignty" based on flags up
        const maxRaise = flagPoles.length * 100;
        const currentSovereignty = (totalRaise / maxRaise) * 100;
        
        if (Math.abs(gameState.current.sovereignty - currentSovereignty) > 1) {
            gameState.current.sovereignty = currentSovereignty;
            onIntegrityUpdate(currentSovereignty);
        }
    }

    // --- ENEMY LOGIC (PROFESSIONALS) ---
    if (isGameRunning) {
        const wave = gameState.current.wave;
        const maxEnemies = 4 + wave;
        
        if (frameCount.current % (SPAWN_RATE / Math.ceil(wave/2)) === 0 && enemies.length < maxEnemies) {
            const spawnRight = Math.random() > 0.5;
            
            // Enemy Type Selection
            let eType = EntityType.ENEMY_LAWYER;
            const rand = Math.random();
            let width = ENEMY_WIDTH;
            let height = ENEMY_HEIGHT;
            let hp = 40 + (wave * 5);
            let scoreVal = 100;
            
            if (rand < 0.33) {
                eType = EntityType.ENEMY_TEACHER;
                scoreVal = 150;
            } else if (rand < 0.66) {
                eType = EntityType.ENEMY_LIBRARIAN;
                scoreVal = 120;
            } else {
                eType = EntityType.ENEMY_LAWYER;
                scoreVal = 200;
            }

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
                color: 'grey',
                isHit: false,
                shoutText: '',
                shoutTimer: 0
            };
            enemies.push(newEnemy);
        }

        enemies.forEach(enemy => {
            if (enemy.state === EntityState.DEAD) return;

            enemy.x += enemy.vx;
            enemy.y += enemy.vy;
            enemy.z += enemy.vz;
            enemy.vz -= GRAVITY;
            if (enemy.z < 0) { enemy.z = 0; enemy.vz = 0; }
            
            enemy.y = Math.max(GROUND_Y_HORIZON, Math.min(GROUND_Y_MAX, enemy.y));
            enemy.x = Math.max(ENEMY_WIDTH/2, Math.min(WORLD_WIDTH - ENEMY_WIDTH/2, enemy.x));

            if (enemy.shoutTimer && enemy.shoutTimer > 0) {
                enemy.shoutTimer--;
                if (enemy.shoutTimer <= 0) enemy.shoutText = undefined;
            } else if (enemy.state !== EntityState.DYING && enemy.state !== EntityState.HURT && enemy.state !== EntityState.PRE_ATTACK) {
                if (Math.random() < 0.003) {
                    const lecture = ["Well, actually...", "Have you read\nthe study?", "Check your\nprivilege", "It's complex", "The data says...", "That's offensive", "I'm calling\nHR"];
                    enemy.shoutText = lecture[Math.floor(Math.random() * lecture.length)];
                    enemy.shoutTimer = 120;
                }
            }

            if (enemy.state === EntityState.PRE_ATTACK) {
                enemy.stateTimer--;
                if (enemy.stateTimer <= 0) {
                    performAttack(enemy, 'PUNCH');
                }
                return;
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

            const distToHeroX = Math.abs(enemy.x - hero.x);
            const distToHeroY = Math.abs(enemy.y - hero.y);

            let targetFlag: FlagPole | null = null;
            let minDist = 9999;
            
            // Prioritize raised flags to lower them
            flagPoles.forEach(pole => {
                if (pole.raiseLevel > 0) {
                    const d = Math.abs(enemy.x - pole.x);
                    if (d < minDist) {
                        minDist = d;
                        targetFlag = pole;
                    }
                }
            });

            // If hero is close, attack hero. Otherwise go for flags.
            if (distToHeroX < 200 && distToHeroY < 100 && hero.health > 0) {
                if (enemy.state === EntityState.ACTION) enemy.state = EntityState.IDLE;
                
                const stopDist = 40;
                if (distToHeroX > stopDist) {
                    enemy.vx = (hero.x - enemy.x > 0 ? 1 : -1) * (WALK_SPEED * 0.5); 
                    enemy.direction = enemy.vx > 0 ? Direction.RIGHT : Direction.LEFT;
                    enemy.state = EntityState.WALK;
                } else {
                    enemy.vx = 0;
                    enemy.direction = hero.x > enemy.x ? Direction.RIGHT : Direction.LEFT;
                    
                    if (enemy.state !== EntityState.PRE_ATTACK && enemy.state !== EntityState.ATTACK && Math.random() < 0.03) {
                        enemy.state = EntityState.PRE_ATTACK;
                        enemy.stateTimer = 20; 
                    }
                }
                
                if (distToHeroY > 5) {
                    enemy.vy = (hero.y - enemy.y > 0 ? 1 : -1) * (WALK_SPEED * 0.3);
                } else {
                    enemy.vy = 0;
                }
            } else if (targetFlag) {
                enemy.targetId = `flag_${targetFlag.id}`;
                const distToObjX = Math.abs(enemy.x - targetFlag.x);

                if (distToObjX < 15) {
                    enemy.vx = 0; enemy.vy = 0;
                    enemy.state = EntityState.ACTION;
                } else {
                    enemy.state = EntityState.WALK;
                    const angle = Math.atan2(targetFlag.y - enemy.y, targetFlag.x - enemy.x);
                    enemy.vx = Math.cos(angle) * (WALK_SPEED * 0.4);
                    enemy.vy = Math.sin(angle) * (WALK_SPEED * 0.4);
                    enemy.direction = enemy.vx > 0 ? Direction.RIGHT : Direction.LEFT;
                }
            } else {
                enemy.state = EntityState.IDLE;
                enemy.vx = 0; enemy.vy = 0;
            }
        });
    }

    for (let i = gameState.current.particles.length - 1; i >= 0; i--) {
        const p = gameState.current.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;
        p.vz -= GRAVITY;
        p.life--;
        if (p.z < 0) { p.z = 0; p.vz *= -0.5; p.vx *= 0.8; p.vy *= 0.8; }
        if (p.life <= 0) gameState.current.particles.splice(i, 1);
    }

    for (let i = gameState.current.pickups.length - 1; i >= 0; i--) {
        const p = gameState.current.pickups[i];
        p.life--;
        if (p.life <= 0) gameState.current.pickups.splice(i, 1);
    }

    gameState.current.enemies = gameState.current.enemies.filter(e => e.state !== EntityState.DEAD);

    if (isGameRunning && hero.health <= 0) {
        gameState.current.gameOver = true;
        onGameOver(false);
    }
    
    // Win Condition
    const allFlagsRaised = gameState.current.flagPoles.every(p => p.raiseLevel >= 100);
    if (isGameRunning && allFlagsRaised && !gameState.current.gameWon) {
        gameState.current.gameWon = true;
        gameState.current.gameOver = true;
        onGameOver(true);
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

    drawEnvironment(ctx, CANVAS_WIDTH, CANVAS_HEIGHT, gameState.current.sovereignty, gameState.current.cameraX);

    ctx.save();
    ctx.translate(-Math.floor(gameState.current.cameraX), 0);

    const allEntities = [gameState.current.hero, ...gameState.current.enemies];
    
    const drawables = [
        ...allEntities.map(e => ({type: 'ENTITY', obj: e, y: e.y})),
        ...gameState.current.pickups.map(p => ({type: 'PICKUP', obj: p, y: p.y})),
        ...gameState.current.flagPoles.map(f => ({type: 'FLAG', obj: f, y: f.y}))
    ];
    drawables.sort((a, b) => a.y - b.y);

    allEntities.forEach(e => drawShadow(ctx, e));
    
    drawables.forEach(d => {
        if (d.type === 'ENTITY') {
            drawEntity(ctx, d.obj as Entity, frameCount.current);
        } else if (d.type === 'PICKUP') {
            drawPickup(ctx, d.obj as Pickup, frameCount.current);
        } else if (d.type === 'FLAG') {
            drawFlagPole(ctx, d.obj as FlagPole, frameCount.current);
        }
    });

    drawParticles(ctx, gameState.current.particles);
    ctx.restore();
    drawForeground(ctx, CANVAS_WIDTH, CANVAS_HEIGHT, gameState.current.cameraX);
  };

  const loop = (timestamp: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = timestamp;
    const deltaTime = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;
    accumulatorRef.current += deltaTime;
    if (accumulatorRef.current > 200) accumulatorRef.current = 200;

    while (accumulatorRef.current >= FIXED_TIME_STEP) {
        update();
        accumulatorRef.current -= FIXED_TIME_STEP;
    }

    render();
    
    if (gameStartedRef.current && Math.abs(gameState.current.hero.health - lastReportedHealth.current) > 0.1) {
        lastReportedHealth.current = gameState.current.hero.health;
        onHealthUpdate(gameState.current.hero.health);
    }

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
      className="block max-w-full max-h-full mx-auto aspect-[4/5] bg-black cursor-none shadow-lg"
      style={{ imageRendering: 'pixelated' }}
    />
  );
};

export default GameCanvas;
