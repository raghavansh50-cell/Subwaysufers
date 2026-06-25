/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { PowerUpType } from '../types';
import { Pause, Play, LogOut, Volume2, VolumeX, Magnet, Zap, Shield, HelpCircle } from 'lucide-react';
import { audio } from '../utils/audio';

interface HUDProps {
  score: number;
  highScore: number;
  coins: number;
  activeMagnet: boolean;
  activeJetpack: boolean;
  activeSneakers: boolean;
  activeHoverboard: boolean;
  isPaused: boolean;
  setIsPaused: (paused: boolean) => void;
  onExitGame: () => void;
}

export default function HUD({
  score,
  highScore,
  coins,
  activeMagnet,
  activeJetpack,
  activeSneakers,
  activeHoverboard,
  isPaused,
  setIsPaused,
  onExitGame,
}: HUDProps) {
  const [isMuted, setIsMuted] = useState(audio.isMuted());
  const [showControlsHelp, setShowControlsHelp] = useState(false);

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    audio.setMuted(nextMuted);
  };

  return (
    <div id="hud-root" className="absolute inset-0 pointer-events-none z-40 select-none text-white">
      {/* Top HUD Row */}
      <div className="absolute inset-x-0 top-4 px-6 flex justify-between items-start pointer-events-auto">
        {/* Left Stats: Score, High Score */}
        <div className="space-y-1.5">
          <div className="bg-slate-950/70 border border-slate-900 backdrop-blur-md rounded-2xl px-5 py-3 shadow-lg flex flex-col">
            <span className="text-[9px] text-slate-400 font-mono tracking-widest uppercase">SCORE</span>
            <span className="text-2xl font-black font-mono tracking-tight text-cyan-400">
              {score.toLocaleString()}
            </span>
            <span className="text-[9px] text-slate-500 font-mono tracking-wider mt-1">
              BEST: {highScore.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Center: Active Power-Ups Indicators list */}
        <div className="flex-grow max-w-xs mx-4 flex flex-col space-y-1.5 justify-center">
          {activeMagnet && (
            <div className="bg-rose-950/80 border border-rose-900/60 backdrop-blur-md rounded-xl px-3 py-1.5 flex items-center gap-2 text-rose-300 animate-pulse shadow-md shadow-rose-950/20">
              <Magnet className="w-4 h-4" />
              <div className="flex-1">
                <div className="text-[9px] font-mono uppercase font-black tracking-wider leading-none">COIN MAGNET</div>
              </div>
            </div>
          )}

          {activeJetpack && (
            <div className="bg-cyan-950/80 border border-cyan-900/60 backdrop-blur-md rounded-xl px-3 py-1.5 flex items-center gap-2 text-cyan-300 animate-pulse shadow-md shadow-cyan-950/20">
              <Zap className="w-4 h-4" />
              <div className="flex-1">
                <div className="text-[9px] font-mono uppercase font-black tracking-wider leading-none">SKY JETPACK</div>
              </div>
            </div>
          )}

          {activeSneakers && (
            <div className="bg-green-950/80 border border-green-900/60 backdrop-blur-md rounded-xl px-3 py-1.5 flex items-center gap-2 text-green-300 animate-pulse shadow-md shadow-green-950/20">
              <Zap className="w-4 h-4" />
              <div className="flex-1">
                <div className="text-[9px] font-mono uppercase font-black tracking-wider leading-none">SUPER SNEAKERS</div>
              </div>
            </div>
          )}

          {activeHoverboard && (
            <div className="bg-purple-950/80 border border-purple-900/60 backdrop-blur-md rounded-xl px-3 py-1.5 flex items-center gap-2 text-purple-300 animate-pulse shadow-md shadow-purple-950/20">
              <Shield className="w-4 h-4" />
              <div className="flex-1">
                <div className="text-[9px] font-mono uppercase font-black tracking-wider leading-none">BOARD ACCEL</div>
              </div>
            </div>
          )}
        </div>

        {/* Right Stats: Coins Collected, Pause, Help */}
        <div className="flex items-center space-x-2.5">
          {/* Gold Coin Count */}
          <div className="bg-slate-950/70 border border-slate-900 backdrop-blur-md rounded-2xl px-4 py-3 shadow-lg flex items-center space-x-3">
            <div className="w-7 h-7 bg-amber-400 rounded-full flex items-center justify-center font-bold text-slate-950 shadow-md shadow-amber-400/20">
              $
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] text-slate-400 font-mono tracking-widest uppercase">COINS</span>
              <span className="text-xl font-bold font-mono tracking-tight text-amber-400 leading-none mt-0.5">
                {coins}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col space-y-2">
            <button
              id="btn-hud-pause"
              onClick={() => { audio.playCoin(); setIsPaused(true); }}
              className="w-10 h-10 rounded-xl bg-slate-950/70 border border-slate-900 flex items-center justify-center hover:bg-slate-800 transition shadow-lg backdrop-blur-md pointer-events-auto"
              title="Pause Game"
            >
              <Pause className="w-4 h-4" />
            </button>
            <button
              id="btn-hud-help"
              onClick={() => setShowControlsHelp(!showControlsHelp)}
              className="w-10 h-10 rounded-xl bg-slate-950/70 border border-slate-900 flex items-center justify-center hover:bg-slate-800 transition shadow-lg backdrop-blur-md pointer-events-auto"
              title="Toggle Controls Guide"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Controls Overlay Help Panel */}
      {showControlsHelp && (
        <div className="absolute top-16 right-6 w-64 bg-slate-950/90 border border-slate-800 backdrop-blur-md rounded-2xl p-4 shadow-xl z-50 animate-fade-in pointer-events-auto">
          <h4 className="font-bold text-xs uppercase text-cyan-400 font-mono tracking-wider border-b border-slate-800 pb-2 mb-2">
            Movement Controls
          </h4>
          <div className="space-y-1.5 text-xs text-slate-300 font-mono">
            <div className="flex justify-between">
              <span>Shift Lane Left</span>
              <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-[10px] text-cyan-300 border border-slate-700">A / ←</kbd>
            </div>
            <div className="flex justify-between">
              <span>Shift Lane Right</span>
              <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-[10px] text-cyan-300 border border-slate-700">D / →</kbd>
            </div>
            <div className="flex justify-between">
              <span>Jump Track</span>
              <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-[10px] text-cyan-300 border border-slate-700">W / ↑ / Space</kbd>
            </div>
            <div className="flex justify-between">
              <span>Slide Under</span>
              <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-[10px] text-cyan-300 border border-slate-700">S / ↓</kbd>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 font-sans mt-3 border-t border-slate-800/40 pt-2 leading-tight">
            Tip: You can also use swipe gestures directly on the game screen!
          </p>
        </div>
      )}

      {/* PAUSE MODAL OVERLAY */}
      {isPaused && (
        <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center pointer-events-auto z-50 animate-fade-in">
          <div className="text-center max-w-xs w-full space-y-6">
            <div className="space-y-1">
              <h2 className="text-4xl font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                Paused
              </h2>
              <p className="text-xs text-slate-400 font-mono">TRACK POSITION SUSPENDED</p>
            </div>

            {/* Quick stats brief inside Pause */}
            <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-4 flex justify-around">
              <div className="text-center">
                <div className="text-[9px] text-slate-400 font-mono">SCORE</div>
                <div className="text-lg font-black font-mono text-cyan-300 mt-0.5">{score.toLocaleString()}</div>
              </div>
              <div className="w-px h-6 bg-slate-800" />
              <div className="text-center">
                <div className="text-[9px] text-slate-400 font-mono">GOLD</div>
                <div className="text-lg font-black font-mono text-amber-400 mt-0.5">{coins}</div>
              </div>
            </div>

            {/* Action Panel Buttons */}
            <div className="space-y-2.5">
              <button
                id="btn-hud-resume"
                onClick={() => { audio.playCoin(); setIsPaused(false); }}
                className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl font-bold uppercase tracking-wider text-sm text-white shadow-lg hover:brightness-110 active:scale-95 transition"
              >
                <div className="flex items-center justify-center space-x-2">
                  <Play className="w-4 h-4 fill-white" />
                  <span>Resume Run</span>
                </div>
              </button>

              <button
                id="btn-hud-mute"
                onClick={toggleMute}
                className="w-full py-3 bg-slate-900 border border-slate-800/80 rounded-xl font-bold uppercase tracking-wider text-xs text-slate-300 hover:bg-slate-800 transition flex items-center justify-center space-x-2"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
                <span>{isMuted ? 'Unmute Sound' : 'Mute Sound'}</span>
              </button>

              <button
                id="btn-hud-exit"
                onClick={() => { audio.playCoin(); onExitGame(); }}
                className="w-full py-3 bg-slate-950 border border-slate-900/60 rounded-xl font-bold uppercase tracking-wider text-xs text-slate-400 hover:text-rose-400 hover:border-rose-950/40 transition flex items-center justify-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Exit to Menu</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
