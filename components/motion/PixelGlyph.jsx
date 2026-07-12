"use client";

import { useEffect, useRef } from "react";

// DESIGN.md signature pixel glyph — but purposeful: each `kind` renders a
// recognizable 8x8 pixel-art icon that matches its section heading, animated in
// a way that reinforces the meaning (bars grow, calendar scans, bell rings,
// transfer arrow slides, checkmark draws in, etc.).

// bitmap: 8 rows of 8 chars, "1" = lit cell. anim: how it moves.
const GLYPHS = {
  dashboard: {
    anim: "wave",
    bitmap: ["01110111", "01110111", "01110111", "00000000", "01110111", "01110111", "01110111", "00000000"],
  },
  assets: {
    anim: "pulse",
    bitmap: ["00111100", "01111110", "01111110", "01111110", "01111110", "01111110", "01111110", "00111100"],
  },
  allocation: {
    anim: "slide",
    bitmap: ["00000000", "00010000", "00011000", "01111100", "01111100", "00011000", "00010000", "00000000"],
  },
  bookings: {
    anim: "scan",
    bitmap: ["01000010", "11111111", "10000001", "10101011", "10000001", "10101011", "10000001", "11111111"],
  },
  maintenance: {
    anim: "pulse",
    bitmap: ["00011000", "01011010", "00111100", "11100111", "11100111", "00111100", "01011010", "00011000"],
  },
  audit: {
    anim: "draw",
    bitmap: ["00000000", "00000011", "00000110", "00001100", "11011000", "01110000", "00100000", "00000000"],
  },
  reports: { anim: "bars", bitmap: null },
  activity: {
    anim: "ring",
    bitmap: ["00011000", "00111100", "00111100", "00111100", "01111110", "11111111", "00000000", "00011000"],
  },
  organization: {
    anim: "wave",
    bitmap: ["00111100", "01111110", "01011010", "01111110", "01011010", "01111110", "01011010", "01111110"],
  },
  brand: {
    anim: "wave",
    bitmap: ["00111100", "01000010", "10011001", "10100101", "10100101", "10011001", "01000010", "00111100"],
  },
};

function cellsFromBitmap(bitmap) {
  const cells = [];
  bitmap.forEach((row, y) => {
    row.split("").forEach((c, x) => {
      if (c === "1") cells.push({ x, y });
    });
  });
  return cells;
}

export default function PixelGlyph({ kind = "brand", size = 40 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const GRID = 8;
    const buffer = 80;
    canvas.width = buffer;
    canvas.height = buffer;
    const cell = buffer / GRID;

    const glyph = GLYPHS[kind] || GLYPHS.brand;
    const cells = glyph.bitmap ? cellsFromBitmap(glyph.bitmap) : [];
    // Drawing order for the "draw" animation (checkmark stroke, bottom-left up).
    const drawOrder = [...cells].sort((a, b) => a.x - b.x || b.y - a.y);

    const plot = (gx, gy, alpha) => {
      if (gx < 0 || gx > 7 || gy < 0 || gy > 7) return;
      ctx.fillStyle = `rgba(17,17,17,${Math.max(0, Math.min(1, alpha))})`;
      ctx.fillRect(gx * cell + 1, gy * cell + 1, cell - 2, cell - 2);
    };

    let raf;
    const draw = (tms) => {
      const t = tms * 0.001;
      ctx.clearRect(0, 0, buffer, buffer);

      switch (glyph.anim) {
        case "wave": // diagonal shimmer — pixels light up in sequence
          for (const c of cells) {
            const phase = c.x + c.y;
            plot(c.x, c.y, 0.25 + 0.75 * (0.5 + 0.5 * Math.sin(t * 2.2 - phase * 0.6)));
          }
          break;

        case "pulse": // breathing outward from the center
          for (const c of cells) {
            const d = Math.hypot(c.x - 3.5, c.y - 3.5);
            plot(c.x, c.y, 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * 2.4 - d * 0.8)));
          }
          break;

        case "slide": { // transfer arrow drifts right-and-back
          const off = Math.round(Math.sin(t * 1.7) * 1.6);
          for (const c of cells) {
            plot(c.x + off, c.y, 0.55 + 0.35 * (0.5 + 0.5 * Math.sin(t * 3)));
          }
          break;
        }

        case "scan": { // a highlight column sweeps across the calendar
          const col = Math.floor(t * 2.4) % 8;
          for (const c of cells) plot(c.x, c.y, c.x === col ? 1 : 0.28);
          break;
        }

        case "draw": { // checkmark reveals along its stroke, then loops
          const n = drawOrder.length;
          const p = (t * 3) % (n + 5);
          drawOrder.forEach((c, i) => plot(c.x, c.y, i <= p ? 1 : 0.12));
          break;
        }

        case "ring": { // bell swings like a pendulum (pivot at top)
          const swing = Math.sin(t * 4);
          for (const c of cells) {
            const off = Math.round(swing * (c.y / 7) * 1.8);
            plot(c.x + off, c.y, 0.5 + 0.4 * (0.5 + 0.5 * Math.sin(t * 4)));
          }
          break;
        }

        case "bars": { // 3 chart bars grow and shrink
          const barCols = [[0, 1], [3, 4], [6, 7]];
          barCols.forEach((cols, b) => {
            const frac = 0.35 + 0.6 * (0.5 + 0.5 * Math.sin(t * 2 + b * 1.3));
            const h = Math.round(frac * 6) + 2; // 2..8 tall
            for (let y = 7; y > 7 - h; y--) {
              for (const x of cols) plot(x, y, 0.85);
            }
          });
          break;
        }

        default:
          for (const c of cells) plot(c.x, c.y, 0.8);
      }

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [kind]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ width: size, height: size, imageRendering: "pixelated" }}
    />
  );
}
