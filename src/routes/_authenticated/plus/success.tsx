import { createFileRoute, Link } from '@tanstack/react-router';
import confetti from 'canvas-confetti';
import { AnimatePresence, motion } from 'motion/react';
import { opacify } from 'polished';
import { useEffect, useMemo } from 'react';
import { BlurredSpheresBackground } from '@/components/blurred-spheres-background';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/_authenticated/plus/success')({
  component: SuccessPage,
});

function SuccessPage() {
  useEffect(() => {
    setTimeout(() => {
      confetti({
        particleCount: 256,
        spread: 128,
        origin: { y: 0.4 },
      });
    }, 500);
  }, []);

  const spheres = useMemo(
    () => [
      {
        radius: 240,
        blur: 120,
        color: opacify(-0.68, '#7033ff'),
        animationRadius: 90,
        duration: 22000,
        initialAngle: Math.PI / 3,
        center: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
      },
      {
        radius: 200,
        blur: 100,
        color: opacify(-0.6, '#F7ACB5'),
        animationRadius: 240,
        duration: 20000,
        initialAngle: Math.PI,
        center: { x: window.innerWidth / 2, y: window.innerHeight / 4 },
      },
    ],
    [],
  );

  return (
    <div style={{ position: 'relative', minHeight: '100dvh' }}>
      <BlurredSpheresBackground spheres={spheres} />
      <div className="relative z-10 min-h-dvh flex items-center justify-center p-4">
        <div className="w-full max-w-xl text-center">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.6 }}
            >
              <motion.img
                src="/logo.png"
                alt="Traque logo"
                initial={{ opacity: 0, scale: 1.12 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="w-16 h-16 mx-auto mb-3"
              />
              <motion.h1
                initial={{ opacity: 0, scale: 1.04, y: 4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.5, ease: 'easeOut' }}
                style={{
                  fontSize: 'clamp(28px, 6vw, 48px)',
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                }}
              >
                You&apos;re on Traque Plus
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.45, ease: 'easeOut' }}
                style={{
                  fontSize: 'clamp(14px, 2.4vw, 18px)',
                  color: 'var(--muted-foreground)',
                }}
              >
                You now have access to AI chat for your exceptions. Get instant
                insights and start asking questions right away.
              </motion.p>

              <div className="mt-6 flex items-center justify-center gap-2">
                <Link to="/dashboard/chat">
                  <Button>Start AI chat</Button>
                </Link>
                <Link to="/dashboard">
                  <Button variant="outline">Open dashboard</Button>
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
