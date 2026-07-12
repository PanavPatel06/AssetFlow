"use client";

import { useEffect, useRef } from "react";

// DESIGN.md signature: a small canvas (rendered at 2x, pixelated) showing a
// sparse grid of grey squares that continuously flicker + blink. Each `seed`
// produces its own stable base pattern, so sections get different little icons.

// Tiny deterministic string -> number hash, for a stable per-seed pattern.
function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// Seeded PRNG (mulberry32).
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function PixelGlyph({ seed = "default", size = 40 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const GRID = 8; // 8x8 cells
    const buffer = 80; // internal resolution (2x of 40px)
    canvas.width = buffer;
    canvas.height = buffer;
    const cell = buffer / GRID;

    // Build a stable pattern of "lit" cells with per-cell animation params.
    const rng = mulberry32(hashString(seed));
    const cells = [];
    for (let y = 0; y < GRID; y++) {
      for (let x = 0; x < GRID; x++) {
        const r = rng();
        if (r > 0.5) {
          cells.push({
            x,
            y,
            base: 0.35 + rng() * 0.65, // grey shade
            speed: 0.8 + rng() * 2.6, // flicker speed (higher = livelier)
            phase: rng() * Math.PI * 2, // flicker offset
            blink: rng() > 0.7, // some cells fully blink on/off
          });
        }
      }
    }

    let raf;
    const draw = (t) => {
      const time = t * 0.001;
      ctx.clearRect(0, 0, buffer, buffer);
      for (const c of cells) {
        // Strong opacity oscillation so the motion is clearly visible.
        const wave = 0.5 + 0.5 * Math.sin(time * c.speed + c.phase);
        let alpha = c.base * (0.12 + 0.88 * wave);
        // Blink cells drop out entirely for part of the cycle.
        if (c.blink && wave < 0.35) alpha = 0.04;
        ctx.fillStyle = `rgba(17,17,17,${alpha})`;
        ctx.fillRect(c.x * cell + 1, c.y * cell + 1, cell - 2, cell - 2);
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [seed]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        imageRendering: "pixelated",
      }}
    />
  );
}
