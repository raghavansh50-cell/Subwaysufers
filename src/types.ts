/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  GAMEOVER = 'GAMEOVER',
}

export enum Lane {
  LEFT = -1,
  CENTER = 0,
  RIGHT = 1,
}

export type PowerUpType = 'MAGNET' | 'JETPACK' | 'HOVERBOARD' | 'SNEAKERS';

export interface PowerUp {
  type: PowerUpType;
  duration: number; // in milliseconds
  activeUntil: number; // timestamp
}

export interface CharacterSkin {
  id: string;
  name: string;
  cost: number;
  unlocked: boolean;
  color: string; // Hex code or descriptor
  accentColor: string;
  glow: boolean;
  description: string;
}

export interface UpgradeState {
  magnetLevel: number; // 1-5
  jetpackLevel: number; // 1-5
  hoverboardLevel: number; // 1-5
  sneakersLevel: number; // 1-5
}

export interface PlayerStats {
  score: number;
  coins: number;
  highScore: number;
  totalCoins: number;
  unlockedSkins: string[];
  activeSkin: string;
  upgrades: UpgradeState;
}

// 3D Point for projection
export interface Point3D {
  x: number;
  y: number;
  z: number;
}

// Game entities in 3D track coordinate space
export interface BaseEntity {
  id: string;
  x: number; // Lane position (interpolated or discrete)
  y: number; // Vertical position (0 = ground)
  z: number; // Distance down the track
  width: number;
  height: number;
  depth: number;
  collected?: boolean;
}

export interface CoinEntity extends BaseEntity {
  rotation: number;
  pulse: number;
  isMagnetized?: boolean;
}

export enum ObstacleType {
  BARRICADE_LOW = 'BARRICADE_LOW', // Jump over
  BARRICADE_HIGH = 'BARRICADE_HIGH', // Slide under
  TRAIN_STATIONARY = 'TRAIN_STATIONARY', // Can run on top of it, or crash into front
  TRAIN_MOVING = 'TRAIN_MOVING', // Moves towards player, run on top or crash
  LIGHT_POLE = 'LIGHT_POLE', // Side obstacle
  RAMP = 'RAMP', // Allows running up onto a train!
}

export interface ObstacleEntity extends BaseEntity {
  type: ObstacleType;
  speed?: number; // for moving trains
  lane: Lane;
  hasCoinsOnTop?: boolean;
}

export interface PowerUpEntity extends BaseEntity {
  type: PowerUpType;
  rotation: number;
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  color: string;
  size: number;
  life: number; // 0 to 1
  decay: number;
}

// Game settings and constants
export const GAME_CONSTANTS = {
  TRACK_LENGTH: 1000,
  LANE_WIDTH: 3.5,
  INITIAL_SPEED: 0.18,
  SPEED_INCREMENT: 0.002, // Added per second
  MAX_SPEED: 0.45,
  GRAVITY: -0.012,
  JUMP_FORCE: 0.32,
  SNEAKERS_JUMP_FORCE: 0.42,
  SLIDE_DURATION: 700, // in milliseconds
  LANE_SWITCH_SPEED: 0.18, // speed of horizontal lane change
  COIN_SPAWN_CHANCE: 0.3,
  OBSTACLE_SPAWN_CHANCE: 0.15,
  POWERUP_SPAWN_CHANCE: 0.02,
  MIN_SPAWN_Z: 40,
  MAX_SPAWN_Z: 140,
  PLAYER_Z: 10,
  POLICE_DEFAULT_DISTANCE: 14,
  UPGRADE_COSTS: [200, 500, 1200, 2500], // cost to reach level 2, 3, 4, 5
};
