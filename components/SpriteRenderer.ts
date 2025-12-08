
import { Entity, EntityState, EntityType, Direction, Particle, Pickup, FlagPole } from '../types';
import { ATTACK_DURATION, GROUND_Y_HORIZON, WORLD_WIDTH } from '../constants';

// --- 16-BIT PALETTE ---
const COLORS = {
  // Gammon (Player)
  gammonSkin: '#ffab91', // Pinkish
  gammonSkinRed: '#ff5252', // Sunburned
  gammonSkinShadow: '#c62828', // Deep red shadow
  gammonSkinHighlight: '#ffccbc', // Sweaty shine
  pants: '#d7ccc8', // Khaki light
  pantsShadow: '#8d6e63', // Khaki dark
  shirtBlue: '#0d47a1',
  shirtRed: '#b71c1c',
  shirtWhite: '#eceff1',
  
  // Professionals (Enemies)
  profSkin: '#ffccbc',
  profSkinShadow: '#d7ccc8',
  suitDark: '#263238',
  suitLight: '#37474f',
  shirtLightBlue: '#e3f2fd',
  tieRed: '#b71c1c',
  tieBlue: '#0d47a1',
  skirtGrey: '#616161',
  cardiganBeige: '#d7ccc8',
  cardiganBrown: '#8d6e63',
  glassesFrame: '#212121',
  
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

export const drawFlagPole = (ctx: CanvasRenderingContext2D, pole: FlagPole, frame: number) => {
    const { x, y, raiseLevel, isContested } = pole;
    const height = 240;
    const poleWidth = 8;
    
    // Draw Base
    drawRect(ctx, x - 15, y - 10, 30, 20, '#546e7a'); // Concrete base
    drawRect(ctx, x - 10, y - 15, 20, 10, '#455a64');
    
    // Draw Pole
    const grad = ctx.createLinearGradient(x - 4, 0, x + 4, 0);
    grad.addColorStop(0, '#90a4ae');
    grad.addColorStop(0.5, '#cfd8dc');
    grad.addColorStop(1, '#607d8b');
    ctx.fillStyle = grad;
    ctx.fillRect(x - poleWidth/2, y - height, poleWidth, height);
    
    // Draw Top Ball
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(x, y - height, 6, 0, Math.PI * 2);
    ctx.fill();
    
    // Calculate Flag Y position
    const flagHeight = 40;
    const flagMaxY = y - height + 10;
    const flagMinY = y - 40;
    const travelDist = flagMinY - flagMaxY;
    const currentY = flagMinY - (travelDist * (raiseLevel / 100));

    // Draw Flag (Georgian National Flag - The Joke)
    const flagW = 60;
    const flagH = 40;
    const wave = Math.sin((frame * 0.1) + (x * 0.01)) * 5;
    
    ctx.save();
    ctx.translate(x + 4, currentY);
    
    // Flag Shape with Wave
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(flagW, 5 + wave);
    ctx.lineTo(flagW, flagH + 5 + wave);
    ctx.lineTo(0, flagH);
    ctx.closePath();
    ctx.clip(); // Clip drawing to flag shape

    // White Background
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, flagW, flagH + 10);
    
    // Large St George Cross Red
    ctx.fillStyle = '#b71c1c';
    // Vertical
    ctx.fillRect((flagW/2) - 6, 0, 12, flagH + 10);
    // Horizontal
    ctx.fillRect(0, (flagH/2) - 6, flagW, 12);

    // Small Crosses (Bolnisi Crosses - indicating Georgian Flag)
    const drawSmallCross = (cx: number, cy: number) => {
        const size = 6;
        const thickness = 2;
        // Simple cross
        ctx.fillRect(cx - thickness/2, cy - size/2, thickness, size); // Vert
        ctx.fillRect(cx - size/2, cy - thickness/2, size, thickness); // Horiz
    };

    // Draw the 4 small crosses in the quadrants
    const qW = flagW / 4;
    const qH = flagH / 4;
    
    // Positions adjusted for wave distortion approximation
    drawSmallCross(qW, qH + (wave * 0.2));          // Top Left
    drawSmallCross(qW * 3, qH + (wave * 0.8));      // Top Right
    drawSmallCross(qW, qH * 3 + (wave * 0.2));      // Bottom Left
    drawSmallCross(qW * 3, qH * 3 + (wave * 0.8));  // Bottom Right

    // Fabric Shading
    const gradFlag = ctx.createLinearGradient(0,0, flagW, 0);
    gradFlag.addColorStop(0, 'rgba(255,255,255,0.2)');
    gradFlag.addColorStop(0.5, 'rgba(0,0,0,0.05)');
    gradFlag.addColorStop(1, 'rgba(0,0,0,0.1)');
    ctx.fillStyle = gradFlag;
    ctx.fillRect(0, 0, flagW, flagH + 10);

    ctx.restore();

    // Rope
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x - 5, y - height);
    ctx.lineTo(x - 5, currentY + flagH); // To flag bottom
    ctx.lineTo(x - 5, y - 20); // To cleat
    ctx.stroke();

    // Status Indicator
    if (isContested) {
        ctx.font = 'bold 16px "Press Start 2P"';
        ctx.fillStyle = '#ffeb3b';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.strokeText('VS', x - 12, y - height - 20);
        ctx.fillText('VS', x - 12, y - height - 20);
    }
};

// Helper for Union Jack Shirt
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
  
  // Power-up Visuals
  if (speedBoostTimer && speedBoostTimer > 0 && frame % 4 === 0) {
      ctx.save();
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = 'rgba(0, 191, 255, 0.5)';
      const trailX = x - (direction * 15);
      const trailY = y - z;
      ctx.fillRect(trailX - width/2, trailY - height, width, height);
      ctx.restore();
  }

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

  const shakeX = (isHit || state === EntityState.PRE_ATTACK) ? (Math.random() * 4 - 2) : 0;
  const shakeY = isHit ? (Math.random() * 6 - 3) : 0;
  
  const drawX = Math.floor(x + shakeX);
  const drawY = Math.floor(y - z + shakeY); 

  const isMoving = state === EntityState.WALK;
  const speed = Math.sqrt(entity.vx * entity.vx + entity.vy * entity.vy);
  const animSpeed = Math.max(0.1, speed * 0.08); 
  const walkCycle = isMoving ? frame * animSpeed : 0;

  const lFactor = Math.sin(walkCycle);
  const rFactor = Math.sin(walkCycle + Math.PI);
  const bounce = isMoving ? Math.abs(Math.sin(walkCycle)) * 3 : 0;
  
  ctx.save();
  
  if (direction === Direction.LEFT) {
    ctx.translate(drawX * 2, 0);
    ctx.scale(-1, 1);
  }

  const sX = drawX - width / 2;
  const sY = drawY - height;

  if (type === EntityType.PLAYER_GAMMON) {
    // --- PLAYER (THE GAMMON) ---
    
    // Waddle Effect
    const waddle = isMoving ? Math.cos(walkCycle) * 3 : 0;
    const strideLen = 14;
    const lStride = isMoving ? lFactor * strideLen : 0;
    const rStride = isMoving ? rFactor * strideLen : 0;

    const liftH = 8;
    const lLift = isMoving && lFactor > 0 ? Math.sin(walkCycle) * liftH : 0;
    const rLift = isMoving && rFactor > 0 ? Math.sin(walkCycle + Math.PI) * liftH : 0;

    // Legs
    const lLegX = sX + 10 + lStride;
    const lLegY = sY + 60 - lLift;
    drawRect(ctx, lLegX, lLegY, 18, 28, COLORS.pantsShadow);
    drawRect(ctx, lLegX + 4, lLegY, 10, 28, COLORS.pants);
    drawRect(ctx, lLegX, lLegY + 28, 20, 5, '#5d4037'); 

    const rLegX = sX + 32 + rStride;
    const rLegY = sY + 60 - bounce - rLift;
    drawRect(ctx, rLegX, rLegY, 18, 28, COLORS.pants);
    drawRect(ctx, rLegX + 4, rLegY, 8, 28, COLORS.pantsShadow);
    drawRect(ctx, rLegX, rLegY + 28, 20, 5, '#5d4037');

    // Torso (Big Belly)
    const breath = Math.sin(frame * 0.1) * 2;
    const torsoY = sY + 22 + bounce;
    const bellyX = sX + 6 - (breath/2) + waddle; 
    const bellyW = 48 + breath;
    const bellyH = 46;
    
    drawUnionJackShirt(ctx, bellyX, torsoY - 4, bellyW, bellyH, true);
    
    // Belt/Hangover
    drawRect(ctx, bellyX + 4, torsoY + bellyH - 2, bellyW - 8, 4, 'rgba(0,0,0,0.2)');

    // Arms
    const drawFatArm = (ax: number, ay: number, swing: number) => {
         const sx = ax + swing;
         drawRect(ctx, sx, ay, 16, 32, COLORS.gammonSkin);
         drawRect(ctx, sx, ay, 4, 32, COLORS.gammonSkinShadow); 
         drawRect(ctx, sx + 8, ay + 2, 4, 10, COLORS.gammonSkinHighlight); 
         // Fist
         drawRect(ctx, sx - 2, ay + 30, 20, 14, COLORS.gammonSkin);
    };

    // Attack Animation
    if (state === EntityState.ATTACK) {
        const progress = 1 - (stateTimer / ATTACK_DURATION);
        // Punch / Headbutt
        const punchExt = Math.sin(progress * Math.PI) * 20;
        drawFatArm(sX - 4 + waddle + punchExt, torsoY + 6, 0); // Active arm
        drawFatArm(sX + 50 + waddle - (punchExt*0.5), torsoY + 6, 0);
    } else if (state === EntityState.ACTION) {
        // Raising Flag arms
        drawRect(ctx, sX + 40 + waddle, torsoY + 10, 26, 14, COLORS.gammonSkin); // Reaching
        drawRect(ctx, sX - 10 + waddle, torsoY + 10, 26, 14, COLORS.gammonSkin);
    } else {
        const armSwing = isMoving ? Math.sin(walkCycle) * 8 : 0;
        drawFatArm(sX - 6 + waddle, torsoY + 6, -armSwing);
        drawFatArm(sX + 50 + waddle, torsoY + 6, armSwing);
    }

    // Head
    const headY = sY + bounce - 6;
    let headX = sX + 16 + waddle;

    // Neck (thick)
    drawRect(ctx, headX + 2, headY + 22, 26, 8, COLORS.gammonSkinShadow);

    // Face (Red)
    drawRect(ctx, headX, headY, 30, 28, COLORS.gammonSkin);
    // Sunburn Gradient
    drawRect(ctx, headX, headY, 30, 8, COLORS.gammonSkinRed); 
    drawRect(ctx, headX, headY + 8, 30, 4, 'rgba(255, 82, 82, 0.5)'); 
    
    // Features
    drawRect(ctx, headX + 18, headY + 10, 4, 4, '#000'); // Eye
    drawRect(ctx, headX + 14, headY + 7, 12, 3, '#b71c1c'); // Brow
    drawRect(ctx, headX + 24, headY + 14, 6, 8, '#e57373'); // Nose
    
    // Mouth
    if (shoutText) {
        drawRect(ctx, headX + 16, headY + 20, 12, 8, '#3e2723'); // Yelling
        if (frame % 10 === 0) {
            ctx.fillStyle = '#fff'; // Spit
            ctx.fillRect(headX + 28 + (Math.random()*10), headY + 20 + (Math.random()*5), 2, 2);
        }
    } else {
        drawRect(ctx, headX + 16, headY + 22, 10, 2, '#3e2723'); 
    }
    
    // Bald Spot Shine
    drawRect(ctx, headX + 10, headY + 2, 8, 4, 'rgba(255,255,255,0.6)');

  } else {
    // --- ENEMIES (PROFESSIONALS) ---
    
    const strideLen = 12;
    const lStride = isMoving ? lFactor * strideLen : 0;
    const rStride = isMoving ? rFactor * strideLen : 0;

    const liftH = 6;
    const lLift = isMoving && lFactor > 0 ? Math.sin(walkCycle) * liftH : 0;
    const rLift = isMoving && rFactor > 0 ? Math.sin(walkCycle + Math.PI) * liftH : 0;

    // Legs
    const lLegX = sX + 12 + lStride;
    const lLegY = sY + 55 - lLift;
    const rLegX = sX + 28 + rStride;
    const rLegY = sY + 55 - bounce - rLift;

    let legColor = COLORS.suitDark;
    if (type === EntityType.ENEMY_TEACHER) legColor = '#5d4037'; // Corduroys
    if (type === EntityType.ENEMY_LIBRARIAN) legColor = COLORS.skirtGrey;

    drawRect(ctx, lLegX, lLegY, 14, 30, legColor);
    drawRect(ctx, rLegX, rLegY, 14, 30, legColor);
    
    // Torso
    const torsoY = sY + 20 + bounce;
    const torsoX = sX + 8;
    const torsoW = 34;
    const torsoH = 35;

    if (type === EntityType.ENEMY_LAWYER) {
        // Suit
        drawRect(ctx, torsoX, torsoY, torsoW, torsoH, COLORS.suitDark);
        // Shirt Triangle
        drawRect(ctx, torsoX + 12, torsoY, 10, 15, '#fff');
        // Tie
        drawRect(ctx, torsoX + 16, torsoY + 2, 2, 12, COLORS.tieRed);
        // Briefcase hand
        drawRect(ctx, torsoX + 20, torsoY + 25, 20, 14, '#3e2723'); // Case
    } else if (type === EntityType.ENEMY_TEACHER) {
        // Cardigan/Jacket
        drawRect(ctx, torsoX, torsoY, torsoW, torsoH, COLORS.cardiganBrown);
        drawRect(ctx, torsoX + 14, torsoY, 6, 35, COLORS.shirtLightBlue); // Shirt underneath
        // Elbow patches drawn on arms later
    } else {
        // Librarian
        drawRect(ctx, torsoX, torsoY, torsoW, torsoH, COLORS.cardiganBeige);
        // Pearls?
        drawRect(ctx, torsoX + 12, torsoY + 4, 10, 2, '#fff');
    }

    // Arms
    const drawProfArm = (ax: number, ay: number, swing: number) => {
        let sleeveColor = COLORS.suitDark;
        if (type === EntityType.ENEMY_TEACHER) sleeveColor = COLORS.cardiganBrown;
        if (type === EntityType.ENEMY_LIBRARIAN) sleeveColor = COLORS.cardiganBeige;

        drawRect(ctx, ax + swing, ay, 12, 28, sleeveColor);
        drawRect(ctx, ax + swing, ay + 28, 12, 8, COLORS.profSkin); // Hand
        
        if (type === EntityType.ENEMY_TEACHER) {
             drawRect(ctx, ax + swing + 2, ay + 14, 8, 6, '#3e2723'); // Elbow patch
        }
    };

    const armSwing = isMoving ? Math.sin(walkCycle) * 10 : 0;
    
    // Action Logic
    if (state === EntityState.ACTION) {
        // Lowering flag (pulling down)
        drawProfArm(torsoX - 10, torsoY + 5, 0);
        drawProfArm(torsoX + 30, torsoY + 5, 0);
    } else if (state === EntityState.ATTACK) {
        // Throwing / Pointing
        drawProfArm(torsoX + 30, torsoY - 5, 0); // Raised arm
    } else {
        drawProfArm(torsoX - 10, torsoY + 5, -armSwing);
        drawProfArm(torsoX + 30, torsoY + 5, armSwing);
    }

    // Head
    const headY = sY + bounce - 6;
    const headX = sX + 12;

    drawRect(ctx, headX, headY, 26, 26, COLORS.profSkin);
    
    // Hair
    if (type === EntityType.ENEMY_LAWYER) {
        // Neat hair
        drawRect(ctx, headX - 2, headY - 4, 30, 8, '#212121');
        drawRect(ctx, headX + 22, headY, 4, 12, '#212121');
    } else if (type === EntityType.ENEMY_TEACHER) {
        // Messy hair
        drawRect(ctx, headX - 2, headY - 6, 30, 10, '#616161');
        drawRect(ctx, headX - 2, headY, 4, 15, '#616161');
    } else {
        // Librarian Bun
        drawRect(ctx, headX - 2, headY - 4, 30, 8, '#f5f5f5'); // Grey
        drawRect(ctx, headX - 8, headY + 4, 8, 8, '#f5f5f5'); // Bun
    }

    // Glasses
    if (type !== EntityType.ENEMY_LAWYER) {
        drawRect(ctx, headX + 16, headY + 10, 8, 2, COLORS.glassesFrame);
        drawRect(ctx, headX + 22, headY + 10, 2, 2, COLORS.glassesFrame);
    } else {
        drawRect(ctx, headX + 18, headY + 10, 4, 4, '#000'); // Eyes
    }

    // Mouth
    if (shoutText) {
         drawRect(ctx, headX + 18, headY + 20, 6, 4, '#000');
    }
  }

  ctx.restore();
  
  ctx.shadowBlur = 0;
  ctx.shadowColor = 'transparent';

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
    } else if (pickup.type === 'INVINCIBILITY') {
        // Star
        const rot = frame * 0.05;
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
    }
    
    ctx.restore();
};

const drawSpeechBubble = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number) => {
    ctx.font = '16px "Press Start 2P"'; // Slightly smaller font for longer text
    const lineHeight = 22;
    const lines = text.split('\n');
    let maxWidth = 0;
    lines.forEach(line => {
        const m = ctx.measureText(line);
        if (m.width > maxWidth) maxWidth = m.width;
    });

    const padding = 8;
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
};

export const drawEnvironment = (ctx: CanvasRenderingContext2D, width: number, height: number, sovereignty: number, cameraX: number) => {
    // Dynamically calculate horizon
    const horizonY = GROUND_Y_HORIZON;

    // 1. SKY
    const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
    skyGrad.addColorStop(0, COLORS.skyTop);
    skyGrad.addColorStop(0.5, COLORS.skyMid);
    skyGrad.addColorStop(1, COLORS.skyBottom);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, horizonY);

    // 2. CLOUDS
    const t = Date.now() / 10000;
    const cloudScroll = cameraX * 0.2;
    const cloudOffset1 = (t * 20) % width;
    const cloudOffset2 = (t * 40) % width;

    for (let i = 0; i < 3; i++) {
        const cw = 800 * i;
        drawCloud(ctx, 100 + cw + cloudOffset1 - cloudScroll, 50, 1.5);
        drawCloud(ctx, 600 + cw + cloudOffset1 - cloudScroll, 80, 1.2);
        drawCloud(ctx, 350 + cw + cloudOffset2 - cloudScroll, 40, 0.8);
    }

    // 3. FAR BACKGROUND
    const bgScroll = cameraX * 0.5;
    ctx.fillStyle = '#81d4fa'; 
    ctx.beginPath();
    ctx.moveTo(-bgScroll, horizonY);
    for(let i=0; i<=WORLD_WIDTH + width; i+=20) {
        ctx.lineTo(i - bgScroll, horizonY - 20 - Math.random()*15);
    }
    ctx.lineTo(WORLD_WIDTH - bgScroll + width, horizonY);
    ctx.fill();

    // 4. HOUSES & FENCES
    const houseY = horizonY - 140;
    const fenceY = horizonY - 60;
    const startX = Math.floor(cameraX / 300) * 300 - 300;
    const endX = cameraX + width + 300;

    // FENCES
    for(let fx = startX; fx < endX; fx+=30) {
        const drawFx = fx - cameraX;
        drawRect(ctx, drawFx, fenceY, 28, 60, '#795548');
        drawRect(ctx, drawFx + 2, fenceY + 2, 24, 58, '#8d6e63'); 
        drawRect(ctx, drawFx, fenceY + 40, 30, 4, '#5d4037');
    }

    // HOUSES
    for(let hx = startX; hx < endX; hx+=350) {
        const type = (hx / 350) % 2 === 0 ? 'brick' : 'pebble';
        drawSpriteHouse(ctx, hx - cameraX, houseY, type);
    }

    // 6. PAVEMENT & ROAD
    const pavementGrad = ctx.createLinearGradient(0, horizonY, 0, horizonY + 60);
    pavementGrad.addColorStop(0, '#cfd8dc');
    pavementGrad.addColorStop(1, '#b0bec5');
    ctx.fillStyle = pavementGrad;
    ctx.fillRect(0, horizonY, width, 60);
    
    ctx.strokeStyle = '#90a4ae';
    ctx.lineWidth = 2;
    const slabOffset = -(cameraX % 60);
    for (let sx = slabOffset; sx < width; sx += 60) {
        ctx.beginPath(); ctx.moveTo(sx + 30, horizonY); ctx.lineTo(sx, horizonY + 60); ctx.stroke();
    }
    
    drawRect(ctx, 0, horizonY + 60, width, 10, '#eceff1'); 
    drawRect(ctx, 0, horizonY + 70, width, 12, '#546e7a');

    const roadY = horizonY + 82;
    const roadGrad = ctx.createLinearGradient(0, roadY, 0, height);
    roadGrad.addColorStop(0, COLORS.road);
    roadGrad.addColorStop(1, COLORS.roadDark);
    ctx.fillStyle = roadGrad;
    ctx.fillRect(0, roadY, width, height - roadY);
    
    // Litter
    drawLitter(ctx, 150 - cameraX, roadY + 40, 'can');
    drawLitter(ctx, 550 - cameraX, roadY + 140, 'newspaper');
    drawLitter(ctx, 1150 - cameraX, roadY + 60, 'can');
    drawLitter(ctx, 1550 - cameraX, roadY + 120, 'newspaper');
};

const drawSpriteHouse = (ctx: CanvasRenderingContext2D, x: number, y: number, style: 'brick' | 'pebble') => {
    const w = 220;
    const h = 100;
    const mainColor = style === 'brick' ? COLORS.brickRed : COLORS.pebbleDash;
    const shadowColor = style === 'brick' ? COLORS.brickRedDark : COLORS.pebbleDashShadow;

    drawRect(ctx, x, y + 40, w, h, mainColor);
    
    if (style === 'brick') {
        ctx.fillStyle = shadowColor;
        for(let by = y + 45; by < y + 140; by += 12) {
            for(let bx = x; bx < x + w; bx += 18) {
                if ((by/12)%2 === 0) ctx.fillRect(bx, by, 8, 4);
                else ctx.fillRect(bx+9, by, 8, 4);
            }
        }
    }

    ctx.fillStyle = '#3e2723';
    ctx.beginPath();
    ctx.moveTo(x - 10, y + 40);
    ctx.lineTo(x + w + 10, y + 40);
    ctx.lineTo(x + w/2, y - 30);
    ctx.fill();
    
    // Windows
    const drawWin = (wx: number, wy: number) => {
        drawRect(ctx, wx, wy, 50, 40, '#fff'); 
        drawRect(ctx, wx+2, wy+2, 46, 36, COLORS.windowBlue);
        drawRect(ctx, wx+24, wy, 4, 40, '#fff'); 
        drawRect(ctx, wx, wy+24, 50, 4, '#fff');
    };

    drawWin(x + 25, y + 55);
    drawWin(x + 145, y + 55);

    drawRect(ctx, x + 95, y + 80, 30, 60, '#1a237e');
    drawRect(ctx, x + 118, y + 110, 4, 4, '#ffd700'); 
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
    ctx.fillStyle = '#e1f5fe';
    ctx.beginPath();
    ctx.arc(10, 5, 15, 0, Math.PI*2);
    ctx.arc(40, 5, 15, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
};

const drawLitter = (ctx: CanvasRenderingContext2D, x: number, y: number, type: 'can' | 'newspaper') => {
    if (type === 'can') {
        drawRect(ctx, x, y, 8, 6, '#ffd700');
        drawRect(ctx, x+2, y+1, 4, 4, '#b71c1c');
        drawRect(ctx, x, y, 2, 6, 'rgba(0,0,0,0.2)');
    } else {
        ctx.fillStyle = '#fafafa';
        ctx.beginPath();
        ctx.moveTo(x, y); ctx.lineTo(x+12, y-2); ctx.lineTo(x+14, y+8); ctx.lineTo(x+2, y+10);
        ctx.fill();
        ctx.fillStyle = '#212121';
        ctx.fillRect(x+2, y+2, 8, 1);
        ctx.fillRect(x+3, y+4, 8, 1);
    }
};

export const drawForeground = (ctx: CanvasRenderingContext2D, width: number, height: number, cameraX: number) => {
    const fgScroll = cameraX * 1.2;
    const drawBush = (bx: number, by: number, scale: number) => {
        ctx.fillStyle = 'rgba(27, 94, 32, 0.9)'; 
        ctx.beginPath();
        ctx.arc(bx, by, 40 * scale, 0, Math.PI*2);
        ctx.arc(bx + 30*scale, by + 10*scale, 35*scale, 0, Math.PI*2);
        ctx.fill();
    };
    
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
            
            const grad = ctx.createLinearGradient(p.x, p.y - p.z - 10, p.x, p.y - p.z);
            grad.addColorStop(0, '#fff');
            grad.addColorStop(1, p.color);
            ctx.fillStyle = grad;
            ctx.fillText(p.text, p.x, p.y - p.z);
            ctx.restore();
        } else {
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x, p.y - p.z, 3, 3);
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.fillRect(p.x+1, p.y-p.z+1, 1, 1);
        }
    });
};
