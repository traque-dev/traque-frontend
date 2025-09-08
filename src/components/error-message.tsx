import { AnimatePresence, motion } from 'motion/react';
import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type ErrorMessageProps = {
  message?: ReactNode;
  children?: ReactNode;
  className?: string;
  id?: string;
  role?: 'alert' | 'status';
};

function ErrorMessage({
  message,
  children,
  className,
  id,
  role = 'alert',
}: ErrorMessageProps) {
  const body = children ?? message;

  return (
    <AnimatePresence initial={false} mode="wait">
      {body ? (
        <motion.p
          key="error-message"
          id={id}
          role={role}
          aria-live={role === 'alert' ? 'assertive' : 'polite'}
          className={cn('text-destructive text-[12px]', className)}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
        >
          {body}
        </motion.p>
      ) : null}
    </AnimatePresence>
  );
}

export { ErrorMessage };
