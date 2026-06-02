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
    platforms: [
      // Floor
      { x: 0, y: 520, width: 1200, height: 80, type: 'solid' },
      // Left Wall
      { x: 0, y: 0, width: 40, height: 600, type: 'solid' },
      // Right Wall
      { x: 1160, y: 0, width: 40, height: 600, type: 'solid' },
      // Tutorial structural platforms
      { x: 450, y: 380, width: 300, height: 25, type: 'one_way' },
      { x: 800, y: 280, width: 250, height: 25, type: 'one_way' },
      // Practice block
      { x: 150, y: 220, width: 180, height: 25, type: 'one_way' },
    ],
    enemies: [
      { type: 'gunner', x: 600, y: 340, patrolRange: 0 }, // Shoots at player from platform
      { type: 'grunt', x: 950, y: 240, patrolRange: 100 },
      { type: 'grunt', x: 450, y: 480, patrolRange: 120 },
    ],
    completed: false,
  },
  {
    id: 'room_2',
    name: '2. Neon Alleyways (霓虹小巷)',
    width: 1500,
    height: 600,
    spawnPoint: { x: 100, y: 450 },
    platforms: [
      // Floor
      { x: 0, y: 520, width: 1500, height: 80, type: 'solid' },
      // Left/Right Walls
      { x: 0, y: 0, width: 40, height: 600, type: 'solid' },
      { x: 1460, y: 0, width: 40, height: 600, type: 'solid' },
      
      // Horizontal pillars & High-ground
      { x: 300, y: 400, width: 150, height: 20, type: 'one_way' },
      { x: 550, y: 300, width: 180, height: 20, type: 'one_way' },
      { x: 850, y: 420, width: 200, height: 20, type: 'one_way' },
      { x: 1150, y: 280, width: 150, height: 20, type: 'one_way' },
      
      // High ceiling platforms
      { x: 400, y: 160, width: 350, height: 20, type: 'one_way' },
      { x: 950, y: 140, width: 250, height: 20, type: 'one_way' },
      
      // Hazard spike zone
      { x: 750, y: 500, width: 150, height: 20, type: 'spike', color: '#ff3366' }
    ],
    enemies: [
      { type: 'grunt', x: 480, y: 480, patrolRange: 100 },
      { type: 'gunner', x: 640, y: 260, patrolRange: 40 },
      { type: 'gunner', x: 450, y: 120, patrolRange: 0 },
      { type: 'grunt', x: 950, y: 480, patrolRange: 100 },
      { type: 'shield', x: 1100, y: 480, patrolRange: 80 },
      { type: 'gunner', x: 1300, y: 340, patrolRange: 0 },
    ],
    completed: false,
  },
  {
    id: 'room_3',
    name: '3. Rooftop Infiltration (楼顶潜入)',
    width: 1800,
    height: 650,
    spawnPoint: { x: 100, y: 500 },
    platforms: [
      // Main Floor
      { x: 0, y: 580, width: 1800, height: 70, type: 'solid' },
      // Outer border walls
      { x: 0, y: 0, width: 40, height: 650, type: 'solid' },
      { x: 1760, y: 0, width: 40, height: 650, type: 'solid' },

      // Rooftop levels (staggered gaps)
      { x: 250, y: 460, width: 250, height: 20, type: 'one_way' },
      { x: 600, y: 360, width: 350, height: 20, type: 'one_way' },
      // Wall barrier that requires wall jump to scale
      { x: 1000, y: 200, width: 40, height: 380, type: 'solid' },
      { x: 1040, y: 460, width: 200, height: 20, type: 'one_way' },
      { x: 1350, y: 340, width: 350, height: 20, type: 'one_way' },
      
      // Upper rooftop high ledges
      { x: 350, y: 220, width: 200, height: 20, type: 'one_way' },
      { x: 1200, y: 160, width: 200, height: 20, type: 'one_way' },
      { x: 1500, y: 180, width: 220, height: 20, type: 'one_way' },

      // Spikes in the gaps
      { x: 1040, y: 560, width: 200, height: 20, type: 'spike', color: '#ff3366' },
      { x: 500, y: 560, width: 100, height: 20, type: 'spike', color: '#ff3366' }
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
    platforms: [
      // Main Floor
      { x: 0, y: 640, width: 2100, height: 60, type: 'solid' },
      // Borders
      { x: 0, y: 0, width: 40, height: 700, type: 'solid' },
      { x: 2060, y: 0, width: 40, height: 700, type: 'solid' },

      // Staggered vertical outposts
      { x: 300, y: 480, width: 250, height: 24, type: 'one_way' },
      { x: 650, y: 380, width: 350, height: 24, type: 'one_way' },
      { x: 1100, y: 460, width: 300, height: 24, type: 'one_way' },
      
      // Central elevated steel wall
      { x: 1450, y: 200, width: 40, height: 440, type: 'solid' },
      { x: 1510, y: 500, width: 250, height: 24, type: 'one_way' },
      { x: 1800, y: 340, width: 220, height: 24, type: 'one_way' },

      // Ledges inside upper heights
      { x: 450, y: 240, width: 200, height: 20, type: 'one_way' },
      { x: 800, y: 180, width: 250, height: 20, type: 'one_way' },
      { x: 1650, y: 220, width: 220, height: 20, type: 'one_way' },

      // Spikes floor fields
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
    platforms: [
      // Floor
      { x: 0, y: 620, width: 2400, height: 80, type: 'solid' },
      // Left/Right Walls
      { x: 0, y: 0, width: 40, height: 700, type: 'solid' },
      { x: 2360, y: 0, width: 40, height: 700, type: 'solid' },

      // Raised Server rack columns
      { x: 350, y: 350, width: 80, height: 270, type: 'solid' },
      { x: 750, y: 220, width: 100, height: 400, type: 'solid' },
      { x: 1250, y: 300, width: 80, height: 320, type: 'solid' },
      { x: 1750, y: 150, width: 100, height: 470, type: 'solid' },

      // Horizontal walkway meshes
      { x: 150, y: 440, width: 200, height: 20, type: 'one_way' },
      { x: 430, y: 320, width: 320, height: 20, type: 'one_way' },
      { x: 850, y: 280, width: 220, height: 20, type: 'one_way' },
      { x: 1070, y: 440, width: 180, height: 20, type: 'one_way' },
      { x: 1330, y: 240, width: 320, height: 20, type: 'one_way' },
      
      // Upper security ladders
      { x: 500, y: 160, width: 180, height: 20, type: 'one_way' },
      { x: 1100, y: 140, width: 200, height: 20, type: 'one_way' },
      { x: 1450, y: 100, width: 150, height: 20, type: 'one_way' },

      // Coolant leaks purple spikes
      { x: 430, y: 600, width: 320, height: 20, type: 'spike', color: '#a855f7' },
      { x: 1330, y: 600, width: 320, height: 20, type: 'spike', color: '#a855f7' }
    ],
    enemies: [
      { type: 'grunt', x: 520, y: 260, patrolRange: 50 },
      { type: 'gunner', x: 480, y: 280, patrolRange: 40 },
      { type: 'shield', x: 250, y: 570, patrolRange: 60 },
      { type: 'sniper', x: 800, y: 170 },
      { type: 'gunner', x: 950, y: 240, patrolRange: 40 },
      { type: 'grunt', x: 1120, y: 380, patrolRange: 40 },
      { type: 'shotgunner', x: 1450, y: 200, patrolRange: 60 },
      { type: 'sniper', x: 1800, y: 100 },
      { type: 'shield', x: 1900, y: 570, patrolRange: 60 },
      { type: 'shotgunner', x: 2100, y: 570, patrolRange: 80 },
      { type: 'grunt', x: 1000, y: 570, patrolRange: 100 },
      { type: 'gunner', x: 1100, y: 570, patrolRange: 80 },
      { type: 'shotgunner', x: 2250, y: 570, patrolRange: 50 }
    ],
    completed: false,
  },
  {
    id: 'room_6',
    name: '6. Sky Monorails (极速空轨)',
    width: 2700,
    height: 750,
    spawnPoint: { x: 120, y: 180 },
    platforms: [
      // Pit vertigo danger. Left/Right terminals
      { x: 0, y: 280, width: 300, height: 470, type: 'solid' },
      { x: 2400, y: 320, width: 300, height: 430, type: 'solid' },

      // Sky Monorail suspended beams
      { x: 380, y: 380, width: 600, height: 25, type: 'solid' },
      { x: 1080, y: 260, width: 550, height: 25, type: 'solid' },
      { x: 1730, y: 400, width: 570, height: 25, type: 'solid' },

      // Floating support scaffolds
      { x: 320, y: 220, width: 140, height: 20, type: 'one_way' },
      { x: 550, y: 250, width: 160, height: 20, type: 'one_way' },
      { x: 800, y: 180, width: 150, height: 20, type: 'one_way' },

      { x: 1100, y: 440, width: 180, height: 20, type: 'one_way' },
      { x: 1350, y: 450, width: 180, height: 20, type: 'one_way' },
      
      { x: 1800, y: 280, width: 150, height: 20, type: 'one_way' },
      { x: 2050, y: 240, width: 150, height: 20, type: 'one_way' },

      // Continuous lethal grid below the rails (Entire floor is a hazard spike pool!)
      { x: 0, y: 725, width: 2700, height: 25, type: 'spike', color: '#ef4444' }
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
      // Added high density reinforcements:
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
    platforms: [
      // Floor Base
      { x: 0, y: 740, width: 3000, height: 60, type: 'solid' },
      // Walls
      { x: 0, y: 0, width: 40, height: 800, type: 'solid' },
      { x: 2960, y: 0, width: 40, height: 800, type: 'solid' },

      // Towering central ventilation shafts
      { x: 500, y: 300, width: 60, height: 440, type: 'solid' },
      { x: 1100, y: 150, width: 60, height: 590, type: 'solid' },
      { x: 1700, y: 150, width: 60, height: 590, type: 'solid' },
      { x: 2300, y: 300, width: 60, height: 440, type: 'solid' },

      // Flooded acid green spikes
      { x: 250, y: 720, width: 250, height: 20, type: 'spike', color: '#10b981' },
      { x: 560, y: 720, width: 540, height: 20, type: 'spike', color: '#10b981' },
      { x: 1760, y: 720, width: 540, height: 20, type: 'spike', color: '#10b981' },
      { x: 2360, y: 720, width: 600, height: 20, type: 'spike', color: '#10b981' },

      // One-way climbing scaffold decks
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
      // Extra heavy pressure canal squads
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
    platforms: [
      // Main Ground Floors
      { x: 0, y: 740, width: 3300, height: 60, type: 'solid' },
      { x: 0, y: 0, width: 40, height: 800, type: 'solid' },
      { x: 3260, y: 0, width: 40, height: 800, type: 'solid' },

      // Giant temple pillars (solid wall blocks)
      { x: 500, y: 300, width: 60, height: 440, type: 'solid' },
      { x: 1100, y: 0, width: 60, height: 450, type: 'solid' },
      { x: 1100, y: 580, width: 60, height: 160, type: 'solid' }, 
      { x: 1700, y: 250, width: 60, height: 490, type: 'solid' },
      { x: 2300, y: 0, width: 60, height: 450, type: 'solid' },
      { x: 2300, y: 580, width: 60, height: 160, type: 'solid' },
      { x: 2800, y: 200, width: 60, height: 540, type: 'solid' },

      // High hanging temple scaffolds & shrines bridges
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

      // Extreme Spikes gaps fields
      { x: 620, y: 720, width: 440, height: 20, type: 'spike', color: '#ff3366' },
      { x: 1220, y: 720, width: 440, height: 20, type: 'spike', color: '#ff3366' },
      { x: 1820, y: 720, width: 440, height: 20, type: 'spike', color: '#ff3366' },
      { x: 2420, y: 720, width: 340, height: 20, type: 'spike', color: '#ff3366' },
      { x: 2880, y: 720, width: 340, height: 20, type: 'spike', color: '#ff3366' }
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
      // Heavy reinforcement asura guardians
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
    platforms: [
      // Main Floor
      { x: 0, y: 790, width: 3600, height: 60, type: 'solid' },
      { x: 0, y: 0, width: 40, height: 850, type: 'solid' },
      { x: 3560, y: 0, width: 40, height: 850, type: 'solid' },

      // Massive Hub Dividers (Citadel chambers)
      { x: 700, y: 250, width: 50, height: 540, type: 'solid' },
      { x: 1400, y: 0, width: 50, height: 550, type: 'solid' },
      { x: 1400, y: 650, width: 50, height: 140, type: 'solid' },
      { x: 2100, y: 250, width: 50, height: 540, type: 'solid' },
      { x: 2800, y: 0, width: 50, height: 550, type: 'solid' },
      { x: 2800, y: 650, width: 50, height: 140, type: 'solid' },

      // Grand Citadel upper pathways and scaffold vaults
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

      // Spikes pits (Hub Defenses)
      { x: 750, y: 770, width: 650, height: 20, type: 'spike', color: '#ff3366' },
      { x: 1450, y: 770, width: 650, height: 20, type: 'spike', color: '#ff3366' },
      { x: 2150, y: 770, width: 650, height: 20, type: 'spike', color: '#ff3366' }
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
      // Added reinforcements:
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
    spawnPoint: { x: 100, y: 750 },
    platforms: [
      // Level 10 Base Floors - fragmented structures
      { x: 0, y: 840, width: 4000, height: 60, type: 'solid' },
      { x: 0, y: 0, width: 40, height: 900, type: 'solid' },
      { x: 3960, y: 0, width: 40, height: 900, type: 'solid' },

      // Giant monolith structures blocking normal movement
      { x: 500, y: 150, width: 80, height: 690, type: 'solid' },
      { x: 1150, y: 0, width: 80, height: 600, type: 'solid' },
      { x: 1800, y: 300, width: 80, height: 540, type: 'solid' },
      { x: 2450, y: 0, width: 80, height: 550, type: 'solid' },
      { x: 2450, y: 680, width: 80, height: 160, type: 'solid' },
      { x: 3100, y: 150, width: 80, height: 690, type: 'solid' },

      // High complexity floating debris blocks (chrono dust, portals)
      { x: 150, y: 700, width: 220, height: 22, type: 'one_way' },
      { x: 280, y: 550, width: 170, height: 22, type: 'one_way' },
      { x: 100, y: 380, width: 220, height: 22, type: 'one_way' },

      { x: 620, y: 700, width: 250, height: 22, type: 'one_way' },
      { x: 800, y: 550, width: 250, height: 22, type: 'one_way' },
      { x: 620, y: 400, width: 200, height: 22, type: 'one_way' },
      { x: 880, y: 250, width: 220, height: 22, type: 'one_way' },

      { x: 1300, y: 600, width: 350, height: 22, type: 'one_way' },
      { x: 1450, y: 440, width: 280, height: 22, type: 'one_way' },
      { x: 1250, y: 280, width: 320, height: 22, type: 'one_way' },

      { x: 1950, y: 680, width: 350, height: 22, type: 'one_way' },
      { x: 2100, y: 520, width: 280, height: 22, type: 'one_way' },
      { x: 1900, y: 360, width: 320, height: 22, type: 'one_way' },

      { x: 2600, y: 620, width: 350, height: 22, type: 'one_way' },
      { x: 2750, y: 460, width: 280, height: 22, type: 'one_way' },
      { x: 2550, y: 300, width: 320, height: 22, type: 'one_way' },

      { x: 3250, y: 700, width: 350, height: 22, type: 'one_way' },
      { x: 3400, y: 540, width: 280, height: 22, type: 'one_way' },
      { x: 3200, y: 380, width: 320, height: 22, type: 'one_way' },

      // Massive hazardous underfloors (chrono spikes)
      { x: 250, y: 820, width: 250, height: 22, type: 'spike', color: '#38bdf8' },
      { x: 580, y: 820, width: 1220, height: 22, type: 'spike', color: '#ff3366' },
      { x: 1880, y: 820, width: 1220, height: 22, type: 'spike', color: '#38bdf8' },
      { x: 3180, y: 820, width: 780, height: 22, type: 'spike', color: '#ff3366' }
    ],
    enemies: [
      { type: 'grunt', x: 200, y: 662, patrolRange: 60 },
      { type: 'gunner', x: 330, y: 512, patrolRange: 30 },
      { type: 'shield', x: 160, y: 342, patrolRange: 40 },
      { type: 'grunt', x: 680, y: 662, patrolRange: 60 },
      { type: 'shield', x: 800, y: 662, patrolRange: 30 },
      { type: 'shotgunner', x: 860, y: 512, patrolRange: 50 },
      { type: 'gunner', x: 980, y: 512, patrolRange: 40 },
      { type: 'sniper', x: 680, y: 362 },
      { type: 'gunner', x: 920, y: 212, patrolRange: 30 },
      { type: 'sniper', x: 1020, y: 212 },
      { type: 'grunt', x: 1380, y: 562, patrolRange: 80 },
      { type: 'shield', x: 1550, y: 562, patrolRange: 40 },
      { type: 'shotgunner', x: 1520, y: 402, patrolRange: 50 },
      { type: 'grunt', x: 1650, y: 402, patrolRange: 40 },
      { type: 'sniper', x: 1300, y: 242 },
      { type: 'shield', x: 1450, y: 242, patrolRange: 40 },
      { type: 'grunt', x: 2020, y: 642, patrolRange: 80 },
      { type: 'shield', x: 2180, y: 642, patrolRange: 50 },
      { type: 'shotgunner', x: 2250, y: 642, patrolRange: 30 },
      { type: 'gunner', x: 2180, y: 482, patrolRange: 40 },
      { type: 'sniper', x: 1950, y: 322 },
      { type: 'gunner', x: 2100, y: 322, patrolRange: 40 },
      { type: 'grunt', x: 2680, y: 582, patrolRange: 80 },
      { type: 'shield', x: 2800, y: 582, patrolRange: 40 },
      { type: 'grunt', x: 2820, y: 422, patrolRange: 50 },
      { type: 'shotgunner', x: 2900, y: 422, patrolRange: 40 },
      { type: 'shield', x: 2620, y: 262, patrolRange: 40 },
      { type: 'sniper', x: 2800, y: 262 },
      { type: 'grunt', x: 3320, y: 662, patrolRange: 80 },
      { type: 'shield', x: 3480, y: 662, patrolRange: 50 },
      { type: 'shotgunner', x: 3380, y: 662, patrolRange: 80 },
      { type: 'sniper', x: 3450, y: 502 },
      { type: 'sniper', x: 3250, y: 342 },
      { type: 'shotgunner', x: 3350, y: 342, patrolRange: 40 },
      // Bonus extreme elite guardians of the Singularity (totaling 38 enemies!)
      { type: 'shotgunner', x: 3250, y: 662, patrolRange: 80 },
      { type: 'shield', x: 3400, y: 662, patrolRange: 50 },
      { type: 'gunner', x: 620, y: 662, patrolRange: 30 },
      { type: 'shotgunner', x: 800, y: 512, patrolRange: 30 },
      { type: 'gunner', x: 880, y: 212, patrolRange: 30 },
      { type: 'shotgunner', x: 1950, y: 642, patrolRange: 30 },
      { type: 'gunner', x: 2100, y: 482, patrolRange: 30 },
      { type: 'sniper', x: 3200, y: 342 },
      { type: 'sniper', x: 1300, y: 562 },
      { type: 'grunt', x: 1450, y: 402, patrolRange: 80 },
      { type: 'grunt', x: 2600, y: 582, patrolRange: 80 },
      { type: 'grunt', x: 2750, y: 422, patrolRange: 80 },
      { type: 'shield', x: 1250, y: 242, patrolRange: 40 },
      { type: 'shield', x: 2550, y: 262, patrolRange: 40 }
    ],
    completed: false,
  }
];
