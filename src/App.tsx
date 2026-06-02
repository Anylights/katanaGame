/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { 
  Play, 
  RotateCcw, 
  Settings, 
  Sliders, 
  Hammer, 
  Sparkles, 
  Volume2, 
  SlidersHorizontal,
  Plus, 
  Trash2, 
  Award,
  BookOpen,
  Keyboard,
  Info,
  ChevronRight
} from 'lucide-react';
import { 
  PlayerState, 
  EnemyState, 
  BulletState, 
  Particle, 
  BloodDecal, 
  LevelConfig, 
  Platform, 
  GameSettings, 
  GameHistoryFrame, 
  EnemyType 
} from './types';
import { LEVELS } from './levels';
import { AudioSynth } from './audio';

export default function App() {
  // Game Modes
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'settings' | 'level_editor' | 'victory' | 'help'>('menu');
  const [menuSubView, setMenuSubView] = useState<'main' | 'levels'>('main');
  const [currentLevelIndex, setCurrentLevelIndex] = useState<number>(0);
  const [activeLevel, setActiveLevel] = useState<LevelConfig>({ ...LEVELS[0] });
  const [isEndlessMode, setIsEndlessMode] = useState<boolean>(false);
  const [endlessScore, setEndlessScore] = useState<number>(0);
  const [endlessWave, setEndlessWave] = useState<number>(1);
  const [endlessCombo, setEndlessCombo] = useState<number>(0);
  const [comboTimer, setComboTimer] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => {
    return Number(localStorage.getItem('katana_high_score') || '0');
  });

  // Settings
  const [settings, setSettings] = useState<GameSettings>({
    screenShakeMultiplier: 1.2,
    hitstopDurationMs: 80,
    particleCountMultiplier: 1.2,
    bloodAmountMultiplier: 1.5,
    bulletTimeSlowdown: 0.18,
    infiniteBulletTime: false,
    soundVolume: 0.5,
    visualTheme: 'neon_noir',
  });

  // References
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Level Editor State
  const [editPlatformType, setEditPlatformType] = useState<'solid' | 'spike' | 'one_way'>('solid');
  const [editEnemyType, setEditEnemyType] = useState<EnemyType>('grunt');
  const [editorHistory, setEditorHistory] = useState<LevelConfig[]>([]);

  // Sound sync
  useEffect(() => {
    AudioSynth.setVolume(settings.soundVolume);
    if (gameState === 'playing') {
      AudioSynth.startBGM();
    } else {
      AudioSynth.stopBGM();
    }
    return () => {
      AudioSynth.stopBGM();
    };
  }, [gameState, settings.soundVolume]);

  // Main game loop engine state (stored in ref to avoid react render lag)
  const gameLoopRef = useRef<number | null>(null);
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const mousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const prevSlowMo = useRef<boolean>(false);
  const slowMoFlashTimer = useRef<number>(0);
  const playStateRef = useRef<{
    player: PlayerState;
    enemies: EnemyState[];
    bullets: BulletState[];
    particles: Particle[];
    bloodDecals: BloodDecal[];
    camera: { x: number; y: number; shake: number; freezeTimeRemaining: number };
    history: GameHistoryFrame[];
    currentTick: number;
    endlessSpawnCooldown: number;
    levelClearedCountdown?: number;
    levelClearedMax?: number;
  }>({
    player: createInitialPlayer({ x: 100, y: 400 }),
    enemies: [],
    bullets: [],
    particles: [],
    bloodDecals: [],
    camera: { x: 0, y: 0, shake: 0, freezeTimeRemaining: 0 },
    history: [],
    currentTick: 0,
    endlessSpawnCooldown: 0,
    levelClearedCountdown: 0,
    levelClearedMax: 0
  });

  // Load level configuration
  function loadLevel(level: LevelConfig, loopRestart = false) {
    const freshLevel = JSON.parse(JSON.stringify(level)) as LevelConfig;
    
    playStateRef.current = {
      player: createInitialPlayer(freshLevel.spawnPoint),
      enemies: freshLevel.enemies.map((e, index) => ({
        id: `enemy_${index}_${Date.now()}`,
        type: e.type,
        x: e.x,
        y: e.y,
        vx: 0,
        vy: 0,
        width: e.type === 'shield' ? 24 : (e.type === 'shotgunner' ? 22 : 18),
        height: 38,
        direction: 'left',
        health: e.type === 'shield' ? 2 : (e.type === 'shotgunner' ? 2 : 1),
        maxHealth: e.type === 'shield' ? 2 : (e.type === 'shotgunner' ? 2 : 1),
        state: 'patrol',
        patrolMinX: e.x - (e.patrolRange || 0),
        patrolMaxX: e.x + (e.patrolRange || 0),
        shootCooldown: e.type === 'shotgunner' ? Math.random() * 60 + 30 : (Math.random() * 60 + 15),
        attackCooldown: 0,
        noticeTimer: 0,
        alertExclamationTimer: 0,
        deathTimer: 0,
        bloodDecalsCreated: false,
        turnCooldown: 0,
      })),
      bullets: [],
      particles: [],
      bloodDecals: loopRestart ? playStateRef.current.bloodDecals : [], // Keep decals if just rewinding same level!
      camera: { x: freshLevel.spawnPoint.x - 480, y: freshLevel.spawnPoint.y - 270, shake: 0, freezeTimeRemaining: 0 },
      history: [],
      currentTick: 0,
      endlessSpawnCooldown: 60,
      levelClearedCountdown: 0,
      levelClearedMax: 0
    };

    if (isEndlessMode) {
      setEndlessScore(0);
      setEndlessWave(1);
      setEndlessCombo(0);
      setComboTimer(0);
    }
  }

  function createInitialPlayer(pos: { x: number; y: number }): PlayerState {
    return {
      x: pos.x,
      y: pos.y,
      vx: 0,
      vy: 0,
      width: 18,
      height: 38,
      isGrounded: false,
      isWallClinging: false,
      wallClingSide: null,
      direction: 'right',
      coyoteTime: 0,
      jumpPressed: false,
      isDashing: false,
      dashCooldown: 0,
      dashDuration: 0,
      dashDirection: { x: 1, y: 0 },
      dashInertia: { x: 0, y: 0 },
      isSlasherActive: false,
      slashCooldown: 0,
      slashDuration: 0,
      slashAngle: 0,
      health: 1,
      maxHealth: 1,
      bulletTimeEnergy: 100,
      maxBulletTimeEnergy: 100,
      isDead: false,
      lastDeathTick: 0,
      isRewinding: false,
      doubleJumpsLeft: 1,
    };
  }

  // Keyboard binds
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = true;
      if (gameState === 'playing') {
        // Prevent browser scrolling/gestures
        if (['space', 'arrowup', 'arrowdown', ' '].includes(e.key.toLowerCase())) {
          e.preventDefault();
        }
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = false;
    };
    const handleBlur = () => {
      // Clear all keys on window blur so we never have stuck inputs
      keysPressed.current = {};
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [gameState]);

  // Track cursor coordinates and clicks relative to canvas
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      // Translate mouse coordinates to actual internal canvas size (960 x 540)
      const scaleX = 960 / rect.width;
      const scaleY = 540 / rect.height;
      mousePos.current = {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (gameState !== 'playing') return;
      const canvas = canvasRef.current;
      if (!canvas || !canvas.contains(e.target as Node)) return;

      if (e.button === 0) { // Left-click
        keysPressed.current['left_click'] = true;
      } else if (e.button === 2) { // Right-click
        keysPressed.current['right_click'] = true;
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 0) { // Left-click
        keysPressed.current['left_click'] = false;
      } else if (e.button === 2) { // Right-click
        keysPressed.current['right_click'] = false;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [gameState]);

  // Prevent right clicks globally in game context to support right-click control
  useEffect(() => {
    const preventRightClick = (e: MouseEvent) => {
      if (gameState === 'playing' && canvasRef.current?.contains(e.target as Node)) {
        e.preventDefault();
      }
    };
    window.addEventListener('contextmenu', preventRightClick);
    return () => window.removeEventListener('contextmenu', preventRightClick);
  }, [gameState]);

  // Start the render loop
  useEffect(() => {
    if (gameState === 'playing' && canvasRef.current) {
      loadLevel(activeLevel);
      gameLoopRef.current = requestAnimationFrame(updateGame);
    }
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState, activeLevel, isEndlessMode]);

  // COMBAT ENGINE AND PHYSICS LOGIC LOOP
  function updateGame() {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const state = playStateRef.current;
    const player = state.player;
    
    // 1. Check Slow-mo/Bullet-time status
    const wantsSlowMo = !!(keysPressed.current['q'] || keysPressed.current['right_click'] || keysPressed.current['control']);
    const canBulletTime = settings.infiniteBulletTime || state.player.bulletTimeEnergy > 0;
    const isLevelClearedCinematic = state.levelClearedCountdown !== undefined && state.levelClearedCountdown > 0;
    
    // Toggle audio slow mo state dynamically
    const isCurrentlySlow = (wantsSlowMo && canBulletTime && !state.player.isDead && !state.player.isRewinding) || isLevelClearedCinematic;
    AudioSynth.setSlowMotion(isCurrentlySlow);

    // Track slow-mo entrance for gorgeous screen flashes and circular shockwaves
    if (isCurrentlySlow && !prevSlowMo.current) {
      AudioSynth.playSlowMoActivate();
      slowMoFlashTimer.current = 8; // 8 frames of bright decaying cyan/white flash overlay
      state.camera.shake = 8 * settings.screenShakeMultiplier;
      
      // Spawn expansion halo shockwave from player center
      state.particles.push({
        x: state.player.x + state.player.width / 2,
        y: state.player.y + state.player.height / 2,
        vx: 0,
        vy: 0,
        color: 'rgba(34, 211, 238, 0.95)', // Cyan halo
        size: 15,
        alpha: 1.0,
        decay: 0.04,
        gravity: 0,
        dampening: 1,
        type: 'shockwave'
      });
      state.particles.push({
        x: state.player.x + state.player.width / 2,
        y: state.player.y + state.player.height / 2,
        vx: 0,
        vy: 0,
        color: 'rgba(168, 85, 247, 0.75)', // Purple core halo
        size: 5,
        alpha: 1.0,
        decay: 0.03,
        gravity: 0,
        dampening: 1,
        type: 'shockwave'
      });
    } else if (!isCurrentlySlow && prevSlowMo.current) {
      AudioSynth.playSlowMoDeactivate();
    }
    prevSlowMo.current = isCurrentlySlow;

    // Apply slow-mo coefficient
    const dt = isCurrentlySlow ? settings.bulletTimeSlowdown : 1.0;

    if (slowMoFlashTimer.current > 0) {
      slowMoFlashTimer.current = Math.max(0, slowMoFlashTimer.current - dt);
    }

    // Fast-drain/Regenerate Slow-Mo energy
    if (isCurrentlySlow) {
      state.player.bulletTimeEnergy = Math.max(0, state.player.bulletTimeEnergy - 0.4);
    } else {
      state.player.bulletTimeEnergy = Math.min(state.player.maxBulletTimeEnergy, state.player.bulletTimeEnergy + 0.25);
    }

    // 2. REWIND MECHANICS (If dead, playback backwards!)
    if (state.player.isRewinding) {
      if (state.history.length > 0) {
        // Pop last 3 frames to fast rewind
        const framesToSkip = 4;
        let lastFrame: GameHistoryFrame | undefined;
        for (let i = 0; i < framesToSkip; i++) {
          lastFrame = state.history.pop();
        }
        
        if (lastFrame) {
          // Playback the state
          state.player.x = lastFrame.player.x;
          state.player.y = lastFrame.player.y;
          state.player.vx = lastFrame.player.vx;
          state.player.vy = lastFrame.player.vy;
          state.player.direction = lastFrame.player.direction;
          state.player.isDashing = lastFrame.player.isDashing;
          state.player.isSlasherActive = lastFrame.player.isSlasherActive;

          // Re-instantiate historical positions
          state.enemies.forEach(e => {
            const histE = lastFrame?.enemies.find(he => he.id === e.id);
            if (histE) {
              e.x = histE.x;
              e.y = histE.y;
              e.vx = histE.vx;
              e.vy = histE.vy;
              e.direction = histE.direction;
              e.state = histE.state;
              e.health = histE.health;
            }
          });

          // Recreate historical bullets
          state.bullets = lastFrame.bullets.map(b => ({
            id: b.id,
            x: b.x,
            y: b.y,
            vx: b.vx,
            vy: b.vy,
            radius: 5,
            isDeflected: b.isDeflected,
            ownerId: '',
            startX: b.startX ?? b.x,
            startY: b.startY ?? b.y
          }));

          // Rewind dust particles flying backward
          if (state.particles.length < 50 && Math.random() < 0.3) {
            state.particles.push({
              x: state.player.x + Math.random() * 20 - 10,
              y: state.player.y + Math.random() * 30 - 15,
              vx: (Math.random() - 0.5) * 5,
              vy: -Math.random() * 4,
              color: '#38bdf8',
              size: Math.random() * 2 + 1,
              alpha: 0.8,
              decay: 0.05,
              gravity: -0.1,
              dampening: 0.9,
              type: 'dust'
            });
          }

          // Camera lock smooth rewind
          state.camera.x = lastFrame.cameraX;
          state.camera.y = lastFrame.cameraY;
          if (state.currentTick % 3 === 0) {
            AudioSynth.playRewind();
          }
        }
      } else {
        // Rewind completed! Restart level instantly
        state.player.isRewinding = false;
        state.player.isDead = false;
        state.player.health = 1;
        loadLevel(activeLevel, true);
      }
      
      state.currentTick++;
      renderGame(ctx);
      gameLoopRef.current = requestAnimationFrame(updateGame);
      return;
    }

    // 3. HIT-STOP FREEZE-FRAME EFFECT (Freeze entire timeline)
    if (state.camera.freezeTimeRemaining > 0) {
      state.camera.freezeTimeRemaining -= 16.67; // Assuming 60fps
      // Shake screen during freeze frame to augment tension!
      if (state.camera.shake < 6) state.camera.shake = 6;
      renderGame(ctx);
      gameLoopRef.current = requestAnimationFrame(updateGame);
      return;
    }

    // 4. RECORD STATE HISTORY
    // Only record every 2 ticks to gain memory efficiency, keeping standard history scope larger
    if (state.currentTick % 2 === 0 && !state.player.isDead) {
      state.history.push({
        player: {
          x: state.player.x,
          y: state.player.y,
          vx: state.player.vx,
          vy: state.player.vy,
          direction: state.player.direction,
          isDashing: state.player.isDashing,
          isSlasherActive: state.player.isSlasherActive,
          bulletTimeEnergy: state.player.bulletTimeEnergy
        },
        enemies: state.enemies.map(e => ({
          id: e.id,
          type: e.type,
          x: e.x,
          y: e.y,
          vx: e.vx,
          vy: e.vy,
          direction: e.direction,
          state: e.state,
          health: e.health
        })),
        bullets: state.bullets.map(b => ({
          id: b.id,
          x: b.x,
          y: b.y,
          vx: b.vx,
          vy: b.vy,
          isDeflected: b.isDeflected,
          startX: b.startX,
          startY: b.startY
        })),
        cameraX: state.camera.x,
        cameraY: state.camera.y
      });

      // Keep maximum capacity to 400 history frames to prevent memory drag
      if (state.history.length > 400) {
        state.history.shift();
      }
    }

    // 5. ENDLESS SURVIVAL WAVE SPAWNER
    if (isEndlessMode && !state.player.isDead) {
      state.endlessSpawnCooldown -= dt;
      if (state.endlessSpawnCooldown <= 0) {
        // Spawn portal
        const spawnSides = [
          { x: 100, y: 450 },
          { x: 1500, y: 450 },
          { x: 400, y: 200 },
          { x: 1200, y: 200 }
        ];
        const spot = spawnSides[Math.floor(Math.random() * spawnSides.length)];
        const types: EnemyType[] = ['grunt', 'grunt', 'gunner', 'gunner', 'shield'];
        const chosenType = types[Math.floor(Math.random() * Math.min(endlessWave, types.length))];
        
        state.enemies.push({
          id: `endless_enemy_${Date.now()}`,
          type: chosenType,
          x: spot.x,
          y: spot.y,
          vx: 0,
          vy: 0,
          width: chosenType === 'shield' ? 24 : 18,
          height: 38,
          direction: 'left',
          health: chosenType === 'shield' ? 2 : 1,
          maxHealth: chosenType === 'shield' ? 2 : 1,
          state: 'alert',
          patrolMinX: spot.x - 200,
          patrolMaxX: spot.x + 200,
          shootCooldown: Math.random() * 40 + 15,
          attackCooldown: 0,
          noticeTimer: 30,
          alertExclamationTimer: 20,
          deathTimer: 0,
          bloodDecalsCreated: false,
          turnCooldown: 0
        });

        // Portal spawn particles
        for (let i = 0; i < 15; i++) {
          state.particles.push({
            x: spot.x,
            y: spot.y + 10,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            color: '#a855f7', // cosmic purple spawn portal
            size: Math.random() * 4 + 2,
            alpha: 1.0,
            decay: 0.03,
            gravity: 0,
            dampening: 0.92,
            type: 'spark'
          });
        }

        // Reset spawner based on speed
        state.endlessSpawnCooldown = Math.max(80, 220 - (endlessWave * 15) - (Math.random() * 60));
      }

      // Combo decrease
      if (endlessCombo > 0) {
        setComboTimer(prev => {
          if (prev <= 0) {
            setEndlessCombo(0);
            return 0;
          }
          return prev - (dt * 0.4);
        });
      }
    }

    // 6. PROCESS PLAYER ACTIONS & PHYSICS
    if (!player.isDead) {
      // Cooldown ticker updates
      if (player.slashCooldown > 0) player.slashCooldown -= dt;
      if (player.dashCooldown > 0) player.dashCooldown -= dt;

      // Handle custom weapon slash attack request
      const requestAttack = keysPressed.current['j'] || keysPressed.current['left_click'];
      if (requestAttack && player.slashCooldown <= 0 && !player.isDashing) {
        player.isSlasherActive = true;
        player.slashDuration = 12; // active for 12 physics ticks (delivering beautiful animated elliptical slash trail)
        player.slashCooldown = 28; // reuse interval cooldown
        
        // Calculate slash vector (mouse targeting or directional fallback)
        const dx = mousePos.current.x + state.camera.x - player.x;
        const dy = mousePos.current.y + state.camera.y - (player.y + 15);
        player.slashAngle = Math.atan2(dy, dx);
        
        // Face player direction based on slash angle
        if (Math.abs(player.slashAngle) > Math.PI / 2) {
          player.direction = 'left';
        } else {
          player.direction = 'right';
        }

        AudioSynth.playSlash();

        // 1. A parry halo shockwave circle expanding from player center
        state.particles.push({
          x: player.x + player.width / 2,
          y: player.y + player.height / 2,
          vx: 0,
          vy: 0,
          color: 'rgba(34, 211, 238, 0.75)', // Cyan wave
          size: 8,
          alpha: 1.0,
          decay: 0.05,
          gravity: 0,
          dampening: 1,
          type: 'shockwave'
        });

        // 2. Beautiful high-speed directional slash line particles
        const slashDebrisCount = Math.floor(10 * settings.particleCountMultiplier);
        for (let i = 0; i < slashDebrisCount; i++) {
          const spread = (Math.random() - 0.5) * 0.75; // Spread angle of the sword crescent spark
          const particleAngle = player.slashAngle + spread;
          const speed = 10 + Math.random() * 12;
          
          state.particles.push({
            x: player.x + player.width / 2,
            y: player.y + player.height / 2,
            vx: Math.cos(particleAngle) * speed,
            vy: Math.sin(particleAngle) * speed,
            color: Math.random() < 0.25 ? '#ffffff' : '#22d3ee', // white-hot / cyan split
            size: Math.random() * 2 + 1.2, // line thickness
            alpha: 1.0,
            decay: 0.05,
            gravity: 0,
            dampening: 0.93,
            type: 'slash_line'
          });
        }

        // High speed micro thrust in slash direction
        player.vx = Math.cos(player.slashAngle) * 9;
        player.vy = Math.sin(player.slashAngle) * 6;

        // Reset mouse press state if it is mouse tracker to prevent repeating
        keysPressed.current['left_click'] = false;
      }

      // Action Slash state timer
      if (player.isSlasherActive) {
        player.slashDuration -= dt;
        if (player.slashDuration <= 0) {
          player.isSlasherActive = false;
        }
      }

      // Dash/Roll movement triggers (Shift or Keyboard K or C)
      const requestDash = keysPressed.current['shift'] || keysPressed.current['k'] || keysPressed.current['c'];
      if (requestDash && player.dashCooldown <= 0 && !player.isSlasherActive) {
        player.isDashing = true;
        player.dashDuration = 12; // 12 ticks iframe dash
        player.dashCooldown = 38; // Cooldown limit

        // Decide dash directional angle
        let dx = 0;
        let dy = 0;
        if (keysPressed.current['a'] || keysPressed.current['arrowleft']) dx = -1;
        if (keysPressed.current['d'] || keysPressed.current['arrowright']) dx = 1;
        if (keysPressed.current['w'] || keysPressed.current['arrowup']) dy = -1;
        if (keysPressed.current['s'] || keysPressed.current['arrowdown']) dy = 1;

        if (dx === 0 && dy === 0) {
          // Default fallbacks: mouse direction
          const mdx = mousePos.current.x + state.camera.x - player.x;
          const mdy = mousePos.current.y + state.camera.y - player.y;
          const mag = Math.hypot(mdx, mdy);
          dx = scaleClamp(mdx / mag);
          dy = scaleClamp(mdy / mag);
        }

        player.dashDirection = { x: dx, y: dy };
        player.direction = dx >= 0 ? 'right' : 'left';
        
        AudioSynth.playDash();

        // Spawn beautiful starting blast shockwave
        state.particles.push({
          x: player.x + player.width / 2,
          y: player.y + player.height / 2,
          vx: 0,
          vy: 0,
          color: 'rgba(56, 189, 248, 0.65)',
          size: 5,
          alpha: 0.8,
          decay: 0.05,
          gravity: 0,
          dampening: 1,
          type: 'shockwave'
        });

        // Spawn beautiful neon dash shadow particles
        for (let i = 0; i < 4; i++) {
          state.particles.push({
            x: player.x,
            y: player.y,
            vx: 0,
            vy: 0,
            color: i % 2 === 0 ? '#22d3ee' : '#ec4899', // Cyan/Magenta high contrast
            size: 25,
            alpha: 0.65 - (i * 0.12),
            decay: 0.04,
            gravity: 0,
            dampening: 1,
            type: 'dash_ghost',
            direction: player.direction
          });
        }

        keysPressed.current['shift'] = false;
        keysPressed.current['k'] = false;
        keysPressed.current['c'] = false;
      }

      // Dashing Movement Translation
      if (player.isDashing) {
        player.dashDuration -= dt;
        // High constant speed matrix through velocity
        player.vx = player.dashDirection.x * 12;
        player.vy = player.dashDirection.y * 10;
        
        // Continuous trail afterimages as the player flies
        if (state.currentTick % 2 === 0) {
          state.particles.push({
            x: player.x,
            y: player.y,
            vx: 0,
            vy: 0,
            color: state.currentTick % 4 === 0 ? '#22d3ee' : '#ec4899', // alternating blue-pink
            size: player.width,
            alpha: 0.75,
            decay: 0.06,
            gravity: 0,
            dampening: 1,
            type: 'dash_ghost',
            direction: player.direction
          });
        }

        if (player.dashDuration <= 0) {
          player.isDashing = false;
          // Retain small dash velocity inertia
          player.vx *= 0.5;
          player.vy *= 0.5;
        }
      } else {
        // STANDARD MOVEMENT AND JUMP GRAVITY SYSTEM
        const moveAcc = 1.0 * dt;
        const maxWalkSpeed = 4.8;
        const gravityScale = 0.35 * dt;
        const airResistance = 0.95;
        const groundFriction = 0.82;

        // Left-right navigation
        if (keysPressed.current['a'] || keysPressed.current['arrowleft']) {
          player.vx -= moveAcc;
          if (player.vx < -maxWalkSpeed) player.vx = -maxWalkSpeed;
          player.direction = 'left';
        } else if (keysPressed.current['d'] || keysPressed.current['arrowright']) {
          player.vx += moveAcc;
          if (player.vx > maxWalkSpeed) player.vx = maxWalkSpeed;
          player.direction = 'right';
        } else {
          // Apply Friction/damping smoothly with exponential dt correction
          if (player.isGrounded) {
            player.vx *= Math.pow(groundFriction, dt);
          } else {
            player.vx *= Math.pow(airResistance, dt);
          }
        }

        // Apply constant heavy gravity fall
        player.vy += gravityScale;
        
        // Terminal cap speed standard fall
        if (player.vy > 12) player.vy = 12;

        // Wall cling / wall jump mechanics
        if (player.isWallClinging) {
          player.vy = Math.min(player.vy, 1.2); // Slide down walls slowly (friction dust!) Capped correctly without double-scaling dt!
          
          if (Math.random() < 0.15 * dt) {
            const dustX = player.wallClingSide === 'left' ? player.x : player.x + player.width;
            state.particles.push({
              x: dustX,
              y: player.y + Math.random() * 25,
              vx: (player.wallClingSide === 'left' ? 1.5 : -1.5) * Math.random(),
              vy: -0.5,
              color: '#a1a1aa',
              size: Math.random() * 2 + 1,
              alpha: 0.7,
              decay: 0.06,
              gravity: 0.05,
              dampening: 0.9,
              type: 'dust'
            });
          }
        }

        // Jump trigger (W, Up, or Space)
        const wantsJump = !!(keysPressed.current['w'] || keysPressed.current['arrowup'] || keysPressed.current[' ']);
        
        if (wantsJump) {
          if (player.coyoteTime > 0) {
            // Standard ground jump
            player.vy = -9.2;
            player.coyoteTime = 0;
            player.isGrounded = false;
            player.lastJumpTick = state.currentTick;
            AudioSynth.playJump();
            // Jump puff particles
            createDustPuff(player.x + 9, player.y + 36);
          } else if (player.isWallClinging && player.wallClingSide) {
            // Active Wall kick jump! Bounce in opposite direction!
            player.vy = -8.2;
            player.vx = player.wallClingSide === 'left' ? 6.5 : -6.5;
            player.isWallClinging = false;
            player.direction = player.wallClingSide === 'left' ? 'right' : 'left';
            player.doubleJumpsLeft = 1; // Wall clinging resets double jump as a reward
            player.lastJumpTick = state.currentTick;
            AudioSynth.playJump();
            createDustPuff(player.wallClingSide === 'left' ? player.x : player.x + 18, player.y + 20);
          } else if (player.doubleJumpsLeft > 0) {
            // Air double jump!
            player.vy = -8.2;
            player.doubleJumpsLeft--;
            player.lastJumpTick = state.currentTick;
            AudioSynth.playJump();

            // Expanding cyan shockwave halo centered at player feet on double jump
            state.particles.push({
              x: player.x + 9,
              y: player.y + 25,
              vx: 0,
              vy: 0,
              color: 'rgba(34, 211, 238, 0.75)',
              size: 5,
              alpha: 0.8,
              decay: 0.05,
              gravity: 0,
              dampening: 1,
              type: 'shockwave'
            });

            // Double jump special cyan shockwave particles
            createDustPuff(player.x + 9, player.y + 25);
            for (let i = 0; i < 8; i++) {
              state.particles.push({
                x: player.x + 9,
                y: player.y + 25,
                vx: (Math.random() - 0.5) * 5,
                vy: (Math.random() - 0.2) * 3,
                color: '#22d3ee', // Cyan burst
                size: Math.random() * 3 + 1,
                alpha: 0.9,
                decay: 0.05,
                gravity: 0.02,
                dampening: 0.95,
                type: 'dust'
               });
             }
          }
          // Prevent rapid holding jump restart loop
          keysPressed.current['w'] = false;
          keysPressed.current['arrowup'] = false;
          keysPressed.current[' '] = false;
        }

        // Taper Coyote timer window and reset double jumps
        if (player.isGrounded || player.isWallClinging) {
          player.coyoteTime = 6;
          player.doubleJumpsLeft = 1;
        } else if (player.coyoteTime > 0) {
          player.coyoteTime -= dt;
        }
      }

      // Solid collision processing
      player.isWallClinging = false;
      player.wallClingSide = null;

      // X mechanics coordinate motion
      player.x += player.vx * dt;
      resolveBoxCollisions(player, activeLevel.platforms, 'x', dt);

      // Y mechanics coordinate motion
      const wasGrounded = player.isGrounded;
      const preFallVy = player.vy;
      player.y += player.vy * dt;
      player.isGrounded = false;
      resolveBoxCollisions(player, activeLevel.platforms, 'y', dt);

      // Juicy landing feedback
      if (player.isGrounded && !wasGrounded) {
        player.lastLandTick = state.currentTick;
        if (preFallVy > 1.8) {
          createDustPuff(player.x + player.width / 2, player.y + player.height - 3);
          if (preFallVy > 6.8) {
            state.camera.shake = 3 * settings.screenShakeMultiplier;
          }
        }
      }

      // Check spike hazards bounds
      checkHazardDeath(player, activeLevel.platforms);

      // Map boundary lockdown
      if (player.x < 30) {
        player.x = 30;
        player.vx = 0;
      } else if (player.x + player.width > activeLevel.width - 30) {
        player.x = activeLevel.width - 30 - player.width;
        player.vx = 0;
      }
      if (player.y > activeLevel.height + 40) {
        // Fall into darkness death!
        triggerPlayerDeath('Fell into oblivion...');
      }
    }

    // 7. BULLET PHYSICS & SWORD REFLECTIONS
    for (let i = state.bullets.length - 1; i >= 0; i--) {
      const b = state.bullets[i];
      let bulletDied = false;

      // 2 sub-steps of physics updates to ensure 100% collision accuracy at higher speeds
      const numSubsteps = 2;
      for (let step = 0; step < numSubsteps; step++) {
        if (bulletDied) break;

        b.x += (b.vx * dt) / numSubsteps;
        b.y += (b.vy * dt) / numSubsteps;

        // Slasher Deflection Intersection
      if (player.isSlasherActive && !player.isDead && !b.isDeflected) {
        // Compute sword collision sector circle bounds overlay
        const slashRadius = 65;
        const pCenterX = player.x + player.width / 2;
        const pCenterY = player.y + player.height / 2;
        const dist = Math.hypot(b.x - pCenterX, b.y - pCenterY);

        if (dist <= slashRadius) {
          // Check if bullet falls within slash cone angle
          const angleToBullet = Math.atan2(b.y - pCenterY, b.x - pCenterX);
          let angleDiff = Math.abs(angleToBullet - player.slashAngle);
          // Normalize angle wrapping bounds
          if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;

          if (angleDiff <= Math.PI * 0.72) { // wide swing sweep parry
            b.isDeflected = true;
            b.startX = b.x;
            b.startY = b.y;
            
            // Aim deflected bullet:
            // 1. Locate closest active enemy to target auto-snipe bounce!
            let targetEnemy: EnemyState | null = null;
            let minDist = Infinity;
            state.enemies.forEach(e => {
              if (e.state !== 'dead') {
                const ed = Math.hypot(e.x - b.x, e.y - b.y);
                if (ed < minDist) {
                  minDist = ed;
                  targetEnemy = e;
                }
              }
            });

            if (targetEnemy) {
              // Direct sniper reflection towards enemy target!
              const dx = (targetEnemy as EnemyState).x + 9 - b.x;
              const dy = (targetEnemy as EnemyState).y + 19 - b.y;
              const mag = Math.hypot(dx, dy);
              b.vx = (dx / mag) * 32;
              b.vy = (dy / mag) * 32;
            } else {
              // Standard straight recoil backwards fast
              b.vx = -b.vx * 1.5;
              b.vy = -b.vy * 1.5;
            }

             // High volume spark explosion feedback!
             AudioSynth.playDeflect();
             state.camera.freezeTimeRemaining = settings.hitstopDurationMs + 30; // Freeze world frame!
             state.camera.shake = 18 * settings.screenShakeMultiplier; // Gigantic impact shake!
 
             // 1. Dual expanding shockwave rings centered on parry spot
             state.particles.push({
               x: b.x,
               y: b.y,
               vx: 0,
               vy: 0,
               color: 'rgba(255, 255, 255, 0.95)',
               size: 3,
               alpha: 1.0,
               decay: 0.05,
               gravity: 0,
               dampening: 1,
               type: 'shockwave'
             });
             state.particles.push({
               x: b.x,
               y: b.y,
               vx: 0,
               vy: 0,
               color: 'rgba(34, 211, 238, 0.8)',
               size: 12,
               alpha: 0.85,
               decay: 0.04,
               gravity: 0,
               dampening: 1,
               type: 'shockwave'
             });
 
             // 2. High-speed linear cutting sparks shooting out in radial directions
             for (let k = 0; k < 6; k++) {
               const ang = Math.random() * Math.PI * 2;
               const spd = 6 + Math.random() * 8;
               state.particles.push({
                 x: b.x,
                 y: b.y,
                 vx: Math.cos(ang) * spd,
                 vy: Math.sin(ang) * spd,
                 color: '#ffffff',
                 size: 2.2,
                 alpha: 1.0,
                 decay: 0.06,
                 gravity: 0,
                 dampening: 0.95,
                 type: 'slash_line'
               });
             }
 
             // Generate neon deflection fragments sparks
             const pCount = Math.floor(18 * settings.particleCountMultiplier);
             for (let k = 0; k < pCount; k++) {
               state.particles.push({
                 x: b.x,
                 y: b.y,
                 vx: -b.vx * 0.4 + (Math.random() - 0.5) * 8,
                 vy: -b.vy * 0.4 + (Math.random() - 0.5) * 8,
                 color: '#38bdf8', // Blue neon deflection spike sparks
                 size: Math.random() * 3 + 2,
                 alpha: 1.0,
                 decay: 0.04,
                 gravity: 0.05,
                 dampening: 0.95,
                 type: 'spark'
               });
             }
          }
        }
      }

      // Check collision with platform walls
      bulletDied = false;
      for (const plat of activeLevel.platforms) {
        if (plat.type === 'solid' && 
            b.x >= plat.x && b.x <= plat.x + plat.width &&
            b.y >= plat.y && b.y <= plat.y + plat.height) {
          bulletDied = true;
          // Spawn wall metal small dust spark
          for (let j = 0; j < 4; j++) {
            state.particles.push({
              x: b.x,
              y: b.y,
              vx: (Math.random() - 0.5) * 3,
              vy: (Math.random() - 0.5) * 3,
              color: '#facc15', // yellow sparks
              size: 2,
              alpha: 0.8,
              decay: 0.07,
              gravity: 0.1,
              dampening: 0.9,
              type: 'spark'
            });
          }
          break;
        }
      }

      // Check player damage collision bounds
      if (!bulletDied && !b.isDeflected && !player.isDead) {
        const pCenterX = player.x + player.width / 2;
        const pCenterY = player.y + player.height / 2;
        const distToPlayer = Math.hypot(b.x - pCenterX, b.y - pCenterY);
        
        if (distToPlayer <= 16) {
          if (player.isDashing) {
            // Player is invul during dash frames, dodge bullet! (Matrix evade)
          } else {
            bulletDied = true;
            triggerPlayerDeath('Slashed by a laser bullet.');
          }
        }
      }

      // Check bullet enemy damage hits (Only from deflected bullets)
      if (!bulletDied && b.isDeflected) {
        for (const enemy of state.enemies) {
          if (enemy.health > 0) {
            const eCenterX = enemy.x + enemy.width / 2;
            const eCenterY = enemy.y + enemy.height / 2;
            const distToEnemy = Math.hypot(b.x - eCenterX, b.y - eCenterY);

            if (distToEnemy <= 18) {
              bulletDied = true;
              damageEnemy(enemy, 1, Math.atan2(b.vy, b.vx));
              break;
            }
          }
        }
      }
      } // End of bullet physics substeps loop

      // Retain or slice bullets out
      if (bulletDied || b.x < 0 || b.x > activeLevel.width || b.y < 0 || b.y > activeLevel.height) {
        state.bullets.splice(i, 1);
      }
    }

    // 8. ENEMY INTELLIGENT BEHAVIOR & SHOOT AI
    for (const enemy of state.enemies) {
      if (enemy.health <= 0) {
        // Increment fall gravity for organic dead drops on platform floors
        enemy.vy += 0.35 * dt;
        enemy.y += enemy.vy * dt;
        resolveBoxCollisions(enemy, activeLevel.platforms, 'y', dt);
        continue;
      }

      // Relentless physics & gravity for alive enemies! 
      // This allows them to walk off platforms dynamically to hunt the player, rather than hovering.
      enemy.vy += 0.38 * dt;
      enemy.y += enemy.vy * dt;
      resolveBoxCollisions(enemy, activeLevel.platforms, 'y', dt);

      // Spikes collision check: spikes kill the enemy instantly with satisfying fx!
      let enemyCollidedWithSpike = false;
      for (const plat of activeLevel.platforms) {
        if (plat.type !== 'spike') continue;
        const collidesWithSpike = (
          enemy.x < plat.x + plat.width - 2 &&
          enemy.x + enemy.width > plat.x + 2 &&
          enemy.y < plat.y + plat.height &&
          enemy.y + enemy.height > plat.y
        );
        if (collidesWithSpike) {
          enemyCollidedWithSpike = true;
          break;
        }
      }
      if (enemyCollidedWithSpike) {
        damageEnemy(enemy, enemy.health, -Math.PI / 2);
        continue; // enemy died, skip further processing this tick
      }

      const dxToPlayer = player.x - enemy.x;
      const dyToPlayer = player.y - enemy.y;
      const distToPlayer = Math.hypot(dxToPlayer, dyToPlayer);

      // Vision check: inside vision cone?
      const inRangeOfSight = distToPlayer < 280;
      const isFacingPlayer = (enemy.direction === 'left' && dxToPlayer < 0) || 
                            (enemy.direction === 'right' && dxToPlayer > 0);
      const hasDirectLineOfSight = inRangeOfSight && (isFacingPlayer || distToPlayer < 90) && !player.isDead;

      // Behavior decision finite state machine state changes
      if (hasDirectLineOfSight) {
        if (enemy.state === 'patrol') {
          enemy.state = 'alert';
          enemy.alertExclamationTimer = 25; // Play alert banner bubble!
          enemy.noticeTimer = 15; // Delay attack preparation
        }
      } else {
        // Relentless pursuit within 750px of player: stay alert and chase!
        if (enemy.state === 'alert' && distToPlayer > 750) {
          enemy.state = 'patrol';
        }
      }

      // Execute specific behaviors
      if (enemy.state === 'patrol') {
        const patrolSpeed = 1.2 * dt;
        if (enemy.patrolMaxX > enemy.patrolMinX) {
          if (enemy.direction === 'right') {
            enemy.vx = patrolSpeed;
            if (enemy.x >= enemy.patrolMaxX || isHeadingTowardSpike(enemy, 1, activeLevel.platforms)) {
              enemy.direction = 'left';
            }
          } else {
            enemy.vx = -patrolSpeed;
            if (enemy.x <= enemy.patrolMinX || isHeadingTowardSpike(enemy, -1, activeLevel.platforms)) {
              enemy.direction = 'right';
            }
          }
          enemy.x += enemy.vx;
          resolveBoxCollisions(enemy, activeLevel.platforms, 'x', dt);
        }
      } else if (enemy.state === 'alert' || enemy.state === 'attack') {
        // Target tracking with reaction delay/turn cooldown so players can slip behind!
        if (enemy.turnCooldown === undefined) {
          enemy.turnCooldown = 0;
        }

        if (enemy.turnCooldown > 0) {
          enemy.turnCooldown -= dt;
        }

        const desiredDirection = dxToPlayer > 0 ? 'right' : 'left';
        if (enemy.direction !== desiredDirection) {
          if (enemy.turnCooldown <= 0) {
            enemy.direction = desiredDirection;
            // Shield enemies take longer to turn around (clunky shield) than normal grunts
            enemy.turnCooldown = enemy.type === 'shield' ? 36 : 14;
          }
        }
        
        enemy.noticeTimer -= dt;
        
        if (enemy.noticeTimer <= 0) {
          // Act on combat class type (shorter shooter handling)
          if (enemy.type === 'gunner' || enemy.type === 'sniper' || enemy.type === 'shotgunner') {
            enemy.shootCooldown -= dt;
            if (enemy.shootCooldown <= 0) {
              const spread = (Math.random() - 0.5) * (enemy.type === 'sniper' ? 0.04 : 0.12);
              const shootAngle = Math.atan2(dyToPlayer, dxToPlayer) + spread;
              
              if (enemy.type === 'shotgunner') {
                // FIRE 4-PELLET SPREAD SHOTGUN BLAST!
                const numPellets = 4;
                const spreadIncrement = 0.16;
                for (let pIdx = 0; pIdx < numPellets; pIdx++) {
                  const pelletAngle = shootAngle + (pIdx - (numPellets - 1) / 2) * spreadIncrement + (Math.random() - 0.5) * 0.03;
                  const bSpeed = (6.0 + Math.random() * 1.5) * 2.0;
                  const bulletX = enemy.x + (enemy.direction === 'right' ? 24 : -6);
                  const bulletY = enemy.y + 14;
                  state.bullets.push({
                    id: `bullet_${Date.now()}_shg_${pIdx}_${Math.random()}`,
                    x: bulletX,
                    y: bulletY,
                    vx: Math.cos(pelletAngle) * bSpeed,
                    vy: Math.sin(pelletAngle) * bSpeed,
                    radius: 5,
                    isDeflected: false,
                    ownerId: enemy.id,
                    startX: bulletX,
                    startY: bulletY
                  });
                }
                
                // Extra visual blast sparks
                for (let f = 0; f < 12; f++) {
                  state.particles.push({
                    x: enemy.x + (enemy.direction === 'right' ? 24 : -6),
                    y: enemy.y + 14,
                    vx: Math.cos(shootAngle + (Math.random() - 0.5) * 0.5) * (4 + Math.random() * 6),
                    vy: Math.sin(shootAngle + (Math.random() - 0.5) * 0.5) * (4 + Math.random() * 6),
                    color: Math.random() < 0.6 ? '#f97316' : '#ef4444',
                    size: Math.random() * 4 + 1.5,
                    alpha: 0.95,
                    decay: 0.08,
                    gravity: 0.05,
                    dampening: 0.88,
                    type: 'spark'
                  });
                }
                
                AudioSynth.playBulletFired();
                enemy.shootCooldown = 75; // Slower fire rate (cooldown) for shotgunner (was 135)
              } else {
                // NORMAL GUNNER / SNIPER SINGLE SHOT
                const bSpeed = (enemy.type === 'sniper' ? 12.0 : 7.0) * 2.0;
                const bulletX = enemy.x + (enemy.direction === 'right' ? 24 : -6);
                const bulletY = enemy.y + 14;
                state.bullets.push({
                  id: `bullet_${Date.now()}_${Math.random()}`,
                  x: bulletX,
                  y: bulletY,
                  vx: Math.cos(shootAngle) * bSpeed,
                  vy: Math.sin(shootAngle) * bSpeed,
                  radius: 5,
                  isDeflected: false,
                  ownerId: enemy.id,
                  startX: bulletX,
                  startY: bulletY
                });
                
                // Gun nozzle flash particles
                for (let f = 0; f < 5; f++) {
                  state.particles.push({
                    x: enemy.x + (enemy.direction === 'right' ? 24 : -6),
                    y: enemy.y + 14,
                    vx: Math.cos(shootAngle) * (4 + Math.random() * 4),
                    vy: Math.sin(shootAngle) * (Math.random() - 0.5) * 3,
                    color: '#ff9900',
                    size: Math.random() * 3 + 1,
                    alpha: 0.9,
                    decay: 0.1,
                    gravity: 0,
                    dampening: 0.9,
                    type: 'spark'
                  });
                }
                
                AudioSynth.playBulletFired();
                enemy.shootCooldown = enemy.type === 'sniper' ? 22 : 45; // sniper fast (was 45), gunner moderate (was 100)
              }
            }
          } else if (enemy.type === 'grunt' || enemy.type === 'shield') {
            // Chase down player to strike!
            const chaseSpeed = (enemy.type === 'shield' ? 1.4 : 2.5) * dt;
            const dirX = enemy.direction === 'right' ? 1 : -1;
            
            // Do not actively walk off platform or run into a spike field
            if (isHeadingTowardSpike(enemy, dirX, activeLevel.platforms)) {
              enemy.vx = 0;
            } else {
              enemy.vx = dirX * chaseSpeed;
            }
            
            enemy.x += enemy.vx;
            resolveBoxCollisions(enemy, activeLevel.platforms, 'x', dt);

            // Intelligent climbing jump check: if running and blocked horizontally, or player is significantly higher, leap!
            if (enemy.vy === 0 && (Math.abs(enemy.vx) <= 0.1 || (dyToPlayer < -40 && Math.random() < 0.04))) {
              enemy.vy = -6.8; // jump upwards to scale vertical barriers
            }

            // Trigger melee attack at extremely close range
            if (distToPlayer < 38) {
              enemy.attackCooldown -= dt;
              if (enemy.attackCooldown <= 0) {
                // Slicing wind slice from melee!
                if (!player.isDead && !player.isDashing) {
                  triggerPlayerDeath('Sliced down in melee battle.');
                }
                enemy.attackCooldown = 50; // swing delay
              }
            }
          }
        }
      }

      // Check if Player gets within sweeping sword slash of enemy grunts
      if (player.isSlasherActive && !player.isDead) {
        const slashRadius = 70;
        const pCenterX = player.x + player.width / 2;
        const pCenterY = player.y + player.height / 2;
        const eCenterX = enemy.x + enemy.width / 2;
        const eCenterY = enemy.y + enemy.height / 2;
        const d = Math.hypot(eCenterX - pCenterX, eCenterY - pCenterY);

        if (d <= slashRadius) {
          // Inside cutting angle arc?
          const angleToEnemy = Math.atan2(eCenterY - pCenterY, eCenterX - pCenterX);
          let angleDiff = Math.abs(angleToEnemy - player.slashAngle);
          if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;

          if (angleDiff <= Math.PI * 0.7) {
            // Defeated by slash slice!
            if (enemy.type === 'shield') {
              // Direct shield block defense if facing player slash and not slashing from above, below, or behind!
              const isPlayerOnRight = player.x > enemy.x;
              const isShieldFacingRight = enemy.direction === 'right';
              
              // Generous checks for above and below to ensure responsive and fair collision bypass
              const isPlayerAbove = (player.y + player.height < enemy.y + 22) || (pCenterY < enemy.y + 10) || (Math.sin(angleToEnemy) > 0.60);
              const isPlayerBelow = (player.y > enemy.y + enemy.height - 22) || (pCenterY > enemy.y + enemy.height - 10) || (Math.sin(angleToEnemy) < -0.60);
              const isFacingFront = (isPlayerOnRight && isShieldFacingRight) || (!isPlayerOnRight && !isShieldFacingRight);
              
              const hitShieldFacingFront = isFacingFront && !isPlayerAbove && !isPlayerBelow;

              if (hitShieldFacingFront) {
                // BLOCK! Sparks recoil!
                AudioSynth.playDeflect();
                player.vx = isPlayerOnRight ? 4 : -4; // bounce player
                state.camera.shake = 5;

                for (let k = 0; k < 6; k++) {
                  state.particles.push({
                    x: enemy.x + (isShieldFacingRight ? 24 : -4),
                    y: enemy.y + 18,
                    vx: (isShieldFacingRight ? 3 : -3) + (Math.random() * 2),
                    vy: (Math.random() - 0.5) * 5,
                    color: '#d4d4d8', // metal block sparks
                    size: Math.random() * 2 + 1,
                    alpha: 0.9,
                    decay: 0.08,
                    gravity: 0.1,
                    dampening: 0.9,
                    type: 'spark'
                  });
                }
                // Break attacking trigger to avoid killing on same frame
                player.isSlasherActive = false;
              } else {
                // Slice from behind! Fatal damage!
                damageEnemy(enemy, 1, player.slashAngle);
              }
            } else {
              // Instantly cut down!
              damageEnemy(enemy, 1, player.slashAngle);
            }
          }
        }
      }
    }

    // 9. ANIMATIONS AND DECAYING PARTICLES SYSTEMS
    for (let i = state.particles.length - 1; i >= 0; i--) {
      const p = state.particles[i];

      if (p.type === 'dash_ghost') {
        p.alpha -= p.decay;
        if (p.alpha <= 0) state.particles.splice(i, 1);
        continue;
      }

      if (p.type === 'shockwave') {
        p.size += 4.5 * dt; // Rapid radial ring expansion!
        p.alpha -= p.decay * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.alpha <= 0) {
          state.particles.splice(i, 1);
        }
        continue;
      }

      p.vx *= Math.pow(p.dampening, dt);
      p.vy *= Math.pow(p.dampening, dt);
      p.vy += p.gravity * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.alpha -= p.decay * dt;

      // Splat wall collision checks for Blood particles
      if (p.type === 'blood') {
        for (const plat of activeLevel.platforms) {
          if (p.x >= plat.x && p.x <= plat.x + plat.width &&
              p.y >= plat.y && p.y <= plat.y + plat.height) {
            
            // Generate STATIC blood splat decals clinging onto this platform surface!
            if (Math.random() < 0.4 * settings.bloodAmountMultiplier) {
              state.bloodDecals.push({
                x: p.x,
                y: p.y,
                size: Math.random() * 8 + 3,
                color: '#ef4444', // Dark rich red gore
                rotation: Math.random() * Math.PI * 2,
                shape: Math.random() < 0.4 ? 'streak' : 'splat'
              });

              // Keep maximum limit of decals to prevent canvas overlay slowdown
              if (state.bloodDecals.length > 500) {
                state.bloodDecals.shift();
              }
            }
            p.alpha = 0; // kill dynamic particle
            break;
          }
        }
      }

      if (p.alpha <= 0) {
        state.particles.splice(i, 1);
      }
    }

    // Camera tracker centered smoothly on Player coordinates
    const targetCamX = player.x - 480;
    const targetCamY = player.y - 300;
    state.camera.x += (targetCamX - state.camera.x) * 0.12;
    state.camera.y += (targetCamY - state.camera.y) * 0.12;

    // Bounds lock
    state.camera.x = Math.max(0, Math.min(activeLevel.width - 960, state.camera.x));
    state.camera.y = Math.max(0, Math.min(activeLevel.height - 540, state.camera.y));

    // Screen Shake decays
    if (state.camera.shake > 0) {
      state.camera.shake *= 0.88;
      if (state.camera.shake < 0.2) state.camera.shake = 0;
    }

    // Level success criteria: All enemies cleared!
    const activeEnemiesCount = state.enemies.filter(e => e.health > 0).length;
    if (activeEnemiesCount === 0 && !player.isDead) {
      if (isEndlessMode) {
        // Prepare spawn wave update
        setEndlessWave(prev => prev + 1);
        setEndlessCombo(prev => prev + 3);
        setComboTimer(100);
        state.endlessSpawnCooldown = 40;
      } else {
        if (state.levelClearedCountdown === undefined || state.levelClearedCountdown <= 0) {
          state.levelClearedCountdown = 160; // 160 frames (around 2.5s) of cinematic bullet time
          state.levelClearedMax = 160;
          state.camera.shake = 16 * settings.screenShakeMultiplier;
          AudioSynth.stopBGM();
          try {
            AudioSynth.playKill(); // Deep bass cue for clearing hostiles!
          } catch(e) {}
        }
      }
    }

    // Process Level Cleared Countdown progression
    if (state.levelClearedCountdown !== undefined && state.levelClearedCountdown > 0) {
      state.levelClearedCountdown--;
      if (state.levelClearedCountdown <= 0) {
        // Countdown completed! Transition dynamically to the next level or victory final screen!
        if (currentLevelIndex < LEVELS.length - 1) {
          const nextIdx = currentLevelIndex + 1;
          setCurrentLevelIndex(nextIdx);
          setActiveLevel({ ...LEVELS[nextIdx] });
        } else {
          setGameState('victory');
        }
      }
    }

    state.currentTick++;
    renderGame(ctx);
    gameLoopRef.current = requestAnimationFrame(updateGame);
  }

  // COLLISION RESOLUTION AND DECALS CALCULATION HELPERS
  function resolveBoxCollisions(
    entity: { x: number; y: number; vx: number; vy: number; width: number; height: number; isGrounded?: boolean; isWallClinging?: boolean; wallClingSide?: 'left' | 'right' | null },
    platforms: Platform[],
    axis: 'x' | 'y',
    dt: number = 1.0
  ) {
    const isPlayer = entity === playStateRef.current.player;
    const isDownPressed = isPlayer && !!(keysPressed.current['s'] || keysPressed.current['arrowdown']);

    for (const plat of platforms) {
      if (plat.type !== 'solid' && plat.type !== 'one_way') continue; // only process solid and one_way platforms

      const collides = (
        entity.x < plat.x + plat.width &&
        entity.x + entity.width > plat.x &&
        entity.y < plat.y + plat.height &&
        entity.y + entity.height > plat.y
      );

      if (collides) {
        if (plat.type === 'one_way') {
          // One-way platforms: only collide on Y-axis, moving downward, previous bottom above top, and not pressing down (S or DownArrow)
          if (axis !== 'y') continue;
          if (entity.vy <= 0) continue;
          if (isDownPressed) continue;

          const prevBottom = entity.y + entity.height - (entity.vy * dt);
          if (prevBottom > plat.y + 6) continue; // it was already below or inside the platform
          
          // Land on platform floor
          entity.y = plat.y - entity.height;
          entity.vy = 0;
          if ('isGrounded' in entity) {
            entity.isGrounded = true;
          }
        } else {
          // Solid platform standard collision
          if (axis === 'x') {
            if (entity.vx > 0) { // moving right
              entity.x = plat.x - entity.width;
              entity.vx = 0;
              entity.isWallClinging = true;
              entity.wallClingSide = 'right';
            } else if (entity.vx < 0) { // moving left
              entity.x = plat.x + plat.width;
              entity.vx = 0;
              entity.isWallClinging = true;
              entity.wallClingSide = 'left';
            }
          } else if (axis === 'y') {
            if (entity.vy > 0) { // landing on platform floor
              entity.y = plat.y - entity.height;
              entity.vy = 0;
              if ('isGrounded' in entity) {
                entity.isGrounded = true;
              }
            } else if (entity.vy < 0) { // striking overhead roof limit
              entity.y = plat.y + plat.height;
              entity.vy = 0;
            }
          }
        }
      }
    }
  }

  function checkHazardDeath(player: PlayerState, platforms: Platform[]) {
    for (const plat of platforms) {
      if (plat.type !== 'spike') continue;
      const collides = (
        player.x < plat.x + plat.width - 4 &&
        player.x + player.width > plat.x + 4 &&
        player.y < plat.y + plat.height &&
        player.y + player.height > plat.y
      );
      if (collides) {
        triggerPlayerDeath('Skinned by ceiling spikes.');
        break;
      }
    }
  }

  function isHeadingTowardSpike(enemy: EnemyState, dirX: number, platforms: Platform[]): boolean {
    const checkX = enemy.x + enemy.width / 2 + (dirX > 0 ? 30 : -30);
    const projLeft = enemy.x + (dirX > 0 ? 15 : -15);
    const projRight = projLeft + enemy.width;
    const projY = enemy.y;

    for (const plat of platforms) {
      if (plat.type === 'spike') {
        const willCollide = (
          projLeft < plat.x + plat.width &&
          projRight > plat.x &&
          projY < plat.y + plat.height &&
          projY + enemy.height > plat.y
        );
        if (willCollide) return true;
      }
    }

    let highestSolidY = Infinity;
    let highestSpikeY = Infinity;

    const testX = checkX;
    for (const plat of platforms) {
      if (testX >= plat.x && testX <= plat.x + plat.width) {
        if (plat.type === 'solid' || plat.type === 'one_way') {
          const supportY = plat.y;
          if (supportY >= enemy.y + enemy.height - 10 && supportY < highestSolidY) {
            highestSolidY = supportY;
          }
        } else if (plat.type === 'spike') {
          const spikeY = plat.y;
          if (spikeY >= enemy.y + enemy.height - 10 && spikeY < highestSpikeY) {
            highestSpikeY = spikeY;
          }
        }
      }
    }

    if (highestSpikeY !== Infinity && (highestSolidY === Infinity || highestSpikeY <= highestSolidY + 5)) {
      if (highestSpikeY - (enemy.y + enemy.height) < 150) {
        return true;
      }
    }

    return false;
  }

  function triggerPlayerDeath(reason: string) {
    const state = playStateRef.current;
    if (state.player.isDead || state.player.isRewinding) return;

    state.player.isDead = true;
    state.camera.shake = 18 * settings.screenShakeMultiplier;
    state.camera.freezeTimeRemaining = 120; // extended hitstop freeze!

    AudioSynth.playKill();

    // Spawn massive beautiful violet/crimson player explosion particles
    for (let k = 0; k < 35; k++) {
      state.particles.push({
        x: state.player.x + 9,
        y: state.player.y + 19,
        vx: (Math.random() - 0.5) * 14,
        vy: (Math.random() - 0.5) * 14 - 3,
        color: Math.random() < 0.4 ? '#ff0055' : '#38bdf8', // Pink/Blue cyber splatter
        size: Math.random() * 6 + 3,
        alpha: 1.0,
        decay: 0.02,
        gravity: 0.15,
        dampening: 0.94,
        type: 'blood'
      });
    }

    // Instantly queue rewind sequence on tape after freeze frame delay
    setTimeout(() => {
      state.player.isRewinding = true;
      state.history = state.history.filter((_, idx) => idx % 2 === 0); // Compress frames count for visual high-speed rewind
    }, 450);
  }

  function damageEnemy(enemy: EnemyState, amount: number, hitAngle: number) {
    enemy.health -= amount;
    const state = playStateRef.current;

    state.camera.freezeTimeRemaining = settings.hitstopDurationMs + 20; // Extra visceral freeze on slaughter!
    state.camera.shake = 14 * settings.screenShakeMultiplier;

    AudioSynth.playKill();

    // Red expanding hit shockwave
    state.particles.push({
      x: enemy.x + enemy.width / 2,
      y: enemy.y + enemy.height / 2,
      vx: 0,
      vy: 0,
      color: 'rgba(239, 68, 68, 0.9)', // Red expanding ring
      size: 6,
      alpha: 1.0,
      decay: 0.04,
      gravity: 0,
      dampening: 1,
      type: 'shockwave'
    });
    state.particles.push({
      x: enemy.x + enemy.width / 2,
      y: enemy.y + enemy.height / 2,
      vx: 0,
      vy: 0,
      color: 'rgba(255, 255, 255, 0.95)', // White core ring
      size: 3,
      alpha: 1.0,
      decay: 0.05,
      gravity: 0,
      dampening: 1,
      type: 'shockwave'
    });

    // Spiky cutting red slash marks across enemy coordinate
    for (let k = 0; k < 5; k++) {
      const slashAngle = hitAngle + Math.PI / 2 + (Math.random() - 0.5) * 0.4;
      const spd = 6 + Math.random() * 8;
      state.particles.push({
        x: enemy.x + enemy.width / 2,
        y: enemy.y + enemy.height / 2,
        vx: Math.cos(slashAngle) * spd,
        vy: Math.sin(slashAngle) * spd,
        color: '#ef4444',
        size: 3.2,
        alpha: 1.0,
        decay: 0.05,
        gravity: 0.02,
        dampening: 0.94,
        type: 'slash_line'
      });
    }

    if (enemy.health <= 0) {
      enemy.state = 'dead';
      enemy.deathTimer = 600; // static body remains

      if (isEndlessMode) {
        const comboBonus = endlessCombo + 1;
        const pts = 100 * comboBonus;
        setEndlessScore(prev => {
          const next = prev + pts;
          if (next > highScore) {
            setHighScore(next);
            localStorage.setItem('katana_high_score', String(next));
          }
          return next;
        });

        setEndlessCombo(prev => Math.min(10, prev + 1));
        setComboTimer(100);
      }

      // Generate amazing arterial horizontal blood fountain spray on impact angle direction!
      const pCount = Math.floor(35 * settings.particleCountMultiplier);
      const sprayForceX = Math.cos(hitAngle) * 9.5;
      const sprayForceY = Math.sin(hitAngle) * 7.5;

      for (let i = 0; i < pCount; i++) {
        state.particles.push({
          x: enemy.x + 9,
          y: enemy.y + 19,
          vx: sprayForceX + (Math.random() - 0.5) * 9,
          vy: sprayForceY + (Math.random() - 0.5) * 9 - 2.5,
          color: '#dc2626', // Blood crimson red
          size: Math.random() * 6 + 2,
          alpha: 1.0,
          decay: 0.02,
          gravity: 0.22,
          dampening: 0.94,
          type: 'blood'
        });
      }
    } else {
      // Light non-fatal spark slash feedback
      for (let i = 0; i < 8; i++) {
        state.particles.push({
          x: enemy.x + 9,
          y: enemy.y + 19,
          vx: (Math.random() - 0.5) * 6,
          vy: (Math.random() - 0.5) * 6,
          color: '#ef4444',
          size: 2,
          alpha: 1.0,
          decay: 0.05,
          gravity: 0.05,
          dampening: 0.9,
          type: 'spark'
        });
      }
    }
  }

  function createDustPuff(x: number, y: number) {
    const state = playStateRef.current;
    for (let i = 0; i < 6; i++) {
      state.particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 4,
        vy: -Math.random() * 2,
        color: '#e4e4e7',
        size: Math.random() * 3 + 2,
        alpha: 0.6,
        decay: 0.04,
        gravity: 0.02,
        dampening: 0.92,
        type: 'dust'
      });
    }
  }

  // GRAPHICS AND RETRO VAPORWAVE SCREEN ENGINE
  function renderGame(ctx: CanvasRenderingContext2D) {
    const state = playStateRef.current;
    const wantsSlowMo = !!(keysPressed.current['q'] || keysPressed.current['right_click'] || keysPressed.current['control']);
    const canBulletTime = settings.infiniteBulletTime || state.player.bulletTimeEnergy > 0;
    const isLevelClearedCinematic = state.levelClearedCountdown !== undefined && state.levelClearedCountdown > 0;
    const isCurrentlySlow = (wantsSlowMo && canBulletTime && !state.player.isDead && !state.player.isRewinding) || isLevelClearedCinematic;

    const shakeX = (Math.random() - 0.5) * state.camera.shake;
    const shakeY = (Math.random() - 0.5) * state.camera.shake;

    ctx.save();
    // Clear display back buffer
    ctx.fillStyle = '#06050b'; // Deep space black base
    ctx.fillRect(0, 0, 960, 540);

    // Draw cyber landscape city parallax layers
    drawCyberpunkParallaxBackground(ctx, state.camera.x, state.camera.y, shakeX, shakeY);
    ctx.restore();

    ctx.save();
    // Apply Screen Shake with camera coordinates translations for foreground
    ctx.translate(-state.camera.x + shakeX, -state.camera.y + shakeY);

    // Draw cyber grid lines background as subtle overlay on floors/walls
    drawCyberGridLines(ctx, activeLevel.width, activeLevel.height);

    // Draw Static decalled Blood Splatters on floors and walls! (Signature design element)
    state.bloodDecals.forEach(decal => {
      ctx.save();
      ctx.translate(decal.x, decal.y);
      ctx.rotate(decal.rotation);
      ctx.fillStyle = decal.color;
      ctx.beginPath();
      if (decal.shape === 'splat') {
        ctx.arc(0, 0, decal.size, 0, Math.PI * 2);
        ctx.fill();
        // side drips
        ctx.arc(decal.size * 0.5, decal.size * 0.2, decal.size * 0.3, 0, Math.PI * 2);
        ctx.fill();
      } else { // streak/drip
        ctx.ellipse(0, 0, decal.size * 1.8, decal.size * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });

    // Draw Game Level Platforms
    activeLevel.platforms.forEach(plat => {
      if (plat.type === 'solid') {
        // Metallic dark grey structures with cyan outline
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
        
        ctx.strokeStyle = '#22d3ee'; // Cyan cyber edge line
        ctx.lineWidth = 2;
        ctx.strokeRect(plat.x, plat.y, plat.width, plat.height);
      } else if (plat.type === 'one_way') {
        // Beautiful semi-translucent pass-through grid plate
        ctx.fillStyle = 'rgba(14, 116, 144, 0.35)'; // semi-translucent elegant teal glass
        ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
        
        ctx.strokeStyle = '#22d3ee'; // bright cyan top bar edge
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(plat.x, plat.y);
        ctx.lineTo(plat.x + plat.width, plat.y);
        ctx.stroke();

        // Elegant dashed subtitle glow
        ctx.strokeStyle = 'rgba(34, 211, 238, 0.44)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 6]);
        ctx.beginPath();
        ctx.moveTo(plat.x, plat.y + 4);
        ctx.lineTo(plat.x + plat.width, plat.y + 4);
        ctx.stroke();
        ctx.setLineDash([]); // clear dash state
      } else if (plat.type === 'spike') {
        // Draw sharp death points
        ctx.fillStyle = plat.color || '#f43f5e';
        const spikeCount = Math.floor(plat.width / 10);
        for (let i = 0; i < spikeCount; i++) {
          ctx.beginPath();
          ctx.moveTo(plat.x + i * 10, plat.y + plat.height);
          ctx.lineTo(plat.x + i * 10 + 5, plat.y);
          ctx.lineTo(plat.x + (i + 1) * 10, plat.y + plat.height);
          ctx.fill();
        }
      }
    });

    // Draw Decaying and Spark Particle Effects
    state.particles.forEach(p => {
      ctx.save();
      
      // DECREASE BRIGHTNESS/OPACITY FOR NON-BULLET PARTICLES
      // Non-bullet particle effects are made significantly dimmer/softer to avoid distracting from actual lethal bullets
      let finalAlpha = p.alpha;
      if (p.type === 'spark') {
        finalAlpha = p.alpha * 0.22; // Very dim, faint spark lines
      } else if (p.type === 'dust' || p.type === 'slash_debris') {
        finalAlpha = p.alpha * 0.15; // Extremely faint environmental dust
      } else if (p.type === 'shockwave') {
        finalAlpha = p.alpha * 0.25; // Subtle ripple ring outline
      } else if (p.type === 'slash_line') {
        finalAlpha = p.alpha * 0.3;  // Translucent attack slash path
      } else if (p.type === 'blood') {
        finalAlpha = p.alpha * 0.4;  // Softer darker blood splatters
      } else if (p.type === 'dash_ghost') {
        finalAlpha = p.alpha * 0.48; // Crisp, high-vis neon trails
      }
      
      ctx.globalAlpha = finalAlpha;
      ctx.fillStyle = p.color;

      if (p.type === 'dash_ghost') {
        const dir = p.direction || 'right';
        ctx.save();
        // Elegant chromatic aberration split (Cyan and Hot Pink offsets)
        drawPixelSamuraiGhost(ctx, p.x - 1.5, p.y, state.player.width, state.player.height, '#22d3ee', dir);
        drawPixelSamuraiGhost(ctx, p.x + 1.5, p.y, state.player.width, state.player.height, '#ec4899', dir);
        ctx.restore();
      } else if (p.type === 'shockwave') {
        // Render majestic expanding rings
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1.5; // thinner line to look less bulky
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.stroke();
      } else if (p.type === 'slash_line') {
        // Draw elegant linear sword slice trails
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.size * 0.7; // Thinner slash trails
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + p.vx * 3.0, p.y + p.vy * 3.0);
        ctx.stroke();
      } else if (p.type === 'spark') {
        // Long laser metal sparks streaks
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 0.8, 0, Math.PI * 2); // Slightly smaller spark dots
        ctx.fill();
      } else if (p.type === 'blood') {
        ctx.beginPath();
        // ellipse shape representing trajectory stretch
        const len = Math.hypot(p.vx, p.vy);
        const ang = Math.atan2(p.vy, p.vx);
        ctx.translate(p.x, p.y);
        ctx.rotate(ang);
        ctx.ellipse(0, 0, p.size * (1 + len * 0.12), p.size * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();
      } else { // Dust/slash_debris
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 0.7, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });

    // Draw active level enemies
    state.enemies.forEach(enemy => {
      if (enemy.health <= 0) {
        // Render dead corpse rotated pool on floor
        ctx.save();
        ctx.translate(enemy.x + 9, enemy.y + 30);
        ctx.rotate(Math.PI / 2 * (enemy.direction === 'right' ? 1 : -1));
        ctx.fillStyle = '#27272a'; // Grey charcoal uniform shade
        ctx.fillRect(-18, -9, 36, 18);
        
        // Draw splash marks pools
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.arc(-8, 5, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        return;
      }

      // Live animated enemies shapes
      drawPixelEnemy(ctx, enemy, state.currentTick);
    });

    // Draw player bullets lasers
    state.bullets.forEach(b => {
      ctx.save();
      
      // BULLETS ARE THE ULTIMATE PRIORITY IN LEVEL READING
      // Give bullets an intense neon glow shadow and bright contrasting neon stroke
      const bulletColor = b.isDeflected ? '#22d3ee' : '#ff3366'; // Glowing Cyan or Hot Pink/Crimson
      
      ctx.shadowColor = bulletColor;
      ctx.shadowBlur = 15; // Enhanced glowing neon aura around the bullet
      
      const maxLen = Math.hypot(b.vx, b.vy) * 4.5; // Supersonic epic long laser trail
      const distFromStart = b.startX !== undefined && b.startY !== undefined ? Math.hypot(b.x - b.startX, b.y - b.startY) : maxLen;
      const len = Math.min(maxLen, distFromStart);
      const angle = Math.atan2(b.vy, b.vx);
      const hx = b.x;
      const hy = b.y;
      const tx = b.x - Math.cos(angle) * len;
      const ty = b.y - Math.sin(angle) * len;
      
      const perpX = -Math.sin(angle);
      const perpY = Math.cos(angle);
      
      // Draw a beautifully tapered neon laser trail polygon (from thick head to sharp tail)
      const headWidth = 7.0; // wider neon laser head
      const tailWidth = 0.5; // sharp narrowing trailing tip
      
      ctx.fillStyle = bulletColor;
      ctx.beginPath();
      ctx.moveTo(hx + perpX * headWidth / 2, hy + perpY * headWidth / 2);
      ctx.lineTo(hx - perpX * headWidth / 2, hy - perpY * headWidth / 2);
      ctx.lineTo(tx - perpX * tailWidth / 2, ty - perpY * tailWidth / 2);
      ctx.lineTo(tx + perpX * tailWidth / 2, ty + perpY * tailWidth / 2);
      ctx.closePath();
      ctx.fill();

      // glowing white focal bullet core / nucleus (super bright center)
      ctx.shadowBlur = 4; // lesser shadow for nucleus
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius + 0.5, 0, Math.PI * 2); // Point nucleus
      ctx.fill();
      
      ctx.restore();
    });

    // Draw Player (The Dragon / Slasher Samurai)
    const player = state.player;
    if (!player.isDead) {
      ctx.save();
      
      // Calculate dynamic matrix modifiers for high-fidelity squash, stretch & skew posture:
      let scaleX = 1;
      let scaleY = 1;
      let skewX = 0;
      let rotation = 0;
      
      if (player.isDashing) {
        // Flat streamlined darting shape
        scaleX = 1.35;
        scaleY = 0.7;
        skewX = player.vx > 0 ? 0.25 : -0.25;
      } else if (player.isSlasherActive) {
        // Lunge lean posture in cutting direction
        scaleX = 1.25;
        scaleY = 0.85;
        rotation = player.slashAngle * 0.12;
      } else if (!player.isGrounded) {
        // High air velocity stretching
        const stretchVy = Math.min(0.18, Math.abs(player.vy) * 0.022);
        scaleY = 1 + stretchVy;
        scaleX = 1 - stretchVy;
        skewX = player.vx * 0.025; // light air wind skew
      } else {
        // Running or Idle breathing physics
        const isRunning = Math.abs(player.vx) > 0.5;
        if (isRunning) {
          // Forward running incline lean
          skewX = player.vx * 0.016;
          // energetic runner compression bounce
          scaleY = 0.94 + Math.sin(state.currentTick * 0.24) * 0.04;
          scaleX = 1.06 - Math.sin(state.currentTick * 0.24) * 0.03;
        } else {
          // Standing organic idle breathing
          scaleY = 1 + Math.sin(state.currentTick * 0.075) * 0.015;
          scaleX = 1 - Math.sin(state.currentTick * 0.075) * 0.010;
        }
      }

      // Translate to baseline bottom-center for perfect grounded scale pivot, then reverse top-left:
      const centerX = player.x + player.width / 2;
      const bottomY = player.y + player.height;
      ctx.translate(centerX, bottomY);
      ctx.scale(scaleX, scaleY);
      if (skewX !== 0) {
        ctx.transform(1, 0, skewX, 1, 0, 0); // Horizontal skew matrix shear
      }
      if (rotation !== 0) {
        ctx.rotate(rotation);
      }
      ctx.translate(-player.width / 2, -player.height);

      // Draw elegant fluid Flowing Scarf Trail! (Very proud of this, looks epic)
      drawDynamicScarf(ctx, player, state.currentTick);

      // Draw procedural animated pixel-art samurai
      drawPixelSamurai(ctx, player.width, player.height, player, state.currentTick);

      // Draw neon sword trail / active weapon slashing overlay
      if (player.isSlasherActive) {
        ctx.restore(); // Pop player relative translation context back to absolute world coords to slash angles accurately!
        ctx.save();
        ctx.translate(player.x + player.width / 2, player.y + player.height / 2);
        ctx.rotate(player.slashAngle); // Rotate canvas relative to slash direction (X-axis is now the main sword strike direction!)

        const maxDuration = 12;
        const t = Math.max(0, Math.min(1, 1 - (player.slashDuration / maxDuration)));
        const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);
        const sizeProgress = easeOutCubic(t);
        const opacity = Math.max(0, 1 - t);

        // Core geometry calculations - longer, broader slash reach for amazing high-fidelity feel!
        const outerRadiusX = 84 * sizeProgress;
        const outerRadiusY = outerRadiusX * 0.44; // Oblique perspectival elliptical sweep representation
        const innerRadiusX = outerRadiusX * 0.48;
        const innerRadiusY = innerRadiusX * 0.28;

        // Expanded sweeping crescent angle range: 275-degree gorgeous broad strike trail!
        const angleRange = Math.PI * 1.53; 
        const startRelative = -angleRange / 2 + angleRange * Math.pow(t, 2.0); // Elegant drag/trailing tip ease-in
        const endRelative = -angleRange / 2 + angleRange * Math.sin(t * Math.PI / 2); // Blazing leading tip sweep

        // Save state to safely use high-luminance screen blend mode for maximum brightness glow
        ctx.save();
        ctx.globalCompositeOperation = 'screen';

        const steps = 30;

        // Reusable crescent path generator for dual layered cyberpunk neon gradients
        const drawCrescentPath = () => {
          ctx.beginPath();
          for (let i = 0; i <= steps; i++) {
            const tArc = i / steps; // 0 at tail (startRelative), 1 at head (endRelative)
            const a = startRelative + (endRelative - startRelative) * tArc;
            const x = outerRadiusX * Math.cos(a);
            const y = outerRadiusY * Math.sin(a);
            if (i === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
          for (let i = steps; i >= 0; i--) {
            const tArc = i / steps; // 1 at head, 0 at tail
            const a = startRelative + (endRelative - startRelative) * tArc;
            
            // Tapering thickness: 0 thickness at tail (tArc = 0), maximum at head (tArc = 1)
            const thicknessFactor = Math.pow(tArc, 1.4);
            const rxIn = outerRadiusX - (outerRadiusX - innerRadiusX) * thicknessFactor;
            const ryIn = outerRadiusY - (outerRadiusY - innerRadiusY) * thicknessFactor;
            
            const x = rxIn * Math.cos(a);
            const y = ryIn * Math.sin(a);
            ctx.lineTo(x, y);
          }
          ctx.closePath();
        };

        // Beautiful vibrant dual-neon linear gradient along the sword sweep axis (Cyan -> Purple -> Hot Pink)
        const dualGrad = ctx.createLinearGradient(-outerRadiusX * 0.4, -outerRadiusY * 0.6, outerRadiusX, outerRadiusY * 0.6);
        dualGrad.addColorStop(0.0, `rgba(255, 255, 255, ${opacity})`);                    // White-hot origins
        dualGrad.addColorStop(0.18, `rgba(34, 211, 238, ${opacity * 0.98})`);             // Electric neon cyan
        dualGrad.addColorStop(0.55, `rgba(168, 85, 247, ${opacity * 0.88})`);             // Purple color transition
        dualGrad.addColorStop(0.85, `rgba(236, 72, 153, ${opacity * 0.98})`);             // Vibrant magenta pink
        dualGrad.addColorStop(1.0, `rgba(244, 63, 94, 0)`);                               // Distal pink fadeout

        // Layer 1: Vivid Cyber Pink backlight glow with heavy shadow blur (maximum visual bloom)
        ctx.fillStyle = dualGrad;
        ctx.shadowColor = '#d946ef'; // Intense neon fuchsia glow shadow
        ctx.shadowBlur = 40 * opacity;
        drawCrescentPath();
        ctx.fill();

        // Layer 2: Neon Cyan overlapping highlight glow (creates absolute brightness contrast)
        ctx.shadowColor = '#22d3ee'; // Electric cyber cyan glow shadow
        ctx.shadowBlur = 18 * opacity;
        drawCrescentPath();
        ctx.fill();

        // 2. White-hot supercharged lightning core thread (tapered)
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 12 * opacity;

        const baseWidth = 5.0 * (1 - t); // Thickened central lightning core for absolute clarity
        for (let i = 0; i < steps; i++) {
          const tArcStart = i / steps;
          const tArcEnd = (i + 1) / steps;
          
          const aStart = startRelative + (endRelative - startRelative) * tArcStart;
          const aEnd = startRelative + (endRelative - startRelative) * tArcEnd;
          
          const progress = (tArcStart + tArcEnd) / 2;
          const currentWidth = baseWidth * Math.pow(progress, 1.4);
          if (currentWidth < 0.15) continue;
          
          const midRadiusX = (outerRadiusX + innerRadiusX) / 2;
          const midRadiusY = (outerRadiusY + innerRadiusY) / 2;
          
          const rxStart = outerRadiusX - (outerRadiusX - midRadiusX) * Math.pow(tArcStart, 1.4);
          const ryStart = outerRadiusY - (outerRadiusY - midRadiusY) * Math.pow(tArcStart, 1.4);
          
          const rxEnd = outerRadiusX - (outerRadiusX - midRadiusX) * Math.pow(tArcEnd, 1.4);
          const ryEnd = outerRadiusY - (outerRadiusY - midRadiusY) * Math.pow(tArcEnd, 1.4);
          
          ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.98})`;
          ctx.lineWidth = currentWidth;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(rxStart * Math.cos(aStart), ryStart * Math.sin(aStart));
          ctx.lineTo(rxEnd * Math.cos(aEnd), ryEnd * Math.sin(aEnd));
          ctx.stroke();
        }

        // 3. Ambient cyber slash highlight outer border aura in pink contrast
        ctx.shadowBlur = 0;
        ctx.strokeStyle = `rgba(236, 72, 153, ${opacity * 0.75})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(0, 0, outerRadiusX + 2.0, outerRadiusY + 1.0, 0, startRelative + 0.05, endRelative, false);
        ctx.stroke();

        ctx.restore(); // Restore globalCompositeOperation and shadow configurations safely
      }

      ctx.restore();
    }

    ctx.restore(); // Return back from main transform context

    // 10. POST PROCESSING SCANLINES AND RETRO TV FILTERS OVERLAY
    if (settings.visualTheme === 'neon_noir') {
      applyRetroCrtsEffects(ctx);
    } else if (settings.visualTheme === 'matrix_green') {
      applyMatrixGreenOverlay(ctx);
    } else if (settings.visualTheme === 'monochrome') {
      applyMonochromeAtmosphere(ctx);
    }

    // High fidelity slow-mo distortion vignette scanlines
    if (isCurrentlySlow) {
      applySlowMoAtmosphere(
        ctx,
        state.player.x - state.camera.x + player.width / 2,
        state.player.y - state.camera.y + player.height / 2,
        state.currentTick
      );
    }

    // Decay flash overlay for starting slow-mo
    if (slowMoFlashTimer.current > 0) {
      ctx.fillStyle = `rgba(34, 211, 238, ${Math.min(0.55, slowMoFlashTimer.current / 8)})`;
      ctx.fillRect(0, 0, 960, 540);
    }

    // DRAW CINEMATIC STYLISH LEVEL CLEARED EFFECTS OVERLAY
    if (state.levelClearedCountdown !== undefined && state.levelClearedCountdown > 0) {
      const elapsed = 160 - state.levelClearedCountdown;
      const progress = Math.min(1.0, elapsed / 22); // slide in over 22 frames

      // 1. Cinematic letterbox bars
      const barHeight = 44 * progress;
      ctx.save();
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, 960, barHeight);
      ctx.fillRect(0, 540 - barHeight, 960, barHeight);
      ctx.restore();

      // 2. High-tension screen-diagonal blade strike flash
      if (elapsed >= 5 && elapsed <= 30) {
        const slashOpacity = Math.max(0, 1 - (elapsed - 5) / 25);
        ctx.save();
        ctx.strokeStyle = `rgba(244, 63, 94, ${slashOpacity * 0.95})`; // vivid rose neon
        ctx.lineWidth = 14 * (1 - (elapsed - 5) / 25);
        ctx.shadowColor = '#f43f5e';
        ctx.shadowBlur = 24 * slashOpacity;
        ctx.beginPath();
        ctx.moveTo(-100, 120);
        ctx.lineTo(1060, 420);
        ctx.stroke();

        // White-hot core energy line
        ctx.strokeStyle = `rgba(255, 255, 255, ${slashOpacity})`;
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(-100, 120);
        ctx.lineTo(1060, 420);
        ctx.stroke();
        ctx.restore();
      }

      // 3. Cybernetic chamfered slate status card with typewriter stats
      if (elapsed >= 15) {
        const cardProgress = Math.min(1.0, (elapsed - 15) / 22);
        ctx.save();
        ctx.globalAlpha = cardProgress;

        const cardY = 175;
        const rx = 240, ry = cardY, rw = 480, rh = 180;
        const cornerSize = 12;

        // Custom path with chamfered retro corners
        ctx.fillStyle = 'rgba(7, 10, 22, 0.92)';
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.7)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(rx + cornerSize, ry);
        ctx.lineTo(rx + rw - cornerSize, ry);
        ctx.lineTo(rx + rw, ry + cornerSize);
        ctx.lineTo(rx + rw, ry + rh - cornerSize);
        ctx.lineTo(rx + rw - cornerSize, ry + rh);
        ctx.lineTo(rx + cornerSize, ry + rh);
        ctx.lineTo(rx, ry + rh - cornerSize);
        ctx.lineTo(rx, ry + cornerSize);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Neon teal corner brackets
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 4;
        ctx.beginPath();
        // Top-left
        ctx.moveTo(rx, ry + 20); ctx.lineTo(rx, ry); ctx.lineTo(rx + 20, ry);
        // Top-right
        ctx.moveTo(rx + rw - 20, ry); ctx.lineTo(rx + rw, ry); ctx.lineTo(rx + rw, ry + 20);
        // Bottom-left
        ctx.moveTo(rx, ry + rh - 20); ctx.lineTo(rx, ry + rh); ctx.lineTo(rx + 20, ry + rh);
        // Bottom-right
        ctx.moveTo(rx + rw - 20, ry + rh); ctx.lineTo(rx + rw, ry + rh); ctx.lineTo(rx + rw, ry + rh - 20);
        ctx.stroke();

        // Big elegant title
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px "Space Grotesk", "Inter", sans-serif';
        ctx.letterSpacing = '5px';
        ctx.fillText("影 之 斩  •  关 卡 清 除", rx + rw/2, ry + 54);

        // Subtitle EN
        ctx.fillStyle = '#06b6d4';
        ctx.font = 'bold 14px "JetBrains Mono", monospace';
        ctx.letterSpacing = '1px';
        ctx.fillText("STAGE HOSTILES TERMINATED", rx + rw/2, ry + 84);

        // Stage details
        ctx.fillStyle = '#64748b';
        ctx.font = '11px "Inter", sans-serif';
        ctx.fillText(`已净化区域: ${activeLevel.name}`, rx + rw/2, ry + 114);

        // Progress loader bar
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(rx + 60, ry + 138, rw - 120, 8);

        // Transference green progress block
        ctx.fillStyle = '#10b981';
        const loadPercent = Math.min(1.0, Math.max(0.0, (elapsed - 25) / 125));
        ctx.fillRect(rx + 60, ry + 138, (rw - 120) * loadPercent, 8);

        // Transfer label
        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 9px "JetBrains Mono", monospace';
        ctx.fillText(`MATRIX TRANSFERRING... ${Math.round(loadPercent * 100)}%`, rx + rw/2, ry + 162);

        ctx.restore();
      }
    }

    // Draw VHS "REC" Overlay in play mode to look retro
    drawVhsRecordingOverlay(ctx, state.player.bulletTimeEnergy, isCurrentlySlow, state.player.isRewinding);
  }

  // DETERMINISTIC SEEDED PSEUDO-RANDOM HASH FOR FLUID PERFORMANCE
  function hash(x: number): number {
    const h = Math.sin(x) * 10000;
    return h - Math.floor(h);
  }

  interface LayerParams {
    parallaxFactor: number;
    buildingWidth: number;
    minHeight: number;
    maxHeight: number;
    color: string;
    lineColor: string;
    camX: number;
    camY: number;
    shakeX: number;
    shakeY: number;
    seedOffset: number;
    drawWindows: boolean;
    windowColor: string;
    drawAntennas: boolean;
    drawWires?: boolean;
    drawAds?: boolean;
  }

  function drawSkyscraperBillboard(ctx: CanvasRenderingContext2D, screenX: number, roofY: number, bldWidth: number, seed: number) {
    ctx.save();
    
    const adW = Math.floor(45 + hash(seed + 1.2) * 35);
    const adH = Math.floor(30 + hash(seed + 2.8) * 25);
    const adX = Math.floor(screenX + (bldWidth - adW) / 2);
    const adY = roofY + 30 + Math.floor(hash(seed + 5.5) * 50);

    const time = Date.now();
    const isFlickering = hash(seed + 99.4) > 0.82;
    const flickerVal = isFlickering ? (Math.random() > 0.88 ? 0.2 : 1.0) : 1.0;
    
    ctx.globalAlpha = flickerVal;

    ctx.fillStyle = '#050508';
    ctx.fillRect(adX, adY, adW, adH);
    
    const colorType = Math.floor(hash(seed + 14.5) * 4);
    let neonColor = '#ec4899'; // defaults pink
    
    if (colorType === 1) {
      neonColor = '#06b6d4'; // cyan
    } else if (colorType === 2) {
      neonColor = '#eab308'; // amber
    } else if (colorType === 3) {
      neonColor = '#10b981'; // emerald green
    }

    ctx.strokeStyle = neonColor;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(adX, adY, adW, adH);

    ctx.shadowColor = neonColor;
    ctx.shadowBlur = 6 * flickerVal;

    const adPattern = Math.floor(hash(seed + 21.9) * 4);
    ctx.fillStyle = neonColor;

    if (adPattern === 0) {
      ctx.font = 'bold 12px "Space Grotesk", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const char = hash(seed + 3.1) > 0.5 ? "斩" : "影";
      ctx.fillText(char, adX + adW / 2, adY + adH / 2);
    } else if (adPattern === 1) {
      const angle = (time / 450 + seed) % (Math.PI * 2);
      ctx.beginPath();
      ctx.arc(adX + adW/2, adY + adH/2, Math.min(adW, adH) * 0.35, angle, angle + Math.PI * 0.7);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(adX + adW/2, adY + adH/2, 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (adPattern === 2) {
      const ringRad = Math.min(adW, adH) * 0.3;
      ctx.beginPath();
      ctx.arc(adX + adW/2, adY + adH/2, ringRad, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillRect(adX + adW/2 - ringRad - 4, adY + adH/2 - 0.5, 4, 1);
      ctx.fillRect(adX + adW/2 + ringRad, adY + adH/2 - 0.5, 4, 1);
      ctx.fillRect(adX + adW/2 - 0.5, adY + adH/2 - ringRad - 4, 1, 4);
      ctx.fillRect(adX + adW/2 - 0.5, adY + adH/2 + ringRad, 1, 4);
    } else {
      const segments = 5;
      const segW = Math.floor((adW - 12) / segments);
      for (let s = 0; s < segments; s++) {
        const hProgress = Math.sin(time / 200 + s * 1.5 + seed * 4) * 0.5 + 0.5;
        const currentH = Math.floor(hProgress * (adH - 8));
        ctx.fillRect(adX + 6 + s * (segW + 1), adY + adH - 4 - currentH, segW, currentH);
      }
    }

    ctx.restore();
  }

  function drawSkyscraperLayer(ctx: CanvasRenderingContext2D, p: LayerParams) {
    ctx.save();
    
    // Horizontal parallax offset
    const layerXOffset = p.camX * p.parallaxFactor;
    // Vertical parallax offset (dampened for jumping scenes)
    const layerYOffset = p.camY * p.parallaxFactor * 0.45;

    // Viewport width = 960, extend columns on both sides for smooth transitions
    const startIdx = Math.floor(layerXOffset / p.buildingWidth) - 1;
    const endIdx = Math.ceil((layerXOffset + 960) / p.buildingWidth) + 1;

    // Track points for drawing wires between buildings
    const midPoints: Array<{ x: number; y: number }> = [];

    for (let i = startIdx; i <= endIdx; i++) {
      const bldX = i * p.buildingWidth;
      const screenX = Math.floor(bldX - layerXOffset + p.shakeX);
      
      const seed = i + p.seedOffset;
      const hNorm = hash(seed);
      const buildingHeight = Math.floor(p.minHeight + hNorm * (p.maxHeight - p.minHeight));
      const roofY = Math.floor(540 - buildingHeight - layerYOffset + p.shakeY);

      // Main shape
      ctx.fillStyle = p.color;
      ctx.fillRect(screenX, roofY, p.buildingWidth + 1, buildingHeight + 600);

      // Highlight left edge representing neon reflection
      ctx.fillStyle = p.lineColor;
      ctx.fillRect(screenX, roofY, 2, buildingHeight + 600);

      // Antennas
      if (p.drawAntennas && hash(seed + 4.2) > 0.5) {
        const antennaX = Math.floor(screenX + p.buildingWidth * (0.2 + hash(seed + 9.8) * 0.6));
        const antennaH = Math.floor(18 + hash(seed + 1.1) * 32);
        ctx.fillStyle = p.color;
        ctx.fillRect(antennaX, roofY - antennaH, 2, antennaH);

        const isBeaconBlinking = hash(seed + 12.5) > 0.45;
        const beaconPulse = isBeaconBlinking ? (Math.sin(Date.now() / 150 + i) * 0.5 + 0.5) : 1.0;
        if (beaconPulse > 0.4) {
          ctx.fillStyle = hash(seed + 33.3) > 0.5 ? '#f43f5e' : '#eab308'; // Red/amber
          ctx.fillRect(antennaX - 1, roofY - antennaH, 4, 4);
        }
      }

      if (p.drawWires) {
        midPoints.push({ x: screenX + p.buildingWidth / 2, y: roofY + 35 + hash(seed + 7.7) * 40 });
      }

      // Windows
      if (p.drawWindows) {
        ctx.fillStyle = p.windowColor;
        const winCols = Math.floor(2 + hash(seed + 2.2) * 3);
        const winW = 3;
        const winH = 4;
        const spacingX = Math.floor((p.buildingWidth - winCols * winW) / (winCols + 1));
        const spacingY = 10;
        
        const numFloors = Math.floor((buildingHeight - 40) / spacingY);
        const startFloor = Math.floor(hash(seed + 44.5) * 3);

        for (let r = startFloor; r < numFloors; r++) {
          if (hash(seed + r * 13.9) < 0.24) continue;
          
          const curY = roofY + 25 + r * spacingY;
          if (curY > 540) break;

          for (let col = 0; col < winCols; col++) {
            if (hash(seed + r * 71.3 + col * 92.1) < 0.15) continue;
            
            const curX = screenX + spacingX + col * (winW + spacingX);
            ctx.fillRect(curX, curY, winW, winH);
          }
        }
      }

      // Billboards
      if (p.drawAds && hash(seed + 17.4) > 0.65 && p.buildingWidth > 120) {
        drawSkyscraperBillboard(ctx, screenX, roofY, p.buildingWidth, seed);
      }
    }

    // Power lines
    if (p.drawWires && midPoints.length > 1) {
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 1.0;
      for (let w = 0; w < midPoints.length - 1; w++) {
        const p1 = midPoints[w];
        const p2 = midPoints[w + 1];
        
        if (Math.abs(p1.x - p2.x) < p.buildingWidth * 2) {
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          const controlX = (p1.x + p2.x) / 2;
          const controlY = Math.max(p1.y, p2.y) + 12;
          ctx.quadraticCurveTo(controlX, controlY, p2.x, p2.y);
          ctx.stroke();
        }
      }
    }

    ctx.restore();
  }

  function drawFlyingCarTraffic(ctx: CanvasRenderingContext2D, camX: number, camY: number, shakeX: number, shakeY: number, levelIdx: number) {
    ctx.save();
    const time = Date.now();
    const numLanes = 3;
    const laneYBase = [240, 310, 390];
    const parallaxFactor = 0.32;

    const layerXOffset = camX * parallaxFactor;
    const layerYOffset = camY * parallaxFactor * 0.45;

    for (let lane = 0; lane < numLanes; lane++) {
      const direction = lane % 2 === 0 ? 1 : -1;
      const speedMultiplier = 0.08 + (lane * 0.04);
      const baseLaneY = laneYBase[lane] - layerYOffset + shakeY * 0.6;
      
      for (let carIdx = 0; carIdx < 3; carIdx++) {
        const carSeed = lane * 17.5 + carIdx * 45.2 + levelIdx;
        const widthTiler = 1100;
        const relativeStartX = hash(carSeed) * widthTiler;
        
        const driftX = (time * speedMultiplier * direction + relativeStartX) % widthTiler;
        const carX = (driftX - layerXOffset + shakeX * 0.6 + widthTiler) % widthTiler - 80;

        if (carX >= -40 && carX <= 1000) {
          const cy = baseLaneY + Math.sin(time / 300 + carIdx) * 3;
          const carColor = direction > 0 ? '#06b6d4' : '#ec4899';
          
          ctx.strokeStyle = carColor;
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(carX - 12 * direction, cy);
          ctx.lineTo(carX, cy);
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.fillRect(Math.floor(carX - (direction > 0 ? 0 : 2)), Math.floor(cy - 1), 3, 3);
          
          ctx.shadowBlur = 4;
          ctx.shadowColor = carColor;
          ctx.fillStyle = carColor;
          ctx.fillRect(Math.floor(carX + (direction > 0 ? -1 : 1)), Math.floor(cy - 1), 2, 2);
        }
      }
    }
    ctx.restore();
  }

  function drawRainWeatherLayer(ctx: CanvasRenderingContext2D) {
    ctx.save();
    const time = Date.now();
    ctx.strokeStyle = 'rgba(125, 211, 252, 0.38)';
    ctx.lineWidth = 1.0;

    for (let r = 0; r < 40; r++) {
      const rainXStart = (hash(r * 18.5) * 960 + time * 0.45) % 1020 - 40;
      const rainYStart = (hash(r * 31.2) * 540 + time * 1.8) % 600 - 40;
      const dLen = 14 + hash(r * 52.8) * 12;

      ctx.beginPath();
      ctx.moveTo(rainXStart, rainYStart);
      ctx.lineTo(rainXStart - 3.5, rainYStart + dLen);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawEmberWeatherLayer(ctx: CanvasRenderingContext2D) {
    ctx.save();
    const time = Date.now();
    
    for (let e = 0; e < 30; e++) {
      const startX = hash(e * 19.3) * 1020 - 30;
      const driftX = (startX - time * 0.05 + Math.sin(time / 400 + e) * 8) % 1020 - 20;
      const driftY = (hash(e * 72.8) * 600 - time * 0.12) % 600 - 30;
      const actualY = driftY < -10 ? driftY + 560 : driftY;
      const actualX = driftX < -10 ? driftX + 980 : driftX;

      const size = hash(e * 11.2) * 2.8 + 1.2;
      const pulseOpacity = Math.sin(time / 200 + e) * 0.3 + 0.7;

      ctx.fillStyle = hash(e * 4.4) > 0.45 ? '#f97316' : '#ef4444';
      ctx.globalAlpha = pulseOpacity * 0.85;
      ctx.fillRect(Math.floor(actualX), Math.floor(actualY), Math.floor(size), Math.floor(size));
      
      ctx.shadowBlur = 3;
      ctx.shadowColor = ctx.fillStyle;
    }
    ctx.restore();
  }

  function drawAmbientDustWeatherLayer(ctx: CanvasRenderingContext2D) {
    ctx.save();
    const time = Date.now();
    
    for (let d = 0; d < 15; d++) {
      const startX = hash(d * 41.5) * 1020 - 30;
      const driftX = (startX + Math.sin(time / 600 + d) * 12) % 1020 - 20;
      const driftY = (hash(d * 18.2) * 600 - time * 0.04) % 600 - 30;
      const actualY = driftY < -10 ? driftY + 560 : driftY;
      const actualX = driftX < -10 ? driftX + 980 : driftX;

      const size = 1.5;
      ctx.fillStyle = 'rgba(6, 182, 212, 0.15)';
      ctx.fillRect(Math.floor(actualX), Math.floor(actualY), size, size);
    }
    ctx.restore();
  }

  function drawCyberpunkParallaxBackground(
    ctx: CanvasRenderingContext2D,
    camX: number,
    camY: number,
    shakeX: number,
    shakeY: number
  ) {
    const levelIndex = currentLevelIndex;
    
    const skyGrad = ctx.createLinearGradient(0, 0, 0, 540);
    if (levelIndex === 0) {
      skyGrad.addColorStop(0, '#0a0515');
      skyGrad.addColorStop(1, '#200c35');
    } else if (levelIndex === 1) {
      skyGrad.addColorStop(0, '#060312');
      skyGrad.addColorStop(1, '#1b0e36');
    } else if (levelIndex === 2) {
      skyGrad.addColorStop(0, '#02020a');
      skyGrad.addColorStop(1, '#0e182e');
    } else if (levelIndex === 3) {
      skyGrad.addColorStop(0, '#04060c');
      skyGrad.addColorStop(1, '#141c2d');
    } else {
      skyGrad.addColorStop(0, '#080202');
      skyGrad.addColorStop(1, '#2d0a0b');
    }
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, 960, 540);

    ctx.save();
    const sunX = 700 - camX * 0.015 + shakeX * 0.1;
    const sunY = 140 - camY * 0.015 + shakeY * 0.1;

    if (levelIndex === 4) {
      const moonRadius = 75;
      const sunGlow = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, moonRadius * 2.2);
      sunGlow.addColorStop(0, 'rgba(239, 68, 68, 0.45)');
      sunGlow.addColorStop(1, 'rgba(239, 68, 68, 0)');
      ctx.fillStyle = sunGlow;
      ctx.beginPath();
      ctx.arc(sunX, sunY, moonRadius * 2.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(sunX, sunY, moonRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#080202';
      ctx.beginPath();
      ctx.arc(sunX - 15, sunY - 10, moonRadius - 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(245, 158, 11, 0.25)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(sunX, sunY, moonRadius * 1.5, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(239, 68, 68, 0.15)'; 
      ctx.beginPath();
      ctx.arc(sunX, sunY, moonRadius * 1.8, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      const sunRadius = 65;
      const sunGlow = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, sunRadius * 2);
      let sunColor = '#f43f5e';
      let glowColor = 'rgba(244, 63, 94, 0.35)';
      
      if (levelIndex === 1) {
        sunColor = '#ec4899';
        glowColor = 'rgba(235, 72, 153, 0.35)';
      } else if (levelIndex === 2) {
        sunColor = '#eab308';
        glowColor = 'rgba(234, 179, 8, 0.3)';
      } else if (levelIndex === 3) {
        sunColor = '#06b6d4';
        glowColor = 'rgba(6, 182, 212, 0.25)';
      }

      sunGlow.addColorStop(0, glowColor);
      sunGlow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = sunGlow;
      ctx.beginPath();
      ctx.arc(sunX, sunY, sunRadius * 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = sunColor;
      for (let yOffset = -sunRadius; yOffset < sunRadius; yOffset++) {
        const sliceHeight = 2;
        const currentY = sunY + yOffset;
        const relativeY = (yOffset + sunRadius) / (sunRadius * 2);
        const gapSize = Math.max(1, Math.floor(relativeY * 6));
        
        if (Math.abs(yOffset) % (sliceHeight + gapSize) <= sliceHeight) {
          const widthAtY = Math.sqrt(sunRadius * sunRadius - yOffset * yOffset);
          ctx.fillRect(sunX - widthAtY, currentY, widthAtY * 2, 2.5);
        }
      }
    }
    ctx.restore();

    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    for (let s = 0; s < 50; s++) {
      const starX = (hash(s * 15.3 + levelIndex) * 960 - camX * 0.02 + shakeX * 0.1 + 1920) % 960;
      const starY = hash(s * 27.9 + levelIndex) * 280;
      const starSize = hash(s * 45.1) > 0.82 ? 2 : 1;
      
      const isBlinking = hash(s * 91.4) > 0.6;
      const pulse = isBlinking ? (Math.sin(Date.now() / 250 + s) * 0.5 + 0.5) : 1;
      
      ctx.globalAlpha = pulse * 0.7;
      ctx.fillRect(Math.floor(starX), Math.floor(starY), starSize, starSize);
    }
    ctx.restore();

    drawSkyscraperLayer(ctx, {
      parallaxFactor: 0.08,
      buildingWidth: 65,
      minHeight: 220,
      maxHeight: 380,
      color: levelIndex === 4 ? '#220b0c' : (levelIndex === 1 ? '#180726' : (levelIndex === 3 ? '#10131d' : '#140c21')),
      lineColor: 'rgba(255, 255, 255, 0.05)',
      camX,
      camY,
      shakeX: shakeX * 0.25,
      shakeY: shakeY * 0.25,
      seedOffset: levelIndex * 20,
      drawWindows: true,
      windowColor: levelIndex === 4 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 211, 238, 0.15)',
      drawAntennas: true
    });

    drawSkyscraperLayer(ctx, {
      parallaxFactor: 0.25,
      buildingWidth: 100,
      minHeight: 140,
      maxHeight: 290,
      color: levelIndex === 4 ? '#330e10' : (levelIndex === 1 ? '#27113e' : (levelIndex === 3 ? '#141b2c' : '#1f1334')),
      lineColor: 'rgba(255, 255, 255, 0.08)',
      camX,
      camY,
      shakeX: shakeX * 0.5,
      shakeY: shakeY * 0.5,
      seedOffset: levelIndex * 20 + 100,
      drawWindows: true,
      windowColor: levelIndex === 4 ? 'rgba(245, 158, 11, 0.35)' : (levelIndex === 1 ? 'rgba(244, 63, 94, 0.3)' : 'rgba(52, 211, 153, 0.3)'),
      drawAntennas: true,
      drawWires: true
    });

    drawFlyingCarTraffic(ctx, camX, camY, shakeX, shakeY, levelIndex);

    drawSkyscraperLayer(ctx, {
      parallaxFactor: 0.48,
      buildingWidth: 160,
      minHeight: 110,
      maxHeight: 240,
      color: levelIndex === 4 ? '#180406' : (levelIndex === 1 ? '#120a1c' : (levelIndex === 3 ? '#0a0e1a' : '#0e0918')),
      lineColor: 'rgba(255, 255, 255, 0.12)',
      camX,
      camY,
      shakeX: shakeX * 0.85,
      shakeY: shakeY * 0.85,
      seedOffset: levelIndex * 20 + 200,
      drawWindows: true,
      windowColor: levelIndex === 4 ? 'rgba(239, 68, 68, 0.45)' : (levelIndex === 1 ? 'rgba(244, 63, 94, 0.45)' : 'rgba(6, 182, 212, 0.45)'),
      drawAntennas: false,
      drawAds: true,
      drawWires: true
    });

    if (levelIndex === 3) {
      drawRainWeatherLayer(ctx);
    } else if (levelIndex === 4) {
      drawEmberWeatherLayer(ctx);
    } else {
      drawAmbientDustWeatherLayer(ctx);
    }
  }

  // GRAPHICS DRAWING LOGIC COMPONENT SHAPES HELPERS
  function drawCyberGridLines(ctx: CanvasRenderingContext2D, waveWidth: number, waveHeight: number) {
    ctx.save();
    ctx.strokeStyle = 'rgba(110, 231, 183, 0.04)'; // faint matrix cyan-green lines
    ctx.lineWidth = 1;
    const size = 60;
    
    // Vertical passes
    for (let x = 0; x < waveWidth; x += size) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, waveHeight);
      ctx.stroke();
    }
    // Horizontal sweeps
    for (let y = 0; y < waveHeight; y += size) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(waveWidth, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  // SCARF MATH: Draw flowing physics ribbon tail swaying behind the moving player
  function drawDynamicScarf(ctx: CanvasRenderingContext2D, player: PlayerState, tick: number) {
    ctx.save();
    
    // Scarf attaches near neck back!
    const anchorX = player.direction === 'right' ? -2 : player.width + 2;
    const anchorY = 10;
    
    const segmentCount = 16;  // Premium joint count for fluid rope representation
    const linkLength = 2.8;    // Tight, supple links
    
    // Initialize scarf points if not created or if reset/resized
    if (!player.scarfPoints || player.scarfPoints.length !== segmentCount) {
      player.scarfPoints = [];
      const dirOffset = player.direction === 'right' ? -1 : 1;
      for (let i = 0; i < segmentCount; i++) {
        player.scarfPoints.push({
          x: anchorX + dirOffset * i * linkLength,
          y: anchorY,
          vx: 0,
          vy: 0,
        });
      }
    }

    // Shift existing segments in opposite direction of player's real motion to simulate physical lag
    const moveX = player.vx;
    const moveY = player.vy;
    if (Math.abs(moveX) > 0.01 || Math.abs(moveY) > 0.01) {
      for (let i = 1; i < segmentCount; i++) {
        // Inertia lag: pull the scarf opposite of the direction of player motion
        player.scarfPoints[i].x -= moveX * 0.94;
        player.scarfPoints[i].y -= moveY * 0.94;
      }
    }

    // 1. Calculate physical environmental & inertial forces in the player's relative canvas space
    const gravity = 0.25; // pulls scarf downwards over time
    
    // 2. Perform Euler-Verlet physical velocity updates
    for (let i = 1; i < segmentCount; i++) {
      const pt = player.scarfPoints[i];
      
      // Beautiful winding sinusoidal breeze that propagates down the length of the tail
      const wavePhase = tick * 0.14 - i * 0.38;
      const windX = (player.direction === 'right' ? -1 : 1) * Math.sin(wavePhase) * 0.35;
      const windY = Math.cos(wavePhase * 0.7) * 0.22;
      
      // Accumulate forces
      pt.vx += windX;
      pt.vy += windY + gravity;
      
      // Extreme trailing offset during active dash states
      if (player.isDashing) {
        const dashX = player.direction === 'right' ? -4.5 : 4.5;
        const dashY = -player.dashDirection.y * 2.2;
        pt.vx += dashX;
        pt.vy += dashY;
      }

      // Air resistance damping (tight dampening on dash, high flexibility on normal flow)
      const damping = player.isDashing ? 0.68 : 0.85;
      pt.vx *= damping;
      pt.vy *= damping;
      
      // Update coordinates
      pt.x += pt.vx;
      pt.y += pt.vy;
    }

    // 3. Satisfy length/distance constraints (Iterative Relaxation Solver)
    // Runs multiple passes to ensure inelastic premium rope feel
    const solverIterations = 5;
    for (let iter = 0; iter < solverIterations; iter++) {
      // Pin first segment exactly to neck anchor
      player.scarfPoints[0].x = anchorX;
      player.scarfPoints[0].y = anchorY;
      
      for (let i = 1; i < segmentCount; i++) {
        const prev = player.scarfPoints[i - 1];
        const curr = player.scarfPoints[i];
        
        const dx = curr.x - prev.x;
        const dy = curr.y - prev.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 0.001) {
          const error = dist - linkLength;
          const ratio = error / dist;
          
          // Since parent node is locked, we drag child node directly to satisfy the link constraint
          curr.x -= dx * ratio;
          curr.y -= dy * ratio;
        }
      }
    }

    // Generate normal-offset polygon boundaries to form a seamless tapered ribbon package
    const leftPoints: { x: number; y: number }[] = [];
    const rightPoints: { x: number; y: number }[] = [];
    
    for (let i = 0; i < segmentCount; i++) {
      const curr = player.scarfPoints[i];
      let tx = 0;
      let ty = 0;
      
      if (i === 0) {
        const next = player.scarfPoints[1];
        tx = next.x - curr.x;
        ty = next.y - curr.y;
      } else if (i === segmentCount - 1) {
        const prev = player.scarfPoints[i - 1];
        tx = curr.x - prev.x;
        ty = curr.y - prev.y;
      } else {
        const prev = player.scarfPoints[i - 1];
        const next = player.scarfPoints[i + 1];
        tx = next.x - prev.x;
        ty = next.y - prev.y;
      }
      
      let len = Math.sqrt(tx * tx + ty * ty);
      if (len === 0) len = 1;
      const nx = -ty / len;
      const ny = tx / len;
      
      // Sleek uniform width as requested ("尾部也不需要渐窄") and thinner ("太粗了有点，可以细一点")
      const thickness = 2.4;
      const w = thickness / 2;
      
      leftPoints.push({ x: curr.x + nx * w, y: curr.y + ny * w });
      rightPoints.push({ x: curr.x - nx * w, y: curr.y - ny * w });
    }

    // 4. Render seamless tapered physical ribbon with continuous Bézier interpolation
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Backing shadow envelope boundary
    ctx.beginPath();
    ctx.moveTo(leftPoints[0].x, leftPoints[0].y);
    for (let i = 1; i < segmentCount - 1; i++) {
      const xc = (leftPoints[i].x + leftPoints[i + 1].x) / 2;
      const yc = (leftPoints[i].y + leftPoints[i + 1].y) / 2;
      ctx.quadraticCurveTo(leftPoints[i].x, leftPoints[i].y, xc, yc);
    }
    ctx.lineTo(leftPoints[segmentCount - 1].x, leftPoints[segmentCount - 1].y);
    ctx.lineTo(rightPoints[segmentCount - 1].x, rightPoints[segmentCount - 1].y);
    for (let i = segmentCount - 2; i > 0; i--) {
      const xc = (rightPoints[i].x + rightPoints[i - 1].x) / 2;
      const yc = (rightPoints[i].y + rightPoints[i - 1].y) / 2;
      ctx.quadraticCurveTo(rightPoints[i].x, rightPoints[i].y, xc, yc);
    }
    ctx.lineTo(rightPoints[0].x, rightPoints[0].y);
    ctx.closePath();
    
    ctx.fillStyle = '#7f1d1d'; // Crimson dark shadow backing envelope
    ctx.fill();

    // Red neon core ribbon envelope boundary
    ctx.beginPath();
    // Inward inset for outer border outline aesthetic
    ctx.moveTo(leftPoints[0].x, leftPoints[0].y);
    for (let i = 1; i < segmentCount - 1; i++) {
      const xc = (leftPoints[i].x + leftPoints[i + 1].x) / 2;
      const yc = (leftPoints[i].y + leftPoints[i + 1].y) / 2;
      ctx.quadraticCurveTo(leftPoints[i].x, leftPoints[i].y, xc, yc);
    }
    ctx.lineTo(leftPoints[segmentCount - 1].x, leftPoints[segmentCount - 1].y);
    ctx.lineTo(rightPoints[segmentCount - 1].x, rightPoints[segmentCount - 1].y);
    for (let i = segmentCount - 2; i > 0; i--) {
      const xc = (rightPoints[i].x + rightPoints[i - 1].x) / 2;
      const yc = (rightPoints[i].y + rightPoints[i - 1].y) / 2;
      ctx.quadraticCurveTo(rightPoints[i].x, rightPoints[i].y, xc, yc);
    }
    ctx.lineTo(rightPoints[0].x, rightPoints[0].y);
    ctx.closePath();

    ctx.fillStyle = '#ef4444'; // Dragon neon scarlet red ribbon face
    ctx.fill();
    ctx.strokeStyle = '#991b1b'; // Sleek dark border boundary
    ctx.lineWidth = 0.5;
    ctx.stroke();
    
    ctx.restore();
  }

  // DRAW PIXEL SAMURAI GHOST: Stylized high-speed shadow trail silhouette with sharp cyber looks
  function drawPixelSamuraiGhost(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, color: string, direction: 'left' | 'right') {
    ctx.save();
    ctx.translate(x, y);
    
    const isFacingRight = direction === 'right';
    ctx.translate(width / 2, height / 2);
    if (!isFacingRight) {
      ctx.scale(-1, 1);
    }
    
    // Dash stretch/tilt
    ctx.rotate(0.08);
    ctx.scale(0.92, 0.92);
    ctx.translate(-width / 2, -height / 2);

    ctx.fillStyle = color;
    
    // Head / helmet
    ctx.fillRect(4, 2, 10, 9);
    ctx.fillRect(7, 0, 4, 2);
    
    // Torso
    ctx.fillRect(3, 12, 11, 13);
    
    // Shoulder pads
    ctx.fillRect(1, 12, 3, 4);
    ctx.fillRect(13, 13, 3, 4);
    
    // Forward-reaching sheathed/drawn sword pointer arm (Tucked behind as trail)
    ctx.fillRect(1, 16, 6, 3);
    ctx.fillRect(-18, 16.5, 20, 2);
    
    // Run tucked legs
    ctx.fillRect(4, 24, 3, 7);
    ctx.fillRect(9, 24, 3, 6);
    
    ctx.restore();
  }

  // DRAW PIXEL SAMURAI: Animated pixel-art character rendering instead of static blocks!
  function drawPixelSamurai(ctx: CanvasRenderingContext2D, width: number, height: number, player: any, tick: number) {
    ctx.save();
    
    // player direction: flip the horizontal scale if facing left to easily draw pointing right by default
    const isFacingRight = player.direction === 'right';
    ctx.translate(width / 2, height / 2);
    if (!isFacingRight) {
      ctx.scale(-1, 1);
    }
    ctx.translate(-width / 2, -height / 2);

    const isMoving = Math.abs(player.vx) > 0.5;
    const isDashing = player.isDashing;
    const isAir = !player.isGrounded;

    // Apply procedural squash/stretch matrix transformations around specific joints
    if (isDashing) {
      // 1. DASH ROLL SPIN (冲刺时翻滚)
      // Standard 12-frame loop mapped to a full 360-degree rotation animation
      const duration = 12;
      const progress = Math.max(0, Math.min(1, (duration - (player.dashDuration || 0)) / duration));
      const rotationAngle = progress * Math.PI * 2;
      
      // Pivot around body center for circular tumble
      ctx.translate(width / 2, height / 2);
      ctx.rotate(rotationAngle);
      ctx.scale(0.85, 0.85); // Tuck into tight spin projectile
      ctx.translate(-width / 2, -height / 2);
    } else {
      // 2. JUMP TAKEOFF SQUAT (起跳瞬间下蹲爆发)
      const jumpAge = tick - (player.lastJumpTick || 0);
      const isSquattingTakeoff = isAir && jumpAge >= 0 && jumpAge < 6;
      
      // 3. LANDING CUSHION SQUASH (落地瞬间明显下蹲缓冲)
      const landAge = tick - (player.lastLandTick || 0);
      const isCushioningLand = !isAir && landAge >= 0 && landAge < 10;
      
      if (isSquattingTakeoff) {
        // Takeoff spring compression: squash vertically, stretch horizontally at bottom anchor
        const t = jumpAge / 6;
        const scaleY = 0.72 + t * 0.28;
        const scaleX = 1.28 - t * 0.28;
        
        ctx.translate(width / 2, height);
        ctx.scale(scaleX, scaleY);
        ctx.translate(-width / 2, -height);
      } else if (isCushioningLand) {
        // Elastic rebound impact: cosine wave dampening squish
        const t = landAge / 10;
        const squishAmount = 0.26 * Math.cos(t * Math.PI / 2);
        const scaleY = 1.0 - squishAmount;
        const scaleX = 1.0 + squishAmount;
        
        ctx.translate(width / 2, height);
        ctx.scale(scaleX, scaleY);
        ctx.translate(-width / 2, -height);
      } else if (isAir) {
        // 4. AIRBORNE AERODYNAMICS (空中拉伸与下落状态)
        if (player.vy < -0.5) {
          // Jumping UP - Stretched aerodynamic posture
          ctx.translate(width / 2, height);
          ctx.scale(0.88, 1.15);
          ctx.translate(-width / 2, -height);
        } else if (player.vy > 0.5) {
          // Falling DOWN - Compressed preparation posture
          ctx.translate(width / 2, height);
          ctx.scale(1.10, 0.88);
          ctx.translate(-width / 2, -height);
        }
      } else if (isMoving) {
        // Runner forward velocity pitch lean
        ctx.translate(width / 2, height);
        ctx.rotate(0.06);
        ctx.translate(-width / 2, -height);
      }

      // 5. ATTACK SWORD SLASH LEAN (挥砍时身体前倾)
      if (player.isSlasherActive) {
        ctx.translate(width / 2, height);
        ctx.rotate(0.24); // Lean forward 14 degrees
        ctx.translate(-width / 2, -height);
      }
    }

    // Compute leg frame offsets for walking, sprinting, airborne trailing, or dashing tucks!
    let leftLegOffset = 0;
    let rightLegOffset = 0;
    let leftLegY = 0;
    let rightLegY = 0;
    let bobY = 0; // vertical body bobbing during idle/run animation

    if (isDashing) {
      // Both legs are tucked straight backwards (facing left since we scaled, pointing behind)
      leftLegOffset = -6;
      rightLegOffset = -8;
      leftLegY = -2;
      rightLegY = -3;
      bobY = 1;
    } else if (isAir) {
      if (player.vy < -0.5) {
        // Rising jump: legs are straight/stretched downwards, trailing close together
        leftLegOffset = -1;
        rightLegOffset = 1;
        leftLegY = 4;
        rightLegY = 5;
        bobY = -2.5;
      } else {
        // Falling jump: legs are bent high/outwards ready to absorb landing shock
        leftLegOffset = -3.5;
        rightLegOffset = 3.5;
        leftLegY = -3.5;
        rightLegY = -3.5;
        bobY = 1;
      }
    } else if (isMoving) {
      // Beautiful running cycle frame animation
      const runCycle = tick * 0.28;
      leftLegOffset = Math.sin(runCycle) * 6;
      rightLegOffset = -Math.sin(runCycle) * 6;
      leftLegY = Math.abs(Math.cos(runCycle)) * -3;
      rightLegY = Math.abs(Math.sin(runCycle)) * -3;
      bobY = Math.sin(runCycle * 2) * 1.5; // Double bob rate during run!
    } else {
      // Idle breathing
      bobY = Math.sin(tick * 0.085) * 0.8;
    }

    // Draw Scarf Neck Ring (scarf itself is trailing via drawDynamicScarf)
    ctx.fillStyle = '#ef4444'; // Red wrap
    ctx.fillRect(4, 10 + bobY, 8, 3);

    // --- DRAW LEGS ---
    ctx.fillStyle = '#1e293b'; // Sleek dark midnight legging armor
    // Left leg (back leg, slightly darker)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(5 + leftLegOffset, 24 + bobY/2 + leftLegY, 3, 11 - leftLegY);
    ctx.fillStyle = '#06b6d4'; // back shoe neon tip
    ctx.fillRect(6 + leftLegOffset, 35 + bobY/2, 4, 3);

    // Right leg (front leg, brighter)
    ctx.fillStyle = '#334155';
    ctx.fillRect(10 + rightLegOffset, 24 + bobY/2 + rightLegY, 3, 11 - rightLegY);
    ctx.fillStyle = '#22d3ee'; // front shoe neon glowing tip
    ctx.fillRect(11 + rightLegOffset, 35 + bobY/2, 4, 3);

    // --- DRAW TORSO (Sleek Samurai Armor Plate) ---
    ctx.fillStyle = '#1e293b'; // Midnight plate foundation
    ctx.fillRect(3, 12 + bobY, 11, 13);
    
    // Highlighted armor segments (chest lines)
    ctx.fillStyle = '#38bdf8'; // glowing cyber energy blue slits
    ctx.fillRect(6, 15 + bobY, 7, 2);
    ctx.fillRect(5, 19 + bobY, 8, 2);

    // Shoulder Pauldrons
    ctx.fillStyle = '#475569';
    ctx.fillRect(1, 12 + bobY, 3, 4); // Left shoulder pad
    ctx.fillRect(13, 13 + bobY, 3, 4); // Right shoulder pad
    
    // Back Scabbard
    ctx.fillStyle = '#020617';
    ctx.fillRect(1, 18 + bobY, 3, 6);

    // --- DRAW HEAD ---
    // Midnight mask
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(4, 2 + bobY, 10, 9);
    
    // Sleek cyber helmet side horn/vent
    ctx.fillStyle = '#475569';
    ctx.fillRect(3, 1 + bobY, 3, 4); // back crest
    ctx.fillRect(7, 0 + bobY, 4, 2); // top crest

    // Cybernetic Glowing Visor (Frame-by-frame blinking and scanning light!)
    const isVisorActive = (Math.floor(tick / 60) % 3) !== 0; // blanks/blinks every few secs
    ctx.fillStyle = isVisorActive ? '#22d3ee' : '#0891b2'; // animated neon cyan glow
    ctx.fillRect(9, 4 + bobY, 5, 2); // horizontal visor line facing right
    // A vertical sweeping spark bar on visor for ultra cool factor
    const scanX = 9 + Math.floor((tick % 15) / 5) * 1.5;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(Math.min(13, scanX), 4 + bobY, 1, 2);

    // --- DRAW ARM & SWORD GIMBAL ---
    ctx.save();
    ctx.translate(6, 17 + bobY); // Shoulder pivot
    
    // Saber Arm angles depending on active slasher states
    if (player.isSlasherActive) {
      // Slashed pose! High velocity swing arm pointer
      ctx.rotate(0.6);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(0, -2, 10, 3.5); // Extended forearm
      
      // Glowing laser katana blade extending outward
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 1.5;
      ctx.fillRect(10, -1.5, 26, 3); // High contrast blade core
      
      // Dynamic light spark particles surrounding weapon
      ctx.fillStyle = '#22d3ee';
      ctx.fillRect(18 + (tick % 4), -2, 2, 1);
    } else {
      // Normal / sheathed state arm (Sword bound to hip/hand)
      ctx.fillStyle = '#334155';
      ctx.fillRect(0, 0, 4, 7); // upper arm hanging
      ctx.fillRect(2, 5, 5, 3); // hand near hip hilt
      
      // Drawn glowing hilt at the waist
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(3, 8, 2, 4); // hilt
      ctx.fillStyle = '#22d3ee'; // glowing neon hilt gem
      ctx.fillRect(3.5, 11, 1, 1);
    }
    ctx.restore();

    ctx.restore();
  }

  // DRAW PIXEL ENEMY: Unique cyber costumes & walking legs frame cycles for distinct visual classes!
  function drawPixelEnemy(ctx: CanvasRenderingContext2D, enemy: any, tick: number) {
    ctx.save();
    ctx.translate(enemy.x, enemy.y);
    const isFacingRight = enemy.direction === 'right';
    const width = enemy.width;
    const height = enemy.height;
    
    // Translate to local coordinates inside the enemy bounding box
    ctx.translate(width / 2, height / 2);
    if (!isFacingRight) {
      ctx.scale(-1, 1);
    }
    ctx.translate(-width / 2, -height / 2);

    const isAlert = enemy.state === 'alert' || enemy.state === 'attack';
    const isMoving = Math.abs(enemy.vx) > 0.1;

    // Movement animation leg metrics
    let leftLegOffset = 0;
    let rightLegOffset = 0;
    let leftLegY = 0;
    let rightLegY = 0;
    let bobY = 0;

    if (isMoving) {
      // Running cycles for enemies
      const runCycle = tick * 0.22;
      leftLegOffset = Math.sin(runCycle) * 4;
      rightLegOffset = -Math.sin(runCycle) * 4;
      leftLegY = Math.abs(Math.cos(runCycle)) * -2;
      rightLegY = Math.abs(Math.sin(runCycle)) * -2;
      bobY = Math.sin(runCycle * 2) * 1.0;
    } else {
      // Patrolling breathing bobs
      bobY = Math.sin(tick * 0.07) * 0.6;
    }

    // Draw red cyber eye laser pointer sweep targeting sight line when fully alerted
    if (isAlert) {
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.45)'; // Red laser site
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(width - 4, 5 + bobY);
      ctx.lineTo(width + 240, 5 + bobY);
      ctx.stroke();
    }

    // Unique visual costumes depending on enemy type
    if (enemy.type === 'shield') {
      // --- SHIELD REINFORCED GUARD ---
      ctx.fillStyle = '#27272a'; // dark solid plate
      ctx.fillRect(4, 11 + bobY, 14, 15);
      ctx.fillStyle = '#52525b'; // secondary plates
      ctx.fillRect(5, 7 + bobY, 10, 4); 
      
      // Head piece
      ctx.fillStyle = '#3f3f46';
      ctx.fillRect(7, 1 + bobY, 8, 7);
      ctx.fillStyle = isAlert ? '#ef4444' : '#f59e0b'; // flashing eye visors
      ctx.fillRect(11, 3 + bobY, 3, 2);

      // Heavy steel boots
      ctx.fillStyle = '#18181b';
      ctx.fillRect(5 + leftLegOffset * 0.7, 26 + bobY, 3.5, 10);
      ctx.fillRect(11 + rightLegOffset * 0.7, 26 + bobY, 3.5, 10);

      // Mass tower shield
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(14, -2 + bobY, 6, 42);
      ctx.fillStyle = '#14b8a6'; // cyber teal glowing lines
      ctx.fillRect(15.5, 4 + bobY, 2.5, 30);

    } else if (enemy.type === 'shotgunner') {
      // --- BULKY HEAVY SHOTGUN BOSS ---
      ctx.fillStyle = '#451a03'; // heavy copper rust armor
      ctx.fillRect(3, 10 + bobY, 16, 17);
      ctx.fillStyle = '#ca8a04'; // bright hazardous warning stripes
      ctx.fillRect(5, 12 + bobY, 12, 3);
      ctx.fillRect(5, 19 + bobY, 12, 3);

      // Slotted head gear
      ctx.fillStyle = '#782d00';
      ctx.fillRect(6, 2 + bobY, 9, 8);
      ctx.fillStyle = isAlert ? '#f43f5e' : '#ea580c';
      ctx.fillRect(10, 4 + bobY, 4, 2);

      // Heavy wide boots
      ctx.fillStyle = '#1c0d02';
      ctx.fillRect(5 + leftLegOffset * 0.6, 27 + bobY, 4, 10);
      ctx.fillRect(12 + rightLegOffset * 0.6, 27 + bobY, 4, 10);

      // Heavy double barrel shotgun
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(14, 12 + bobY, 13, 5.5);
      ctx.fillStyle = '#ea580c'; // fiery reloading neon cartridges
      ctx.fillRect(12, 13 + bobY, 3, 3);

    } else if (enemy.type === 'sniper') {
      // --- SLEEK ELITE VIOLET SNIPER ---
      ctx.fillStyle = '#4a044e'; // deep grape violet armor mesh
      ctx.fillRect(4, 11 + bobY, 10, 14);
      
      // Robes hood and cape trailing
      ctx.fillStyle = '#701a75';
      ctx.fillRect(3, 1 + bobY, 9, 10);
      ctx.fillStyle = '#a21caf';
      ctx.fillRect(1, 16 + bobY, 4, 16);

      // Cyber optic glowing magnifier visor
      ctx.fillStyle = isAlert ? '#e879f9' : '#a21caf';
      ctx.fillRect(8, 4 + bobY, 3.2, 2.2);

      // Slender athletic carbon limbs
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(5 + leftLegOffset * 1.1, 25 + bobY, 2.5, 11);
      ctx.fillRect(9 + rightLegOffset * 1.1, 25 + bobY, 2.5, 11);

      // Long range linear laser rifle
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(11, 11 + bobY, 18, 4);
      ctx.fillStyle = '#c084fc'; // Violet core line
      ctx.fillRect(13, 12.5 + bobY, 14, 1);

    } else if (enemy.type === 'grunt') {
      // --- LIGHT SPEED MELEE CHOPPER ---
      ctx.fillStyle = '#1c1917'; // coal dark suit
      ctx.fillRect(4, 11 + bobY, 10, 14);
      
      // Orange shoulder combat plates
      ctx.fillStyle = '#ea580c';
      ctx.fillRect(2, 10 + bobY, 3, 4);
      ctx.fillStyle = '#f97316';
      ctx.fillRect(8, 14 + bobY, 5, 2);

      // Helmet goggles
      ctx.fillStyle = '#292524';
      ctx.fillRect(5, 3 + bobY, 8, 8);
      ctx.fillStyle = isAlert ? '#ff3300' : '#ea580c';
      ctx.fillRect(8, 5 + bobY, 4, 2);

      // Flexible fast speed legs
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(4 + leftLegOffset, 25 + bobY, 2.5, 11);
      ctx.fillRect(9 + rightLegOffset, 25 + bobY, 2.5, 11);

      // Large orange glowing laser machete blade
      ctx.save();
      ctx.translate(8, 16 + bobY);
      ctx.rotate(isAlert ? -0.4 : 0.6);
      ctx.fillStyle = '#292524';
      ctx.fillRect(0, 0, 4, 2); // joint hilt
      ctx.fillStyle = '#ff6600'; // high intensity orange saber light
      ctx.fillRect(2, -9, 2.5, 13);
      ctx.fillStyle = '#fff';
      ctx.fillRect(2.8, -5, 1, 7);
      ctx.restore();

    } else {
      // --- STANDARD SECURITY CORPS (GUNNER) ---
      ctx.fillStyle = '#334155'; // gunmetal plating
      ctx.fillRect(4, 11 + bobY, 10, 14);
      ctx.fillStyle = '#475569';
      ctx.fillRect(5, 13 + bobY, 7, 7); // tactical vest plate

      // Security helmet
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(5, 3 + bobY, 8, 8);
      ctx.fillStyle = isAlert ? '#ef4444' : '#f59e0b';
      ctx.fillRect(8, 5 + bobY, 3, 2);

      // Stepping tactical boots
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(4 + leftLegOffset, 25 + bobY, 2.5, 11);
      ctx.fillRect(9 + rightLegOffset, 25 + bobY, 2.5, 11);

      // Pulse security laser rifle
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(11, 12 + bobY, 11, 4.5);
      ctx.fillStyle = '#ef4444'; // laser red scope sight dot
      ctx.fillRect(15, 11 + bobY, 2, 1);
    }

    // Warning alert exclamation mark
    if (enemy.alertExclamationTimer > 0) {
      ctx.save();
      ctx.translate(width / 2, -18);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-1.5, -12, 3, 9);
      ctx.fillRect(-1.5, -1.5, 3, 3);
      ctx.restore();
    }

    ctx.restore();
  }

  // CRT SCANLINE AND RETRO VHS OVERLAYS
  function applyRetroCrtsEffects(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    
    // Draw horizontal faint black mesh scanlines
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.lineWidth = 1;
    for (let y = 0; y < 540; y += 3) {
      ctx.fillRect(0, y, 960, 1.2);
    }

    // Dynamic TV noise burst glow
    if (Math.random() < 0.05) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.fillRect(0, Math.random() * 540, 960, 4);
    }

    // Retro chromatic neon overlay vignette border tint
    const grd = ctx.createRadialGradient(480, 270, 300, 480, 270, 560);
    grd.addColorStop(0, 'rgba(0, 0, 0, 0)');
    grd.addColorStop(1, 'rgba(15, 23, 42, 0.45)'); // deep slate fade vignette
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, 960, 540);

    ctx.restore();
  }

  function applyMatrixGreenOverlay(ctx: CanvasRenderingContext2D) {
    ctx.save();
    // Green digital terminal phosphor code tint
    ctx.fillStyle = 'rgba(16, 185, 129, 0.06)';
    ctx.fillRect(0, 0, 960, 540);
    
    // High frequency scan lines grid
    ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
    for (let y = 0; y < 540; y += 2) {
      ctx.fillRect(0, y, 960, 1);
    }
    ctx.restore();
  }

  function applyMonochromeAtmosphere(ctx: CanvasRenderingContext2D) {
    ctx.save();
    // Noir grayscale blending tint
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.fillRect(0, 0, 960, 540);
    
    // Heavy vignette shadow border
    const grd = ctx.createRadialGradient(480, 270, 200, 480, 270, 520);
    grd.addColorStop(0, 'rgba(0, 0, 0, 0)');
    grd.addColorStop(1, 'rgba(0, 0, 0, 0.85)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, 960, 540);
    ctx.restore();
  }

  function applySlowMoAtmosphere(ctx: CanvasRenderingContext2D, px: number, py: number, tick: number) {
    ctx.save();
    
    // 1. Radial gradient pulsing vignetting centered on the player
    const baseRadius = 240 + Math.sin(tick * 0.15) * 20;
    const grd = ctx.createRadialGradient(px, py, baseRadius * 0.45, px, py, baseRadius * 1.8);
    grd.addColorStop(0, 'rgba(6, 182, 212, 0.05)'); // soft cyan tint
    grd.addColorStop(0.5, 'rgba(124, 58, 237, 0.16)'); // mysterious violet halo
    grd.addColorStop(1, 'rgba(4, 4, 12, 0.72)'); // dark slow space edges
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, 960, 540);

    // 2. Chrono waves radiating outwards from player
    const waveProgress = (tick % 45) / 45;
    ctx.strokeStyle = `rgba(34, 211, 238, ${0.44 * (1 - waveProgress)})`;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(px, py, waveProgress * 180 + 10, 0, Math.PI * 2);
    ctx.stroke();

    // 3. Sweeping cyan laser scan bar
    const barY = (tick * 1.6) % 540;
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.28)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, barY);
    ctx.lineTo(960, barY);
    ctx.stroke();
    
    ctx.fillStyle = 'rgba(6, 182, 212, 0.45)';
    ctx.font = 'bold 9px monospace';
    ctx.fillText("CHRONO SCAN FIELD: SLOW 15.0% [OK]", 25, barY - 5);

    // 4. Little floating binary digital grains (0 / 1)
    ctx.fillStyle = 'rgba(34, 211, 238, 0.35)';
    ctx.font = 'bold 10px monospace';
    for (let i = 0; i < 6; i++) {
      const bX = (px + Math.sin(tick * 0.02 + i) * 320 + 960) % 960;
      const bY = (py - (tick * 0.8 + i * 95)) % 540;
      if (bY > 0 && bY < 540) {
        ctx.fillText(Math.random() < 0.5 ? "0" : "1", bX, bY);
      }
    }
    
    ctx.restore();
  }

  function drawVhsRecordingOverlay(ctx: CanvasRenderingContext2D, slowMoEnergy: number, slowMoActive: boolean, isRewinding: boolean) {
    ctx.save();
    
    // REC red flash node
    if (Math.floor(Date.now() / 500) % 2 === 0 && !isRewinding) {
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(60, 45, 7, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px monospace';
    ctx.fillText("REC  00:15:38:02", 78, 50);

    // Dynamic Chrono Slow-Mo Battery Gauge HUD inside top margin corner!
    ctx.fillText("CHRONO:", 770, 50);
    // Draw neon Chrono level bar energy
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.strokeRect(840, 38, 80, 14);
    
    ctx.fillStyle = slowMoActive ? '#06b6d4' : '#10b981'; // cyan during zoom slow-mo, emerald safe
    const barW = Math.max(0, slowMoEnergy) * 0.78;
    ctx.fillRect(841, 39, barW, 12);

    // Draw rewinding digital VHS lines labels! (Ultra high tension feedback)
    if (isRewinding) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.fillRect(0, 0, 960, 540);

      // Rewind ticker text centered screen
      ctx.fillStyle = '#06b6d4';
      ctx.font = 'bold italic 48px Arial';
      ctx.fillText("⏪ REWINDING TAPE...", 270, 250);
      
      // VHS tracking glitch lines
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      const lineY = Math.random() * 540;
      ctx.moveTo(0, lineY);
      ctx.lineTo(960, lineY);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = '24px monospace';
      ctx.fillText("NO... THAT WON'T WORK...", 330, 320);
    }

    ctx.restore();
  }

  // LEVEL EDITOR WORKSPACE HANDLERS AND EDITORS
  function handleSelectPlatformOption(type: 'solid' | 'spike' | 'one_way') {
    setEditPlatformType(type);
  }

  function handleSelectEnemyOption(type: EnemyType) {
    setEditEnemyType(type);
  }

  function handleAddPlatform() {
    const updated = { ...activeLevel };
    updated.platforms.push({ x: 200, y: 300, width: 200, height: 30, type: editPlatformType, color: editPlatformType === 'spike' ? '#f43f5e' : undefined });
    saveEditorHistoryAndSet(updated);
  }

  function handleAddEnemy() {
    const updated = { ...activeLevel };
    updated.enemies.push({ type: editEnemyType, x: 400, y: 250, patrolRange: 80 });
    saveEditorHistoryAndSet(updated);
  }

  function handleResetEditorLevel() {
    const defaultLevel = JSON.parse(JSON.stringify(LEVELS[0])) as LevelConfig;
    defaultLevel.id = 'editor_custom_level';
    defaultLevel.name = '🛠️ Custom Editor Sandbox';
    saveEditorHistoryAndSet(defaultLevel);
  }

  function saveEditorHistoryAndSet(newLevel: LevelConfig) {
    setEditorHistory(prev => [...prev, JSON.parse(JSON.stringify(activeLevel))]);
    setActiveLevel(newLevel);
  }

  function handleUndoEditorAction() {
    if (editorHistory.length === 0) return;
    const prev = [...editorHistory];
    const item = prev.pop() as LevelConfig;
    setEditorHistory(prev);
    setActiveLevel(item);
  }

  function handleModifyLevelWidthHeight(dir: 'width' | 'height', delta: number) {
    const updated = { ...activeLevel };
    if (dir === 'width') {
      updated.width = Math.max(960, updated.width + delta);
    } else {
      updated.height = Math.max(540, updated.height + delta);
    }
    saveEditorHistoryAndSet(updated);
  }

  function handleMovePlatCoord(index: number, key: 'x' | 'y' | 'width' | 'height', amt: number) {
    const updated = { ...activeLevel };
    const p = updated.platforms[index];
    p[key] = Math.max(10, p[key] + amt);
    saveEditorHistoryAndSet(updated);
  }

  function handleMoveEnemyCoord(index: number, key: 'x' | 'y' | 'patrolRange', amt: number) {
    const updated = { ...activeLevel };
    const e = updated.enemies[index];
    if (key === 'patrolRange') {
      e.patrolRange = Math.max(0, (e.patrolRange || 0) + amt);
    } else {
      e[key] = Math.max(10, e[key] + amt);
    }
    saveEditorHistoryAndSet(updated);
  }

  function handleDeletePlatform(index: number) {
    const updated = { ...activeLevel };
    updated.platforms.splice(index, 1);
    saveEditorHistoryAndSet(updated);
  }

  function handleDeleteEnemy(index: number) {
    const updated = { ...activeLevel };
    updated.enemies.splice(index, 1);
    saveEditorHistoryAndSet(updated);
  }

  // Clamp helper
  function scaleClamp(val: number): number {
    return val > 0 ? 1 : val < 0 ? -1 : 0;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none overflow-x-hidden antialiased">
      {/* Top Main Navigation Header Bar */}
      {gameState !== 'menu' && (
        <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur px-6 py-4 flex items-center justify-between sticky top-0 z-50 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-600 rounded flex items-center justify-center font-mono font-bold text-white text-2xl shadow-[0_0_15px_rgba(244,63,94,0.5)]">
              影
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                影之武士 <span className="text-xs bg-rose-500 text-white font-mono px-1.5 py-0.5 rounded tracking-normal">SHADOW SAMURAI</span>
              </h1>
              <p className="text-xs text-slate-400">瞬息之间，一击必杀</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              id="nav-btn-home"
              onClick={() => {
                setGameState('menu');
                setMenuSubView('main');
              }} 
              className="px-4 py-2 rounded text-sm font-medium transition flex items-center gap-1.5 hover:bg-slate-800 text-slate-300"
            >
              <RotateCcw className="w-4 h-4" /> 返回主界面
            </button>
            
            <button 
              id="nav-btn-editor"
              onClick={() => {
                // Initial Sandbox Setup
                const sandboxLevel = { ...LEVELS[0] };
                sandboxLevel.id = 'editor_custom_level';
                sandboxLevel.name = '🛠️ 自定义关卡';
                setActiveLevel(sandboxLevel);
                setGameState('level_editor');
              }} 
              className={`px-4 py-2 rounded text-sm font-medium transition flex items-center gap-1.5 ${gameState === 'level_editor' ? 'bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]' : 'hover:bg-slate-800 text-slate-300'}`}
            >
              <Hammer className="w-4 h-4" /> 关卡编辑器
            </button>

            <button 
              id="nav-btn-settings"
              onClick={() => setGameState('settings')} 
              className={`px-4 py-2 rounded text-sm font-medium transition flex items-center gap-1.5 ${gameState === 'settings' ? 'bg-slate-700 text-white' : 'hover:bg-slate-800 text-slate-300'}`}
            >
              <Sliders className="w-4 h-4" /> 参数调节
            </button>

            <button 
              id="nav-btn-help"
              onClick={() => setGameState('help')} 
              className={`px-4 py-2 rounded text-sm font-medium transition flex items-center gap-1.5 ${gameState === 'help' ? 'bg-slate-700 text-white' : 'hover:bg-slate-800 text-slate-300'}`}
            >
              <BookOpen className="w-4 h-4" /> 操作指南
            </button>
          </div>
        </header>
      )}

      {/* Main Container Workspace Floor */}
      <main ref={containerRef} className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 flex flex-col justify-center items-center gap-6">
        
        {/* VIEWPORTS SCREEN ROUTING CONTROL MAP */}
        {gameState === 'menu' && (
          <div className="w-full max-w-4xl flex flex-col justify-center items-center my-auto py-8 px-4 animate-fade-in relative">
            
            {/* Ambient Background Glow System */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden max-w-full">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-rose-500/10 via-purple-500/5 to-transparent blur-[120px] rounded-full"></div>
              <div className="absolute top-1/4 left-1/3 w-32 h-32 bg-cyan-500/10 blur-[80px] rounded-full"></div>
            </div>

            {/* Glowing Main Game Logo */}
            <div className="flex flex-col items-center select-none text-center relative z-10 mb-14 cursor-default group">
              {/* Backside neon sword flash line */}
              <div className="absolute -inset-x-20 top-1/2 h-0.5 bg-gradient-to-r from-transparent via-rose-500 to-transparent scale-x-110 opacity-70 blur-[1px] shadow-[0_0_15px_rgba(244,63,94,0.8)] -rotate-3 transition duration-1000 group-hover:rotate-1"></div>
              
              {/* Massive stylized Chinese title "影之武士" */}
              <h1 className="text-6xl md:text-8xl font-serif font-black tracking-[0.25em] pl-[0.25em] text-white italic relative drop-shadow-[0_5px_15px_rgba(244,63,94,0.4)]">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-rose-100 to-rose-400 group-hover:from-rose-400 group-hover:to-amber-300 transition duration-500">影之武士</span>
              </h1>

              {/* Sub-logo English branding */}
              <div className="mt-4 font-mono text-xs tracking-[0.55em] text-cyan-400 flex items-center justify-center gap-2 drop-shadow-[0_0_10px_rgba(34,211,238,0.4)] pl-[0.55em]">
                <span>SHADOW SAMURAI</span>
                <span className="text-[9px] bg-cyan-950 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-800/40 relative -top-0.5">CHRONOS</span>
              </div>
            </div>

            {/* Sub View Router Control */}
            {menuSubView === 'main' ? (
              /* MAIN SELECTIONS COLUMN */
              <div className="flex flex-col gap-4 w-full max-w-sm relative z-10">
                <button
                  id="menu-btn-scenarios"
                  onMouseEnter={() => { try { AudioSynth.playSlash(); } catch(e){} }}
                  onClick={() => {
                    try { AudioSynth.playSlash(); } catch(e){}
                    setMenuSubView('levels');
                  }}
                  className="w-full text-left bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 hover:border-cyan-500 hover:from-slate-950 hover:to-slate-900 group px-6 py-4 rounded-lg flex items-center justify-between transition-all duration-300 shadow-lg relative overflow-hidden"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-cyan-400 font-mono tracking-widest opacity-0 transform -translate-x-3 group-hover:opacity-100 group-hover:translate-x-0 transition duration-300 font-bold">⚔️</span>
                    <span className="font-bold text-slate-300 group-hover:text-white group-hover:pl-1 transition-all duration-300 tracking-wider">进入任务 / MISSION SELECT</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition" />
                </button>

                <button
                  id="menu-btn-endless"
                  onMouseEnter={() => { try { AudioSynth.playSlash(); } catch(e){} }}
                  onClick={() => {
                    try { AudioSynth.playSlash(); } catch(e){}
                    setIsEndlessMode(true);
                    const endlessMap: LevelConfig = {
                      id: 'endless_slaughter',
                      name: '🌌 无尽杀戮 / Endless Slay Chamber',
                      width: 1600,
                      height: 600,
                      spawnPoint: { x: 800, y: 450 },
                      platforms: [
                        { x: 0, y: 520, width: 1600, height: 80, type: 'solid' },
                        { x: 0, y: 0, width: 40, height: 600, type: 'solid' },
                        { x: 1560, y: 0, width: 40, height: 600, type: 'solid' },
                        { x: 150, y: 380, width: 250, height: 20, type: 'one_way' },
                        { x: 250, y: 240, width: 200, height: 20, type: 'one_way' },
                        { x: 1200, y: 380, width: 250, height: 20, type: 'one_way' },
                        { x: 1150, y: 240, width: 200, height: 20, type: 'one_way' },
                        { x: 600, y: 320, width: 400, height: 20, type: 'one_way' },
                        { x: 750, y: 180, width: 100, height: 20, type: 'one_way' },
                        { x: 500, y: 500, width: 100, height: 20, type: 'spike', color: '#ff3366' },
                        { x: 1000, y: 500, width: 100, height: 20, type: 'spike', color: '#ff3366' },
                      ],
                      enemies: [
                        { type: 'grunt', x: 400, y: 480, patrolRange: 100 },
                        { type: 'gunner', x: 1200, y: 480, patrolRange: 100 }
                      ],
                      completed: false
                    };
                    setActiveLevel(endlessMap);
                    setGameState('playing');
                  }}
                  className="w-full text-left bg-gradient-to-r from-rose-950/20 to-slate-950 border border-slate-900 hover:border-rose-500 p-4 rounded-lg flex items-center justify-between group transition-all duration-300 shadow-lg relative overflow-hidden"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-rose-500 font-mono tracking-widest opacity-0 transform -translate-x-3 group-hover:opacity-100 group-hover:translate-x-0 transition duration-300 font-bold">☠️</span>
                    <div>
                      <div className="font-bold text-rose-400 group-hover:text-rose-300 transition tracking-wider">无尽深渊 / ENDLESS MODE</div>
                      <div className="text-[10px] text-rose-300/60 mt-0.5 font-mono">HIGH SCORE: {highScore} PTS</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-rose-400 transition" />
                </button>

                <button
                  id="menu-btn-editor"
                  onMouseEnter={() => { try { AudioSynth.playSlash(); } catch(e){} }}
                  onClick={() => {
                    try { AudioSynth.playSlash(); } catch(e){}
                    const sandboxLevel = { ...LEVELS[0] };
                    sandboxLevel.id = 'editor_custom_level';
                    sandboxLevel.name = '🛠️ 自定义关卡';
                    setActiveLevel(sandboxLevel);
                    setGameState('level_editor');
                  }}
                  className="w-full text-left bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 hover:border-purple-500 hover:from-slate-950 hover:to-slate-900 group px-6 py-4 rounded-lg flex items-center justify-between transition-all duration-300 shadow-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-purple-500 font-mono tracking-widest opacity-0 transform -translate-x-3 group-hover:opacity-100 group-hover:translate-x-0 transition duration-300 font-bold">🛠️</span>
                    <span className="font-bold text-slate-300 group-hover:text-white group-hover:pl-1 transition-all duration-300 tracking-wider">地图工坊 / LEVEL EDITOR</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition" />
                </button>

                <button
                  id="menu-btn-settings"
                  onMouseEnter={() => { try { AudioSynth.playSlash(); } catch(e){} }}
                  onClick={() => {
                    try { AudioSynth.playSlash(); } catch(e){}
                    setGameState('settings');
                  }}
                  className="w-full text-left bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 hover:border-slate-400 group px-6 py-4 rounded-lg flex items-center justify-between transition-all duration-300 shadow-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 font-mono tracking-widest opacity-0 transform -translate-x-3 group-hover:opacity-100 group-hover:translate-x-0 transition duration-300 font-bold">⚙️</span>
                    <span className="font-bold text-slate-300 group-hover:text-white group-hover:pl-1 transition-all duration-300 tracking-wider">属性调节 / GAME SLIDERS</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-200 transition" />
                </button>

                <button
                  id="menu-btn-manual"
                  onMouseEnter={() => { try { AudioSynth.playSlash(); } catch(e){} }}
                  onClick={() => {
                    try { AudioSynth.playSlash(); } catch(e){}
                    setGameState('help');
                  }}
                  className="w-full text-left bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 hover:border-blue-500 group px-6 py-4 rounded-lg flex items-center justify-between transition-all duration-300 shadow-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-blue-400 font-mono tracking-widest opacity-0 transform -translate-x-3 group-hover:opacity-100 group-hover:translate-x-0 transition duration-300 font-bold">📖</span>
                    <span className="font-bold text-slate-300 group-hover:text-white group-hover:pl-1 transition-all duration-300 tracking-wider">卷轴秘籍 / COMBAT MANUAL</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition" />
                </button>
              </div>
            ) : (
              /* MISSION LEVEL SCENE SELECT */
              <div className="w-full max-w-2xl flex flex-col gap-4 animate-fade-in relative z-10">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-2">
                  <h3 className="text-lg font-bold text-white tracking-wider flex items-center gap-2">
                    <Sparkles className="text-rose-500 w-4 h-4" /> 选择突击场景 / SELECT MISSION
                  </h3>
                  <button
                    id="menu-btn-back-to-main"
                    onClick={() => {
                      try { AudioSynth.playSlash(); } catch(e){}
                      setMenuSubView('main');
                    }}
                    className="text-xs bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 px-3 py-1.5 rounded transition font-mono flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> 返回 / BACK
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[360px] overflow-y-auto pr-1">
                  {LEVELS.map((level, idx) => {
                    // Determine beautiful Chinese name & difficulty tags
                    let levelChinese = "极光电网";
                    let difficultyBadge = "未知 / UNKNOWN";
                    let diffColor = "bg-slate-500/10 text-slate-400 border-slate-500/30";
                    if (idx === 0) {
                      levelChinese = "练习室: 刀刃弹反";
                      difficultyBadge = "入门 / APPRENTICE";
                      diffColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
                    } else if (idx === 1) {
                      levelChinese = "霓虹小巷 / 街头危机";
                      difficultyBadge = "进阶 / ADVANCED";
                      diffColor = "bg-cyan-500/10 text-cyan-400 border-cyan-500/30";
                    } else if (idx === 2) {
                      levelChinese = "摩天大楼 / 绝境越空";
                      difficultyBadge = "精英 / ELITE";
                      diffColor = "bg-sky-500/10 text-sky-400 border-sky-500/30";
                    } else if (idx === 3) {
                      levelChinese = "暴风骤雨 / 极限守卫";
                      difficultyBadge = "大师 / MASTER";
                      diffColor = "bg-indigo-500/10 text-indigo-400 border-indigo-500/30";
                    } else if (idx === 4) {
                      levelChinese = "数网实验室 / 暗流极速";
                      difficultyBadge = "宗师 / GRANDMASTER";
                      diffColor = "bg-purple-500/10 text-purple-400 border-purple-500/30";
                    } else if (idx === 5) {
                      levelChinese = "极速空轨 / 致命跃迁";
                      difficultyBadge = "传说 / LEGENDARY";
                      diffColor = "bg-pink-500/10 text-pink-400 border-pink-500/30";
                    } else if (idx === 6) {
                      levelChinese = "运河危局 / 九号死水";
                      difficultyBadge = "修罗 / ASURA";
                      diffColor = "bg-red-500/10 text-red-400 border-red-500/30";
                    } else if (idx === 7) {
                      levelChinese = "绝壁殿堂 / 死战不退";
                      difficultyBadge = "炼狱 / PURGATORY";
                      diffColor = "bg-orange-500/10 text-orange-400 border-orange-500/30";
                    } else if (idx === 8) {
                      levelChinese = "主控枢纽 / 核心湮灭";
                      difficultyBadge = "寂灭 / OBLIVION";
                      diffColor = "bg-rose-500/10 text-rose-400 border-rose-500/30";
                    } else if (idx === 9) {
                      levelChinese = "时隙奇点 / 时空尽头";
                      difficultyBadge = "终焉 / ETERNITY";
                      diffColor = "bg-amber-500/10 text-amber-400 border-amber-500/30";
                    }

                    return (
                      <button
                        id={`btn-level-select-${level.id}`}
                        key={level.id}
                        onMouseEnter={() => { try { AudioSynth.playSlash(); } catch(e){} }}
                        onClick={() => {
                          try { AudioSynth.playSlash(); } catch(e){}
                          setIsEndlessMode(false);
                          setCurrentLevelIndex(idx);
                          setActiveLevel({ ...level });
                          setGameState('playing');
                        }}
                        className="text-left bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/50 p-4 rounded-lg flex flex-col justify-between group transition duration-300 shadow hover:shadow-cyan-950/20"
                      >
                        <div className="flex justify-between items-start w-full">
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${diffColor}`}>
                            {difficultyBadge}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">ROOM #{idx + 1}</span>
                        </div>
                        <div className="mt-3">
                          <div className="font-bold text-white group-hover:text-cyan-400 transition text-sm">
                            {levelChinese}
                          </div>
                          <div className="text-xs text-slate-400 mt-1">
                            {level.name}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-2 font-mono flex gap-3">
                            <span>尺寸: {level.width}x{level.height}</span>
                            <span>敌军: {level.enemies.length}</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ACTIVE COMBAT ROOMS VIEWPORTS */}
        {gameState === 'playing' && (
          <div className="w-full flex flex-col gap-4 animate-fade-in relative z-20">
            {/* HUD Status Bar Block info */}
            <div className="flex justify-between items-center bg-slate-900 border border-slate-800 px-6 py-3 rounded-lg shadow-md">
              <div className="flex gap-6 items-center">
                <div className="font-mono text-xs">
                  <span className="text-slate-400 block uppercase">Scenario Target</span>
                  <span className="text-white font-bold text-sm block mt-0.5">{activeLevel.name}</span>
                </div>

                {isEndlessMode && (
                  <>
                    <div className="w-px h-6 bg-slate-800"></div>
                    <div className="font-mono text-xs">
                      <span className="text-slate-400 block uppercase">Wave Target</span>
                      <span className="text-cyan-400 font-bold text-sm block mt-0.5">WAVE {endlessWave}</span>
                    </div>

                    <div className="w-px h-6 bg-slate-800"></div>
                    <div className="font-mono text-xs">
                      <span className="text-slate-400 block uppercase">Score Points</span>
                      <span className="text-emerald-400 font-bold text-sm block mt-0.5">{endlessScore} PTS</span>
                    </div>

                    {endlessCombo > 0 && (
                      <>
                        <div className="w-px h-6 bg-slate-800"></div>
                        <div className="font-mono text-xs relative">
                          <span className="text-slate-400 block uppercase">Combos gauge</span>
                          <span className="text-rose-400 font-bold block mt-0.5 animate-pulse">
                            x{endlessCombo} MULTIPLIER
                          </span>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>

              {/* Reset room buttons */}
              <div className="flex items-center gap-2">
                <button
                  id="btn-restart-run"
                  onClick={() => loadLevel(activeLevel)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-100 font-mono text-xs font-semibold px-4 py-2 rounded border border-slate-700 transition flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> RESTART RUN
                </button>
                <button
                  id="btn-return-menu"
                  onClick={() => {
                    AudioSynth.stopBGM();
                    setGameState('menu');
                  }}
                  className="bg-slate-800 hover:bg-rose-950/50 text-slate-100 font-mono text-xs font-semibold px-4 py-2 rounded border border-slate-705 transition"
                >
                  EXIT MATRIX
                </button>
              </div>
            </div>

            {/* THE AWESOME CANVAS COMPONENTE WINDOW */}
            <div className="w-full h-auto bg-slate-950 rounded-xl overflow-hidden shadow-2xl border-2 border-slate-800 flex items-center justify-center relative bg-radial-vignette">
              <canvas
                id="katana-game-canvas"
                ref={canvasRef}
                width={960}
                height={540}
                className="w-full max-w-[1120px] max-h-[630px] aspect-video cursor-crosshair relative block"
              />
            </div>

            {/* Hotkeys indicator bars */}
            <div className="grid grid-cols-4 gap-4 text-center">
              <div className="bg-slate-900 border border-slate-800 p-3 rounded font-mono text-xs">
                <span className="text-cyan-400 font-bold block">A / D</span>
                <span className="text-slate-400 text-[10px] mt-1 block">Left / Right Run</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-3 rounded font-mono text-xs">
                <span className="text-cyan-400 font-bold block">W / Space</span>
                <span className="text-slate-400 text-[10px] mt-1 block">Double Jump &amp; Wall kick</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-3 rounded font-mono text-xs">
                <span className="text-cyan-400 font-bold block">Left Click / J</span>
                <span className="text-slate-400 text-[10px] mt-1 block">Slash toward Cursor</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-3 rounded font-mono text-xs">
                <span className="text-cyan-400 font-bold block">Right Click / Shift</span>
                <span className="text-slate-400 text-[10px] mt-1 block">Slow-Mo &amp; IFrame Dash</span>
              </div>
            </div>
          </div>
        )}

        {/* JUICINESS SETTINGS EDITOR SLIDERS PANEL */}
        {gameState === 'settings' && (
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl animate-fade-in my-auto">
            <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2 border-b border-slate-800 pb-4">
              <Sliders className="text-cyan-400" /> CONFIGURE PHYSICS &amp; VISUAL JUICE
            </h2>
            <p className="text-sm text-slate-400 mt-2 pb-6">
              Calibrate audio-visual settings. Tweak feedback variables to change impact feeling.
            </p>

            <div className="space-y-6">
              {/* Screen Shake level */}
              <div>
                <div className="flex justify-between text-sm font-semibold text-slate-200">
                  <span>SCREEN SHAKE MAGNITUDE</span>
                  <span className="text-cyan-400">{Math.round(settings.screenShakeMultiplier * 100)}%</span>
                </div>
                <input
                  id="settings-shake"
                  type="range"
                  min="0"
                  max="2.5"
                  step="0.1"
                  value={settings.screenShakeMultiplier}
                  onChange={(e) => setSettings({ ...settings, screenShakeMultiplier: Number(e.target.value) })}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer mt-2"
                />
                <span className="text-[10px] text-slate-500 block mt-1">Controls shake displacement during kills/reflections</span>
              </div>

              {/* Hitstop Freeze duration */}
              <div>
                <div className="flex justify-between text-sm font-semibold text-slate-200">
                  <span>HITSTOP CONCUSSION FREEZE</span>
                  <span className="text-cyan-400">{settings.hitstopDurationMs} Milliseconds</span>
                </div>
                <input
                  id="settings-hitstop"
                  type="range"
                  min="0"
                  max="180"
                  step="10"
                  value={settings.hitstopDurationMs}
                  onChange={(e) => setSettings({ ...settings, hitstopDurationMs: Number(e.target.value) })}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer mt-2"
                />
                <span className="text-[10px] text-slate-500 block mt-1">World-freeze frames latency upon lethal slash or parry</span>
              </div>

              {/* Particle quantities */}
              <div>
                <div className="flex justify-between text-sm font-semibold text-slate-200">
                  <span>PARTICLE EXCLUSIONS RATE</span>
                  <span className="text-cyan-400">x{settings.particleCountMultiplier} Scale</span>
                </div>
                <input
                  id="settings-particles"
                  type="range"
                  min="0.2"
                  max="2.0"
                  step="0.1"
                  value={settings.particleCountMultiplier}
                  onChange={(e) => setSettings({ ...settings, particleCountMultiplier: Number(e.target.value) })}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer mt-2"
                />
              </div>

              {/* Blood Spattered quantities */}
              <div>
                <div className="flex justify-between text-sm font-semibold text-slate-200">
                  <span>BLOOD SPLATTER DECAL DENSITY</span>
                  <span className="text-cyan-400">x{settings.bloodAmountMultiplier} Quantity</span>
                </div>
                <input
                  id="settings-blood"
                  type="range"
                  min="0"
                  max="3.0"
                  step="0.1"
                  value={settings.bloodAmountMultiplier}
                  onChange={(e) => setSettings({ ...settings, bloodAmountMultiplier: Number(e.target.value) })}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer mt-2"
                />
              </div>

              {/* Bullet Time Strength */}
              <div>
                <div className="flex justify-between text-sm font-semibold text-slate-200">
                  <span>CHRONO TIME SLOW-MOTION RATIO</span>
                  <span className="text-cyan-400">-{Math.round((1 - settings.bulletTimeSlowdown) * 100)}% Speed</span>
                </div>
                <input
                  id="settings-slowmo"
                  type="range"
                  min="0.05"
                  max="0.5"
                  step="0.01"
                  value={settings.bulletTimeSlowdown}
                  onChange={(e) => setSettings({ ...settings, bulletTimeSlowdown: Number(e.target.value) })}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer mt-2"
                />
              </div>

              {/* Toggle switch infinite bullet time */}
              <div className="flex items-center justify-between border-t border-slate-800 pt-4">
                <span className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
                  <SlidersHorizontal className="w-4 h-4 text-cyan-400" /> INFINITE BULLET TIME (CHRONO)
                </span>
                <input
                  id="settings-infinite-chrono"
                  type="checkbox"
                  checked={settings.infiniteBulletTime}
                  onChange={(e) => setSettings({ ...settings, infiniteBulletTime: e.target.checked })}
                  className="w-4 h-4 bg-slate-800 border-slate-700 text-cyan-500 rounded cursor-pointer"
                />
              </div>

              {/* Master Volume */}
              <div>
                <div className="flex justify-between text-sm font-semibold text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <Volume2 className="w-4 h-4 text-cyan-400" /> MASTER SOUND LEVEL
                  </span>
                  <span className="text-cyan-400">{Math.round(settings.soundVolume * 100)}%</span>
                </div>
                <input
                  id="settings-volume"
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.soundVolume}
                  onChange={(e) => setSettings({ ...settings, soundVolume: Number(e.target.value) })}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer mt-2"
                />
              </div>

              {/* Choose Screen filter theme */}
              <div>
                <label className="text-sm font-semibold text-slate-200 block">VISUAL FILTER POST-EFFECTS</label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {(['neon_noir', 'retro_arcade', 'matrix_green', 'monochrome'] as const).map(theme => (
                    <button
                      id={`btn-theme-select-${theme}`}
                      key={theme}
                      onClick={() => setSettings({ ...settings, visualTheme: theme })}
                      className={`font-mono text-xs p-3 rounded-lg border transition capitalize ${settings.visualTheme === theme ? 'bg-cyan-500 text-slate-950 border-white' : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-400'}`}
                    >
                      {theme.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  id="btn-save-settings"
                  onClick={() => setGameState('menu')}
                  className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-4 py-3 rounded-lg text-sm tracking-wider transition uppercase"
                >
                  SAVE CONFIGURATION
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SANDBOX LEVEL CREATOR INTERACTIVE WORKSPACE */}
        {gameState === 'level_editor' && (
          <div className="w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl flex flex-col md:grid md:grid-cols-12 gap-6 animate-fade-in my-auto">
            {/* Editor Sidebar Left Controls (5/12) */}
            <div className="md:col-span-4 bg-slate-950 border border-slate-800 rounded-lg p-5 flex flex-col gap-6">
              <div>
                <h3 className="font-bold text-white tracking-tight flex items-center gap-1.5">
                  <Plus className="text-purple-400 w-5 h-5" /> SANDBOX CREATOR
                </h3>
                <p className="text-slate-500 text-[11px] mt-1 leading-relaxed">
                  Design layouts by adding block arrays. Spawn Gunner practice nodes. Run immediate test cycles.
                </p>
              </div>

              {/* Platform Selector */}
              <div className="space-y-3">
                <span className="text-xs font-semibold text-slate-300 uppercase font-mono block">1. ADD PLATFORM BLOCKS</span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    id="btn-plat-solid"
                    onClick={() => handleSelectPlatformOption('solid')}
                    className={`text-[10px] p-2 rounded border font-mono tracking-tight transition ${editPlatformType === 'solid' ? 'bg-purple-600 border-purple-400 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                  >
                    🚧 SOLID
                  </button>
                  <button
                    id="btn-plat-one-way"
                    onClick={() => handleSelectPlatformOption('one_way')}
                    className={`text-[10px] p-2 rounded border font-mono tracking-tight transition ${editPlatformType === 'one_way' ? 'bg-cyan-600 border-cyan-400 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                  >
                    💨 THROUGH
                  </button>
                  <button
                    id="btn-plat-spike"
                    onClick={() => handleSelectPlatformOption('spike')}
                    className={`text-[10px] p-2 rounded border font-mono tracking-tight transition ${editPlatformType === 'spike' ? 'bg-rose-600 border-rose-400 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                  >
                    🔺 SPIKES
                  </button>
                </div>
                <button
                  id="btn-add-platform"
                  onClick={handleAddPlatform}
                  className="w-full text-xs font-bold py-2 px-3 rounded bg-purple-500 hover:bg-purple-400 text-white flex items-center justify-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> ADD PLATFORM BLOCK
                </button>
              </div>

              {/* Enemy Spawns selector */}
              <div className="space-y-3 border-t border-slate-800 pt-4">
                <span className="text-xs font-semibold text-slate-300 uppercase font-mono block">2. SPAWN ENEMY CHARACTERS</span>
                <div className="grid grid-cols-2 gap-2">
                  {(['grunt', 'gunner', 'shield', 'sniper'] as const).map(type => (
                    <button
                      id={`btn-enemy-opt-${type}`}
                      key={type}
                      onClick={() => handleSelectEnemyOption(type)}
                      className={`text-[10px] p-2 rounded border font-mono capitalize transition ${editEnemyType === type ? 'bg-purple-600 border-purple-400 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
                <button
                  id="btn-add-enemy"
                  onClick={handleAddEnemy}
                  className="w-full text-xs font-bold py-2 px-3 rounded bg-purple-500 hover:bg-purple-400 text-white flex items-center justify-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> SPAWN ENEMY UNIT
                </button>
              </div>

              {/* Level options */}
              <div className="space-y-3 border-t border-slate-800 pt-4">
                <span className="text-xs font-semibold text-slate-300 uppercase font-mono block">3. ARENA DIMS SIZES</span>
                <div className="flex gap-2">
                  <button
                    id="btn-dim-width-dec"
                    onClick={() => handleModifyLevelWidthHeight('width', -200)}
                    className="flex-1 text-[11px] font-mono bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded py-1"
                  >
                    -W Dims
                  </button>
                  <button
                    id="btn-dim-width-inc"
                    onClick={() => handleModifyLevelWidthHeight('width', 200)}
                    className="flex-1 text-[11px] font-mono bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded py-1"
                  >
                    +W Dims
                  </button>
                </div>
                <div className="text-center font-mono text-xs text-slate-400">
                  Total Size: {activeLevel.width}px x {activeLevel.height}px
                </div>
              </div>

              <div className="border-t border-slate-800 pt-4 space-y-2">
                <button
                  id="btn-editor-undo"
                  disabled={editorHistory.length === 0}
                  onClick={handleUndoEditorAction}
                  className="w-full text-xs font-semibold py-2 px-3 rounded bg-slate-905 hover:bg-slate-805 border border-slate-705 text-slate-300 hover:border-slate-500 transition disabled:opacity-50 flex items-center justify-center gap-1"
                >
                  UNDO ACTION
                </button>
                <button
                  id="btn-editor-clear"
                  onClick={handleResetEditorLevel}
                  className="w-full text-xs font-semibold py-2 px-3 rounded hover:bg-rose-950/20 text-rose-400 border border-slate-800 hover:border-rose-900 transition flex items-center justify-center gap-1"
                >
                  CLEAR SATE
                </button>
              </div>
            </div>

            {/* List coordinates block Right (8/12) */}
            <div className="md:col-span-8 flex flex-col gap-4">
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-5 flex flex-col gap-4 flex-1 max-h-[460px] overflow-y-auto">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <h4 className="font-mono text-sm tracking-widest text-[#a855f7]">🛠️ ACTIVE ASSETS LOCATIONS</h4>
                  <span className="text-[10px] text-slate-400">Use delta offsets below to calibrate layout instantly</span>
                </div>

                {/* Platforms editor rows */}
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] text-purple-400 font-mono uppercase font-bold tracking-wider">PLATFORMS LIST</span>
                    <div className="flex flex-col gap-2 mt-1">
                      {activeLevel.platforms.map((plat, index) => (
                        <div key={index} className="flex flex-wrap items-center bg-slate-900/60 p-2.5 rounded border border-slate-800 text-[11px] justify-between gap-2">
                          <span className="font-mono capitalize font-bold text-slate-300">
                            {plat.type} #{index + 1}
                          </span>
                          
                          <div className="flex items-center gap-1 font-mono">
                            <span>X: {plat.x}</span>
                            <button id={`plat-x-dec-${index}`} onClick={() => handleMovePlatCoord(index, 'x', -25)} className="px-1 bg-slate-950 rounded border border-slate-800 text-[10px]">-</button>
                            <button id={`plat-x-inc-${index}`} onClick={() => handleMovePlatCoord(index, 'x', 25)} className="px-1 bg-slate-950 rounded border border-slate-800 text-[10px]">+</button>
                          </div>

                          <div className="flex items-center gap-1 font-mono">
                            <span>Y: {plat.y}</span>
                            <button id={`plat-y-dec-${index}`} onClick={() => handleMovePlatCoord(index, 'y', -25)} className="px-1 bg-slate-950 rounded border border-slate-800 text-[10px]">-</button>
                            <button id={`plat-y-inc-${index}`} onClick={() => handleMovePlatCoord(index, 'y', 25)} className="px-1 bg-slate-950 rounded border border-slate-800 text-[10px]">+</button>
                          </div>

                          <div className="flex items-center gap-1 font-mono">
                            <span>W: {plat.width}</span>
                            <button id={`plat-w-dec-${index}`} onClick={() => handleMovePlatCoord(index, 'width', -30)} className="px-1 bg-slate-950 rounded border border-slate-800 text-[10px]">-</button>
                            <button id={`plat-w-inc-${index}`} onClick={() => handleMovePlatCoord(index, 'width', 30)} className="px-1 bg-slate-950 rounded border border-slate-800 text-[10px]">+</button>
                          </div>

                          <button
                            id={`plat-del-${index}`}
                            onClick={() => handleDeletePlatform(index)}
                            className="p-1 hover:text-rose-500 hover:bg-slate-950 rounded border border-slate-800 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Enemies list */}
                  <div>
                    <span className="text-[10px] text-purple-400 font-mono uppercase font-bold tracking-wider">CHARACTERS LIST</span>
                    <div className="flex flex-col gap-2 mt-1">
                      {activeLevel.enemies.map((enemy, index) => (
                        <div key={index} className="flex flex-wrap items-center bg-slate-900/60 p-2.5 rounded border border-slate-800 text-[11px] justify-between gap-2">
                          <span className="font-mono capitalize font-bold text-slate-300">
                            {enemy.type} #{index + 1}
                          </span>
                          
                          <div className="flex items-center gap-1 font-mono">
                            <span>X: {enemy.x}</span>
                            <button id={`enemy-x-dec-${index}`} onClick={() => handleMoveEnemyCoord(index, 'x', -25)} className="px-1 bg-slate-950 rounded border border-slate-800 text-[10px]">-</button>
                            <button id={`enemy-x-inc-${index}`} onClick={() => handleMoveEnemyCoord(index, 'x', 25)} className="px-1 bg-slate-950 rounded border border-slate-800 text-[10px]">+</button>
                          </div>

                          <div className="flex items-center gap-1 font-mono">
                            <span>Y: {enemy.y}</span>
                            <button id={`enemy-y-dec-${index}`} onClick={() => handleMoveEnemyCoord(index, 'y', -25)} className="px-1 bg-slate-950 rounded border border-slate-800 text-[10px]">-</button>
                            <button id={`enemy-y-inc-${index}`} onClick={() => handleMoveEnemyCoord(index, 'y', 25)} className="px-1 bg-slate-950 rounded border border-slate-800 text-[10px]">+</button>
                          </div>

                          <div className="flex items-center gap-1 font-mono">
                            <span>Patrol: {enemy.patrolRange || 0}</span>
                            <button id={`enemy-p-dec-${index}`} onClick={() => handleMoveEnemyCoord(index, 'patrolRange', -20)} className="px-1 bg-slate-950 rounded border border-slate-800 text-[10px]">-</button>
                            <button id={`enemy-p-inc-${index}`} onClick={() => handleMoveEnemyCoord(index, 'patrolRange', 20)} className="px-1 bg-slate-950 rounded border border-slate-800 text-[10px]">+</button>
                          </div>

                          <button
                            id={`enemy-del-${index}`}
                            onClick={() => handleDeleteEnemy(index)}
                            className="p-1 hover:text-rose-500 hover:bg-slate-950 rounded border border-slate-800 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action test toggle */}
              <button
                id="btn-test-level"
                onClick={() => {
                  setIsEndlessMode(false);
                  setGameState('playing');
                }}
                className="w-full bg-[#a855f7] hover:bg-[#b06cfc] text-white p-4 font-bold rounded-lg text-sm tracking-wider transition uppercase"
              >
                🎮 INITIATE SANDBOX RUN TEST
              </button>
            </div>
          </div>
        )}

        {/* REWIND TIME STAGE COMPLETED VICTORY CARDS */}
        {gameState === 'victory' && (
          <div className="w-full max-w-md bg-slate-900 border-2 border-emerald-500 p-8 rounded-xl shadow-[0_0_30px_rgba(16,185,129,0.3)] text-center animate-fade-in flex flex-col items-center gap-6 my-auto">
            <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.5)]">
              <Award className="w-10 h-10" />
            </div>

            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-white uppercase font-sans">
                MISSION SUCCESS
              </h2>
              <p className="text-sm text-slate-300 font-mono mt-2">
                All rooms cleared. Memory loop saved cleanly.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-4 rounded-lg w-full font-mono text-left text-xs text-slate-400 space-y-2">
              <div className="flex justify-between border-b border-slate-800 pb-1">
                <span>Total level sequences:</span>
                <span className="text-white font-bold">3 Rooms</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1">
                <span>Sword deflection count:</span>
                <span className="text-white font-bold">Excellent</span>
              </div>
              <div className="flex justify-between">
                <span>Doses of Chronos consumed:</span>
                <span className="text-white font-bold">Nominal</span>
              </div>
            </div>

            <button
              id="btn-victory-restart"
              onClick={() => {
                setCurrentLevelIndex(0);
                setActiveLevel({ ...LEVELS[0] });
                setGameState('playing');
              }}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 px-4 rounded-lg text-sm tracking-widest transition uppercase"
            >
              RUN SATE AGAIN
            </button>
          </div>
        )}

        {/* MAIN USER INSTRUCTIONS AND DOCUMENTATION MANUAL */}
        {gameState === 'help' && (
          <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl animate-fade-in my-auto text-slate-300">
            <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2 border-b border-slate-800 pb-4">
              <BookOpen className="text-cyan-400" /> RETOR MATRIX OPERATOR GUIDE
            </h2>

            <div className="space-y-6 mt-6 overflow-y-auto max-h-[480px] pr-2">
              <div>
                <h4 className="font-bold text-white text-md tracking-wider flex items-center gap-1.5 font-mono">
                  🔴 THE COMBAT SYSTEM
                </h4>
                <p className="text-xs leading-relaxed text-slate-400 mt-2">
                  "Katana Zero" is known for its intense "one hit you are dead" combat loops. You are equipped with a high-frequency carbon steel sword capable of severing bullets and reflecting them back. 
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950 p-4 rounded border border-slate-800 flex flex-col gap-2">
                  <span className="font-mono font-bold text-cyan-400 text-sm">🌌 1. CHRONO BULLET-TIME</span>
                  <p className="text-[11px] leading-relaxed text-slate-400">
                    Hold Q, Space, or Right-Click to dilate time. Chrono drains a metric bar that slowly replenishes when idle. Use this to orient slash reflections accurately.
                  </p>
                </div>
                <div className="bg-slate-950 p-4 rounded border border-slate-800 flex flex-col gap-2">
                  <span className="font-mono font-bold text-cyan-400 text-sm">💫 2. TARGET BLOWING</span>
                  <p className="text-[11px] leading-relaxed text-slate-400">
                    Whenever an active bullet enters your neon sweep trajectory (the blue edge trail), weapon intersection automatically targets closest gunners to snipe recoil!
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-white text-md tracking-wider flex items-center gap-1.5 font-mono border-t border-slate-800 pt-4">
                  👾 CRITICAL FEEDBACK JUICES
                </h4>
                <p className="text-xs leading-relaxed text-slate-400 mt-2">
                  To experience high visual impact feedback, we recommend maximizing the sliders at the top menu. We include:
                </p>
                <ul className="list-disc list-inside text-xs mt-2 pl-3 space-y-2 text-slate-400 font-mono">
                  <li><strong className="text-white">Hit-Stop World Freeze:</strong> Stalls entire animation clock for 80+ frames, preserving weight and kinetic energy.</li>
                  <li><strong className="text-white">Dynamic Decal Platter:</strong> Sliced blood drops are static decals that stick forever to matching floor platforms.</li>
                  <li><strong className="text-white">VHS Fast Rewinds:</strong> Watch historical states execute back-to-front instantly on death!</li>
                </ul>
              </div>

              <button
                id="btn-help-exit"
                onClick={() => setGameState('menu')}
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-4 py-3 rounded-lg text-sm tracking-wider transition uppercase"
              >
                RETURN TO ROOMS
              </button>
            </div>
          </div>
        )}

      </main>

      {/* Footer footer signature info */}
      <footer className="py-4 border-t border-slate-800/50 bg-slate-950/70 text-center text-[10px] font-mono tracking-wider text-slate-500 flex justify-center items-center gap-2 select-none relative z-10">
        📼 CRT ANALOG SOURCE CONTROL SYSTEM ACTIVE • SHAKE SCALE: {settings.screenShakeMultiplier}x
      </footer>
    </div>
  );
}
