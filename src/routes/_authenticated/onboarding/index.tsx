import { createFileRoute, Link } from '@tanstack/react-router';
import confetti from 'canvas-confetti';
import { AnimatePresence, motion } from 'motion/react';
import { opacify } from 'polished';
import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { BlurredSpheresBackground } from '@/components/blurred-spheres-background';
import { ConfettiMinimalisticLinear } from '@/components/icons/confetti-minimalistic-linear';
import { NewOrganizationForm } from '@/components/onboarding-organization-form';
import { NewProjectForm } from '@/components/onboarding-project-form';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/_authenticated/onboarding/')({
  component: Onboarding,
});

function Step({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -40 }}
      transition={{ duration: 0.6 }}
    >
      {children}
    </motion.div>
  );
}

function Onboarding() {
  const [step, setStep] = useState<number>();

  useEffect(() => {
    const t1 = setTimeout(() => setStep(0), 200);
    const t2 = setTimeout(() => setStep(1), 3200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  useEffect(() => {
    if (step !== 3) return;

    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 70,
      });
    }, 1000);
  }, [step]);

  const spheres = useMemo(
    () => [
      {
        radius: 250,
        blur: 120,
        color: opacify(-0.7, '#7033ff'),
        animationRadius: 80,
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
            {step === 0 && (
              <Step key="intro-group">
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
                  Welcome to Traque
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
                  Simple, lightweight tracking for modern teams
                </motion.p>
              </Step>
            )}

            {step === 1 && (
              <Step key="new-organization-form">
                <NewOrganizationForm onStepChange={setStep} />
              </Step>
            )}

            {step === 2 && (
              <Step key="project-form">
                <NewProjectForm onStepChange={setStep} />
              </Step>
            )}

            {step === 3 && (
              <Step key="done">
                <div style={{ marginTop: 28, textAlign: 'center' }}>
                  <div className="flex justify-center mb-4">
                    <ConfettiMinimalisticLinear className="text-primary w-10 h-10" />
                  </div>
                  <div
                    style={{
                      fontSize: 'clamp(20px, 4.5vw, 32px)',
                      fontWeight: 700,
                      letterSpacing: '-0.02em',
                    }}
                  >
                    All done!
                  </div>
                  <div
                    style={{ marginTop: 8, color: 'var(--muted-foreground)' }}
                  >
                    Your workspace is ready. Open the dashboard to get started.
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <Link to={'/dashboard'}>
                      <Button
                        style={{
                          marginTop: 16,
                          paddingLeft: 16,
                          paddingRight: 16,
                        }}
                      >
                        Open dashboard
                      </Button>
                    </Link>
                  </div>
                </div>
              </Step>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
