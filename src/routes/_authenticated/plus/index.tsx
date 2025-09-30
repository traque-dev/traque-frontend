import {
  createFileRoute,
  Link,
  notFound,
  useRouter,
} from '@tanstack/react-router';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { opacify } from 'polished';
import { useEffect, useMemo, useState } from 'react';
import { useActiveSubscription } from '@/api/billing';
import { BlurredSpheresBackground } from '@/components/blurred-spheres-background';
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/auth';

export const Route = createFileRoute('/_authenticated/plus/')({
  component: PlusPage,
  loader: async ({ context }) => {
    const activeOrganization = await context.getActiveOrganization();

    if (!activeOrganization) {
      throw notFound({
        data: {
          type: 'organization',
        },
      });
    }

    return {
      activeOrganization,
    };
  },
});

function Step({ children }: { children: React.ReactNode }) {
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

function PlusPage() {
  const [step, setStep] = useState<number>();
  const router = useRouter();

  const { activeOrganization } = Route.useLoaderData();

  useEffect(() => {
    const t1 = setTimeout(() => setStep(0), 200);
    const t2 = setTimeout(() => setStep(1), 5200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

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

  const { data: subscription, isPending } = useActiveSubscription(
    activeOrganization?.id,
  );
  const isPlus = subscription?.plan === 'plus';

  return (
    <div style={{ position: 'relative', minHeight: '100dvh' }}>
      <div className="absolute left-3 top-3 z-20">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Close"
          onClick={() => router.history.back()}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <BlurredSpheresBackground spheres={spheres} />

      <div className="relative z-10 min-h-dvh flex items-center justify-center p-4">
        <div className="w-full max-w-xl text-center">
          <AnimatePresence mode="wait" initial={false}>
            {step === 0 && (
              <Step key="intro">
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
                  Welcome to Traque Plus
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
                  Traque Plus gives you access to chat with your exceptions and
                  get instant insights.
                </motion.p>
                <div className="mt-6">
                  <Button onClick={() => setStep(1)}>Continue</Button>
                </div>
              </Step>
            )}

            {step === 1 && (
              <Step key="subscribe">
                <div className="space-y-3">
                  <div
                    style={{
                      fontSize: 'clamp(22px, 5vw, 36px)',
                      fontWeight: 700,
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {isPlus
                      ? 'You are on Traque Plus'
                      : 'Upgrade to Traque Plus'}
                  </div>
                  <div className="text-muted-foreground">
                    {isPlus
                      ? 'Enjoy unlimited insights and AI chat for your exceptions.'
                      : 'Unlock AI chat for your exceptions and more.'}
                  </div>

                  <div className="flex items-center justify-center gap-2 pt-2">
                    {isPlus ? (
                      <>
                        <Link to="/dashboard">
                          <Button>Open dashboard</Button>
                        </Link>
                        <Button
                          variant="outline"
                          onClick={async () => {
                            try {
                              await auth.customer.portal();
                            } catch (_) {}
                          }}
                        >
                          Manage subscription
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          disabled={isPending || !activeOrganization?.id}
                          onClick={async () => {
                            try {
                              await auth.checkout({
                                slug: 'plus',
                                referenceId: activeOrganization!.id,
                              });
                            } catch (_) {}
                          }}
                        >
                          Subscribe to Plus
                        </Button>
                        <Button variant="ghost" onClick={() => setStep(0)}>
                          Back
                        </Button>
                      </>
                    )}
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
