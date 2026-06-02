/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Position {
  x: number;
  y: number;
}

export interface Velocity {
  x: number;
  y: number;
}

export type SpriteDirection = 'left' | 'right';

export interface PlayerState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  isGrounded: boolean;
  isWallClinging: boolean;
  wallClingSide: 'left' | 'right' | null;
  direction: SpriteDirection;
  coyoteTime: number;
  jumpPressed: boolean;
  isDashing: boolean;
  dashCooldown: number;
  dashDuration: number;
  dashDirection: { x: number; y: number };
  dashInertia: { x: number; y: number };
  isSlasherActive: boolean;
  slashCooldown: number;
  slashDuration: number;
  slashAngle: number;
  health: number;
  maxHealth: number;
  bulletTimeEnergy: number; // 0 to 100
  maxBulletTimeEnergy: number;
  isDead: boolean;
  lastDeathTick: number;
  isRewinding: boolean;
  doubleJumpsLeft: number;
  scarfPoints?: { x: number; y: number; vx: number; vy: number }[];
  lastLandTick?: number;
  lastJumpTick?: number;
}

export type EnemyType = 'grunt' | 'gunner' | 'shield' | 'sniper' | 'shotgunner';

export interface EnemyState {
  id: string;
  type: EnemyType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  direction: SpriteDirection;
  health: number;
  maxHealth: number;
  state: 'patrol' | 'alert' | 'attack' | 'dead';
  patrolMinX: number;
  patrolMaxX: number;
  shootCooldown: number;
  attackCooldown: number;
  noticeTimer: number;
  alertExclamationTimer: number;
  deathTimer: number;
  bloodDecalsCreated: boolean;
  turnCooldown?: number;
}

export interface BulletState {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  isDeflected: boolean;
  ownerId: string; // sender id
  startX?: number;
  startY?: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  decay: number;
  gravity: number;
  dampening: number;
  type: 'blood' | 'spark' | 'dust' | 'slash_debris' | 'dash_ghost';
  points?: Array<{ x: number; y: number }>; // For trail shapes
  duration?: number;
  direction?: SpriteDirection;
}

export interface BloodDecal {
  x: number;
  y: number;
  size: number;
  color: string;
  rotation: number;
  shape: 'splat' | 'streak' | 'drip';
}

export interface LevelConfig {
  id: string;
  name: string;
  width: number;
  height: number;
  spawnPoint: Position;
  platforms: Platform[];
  enemies: Array<{ type: EnemyType; x: number; y: number; patrolRange?: number }>;
  completed: boolean;
}

export interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'solid' | 'one_way' | 'bounce' | 'spike';
  color?: string;
}

export interface GameSettings {
  screenShakeMultiplier: number; // 0 to 2
  hitstopDurationMs: number; // 0 to 200
  particleCountMultiplier: number; // 0.2 to 2
  bloodAmountMultiplier: number; // 0 to 3
  bulletTimeSlowdown: number; // e.g., 0.15 for super slow, 0.5 for moderate
  infiniteBulletTime: boolean;
  soundVolume: number; // 0 to 1
  visualTheme: 'neon_noir' | 'retro_arcade' | 'matrix_green' | 'monochrome';
}

export interface GameHistoryFrame {
  player: {
    x: number;
    y: number;
    vx: number;
    vy: number;
    direction: SpriteDirection;
    isDashing: boolean;
    isSlasherActive: boolean;
    bulletTimeEnergy: number;
  };
  enemies: Array<{
    id: string;
    type: EnemyType;
    x: number;
    y: number;
    vx: number;
    vy: number;
    direction: SpriteDirection;
    state: 'patrol' | 'alert' | 'attack' | 'dead';
    health: number;
  }>;
  bullets: Array<{
    id: string;
    x: number;
    y: number;
    vx: number;
    vy: number;
    isDeflected: boolean;
    startX?: number;
    startY?: number;
  }>;
  cameraX: number;
  cameraY: number;
}
