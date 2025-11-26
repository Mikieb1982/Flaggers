import { Entity, EntityState, EntityType, Direction, Particle, Pickup } from '../types';
import { ATTACK_DURATION, GROUND_Y_HORIZON, WORLD_WIDTH } from '../constants';

// --- 16-BIT PALETTE ---
const COLORS = {
  // Hero
  skin: '#ffccbc',
  skinShadow: '#dba293', 
  skinHighlight: '#ffe0b2',
  hair: '#4e342e',
  hairMid: '#5d4037',
  hairHighlight: '#8d6e63',
  jeans: '#1565c0', 
  jeansHighlight: '#42a5f5',
  jeansShadow: '#0d47a1',
  vest: '#64b5f6',
  vestHighlight: '#90caf9',
  vestShadow: '#1976d2',
  headband: '#d32f2f',
  headbandLight: '#ff5252',
  
  // Gammon
  gammonSkin: '#ffab91', // Pinkish
  gammonSkinRed: '#ff5252', // Sunburned
  gammonSkinShadow: '#c62828', // Deep red shadow
  gammonSkinHighlight: '#ffccbc', // Sweaty shine
  pants: '#d7ccc8', // Khaki light
  pantsShadow: '#8d6e63', // Khaki dark
  shirtBlue: '#0d47a1',
  shirtRed: '#b71c1c',
  shirtWhite: '#eceff1',

  // Hooligan
  tracksuitGrey: '#9e9e9e',
  tracksuitDark: '#616161',
  
  // Environment
  road: '#37474f', 
  roadLight: '#455a64',
  roadDark: '#263238',
  grass: '#388e3c',
  grassLight: '#66bb6a',
  grassDark: '#1b5e20',
  skyTop: '#1976d2', // Sega Blue
  skyMid: '#4fc3f7',
  skyBottom: '#e1f5fe',
  brickRed: '#a1887f',
  brickRedDark: '#5d4037',
  pebbleDash: '#fff9c4',
  pebbleDashShadow: '#f0f4c3',
  windowBlue: '#81d4fa',
  windowDark: '#0288d1'
};

const drawRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) => {
  ctx.fillStyle = color;
  ctx.fillRect(Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h));
};

export const drawShadow = (ctx: CanvasRenderingContext2D, entity: Entity) => {
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  const scale = Math.max(0.6, 1 - entity.z / 120);
  ctx.ellipse(entity.x, entity.y, entity.width / 2 * scale, 6 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
};

// Helper for Union Jack
const drawUnionJackShirt = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, isBelly: boolean = false) => {
    // Base Blue
    drawRect(ctx, x, y, w, h, COLORS.shirtBlue);
    
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();

    // Diagonals (White then Red)
    ctx.lineWidth = 4;
    ctx.strokeStyle = COLORS.shirtWhite;
    ctx.beginPath();
    ctx.moveTo(x, y); ctx.lineTo(x+w, y+h);
    ctx.moveTo(x+w, y); ctx.lineTo(x, y+h);
    ctx.stroke();

    ctx.lineWidth = 2;
    ctx.strokeStyle = COLORS.shirtRed;
    ctx.beginPath();
    ctx.moveTo(x, y); ctx.lineTo(x+w, y+h);
    ctx.moveTo(x+w, y); ctx.lineTo(x, y+h);
    ctx.stroke();

    // Cross (White then Red)
    const cx = x + w/2;
    const cy = y + h/2;

    drawRect(ctx, cx - 5, y, 10, h, COLORS.shirtWhite); // Vertical White
    drawRect(ctx, x, cy - 5, w, 10, COLORS.shirtWhite); // Horizontal White

    drawRect(ctx, cx - 3, y, 6, h, COLORS.shirtRed); // Vertical Red
    drawRect(ctx, x, cy - 3, w, 6, COLORS.shirtRed); // Horizontal Red

    // Food Stains / Beer Spill
    if (isBelly) {
        ctx.fillStyle = 'rgba(100, 50, 0, 0.3)';
        ctx.beginPath();
        ctx.arc(cx - 5, cy + 10, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx + 8, cy + 5, 2, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();
};

export const drawEntity = (ctx: CanvasRenderingContext2D, entity: Entity, frame: number) => {
  const { x, y, z, width, height, direction, state, type, isHit, shoutText, stateTimer, comboStage, speedBoostTimer, invincibilityTimer } = entity;
  
  // Power-up Visuals: Speed Boost Trail
  if (speedBoostTimer && speedBoostTimer > 0 && frame % 4 === 0) {
      ctx.save();
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = 'rgba(0, 191, 255, 0.5)';
      const trailX = x - (direction * 15);
      const trailY = y - z;
      ctx.fillRect(trailX - width/2, trailY - height, width, height);
      ctx.restore();
  }

  // Invincibility Aura
  if (invincibilityTimer && invincibilityTimer > 0) {
      ctx.save();
      const auraScale = 1 + Math.sin(frame * 0.3) * 0.1;
      ctx.globalAlpha = 0.5;
      
      const grad = ctx.createRadialGradient(x, y - z - height/2, height/3, x, y - z - height/2, height);
      grad.addColorStop(0, 'rgba(255, 215, 0, 0)');
      grad.addColorStop(0.8, 'rgba(255, 215, 0, 0.4)');
      grad.addColorStop(1, 'rgba(255, 255, 224, 0)');
      
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(x, y - z - height/2, (width * 1.2) * auraScale, (height * 0.8) * auraScale, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
  }

  // Hit flash effect
  if (isHit && Math.floor(Date.now() / 50) % 2 === 0) {
      ctx.globalCompositeOperation = 'source-atop';
      ctx.fillStyle = 'white';
      ctx.globalAlpha = 0.7;
  }

  // PRE_ATTACK Telegraph Visuals
  if (state === EntityState.PRE_ATTACK) {
      // Red Outline/Glow
      if (Math.floor(Date.now() / 50) % 2 === 0) {
          ctx.shadowColor = '#d50000';
          ctx.shadowBlur = 10;
      }
      
      // Draw Alert Indicator
      ctx.save();
      ctx.font = 'bold 24px "Press Start 2P"';
      ctx.fillStyle = '#ff0000';
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.strokeText('!', x - 5, y - height - z - 20);
      ctx.fillText('!', x - 5, y - height - z - 20);
      ctx.restore();
  }

  const shakeX = (isHit || state === EntityState.PRE_ATTACK) ? (Math.random() * 4 - 2) : 0;
  const shakeY = isHit ? (Math.random() * 6 - 3) : 0;
  
  const drawX = Math.floor(x + shakeX);
  const drawY = Math.floor(y - z + shakeY); 

  const isMoving = state === EntityState.WALK;
  // Use actual velocity magnitude to scale animation speed
  const speed = Math.sqrt(entity.vx * entity.vx + entity.vy * entity.vy);
  // Default cycle speed if just 'isMoving' but velocity is 0 (shouldn't happen often) or physics disabled
  const animSpeed = Math.max(0.1, speed * 0.08); 
  
  const walkCycle = isMoving ? frame * animSpeed : 0;

  // Stride Factors (-1 to 1)
  const lFactor = Math.sin(walkCycle);
  const rFactor = Math.sin(walkCycle + Math.PI);

  // Bounce: Head bobbing
  const bounce = isMoving ? Math.abs(Math.sin(walkCycle)) * 3 : 0;
  
  ctx.save();
  
  if (direction === Direction.LEFT) {
    ctx.translate(drawX * 2, 0);
    ctx.scale(-1, 1);
  }

  const sX = drawX - width / 2;
  const sY = drawY - height;

  if (type === EntityType.HERO) {
    // ... HERO RENDERING ...
    
    let bodyLean = 0;
    if (state === EntityState.ATTACK) {
        const progress = 1 - (stateTimer / ATTACK_DURATION);
        if (progress > 0.1 && progress < 0.6) bodyLean = 15;
    } else if (isMoving) {
        bodyLean = speed * 1.5; 
    }

    // --- LEGS ---
    const strideLen = 18;
    const lStride = isMoving ? lFactor * strideLen : 0;
    const rStride = isMoving ? rFactor * strideLen : 0;

    const liftH = 10;
    const lLift = isMoving && lFactor > 0 ? Math.sin(walkCycle) * liftH : 0;
    const rLift = isMoving && rFactor > 0 ? Math.sin(walkCycle + Math.PI) * liftH : 0;

    const lLegX = sX + 16 + lStride + (bodyLean * 0.5);
    const lLegY = sY + 55 - lLift; 
    drawRect(ctx, lLegX, lLegY, 14, 32, COLORS.jeansShadow); 
    drawRect(ctx, lLegX + 2, lLegY, 10, 32, COLORS.jeans); 
    drawRect(ctx, lLegX + 4, lLegY, 4, 32, COLORS.jeansHighlight); 
    drawRect(ctx, lLegX - 2, lLegY + 29, 18, 9, '#eeeeee'); 
    drawRect(ctx, lLegX - 2, lLegY + 35, 18, 3, '#bdbdbd'); 

    const rLegX = sX + 30 + rStride + bodyLean;
    const rLegY = sY + 55 - bounce - rLift; 
    drawRect(ctx, rLegX, rLegY, 14, 32, COLORS.jeans);
    drawRect(ctx, rLegX + 4, rLegY, 4, 32, COLORS.jeansHighlight); 
    drawRect(ctx, rLegX - 2, rLegY + 29, 18, 9, '#eeeeee');
    drawRect(ctx, rLegX - 2, rLegY + 35, 18, 3, '#bdbdbd');

    const torsoY = sY + 20 + bounce;
    const torsoX = sX + bodyLean;

    drawRect(ctx, torsoX + 16, torsoY + 30, 26, 6, '#212121');
    drawRect(ctx, torsoX + 26, torsoY + 30, 6, 6, '#ffd700'); 
    
    drawRect(ctx, torsoX + 16, torsoY, 26, 30, COLORS.skin);
    drawRect(ctx, torsoX + 28, torsoY + 14, 2, 16, COLORS.skinShadow);
    drawRect(ctx, torsoX + 22, torsoY + 20, 14, 2, COLORS.skinShadow);
    drawRect(ctx, torsoX + 22, torsoY + 24, 14, 2, COLORS.skinShadow);
    drawRect(ctx, torsoX + 16, torsoY + 12, 26, 2, COLORS.skinShadow);
    drawRect(ctx, torsoX + 18, torsoY + 4, 6, 4, COLORS.skinHighlight);
    drawRect(ctx, torsoX + 34, torsoY + 4, 6, 4, COLORS.skinHighlight);

    drawRect(ctx, torsoX + 8, torsoY - 2, 12, 30, COLORS.vest); 
    drawRect(ctx, torsoX + 10, torsoY + 8, 4, 20, COLORS.vestShadow); 
    
    drawRect(ctx, torsoX + 38, torsoY - 2, 12, 30, COLORS.vest); 
    drawRect(ctx, torsoX + 44, torsoY + 8, 4, 20, COLORS.vestShadow); 

    drawRect(ctx, torsoX + 8, torsoY - 2, 42, 8, COLORS.vest); 
    drawRect(ctx, torsoX + 12, torsoY + 2, 2, 2, '#fff');
    drawRect(ctx, torsoX + 44, torsoY + 2, 2, 2, '#fff');

    const headY = sY + bounce + (bodyLean * 0.2) - 4;
    const headX = sX + (bodyLean * 1.2) + 12;
    
    drawRect(ctx, headX + 6, headY + 20, 14, 6, COLORS.skinShadow);

    drawRect(ctx, headX, headY, 26, 26, COLORS.skin);
    drawRect(ctx, headX + 2, headY + 4, 4, 10, COLORS.skinHighlight); 
    
    const hairFlow = Math.sin(frame * 0.4) * (isMoving ? 6 : 2);
    drawRect(ctx, headX - 6 + hairFlow, headY + 2, 10, 32, COLORS.hair);
    drawRect(ctx, headX - 4 + hairFlow, headY + 4, 6, 28, COLORS.hairMid); 
    
    drawRect(ctx, headX - 2, headY - 8, 30, 10, COLORS.hair);
    drawRect(ctx, headX + 4, headY - 6, 20, 4, COLORS.hairHighlight); 

    drawRect(ctx, headX - 2, headY + 2, 30, 6, COLORS.headband);
    drawRect(ctx, headX + 2, headY + 3, 22, 2, COLORS.headbandLight);
    drawRect(ctx, headX - 8, headY + 6 + hairFlow, 12, 4, COLORS.headband);

    drawRect(ctx, headX + 18, headY + 12, 4, 3, '#1a237e'); 
    drawRect(ctx, headX + 16, headY + 9, 10, 2, '#3e2723'); 
    drawRect(ctx, headX + 16, headY + 21, 8, 2, COLORS.skinShadow); 
    
    if (state === EntityState.ATTACK) {
        const progress = 1 - (stateTimer / ATTACK_DURATION);
        
        const pivX = torsoX + 32;
        const pivY = torsoY + 6;

        ctx.save();
        ctx.translate(pivX, pivY);

        let rotation = 0;
        
        if (comboStage === 1) { 
             if (progress < 0.3) rotation = -1.5;
             else if (progress < 0.6) rotation = 1.0;
             else rotation = 1.0 - ((progress - 0.6) * 2.5);
        } 
        else if (comboStage === 2) { 
             if (progress < 0.3) rotation = -2.5; 
             else if (progress < 0.6) rotation = 1.8; 
             else rotation = 1.8 - ((progress - 0.6) * 3);
        }
        else { 
             if (progress < 0.2) rotation = -1.0; 
             else if (progress < 0.4) rotation = 1.0; 
             else rotation = 1.0 - ((progress - 0.4) * 2);
        }
        
        ctx.rotate(rotation);

        drawRect(ctx, 0, -4, 18, 12, COLORS.skin); 
        drawRect(ctx, 16, -2, 16, 10, COLORS.skin); 
        
        drawRect(ctx, 30, -4, 10, 14, COLORS.skinShadow);

        ctx.translate(34, 4); 
        ctx.rotate(-0.3); 

        const bookW = 28;
        const bookH = 36;
        const bookColor = '#283593'; 
        
        drawRect(ctx, -6, -bookH/2, bookW, bookH, bookColor);
        drawRect(ctx, -6 + bookW, -bookH/2 + 2, 6, bookH - 4, '#fff'); 
        drawRect(ctx, -6 + 2, -bookH/2 + bookH, bookW - 4, 6, '#fff'); 
        drawRect(ctx, -4, -bookH/2 - 2, bookW, bookH, '#3949ab'); 
        drawRect(ctx, -6, -bookH/2, 6, bookH, '#1a237e');
        
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(4, -10, 14, 3);
        ctx.fillRect(4, -4, 10, 2);
        
        ctx.restore();

        if (progress >= 0.2 && progress <= 0.5) {
             ctx.save();
             ctx.translate(pivX, pivY);
             ctx.beginPath();
             const radius = comboStage === 1 ? 65 : 55;
             const startAng = comboStage === 2 ? -2.0 : -1.0;
             const endAng = comboStage === 2 ? 1.0 : 1.8;
             
             ctx.arc(0, 0, radius, startAng, endAng, false);
             ctx.strokeStyle = comboStage === 2 ? '#ffea00' : 'rgba(255, 255, 255, 0.8)';
             ctx.lineWidth = comboStage === 2 ? 8 : 5;
             ctx.stroke();
             ctx.restore();
        }

        drawRect(ctx, torsoX + 18, torsoY + 4, 16, 16, COLORS.skinShadow); 

    } else {
        const armSwingMax = 12;
        const lArmSwing = isMoving ? rFactor * armSwingMax : 0; 
        const rArmSwing = isMoving ? lFactor * armSwingMax : 0; 

        const drawArm = (ax: number, ay: number, swing: number, isRight: boolean) => {
             drawRect(ctx, ax + swing, ay, 14, 18, COLORS.skin); 
             drawRect(ctx, ax + swing + 4, ay + 2, 4, 6, COLORS.skinHighlight); 
             drawRect(ctx, ax + (swing * 1.5), ay + 18, 12, 16, COLORS.skin); 
             drawRect(ctx, ax + (swing * 1.8) - 1, ay + 34, 14, 6, '#212121'); 
             drawRect(ctx, ax + (swing * 1.8) - 1, ay + 40, 14, 10, COLORS.skinShadow); 

             if (isRight) {
                 const hx = ax + (swing * 1.8) + 6;
                 const hy = ay + 45;
                 
                 ctx.save();
                 ctx.translate(hx, hy);
                 ctx.rotate(0.2 - (swing * 0.02)); 

                 const bookW = 24;
                 const bookH = 32;
                 const bookColor = '#283593';
                 
                 drawRect(ctx, -4, -2, bookW, bookH, bookColor);
                 drawRect(ctx, -4 + bookW, 0, 4, bookH - 2, '#fff');
                 drawRect(ctx, -4 + 2, -2 + bookH, bookW - 2, 4, '#fff');
                 drawRect(ctx, -2, -4, bookW, bookH, '#3949ab');
                 drawRect(ctx, -4, -2, 6, bookH, '#1a237e');
                 
                 ctx.fillStyle = '#ffd700';
                 ctx.fillRect(4, 4, 10, 2);
                 ctx.fillRect(4, 10, 8, 2);

                 ctx.restore();
             }
        };

        drawArm(sX + 4, torsoY + 6, lArmSwing, false);
        drawArm(sX + 42, torsoY + 6, rArmSwing, true);
    }

  } else {
    // --- GAMMONS (ALL TYPES) ---
    
    // Waddle Effect
    const waddle = isMoving ? Math.cos(walkCycle) * 3 : 0;
    const strideLen = 12;
    const lStride = isMoving ? lFactor * strideLen : 0;
    const rStride = isMoving ? rFactor * strideLen : 0;

    const liftH = 6;
    const lLift = isMoving && lFactor > 0 ? Math.sin(walkCycle) * liftH : 0;
    const rLift = isMoving && rFactor > 0 ? Math.sin(walkCycle + Math.PI) * liftH : 0;

    // Different Pants for different types
    const pantsColor = type === EntityType.ENEMY_HOOLIGAN ? COLORS.tracksuitGrey : COLORS.pants;
    const pantsShadow = type === EntityType.ENEMY_HOOLIGAN ? COLORS.tracksuitDark : COLORS.pantsShadow;

    // Legs
    const lLegX = sX + (type === EntityType.ENEMY_TANK ? 12 : 8) + lStride;
    const lLegY = sY + (type === EntityType.ENEMY_TANK ? 65 : 60) - lLift;
    drawRect(ctx, lLegX, lLegY, 18, 28, pantsShadow);
    drawRect(ctx, lLegX + 4, lLegY, 10, 28, pantsColor);
    drawRect(ctx, lLegX, lLegY + 28, 20, 5, '#5d4037'); 

    const rLegX = sX + (type === EntityType.ENEMY_TANK ? 45 : 30) + rStride;
    const rLegY = sY + (type === EntityType.ENEMY_TANK ? 65 : 60) - bounce - rLift;
    drawRect(ctx, rLegX, rLegY, 18, 28, pantsColor);
    drawRect(ctx, rLegX + 4, rLegY, 8, 28, pantsShadow);
    drawRect(ctx, rLegX, rLegY + 28, 20, 5, '#5d4037');

    // --- TORSO ---
    const breath = Math.sin(frame * 0.15) * 2;
    const torsoY = sY + 22 + bounce;
    const bellyX = sX + 6 - (breath/2) + waddle; 
    
    if (type === EntityType.ENEMY_TANK) {
        // TANK: Big guy, tight white vest
        const tankW = 70 + breath;
        const tankH = 55;
        const tankX = sX + 4 - (breath/2) + waddle;
        
        // Dirty White Vest
        drawRect(ctx, tankX, torsoY - 8, tankW, tankH, '#fff3e0');
        // Mustard stain
        drawRect(ctx, tankX + 30, torsoY + 20, 10, 8, '#fbc02d');
        // Arm holes
        drawRect(ctx, tankX - 2, torsoY, 8, 20, COLORS.gammonSkin);
        drawRect(ctx, tankX + tankW - 6, torsoY, 8, 20, COLORS.gammonSkin);
        
        // Arms (Huge)
        const drawTankArm = (ax: number, ay: number, swing: number) => {
            drawRect(ctx, ax + swing, ay, 20, 36, COLORS.gammonSkin);
            drawRect(ctx, ax + swing, ay + 10, 20, 4, COLORS.gammonSkinShadow); // Muscle def?
            drawRect(ctx, ax + swing - 2, ay + 36, 24, 14, COLORS.gammonSkin); // Fist
        };
        const armSwing = isMoving ? Math.sin(walkCycle) * 8 : 0;
        drawTankArm(tankX - 12, torsoY, -armSwing);
        drawTankArm(tankX + tankW - 8, torsoY, armSwing);

    } else if (type === EntityType.ENEMY_HOOLIGAN) {
        // HOOLIGAN: Grey Tracksuit Hoodie
        const hooliW = 38 + breath;
        const hooliH = 42;
        
        drawRect(ctx, bellyX, torsoY - 2, hooliW, hooliH, COLORS.tracksuitGrey);
        drawRect(ctx, bellyX + 10, torsoY + 10, hooliW - 20, 20, '#bdbdbd'); // Pocket
        // Zip
        drawRect(ctx, bellyX + (hooliW/2) - 1, torsoY - 2, 2, 20, '#eeeeee');

        // Arms (Sleeves)
        const drawHooliArm = (ax: number, ay: number, swing: number) => {
            drawRect(ctx, ax + swing, ay, 12, 30, COLORS.tracksuitGrey);
            drawRect(ctx, ax + swing, ay + 28, 12, 4, COLORS.tracksuitDark); // Cuff
            drawRect(ctx, ax + swing, ay + 32, 12, 10, COLORS.gammonSkin); // Hand
        };
        const armSwing = isMoving ? Math.sin(walkCycle) * 10 : 0;
        drawHooliArm(bellyX - 8, torsoY + 2, -armSwing);
        drawHooliArm(bellyX + hooliW - 4, torsoY + 2, armSwing);

    } else {
        // STANDARD GAMMON
        const bellyW = 44 + breath;
        const bellyH = 46;
        drawUnionJackShirt(ctx, bellyX, torsoY - 4, bellyW, bellyH, true);
        drawRect(ctx, bellyX + 4, torsoY + bellyH - 2, bellyW - 8, 4, 'rgba(0,0,0,0.2)');
        
        const drawFatArm = (ax: number, ay: number, swing: number) => {
             const sx = ax + swing;
             drawRect(ctx, sx, ay, 14, 32, COLORS.gammonSkin);
             drawRect(ctx, sx, ay, 4, 32, COLORS.gammonSkinShadow); 
             drawRect(ctx, sx + 8, ay + 2, 4, 10, COLORS.gammonSkinHighlight); 
             drawRect(ctx, sx - 2, ay + 30, 18, 12, COLORS.gammonSkin);
        };

        if (state === EntityState.ACTION) {
            drawRect(ctx, sX + 40 + waddle, torsoY + 10, 26, 14, COLORS.gammonSkin);
            drawRect(ctx, sX + 66 + waddle, torsoY + 8, 10, 16, COLORS.gammonSkinShadow); 
            if (type === EntityType.ENEMY_PAINTER) {
                 drawRect(ctx, sX + 70 + waddle, torsoY + 6, 6, 20, '#bdbdbd');
                 drawRect(ctx, sX + 70 + waddle, torsoY + 26, 8, 10, '#d50000'); 
            }
        } else {
            const armSwing = isMoving ? Math.sin(walkCycle) * 6 : 0;
            drawFatArm(sX - 4 + waddle, torsoY + 6, -armSwing);
            drawFatArm(sX + 46 + waddle, torsoY + 6, armSwing);
        }
    }

    // --- HEAD ---
    const headY = sY + bounce - 6;
    let headX = sX + 16 + waddle;
    
    if (type === EntityType.ENEMY_TANK) headX += 10;
    if (type === EntityType.ENEMY_HOOLIGAN) headX -= 2;

    // Neck
    drawRect(ctx, headX + 4, headY + 22, 22, 8, COLORS.gammonSkinShadow);

    // Face
    drawRect(ctx, headX, headY, 30, 28, COLORS.gammonSkin);
    
    if (type === EntityType.ENEMY_HOOLIGAN) {
        // Baseball Cap
        drawRect(ctx, headX - 2, headY - 4, 34, 10, '#212121'); // Cap Dome
        drawRect(ctx, headX - 8, headY + 4, 14, 4, '#212121'); // Peak (Side view ish)
        // Shadow under cap
        drawRect(ctx, headX, headY + 6, 30, 4, 'rgba(0,0,0,0.3)');
    } else {
        // Sunburn Gradient
        drawRect(ctx, headX, headY, 30, 8, COLORS.gammonSkinRed); 
        drawRect(ctx, headX, headY + 8, 30, 4, 'rgba(255, 82, 82, 0.5)'); 
        // Bald Spot
        drawRect(ctx, headX + 18, headY + 2, 8, 4, 'rgba(255,255,255,0.6)');
    }
    
    // Features
    drawRect(ctx, headX + 18, headY + 10, 4, 4, '#000'); // Eye
    drawRect(ctx, headX + 14, headY + 7, 12, 3, '#b71c1c'); // Brow
    
    if (type === EntityType.ENEMY_TANK && frame % 60 < 30) {
        // Vein popping
        drawRect(ctx, headX + 26, headY + 6, 2, 6, '#b71c1c');
        drawRect(ctx, headX + 24, headY + 8, 6, 2, '#b71c1c');
    }

    if (shoutText) {
        drawRect(ctx, headX + 16, headY + 18, 12, 8, '#3e2723'); // Yelling
        if (frame % 10 === 0) {
            ctx.fillStyle = '#fff';
            ctx.fillRect(headX + 28 + (Math.random()*10), headY + 20 + (Math.random()*5), 2, 2);
        }
    } else {
        drawRect(ctx, headX + 18, headY + 20, 10, 2, '#3e2723'); 
        drawRect(ctx, headX + 18, headY + 24, 8, 2, '#3e2723'); 
    }
  }
  
  ctx.restore();
  
  // Clear shadow blur from Telegraph if it was set
  ctx.shadowBlur = 0;
  ctx.shadowColor = 'transparent';

  // Reset opacity if hit flash or Power-ups
  if (isHit || (speedBoostTimer && speedBoostTimer > 0) || (invincibilityTimer && invincibilityTimer > 0)) {
      ctx.globalAlpha = 1.0;
      ctx.globalCompositeOperation = 'source-over';
  }

  if (shoutText) {
      drawSpeechBubble(ctx, shoutText, drawX, drawY - height - 10);
  }
};

export const drawPickup = (ctx: CanvasRenderingContext2D, pickup: Pickup, frame: number) => {
    const { x, y, z } = pickup;
    // Hover animation
    const hover = Math.sin(frame * 0.1) * 5;
    const dy = y - z - hover;
    
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(x, y, 15, 6, 0, 0, Math.PI*2);
    ctx.fill();

    ctx.save();
    ctx.translate(x, dy);
    
    if (pickup.type === 'TEA') {
        // Mug of Tea
        // Body
        drawRect(ctx, -10, -20, 20, 24, '#fff');
        // Tea liquid
        drawRect(ctx, -8, -18, 16, 20, '#795548'); 
        // Handle
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 4;
        ctx.beginPath(); ctx.arc(10, -10, 6, -Math.PI/2, Math.PI/2); ctx.stroke();
        
        // Steam
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        const steamX = Math.sin(frame*0.2) * 4;
        drawRect(ctx, steamX - 2, -30 - (frame%20), 4, 6, '#fff');
    } else if (pickup.type === 'CRUMPET') {
        // Crumpet
        // Base
        ctx.fillStyle = '#fbc02d'; // Golden
        ctx.beginPath(); ctx.ellipse(0, -10, 12, 8, 0, 0, Math.PI*2); ctx.fill();
        // Holes
        ctx.fillStyle = '#f57f17'; // Darker
        drawRect(ctx, -4, -12, 2, 2, '#f57f17');
        drawRect(ctx, 4, -10, 2, 2, '#f57f17');
        drawRect(ctx, 0, -8, 2, 2, '#f57f17');
        
        // Shine
        if (frame % 30 < 10) {
            ctx.fillStyle = '#fff';
            ctx.globalAlpha = 0.8;
            ctx.beginPath(); ctx.arc(-5, -12, 2, 0, Math.PI*2); ctx.fill();
            ctx.globalAlpha = 1.0;
        }
    } else if (pickup.type === 'SPEED') {
        // Speed Bolt
        ctx.fillStyle = '#00b0ff';
        // Bolt shape
        ctx.beginPath();
        ctx.moveTo(4, -20);
        ctx.lineTo(-6, -6);
        ctx.lineTo(2, -4);
        ctx.lineTo(-4, 10);
        ctx.lineTo(8, -4);
        ctx.lineTo(0, -6);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        if (frame % 10 < 5) {
            ctx.shadowColor = '#00b0ff';
            ctx.shadowBlur = 10;
            ctx.stroke();
            ctx.shadowBlur = 0;
        }
    } else if (pickup.type === 'INVINCIBILITY') {
        // Star / Shield
        const rot = frame * 0.05;
        
        // Spinning Star
        ctx.save();
        ctx.translate(0, -10);
        ctx.rotate(rot);
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            ctx.lineTo(Math.cos((18 + i * 72) / 180 * Math.PI) * 12,
                        -Math.sin((18 + i * 72) / 180 * Math.PI) * 12);
            ctx.lineTo(Math.cos((54 + i * 72) / 180 * Math.PI) * 5,
                        -Math.sin((54 + i * 72) / 180 * Math.PI) * 5);
        }
        ctx.closePath();
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#fff';
        ctx.stroke();
        ctx.restore();

        // Pulsing Ring
        const ringScale = 1 + Math.sin(frame * 0.2) * 0.2;
        ctx.strokeStyle = '#ffeb3b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, -10, 16 * ringScale, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    ctx.restore();
};

const drawSpeechBubble = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number) => {
    ctx.font = '20px "Press Start 2P"'; // Bigger Font
    const lineHeight = 28;
    const lines = text.split('\n');
    let maxWidth = 0;
    lines.forEach(line => {
        const m = ctx.measureText(line);
        if (m.width > maxWidth) maxWidth = m.width;
    });

    const padding = 12;
    const w = maxWidth + padding * 2;
    const h = (lines.length * lineHeight) + padding + 6;
    
    const bx = x - w/2;
    const by = y - h;

    // Drop Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(bx + 4, by + 4, w, h);

    // Bubble
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    ctx.rect(bx, by, w, h);
    ctx.fill();
    ctx.stroke();

    // Text
    ctx.fillStyle = '#000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    
    lines.forEach((line, index) => {
        ctx.fillText(line, x, by + padding + (index * lineHeight));
    });

    // Pointer
    ctx.beginPath();
    ctx.moveTo(x, by + h);
    ctx.lineTo(x + 8, by + h + 12);
    ctx.lineTo(x + 16, by + h);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.stroke();
    
    // Clean up stroke overlap
    ctx.fillRect(x + 1, by + h - 2, 14, 4);
};

export const drawEnvironment = (ctx: CanvasRenderingContext2D, width: number, height: number, integrity: number, cameraX: number) => {
    // Dynamically calculate horizon
    const horizonY = GROUND_Y_HORIZON;

    // 1. SKY (Gradient - Static, no scroll)
    const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
    skyGrad.addColorStop(0, COLORS.skyTop);
    skyGrad.addColorStop(0.5, COLORS.skyMid);
    skyGrad.addColorStop(1, COLORS.skyBottom);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, horizonY);

    // 2. CLOUDS (Parallax Layer 1 - Slow Scroll)
    const t = Date.now() / 10000;
    const cloudScroll = cameraX * 0.2; // 20% scroll speed
    const cloudOffset1 = (t * 20) % width;
    const cloudOffset2 = (t * 40) % width;

    // Draw multiple sets to cover world
    for (let i = 0; i < 3; i++) {
        const cw = 800 * i;
        drawCloud(ctx, 100 + cw + cloudOffset1 - cloudScroll, 50, 1.5);
        drawCloud(ctx, 600 + cw + cloudOffset1 - cloudScroll, 80, 1.2);
        drawCloud(ctx, 350 + cw + cloudOffset2 - cloudScroll, 40, 0.8);
    }

    // 3. FAR BACKGROUND (Trees - Mid scroll)
    const bgScroll = cameraX * 0.5;
    ctx.fillStyle = '#81d4fa'; 
    ctx.beginPath();
    ctx.moveTo(-bgScroll, horizonY);
    for(let i=0; i<=WORLD_WIDTH + width; i+=20) {
        ctx.lineTo(i - bgScroll, horizonY - 20 - Math.random()*15);
    }
    ctx.lineTo(WORLD_WIDTH - bgScroll + width, horizonY);
    ctx.fill();

    // 4. HOUSES & FENCES (World Layer - 1:1 Scroll)
    const houseY = horizonY - 140;
    const fenceY = horizonY - 60;
    
    // Only draw what's visible
    const startX = Math.floor(cameraX / 300) * 300 - 300;
    const endX = cameraX + width + 300;

    // FENCES
    for(let fx = startX; fx < endX; fx+=30) {
        const drawFx = fx - cameraX;
        drawRect(ctx, drawFx, fenceY, 28, 60, '#795548');
        drawRect(ctx, drawFx + 2, fenceY + 2, 24, 58, '#8d6e63'); 
        drawRect(ctx, drawFx, fenceY + 40, 30, 4, '#5d4037');
        
        if (fx % 210 === 0) {
            ctx.font = '10px Arial';
            ctx.fillStyle = '#e91e63';
            ctx.fillText('WOZ ERE', drawFx + 5, fenceY + 30);
        }
    }

    // HOUSES
    for(let hx = startX; hx < endX; hx+=350) {
        const type = (hx / 350) % 2 === 0 ? 'brick' : 'pebble';
        drawSpriteHouse(ctx, hx - cameraX, houseY, type);
    }

    // MANICURED HEDGES
    const hedgeY = horizonY - 45;
    drawRect(ctx, 0, hedgeY, width, 45, COLORS.grassDark); // Base fill for gaps
    for(let i=startX; i<endX; i+=15) {
        const drawHx = i - cameraX;
        ctx.fillStyle = COLORS.grass;
        ctx.beginPath();
        ctx.arc(drawHx + 7, hedgeY, 10, 0, Math.PI, true);
        ctx.fill();
        ctx.fillRect(drawHx, hedgeY, 15, 45);
        ctx.fillStyle = COLORS.grassLight;
        ctx.fillRect(drawHx + 4, hedgeY + 5, 2, 2);
    }

    // 6. PAVEMENT & ROAD (World Scroll)
    // Pavement
    const pavementGrad = ctx.createLinearGradient(0, horizonY, 0, horizonY + 60);
    pavementGrad.addColorStop(0, '#cfd8dc');
    pavementGrad.addColorStop(1, '#b0bec5');
    ctx.fillStyle = pavementGrad;
    ctx.fillRect(0, horizonY, width, 60);
    
    ctx.strokeStyle = '#90a4ae';
    ctx.lineWidth = 2;
    // Pavement Slabs
    const slabOffset = -(cameraX % 60);
    for (let sx = slabOffset; sx < width; sx += 60) {
        ctx.beginPath(); ctx.moveTo(sx + 30, horizonY); ctx.lineTo(sx, horizonY + 60); ctx.stroke();
    }
    
    // Curb
    drawRect(ctx, 0, horizonY + 60, width, 10, '#eceff1'); 
    drawRect(ctx, 0, horizonY + 70, width, 12, '#546e7a');

    // Road
    const roadY = horizonY + 82;
    const roadGrad = ctx.createLinearGradient(0, roadY, 0, height);
    roadGrad.addColorStop(0, COLORS.road);
    roadGrad.addColorStop(1, COLORS.roadDark);
    ctx.fillStyle = roadGrad;
    ctx.fillRect(0, roadY, width, height - roadY);
    
    // Road Texture
    ctx.fillStyle = '#263238';
    for(let i=0; i<100; i++) {
        // Pseudo-random noise that scrolls
        const rx = ((i * 47) + (cameraX * 0.8)) % width; 
        const ry = roadY + (i * 31) % (height - roadY);
        // Inverse scroll direction for texture to feel grounded? No, just move texture opposite to camera
        const drawRx = ((i * 47) - cameraX) % width;
        // Fix wrap
        const wrapRx = drawRx < 0 ? drawRx + width : drawRx;
        ctx.fillRect(wrapRx, ry, 4, 2);
    }

    // Road Markings
    ctx.fillStyle = '#eceff1';
    drawRect(ctx, 0, roadY + 90, width, 8, '#eceff1'); // Continuous line for now

    // Litter
    drawLitter(ctx, 150 - cameraX, roadY + 40, 'can');
    drawLitter(ctx, 550 - cameraX, roadY + 140, 'newspaper');
    drawLitter(ctx, 1150 - cameraX, roadY + 60, 'can');
    drawLitter(ctx, 1550 - cameraX, roadY + 120, 'newspaper');

    // Props (Static World Objects)
    // We pass manually calculated screen coords since this function handles the environment layer
    drawLampPost(ctx, 1100 - cameraX, horizonY + 40, integrity);
    drawRoundabout(ctx, 2200 - cameraX, roadY + 140, integrity);
};

// ... (Keep drawSpriteHouse, drawCloud, drawLitter, drawLampPost, drawRoundabout exactly as is) ...
const drawSpriteHouse = (ctx: CanvasRenderingContext2D, x: number, y: number, style: 'brick' | 'pebble') => {
    const w = 220;
    const h = 100;
    const mainColor = style === 'brick' ? COLORS.brickRed : COLORS.pebbleDash;
    const shadowColor = style === 'brick' ? COLORS.brickRedDark : COLORS.pebbleDashShadow;

    // Walls
    drawRect(ctx, x, y + 40, w, h, mainColor);
    
    // Texture
    if (style === 'brick') {
        ctx.fillStyle = shadowColor;
        for(let by = y + 45; by < y + 140; by += 12) {
            for(let bx = x; bx < x + w; bx += 18) {
                if ((by/12)%2 === 0) ctx.fillRect(bx, by, 8, 4);
                else ctx.fillRect(bx+9, by, 8, 4);
            }
        }
    } else {
        ctx.fillStyle = shadowColor;
        for(let i=0; i<400; i++) {
            ctx.fillRect(x + Math.random()*w, y + 40 + Math.random()*h, 2, 2);
        }
    }

    // Roof (Tiled)
    ctx.fillStyle = '#3e2723';
    ctx.beginPath();
    ctx.moveTo(x - 10, y + 40);
    ctx.lineTo(x + w + 10, y + 40);
    ctx.lineTo(x + w/2, y - 30);
    ctx.fill();
    // Roof tiles
    ctx.strokeStyle = '#5d4037';
    ctx.beginPath();
    for(let r=0; r<6; r++) {
        const ry = y - 30 + (r * 12);
        ctx.moveTo(x - 10 + (r*(-5)), ry);
        ctx.lineTo(x + w + 10 - (r*(-5)), ry);
    }
    ctx.stroke();

    // Windows
    const drawWin = (wx: number, wy: number) => {
        drawRect(ctx, wx, wy, 50, 40, '#fff'); // Frame
        drawRect(ctx, wx+2, wy+2, 46, 36, COLORS.windowBlue); // Glass
        // Frame Cross
        drawRect(ctx, wx+24, wy, 4, 40, '#fff'); 
        drawRect(ctx, wx, wy+24, 50, 4, '#fff');
        // Reflection
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.beginPath();
        ctx.moveTo(wx+4, wy+34); ctx.lineTo(wx+15, wy+4); ctx.lineTo(wx+30, wy+4);
        ctx.fill();
    };

    drawWin(x + 25, y + 55);
    drawWin(x + 145, y + 55);

    // Door
    drawRect(ctx, x + 95, y + 80, 30, 60, '#1a237e'); // Blue door
    drawRect(ctx, x + 95, y + 80, 2, 60, '#fff'); // Frame
    drawRect(ctx, x + 123, y + 80, 2, 60, '#fff');
    drawRect(ctx, x + 118, y + 110, 4, 4, '#ffd700'); // Brass Knob
    
    // Hanging Basket
    ctx.fillStyle = '#8d6e63';
    ctx.beginPath(); ctx.arc(x+105, y+60, 6, 0, Math.PI, false); ctx.fill();
    ctx.fillStyle = '#e91e63'; // Flowers
    ctx.beginPath(); ctx.arc(x+105, y+58, 8, 0, Math.PI*2); ctx.fill();
};

const drawCloud = (ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(0, 0, 20, 0, Math.PI * 2);
    ctx.arc(25, -10, 30, 0, Math.PI * 2);
    ctx.arc(50, 0, 20, 0, Math.PI * 2);
    ctx.fill();
    // Shading bottom
    ctx.fillStyle = '#e1f5fe';
    ctx.beginPath();
    ctx.arc(10, 5, 15, 0, Math.PI*2);
    ctx.arc(40, 5, 15, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
};

const drawLitter = (ctx: CanvasRenderingContext2D, x: number, y: number, type: 'can' | 'newspaper') => {
    if (type === 'can') {
        drawRect(ctx, x, y, 8, 6, '#ffd700'); // Gold can
        drawRect(ctx, x+2, y+1, 4, 4, '#b71c1c'); // Logo
        drawRect(ctx, x, y, 2, 6, 'rgba(0,0,0,0.2)'); // Shadow
    } else {
        // Newspaper
        ctx.fillStyle = '#fafafa';
        ctx.beginPath();
        ctx.moveTo(x, y); ctx.lineTo(x+12, y-2); ctx.lineTo(x+14, y+8); ctx.lineTo(x+2, y+10);
        ctx.fill();
        ctx.fillStyle = '#212121'; // Text lines
        ctx.fillRect(x+2, y+2, 8, 1);
        ctx.fillRect(x+3, y+4, 8, 1);
    }
};

const drawLampPost = (ctx: CanvasRenderingContext2D, x: number, y: number, integrity: number) => {
    // Detailed Post
    const grad = ctx.createLinearGradient(x, 0, x+12, 0);
    grad.addColorStop(0, '#90a4ae');
    grad.addColorStop(0.5, '#cfd8dc');
    grad.addColorStop(1, '#607d8b');
    ctx.fillStyle = grad;
    ctx.fillRect(x, y-220, 12, 220);

    // Base Box
    drawRect(ctx, x - 8, y - 30, 28, 40, '#546e7a');
    drawRect(ctx, x - 6, y - 28, 24, 36, '#607d8b'); // Panel

    // Lamp Head
    ctx.fillStyle = '#eceff1';
    ctx.beginPath();
    ctx.moveTo(x - 5, y - 220);
    ctx.lineTo(x + 50, y - 230);
    ctx.lineTo(x + 50, y - 210);
    ctx.lineTo(x - 5, y - 200);
    ctx.fill();
    
    // Light Bulb/Glow
    ctx.fillStyle = '#fff9c4';
    ctx.beginPath();
    ctx.arc(x + 35, y - 215, 8, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.shadowColor = '#fff176';
    ctx.shadowBlur = 30;
    ctx.beginPath(); ctx.arc(x + 35, y - 215, 12, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;

    // St George Flag
    if (integrity < 90) {
        const flagX = x + 12;
        const flagY = y - 180;
        const wave = Math.sin(Date.now() / 150) * 8;
        
        ctx.save();
        ctx.translate(flagX, flagY);
        
        // Flag Shadow on post
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(-2, 5, 4, 30);

        // Flag Shape
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(0,0);
        ctx.bezierCurveTo(20, -5+wave, 40, 5+wave, 65, 0);
        ctx.lineTo(65, 45);
        ctx.bezierCurveTo(40, 50+wave, 20, 40+wave, 0, 45);
        ctx.fill();
        
        // Texture shading (fabric folds)
        const gradFlag = ctx.createLinearGradient(0,0,65,0);
        gradFlag.addColorStop(0, 'rgba(255,255,255,0)');
        gradFlag.addColorStop(0.5, 'rgba(0,0,0,0.05)');
        gradFlag.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = gradFlag;
        ctx.fill();

        ctx.lineWidth = 1;
        ctx.strokeStyle = '#bdbdbd';
        ctx.stroke();

        // Cross
        ctx.fillStyle = '#d32f2f';
        ctx.beginPath();
        // Vertical
        ctx.moveTo(28, -2+wave); ctx.lineTo(38, -2+wave); ctx.lineTo(38, 47+wave); ctx.lineTo(28, 47+wave);
        ctx.fill();
        // Horizontal
        ctx.beginPath();
        ctx.moveTo(0, 18);
        ctx.bezierCurveTo(20, 13+wave, 40, 23+wave, 65, 18);
        ctx.lineTo(65, 28);
        ctx.bezierCurveTo(40, 33+wave, 20, 23+wave, 0, 28);
        ctx.fill();
        ctx.restore();
    }
};

const drawRoundabout = (ctx: CanvasRenderingContext2D, x: number, y: number, integrity: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(1, 0.55);

    // Concrete Ring 3D
    const grad = ctx.createRadialGradient(0,0,80, 0,0,95);
    grad.addColorStop(0, '#f5f5f5');
    grad.addColorStop(0.5, '#e0e0e0');
    grad.addColorStop(1, '#bdbdbd');
    ctx.fillStyle = grad;
    
    ctx.beginPath();
    ctx.arc(0, 0, 95, 0, Math.PI * 2);
    ctx.fill();
    
    // Outer rim dark
    ctx.strokeStyle = '#616161';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Inner Surface (Asphalt/Concrete mix)
    ctx.fillStyle = '#757575'; 
    ctx.beginPath();
    ctx.arc(0, 0, 80, 0, Math.PI * 2);
    ctx.fill();
    
    // Texture on inner
    ctx.fillStyle = '#616161';
    for(let i=0; i<30; i++) {
        ctx.fillRect((Math.random()-0.5)*140, (Math.random()-0.5)*140, 4, 4);
    }

    // Red X
    if (integrity < 70) {
        ctx.rotate(Math.PI / 4);
        // Paint Strokes (Messy)
        ctx.fillStyle = '#d32f2f';
        for(let i=0; i<5; i++) {
            drawRect(ctx, -60 - Math.random()*5, -12 + Math.random()*4, 120, 20, '#b71c1c');
            drawRect(ctx, -12 + Math.random()*4, -60 - Math.random()*5, 20, 120, '#b71c1c');
        }
        
        // Fresh Paint Shine
        ctx.fillStyle = '#ff8a80';
        drawRect(ctx, -30, -8, 20, 4, 'rgba(255, 138, 128, 0.4)');

        // Paint Bucket
        ctx.rotate(-Math.PI / 4); // Reset rot
        ctx.fillStyle = '#bdbdbd';
        ctx.fillRect(50, 20, 14, 14);
        ctx.fillStyle = '#b71c1c'; // Spilled paint
        ctx.beginPath(); ctx.arc(65, 30, 10, 0, Math.PI*2); ctx.fill();
    }

    ctx.restore();
};

export const drawForeground = (ctx: CanvasRenderingContext2D, width: number, height: number, cameraX: number) => {
    // Parallax Foreground Bushes (Faster scroll)
    const fgScroll = cameraX * 1.2;

    const drawBush = (bx: number, by: number, scale: number) => {
        ctx.fillStyle = 'rgba(27, 94, 32, 0.9)'; // Dark green
        ctx.beginPath();
        ctx.arc(bx, by, 40 * scale, 0, Math.PI*2);
        ctx.arc(bx + 30*scale, by + 10*scale, 35*scale, 0, Math.PI*2);
        ctx.fill();
    };
    
    // Draw bushes periodically based on camera
    const startX = Math.floor(cameraX / 500) * 500;
    for(let i=startX; i<startX + width + 500; i+=500) {
        drawBush(i - fgScroll, height + 15, 1.4);
        drawBush(i + 400 - fgScroll, height + 20, 1.3);
    }
};

export const drawParticles = (ctx: CanvasRenderingContext2D, particles: Particle[]) => {
    particles.forEach(p => {
        if (p.text) {
            ctx.save();
            ctx.font = 'bold 24px "Press Start 2P"';
            ctx.lineWidth = 4;
            ctx.strokeStyle = '#000';
            ctx.strokeText(p.text, p.x, p.y - p.z);
            
            // Gradient Text
            const grad = ctx.createLinearGradient(p.x, p.y - p.z - 10, p.x, p.y - p.z);
            grad.addColorStop(0, '#fff');
            grad.addColorStop(1, p.color);
            ctx.fillStyle = grad;
            ctx.fillText(p.text, p.x, p.y - p.z);
            ctx.restore();
        } else {
            // Spark/Dust
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x, p.y - p.z, 3, 3);
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.fillRect(p.x+1, p.y-p.z+1, 1, 1);
        }
    });
};