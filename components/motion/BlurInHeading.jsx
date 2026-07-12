"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

// DESIGN.md signature: each word of a heading blurs + slides + fades in
// independently, staggered left-to-right, when it scrolls into view.
export default function BlurInHeading({
  text = "",
  as: Tag = "h2",
  className,
  stagger = 80, // ms added per word
}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const words = text.split(" ");

  return (
    <Tag ref={ref} className={className}>
      {words.map((word, i) => (
        <span
          key={i}
          className={cn("blur-word", visible && "is-visible")}
          style={{ transitionDelay: `${i * stagger}ms` }}
        >
          {word}
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </Tag>
  );
}
