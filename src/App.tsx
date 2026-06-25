/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { GameState, PlayerStats, CharacterSkin, UpgradeState } from './types';
import GameCanvas from './components/GameCanvas';
import MainMenu from './components/MainMenu';
import HUD from './components/HUD';
import GameOver from './components/GameOver';
import { audio } from './utils/audio';

const INITIAL_SKINS: CharacterSkin[] = [
  {
    id: 'skin-default',
    name: 'Subway Kid',
    cost: 0,
    unlocked: true,
    color: '#ff9800', // Orange body
    accentColor: '#00e5ff', // Neon blue visor
    glow: false,
    description: 'The standard city street runner. Jumps and slides through tracks daily.',
  },
  {
    id: 'skin-gold',
    name: 'Gold Runner',
    cost: 1000,
    unlocked: false,
    color: '#ffd700', // Gold body
    accentColor: '#ff9800', // Gold orange accents
    glow: true,
    description: 'Solid gold cyber frame. Prestigious, gleaming, and built to survive impacts.',
  },
  {
    id: 'skin-cyber',
    name: 'Cyber Ninja',
    cost: 2500,
    unlocked: false,
    color: '#120f26', // Deep purple body
    accentColor: '#d500f9', // Neon pink glow accents
    glow: true,
    description: 'Neon cloaked shadow warrior running tracks in a high-tech sector.',
  },
  {
    id: 'skin-astro',
    name: 'Astronaut',
    cost: 5000,
    unlocked: false,
    color: '#e0e0e0', // Silver suit body
    accentColor: '#ff3d00', // Warm orange visor glow
    glow: true,
    description: 'Lost voyager. Running rails down a neon tunnel using high-thruster boots.',
  },
];

const DEFAULT_STATS: PlayerStats = {
  score: 0,
  coins: 0,
  highScore: 0,
  totalCoins: 0,
  unlockedSkins: ['skin-default'],
  activeSkin: 'skin-default',
  upgrades: {
    magnetLevel: 1,
    jetpackLevel: 1,
    hoverboardLevel: 1,
    sneakersLevel: 1,
  },
};

const STORAGE_KEY = 'subway_surfers_3d_player_stats_v1';

export default function App() {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Global persistent player stats state
  const [stats, setStats] = useState<PlayerStats>(DEFAULT_STATS);
  // Track state of current active run
  const [currentScore, setCurrentScore] = useState<number>(0);
  const [currentCoins, setCurrentCoins] = useState<number>(0);
  const [isNewHighScore, setIsNewHighScore] = useState<boolean>(false);

  // Load persistent stats on component load
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Deep merge to safeguard missing properties on updates
        setStats({
          ...DEFAULT_STATS,
          ...parsed,
          upgrades: {
            ...DEFAULT_STATS.upgrades,
            ...(parsed.upgrades || {}),
          },
        });
      }
    } catch (e) {
      console.error('Failed to load local stats:', e);
    }
  }, []);

  // Save stats helper
  const saveStats = (newStats: PlayerStats) => {
    setStats(newStats);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newStats));
    } catch (e) {
      console.error('Failed to save local stats:', e);
    }
  };

  // Compile shop skins with current unlocking status
  const getSkinsList = (): CharacterSkin[] => {
    return INITIAL_SKINS.map((skin) => ({
      ...skin,
      unlocked: stats.unlockedSkins.includes(skin.id),
    }));
  };

  // Find active equipped skin specifications
  const getActiveSkinSpecs = () => {
    const active = INITIAL_SKINS.find((s) => s.id === stats.activeSkin) || INITIAL_SKINS[0];
    return {
      color: active.color,
      accent: active.accentColor,
      glow: active.glow,
    };
  };

  // Trigger: Start running down the tracks
  const handlePlayGame = () => {
    audio.playPowerUp();
    setCurrentScore(0);
    setCurrentCoins(0);
    setIsNewHighScore(false);
    setIsPaused(false);
    setGameState(GameState.PLAYING);
  };

  // Handle live scoring
  const handleScoreUpdated = (score: number) => {
    setCurrentScore(score);
  };

  // Handle coin picking
  const handleCoinCollected = (coins: number) => {
    setCurrentCoins(coins);
  };

  // Trigger: Captured by railway police
  const handleGameOver = (finalScore: number, finalCoins: number) => {
    const isNewHigh = finalScore > stats.highScore;

    const updatedStats: PlayerStats = {
      ...stats,
      coins: stats.coins + finalCoins,
      totalCoins: stats.totalCoins + finalCoins,
      highScore: isNewHigh ? finalScore : stats.highScore,
    };

    setIsNewHighScore(isNewHigh);
    saveStats(updatedStats);
    setGameState(GameState.GAMEOVER);
  };

  // Trigger: Equipping unlocked outfit
  const handleEquipSkin = (id: string) => {
    saveStats({
      ...stats,
      activeSkin: id,
    });
    audio.playCoin();
  };

  // Trigger: Unlocking skin using coins
  const handleUnlockSkin = (id: string) => {
    const skin = INITIAL_SKINS.find((s) => s.id === id);
    if (!skin) return;

    if (stats.coins >= skin.cost && !stats.unlockedSkins.includes(id)) {
      const updatedStats: PlayerStats = {
        ...stats,
        coins: stats.coins - skin.cost,
        unlockedSkins: [...stats.unlockedSkins, id],
        activeSkin: id, // auto-equip newly bought skin
      };
      saveStats(updatedStats);
      audio.playPowerUp();
    }
  };

  // Trigger: Buy powerup upgrades
  const handleBuyUpgrade = (type: 'magnet' | 'jetpack' | 'hoverboard' | 'sneakers') => {
    const currentLvl =
      type === 'magnet'
        ? stats.upgrades.magnetLevel
        : type === 'jetpack'
        ? stats.upgrades.jetpackLevel
        : type === 'hoverboard'
        ? stats.upgrades.hoverboardLevel
        : stats.upgrades.sneakersLevel;

    if (currentLvl >= 5) return; // already maxed

    const cost = [200, 500, 1200, 2500][currentLvl - 1];

    if (stats.coins >= cost) {
      const updatedUpgrades: UpgradeState = {
        ...stats.upgrades,
        magnetLevel: type === 'magnet' ? stats.upgrades.magnetLevel + 1 : stats.upgrades.magnetLevel,
        jetpackLevel: type === 'jetpack' ? stats.upgrades.jetpackLevel + 1 : stats.upgrades.jetpackLevel,
        hoverboardLevel: type === 'hoverboard' ? stats.upgrades.hoverboardLevel + 1 : stats.upgrades.hoverboardLevel,
        sneakersLevel: type === 'sneakers' ? stats.upgrades.sneakersLevel + 1 : stats.upgrades.sneakersLevel,
      };

      const updatedStats: PlayerStats = {
        ...stats,
        coins: stats.coins - cost,
        upgrades: updatedUpgrades,
      };

      saveStats(updatedStats);
      audio.playPowerUp();
    }
  };

  // Trigger: Factory reset (clear localStorage and stats)
  const handleResetStats = () => {
    if (window.confirm('Reset all your gold coins, high scores, and outfits?')) {
      saveStats(DEFAULT_STATS);
      audio.playCrash();
    }
  };

  // Trigger: Exit mid-game to menu
  const handleExitGame = () => {
    setGameState(GameState.MENU);
    setIsPaused(false);
  };

  const activeSkinSpecs = getActiveSkinSpecs();

  return (
    <div
      id="app-viewport-root"
      className="w-screen h-screen bg-black flex items-center justify-center font-sans overflow-hidden select-none"
    >
      <div
        id="game-aspect-constrainer"
        className="relative w-full h-full max-w-5xl max-h-[640px] md:rounded-3xl md:border-2 md:border-slate-900 overflow-hidden shadow-2xl bg-slate-950 flex flex-col justify-center"
      >
        {/* Core 3D Projection Canvas (always rendered in background for aesthetic dynamic movement) */}
        <GameCanvas
          gameState={gameState}
          activeSkinColor={activeSkinSpecs.color}
          activeSkinAccent={activeSkinSpecs.accent}
          activeSkinGlow={activeSkinSpecs.glow}
          upgrades={stats.upgrades}
          onCoinCollected={handleCoinCollected}
          onScoreUpdated={handleScoreUpdated}
          onGameOver={handleGameOver}
          isPaused={isPaused}
          setIsPaused={setIsPaused}
        />

        {/* Home Dashboard Screen */}
        {gameState === GameState.MENU && (
          <MainMenu
            stats={stats}
            skins={getSkinsList()}
            onPlay={handlePlayGame}
            onEquipSkin={handleEquipSkin}
            onUnlockSkin={handleUnlockSkin}
            onBuyUpgrade={handleBuyUpgrade}
            onResetStats={handleResetStats}
          />
        )}

        {/* HUD Overlay Screen */}
        {gameState === GameState.PLAYING && (
          <HUD
            score={currentScore}
            highScore={stats.highScore}
            coins={currentCoins}
            activeMagnet={currentScore > 0 && stats.upgrades.magnetLevel > 0} // visual status bindings passed
            activeJetpack={currentScore > 0 && stats.upgrades.jetpackLevel > 0}
            activeSneakers={currentScore > 0 && stats.upgrades.sneakersLevel > 0}
            activeHoverboard={currentScore > 0 && stats.upgrades.hoverboardLevel > 0}
            isPaused={isPaused}
            setIsPaused={setIsPaused}
            onExitGame={handleExitGame}
          />
        )}

        {/* Game Over Screen */}
        {gameState === GameState.GAMEOVER && (
          <GameOver
            score={currentScore}
            coins={currentCoins}
            highScore={stats.highScore}
            isNewHighScore={isNewHighScore}
            onRestart={handlePlayGame}
            onExit={handleExitGame}
          />
        )}
      </div>
    </div>
  );
}
