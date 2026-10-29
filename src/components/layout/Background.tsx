"use client";
import { motion } from "framer-motion";

/** Soft aurora blobs behind glass surfaces. */
export function Background() {
  const blobs = [
    { c: "#B9AEFF", x: "-8%", y: "-12%", s: 620, d: 0 },
    { c: "#FFC9BE", x: "68%", y: "-6%", s: 520, d: 2 },
    { c: "#A6F0DA", x: "78%", y: "62%", s: 560, d: 4 },
    { c: "#C9D8FF", x: "6%", y: "70%", s: 480, d: 1 },
  ];
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_50%_-10%,#F7F5FF_0%,#ECEFF5_60%)]" />
      {blobs.map((b, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full opacity-60 blur-[90px]"
          style={{ left: b.x, top: b.y, width: b.s, height: b.s, background: b.c }}
          animate={{ x: [0, 40, -30, 0], y: [0, -30, 25, 0], scale: [1, 1.08, 0.95, 1] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: b.d }}
        />
      ))}
      <div className="absolute inset-0 opacity-[0.035] [background-image:url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22140%22 height=%22140%22><filter id=%22n%22><feTurbulence baseFrequency=%220.9%22/></filter><rect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/></svg>')]" />
    </div>
  );
}
