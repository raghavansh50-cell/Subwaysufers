/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { PlayerStats, CharacterSkin, GAME_CONSTANTS } from '../types';
import { Sparkles, ShoppingBag, TrendingUp, Trophy, Play, Music, Volume2, VolumeX, Shield, Zap, RefreshCw, Download } from 'lucide-react';
import { audio } from '../utils/audio';

interface MainMenuProps {
  stats: PlayerStats;
  skins: CharacterSkin[];
  onPlay: () => void;
  onEquipSkin: (id: string) => void;
  onUnlockSkin: (id: string) => void;
  onBuyUpgrade: (type: 'magnet' | 'jetpack' | 'hoverboard' | 'sneakers') => void;
  onResetStats: () => void;
}

export default function MainMenu({
  stats,
  skins,
  onPlay,
  onEquipSkin,
  onUnlockSkin,
  onBuyUpgrade,
  onResetStats,
}: MainMenuProps) {
  const [activeTab, setActiveTab] = useState<'play' | 'skins' | 'upgrades' | 'leaderboard'>('play');
  const [isMuted, setIsMuted] = useState(audio.isMuted());
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    audio.setMuted(nextMuted);
  };

  const getUpgradeLevel = (type: 'magnet' | 'jetpack' | 'hoverboard' | 'sneakers') => {
    if (type === 'magnet') return stats.upgrades.magnetLevel;
    if (type === 'jetpack') return stats.upgrades.jetpackLevel;
    if (type === 'hoverboard') return stats.upgrades.hoverboardLevel;
    return stats.upgrades.sneakersLevel;
  };

  const getUpgradeCost = (level: number) => {
    if (level >= 5) return null;
    return GAME_CONSTANTS.UPGRADE_COSTS[level - 1];
  };

  return (
    <div
      id="main-menu"
      className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col justify-between p-6 md:p-10 select-none text-white z-50 overflow-y-auto"
    >
      {/* Top Banner Bar */}
      <div className="flex justify-between items-center w-full max-w-4xl mx-auto">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center font-bold text-slate-950 shadow-md animate-bounce shadow-amber-500/30">
            $
          </div>
          <div>
            <div className="text-xs text-slate-400 font-mono">YOUR COIN VAULT</div>
            <div className="text-xl font-bold text-amber-400 font-mono">{stats.coins}</div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3">
          {deferredPrompt && (
            <button
              id="btn-pwa-install"
              onClick={handleInstall}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-xs font-bold font-sans hover:shadow-lg hover:shadow-cyan-500/20 active:scale-95 transition flex items-center gap-1.5"
              title="Install Subway Surfers 3D as a mobile PWA"
            >
              <Download className="w-4 h-4" /> Install App
            </button>
          )}
          <button
            id="btn-toggle-sound"
            onClick={toggleMute}
            className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-slate-800 hover:border-slate-700 transition"
            title="Toggle Sound Effects & Beat"
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-rose-500" /> : <Volume2 className="w-5 h-5 text-cyan-400" />}
          </button>
          <button
            id="btn-reset-stats"
            onClick={onResetStats}
            className="px-3 py-1.5 rounded-xl bg-slate-900/50 border border-slate-900 text-[10px] font-mono text-slate-500 hover:text-rose-400 hover:border-rose-950/40 transition flex items-center gap-1.5"
            title="Reset All Unlocked items and Scores"
          >
            <RefreshCw className="w-3 h-3" /> Reset
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-4xl mx-auto flex-grow flex flex-col justify-center my-6">
        {activeTab === 'play' && (
          <div className="text-center py-6 animate-fade-in flex flex-col items-center">
            {/* Elegant stylized game logo */}
            <div className="relative mb-6">
              <h1 className="text-5xl md:text-7xl font-sans font-black tracking-tighter uppercase select-none text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-amber-400 leading-none">
                Subway Surfers
              </h1>
              <div className="absolute -bottom-4 right-2 text-xs font-mono tracking-[0.3em] text-cyan-400 uppercase bg-slate-950 px-2 py-0.5 border border-cyan-500/20 rounded">
                3D WEB RUNNER
              </div>
            </div>

            <p className="text-sm md:text-base text-slate-300 max-w-md mx-auto mb-10 font-sans mt-3">
              Dodge speeding trains, grab gold coins, deploy jetpacks & magnet shields, and escape the chasing officer!
            </p>

            {/* Giant Play Trigger */}
            <button
              id="btn-play-game"
              onClick={onPlay}
              className="group relative flex items-center justify-center space-x-4 px-10 py-5 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 font-bold text-xl uppercase tracking-wider text-white shadow-xl shadow-cyan-500/20 hover:shadow-cyan-500/40 active:scale-95 transition-all duration-150"
            >
              <div className="absolute inset-0 w-full h-full rounded-2xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Play className="w-6 h-6 fill-white group-hover:scale-110 transition-transform" />
              <span>RUN TRACKS</span>
            </button>

            {/* Quick stats row */}
            <div className="flex items-center space-x-10 mt-12 bg-slate-900/50 border border-slate-800/60 rounded-2xl px-8 py-4">
              <div className="text-center">
                <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider flex items-center justify-center gap-1">
                  <Trophy className="w-3 h-3 text-amber-400" /> Best Score
                </div>
                <div className="text-2xl font-black font-mono text-cyan-400 mt-1">
                  {stats.highScore.toLocaleString()}
                </div>
              </div>
              <div className="h-8 w-px bg-slate-800" />
              <div className="text-center">
                <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Total Gold</div>
                <div className="text-2xl font-black font-mono text-amber-400 mt-1">
                  {stats.totalCoins.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SKINS SHOP TAB */}
        {activeTab === 'skins' && (
          <div className="animate-fade-in py-4">
            <h2 className="text-2xl font-black tracking-tight mb-2 uppercase flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-cyan-400" /> Character Outfits
            </h2>
            <p className="text-xs text-slate-400 mb-6 font-mono">Unlock metallic or glowing cyber gear using accumulated coins</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {skins.map((skin) => {
                const isEquipped = stats.activeSkin === skin.id;
                const canAfford = stats.coins >= skin.cost;

                return (
                  <div
                    key={skin.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                      isEquipped
                        ? 'bg-slate-900 border-cyan-400/80 shadow-lg shadow-cyan-950/30'
                        : skin.unlocked
                        ? 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                        : 'bg-slate-950/40 border-slate-900 opacity-80'
                    }`}
                  >
                    <div>
                      {/* Stylized visual mannequin thumbnail representation */}
                      <div className="w-full h-24 rounded-xl bg-slate-950/80 mb-3 flex items-center justify-center relative overflow-hidden">
                        <div
                          className="w-10 h-16 rounded-lg transition-all animate-pulse"
                          style={{
                            backgroundColor: skin.color,
                            boxShadow: skin.glow ? `0 0 15px ${skin.accentColor}` : 'none',
                            border: `3px solid ${skin.accentColor}`,
                          }}
                        />
                        {!skin.unlocked && (
                          <div className="absolute inset-0 bg-slate-950/70 flex items-center justify-center">
                            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest">
                              LOCKED
                            </span>
                          </div>
                        )}
                      </div>

                      <h3 className="font-bold text-sm tracking-wide">{skin.name}</h3>
                      <p className="text-[10px] text-slate-400 font-sans mt-1 leading-snug">
                        {skin.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/40">
                      {skin.unlocked ? (
                        isEquipped ? (
                          <button className="w-full py-1.5 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-300 font-bold text-xs uppercase tracking-wider cursor-default">
                            Equipped
                          </button>
                        ) : (
                          <button
                            id={`btn-equip-${skin.id}`}
                            onClick={() => onEquipSkin(skin.id)}
                            className="w-full py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-white font-bold text-xs uppercase tracking-wider transition"
                          >
                            Equip
                          </button>
                        )
                      ) : (
                        <button
                          id={`btn-unlock-${skin.id}`}
                          onClick={() => onUnlockSkin(skin.id)}
                          disabled={!canAfford}
                          className={`w-full py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider transition flex items-center justify-center space-x-1.5 ${
                            canAfford
                              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/10'
                              : 'bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed'
                          }`}
                        >
                          <span>Unlock</span>
                          <span className="font-mono text-[11px] font-black">${skin.cost}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* UPGRADES SHOP TAB */}
        {activeTab === 'upgrades' && (
          <div className="animate-fade-in py-4">
            <h2 className="text-2xl font-black tracking-tight mb-2 uppercase flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-purple-400" /> Tech Station
            </h2>
            <p className="text-xs text-slate-400 mb-6 font-mono">Upgrade active power-up durations to gather maximum tracks score</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  id: 'magnet' as const,
                  name: 'Coin Magnet',
                  desc: 'Automatically pulls gold coins from all lanes',
                  icon: <Zap className="w-5 h-5 text-rose-500" />,
                  color: 'bg-rose-500/10 border-rose-950/50 hover:border-rose-900/60',
                },
                {
                  id: 'jetpack' as const,
                  name: 'Fuel Jetpack',
                  desc: 'Fly high above the rails with massive coin fields',
                  icon: <Sparkles className="w-5 h-5 text-cyan-400" />,
                  color: 'bg-cyan-500/10 border-cyan-950/50 hover:border-cyan-900/60',
                },
                {
                  id: 'hoverboard' as const,
                  name: 'Chasing Board',
                  desc: 'Protects from train crashes, custom style deck',
                  icon: <Shield className="w-5 h-5 text-purple-500" />,
                  color: 'bg-purple-500/10 border-purple-950/50 hover:border-purple-900/60',
                },
                {
                  id: 'sneakers' as const,
                  name: 'Power Sneakers',
                  desc: 'Super sneakers for giant jumps and track flips',
                  icon: <Trophy className="w-5 h-5 text-green-400" />,
                  color: 'bg-green-500/10 border-green-950/50 hover:border-green-900/60',
                },
              ].map((up) => {
                const currentLvl = getUpgradeLevel(up.id);
                const cost = getUpgradeCost(currentLvl);
                const isMax = currentLvl >= 5;
                const canAfford = cost !== null && stats.coins >= cost;

                return (
                  <div
                    key={up.id}
                    className={`p-5 rounded-2xl border flex flex-col justify-between ${up.color} transition-all`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                        {up.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <h3 className="font-bold text-base">{up.name}</h3>
                          <span className="text-xs font-mono font-black text-slate-400 uppercase">
                            Level {currentLvl}/5
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 font-sans mt-1">
                          {up.desc}
                        </p>

                        {/* Progress Pips */}
                        <div className="flex space-x-1.5 mt-3">
                          {[1, 2, 3, 4, 5].map((lvl) => (
                            <div
                              key={lvl}
                              className={`h-2 flex-1 rounded-full border border-slate-950 ${
                                lvl <= currentLvl
                                  ? 'bg-gradient-to-r from-cyan-400 to-purple-500'
                                  : 'bg-slate-900'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-800/30 flex justify-end">
                      {isMax ? (
                        <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider border border-cyan-950 px-3 py-1.5 rounded-xl bg-cyan-950/25">
                          MAX LEVEL
                        </span>
                      ) : (
                        <button
                          id={`btn-upgrade-${up.id}`}
                          onClick={() => onBuyUpgrade(up.id)}
                          disabled={!canAfford}
                          className={`px-4 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider transition flex items-center space-x-2 ${
                            canAfford
                              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/10'
                              : 'bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed'
                          }`}
                        >
                          <span>Upgrade</span>
                          <span className="font-mono text-[11px] font-black">${cost}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* LEADERBOARD HIGH SCORES TAB */}
        {activeTab === 'leaderboard' && (
          <div className="animate-fade-in py-4 max-w-xl mx-auto w-full">
            <h2 className="text-2xl font-black tracking-tight mb-2 uppercase flex items-center gap-2">
              <Trophy className="w-6 h-6 text-amber-400" /> Track Legends
            </h2>
            <p className="text-xs text-slate-400 mb-6 font-mono">Historic highest running scores on your device</p>

            {/* List */}
            <div className="space-y-2 bg-slate-900/50 border border-slate-800 p-4 rounded-2xl">
              <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono border-b border-slate-800 pb-2">
                <span>RUNNER NAME / DATE</span>
                <span>SCORE</span>
              </div>

              {/* Just dummy high scores or dynamic ones */}
              <div className="flex justify-between items-center py-2.5 font-mono border-b border-slate-800/40">
                <span className="text-sm font-bold flex items-center gap-2 text-cyan-300">
                  <span className="text-xs px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">1ST</span> YOU (Personal Best)
                </span>
                <span className="text-base font-black text-amber-400">{stats.highScore.toLocaleString()}</span>
              </div>

              <div className="flex justify-between items-center py-2.5 font-mono border-b border-slate-800/40 text-slate-300">
                <span className="text-sm flex items-center gap-2">
                  <span className="text-xs px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">2ND</span> KingOfSubway
                </span>
                <span className="text-sm font-bold">45,200</span>
              </div>

              <div className="flex justify-between items-center py-2.5 font-mono text-slate-400">
                <span className="text-sm flex items-center gap-2">
                  <span className="text-xs px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">3RD</span> RailSurfer
                </span>
                <span className="text-sm font-bold">28,500</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Persistent Navigation Tabs */}
      <div className="w-full max-w-xl mx-auto flex space-x-1.5 bg-slate-900 border border-slate-800 p-1.5 rounded-2xl mt-auto">
        <button
          id="tab-play"
          onClick={() => { setActiveTab('play'); audio.playCoin(); }}
          className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition flex flex-col items-center gap-1 ${
            activeTab === 'play'
              ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Play className="w-4 h-4" /> Play
        </button>
        <button
          id="tab-skins"
          onClick={() => { setActiveTab('skins'); audio.playCoin(); }}
          className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition flex flex-col items-center gap-1 ${
            activeTab === 'skins'
              ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <ShoppingBag className="w-4 h-4" /> Outfits
        </button>
        <button
          id="tab-upgrades"
          onClick={() => { setActiveTab('upgrades'); audio.playCoin(); }}
          className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition flex flex-col items-center gap-1 ${
            activeTab === 'upgrades'
              ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <TrendingUp className="w-4 h-4" /> Tech
        </button>
        <button
          id="tab-leaderboard"
          onClick={() => { setActiveTab('leaderboard'); audio.playCoin(); }}
          className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition flex flex-col items-center gap-1 ${
            activeTab === 'leaderboard'
              ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Trophy className="w-4 h-4" /> Records
        </button>
      </div>
    </div>
  );
}
