"use client";

import { useEffect, useRef } from "react";

// DESIGN.md signature: a 40x40 canvas (rendered at 2x, pixelated) showing a
// sparse grid of grey squares that gently flicker. Each `seed` produces its own
// stable glyph pattern, so different sections get a different little icon.

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

    // Build a stable pattern of "lit" cells + a base shade for each.
    const rng = mulberry32(hashString(seed));
    const cells = [];
    for (let y = 0; y < GRID; y++) {
      for (let x = 0; x < GRID; x++) {
        if (rng() > 0.55) {
          cells.push({
            x,
            y,
            base: 0.25 + rng() * 0.6, // grey shade
            speed: 0.5 + rng() * 1.5, // flicker speed
            phase: rng() * Math.PI * 2, // flicker offset
          });
        }
      }
    }

    let raf;
    const draw = (t) => {
      ctx.clearRect(0, 0, buffer, buffer);
      for (const c of cells) {
        // Gentle opacity flicker around the base shade.
        const flicker =
          0.5 + 0.5 * Math.sin(t * 0.001 * c.speed + c.phase);
        const alpha = Math.min(1, c.base * (0.55 + 0.65 * flicker));
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
