/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  GameState,
  Lane,
  PowerUpType,
  CoinEntity,
  ObstacleEntity,
  PowerUpEntity,
  Particle,
  GAME_CONSTANTS,
  ObstacleType,
  UpgradeState,
} from '../types';
import { audio } from '../utils/audio';

// --- Procedural Canvas Texture Generators for Futuristic Visual Polish ---

function createCoinTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Rich gradient for gold sheen
    const grad = ctx.createRadialGradient(64, 64, 10, 64, 64, 64);
    grad.addColorStop(0, '#fff59d');
    grad.addColorStop(0.2, '#fdd835');
    grad.addColorStop(0.6, '#f57f17');
    grad.addColorStop(1, '#d84315');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);

    // Embossed concentric border rings
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(64, 64, 46, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#e65100';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(64, 64, 38, 0, Math.PI * 2);
    ctx.stroke();

    // Center futuristic coin symbol 'C'
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 54px "Courier New", Courier, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 6;
    ctx.fillText('C', 64, 64);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createTrainTexture(colorHex: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Solid base color
    ctx.fillStyle = colorHex;
    ctx.fillRect(0, 0, 256, 256);

    // Subtly darker panels
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.lineWidth = 5;
    ctx.strokeRect(4, 4, 248, 248);

    // Grid panels
    ctx.beginPath();
    ctx.moveTo(128, 0); ctx.lineTo(128, 256);
    ctx.moveTo(0, 128); ctx.lineTo(256, 128);
    ctx.stroke();

    // High-visibility hazard/warning yellow/black diagonal lines
    ctx.fillStyle = 'rgba(255, 235, 59, 0.4)';
    for (let i = -6; i < 12; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 45, 0);
      ctx.lineTo(i * 45 + 20, 0);
      ctx.lineTo(i * 45 - 20, 256);
      ctx.lineTo(i * 45 - 40, 256);
      ctx.closePath();
      ctx.fill();
    }

    // Vent grids / grills on panel sections
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    for (let y = 30; y < 220; y += 45) {
      if (y > 100 && y < 150) continue;
      ctx.fillRect(20, y, 80, 8);
      ctx.fillRect(156, y, 80, 8);
    }

    // Rivet dots
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    const nodes = [16, 64, 112, 144, 192, 240];
    nodes.forEach(x => {
      nodes.forEach(y => {
        ctx.beginPath();
        ctx.arc(x, y, 3.5, 0, Math.PI * 2);
        ctx.fill();
      });
    });
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createPowerupTexture(type: string, colorHex: string, glowHex: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Carbon fiber style base
    ctx.fillStyle = '#0f111a';
    ctx.fillRect(0, 0, 128, 128);

    // Glowing border lines
    ctx.strokeStyle = glowHex;
    ctx.lineWidth = 7;
    ctx.strokeRect(6, 6, 116, 116);

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(12, 12, 104, 104);

    // Crosshairs
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.beginPath();
    ctx.moveTo(64, 0); ctx.lineTo(64, 128);
    ctx.moveTo(0, 64); ctx.lineTo(128, 64);
    ctx.stroke();

    // Central emoji representation with soft glow shadow
    ctx.font = '56px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = glowHex;
    ctx.shadowBlur = 12;

    let emoji = '⚡';
    if (type === 'MAGNET') emoji = '🧲';
    if (type === 'JETPACK') emoji = '🚀';
    if (type === 'SNEAKERS') emoji = '👟';
    if (type === 'HOVERBOARD') emoji = '🛹';

    ctx.fillText(emoji, 64, 64);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createBuildingTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Tower body dark backdrop
    ctx.fillStyle = '#060814';
    ctx.fillRect(0, 0, 128, 256);

    // Procedural glowing windows
    for (let y = 8; y < 248; y += 14) {
      for (let x = 8; x < 120; x += 16) {
        if (Math.random() < 0.42) {
          // Multi-colored cyber city lights
          const colors = ['#00e5ff', '#ff007f', '#ffea00', '#9d4edd'];
          ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
          ctx.shadowColor = ctx.fillStyle;
          ctx.shadowBlur = 4;
          ctx.fillRect(x, y, 8, 8);
          ctx.shadowBlur = 0;
        } else {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
          ctx.fillRect(x, y, 8, 8);
        }
      }
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

interface GameCanvasProps {
  gameState: GameState;
  activeSkinColor: string;
  activeSkinAccent: string;
  activeSkinGlow: boolean;
  upgrades: UpgradeState;
  onCoinCollected: (count: number) => void;
  onScoreUpdated: (score: number) => void;
  onGameOver: (finalScore: number, finalCoins: number) => void;
  isPaused: boolean;
  setIsPaused: (paused: boolean) => void;
}

export default function GameCanvas({
  gameState,
  activeSkinColor,
  activeSkinAccent,
  activeSkinGlow,
  upgrades,
  onCoinCollected,
  onScoreUpdated,
  onGameOver,
  isPaused,
  setIsPaused,
}: GameCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // ThreeJS Refs
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const playerGroupRef = useRef<THREE.Group | null>(null);
  const policeGroupRef = useRef<THREE.Group | null>(null);
  const sleepersRef = useRef<THREE.Mesh[]>([]);
  const buildingsRef = useRef<THREE.Mesh[]>([]);
  const meshesRef = useRef<{ [id: string]: THREE.Object3D }>({});
  const starsRef = useRef<THREE.Group | null>(null);
  const texturesRef = useRef<{
    coin?: THREE.CanvasTexture;
    trainRed?: THREE.CanvasTexture;
    trainBlue?: THREE.CanvasTexture;
    magnet?: THREE.CanvasTexture;
    jetpack?: THREE.CanvasTexture;
    sneakers?: THREE.CanvasTexture;
    hoverboard?: THREE.CanvasTexture;
    building?: THREE.CanvasTexture;
  }>({});

  // Player and cop limb refs for quick access
  const playerLimbsRef = useRef<{
    leftLeg?: THREE.Mesh;
    rightLeg?: THREE.Mesh;
    leftArm?: THREE.Mesh;
    rightArm?: THREE.Mesh;
    hoverboard?: THREE.Mesh;
    jetpack?: THREE.Group;
    torso?: THREE.Mesh;
  }>({});

  const policeLimbsRef = useRef<{
    leftLeg?: THREE.Mesh;
    rightLeg?: THREE.Mesh;
    sirenRed?: THREE.Mesh;
    sirenBlue?: THREE.Mesh;
  }>({});

  // Core Game Loop Physics State
  const stateRef = useRef({
    player: {
      lane: Lane.CENTER,
      targetLane: Lane.CENTER,
      laneOffset: 0,
      y: 0,
      vy: 0,
      isGrounded: true,
      isSliding: false,
      slideTimeRemaining: 0,
      invincibilityTime: 0,
      stumbleMultiplier: 1.0,
    },
    police: {
      z: GAME_CONSTANTS.PLAYER_Z - GAME_CONSTANTS.POLICE_DEFAULT_DISTANCE,
      targetZ: GAME_CONSTANTS.PLAYER_Z - GAME_CONSTANTS.POLICE_DEFAULT_DISTANCE,
      stumbleCooldown: 0,
    },
    camera: {
      x: 0,
      y: 5.5,
      z: 0,
      fov: 60,
      shake: 0,
    },
    stats: {
      score: 0,
      coins: 0,
      distance: 0,
      speed: GAME_CONSTANTS.INITIAL_SPEED,
    },
    coins: [] as CoinEntity[],
    obstacles: [] as ObstacleEntity[],
    powerUps: [] as PowerUpEntity[],
    particles: [] as Particle[],
    activePowerUps: {} as Record<PowerUpType, number>,
    lastTime: 0,
    elapsedTime: 0,
    spawnZ: GAME_CONSTANTS.MIN_SPAWN_Z,
    animationFrameId: 0,
  });

  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // Handle Resizing
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({
          width: Math.max(320, width),
          height: Math.max(240, height),
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Update threejs dimensions
  useEffect(() => {
    const renderer = rendererRef.current;
    const camera = cameraRef.current;
    if (!renderer || !camera) return;
    renderer.setSize(dimensions.width, dimensions.height);
    camera.aspect = dimensions.width / dimensions.height;
    camera.updateProjectionMatrix();
  }, [dimensions]);

  // Skin updates in real-time
  useEffect(() => {
    if (playerLimbsRef.current.torso && sceneRef.current) {
      const torso = playerLimbsRef.current.torso;
      if (torso.material instanceof THREE.MeshStandardMaterial) {
        torso.material.color.set(activeSkinColor);
      }
      if (playerGroupRef.current) {
        playerGroupRef.current.traverse((child) => {
          if (child instanceof THREE.Mesh && child.name === 'visor') {
            if (child.material instanceof THREE.MeshBasicMaterial) {
              child.material.color.set(activeSkinAccent);
            }
          }
        });
      }
    }
  }, [activeSkinColor, activeSkinAccent, activeSkinGlow]);

  // Handle Game States and loops
  useEffect(() => {
    if (gameState === GameState.PLAYING && !isPaused) {
      initGame();
      stateRef.current.lastTime = performance.now();
      audio.startMusic();
      const loop = (time: number) => {
        updatePhysics(time);
        updateThreeScene();
        stateRef.current.animationFrameId = requestAnimationFrame(loop);
      };
      stateRef.current.animationFrameId = requestAnimationFrame(loop);
    } else {
      audio.stopMusic();
      cancelAnimationFrame(stateRef.current.animationFrameId);
    }
    return () => cancelAnimationFrame(stateRef.current.animationFrameId);
  }, [gameState, isPaused]);

  // Create WebGL / Scene elements once on load
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setSize(dimensions.width, dimensions.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    // Initialize all procedural canvas textures and cache them
    texturesRef.current.coin = createCoinTexture();
    texturesRef.current.trainRed = createTrainTexture('#e53935'); // Vibrant red panel texture
    texturesRef.current.trainBlue = createTrainTexture('#1e88e5'); // Cool blue panel texture
    texturesRef.current.magnet = createPowerupTexture('MAGNET', '#ff1744', '#ff8a80');
    texturesRef.current.jetpack = createPowerupTexture('JETPACK', '#00e5ff', '#80deea');
    texturesRef.current.sneakers = createPowerupTexture('SNEAKERS', '#00e676', '#a7ffeb');
    texturesRef.current.hoverboard = createPowerupTexture('HOVERBOARD', '#d500f9', '#f3e5f5');
    texturesRef.current.building = createBuildingTexture();

    // Scene with brighter atmospheric cyber fog
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0d0f22');
    scene.fog = new THREE.FogExp2('#0d0f22', 0.0045); // Reduced density for much better visibility
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(55, dimensions.width / dimensions.height, 0.1, 1000);
    cameraRef.current = camera;

    // Lighting
    const ambientLight = new THREE.AmbientLight('#ffffff', 1.0); // Rich white ambient light so items aren't dark
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight('#7b5db5', '#1a1438', 1.6); // Warm sky and ground light mix
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight('#ffd4a3', 3.0); // Brighter sun-like light source
    dirLight.position.set(10, 20, 15);
    scene.add(dirLight);

    const frontLight = new THREE.DirectionalLight('#00e5ff', 1.5); // Soft cyan cyberpunk fill light from side
    frontLight.position.set(-8, 6, -20);
    scene.add(frontLight);

    // Track Rails setup (Continuous infinite appearance)
    [-1, 0, 1].forEach((laneIndex) => {
      const laneX = laneIndex * GAME_CONSTANTS.LANE_WIDTH;
      const railGeo = new THREE.BoxGeometry(0.12, 0.08, 400);
      const railMat = new THREE.MeshStandardMaterial({ color: '#8a8d94', metalness: 0.8, roughness: 0.2 });

      const leftRail = new THREE.Mesh(railGeo, railMat);
      leftRail.position.set(laneX - 0.9, 0.04, -150);
      scene.add(leftRail);

      const rightRail = new THREE.Mesh(railGeo, railMat);
      rightRail.position.set(laneX + 0.9, 0.04, -150);
      scene.add(rightRail);
    });

    // Guard Rails (Neon side bounds with high-contrast glowing materials)
    const guardGeo = new THREE.BoxGeometry(0.18, 0.25, 400);
    const cyanGuard = new THREE.Mesh(guardGeo, new THREE.MeshStandardMaterial({
      color: '#00e5ff',
      emissive: '#00e5ff',
      emissiveIntensity: 1.5,
      roughness: 0.1,
      metalness: 0.2,
    }));
    cyanGuard.position.set(-1.7 * GAME_CONSTANTS.LANE_WIDTH, 0.1, -150);
    scene.add(cyanGuard);

    const orangeGuard = new THREE.Mesh(guardGeo, new THREE.MeshStandardMaterial({
      color: '#ff6a00',
      emissive: '#ff6a00',
      emissiveIntensity: 1.5,
      roughness: 0.1,
      metalness: 0.2,
    }));
    orangeGuard.position.set(1.7 * GAME_CONSTANTS.LANE_WIDTH, 0.1, -150);
    scene.add(orangeGuard);

    // Tiled Wood Sleepers (Scrolling array)
    const sleepers: THREE.Mesh[] = [];
    const sleeperGeo = new THREE.BoxGeometry(2.4, 0.1, 0.35);
    const sleeperMat = new THREE.MeshStandardMaterial({ color: '#4a332a', roughness: 0.85 });
    for (let i = 0; i < 50; i++) {
      const sleeper = new THREE.Mesh(sleeperGeo, sleeperMat);
      sleeper.position.set(0, 0, -i * 6.0);
      scene.add(sleeper);
      sleepers.push(sleeper);
    }
    sleepersRef.current = sleepers;

    // 3D Skyscrapers/Buildings for futuristic city look
    const buildings: THREE.Mesh[] = [];
    const buildingMat = new THREE.MeshStandardMaterial({
      map: texturesRef.current.building,
      emissive: '#ffffff',
      emissiveMap: texturesRef.current.building,
      emissiveIntensity: 1.0,
      roughness: 0.1,
      metalness: 0.9,
    });

    for (let i = 0; i < 12; i++) {
      const zPos = -i * 35.0;

      // Left building
      const hL = 20 + Math.random() * 30;
      const wL = 7 + Math.random() * 6;
      const dL = 7 + Math.random() * 6;
      const geoL = new THREE.BoxGeometry(wL, hL, dL);
      const bL = new THREE.Mesh(geoL, buildingMat);
      bL.position.set(-20 - Math.random() * 8, hL / 2 - 2, zPos);
      scene.add(bL);
      buildings.push(bL);

      // Right building
      const hR = 20 + Math.random() * 30;
      const wR = 7 + Math.random() * 6;
      const dR = 7 + Math.random() * 6;
      const geoR = new THREE.BoxGeometry(wR, hR, dR);
      const bR = new THREE.Mesh(geoR, buildingMat);
      bR.position.set(20 + Math.random() * 8, hR / 2 - 2, zPos);
      scene.add(bR);
      buildings.push(bR);
    }
    buildingsRef.current = buildings;

    // Starry background Group
    const starsGroup = new THREE.Group();
    const starGeo = new THREE.SphereGeometry(0.15, 4, 4);
    const starMat = new THREE.MeshBasicMaterial({ color: '#ffffff' });
    for (let i = 0; i < 80; i++) {
      const star = new THREE.Mesh(starGeo, starMat);
      const theta = Math.random() * Math.PI;
      const radius = 60 + Math.random() * 80;
      star.position.set(Math.cos(theta) * radius, 10 + Math.random() * 35, -250 + (Math.random() * 40 - 20));
      starsGroup.add(star);
    }
    scene.add(starsGroup);
    starsRef.current = starsGroup;

    // Create Player 3D Hierarchy
    const playerGroup = new THREE.Group();
    scene.add(playerGroup);
    playerGroupRef.current = playerGroup;

    const bodyMat = new THREE.MeshStandardMaterial({ color: '#ff9800', roughness: 0.3, metalness: 0.2 });
    const limbMat = new THREE.MeshStandardMaterial({ color: '#1a1d24', roughness: 0.5 });
    const skinMat = new THREE.MeshStandardMaterial({ color: '#ffcc99', roughness: 0.5 });
    const visorMat = new THREE.MeshBasicMaterial({ color: '#00e5ff' });

    const torsoGeo = new THREE.BoxGeometry(0.5, 0.8, 0.3);
    const torso = new THREE.Mesh(torsoGeo, bodyMat);
    torso.position.y = 0.8;
    playerGroup.add(torso);
    playerLimbsRef.current.torso = torso;

    const headGeo = new THREE.BoxGeometry(0.35, 0.35, 0.35);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.position.y = 1.45;
    playerGroup.add(head);

    const visorGeo = new THREE.BoxGeometry(0.37, 0.1, 0.08);
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.name = 'visor';
    visor.position.set(0, 1.48, -0.16);
    playerGroup.add(visor);

    const legGeo = new THREE.BoxGeometry(0.15, 0.55, 0.15);
    const leftLeg = new THREE.Mesh(legGeo, limbMat);
    leftLeg.position.set(-0.16, 0.275, 0);
    playerGroup.add(leftLeg);
    playerLimbsRef.current.leftLeg = leftLeg;

    const rightLeg = new THREE.Mesh(legGeo, limbMat);
    rightLeg.position.set(0.16, 0.275, 0);
    playerGroup.add(rightLeg);
    playerLimbsRef.current.rightLeg = rightLeg;

    const armGeo = new THREE.BoxGeometry(0.12, 0.55, 0.12);
    const leftArm = new THREE.Mesh(armGeo, limbMat);
    leftArm.position.set(-0.32, 0.8, 0);
    playerGroup.add(leftArm);
    playerLimbsRef.current.leftArm = leftArm;

    const rightArm = new THREE.Mesh(armGeo, limbMat);
    rightArm.position.set(0.32, 0.8, 0);
    playerGroup.add(rightArm);
    playerLimbsRef.current.rightArm = rightArm;

    const hoverboardGeo = new THREE.BoxGeometry(0.8, 0.05, 1.6);
    const hoverboardMat = new THREE.MeshStandardMaterial({ color: '#9c27b0', roughness: 0.1, metalness: 0.8 });
    const hoverboard = new THREE.Mesh(hoverboardGeo, hoverboardMat);
    hoverboard.position.set(0, -0.05, 0);
    hoverboard.visible = false;
    playerGroup.add(hoverboard);
    playerLimbsRef.current.hoverboard = hoverboard;

    const jetpackGroup = new THREE.Group();
    jetpackGroup.position.set(0, 0.8, 0.18);
    const jetpackCyl = new THREE.CylinderGeometry(0.12, 0.12, 0.5, 8);
    const jetpackMat = new THREE.MeshStandardMaterial({ color: '#00bcd4', roughness: 0.2, metalness: 0.8 });
    const jetL = new THREE.Mesh(jetpackCyl, jetpackMat);
    jetL.position.x = -0.12;
    const jetR = jetL.clone();
    jetR.position.x = 0.12;
    jetpackGroup.add(jetL);
    jetpackGroup.add(jetR);
    jetpackGroup.visible = false;
    playerGroup.add(jetpackGroup);
    playerLimbsRef.current.jetpack = jetpackGroup;

    // Create Police 3D Model
    const policeGroup = new THREE.Group();
    scene.add(policeGroup);
    policeGroupRef.current = policeGroup;

    const copTorsoGeo = new THREE.BoxGeometry(0.65, 0.85, 0.45);
    const copTorso = new THREE.Mesh(copTorsoGeo, new THREE.MeshStandardMaterial({ color: '#1a237e', roughness: 0.4 }));
    copTorso.position.y = 0.825;
    policeGroup.add(copTorso);

    const copHead = new THREE.Mesh(headGeo, skinMat);
    copHead.position.y = 1.45;
    policeGroup.add(copHead);

    const capGeo = new THREE.BoxGeometry(0.42, 0.1, 0.42);
    const cap = new THREE.Mesh(capGeo, new THREE.MeshStandardMaterial({ color: '#0d123a', roughness: 0.4 }));
    cap.position.set(0, 1.63, -0.05);
    policeGroup.add(cap);

    const sirenGeo = new THREE.SphereGeometry(0.06, 6, 6);
    const sirenRed = new THREE.Mesh(sirenGeo, new THREE.MeshBasicMaterial({ color: '#ff1744' }));
    sirenRed.position.set(-0.1, 1.7, -0.05);
    policeGroup.add(sirenRed);
    policeLimbsRef.current.sirenRed = sirenRed;

    const sirenBlue = new THREE.Mesh(sirenGeo, new THREE.MeshBasicMaterial({ color: '#00e5ff' }));
    sirenBlue.position.set(0.1, 1.7, -0.05);
    policeGroup.add(sirenBlue);
    policeLimbsRef.current.sirenBlue = sirenBlue;

    const copLeftLeg = new THREE.Mesh(legGeo, limbMat);
    copLeftLeg.position.set(-0.18, 0.275, 0);
    policeGroup.add(copLeftLeg);
    policeLimbsRef.current.leftLeg = copLeftLeg;

    const copRightLeg = new THREE.Mesh(legGeo, limbMat);
    copRightLeg.position.set(0.18, 0.275, 0);
    policeGroup.add(copRightLeg);
    policeLimbsRef.current.rightLeg = copRightLeg;

    return () => {
      // Complete teardown to prevent WebGL memory leaks
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          if (object.geometry) object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach((m) => m.dispose());
          } else if (object.material) {
            object.material.dispose();
          }
        }
      });
      // Dispose cached textures
      Object.values(texturesRef.current).forEach((tex) => {
        if (tex instanceof THREE.Texture) tex.dispose();
      });
      renderer.dispose();
    };
  }, []);

  // Initialize Physics state
  const initGame = () => {
    const state = stateRef.current;
    state.player = {
      lane: Lane.CENTER,
      targetLane: Lane.CENTER,
      laneOffset: 0,
      y: 0,
      vy: 0,
      isGrounded: true,
      isSliding: false,
      slideTimeRemaining: 0,
      invincibilityTime: 0,
      stumbleMultiplier: 1.0,
    };
    state.police = {
      z: GAME_CONSTANTS.PLAYER_Z - GAME_CONSTANTS.POLICE_DEFAULT_DISTANCE,
      targetZ: GAME_CONSTANTS.PLAYER_Z - GAME_CONSTANTS.POLICE_DEFAULT_DISTANCE,
      stumbleCooldown: 0,
    };
    state.camera = {
      x: 0,
      y: 5.5,
      z: 0,
      fov: 60,
      shake: 0,
    };
    state.stats = {
      score: 0,
      coins: 0,
      distance: 0,
      speed: GAME_CONSTANTS.INITIAL_SPEED,
    };

    clearThreeScene();
    state.coins = [];
    state.obstacles = [];
    state.powerUps = [];
    state.particles = [];
    state.activePowerUps = {} as Record<PowerUpType, number>;
    state.elapsedTime = 0;
    state.spawnZ = GAME_CONSTANTS.MIN_SPAWN_Z;

    // Spawn 150 meters empty starter safe zone
    state.spawnZ = 40;
    while (state.spawnZ < GAME_CONSTANTS.MAX_SPAWN_Z) {
      spawnTrackSegment();
    }
  };

  const clearThreeScene = () => {
    const scene = sceneRef.current;
    if (!scene) return;
    Object.keys(meshesRef.current).forEach((key) => {
      const mesh = meshesRef.current[key];
      scene.remove(mesh);
      mesh.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          if (child.geometry) child.geometry.dispose();
          if (child.material) {
            if (Array.isArray(child.material)) child.material.forEach((m) => m.dispose());
            else child.material.dispose();
          }
        }
      });
      delete meshesRef.current[key];
    });
  };

  // Spawners
  const spawnTrackSegment = () => {
    const state = stateRef.current;
    const z = state.spawnZ;
    const rand = Math.random();

    if (rand < 0.25) {
      // Standard coin layouts
      const lane = getRandomLane();
      const count = Math.floor(Math.random() * 4) + 3;
      const coinY = Math.random() < 0.3 ? 3.5 : 0.8;
      for (let i = 0; i < count; i++) {
        state.coins.push({
          id: `coin-${z}-${i}`,
          x: lane * GAME_CONSTANTS.LANE_WIDTH,
          y: coinY,
          z: z + i * 4,
          width: 1.2,
          height: 1.2,
          depth: 1.2,
          rotation: Math.random() * Math.PI,
          pulse: 0,
        });
      }
    } else if (rand < 0.55) {
      // Spawn standard obstacle Trains!
      const lane = getRandomLane();
      const isMoving = Math.random() < 0.3;
      const hasRamp = Math.random() < 0.6 && !isMoving;
      const trainLength = 32;

      state.obstacles.push({
        id: `train-${z}`,
        type: isMoving ? ObstacleType.TRAIN_MOVING : ObstacleType.TRAIN_STATIONARY,
        lane: lane,
        x: lane * GAME_CONSTANTS.LANE_WIDTH,
        y: 0,
        z: z,
        width: 2.8,
        height: 3.8,
        depth: trainLength,
        speed: isMoving ? -0.05 : 0,
        hasCoinsOnTop: true,
      });

      if (hasRamp) {
        state.obstacles.push({
          id: `ramp-${z}`,
          type: ObstacleType.RAMP,
          lane: lane,
          x: lane * GAME_CONSTANTS.LANE_WIDTH,
          y: 0,
          z: z - 8,
          width: 2.6,
          height: 1.8,
          depth: 8,
        });
      }

      // Spawn coins above train
      for (let i = 0; i < 5; i++) {
        state.coins.push({
          id: `coin-train-${z}-${i}`,
          x: lane * GAME_CONSTANTS.LANE_WIDTH,
          y: 4.6,
          z: z + 2 + i * 6,
          width: 1.2,
          height: 1.2,
          depth: 1.2,
          rotation: Math.random() * Math.PI,
          pulse: 0,
        });
      }
    } else if (rand < 0.8) {
      // Hurdles (Barricades)
      const layout = Math.random();
      if (layout < 0.5) {
        state.obstacles.push({
          id: `b-low-${z}`,
          type: ObstacleType.BARRICADE_LOW,
          lane: Lane.CENTER,
          x: 0,
          y: 0,
          z: z,
          width: 2.5,
          height: 1.6,
          depth: 1.2,
        });
        state.obstacles.push({
          id: `b-high-${z}`,
          type: ObstacleType.BARRICADE_HIGH,
          lane: Math.random() < 0.5 ? Lane.LEFT : Lane.RIGHT,
          x: (Math.random() < 0.5 ? -1 : 1) * GAME_CONSTANTS.LANE_WIDTH,
          y: 0,
          z: z + 8,
          width: 2.5,
          height: 3.2,
          depth: 1.2,
        });
      } else {
        state.obstacles.push({
          id: `b-high-center-${z}`,
          type: ObstacleType.BARRICADE_HIGH,
          lane: Lane.CENTER,
          x: 0,
          y: 0,
          z: z,
          width: 2.5,
          height: 3.2,
          depth: 1.2,
        });
      }
    } else if (rand < 0.92) {
      // Light pole scenery and warning coin arch
      state.obstacles.push({
        id: `pole-${z}`,
        type: ObstacleType.LIGHT_POLE,
        lane: Lane.LEFT,
        x: -1.8 * GAME_CONSTANTS.LANE_WIDTH,
        y: 0,
        z: z,
        width: 0.5,
        height: 6,
        depth: 0.5,
      });

      for (let i = 0; i < 5; i++) {
        const theta = (i / 4) * Math.PI;
        state.coins.push({
          id: `coin-arch-${z}-${i}`,
          x: 0,
          y: 0.8 + Math.sin(theta) * 3,
          z: z + i * 4,
          width: 1.2,
          height: 1.2,
          depth: 1.2,
          rotation: Math.random() * Math.PI,
          pulse: 0,
        });
      }
    } else {
      // Spawn Powerup
      const types: PowerUpType[] = ['MAGNET', 'JETPACK', 'HOVERBOARD', 'SNEAKERS'];
      const pick = types[Math.floor(Math.random() * types.length)];
      const lane = getRandomLane();

      state.powerUps.push({
        id: `pw-${z}`,
        type: pick,
        x: lane * GAME_CONSTANTS.LANE_WIDTH,
        y: 1.2,
        z: z,
        width: 1.6,
        height: 1.6,
        depth: 1.6,
        rotation: 0,
      });
    }
    state.spawnZ += 32;
  };

  const getRandomLane = (): Lane => {
    const lanes = [Lane.LEFT, Lane.CENTER, Lane.RIGHT];
    return lanes[Math.floor(Math.random() * lanes.length)];
  };

  // Keyboard Event Handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== GameState.PLAYING || isPaused) return;
      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          moveLane(-1);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          moveLane(1);
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
        case ' ':
          triggerJump();
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          triggerSlide();
          break;
        case 'p':
        case 'P':
          setIsPaused(true);
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, isPaused]);

  // Touch & Swipe gestures
  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    if (gameState !== GameState.PLAYING || isPaused) return;
    const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const y = 'touches' in e ? e.touches[0].clientY : e.clientY;
    touchStartRef.current = { x, y };
  };

  const handleTouchEnd = (e: React.TouchEvent | React.MouseEvent) => {
    if (!touchStartRef.current || gameState !== GameState.PLAYING || isPaused) return;
    const x = 'changedTouches' in e ? e.changedTouches[0].clientX : e.clientX;
    const y = 'changedTouches' in e ? e.changedTouches[0].clientY : e.clientY;

    const dx = x - touchStartRef.current.x;
    const dy = y - touchStartRef.current.y;
    const minSwipe = 30;

    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > minSwipe) moveLane(1);
      else if (dx < -minSwipe) moveLane(-1);
    } else {
      if (dy > minSwipe) triggerSlide();
      else if (dy < -minSwipe) triggerJump();
    }
    touchStartRef.current = null;
  };

  const moveLane = (dir: number) => {
    const player = stateRef.current.player;
    const isJetpacking = stateRef.current.activePowerUps['JETPACK'] > Date.now();
    const next = player.targetLane + dir;
    if (next >= -1 && next <= 1) {
      player.targetLane = next;
      if (!isJetpacking) audio.playSlide();
    }
  };

  const triggerJump = () => {
    const player = stateRef.current.player;
    if (player.isSliding) {
      player.isSliding = false;
      player.slideTimeRemaining = 0;
    }
    if (player.isGrounded) {
      const hasSneakers = stateRef.current.activePowerUps['SNEAKERS'] > Date.now();
      player.vy = hasSneakers ? GAME_CONSTANTS.SNEAKERS_JUMP_FORCE : GAME_CONSTANTS.JUMP_FORCE;
      player.isGrounded = false;
      audio.playJump();
      spawnSparkParticles(player.laneOffset * GAME_CONSTANTS.LANE_WIDTH, player.y, GAME_CONSTANTS.PLAYER_Z, 6, '#ffffff');
    }
  };

  const triggerSlide = () => {
    const player = stateRef.current.player;
    if (!player.isGrounded) {
      player.vy = -GAME_CONSTANTS.JUMP_FORCE * 1.6; // crash dive
    }
    player.isSliding = true;
    player.slideTimeRemaining = GAME_CONSTANTS.SLIDE_DURATION;
    audio.playSlide();
    spawnSparkParticles(player.laneOffset * GAME_CONSTANTS.LANE_WIDTH, player.y, GAME_CONSTANTS.PLAYER_Z, 4, '#cccccc');
  };

  const spawnSparkParticles = (x: number, y: number, z: number, count: number, color: string) => {
    const state = stateRef.current;
    for (let i = 0; i < count; i++) {
      state.particles.push({
        id: `spark-${Date.now()}-${Math.random()}`,
        x: x + (Math.random() * 2 - 1) * 0.4,
        y: y + (Math.random() * 2 - 1) * 0.4,
        z: z + (Math.random() * 2 - 1) * 0.4,
        vx: (Math.random() * 2 - 1) * 0.08,
        vy: Math.random() * 0.08 + 0.04,
        vz: -state.stats.speed * 0.5,
        color: color,
        size: Math.random() * 1.5 + 1.0,
        life: 1.0,
        decay: 0.05,
      });
    }
  };

  // Core Physics Loop
  const updatePhysics = (currentTime: number) => {
    const state = stateRef.current;
    const delta = Math.min(30, currentTime - state.lastTime);
    state.lastTime = currentTime;
    state.elapsedTime += delta;

    const now = Date.now();
    const isJetpacking = state.activePowerUps['JETPACK'] > now;

    // Incremental speed scaling
    state.stats.speed = Math.min(
      GAME_CONSTANTS.MAX_SPEED,
      GAME_CONSTANTS.INITIAL_SPEED + (state.elapsedTime / 1000) * GAME_CONSTANTS.SPEED_INCREMENT
    );

    // CRITICAL GLITCH FIX: Scroll the next spawn point backwards in sync with moving world!
    const runZ = state.stats.speed;
    state.spawnZ -= runZ;

    // Smooth lane translation (With strict overshoot prevention to eliminate shakiness/jitter!)
    const diff = state.player.targetLane - state.player.laneOffset;
    if (Math.abs(diff) > 0.001) {
      const step = GAME_CONSTANTS.LANE_SWITCH_SPEED;
      if (Math.abs(diff) <= step) {
        state.player.laneOffset = state.player.targetLane;
        state.player.lane = state.player.targetLane;
      } else {
        state.player.laneOffset += Math.sign(diff) * step;
      }
    } else {
      state.player.laneOffset = state.player.targetLane;
      state.player.lane = state.player.targetLane;
    }

    // Gravity or Jetpack float
    if (isJetpacking) {
      const targetY = 7.5;
      state.player.y += (targetY - state.player.y) * 0.1;
      state.player.vy = 0;
      state.player.isGrounded = false;
      state.player.isSliding = false;

      // Dual-nozzle jetpack fire sparks!
      if (Math.random() < 0.6) {
        spawnSparkParticles(state.player.laneOffset * GAME_CONSTANTS.LANE_WIDTH - 0.25, state.player.y + 0.4, GAME_CONSTANTS.PLAYER_Z + 0.2, 2, '#00e5ff');
        spawnSparkParticles(state.player.laneOffset * GAME_CONSTANTS.LANE_WIDTH + 0.25, state.player.y + 0.4, GAME_CONSTANTS.PLAYER_Z + 0.2, 2, '#ff3d00');
      }
    } else {
      state.player.vy += GAME_CONSTANTS.GRAVITY;
      state.player.y += state.player.vy;

      const isHoverboarding = state.activePowerUps['HOVERBOARD'] > now;
      if (isHoverboarding && state.player.isGrounded && Math.random() < 0.35) {
        // High energy cyberpunk purple trails trailing behind the board
        spawnSparkParticles(state.player.laneOffset * GAME_CONSTANTS.LANE_WIDTH, state.player.y, GAME_CONSTANTS.PLAYER_Z + 0.5, 2, '#d500f9');
      }

      if (state.player.isSliding) {
        state.player.slideTimeRemaining -= delta;
        if (state.player.slideTimeRemaining <= 0) {
          state.player.isSliding = false;
        }
      }

      if (state.player.y <= 0) {
        state.player.y = 0;
        state.player.vy = 0;
        state.player.isGrounded = true;
      }
    }

    if (state.player.invincibilityTime > 0) {
      state.player.invincibilityTime -= delta;
    }

    // Infinite segments spawning
    const frontZ = GAME_CONSTANTS.PLAYER_Z + 150;
    if (state.spawnZ < frontZ) {
      spawnTrackSegment();
    }

    // Scoring scaling
    state.stats.score += Math.floor(runZ * 10 * state.player.stumbleMultiplier);
    onScoreUpdated(state.stats.score);

    // Scroll Obstacles
    state.obstacles.forEach((obs) => {
      if (obs.type === ObstacleType.TRAIN_MOVING && obs.speed) {
        obs.z += obs.speed * 1.5 - runZ;
      } else {
        obs.z -= runZ;
      }
    });

    // Magnet and Scroll Coins
    state.coins.forEach((coin) => {
      if (state.activePowerUps['MAGNET'] > now && !coin.collected) {
        const pX = state.player.laneOffset * GAME_CONSTANTS.LANE_WIDTH;
        const pY = state.player.y + 0.8;
        const pZ = GAME_CONSTANTS.PLAYER_Z;

        const dz = coin.z - pZ;
        if (dz > 0 && dz < 35) {
          coin.isMagnetized = true;
          coin.x += (pX - coin.x) * 0.22;
          coin.y += (pY - coin.y) * 0.22;
          coin.z += (pZ - coin.z) * 0.22;
        } else {
          coin.z -= runZ;
        }
      } else {
        coin.z -= runZ;
      }
      coin.rotation += 0.05;
    });

    // Scroll Powerups
    state.powerUps.forEach((pw) => {
      pw.z -= runZ;
      pw.rotation += 0.03;
    });

    // Filter off-screen entities
    state.obstacles = state.obstacles.filter((obs) => obs.z > GAME_CONSTANTS.PLAYER_Z - 15);
    state.coins = state.coins.filter((coin) => coin.z > GAME_CONSTANTS.PLAYER_Z - 10 && !coin.collected);
    state.powerUps = state.powerUps.filter((pw) => pw.z > GAME_CONSTANTS.PLAYER_Z - 10 && !pw.collected);

    // Update Particles
    state.particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.z += p.vz;
      p.life -= p.decay;
    });
    state.particles = state.particles.filter((p) => p.life > 0);

    // Chasing Police
    if (state.police.stumbleCooldown > 0) {
      state.police.stumbleCooldown -= delta;
      if (state.police.stumbleCooldown <= 0) {
        state.police.targetZ = GAME_CONSTANTS.PLAYER_Z - GAME_CONSTANTS.POLICE_DEFAULT_DISTANCE;
        state.player.stumbleMultiplier = 1.0;
      }
    }
    state.police.z += (state.police.targetZ - state.police.z) * 0.05;

    // Check Camera Shake Decay
    if (state.camera.shake > 0) {
      state.camera.shake *= 0.85;
      if (state.camera.shake < 0.1) state.camera.shake = 0;
    }

    // Dynamic Camera smoothing
    const targetCamY = 5.5 + state.player.y * 0.45;
    state.camera.y += (targetCamY - state.camera.y) * 0.12;
    state.camera.x += (state.player.laneOffset * 0.4 - state.camera.x) * 0.1;

    // Collisions
    checkCollisions(now);
  };

  const checkCollisions = (now: number) => {
    const state = stateRef.current;
    const pX = state.player.laneOffset * GAME_CONSTANTS.LANE_WIDTH;
    const pY = state.player.y;
    const pZ = GAME_CONSTANTS.PLAYER_Z;

    const pW = 1.3;
    const pH = state.player.isSliding ? 0.8 : 1.9;
    const pD = 1.3;

    // Coin collisions
    state.coins.forEach((coin) => {
      if (coin.collected) return;
      const dx = Math.abs(coin.x - pX);
      const dy = Math.abs(coin.y - (pY + pH / 2));
      const dz = Math.abs(coin.z - pZ);

      if (dx < (coin.width + pW) / 2 && dy < (coin.height + pH) / 2 && dz < (coin.depth + pD) / 2) {
        coin.collected = true;
        state.stats.coins += 1;
        onCoinCollected(state.stats.coins);
        audio.playCoin();
        spawnSparkParticles(coin.x, coin.y, coin.z, 5, '#ffd700');
      }
    });

    // Powerup collisions
    state.powerUps.forEach((pw) => {
      if (pw.collected) return;
      const dx = Math.abs(pw.x - pX);
      const dy = Math.abs(pw.y - (pY + pH / 2));
      const dz = Math.abs(pw.z - pZ);

      if (dx < (pw.width + pW) / 2 && dy < (pw.height + pH) / 2 && dz < (pw.depth + pD) / 2) {
        pw.collected = true;
        audio.playPowerUp();

        let bonus = 10000;
        if (pw.type === 'MAGNET') bonus += (upgrades.magnetLevel - 1) * 2500;
        if (pw.type === 'JETPACK') bonus += (upgrades.jetpackLevel - 1) * 2500;
        if (pw.type === 'SNEAKERS') bonus += (upgrades.sneakersLevel - 1) * 2500;
        if (pw.type === 'HOVERBOARD') bonus += (upgrades.hoverboardLevel - 1) * 2500;

        state.activePowerUps[pw.type] = now + bonus;
        state.camera.shake = 12;

        const color = pw.type === 'MAGNET' ? '#ff3333' : pw.type === 'JETPACK' ? '#00e5ff' : pw.type === 'HOVERBOARD' ? '#ab47bc' : '#66bb6a';
        spawnSparkParticles(pw.x, pw.y, pw.z, 15, color);
      }
    });

    // Obstacle collisions
    let onTop = false;
    let highestY = 0;

    const isJetpacking = state.activePowerUps['JETPACK'] > now;
    if (isJetpacking) return;

    state.obstacles.forEach((obs) => {
      const minX = obs.x - obs.width / 2;
      const maxX = obs.x + obs.width / 2;
      const minY = obs.y;
      const maxY = obs.y + obs.height;
      const minZ = obs.z - obs.depth / 2;
      const maxZ = obs.z + obs.depth / 2;

      const pxMin = pX - pW / 2;
      const pxMax = pX + pW / 2;
      const pyMin = pY;
      const pyMax = pY + pH;
      const pzMin = pZ - pD / 2;
      const pzMax = pZ + pD / 2;

      const overlapX = pxMax > minX && pxMin < maxX;
      const overlapY = pyMax > minY && pyMin < maxY;
      const overlapZ = pzMax > minZ && pzMin < maxZ;

      if (overlapX && overlapY && overlapZ) {
        if (obs.type === ObstacleType.RAMP) {
          const progress = (pZ - minZ) / obs.depth;
          const rampY = Math.max(0, Math.min(obs.height, progress * obs.height));
          if (pY <= rampY + 0.3) {
            state.player.y = rampY;
            state.player.vy = 0;
            state.player.isGrounded = true;
            onTop = true;
            highestY = Math.max(highestY, rampY);
          }
          return;
        }

        const isAbove = pyMin >= maxY - 0.5;
        const isFalling = state.player.vy <= 0;

        if ((obs.type === ObstacleType.TRAIN_STATIONARY || obs.type === ObstacleType.TRAIN_MOVING) && isAbove && isFalling) {
          state.player.y = maxY;
          state.player.vy = 0;
          state.player.isGrounded = true;
          onTop = true;
          highestY = Math.max(highestY, maxY);
          return;
        }

        if (state.player.invincibilityTime > 0) return;

        // Save from crash if hoverboard active
        if (state.activePowerUps['HOVERBOARD'] > now) {
          state.activePowerUps['HOVERBOARD'] = 0;
          state.player.invincibilityTime = 1500;
          state.camera.shake = 20;
          audio.playCrash();
          spawnSparkParticles(pX, pY + pH / 2, pZ, 15, '#ab47bc');
          return;
        }

        const depth = Math.min(pxMax - minZ, maxZ - pzMin);

        if (obs.type === ObstacleType.BARRICADE_LOW) {
          triggerStumble(now);
        } else if (obs.type === ObstacleType.BARRICADE_HIGH) {
          if (state.player.isSliding) return;
          triggerFullCrash();
        } else {
          if (depth < 1.8 && Math.abs(state.player.laneOffset - obs.lane) > 0.4) {
            state.player.targetLane = state.player.lane;
            triggerStumble(now);
          } else {
            triggerFullCrash();
          }
        }
      }
    });

    if (pY > 0 && !onTop) {
      if (pY < highestY) {
        state.player.y = highestY;
        state.player.vy = 0;
        state.player.isGrounded = true;
      } else {
        state.player.isGrounded = false;
      }
    }
  };

  const triggerStumble = (now: number) => {
    const state = stateRef.current;
    if (state.police.stumbleCooldown > 0) {
      triggerFullCrash();
    } else {
      audio.playStumble();
      state.camera.shake = 8;
      state.police.targetZ = GAME_CONSTANTS.PLAYER_Z - 3.8;
      state.police.stumbleCooldown = 4000;
      state.player.stumbleMultiplier = 0.5;
      state.player.invincibilityTime = 1000;
      spawnSparkParticles(state.player.laneOffset * GAME_CONSTANTS.LANE_WIDTH, state.player.y, GAME_CONSTANTS.PLAYER_Z, 6, '#ff9800');
    }
  };

  const triggerFullCrash = () => {
    const state = stateRef.current;
    audio.playCrash();
    state.camera.shake = 30;

    const px = state.player.laneOffset * GAME_CONSTANTS.LANE_WIDTH;
    const py = state.player.y;
    spawnSparkParticles(px, py + 1.0, GAME_CONSTANTS.PLAYER_Z, 25, '#ff3333');

    cancelAnimationFrame(state.animationFrameId);
    audio.stopMusic();
    onGameOver(state.stats.score, state.stats.coins);
  };

  // Sync ThreeJS Scene elements with Physics state
  const updateThreeScene = () => {
    const scene = sceneRef.current;
    const renderer = rendererRef.current;
    const camera = cameraRef.current;
    if (!scene || !renderer || !camera) return;

    const state = stateRef.current;
    const now = Date.now();

    // 1. Tiled wood sleepers scrolling
    const runZ = state.stats.speed;
    sleepersRef.current.forEach((sleeper) => {
      sleeper.position.z += runZ;
      if (sleeper.position.z > 5.0) {
        sleeper.position.z -= 50 * 6.0;
      }
    });

    // 1.5. Infinite Skyscrapers/Buildings scrolling
    buildingsRef.current.forEach((b) => {
      b.position.z += runZ;
      if (b.position.z > 50.0) {
        b.position.z -= 12 * 35.0; // Recycles building back to the end of the line
        // Randomize height slightly for procedural cityscape skyline look
        b.scale.y = 0.5 + Math.random() * 1.5;
      }
    });

    // 2. Animate Starfield slowly
    if (starsRef.current) {
      starsRef.current.rotation.y = state.elapsedTime * 0.0001;
    }

    // 3. Update dynamic meshes (Coins, Obstacles, Powerups, Particles)
    const activeIds = new Set<string>();
    state.coins.forEach((c) => activeIds.add(c.id));
    state.obstacles.forEach((o) => activeIds.add(o.id));
    state.powerUps.forEach((p) => activeIds.add(p.id));
    state.particles.forEach((p) => activeIds.add(p.id));

    // Cleanup stale ThreeJS meshes
    Object.keys(meshesRef.current).forEach((key) => {
      if (!activeIds.has(key)) {
        const mesh = meshesRef.current[key];
        scene.remove(mesh);
        mesh.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
              if (Array.isArray(child.material)) child.material.forEach((m) => m.dispose());
              else child.material.dispose();
            }
          }
        });
        delete meshesRef.current[key];
      }
    });

    // Sync Coins with golden concentric textured appearance
    state.coins.forEach((coin) => {
      if (coin.collected) return;
      let mesh = meshesRef.current[coin.id];
      if (!mesh) {
        const coinGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.15, 12);
        coinGeo.rotateX(Math.PI / 2);
        const coinMat = new THREE.MeshStandardMaterial({
          map: texturesRef.current.coin, // Set beautiful gold coin procedural texture
          metalness: 0.95,
          roughness: 0.08,
          emissive: '#ffd54f',
          emissiveIntensity: 0.35,
        });
        mesh = new THREE.Mesh(coinGeo, coinMat);
        scene.add(mesh);
        meshesRef.current[coin.id] = mesh;
      }
      mesh.position.set(coin.x, coin.y + Math.sin(state.elapsedTime * 0.004 + coin.z * 0.15) * 0.15, -coin.z);
      mesh.rotation.y = coin.rotation;
    });

    // Sync Obstacles with textured trains and styled barricades
    state.obstacles.forEach((obs) => {
      let mesh = meshesRef.current[obs.id];
      if (!mesh) {
        const group = new THREE.Group();
        const w = obs.width;
        const h = obs.height;
        const d = obs.depth;

        if (obs.type === ObstacleType.TRAIN_STATIONARY || obs.type === ObstacleType.TRAIN_MOVING) {
          const isMoving = obs.type === ObstacleType.TRAIN_MOVING;
          const tex = isMoving ? texturesRef.current.trainRed : texturesRef.current.trainBlue;

          const bodyGeo = new THREE.BoxGeometry(w, h, d);
          const bodyMat = new THREE.MeshStandardMaterial({
            map: tex, // Set sci-fi rivet & panel procedural texture!
            roughness: 0.25,
            metalness: 0.8,
          });
          const body = new THREE.Mesh(bodyGeo, bodyMat);
          body.position.y = h / 2;
          group.add(body);

          // Glass Windshield
          const glassGeo = new THREE.BoxGeometry(w * 0.85, h * 0.35, 0.05);
          const glassMat = new THREE.MeshStandardMaterial({ color: '#111111', roughness: 0.1, metalness: 0.9 });
          const windshield = new THREE.Mesh(glassGeo, glassMat);
          windshield.position.set(0, h * 0.65, -d / 2 - 0.01);
          group.add(windshield);

          // Headlights
          const lightGeo = new THREE.SphereGeometry(0.12, 6, 6);
          const lightMat = new THREE.MeshBasicMaterial({ color: '#ffeb3b' });
          const leftHead = new THREE.Mesh(lightGeo, lightMat);
          leftHead.position.set(-w * 0.3, h * 0.2, -d / 2 - 0.05);
          const rightHead = leftHead.clone();
          rightHead.position.x = w * 0.3;
          group.add(leftHead);
          group.add(rightHead);
        } else if (obs.type === ObstacleType.RAMP) {
          const rampGeo = new THREE.BoxGeometry(w, 0.15, d * 1.02);
          const rampMesh = new THREE.Mesh(rampGeo, new THREE.MeshStandardMaterial({ color: '#e65100', roughness: 0.5, metalness: 0.4 }));
          rampMesh.rotation.x = Math.atan(h / d);
          rampMesh.position.set(0, h / 2, 0);
          group.add(rampMesh);

          const sideGeo = new THREE.BoxGeometry(0.1, h, d);
          const leftW = new THREE.Mesh(sideGeo, new THREE.MeshStandardMaterial({ color: '#5d4037', roughness: 0.8 }));
          leftW.position.set(-w / 2, h / 2, 0);
          const rightW = leftW.clone();
          rightW.position.x = w / 2;
          group.add(leftW);
          group.add(rightW);
        } else if (obs.type === ObstacleType.BARRICADE_LOW) {
          const plank = new THREE.Mesh(new THREE.BoxGeometry(w, 0.32, 0.08), new THREE.MeshStandardMaterial({ color: '#d01717', roughness: 0.5 }));
          plank.position.set(0, h - 0.16, 0);
          group.add(plank);

          const leg = new THREE.Mesh(new THREE.BoxGeometry(0.12, h, 0.12), new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.6 }));
          leg.position.set(-w * 0.35, h / 2, 0);
          const rLeg = leg.clone();
          rLeg.position.x = w * 0.35;
          group.add(leg);
          group.add(rLeg);
        } else if (obs.type === ObstacleType.BARRICADE_HIGH) {
          const banner = new THREE.Mesh(new THREE.BoxGeometry(w, 0.7, 0.08), new THREE.MeshStandardMaterial({ color: '#ffd54f', roughness: 0.5 }));
          banner.position.set(0, h - 0.35, 0);
          group.add(banner);

          const post = new THREE.Mesh(new THREE.BoxGeometry(0.14, h, 0.14), new THREE.MeshStandardMaterial({ color: '#455a64', roughness: 0.7 }));
          post.position.set(-w / 2 + 0.07, h / 2, 0);
          const rPost = post.clone();
          rPost.position.x = w / 2 - 0.07;
          group.add(post);
          group.add(rPost);
        } else if (obs.type === ObstacleType.LIGHT_POLE) {
          const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, h), new THREE.MeshStandardMaterial({ color: '#263238', roughness: 0.5 }));
          pole.position.y = h / 2;
          group.add(pole);

          const arm = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.08, 0.08), new THREE.MeshStandardMaterial({ color: '#263238' }));
          arm.position.set(obs.x < 0 ? 0.6 : -0.6, h - 0.1, 0);
          group.add(arm);

          const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.08, 0.3), new THREE.MeshBasicMaterial({ color: '#00e5ff' }));
          lamp.position.set(obs.x < 0 ? 1.1 : -1.1, h - 0.2, 0);
          group.add(lamp);
        }

        mesh = group;
        scene.add(mesh);
        meshesRef.current[obs.id] = mesh;
      }
      mesh.position.set(obs.x, obs.y, -obs.z);
    });

    // Sync Powerups as futuristic spinning crystals with glowing wireframe rings
    state.powerUps.forEach((pw) => {
      if (pw.collected) return;
      let mesh = meshesRef.current[pw.id];
      if (!mesh) {
        const group = new THREE.Group();
        const color = pw.type === 'MAGNET' ? '#ff3333' : pw.type === 'JETPACK' ? '#00e5ff' : pw.type === 'HOVERBOARD' ? '#ab47bc' : '#66bb6a';

        const pMat = new THREE.MeshStandardMaterial({
          map: pw.type === 'MAGNET' ? texturesRef.current.magnet :
               pw.type === 'JETPACK' ? texturesRef.current.jetpack :
               pw.type === 'SNEAKERS' ? texturesRef.current.sneakers :
               texturesRef.current.hoverboard,
          metalness: 0.85,
          roughness: 0.1,
          emissive: color,
          emissiveIntensity: 0.4,
        });

        // 3D spinning crystal prism
        const crystalGeo = new THREE.OctahedronGeometry(0.48, 0);
        const crystal = new THREE.Mesh(crystalGeo, pMat);
        crystal.name = 'crystal';
        crystal.position.y = 0.5;
        group.add(crystal);

        // Futuristic neon floating ring rotating in opposite direction
        const ringGeo = new THREE.RingGeometry(0.68, 0.74, 16);
        ringGeo.rotateX(Math.PI / 2);
        const ringMat = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.name = 'ring';
        ring.position.y = 0.5;
        group.add(ring);

        // Direct up-pointer cone
        const arrow = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.35, 4), new THREE.MeshBasicMaterial({ color }));
        arrow.rotateX(Math.PI);
        arrow.position.y = 1.15;
        group.add(arrow);

        mesh = group;
        scene.add(mesh);
        meshesRef.current[pw.id] = mesh;
      }
      mesh.position.set(pw.x, pw.y, -pw.z);
      mesh.rotation.y = pw.rotation;

      // Rotate subcomponents dynamically
      const crystal = mesh.getObjectByName('crystal');
      if (crystal) {
        crystal.rotation.x = state.elapsedTime * 0.002;
        crystal.rotation.z = state.elapsedTime * 0.0015;
      }
      const ring = mesh.getObjectByName('ring');
      if (ring) {
        ring.rotation.z = -state.elapsedTime * 0.003;
        ring.position.y = 0.5 + Math.sin(state.elapsedTime * 0.005 + pw.z) * 0.1;
      }
    });

    // Sync Particles
    state.particles.forEach((p) => {
      let mesh = meshesRef.current[p.id];
      if (!mesh) {
        const pGeo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
        mesh = new THREE.Mesh(pGeo, new THREE.MeshBasicMaterial({ color: p.color, transparent: true, opacity: 0.85 }));
        scene.add(mesh);
        meshesRef.current[p.id] = mesh;
      }
      mesh.position.set(p.x, p.y, -p.z);
      mesh.scale.setScalar(p.life);
    });

    // 4. Update Player limbs animation and coordinates
    if (playerGroupRef.current) {
      const pX = state.player.laneOffset * GAME_CONSTANTS.LANE_WIDTH;
      const pY = state.player.y;
      const pZ = GAME_CONSTANTS.PLAYER_Z;

      playerGroupRef.current.position.set(pX, pY, -pZ);

      // Flash player brief red/white on crash immune state
      const isImmune = state.player.invincibilityTime > 0;
      const visible = !isImmune || Math.floor(state.player.invincibilityTime / 100) % 2 === 0;
      playerGroupRef.current.visible = visible;

      const runCycle = state.elapsedTime * 0.015 * state.stats.speed * 4;
      const grounded = state.player.isGrounded;
      const sliding = state.player.isSliding;

      // Reset base transforms
      playerGroupRef.current.scale.set(1, 1, 1);
      playerGroupRef.current.rotation.x = 0;

      if (playerLimbsRef.current.leftLeg && playerLimbsRef.current.rightLeg && playerLimbsRef.current.leftArm && playerLimbsRef.current.rightArm) {
        if (sliding) {
          playerGroupRef.current.scale.set(1, 0.52, 1);
          playerGroupRef.current.rotation.x = 0.35;
          playerLimbsRef.current.leftLeg.rotation.x = -1.2;
          playerLimbsRef.current.rightLeg.rotation.x = -1.2;
          playerLimbsRef.current.leftArm.rotation.x = 1.0;
          playerLimbsRef.current.rightArm.rotation.x = 1.0;
        } else if (!grounded) {
          playerLimbsRef.current.leftLeg.rotation.x = 0.25;
          playerLimbsRef.current.rightLeg.rotation.x = 0.25;
          playerLimbsRef.current.leftArm.rotation.z = -0.5;
          playerLimbsRef.current.rightArm.rotation.z = 0.5;
        } else {
          // Normal running limbs alternate swings
          const angle = Math.sin(runCycle) * 0.65;
          playerLimbsRef.current.leftLeg.rotation.x = angle;
          playerLimbsRef.current.rightLeg.rotation.x = -angle;
          playerLimbsRef.current.leftArm.rotation.x = -angle;
          playerLimbsRef.current.rightArm.rotation.x = angle;
          playerLimbsRef.current.leftArm.rotation.z = 0;
          playerLimbsRef.current.rightArm.rotation.z = 0;
        }
      }

      // Attachments
      if (playerLimbsRef.current.hoverboard) {
        playerLimbsRef.current.hoverboard.visible = state.activePowerUps['HOVERBOARD'] > now;
      }
      if (playerLimbsRef.current.jetpack) {
        playerLimbsRef.current.jetpack.visible = state.activePowerUps['JETPACK'] > now;
      }
    }

    // 5. Update Police limbs and positions
    if (policeGroupRef.current) {
      const polX = state.player.laneOffset * GAME_CONSTANTS.LANE_WIDTH;
      const polY = state.player.y;
      const polZ = state.police.z;

      policeGroupRef.current.position.set(polX, polY, -polZ);
      policeGroupRef.current.visible = polZ > 1.5;

      const runCycleCop = state.elapsedTime * 0.016 * state.stats.speed * 4;
      const copAngle = Math.sin(runCycleCop) * 0.6;

      if (policeLimbsRef.current.leftLeg && policeLimbsRef.current.rightLeg) {
        policeLimbsRef.current.leftLeg.rotation.x = copAngle;
        policeLimbsRef.current.rightLeg.rotation.x = -copAngle;
      }

      // Cop siren dual point light flashes
      const flType = Math.floor(state.elapsedTime / 120) % 2;
      if (policeLimbsRef.current.sirenRed && policeLimbsRef.current.sirenBlue) {
        policeLimbsRef.current.sirenRed.visible = flType === 0;
        policeLimbsRef.current.sirenBlue.visible = flType === 1;
      }
    }

    // 6. Camera chase and shakes
    const shakeOffset = (Math.random() * 2 - 1) * state.camera.shake * 0.05;
    camera.position.set(state.camera.x + shakeOffset, state.camera.y + shakeOffset, -state.camera.z + 1.2);
    camera.lookAt(state.player.laneOffset * GAME_CONSTANTS.LANE_WIDTH, state.player.y + 1.0, -GAME_CONSTANTS.PLAYER_Z - 20.0);

    // Render WebGL
    renderer.render(scene, camera);
  };

  return (
    <div
      ref={containerRef}
      id="game-canvas-container"
      className="relative w-full h-full select-none outline-none overflow-hidden touch-none"
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <canvas ref={canvasRef} id="game-3d-canvas" className="block w-full h-full cursor-pointer" />

      {/* Swipe guides overlays on phone aspect ratios */}
      {gameState === GameState.PLAYING && (
        <div className="absolute inset-x-0 bottom-4 flex justify-between px-6 pointer-events-none md:hidden opacity-35 select-none text-white text-xs font-mono">
          <span>← Swipe Left/Right →</span>
          <span>↑ Jump / Slide ↓</span>
        </div>
      )}
    </div>
  );
}
