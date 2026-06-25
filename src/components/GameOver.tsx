/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Trophy, RefreshCw, LogOut, Award, Star } from 'lucide-react';
import { audio } from '../utils/audio';

interface GameOverProps {
  score: number;
  coins: number;
  highScore: number;
  isNewHighScore: boolean;
  onRestart: () => void;
  onExit: () => void;
}

export default function GameOver({
  score,
  coins,
  highScore,
  isNewHighScore,
  onRestart,
  onExit,
}: GameOverProps) {
  return (
    <div
      id="game-over"
      className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 select-none text-white z-50 animate-fade-in"
    >
      <div className="text-center max-w-sm w-full space-y-6">
        {/* Animated Icon Emblem */}
        <div className="flex justify-center relative">
          {isNewHighScore ? (
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-amber-400/20 blur-xl animate-ping" />
              <div className="w-20 h-20 bg-amber-500 rounded-2xl flex items-center justify-center border-2 border-amber-300 shadow-lg shadow-amber-500/30 rotate-12 animate-bounce">
                <Trophy className="w-10 h-10 text-slate-950" />
              </div>
              <div className="absolute -top-2 -right-2 bg-rose-500 text-[9px] font-black font-mono uppercase tracking-widest px-2 py-0.5 rounded-full shadow border border-rose-300 animate-pulse">
                RECORD!
              </div>
            </div>
          ) : (
            <div className="w-20 h-20 bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-800 shadow-lg">
              <Award className="w-10 h-10 text-slate-400" />
            </div>
          )}
        </div>

        {/* Dynamic Titles */}
        <div className="space-y-1">
          <h2 className="text-4xl font-black tracking-tighter uppercase leading-none text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-purple-500 to-rose-500">
            Caught!
          </h2>
          <p className="text-xs text-slate-400 font-mono tracking-widest">
            THE SUBWAY POLICE OFFICER CAUGHT YOU
          </p>
        </div>

        {/* Score and Gold breakdown cards */}
        <div className="space-y-2 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
          {isNewHighScore && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl py-2 px-3 mb-2 flex items-center justify-center gap-2 text-amber-300">
              <Star className="w-4 h-4 fill-amber-300" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider">
                New Personal Best!
              </span>
            </div>
          )}

          <div className="flex justify-between items-center py-2.5 border-b border-slate-800/40">
            <span className="text-xs text-slate-400 font-mono">YOUR RUN SCORE</span>
            <span className="text-xl font-black font-mono text-cyan-400">
              {score.toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between items-center py-2.5 border-b border-slate-800/40">
            <span className="text-xs text-slate-400 font-mono">GOLD COINS GRABBED</span>
            <span className="text-lg font-bold font-mono text-amber-400 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center text-[11px] text-slate-950 font-black">$</span>
              {coins}
            </span>
          </div>

          <div className="flex justify-between items-center py-2.5 text-slate-300">
            <span className="text-xs text-slate-400 font-mono">BEST HIGH SCORE</span>
            <span className="text-sm font-bold font-mono">
              {highScore.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Action Panel */}
        <div className="space-y-2.5">
          <button
            id="btn-restart-game"
            onClick={() => { audio.playCoin(); onRestart(); }}
            className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl font-bold uppercase tracking-wider text-sm text-white shadow-lg hover:brightness-110 active:scale-95 transition flex items-center justify-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Run Again</span>
          </button>

          <button
            id="btn-exit-to-menu"
            onClick={() => { audio.playCoin(); onExit(); }}
            className="w-full py-3 bg-slate-900 border border-slate-800 rounded-xl font-bold uppercase tracking-wider text-xs text-slate-300 hover:bg-slate-800 transition flex items-center justify-center space-x-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Back to Main Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
}
