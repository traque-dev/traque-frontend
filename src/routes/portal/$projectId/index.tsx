import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowRight, Bug, MessageSquarePlus } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/portal/$projectId/')({
  component: PortalHomePage,
});

const SPRING = { duration: 0.5, ease: [0.32, 0.72, 0, 1] } as const;

const OPTIONS = [
  {
    to: '/portal/$projectId/bug' as const,
    icon: Bug,
    title: 'Report a Bug',
    description:
      'Found something broken? Let us know so we can fix it quickly.',
    gradient: 'from-red-500/10 to-orange-500/10',
    darkGradient: 'dark:from-red-500/15 dark:to-orange-500/15',
    iconBg: 'bg-red-100 dark:bg-red-950/60',
    iconColor: 'text-red-600 dark:text-red-400',
    hoverBorder: 'hover:border-red-300 dark:hover:border-red-800',
    ring: 'focus-visible:ring-red-500/30',
  },
  {
    to: '/portal/$projectId/feedback' as const,
    icon: MessageSquarePlus,
    title: 'Share Feedback',
    description:
      'Have an idea or suggestion? Help us build a better product for you.',
    gradient: 'from-violet-500/10 to-indigo-500/10',
    darkGradient: 'dark:from-violet-500/15 dark:to-indigo-500/15',
    iconBg: 'bg-violet-100 dark:bg-violet-950/60',
    iconColor: 'text-violet-600 dark:text-violet-400',
    hoverBorder: 'hover:border-violet-300 dark:hover:border-violet-800',
    ring: 'focus-visible:ring-violet-500/30',
  },
] as const;

function PortalHomePage() {
  const { projectId } = Route.useParams();

  return (
    <div className="flex min-h-svh items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-2xl space-y-10">
        <motion.div
          className="space-y-3 text-center"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={SPRING}
        >
          <motion.div
            className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10"
            initial={{ scale: 0, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              delay: 0.1,
              duration: 0.5,
              ease: [0.34, 1.56, 0.64, 1],
            }}
          >
            <span className="text-2xl font-bold text-primary select-none">
              ?
            </span>
          </motion.div>

          <h1 className="text-3xl font-bold tracking-tight">
            How can we help?
          </h1>
          <p className="text-muted-foreground text-base max-w-md mx-auto">
            Choose an option below to get started
          </p>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2">
          {OPTIONS.map((option, i) => {
            const Icon = option.icon;
            return (
              <motion.div
                key={option.to}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...SPRING, delay: 0.15 + i * 0.1 }}
              >
                <Link
                  to={option.to}
                  params={{ projectId }}
                  className={cn(
                    'group relative flex flex-col gap-5 rounded-2xl border bg-card p-6 transition-all duration-200',
                    'hover:shadow-lg hover:-translate-y-0.5',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                    option.hoverBorder,
                    option.ring,
                  )}
                >
                  <div
                    className={cn(
                      'pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100',
                      option.gradient,
                      option.darkGradient,
                    )}
                  />

                  <div className="relative flex items-start justify-between">
                    <div
                      className={cn(
                        'flex size-12 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105',
                        option.iconBg,
                      )}
                    >
                      <Icon className={cn('size-6', option.iconColor)} />
                    </div>
                    <ArrowRight className="size-5 text-muted-foreground/40 transition-all duration-200 group-hover:text-foreground group-hover:translate-x-0.5" />
                  </div>

                  <div className="relative space-y-1.5">
                    <h2 className="text-lg font-semibold tracking-tight">
                      {option.title}
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {option.description}
                    </p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <motion.p
          className="text-center text-xs text-muted-foreground/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Powered by Traque
        </motion.p>
      </div>
    </div>
  );
}
