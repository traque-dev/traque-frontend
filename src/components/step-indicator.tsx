import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type Props = {
  current: number;
  steps: {
    label: string;
    description: string;
  }[];
};

export function StepIndicator({ current, steps }: Props) {
  return (
    <div className="flex items-center justify-center gap-0 w-full px-2">
      {steps.map((s, i) => (
        <div key={s.label} className="flex items-center">
          <div className="flex flex-col items-center gap-1.5">
            <motion.div
              className={cn(
                'relative flex size-8 items-center justify-center rounded-full border-2 text-xs font-semibold',
                i < current &&
                  'border-primary bg-primary text-primary-foreground',
                i === current &&
                  'border-primary bg-background text-primary shadow-[0_0_0_4px_hsl(var(--primary)/0.12)]',
                i > current &&
                  'border-border bg-background text-muted-foreground',
              )}
              animate={{ scale: i === current ? 1.08 : 1 }}
              transition={{ duration: 0.25 }}
            >
              <AnimatePresence mode="wait" initial={false}>
                {i < current ? (
                  <motion.svg
                    key="check"
                    className="size-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </motion.svg>
                ) : (
                  <motion.span
                    key="num"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    {i + 1}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
            <span
              className={cn(
                'hidden sm:block text-[10px] font-medium transition-colors whitespace-nowrap',
                i === current ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              {s.label}
            </span>
          </div>

          {i < steps.length - 1 && (
            <div className="relative mx-2 mb-[18px] sm:mb-[22px] h-[2px] w-12 sm:w-16 overflow-hidden rounded-full bg-border">
              <motion.div
                className="absolute inset-y-0 left-0 bg-primary rounded-full"
                animate={{ width: i < current ? '100%' : '0%' }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
