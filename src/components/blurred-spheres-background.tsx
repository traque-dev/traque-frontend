import { motion, useAnimationFrame } from 'motion/react';
import type { CSSProperties } from 'react';
import { useMemo, useRef, useState } from 'react';
import { hexToRgba } from '@/lib/utils';

const TAU = Math.PI * 2;

export type SphereConfig = {
  radius: number;
  blur: number;
  color: string;
  animationRadius: number;
  duration: number; // ms per full revolution
  initialAngle: number; // radians
  center: { x: number; y: number };
};

export type BlurredSpheresBackgroundProps = {
  spheres: SphereConfig[];
  style?: CSSProperties;
  className?: string;
};

export function BlurredSpheresBackground({
  spheres,
  style,
  className,
}: BlurredSpheresBackgroundProps) {
  const [angles, setAngles] = useState<number[]>(() =>
    spheres.map((s) => s.initialAngle),
  );
  const mountedRef = useRef(true);

  useAnimationFrame((_t, delta) => {
    if (!mountedRef.current) return;
    setAngles((prev) =>
      prev.map((angle, i) => {
        const duration = spheres[i].duration;
        if (duration <= 0) return angle;
        const angularVelocity = TAU / duration; // radians per ms
        return (angle + angularVelocity * delta) % TAU;
      }),
    );
  });

  // gradients for nicer bloom than plain blur
  const gradients = useMemo(
    () =>
      spheres.map((s) => {
        const center = hexToRgba(s.color, 1);
        const edge = hexToRgba(s.color, 0);
        return `radial-gradient(circle, ${center} 0%, ${center} 40%, ${edge} 70%, ${edge} 100%)`;
      }),
    [spheres],
  );

  const positions = useMemo(
    () =>
      spheres.map((s, i) => {
        const a = angles[i];
        return {
          x: s.center.x + s.animationRadius * Math.cos(a),
          y: s.center.y + s.animationRadius * Math.sin(a),
        };
      }),
    [angles, spheres],
  );

  return (
    <div
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        ...style,
      }}
    >
      {positions.map((pos, i) => {
        const s = spheres[i];
        const size = s.radius * 2;
        return (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              width: size,
              height: size,
              left: pos.x - s.radius,
              top: pos.y - s.radius,
              borderRadius: '50%',
              filter: `blur(${s.blur}px)`,
              backgroundImage: gradients[i],
            }}
          />
        );
      })}
    </div>
  );
}
