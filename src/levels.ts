/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LevelConfig } from './types';

export const LEVELS: LevelConfig[] = [
  {
    id: 'room_1',
    name: '1. Deflection Practice (新手练习角)',
    width: 1200,
    height: 600,
    spawnPoint: { x: 100, y: 400 },
    theme: 'cyber_neon',
    platforms: [
      // Floor
      { x: 0, y: 520, width: 1200, height: 80, type: 'solid' },
      // Left/Right Walls
      { x: 0, y: 0, width: 40, height: 600, type: 'solid' },
      { x: 1160, y: 0, width: 40, height: 600, type: 'solid' },
      // Tutorial platforms
      { x: 450, y: 380, width: 300, height: 25, type: 'one_way' },
      { x: 800, y: 280, width: 250, height: 25, type: 'one_way' },
      { x: 150, y: 220, width: 180, height: 25, type: 'one_way' },
    ],
    enemies: [
      { type: 'gunner', x: 600, y: 342, patrolRange: 0 },
      { type: 'grunt', x: 950, y: 242, patrolRange: 80 },
      { type: 'grunt', x: 450, y: 482, patrolRange: 100 },
    ],
    completed: false,
  },
  {
    id: 'room_2',
    name: '2. Neon Alleyways (霓虹小巷)',
    width: 1500,
    height: 600,
    spawnPoint: { x: 100, y: 450 },
    theme: 'vaporwave',
    platforms: [
      // Floor
      { x: 0, y: 520, width: 1500, height: 80, type: 'solid' },
      // Left/Right Walls
      { x: 0, y: 0, width: 40, height: 600, type: 'solid' },
      { x: 1460, y: 0, width: 40, height: 600, type: 'solid' },
      // Platforms
      { x: 300, y: 400, width: 150, height: 20, type: 'one_way' },
      { x: 550, y: 300, width: 180, height: 20, type: 'one_way' },
      { x: 850, y: 420, width: 200, height: 20, type: 'one_way' },
      { x: 1150, y: 280, width: 150, height: 20, type: 'one_way' },
      // Elevated Ledges
      { x: 400, y: 160, width: 350, height: 20, type: 'one_way' },
      { x: 950, y: 140, width: 250, height: 20, type: 'one_way' },
      // Spikes
      { x: 750, y: 500, width: 150, height: 20, type: 'spike', color: '#ec4899' }
    ],
    enemies: [
      { type: 'grunt', x: 480, y: 482, patrolRange: 100 },
      { type: 'gunner', x: 640, y: 262, patrolRange: 40 },
      { type: 'gunner', x: 450, y: 122, patrolRange: 0 },
      { type: 'grunt', x: 950, y: 482, patrolRange: 80 },
      { type: 'shield', x: 1100, y: 482, patrolRange: 60 },
      { type: 'gunner', x: 1300, y: 342, patrolRange: 0 },
    ],
    completed: false,
  },
  {
    id: 'room_3',
    name: '3. Rooftop Infiltration (楼顶潜入)',
    width: 1800,
    height: 650,
    spawnPoint: { x: 100, y: 500 },
    theme: 'monochrome_cyber',
    platforms: [
      { x: 0, y: 580, width: 1800, height: 70, type: 'solid' },
      { x: 0, y: 0, width: 40, height: 650, type: 'solid' },
      { x: 1760, y: 0, width: 40, height: 650, type: 'solid' },
      // Rooftop levels requiring wall climbs
      { x: 250, y: 460, width: 250, height: 20, type: 'one_way' },
      { x: 600, y: 360, width: 350, height: 20, type: 'one_way' },
      { x: 1000, y: 200, width: 40, height: 380, type: 'solid' }, // Wall jumper
      { x: 1040, y: 460, width: 200, height: 20, type: 'one_way' },
      { x: 1350, y: 340, width: 350, height: 20, type: 'one_way' },
      // Upper Ledges
      { x: 350, y: 220, width: 200, height: 20, type: 'one_way' },
      { x: 1200, y: 160, width: 200, height: 20, type: 'one_way' },
      { x: 1500, y: 180, width: 220, height: 20, type: 'one_way' },
      // Spikes
      { x: 1040, y: 560, width: 200, height: 20, type: 'spike', color: '#cbd5e1' },
      { x: 500, y: 560, width: 100, height: 20, type: 'spike', color: '#cbd5e1' }
    ],
    enemies: [
      { type: 'gunner', x: 450, y: 182 },
      { type: 'grunt', x: 750, y: 322, patrolRange: 100 },
      { type: 'shield', x: 900, y: 322, patrolRange: 50 },
      { type: 'gunner', x: 1140, y: 422 },
      { type: 'grunt', x: 1450, y: 302, patrolRange: 80 },
      { type: 'sniper', x: 1600, y: 142 }, 
      { type: 'shield', x: 1600, y: 542 },
      { type: 'grunt', x: 320, y: 542, patrolRange: 40 },
      { type: 'gunner', x: 1350, y: 542, patrolRange: 80 }
    ],
    completed: false,
  },
  {
    id: 'room_4',
    name: '4. Downpour Outpost (深渊骤雨)',
    width: 2100,
    height: 700,
    spawnPoint: { x: 100, y: 550 },
    theme: 'cyber_neon',
    platforms: [
      { x: 0, y: 640, width: 2100, height: 60, type: 'solid' },
      { x: 0, y: 0, width: 40, height: 700, type: 'solid' },
      { x: 2060, y: 0, width: 40, height: 700, type: 'solid' },
      // Staggered columns
      { x: 300, y: 480, width: 250, height: 24, type: 'one_way' },
      { x: 650, y: 380, width: 350, height: 24, type: 'one_way' },
      { x: 1100, y: 460, width: 300, height: 24, type: 'one_way' },
      // Elevated divider wall
      { x: 1450, y: 200, width: 40, height: 440, type: 'solid' },
      { x: 1510, y: 500, width: 250, height: 24, type: 'one_way' },
      { x: 1800, y: 340, width: 220, height: 24, type: 'one_way' },
      // Ledges
      { x: 450, y: 240, width: 200, height: 20, type: 'one_way' },
      { x: 800, y: 180, width: 250, height: 20, type: 'one_way' },
      { x: 1650, y: 220, width: 220, height: 20, type: 'one_way' },
      // Spikes
      { x: 600, y: 620, width: 240, height: 20, type: 'spike', color: '#ff3366' },
      { x: 1515, y: 620, width: 245, height: 20, type: 'spike', color: '#ff3366' }
    ],
    enemies: [
      { type: 'grunt', x: 400, y: 442, patrolRange: 80 },
      { type: 'shotgunner', x: 800, y: 342, patrolRange: 60 },
      { type: 'shield', x: 1200, y: 422, patrolRange: 40 },
      { type: 'sniper', x: 880, y: 142 },
      { type: 'grunt', x: 1400, y: 602, patrolRange: 50 },
      { type: 'shotgunner', x: 1680, y: 462, patrolRange: 50 },
      { type: 'gunner', x: 1880, y: 302 },
      { type: 'shield', x: 1950, y: 602 },
      { type: 'gunner', x: 380, y: 602, patrolRange: 40 },
      { type: 'gunner', x: 1050, y: 602, patrolRange: 50 },
      { type: 'grunt', x: 1850, y: 602, patrolRange: 60 }
    ],
    completed: false,
  },
  {
    id: 'room_5',
    name: '5. Cyber Grid Labs (数网实验室)',
    width: 2400,
    height: 700,
    spawnPoint: { x: 100, y: 550 },
    theme: 'matrix_green',
    platforms: [
      { x: 0, y: 620, width: 2400, height: 80, type: 'solid' },
      { x: 0, y: 0, width: 40, height: 700, type: 'solid' },
      { x: 2360, y: 0, width: 40, height: 700, type: 'solid' },
      // Server structures
      { x: 350, y: 350, width: 80, height: 270, type: 'solid' },
      { x: 750, y: 220, width: 100, height: 400, type: 'solid' },
      { x: 1250, y: 300, width: 80, height: 320, type: 'solid' },
      { x: 1750, y: 150, width: 100, height: 470, type: 'solid' },
      // Walkways
      { x: 150, y: 440, width: 200, height: 20, type: 'one_way' },
      { x: 430, y: 320, width: 320, height: 20, type: 'one_way' },
      { x: 850, y: 280, width: 220, height: 20, type: 'one_way' },
      { x: 1070, y: 440, width: 180, height: 20, type: 'one_way' },
      { x: 1330, y: 240, width: 320, height: 20, type: 'one_way' },
      // Security Ledges
      { x: 500, y: 160, width: 180, height: 20, type: 'one_way' },
      { x: 1100, y: 140, width: 200, height: 20, type: 'one_way' },
      { x: 1450, y: 100, width: 150, height: 20, type: 'one_way' },
      // Poison coolants
      { x: 430, y: 600, width: 320, height: 20, type: 'spike', color: '#10b981' },
      { x: 1330, y: 600, width: 320, height: 20, type: 'spike', color: '#10b981' }
    ],
    enemies: [
      { type: 'grunt', x: 520, y: 262, patrolRange: 50 },
      { type: 'gunner', x: 480, y: 282, patrolRange: 40 },
      { type: 'shield', x: 250, y: 572, patrolRange: 60 },
      { type: 'sniper', x: 800, y: 172 },
      { type: 'gunner', x: 950, y: 242, patrolRange: 40 },
      { type: 'grunt', x: 1120, y: 382, patrolRange: 40 },
      { type: 'shotgunner', x: 1450, y: 202, patrolRange: 60 },
      { type: 'sniper', x: 1800, y: 102 },
      { type: 'shield', x: 1900, y: 572, patrolRange: 60 },
      { type: 'shotgunner', x: 2100, y: 572, patrolRange: 80 },
      { type: 'grunt', x: 1000, y: 572, patrolRange: 100 },
      { type: 'gunner', x: 1100, y: 572, patrolRange: 80 },
      { type: 'shotgunner', x: 2250, y: 572, patrolRange: 50 }
    ],
    completed: false,
  },
  {
    id: 'room_6',
    name: '6. Sky Monorails (极速空轨)',
    width: 2700,
    height: 750,
    spawnPoint: { x: 120, y: 180 },
    theme: 'amber_sunset',
    platforms: [
      // Spawning zone left platform
      { x: 0, y: 280, width: 300, height: 470, type: 'solid' },
      { x: 2400, y: 320, width: 300, height: 430, type: 'solid' },
      // Rails
      { x: 380, y: 380, width: 600, height: 25, type: 'solid' },
      { x: 1080, y: 260, width: 550, height: 25, type: 'solid' },
      { x: 1730, y: 400, width: 570, height: 25, type: 'solid' },
      // Hanging scaffolds
      { x: 320, y: 220, width: 140, height: 20, type: 'one_way' },
      { x: 550, y: 250, width: 160, height: 20, type: 'one_way' },
      { x: 800, y: 180, width: 150, height: 20, type: 'one_way' },
      { x: 1100, y: 440, width: 180, height: 20, type: 'one_way' },
      { x: 1350, y: 450, width: 180, height: 20, type: 'one_way' },
      { x: 1800, y: 280, width: 150, height: 20, type: 'one_way' },
      { x: 2050, y: 240, width: 150, height: 20, type: 'one_way' },
      // Absolute fall death pit
      { x: 0, y: 725, width: 2700, height: 25, type: 'spike', color: '#f59e0b' }
    ],
    enemies: [
      { type: 'gunner', x: 480, y: 342, patrolRange: 40 },
      { type: 'grunt', x: 450, y: 342, patrolRange: 50 },
      { type: 'shield', x: 700, y: 342, patrolRange: 50 },
      { type: 'sniper', x: 1200, y: 222 },
      { type: 'shotgunner', x: 1400, y: 222, patrolRange: 60 },
      { type: 'grunt', x: 1850, y: 362, patrolRange: 80 },
      { type: 'shield', x: 2000, y: 362, patrolRange: 60 },
      { type: 'sniper', x: 2450, y: 282 },
      { type: 'gunner', x: 550, y: 342, patrolRange: 50 },
      { type: 'grunt', x: 850, y: 342, patrolRange: 80 },
      { type: 'shotgunner', x: 1150, y: 222, patrolRange: 40 },
      { type: 'gunner', x: 1500, y: 222, patrolRange: 50 },
      { type: 'grunt', x: 1950, y: 362, patrolRange: 80 },
      { type: 'shotgunner', x: 2150, y: 362, patrolRange: 50 },
      { type: 'sniper', x: 800, y: 142 },
      { type: 'gunner', x: 2500, y: 282 }
    ],
    completed: false,
  },
  {
    id: 'room_7',
    name: '7. Lost Canal Sector-9 (九号沦陷区)',
    width: 3000,
    height: 800,
    spawnPoint: { x: 100, y: 680 },
    theme: 'industrial_crimson',
    platforms: [
      { x: 0, y: 740, width: 3000, height: 60, type: 'solid' },
      { x: 0, y: 0, width: 40, height: 800, type: 'solid' },
      { x: 2960, y: 0, width: 40, height: 800, type: 'solid' },
      // Ventilation shafts
      { x: 500, y: 300, width: 60, height: 440, type: 'solid' },
      { x: 1100, y: 150, width: 60, height: 590, type: 'solid' },
      { x: 1700, y: 150, width: 60, height: 590, type: 'solid' },
      { x: 2300, y: 300, width: 60, height: 440, type: 'solid' },
      // Waste pools
      { x: 250, y: 720, width: 250, height: 20, type: 'spike', color: '#dc2626' },
      { x: 560, y: 720, width: 540, height: 20, type: 'spike', color: '#dc2626' },
      { x: 1760, y: 720, width: 540, height: 20, type: 'spike', color: '#dc2626' },
      { x: 2360, y: 720, width: 600, height: 20, type: 'spike', color: '#dc2626' },
      // One-way bridges
      { x: 150, y: 580, width: 180, height: 20, type: 'one_way' },
      { x: 300, y: 440, width: 180, height: 20, type: 'one_way' },
      { x: 150, y: 300, width: 180, height: 20, type: 'one_way' },
      { x: 620, y: 580, width: 220, height: 20, type: 'one_way' },
      { x: 800, y: 440, width: 220, height: 20, type: 'one_way' },
      { x: 620, y: 300, width: 150, height: 20, type: 'one_way' },
      { x: 880, y: 220, width: 160, height: 20, type: 'one_way' },
      { x: 1200, y: 580, width: 220, height: 20, type: 'one_way' },
      { x: 1400, y: 440, width: 220, height: 20, type: 'one_way' },
      { x: 1200, y: 300, width: 150, height: 20, type: 'one_way' },
      { x: 1450, y: 220, width: 160, height: 20, type: 'one_way' },
      { x: 1820, y: 580, width: 220, height: 20, type: 'one_way' },
      { x: 2000, y: 440, width: 220, height: 20, type: 'one_way' },
      { x: 1820, y: 300, width: 150, height: 20, type: 'one_way' },
      { x: 2080, y: 220, width: 160, height: 20, type: 'one_way' },
      { x: 2450, y: 580, width: 200, height: 20, type: 'one_way' },
      { x: 2600, y: 440, width: 200, height: 20, type: 'one_way' },
      { x: 2450, y: 300, width: 180, height: 20, type: 'one_way' },
      { x: 2750, y: 580, width: 180, height: 20, type: 'one_way' }
    ],
    enemies: [
      { type: 'grunt', x: 350, y: 402, patrolRange: 40 },
      { type: 'shotgunner', x: 200, y: 542, patrolRange: 30 },
      { type: 'sniper', x: 240, y: 262 },
      { type: 'gunner', x: 680, y: 542, patrolRange: 40 },
      { type: 'shield', x: 860, y: 402, patrolRange: 60 },
      { type: 'sniper', x: 920, y: 182 }, 
      { type: 'grunt', x: 1250, y: 542, patrolRange: 40 },
      { type: 'shotgunner', x: 1450, y: 402, patrolRange: 30 },
      { type: 'gunner', x: 1880, y: 542, patrolRange: 40 },
      { type: 'shield', x: 2050, y: 402, patrolRange: 50 },
      { type: 'sniper', x: 2120, y: 182 },
      { type: 'grunt', x: 2500, y: 542, patrolRange: 40 },
      { type: 'shotgunner', x: 2650, y: 402, patrolRange: 40 },
      { type: 'sniper', x: 2480, y: 262 },
      { type: 'gunner', x: 140, y: 262 },
      { type: 'shotgunner', x: 680, y: 262 },
      { type: 'grunt', x: 1260, y: 262 },
      { type: 'shield', x: 1480, y: 182 },
      { type: 'gunner', x: 1880, y: 262 },
      { type: 'grunt', x: 2480, y: 262 },
      { type: 'shotgunner', x: 2800, y: 542, patrolRange: 40 },
      { type: 'shield', x: 740, y: 542, patrolRange: 30 }
    ],
    completed: false,
  },
  {
    id: 'room_8',
    name: "8. Asura's Doom (修罗绝境)",
    width: 3300,
    height: 800,
    spawnPoint: { x: 120, y: 650 },
    theme: 'vaporwave',
    platforms: [
      { x: 0, y: 740, width: 3300, height: 60, type: 'solid' },
      { x: 0, y: 0, width: 40, height: 800, type: 'solid' },
      { x: 3260, y: 0, width: 40, height: 800, type: 'solid' },
      // Pillars
      { x: 500, y: 300, width: 60, height: 440, type: 'solid' },
      { x: 1100, y: 0, width: 60, height: 450, type: 'solid' },
      { x: 1100, y: 580, width: 60, height: 160, type: 'solid' }, 
      { x: 1700, y: 250, width: 60, height: 490, type: 'solid' },
      { x: 2300, y: 0, width: 60, height: 450, type: 'solid' },
      { x: 2300, y: 580, width: 60, height: 160, type: 'solid' },
      { x: 2800, y: 200, width: 60, height: 540, type: 'solid' },
      // Bridging decks
      { x: 200, y: 620, width: 250, height: 24, type: 'one_way' },
      { x: 300, y: 480, width: 180, height: 24, type: 'one_way' },
      { x: 600, y: 550, width: 250, height: 24, type: 'one_way' },
      { x: 640, y: 380, width: 200, height: 24, type: 'one_way' },
      { x: 900, y: 270, width: 180, height: 24, type: 'one_way' },
      { x: 1200, y: 500, width: 250, height: 24, type: 'one_way' },
      { x: 1500, y: 380, width: 200, height: 24, type: 'one_way' },
      { x: 1850, y: 550, width: 250, height: 24, type: 'one_way' },
      { x: 2150, y: 400, width: 350, height: 24, type: 'one_way' },
      { x: 1950, y: 260, width: 250, height: 24, type: 'one_way' },
      { x: 2400, y: 500, width: 200, height: 24, type: 'one_way' },
      { x: 2600, y: 350, width: 180, height: 24, type: 'one_way' },
      { x: 2900, y: 520, width: 220, height: 24, type: 'one_way' },
      { x: 2950, y: 330, width: 200, height: 24, type: 'one_way' },
      // Hazard fields
      { x: 620, y: 720, width: 440, height: 20, type: 'spike', color: '#ff007f' },
      { x: 1220, y: 720, width: 440, height: 20, type: 'spike', color: '#ff007f' },
      { x: 1820, y: 720, width: 440, height: 20, type: 'spike', color: '#ff007f' },
      { x: 2420, y: 720, width: 340, height: 20, type: 'spike', color: '#ff007f' },
      { x: 2880, y: 720, width: 340, height: 20, type: 'spike', color: '#ff007f' }
    ],
    enemies: [
      { type: 'grunt', x: 680, y: 512, patrolRange: 40 },
      { type: 'grunt', x: 420, y: 702, patrolRange: 50 },
      { type: 'sniper', x: 740, y: 342 },
      { type: 'shield', x: 250, y: 702, patrolRange: 80 },
      { type: 'shotgunner', x: 910, y: 232, patrolRange: 40 },
      { type: 'gunner', x: 1250, y: 462 },
      { type: 'grunt', x: 1280, y: 462, patrolRange: 30 },
      { type: 'shotgunner', x: 1600, y: 342, patrolRange: 50 },
      { type: 'sniper', x: 1950, y: 222 },
      { type: 'shield', x: 2000, y: 222, patrolRange: 30 },
      { type: 'grunt', x: 1900, y: 512, patrolRange: 50 },
      { type: 'shotgunner', x: 2450, y: 462, patrolRange: 30 },
      { type: 'gunner', x: 2650, y: 312 },
      { type: 'sniper', x: 2950, y: 292 },
      { type: 'grunt', x: 2950, y: 482, patrolRange: 50 },
      { type: 'shield', x: 3240, y: 702, patrolRange: 40 },
      // Elite reinforcement
      { type: 'shotgunner', x: 620, y: 512, patrolRange: 20 },
      { type: 'gunner', x: 1120, y: 702, patrolRange: 10 },
      { type: 'sniper', x: 1715, y: 212 },
      { type: 'grunt', x: 1750, y: 702, patrolRange: 0 },
      { type: 'shield', x: 2350, y: 702, patrolRange: 10 },
      { type: 'shotgunner', x: 2650, y: 312, patrolRange: 20 },
      { type: 'gunner', x: 800, y: 232 },
      { type: 'grunt', x: 1550, y: 342, patrolRange: 30 },
      { type: 'shield', x: 2180, y: 362, patrolRange: 20 },
      { type: 'shotgunner', x: 2980, y: 292, patrolRange: 20 }
    ],
    completed: false,
  },
  {
    id: 'room_9',
    name: '9. Neon Citadel Hub (霓虹主控中心)',
    width: 3600,
    height: 850,
    spawnPoint: { x: 120, y: 700 },
    theme: 'cyber_neon',
    platforms: [
      { x: 0, y: 790, width: 3600, height: 60, type: 'solid' },
      { x: 0, y: 0, width: 40, height: 850, type: 'solid' },
      { x: 3560, y: 0, width: 40, height: 850, type: 'solid' },
      // Dividers
      { x: 700, y: 250, width: 50, height: 540, type: 'solid' },
      { x: 1400, y: 0, width: 50, height: 550, type: 'solid' },
      { x: 1400, y: 650, width: 50, height: 140, type: 'solid' },
      { x: 2100, y: 250, width: 50, height: 540, type: 'solid' },
      { x: 2800, y: 0, width: 50, height: 550, type: 'solid' },
      { x: 2800, y: 650, width: 50, height: 140, type: 'solid' },
      // Walkways
      { x: 150, y: 650, width: 450, height: 22, type: 'one_way' },
      { x: 250, y: 510, width: 350, height: 22, type: 'one_way' },
      { x: 100, y: 370, width: 380, height: 22, type: 'one_way' },
      { x: 380, y: 240, width: 280, height: 22, type: 'one_way' },
      { x: 840, y: 600, width: 450, height: 22, type: 'one_way' },
      { x: 780, y: 440, width: 350, height: 22, type: 'one_way' },
      { x: 1020, y: 280, width: 340, height: 22, type: 'one_way' },
      { x: 1550, y: 550, width: 450, height: 22, type: 'one_way' },
      { x: 1650, y: 390, width: 300, height: 22, type: 'one_way' },
      { x: 1480, y: 240, width: 450, height: 22, type: 'one_way' },
      { x: 2250, y: 600, width: 450, height: 22, type: 'one_way' },
      { type: 'one_way', x: 2150, y: 440, width: 350, height: 22 },
      { type: 'one_way', x: 2350, y: 280, width: 410, height: 22 },
      { x: 2950, y: 550, width: 450, height: 22, type: 'one_way' },
      { x: 3050, y: 390, width: 300, height: 22, type: 'one_way' },
      { x: 2880, y: 240, width: 450, height: 22, type: 'one_way' },
      // Under spiker pools
      { x: 750, y: 770, width: 650, height: 20, type: 'spike', color: '#22d3ee' },
      { x: 1450, y: 770, width: 650, height: 20, type: 'spike', color: '#22d3ee' },
      { x: 2150, y: 770, width: 650, height: 20, type: 'spike', color: '#22d3ee' }
    ],
    enemies: [
      { type: 'grunt', x: 550, y: 600, patrolRange: 50 },
      { type: 'shield', x: 600, y: 600, patrolRange: 40 },
      { type: 'gunner', x: 520, y: 460, patrolRange: 50 },
      { type: 'sniper', x: 550, y: 320 },
      { type: 'shotgunner', x: 850, y: 550, patrolRange: 80 }, 
      { type: 'shield', x: 1000, y: 550, patrolRange: 40 },
      { type: 'gunner', x: 800, y: 380, patrolRange: 60 },
      { type: 'sniper', x: 1250, y: 220 },
      { type: 'grunt', x: 550, y: 740, patrolRange: 100 },
      { type: 'shield', x: 600, y: 740, patrolRange: 80 },
      { type: 'shotgunner', x: 1700, y: 490, patrolRange: 60 },
      { type: 'gunner', x: 1720, y: 330, patrolRange: 40 },
      { type: 'sniper', x: 1950, y: 180 },
      { type: 'grunt', x: 2250, y: 540, patrolRange: 100 },
      { type: 'shield', x: 2400, y: 540, patrolRange: 80 },
      { type: 'shotgunner', x: 2250, y: 370, patrolRange: 50 },
      { type: 'sniper', x: 2550, y: 220 }, 
      { type: 'shotgunner', x: 2950, y: 490, patrolRange: 80 },
      { type: 'shield', x: 3100, y: 490, patrolRange: 40 },
      { type: 'gunner', x: 2900, y: 330, patrolRange: 60 },
      { type: 'sniper', x: 3400, y: 180 },
      { type: 'shotgunner', x: 3200, y: 740, patrolRange: 150 },
      { type: 'gunner', x: 650, y: 740, patrolRange: 50 },
      { type: 'shotgunner', x: 840, y: 560, patrolRange: 50 },
      { type: 'grunt', x: 1550, y: 512, patrolRange: 50 },
      { type: 'shield', x: 1750, y: 512, patrolRange: 50 },
      { type: 'gunner', x: 2250, y: 560, patrolRange: 50 },
      { type: 'shotgunner', x: 2950, y: 740, patrolRange: 50 },
      { type: 'grunt', x: 3350, y: 740, patrolRange: 100 },
      { type: 'shield', x: 3450, y: 740, patrolRange: 50 },
      { type: 'sniper', x: 580, y: 180 }
    ],
    completed: false,
  },
  {
    id: 'room_10',
    name: '10. Chronos Singularity (时隙奇点)',
    width: 4000,
    height: 900,
    spawnPoint: { x: 100, y: 720 },
    theme: 'matrix_green',
    platforms: [
      // Level 10 Base structures. Let's make sure the spawn is perfectly safe.
      { x: 0, y: 800, width: 450, height: 100, type: 'solid' }, // Starting solid platform
      { x: 450, y: 0, width: 50, height: 900, type: 'solid' }, // Boundary separator block to guide upward wall climb
      
      // Giant monolith pillars blocking normal movement
      { x: 800, y: 250, width: 80, height: 590, type: 'solid' },
      { x: 1350, y: 0, width: 80, height: 600, type: 'solid' },
      { x: 1900, y: 300, width: 80, height: 540, type: 'solid' },
      { x: 2550, y: 0, width: 80, height: 550, type: 'solid' },
      { x: 2550, y: 680, width: 80, height: 220, type: 'solid' },
      { x: 3200, y: 150, width: 80, height: 750, type: 'solid' },

      // Staggered climbing blocks to fill the "Left side" and provide vertical progression
      { x: 120, y: 600, width: 140, height: 22, type: 'one_way' },
      { x: 260, y: 480, width: 140, height: 22, type: 'one_way' },
      { x: 100, y: 340, width: 140, height: 22, type: 'one_way' },
      { x: 240, y: 220, width: 160, height: 22, type: 'one_way' },

      // Middle chambers
      { x: 530, y: 700, width: 220, height: 22, type: 'one_way' },
      { x: 620, y: 540, width: 150, height: 22, type: 'one_way' },
      { x: 530, y: 380, width: 180, height: 22, type: 'one_way' },

      { x: 920, y: 660, width: 350, height: 22, type: 'one_way' },
      { x: 1050, y: 490, width: 260, height: 22, type: 'one_way' },
      { x: 920, y: 320, width: 320, height: 22, type: 'one_way' },

      { x: 1450, y: 660, width: 350, height: 22, type: 'one_way' },
      { x: 1600, y: 500, width: 260, height: 22, type: 'one_way' },
      { x: 1450, y: 340, width: 320, height: 22, type: 'one_way' },

      { x: 2050, y: 680, width: 350, height: 22, type: 'one_way' },
      { x: 2200, y: 520, width: 280, height: 22, type: 'one_way' },
      { x: 2000, y: 360, width: 320, height: 22, type: 'one_way' },

      { x: 2700, y: 620, width: 350, height: 22, type: 'one_way' },
      { x: 2850, y: 460, width: 280, height: 22, type: 'one_way' },
      { x: 2650, y: 300, width: 320, height: 22, type: 'one_way' },

      { x: 3350, y: 700, width: 450, height: 22, type: 'one_way' },
      { x: 3450, y: 540, width: 280, height: 22, type: 'one_way' },
      { x: 3300, y: 380, width: 320, height: 22, type: 'one_way' },

      // Flat Ground base floor (with code-green spikes in pits)
      { x: 0, y: 880, width: 4000, height: 20, type: 'solid' },
      { x: 450, y: 860, width: 3550, height: 22, type: 'spike', color: '#10b981' }
    ],
    enemies: [
      // Left side starting chamber: fair, engaging encounters instead of blank empty space!
      { type: 'grunt', x: 280, y: 742, patrolRange: 60 },
      { type: 'gunner', x: 160, y: 542, patrolRange: 40 },
      { type: 'shield', x: 260, y: 422, patrolRange: 30 },
      { type: 'sniper', x: 120, y: 282 },

      // Middle Singularity cells
      { type: 'grunt', x: 580, y: 642, patrolRange: 50 },
      { type: 'gunner', x: 640, y: 482, patrolRange: 40 },
      { type: 'shield', x: 550, y: 322, patrolRange: 30 },

      { type: 'shotgunner', x: 960, y: 602, patrolRange: 50 },
      { type: 'gunner', x: 1100, y: 432, patrolRange: 40 },
      { type: 'sniper', x: 920, y: 262 },

      { type: 'grunt', x: 1500, y: 602, patrolRange: 60 },
      { type: 'shield', x: 1650, y: 442, patrolRange: 30 },
      { type: 'sniper', x: 1480, y: 282 },

      { type: 'shotgunner', x: 2100, y: 622, patrolRange: 50 },
      { type: 'gunner', x: 2250, y: 462, patrolRange: 40 },
      { type: 'sniper', x: 2000, y: 302 },

      { type: 'grunt', x: 2750, y: 562, patrolRange: 80 },
      { type: 'shield', x: 2900, y: 402, patrolRange: 40 },
      { type: 'sniper', x: 2700, y: 242 },

      { type: 'grunt', x: 3400, y: 642, patrolRange: 80 },
      { type: 'shotgunner', x: 3500, y: 482, patrolRange: 50 },
      { type: 'sniper', x: 3380, y: 322 },

      // High complexity reinforcements
      { type: 'shield', x: 1020, y: 602, patrolRange: 30 },
      { type: 'shotgunner', x: 2200, y: 622, patrolRange: 30 }
    ],
    completed: false,
  },
  {
    id: 'room_11',
    name: '11. Binary Ventilation Shafts (双子风道)',
    width: 2400,
    height: 700,
    spawnPoint: { x: 120, y: 500 },
    theme: 'amber_sunset',
    platforms: [
      { x: 0, y: 600, width: 320, height: 100, type: 'solid' }, // Safe Spawn Platform
      { x: 2080, y: 580, width: 320, height: 120, type: 'solid' }, // Exit Safe Platform
      
      // Left and Right Giant Ventilation Tower Walls to scale via wall jumping
      { x: 500, y: 200, width: 80, height: 500, type: 'solid' },
      { x: 1000, y: 0, width: 80, height: 500, type: 'solid' },
      { x: 1500, y: 200, width: 80, height: 500, type: 'solid' },

      // Narrow chutes steps
      { x: 380, y: 450, width: 120, height: 22, type: 'one_way' },
      { x: 650, y: 520, width: 140, height: 22, type: 'one_way' },
      { x: 850, y: 380, width: 150, height: 22, type: 'one_way' },
      { x: 1150, y: 420, width: 150, height: 22, type: 'one_way' },
      { x: 1350, y: 280, width: 150, height: 22, type: 'one_way' },
      { x: 1650, y: 460, width: 160, height: 22, type: 'one_way' },
      { x: 1850, y: 320, width: 160, height: 22, type: 'one_way' },

      // Elevated sniper nests
      { x: 500, y: 178, width: 80, height: 22, type: 'one_way' },
      { x: 1000, y: 150, width: 80, height: 22, type: 'one_way' },
      { x: 1500, y: 178, width: 80, height: 22, type: 'one_way' },

      // Lethal fire grids (Sunset orange spikes)
      { x: 320, y: 680, width: 1760, height: 20, type: 'spike', color: '#f59e0b' }
    ],
    enemies: [
      { type: 'grunt', x: 260, y: 542, patrolRange: 40 },
      { type: 'gunner', x: 420, y: 392, patrolRange: 30 },
      { type: 'sniper', x: 540, y: 120 },
      { type: 'grunt', x: 700, y: 462, patrolRange: 40 },
      { type: 'shield', x: 900, y: 322, patrolRange: 40 },
      { type: 'sniper', x: 1040, y: 92 },
      { type: 'grunt', x: 1220, y: 362, patrolRange: 50 },
      { type: 'shotgunner', x: 1400, y: 222, patrolRange: 30 },
      { type: 'sniper', x: 1540, y: 120 },
      { type: 'gunner', x: 1720, y: 402, patrolRange: 40 },
      { type: 'shield', x: 1900, y: 262, patrolRange: 50 },
      { type: 'shotgunner', x: 2150, y: 522, patrolRange: 60 }
    ],
    completed: false,
  },
  {
    id: 'room_12',
    name: '12. Reactor Core Grid (核能反应堆)',
    width: 2700,
    height: 750,
    spawnPoint: { x: 120, y: 580 },
    theme: 'industrial_crimson',
    platforms: [
      { x: 0, y: 660, width: 300, height: 90, type: 'solid' }, // Safe Start Floor
      { x: 2400, y: 660, width: 300, height: 90, type: 'solid' }, // Safe Exit Floor
      
      // Symmetrical shield columns
      { x: 450, y: 300, width: 100, height: 360, type: 'solid' },
      { x: 1000, y: 0, width: 120, height: 420, type: 'solid' },
      { x: 1650, y: 300, width: 100, height: 360, type: 'solid' },
      { x: 2100, y: 0, width: 100, height: 420, type: 'solid' },

      // Reactor steps
      { x: 350, y: 520, width: 100, height: 22, type: 'one_way' },
      { x: 600, y: 440, width: 180, height: 22, type: 'one_way' },
      { x: 820, y: 320, width: 180, height: 22, type: 'one_way' },
      { x: 1180, y: 440, width: 180, height: 22, type: 'one_way' },
      { x: 1400, y: 320, width: 180, height: 22, type: 'one_way' },
      { x: 1800, y: 480, width: 180, height: 22, type: 'one_way' },
      { x: 2000, y: 360, width: 100, height: 22, type: 'one_way' },
      { x: 2250, y: 500, width: 150, height: 22, type: 'one_way' },

      // Superheated Crimson Liquid (spikes)
      { x: 300, y: 720, width: 2100, height: 30, type: 'spike', color: '#ea580c' }
    ],
    enemies: [
      { type: 'grunt', x: 200, y: 602, patrolRange: 50 },
      { type: 'gunner', x: 380, y: 462, patrolRange: 30 },
      { type: 'shield', x: 650, y: 382, patrolRange: 40 },
      { type: 'shotgunner', x: 860, y: 262, patrolRange: 40 },
      { type: 'sniper', x: 1060, y: 360 }, // guarded sniper
      { type: 'gunner', x: 1240, y: 382, patrolRange: 50 },
      { type: 'shield', x: 1450, y: 262, patrolRange: 40 },
      { type: 'shotgunner', x: 1850, y: 422, patrolRange: 40 },
      { type: 'sniper', x: 2150, y: 360 },
      { type: 'grunt', x: 2300, y: 442, patrolRange: 40 },
      { type: 'shotgunner', x: 2480, y: 602, patrolRange: 50 }
    ],
    completed: false,
  },
  {
    id: 'room_13',
    name: '13. Neon Scaffold Highrise (霓虹极空)',
    width: 3000,
    height: 800,
    spawnPoint: { x: 120, y: 620 },
    theme: 'vaporwave',
    platforms: [
      { x: 0, y: 700, width: 300, height: 100, type: 'solid' }, // Safe Start Platform
      { x: 2700, y: 700, width: 300, height: 100, type: 'solid' }, // Safe End Platform
      
      // Floating Highrise Scaffold decks (High verticality)
      { x: 400, y: 580, width: 200, height: 22, type: 'one_way' },
      { x: 650, y: 460, width: 220, height: 22, type: 'one_way' },
      { x: 500, y: 300, width: 220, height: 22, type: 'one_way' },
      { x: 900, y: 340, width: 240, height: 22, type: 'one_way' },
      { x: 1200, y: 460, width: 250, height: 22, type: 'one_way' },
      { x: 1500, y: 320, width: 250, height: 22, type: 'one_way' },
      { x: 1800, y: 440, width: 250, height: 22, type: 'one_way' },
      { x: 2100, y: 300, width: 220, height: 22, type: 'one_way' },
      { x: 2350, y: 420, width: 200, height: 22, type: 'one_way' },
      { x: 2500, y: 580, width: 200, height: 22, type: 'one_way' },

      // Safety Nets below: if you fall, you land on lower secondary walkways rather than insta-death
      { x: 600, y: 680, width: 450, height: 22, type: 'one_way' },
      { x: 1400, y: 680, width: 550, height: 22, type: 'one_way' },

      // Bottom radioactive fall zones (Magenta laser grid spikes)
      { x: 300, y: 770, width: 2400, height: 30, type: 'spike', color: '#db2777' }
    ],
    enemies: [
      { type: 'grunt', x: 200, y: 642, patrolRange: 50 },
      { type: 'gunner', x: 450, y: 522, patrolRange: 40 },
      { type: 'grunt', x: 700, y: 402, patrolRange: 50 },
      { type: 'shield', x: 550, y: 242, patrolRange: 30 },
      { type: 'grunt', x: 750, y: 622, patrolRange: 100 }, // lower patrol safety net guard
      { type: 'shotgunner', x: 950, y: 282, patrolRange: 40 },
      { type: 'sniper', x: 1250, y: 400 },
      { type: 'gunner', x: 1550, y: 262, patrolRange: 40 },
      { type: 'grunt', x: 1600, y: 622, patrolRange: 120 }, // lower safety net patrol
      { type: 'shield', x: 1850, y: 382, patrolRange: 40 },
      { type: 'sniper', x: 2150, y: 240 },
      { type: 'shotgunner', x: 2400, y: 362, patrolRange: 50 },
      { type: 'gunner', x: 2550, y: 522, patrolRange: 40 },
      { type: 'grunt', x: 2800, y: 642, patrolRange: 40 }
    ],
    completed: false,
  },
  {
    id: 'room_14',
    name: '14. Virtual Void Fortress (虚空训练所)',
    width: 3300,
    height: 800,
    spawnPoint: { x: 120, y: 620 },
    theme: 'monochrome_cyber',
    platforms: [
      { x: 0, y: 720, width: 300, height: 80, type: 'solid' }, // Safe Spawn Platform
      { x: 3000, y: 720, width: 300, height: 80, type: 'solid' }, // Safe Exit Platform
      
      // Symmetrical sniper watchtowers
      { x: 600, y: 200, width: 80, height: 520, type: 'solid' },
      { x: 1500, y: 0, width: 100, height: 500, type: 'solid' },
      { x: 1500, y: 620, width: 100, height: 100, type: 'solid' },
      { x: 2400, y: 200, width: 80, height: 520, type: 'solid' },

      // Training bridges
      { x: 380, y: 550, width: 220, height: 22, type: 'one_way' },
      { x: 420, y: 380, width: 180, height: 22, type: 'one_way' },
      { x: 680, y: 440, width: 220, height: 22, type: 'one_way' },
      { x: 1000, y: 320, width: 250, height: 22, type: 'one_way' },
      { x: 1250, y: 480, width: 250, height: 22, type: 'one_way' },
      { x: 1600, y: 500, width: 250, height: 22, type: 'one_way' },
      { x: 1850, y: 340, width: 250, height: 22, type: 'one_way' },
      { x: 2180, y: 440, width: 220, height: 22, type: 'one_way' },
      { x: 2480, y: 550, width: 220, height: 22, type: 'one_way' },
      { x: 2520, y: 380, width: 180, height: 22, type: 'one_way' },

      // Bounce platforms
      { x: 920, y: 600, width: 60, height: 20, type: 'bounce' },
      { x: 2180, y: 600, width: 60, height: 20, type: 'bounce' },

      // Lethal silver ground spikes (Chrono spikes)
      { x: 300, y: 700, width: 2700, height: 20, type: 'spike', color: '#94a3b8' }
    ],
    enemies: [
      { type: 'grunt', x: 240, y: 662, patrolRange: 40 },
      { type: 'gunner', x: 400, y: 492, patrolRange: 30 },
      { type: 'sniper', x: 600, y: 142 }, // High sniper
      { type: 'shotgunner', x: 740, y: 382, patrolRange: 30 },
      { type: 'shield', x: 1050, y: 262, patrolRange: 40 },
      { type: 'grunt', x: 1300, y: 422, patrolRange: 50 },
      { type: 'sniper', x: 1510, y: 562 }, // core watchtower sniper
      { type: 'shotgunner', x: 1700, y: 442, patrolRange: 40 },
      { type: 'shield', x: 1950, y: 282, patrolRange: 40 },
      { type: 'sniper', x: 2400, y: 142 }, // Right tower sniper
      { type: 'gunner', x: 2540, y: 492, patrolRange: 30 },
      { type: 'grunt', x: 2820, y: 662, patrolRange: 40 }
    ],
    completed: false,
  },
  {
    id: 'room_15',
    name: '15. The Cyberpunk Singularity (赛博终极奇点)',
    width: 4000,
    height: 900,
    spawnPoint: { x: 120, y: 720 },
    theme: 'cyber_neon',
    platforms: [
      { x: 0, y: 800, width: 400, height: 100, type: 'solid' }, // Ultimate Safe Spawn base
      { x: 3600, y: 800, width: 400, height: 100, type: 'solid' }, // Safe Exit Platform

      // Extreme structural monolith divisions across 4000px
      { x: 700, y: 250, width: 80, height: 550, type: 'solid' },
      { x: 1400, y: 0, width: 80, height: 550, type: 'solid' },
      { x: 2100, y: 250, width: 80, height: 650, type: 'solid' },
      { x: 2800, y: 0, width: 80, height: 550, type: 'solid' },

      // Complex scaffolding networks
      { x: 150, y: 650, width: 220, height: 22, type: 'one_way' },
      { x: 260, y: 500, width: 140, height: 22, type: 'one_way' },
      { x: 100, y: 350, width: 220, height: 22, type: 'one_way' },

      { x: 830, y: 680, width: 220, height: 22, type: 'one_way' },
      { x: 950, y: 520, width: 220, height: 22, type: 'one_way' },
      { x: 820, y: 360, width: 180, height: 22, type: 'one_way' },
      { x: 1100, y: 240, width: 240, height: 22, type: 'one_way' },

      { x: 1550, y: 620, width: 250, height: 22, type: 'one_way' },
      { x: 1750, y: 460, width: 250, height: 22, type: 'one_way' },
      { x: 1500, y: 300, width: 240, height: 22, type: 'one_way' },

      { x: 2250, y: 680, width: 220, height: 22, type: 'one_way' },
      { x: 2450, y: 520, width: 220, height: 22, type: 'one_way' },
      { x: 2300, y: 360, width: 180, height: 22, type: 'one_way' },
      { x: 2550, y: 240, width: 240, height: 22, type: 'one_way' },

      { x: 2950, y: 620, width: 250, height: 22, type: 'one_way' },
      { x: 3150, y: 460, width: 250, height: 22, type: 'one_way' },
      { x: 2900, y: 300, width: 240, height: 22, type: 'one_way' },

      // High velocity bounce blocks
      { x: 500, y: 780, width: 60, height: 20, type: 'bounce' },
      { x: 1900, y: 780, width: 60, height: 20, type: 'bounce' },

      // Bottom continuous plasma field (spikes)
      { x: 400, y: 880, width: 3200, height: 20, type: 'spike', color: '#06b6d4' }
    ],
    enemies: [
      // Starting security line
      { type: 'grunt', x: 280, y: 742, patrolRange: 60 },
      { type: 'gunner', x: 180, y: 592, patrolRange: 40 },
      { type: 'shield', x: 280, y: 442, patrolRange: 30 },

      // First Chamber
      { type: 'shotgunner', x: 850, y: 622, patrolRange: 40 },
      { type: 'gunner', x: 980, y: 462, patrolRange: 40 },
      { type: 'sniper', x: 850, y: 302 },

      // Second Chamber
      { type: 'shield', x: 1600, y: 562, patrolRange: 40 },
      { type: 'gunner', x: 1780, y: 402, patrolRange: 50 },
      { type: 'sniper', x: 1550, y: 242 },

      // Third Chamber
      { type: 'shotgunner', x: 2300, y: 622, patrolRange: 40 },
      { type: 'gunner', x: 2480, y: 462, patrolRange: 40 },
      { type: 'sniper', x: 2320, y: 302 },

      // Fourth Chamber
      { type: 'shield', x: 3000, y: 562, patrolRange: 40 },
      { type: 'gunner', x: 3180, y: 402, patrolRange: 50 },
      { type: 'sniper', x: 2950, y: 242 },

      // Castle exit guards
      { type: 'grunt', x: 3450, y: 742, patrolRange: 100 },
      { type: 'shield', x: 3750, y: 742, patrolRange: 40 },
      { type: 'shotgunner', x: 3850, y: 742, patrolRange: 50 }
    ],
    completed: false,
  },
  {
    id: 'room_16',
    name: '16. Showdown: Chronos Rift (终极决战：时空裂缝)',
    width: 1600,
    height: 600,
    spawnPoint: { x: 180, y: 400 },
    theme: 'industrial_crimson',
    platforms: [
      // Floors
      { x: 0, y: 520, width: 450, height: 80, type: 'solid' },
      { x: 450, y: 550, width: 700, height: 50, type: 'solid' },
      { x: 1150, y: 520, width: 450, height: 80, type: 'solid' },
      // Walls
      { x: 0, y: 0, width: 40, height: 600, type: 'solid' },
      { x: 1560, y: 0, width: 40, height: 600, type: 'solid' },
      // Platforms representing fighting arenas and ledges
      { x: 150, y: 350, width: 250, height: 20, type: 'one_way' },
      { x: 1200, y: 350, width: 250, height: 20, type: 'one_way' },
      { x: 550, y: 220, width: 500, height: 20, type: 'one_way' },
      // Bounce pads for spectacular escapes
      { x: 220, y: 500, width: 60, height: 20, type: 'bounce' },
      { x: 1320, y: 500, width: 60, height: 20, type: 'bounce' },
      // Spike hazards in the lowered center area margins
      { x: 450, y: 535, width: 100, height: 15, type: 'spike', color: '#ff3366' },
      { x: 1050, y: 535, width: 100, height: 15, type: 'spike', color: '#ff3366' }
    ],
    enemies: [
      { type: 'boss', x: 800, y: 300 }
    ],
    completed: false,
  }
];
