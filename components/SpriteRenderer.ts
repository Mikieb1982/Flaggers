
import { Entity, EntityState, EntityType, Direction, Particle } from '../types';
import { ATTACK_DURATION } from '../constants';

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
  const { x, y, z, width, height, direction, state, type, isHit, shoutText, stateTimer } = entity;
  
  // Hit flash effect
  if (isHit && Math.floor(Date.now() / 50) % 2 === 0) {
      ctx.globalCompositeOperation = 'source-atop';
      ctx.fillStyle = 'white';
      ctx.globalAlpha = 0.7;
  }

  const shakeX = isHit ? (Math.random() * 6 - 3) : 0;
  const shakeY = isHit ? (Math.random() * 6 - 3) : 0;
  
  const drawX = Math.floor(x + shakeX);
  const drawY = Math.floor(y - z + shakeY); 

  const isMoving = state === EntityState.WALK;
  // Use actual velocity magnitude to scale animation speed
  // Max speed is approx 5.5 (WALK_SPEED)
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
    // --- HERO (16-BIT STYLE) ---
    
    let bodyLean = 0;
    if (state === EntityState.ATTACK) {
        const progress = 1 - (stateTimer / ATTACK_DURATION);
        if (progress > 0.1 && progress < 0.6) bodyLean = 15;
    } else if (isMoving) {
        bodyLean = speed * 1.5; // Lean into the run
    }

    // --- LEGS ---
    const strideLen = 18;
    const lStride = isMoving ? lFactor * strideLen : 0;
    const rStride = isMoving ? rFactor * strideLen : 0;

    // Lift foot when moving forward (factor > 0)
    // We max(0, factor) to only lift during the forward swing
    const liftH = 10;
    const lLift = isMoving && lFactor > 0 ? Math.sin(walkCycle) * liftH : 0;
    const rLift = isMoving && rFactor > 0 ? Math.sin(walkCycle + Math.PI) * liftH : 0;

    // Left Leg
    const lLegX = sX + 16 + lStride + (bodyLean * 0.5);
    const lLegY = sY + 55 - lLift; // Apply lift to Y
    drawRect(ctx, lLegX, lLegY, 14, 32, COLORS.jeansShadow); 
    drawRect(ctx, lLegX + 2, lLegY, 10, 32, COLORS.jeans); 
    drawRect(ctx, lLegX + 4, lLegY, 4, 32, COLORS.jeansHighlight); 
    drawRect(ctx, lLegX - 2, lLegY + 29, 18, 9, '#eeeeee'); // Shoe
    drawRect(ctx, lLegX - 2, lLegY + 35, 18, 3, '#bdbdbd'); // Sole

    // Right Leg
    const rLegX = sX + 30 + rStride + bodyLean;
    const rLegY = sY + 55 - bounce - rLift; // Right leg also affected by bounce
    drawRect(ctx, rLegX, rLegY, 14, 32, COLORS.jeans);
    drawRect(ctx, rLegX + 4, rLegY, 4, 32, COLORS.jeansHighlight); 
    drawRect(ctx, rLegX - 2, rLegY + 29, 18, 9, '#eeeeee');
    drawRect(ctx, rLegX - 2, rLegY + 35, 18, 3, '#bdbdbd');

    // --- TORSO ---
    const torsoY = sY + 20 + bounce;
    const torsoX = sX + bodyLean;

    // Belt
    drawRect(ctx, torsoX + 16, torsoY + 30, 26, 6, '#212121');
    drawRect(ctx, torsoX + 26, torsoY + 30, 6, 6, '#ffd700'); 
    
    // Skin (Muscles)
    drawRect(ctx, torsoX + 16, torsoY, 26, 30, COLORS.skin);
    // Abs shading
    drawRect(ctx, torsoX + 28, torsoY + 14, 2, 16, COLORS.skinShadow);
    drawRect(ctx, torsoX + 22, torsoY + 20, 14, 2, COLORS.skinShadow);
    drawRect(ctx, torsoX + 22, torsoY + 24, 14, 2, COLORS.skinShadow);
    // Pecs
    drawRect(ctx, torsoX + 16, torsoY + 12, 26, 2, COLORS.skinShadow);
    // Muscle Shine
    drawRect(ctx, torsoX + 18, torsoY + 4, 6, 4, COLORS.skinHighlight);
    drawRect(ctx, torsoX + 34, torsoY + 4, 6, 4, COLORS.skinHighlight);

    // Denim Vest
    drawRect(ctx, torsoX + 8, torsoY - 2, 12, 30, COLORS.vest); // Left
    drawRect(ctx, torsoX + 10, torsoY + 8, 4, 20, COLORS.vestShadow); // Shading
    
    drawRect(ctx, torsoX + 38, torsoY - 2, 12, 30, COLORS.vest); // Right
    drawRect(ctx, torsoX + 44, torsoY + 8, 4, 20, COLORS.vestShadow); // Shading

    drawRect(ctx, torsoX + 8, torsoY - 2, 42, 8, COLORS.vest); // Shoulders
    // Vest collar/studs
    drawRect(ctx, torsoX + 12, torsoY + 2, 2, 2, '#fff');
    drawRect(ctx, torsoX + 44, torsoY + 2, 2, 2, '#fff');

    // --- HEAD ---
    const headY = sY + bounce + (bodyLean * 0.2) - 4;
    const headX = sX + (bodyLean * 1.2) + 12;
    
    // Neck
    drawRect(ctx, headX + 6, headY + 20, 14, 6, COLORS.skinShadow);

    // Face
    drawRect(ctx, headX, headY, 26, 26, COLORS.skin);
    drawRect(ctx, headX + 2, headY + 4, 4, 10, COLORS.skinHighlight); // Forehead shine
    
    // Mullet Physics
    const hairFlow = Math.sin(frame * 0.4) * (isMoving ? 6 : 2);
    // Back hair
    drawRect(ctx, headX - 6 + hairFlow, headY + 2, 10, 32, COLORS.hair);
    drawRect(ctx, headX - 4 + hairFlow, headY + 4, 6, 28, COLORS.hairMid); // Texture
    
    // Top Hair
    drawRect(ctx, headX - 2, headY - 8, 30, 10, COLORS.hair);
    drawRect(ctx, headX + 4, headY - 6, 20, 4, COLORS.hairHighlight); // Shine

    // Red Headband
    drawRect(ctx, headX - 2, headY + 2, 30, 6, COLORS.headband);
    drawRect(ctx, headX + 2, headY + 3, 22, 2, COLORS.headbandLight);
    // Tails
    drawRect(ctx, headX - 8, headY + 6 + hairFlow, 12, 4, COLORS.headband);

    // Face features
    drawRect(ctx, headX + 18, headY + 12, 4, 3, '#1a237e'); // Eye (Blue eyes!)
    drawRect(ctx, headX + 16, headY + 9, 10, 2, '#3e2723'); // Eyebrow
    drawRect(ctx, headX + 16, headY + 21, 8, 2, COLORS.skinShadow); // Mouth
    
    // --- ARMS ---
    if (state === EntityState.ATTACK) {
        const progress = 1 - (stateTimer / ATTACK_DURATION);
        
        // Pivot Point (Shoulder)
        const pivX = torsoX + 32;
        const pivY = torsoY + 6;

        ctx.save();
        ctx.translate(pivX, pivY);

        let rotation = 0;
        // Book Swing Mechanics
        if (progress < 0.2) {
            // Windup: Hand goes up and back
            rotation = -2.0; 
        } else if (progress < 0.4) {
            // SMASH: Rapid rotation forward
            rotation = 1.8; 
        } else {
            // Recovery: Slowly return
            rotation = 1.8 - ((progress - 0.4) * 2);
        }
        
        ctx.rotate(rotation);

        // Arm
        drawRect(ctx, 0, -4, 18, 12, COLORS.skin); // Upper Arm
        drawRect(ctx, 16, -2, 16, 10, COLORS.skin); // Forearm
        
        // Hand
        drawRect(ctx, 30, -4, 10, 14, COLORS.skinShadow);

        // --- THE BOOK ---
        ctx.translate(34, 4); 
        ctx.rotate(-0.3); // Slight tilt in hand

        const bookW = 28;
        const bookH = 36;
        const bookColor = '#283593'; // Indigo cover
        
        // Back Cover
        drawRect(ctx, -6, -bookH/2, bookW, bookH, bookColor);
        
        // Pages (White thickness)
        drawRect(ctx, -6 + bookW, -bookH/2 + 2, 6, bookH - 4, '#fff'); // Side pages
        drawRect(ctx, -6 + 2, -bookH/2 + bookH, bookW - 4, 6, '#fff'); // Bottom pages
        
        // Front Cover
        drawRect(ctx, -4, -bookH/2 - 2, bookW, bookH, '#3949ab'); // Lighter blue front
        
        // Spine highlights
        drawRect(ctx, -6, -bookH/2, 6, bookH, '#1a237e');
        
        // Text/Symbol on cover (Gold)
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(4, -10, 14, 3);
        ctx.fillRect(4, -4, 10, 2);
        
        ctx.restore();

        // Swoosh Effect (Visual only)
        if (progress >= 0.2 && progress <= 0.4) {
             ctx.save();
             ctx.translate(pivX, pivY);
             ctx.beginPath();
             ctx.arc(0, 0, 55, -1.0, 1.8, false);
             ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
             ctx.lineWidth = 5;
             ctx.stroke();
             ctx.restore();
        }

        // Guard Arm (Left) - Defensive pose
        drawRect(ctx, torsoX + 18, torsoY + 4, 16, 16, COLORS.skinShadow); 

    } else {
        // Idle/Walk Arms (Muscular)
        // Counter-swing: Right arm matches Left Leg factor, Left arm matches Right Leg factor
        const armSwingMax = 12;
        const lArmSwing = isMoving ? rFactor * armSwingMax : 0; // Left arm follows right leg
        const rArmSwing = isMoving ? lFactor * armSwingMax : 0; // Right arm follows left leg

        const drawArm = (ax: number, ay: number, swing: number, isRight: boolean) => {
             drawRect(ctx, ax + swing, ay, 14, 18, COLORS.skin); // Shoulder
             drawRect(ctx, ax + swing + 4, ay + 2, 4, 6, COLORS.skinHighlight); // Shine
             drawRect(ctx, ax + (swing * 1.5), ay + 18, 12, 16, COLORS.skin); // Forearm
             drawRect(ctx, ax + (swing * 1.8) - 1, ay + 34, 14, 6, '#212121'); // Wristband
             drawRect(ctx, ax + (swing * 1.8) - 1, ay + 40, 14, 10, COLORS.skinShadow); // Hand

             if (isRight) {
                 // DRAW BOOK IN HAND (Carrying)
                 const hx = ax + (swing * 1.8) + 6;
                 const hy = ay + 45;
                 
                 ctx.save();
                 ctx.translate(hx, hy);
                 ctx.rotate(0.2 - (swing * 0.02)); // Slight wobble

                 const bookW = 24;
                 const bookH = 32;
                 const bookColor = '#283593';
                 
                 // Back Cover
                 drawRect(ctx, -4, -2, bookW, bookH, bookColor);
                 // Pages
                 drawRect(ctx, -4 + bookW, 0, 4, bookH - 2, '#fff');
                 drawRect(ctx, -4 + 2, -2 + bookH, bookW - 2, 4, '#fff');
                 // Front Cover
                 drawRect(ctx, -2, -4, bookW, bookH, '#3949ab');
                 // Spine
                 drawRect(ctx, -4, -2, 6, bookH, '#1a237e');
                 
                 // Gold text detail
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
    // --- GAMMON (16-BIT STYLE) ---
    
    // Waddle Effect: Shift torso X based on step
    const waddle = isMoving ? Math.cos(walkCycle) * 3 : 0;

    // --- LEGS ---
    const strideLen = 12;
    const lStride = isMoving ? lFactor * strideLen : 0;
    const rStride = isMoving ? rFactor * strideLen : 0;

    // Lift
    const liftH = 6;
    const lLift = isMoving && lFactor > 0 ? Math.sin(walkCycle) * liftH : 0;
    const rLift = isMoving && rFactor > 0 ? Math.sin(walkCycle + Math.PI) * liftH : 0;

    // Left Leg
    const lLegX = sX + 8 + lStride;
    const lLegY = sY + 60 - lLift;
    drawRect(ctx, lLegX, lLegY, 18, 28, COLORS.pantsShadow);
    drawRect(ctx, lLegX + 4, lLegY, 10, 28, COLORS.pants);
    drawRect(ctx, lLegX, lLegY + 28, 20, 5, '#5d4037'); // Brown shoes

    // Right Leg
    const rLegX = sX + 30 + rStride;
    const rLegY = sY + 60 - bounce - rLift;
    drawRect(ctx, rLegX, rLegY, 18, 28, COLORS.pants);
    drawRect(ctx, rLegX + 4, rLegY, 8, 28, COLORS.pantsShadow);
    drawRect(ctx, rLegX, rLegY + 28, 20, 5, '#5d4037');

    // --- TORSO ---
    // Breathing animation
    const breath = Math.sin(frame * 0.15) * 2;
    const torsoY = sY + 22 + bounce;
    
    // Belly Shape
    const bellyW = 44 + breath;
    const bellyH = 46;
    const bellyX = sX + 6 - (breath/2) + waddle; // Apply waddle
    
    drawUnionJackShirt(ctx, bellyX, torsoY - 4, bellyW, bellyH, true);
    
    // Belly Overhang Shadow
    drawRect(ctx, bellyX + 4, torsoY + bellyH - 2, bellyW - 8, 4, 'rgba(0,0,0,0.2)');

    // Arms (Pink and flabby)
    const drawFatArm = (ax: number, ay: number, swing: number) => {
         const sx = ax + swing;
         drawRect(ctx, sx, ay, 14, 32, COLORS.gammonSkin);
         drawRect(ctx, sx, ay, 4, 32, COLORS.gammonSkinShadow); // Flab shadow
         drawRect(ctx, sx + 8, ay + 2, 4, 10, COLORS.gammonSkinHighlight); // Sweat shine
         
         // Hands
         drawRect(ctx, sx - 2, ay + 30, 18, 12, COLORS.gammonSkin);
    };

    if (state === EntityState.ACTION) {
        // Raising flag or painting
        drawRect(ctx, sX + 40 + waddle, torsoY + 10, 26, 14, COLORS.gammonSkin);
        drawRect(ctx, sX + 66 + waddle, torsoY + 8, 10, 16, COLORS.gammonSkinShadow); 
        if (type === EntityType.ENEMY_PAINTER) {
             drawRect(ctx, sX + 70 + waddle, torsoY + 6, 6, 20, '#bdbdbd');
             drawRect(ctx, sX + 70 + waddle, torsoY + 26, 8, 10, '#d50000'); 
        }
    } else {
        // Arm Waddle Swing
        const armSwing = isMoving ? Math.sin(walkCycle) * 6 : 0;
        drawFatArm(sX - 4 + waddle, torsoY + 6, -armSwing);
        drawFatArm(sX + 46 + waddle, torsoY + 6, armSwing);
    }

    // --- HEAD ---
    const headY = sY + bounce - 6;
    const headX = sX + 16 + waddle; // Apply waddle
    
    // Thick Neck
    drawRect(ctx, headX + 4, headY + 22, 22, 8, COLORS.gammonSkinShadow);

    // Face Shape
    drawRect(ctx, headX, headY, 30, 28, COLORS.gammonSkin);
    
    // Sunburn Gradient (Manual Dithering-ish)
    drawRect(ctx, headX, headY, 30, 8, COLORS.gammonSkinRed); // Top Very Red
    drawRect(ctx, headX, headY + 8, 30, 4, 'rgba(255, 82, 82, 0.5)'); // Fade
    
    // Shiny Bald Spot
    drawRect(ctx, headX + 18, headY + 2, 8, 4, 'rgba(255,255,255,0.6)');
    
    // Angry Features
    drawRect(ctx, headX + 18, headY + 10, 4, 4, '#000'); // Beady Eye
    drawRect(ctx, headX + 14, headY + 7, 12, 3, '#b71c1c'); // Furrowed Brow
    
    // Vein popping
    if (frame % 60 < 30) {
        drawRect(ctx, headX + 26, headY + 6, 2, 6, '#b71c1c');
        drawRect(ctx, headX + 24, headY + 8, 6, 2, '#b71c1c');
    }

    if (shoutText) {
        drawRect(ctx, headX + 16, headY + 18, 12, 8, '#3e2723'); // Yelling
        // Spittle particles
        if (frame % 10 === 0) {
            ctx.fillStyle = '#fff';
            ctx.fillRect(headX + 28 + (Math.random()*10), headY + 20 + (Math.random()*5), 2, 2);
        }
    } else {
        drawRect(ctx, headX + 18, headY + 20, 10, 2, '#3e2723'); // Grumpy
        drawRect(ctx, headX + 18, headY + 24, 8, 2, '#3e2723'); // Chin fold
    }
  }
  
  ctx.restore();

  // Reset opacity if hit flash
  if (isHit) {
      ctx.globalAlpha = 1.0;
      ctx.globalCompositeOperation = 'source-over';
  }

  if (shoutText) {
      drawSpeechBubble(ctx, shoutText, drawX, drawY - height - 10);
  }
};

const drawSpeechBubble = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number) => {
    ctx.font = '10px "Press Start 2P"';
    const lineHeight = 14;
    const lines = text.split('\n');
    let maxWidth = 0;
    lines.forEach(line => {
        const m = ctx.measureText(line);
        if (m.width > maxWidth) maxWidth = m.width;
    });

    const padding = 10;
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

export const drawEnvironment = (ctx: CanvasRenderingContext2D, width: number, height: number, integrity: number) => {
    const horizonY = 240; 

    // 1. SKY (Gradient)
    const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
    skyGrad.addColorStop(0, COLORS.skyTop);
    skyGrad.addColorStop(0.5, COLORS.skyMid);
    skyGrad.addColorStop(1, COLORS.skyBottom);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, horizonY);

    // 2. CLOUDS (Parallax Layer 1)
    const t = Date.now() / 10000;
    const cloudOffset1 = (t * 20) % width;
    const cloudOffset2 = (t * 40) % width;

    drawCloud(ctx, 100 + cloudOffset1, 50, 1.5);
    drawCloud(ctx, 600 + cloudOffset1, 80, 1.2);
    
    drawCloud(ctx, 350 + cloudOffset2, 40, 0.8);
    drawCloud(ctx, 50 - cloudOffset2 + width, 60, 1.0);

    // 3. FAR BACKGROUND (Silhouette Trees/City)
    ctx.fillStyle = '#81d4fa'; // Light hazy blue
    ctx.beginPath();
    for(let i=0; i<=width; i+=20) {
        ctx.lineTo(i, horizonY - 20 - Math.random()*15);
    }
    ctx.lineTo(width, horizonY);
    ctx.lineTo(0, horizonY);
    ctx.fill();

    // 4. HOUSES (Procedural Sprite-like)
    const houseY = horizonY - 140;
    
    // Draw row of houses
    drawSpriteHouse(ctx, 20, houseY, 'brick');
    drawSpriteHouse(ctx, 280, houseY, 'pebble');
    drawSpriteHouse(ctx, 540, houseY, 'brick');

    // 5. FENCE & HEDGES
    // Fence with graffiti
    for(let fx = 0; fx < width; fx+=30) {
        drawRect(ctx, fx, horizonY - 60, 28, 60, '#795548');
        drawRect(ctx, fx + 2, horizonY - 58, 24, 58, '#8d6e63'); // Wood Highlight
        drawRect(ctx, fx, horizonY - 20, 30, 4, '#5d4037'); // Cross beam
        
        // Random Graffiti
        if (fx % 210 === 0) {
            ctx.font = '10px Arial';
            ctx.fillStyle = '#e91e63';
            ctx.fillText('WOZ ERE', fx + 5, horizonY - 30);
        }
    }

    // Manicured Hedges
    drawRect(ctx, 0, horizonY - 45, width, 45, COLORS.grassDark);
    for(let i=0; i<width; i+=15) {
        // Round top hedges
        ctx.fillStyle = COLORS.grass;
        ctx.beginPath();
        ctx.arc(i + 7, horizonY - 45, 10, 0, Math.PI, true);
        ctx.fill();
        ctx.fillRect(i, horizonY - 45, 15, 45);
        
        // Leaves texture
        ctx.fillStyle = COLORS.grassLight;
        ctx.fillRect(i + 4, horizonY - 40, 2, 2);
        ctx.fillRect(i + 10, horizonY - 30, 2, 2);
    }

    // 6. PAVEMENT
    const pavementGrad = ctx.createLinearGradient(0, horizonY, 0, horizonY + 60);
    pavementGrad.addColorStop(0, '#cfd8dc');
    pavementGrad.addColorStop(1, '#b0bec5');
    ctx.fillStyle = pavementGrad;
    ctx.fillRect(0, horizonY, width, 60);
    
    // Slabs 3D Effect
    ctx.strokeStyle = '#90a4ae';
    ctx.lineWidth = 2;
    for (let sx = 0; sx < width; sx += 60) {
        ctx.beginPath();
        ctx.moveTo(sx + 30, horizonY);
        ctx.lineTo(sx, horizonY + 60);
        ctx.stroke();
    }
    
    // Curb
    drawRect(ctx, 0, horizonY + 60, width, 10, '#eceff1'); 
    drawRect(ctx, 0, horizonY + 70, width, 12, '#546e7a'); // Side drop

    // 7. ROAD
    const roadY = horizonY + 82;
    const roadGrad = ctx.createLinearGradient(0, roadY, 0, height);
    roadGrad.addColorStop(0, COLORS.road);
    roadGrad.addColorStop(1, COLORS.roadDark);
    ctx.fillStyle = roadGrad;
    ctx.fillRect(0, roadY, width, height - roadY);
    
    // Road Texture/Noise
    ctx.fillStyle = '#263238';
    for(let i=0; i<100; i++) {
        const rx = (i * 47) % width;
        const ry = roadY + (i * 31) % (height - roadY);
        ctx.fillRect(rx, ry, 4, 2);
    }

    // Markings
    ctx.fillStyle = '#eceff1';
    drawRect(ctx, 0, roadY + 90, width, 8, '#eceff1'); 
    
    // Litter (Funny details)
    drawLitter(ctx, 150, roadY + 40, 'can');
    drawLitter(ctx, 550, roadY + 140, 'newspaper');

    // Props
    drawLampPost(ctx, 450, horizonY + 40, integrity);
    drawRoundabout(ctx, 680, roadY + 140, integrity);
};

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

export const drawForeground = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Parallax Foreground Bushes (Blurry)
    const drawBush = (bx: number, by: number, scale: number) => {
        ctx.fillStyle = 'rgba(27, 94, 32, 0.9)'; // Dark green
        ctx.beginPath();
        ctx.arc(bx, by, 40 * scale, 0, Math.PI*2);
        ctx.arc(bx + 30*scale, by + 10*scale, 35*scale, 0, Math.PI*2);
        ctx.fill();
    };

    drawBush(80, height + 15, 1.4);
    drawBush(width - 80, height + 20, 1.3);
};

export const drawParticles = (ctx: CanvasRenderingContext2D, particles: Particle[]) => {
    particles.forEach(p => {
        if (p.text) {
            ctx.save();
            ctx.font = 'bold 12px "Press Start 2P"';
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
