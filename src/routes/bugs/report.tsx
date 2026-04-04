import { useForm } from '@tanstack/react-form';
import { createFileRoute } from '@tanstack/react-router';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Plus,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useId, useState } from 'react';
import { z } from 'zod/v4';
import { captureBug } from '@/api/bugs';
import { ErrorMessage } from '@/components/error-message';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { BugPriority } from '@/types/bug';

export const Route = createFileRoute('/bugs/report')({
  validateSearch: z.object({
    key: z.string(),
  }),
  component: ReportBugPage,
});

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STEPS = [
  { label: 'Details', description: 'What is the bug?' },
  { label: 'Context', description: 'What were you doing?' },
  { label: 'Steps', description: 'How to reproduce?' },
  { label: 'Review', description: 'Confirm & submit' },
] as const;

const PRIORITIES: {
  value: BugPriority;
  label: string;
  dot: string;
  bg: string;
  border: string;
  text: string;
}[] = [
  {
    value: 'CRITICAL',
    label: 'Critical',
    dot: 'bg-red-500',
    bg: 'bg-red-50 dark:bg-red-950/30',
    border: 'border-red-300 dark:border-red-800',
    text: 'text-red-700 dark:text-red-400',
  },
  {
    value: 'HIGH',
    label: 'High',
    dot: 'bg-orange-500',
    bg: 'bg-orange-50 dark:bg-orange-950/30',
    border: 'border-orange-300 dark:border-orange-800',
    text: 'text-orange-700 dark:text-orange-400',
  },
  {
    value: 'MEDIUM',
    label: 'Medium',
    dot: 'bg-yellow-500',
    bg: 'bg-yellow-50 dark:bg-yellow-950/30',
    border: 'border-yellow-300 dark:border-yellow-800',
    text: 'text-yellow-700 dark:text-yellow-400',
  },
  {
    value: 'LOW',
    label: 'Low',
    dot: 'bg-green-500',
    bg: 'bg-green-50 dark:bg-green-950/30',
    border: 'border-green-300 dark:border-green-800',
    text: 'text-green-700 dark:text-green-400',
  },
];

const SLIDE = {
  enter: (d: number) => ({ x: d > 0 ? 48 : -48, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (d: number) => ({ x: d < 0 ? 48 : -48, opacity: 0 }),
};

const SPRING = { duration: 0.28, ease: [0.32, 0.72, 0, 1] } as const;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ReproStep = { id: string; description: string };

type FormValues = {
  title: string;
  priority: BugPriority | '';
  description: string;
  environment: string;
  expectedBehavior: string;
  actualBehavior: string;
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function PriorityGrid({
  value,
  onChange,
}: {
  value: BugPriority | '';
  onChange: (v: BugPriority) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {PRIORITIES.map((p) => (
        <button
          key={p.value}
          type="button"
          onClick={() => onChange(p.value)}
          className={cn(
            'group flex items-center gap-2.5 rounded-lg border p-3 text-left text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
            value === p.value
              ? `${p.bg} ${p.border} ${p.text}`
              : 'border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground',
          )}
        >
          <span
            className={cn(
              'size-2.5 flex-shrink-0 rounded-full transition-transform group-hover:scale-110',
              p.dot,
            )}
          />
          {p.label}
          {value === p.value && (
            <motion.span
              className="ml-auto"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <CheckCircle2 className="size-3.5" />
            </motion.span>
          )}
        </button>
      ))}
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="grid gap-0.5 py-2.5 first:pt-0 last:pb-0 [&:not(:last-child)]:border-b border-border/50">
      <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {value ? (
        <span className="text-sm leading-relaxed">{value}</span>
      ) : (
        <span className="text-sm italic text-muted-foreground/60">
          Not provided
        </span>
      )}
    </div>
  );
}

function PriorityBadge({ priority }: { priority: BugPriority | '' }) {
  const p = PRIORITIES.find((x) => x.value === priority);
  if (!p) return null;
  return (
    <Badge className={cn('border font-medium', p.bg, p.border, p.text)}>
      <span className={cn('size-1.5 rounded-full', p.dot)} />
      {p.label}
    </Badge>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

function ReportBugPage() {
  const { key } = Route.useSearch();
  const uid = useId();

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [reproSteps, setReproSteps] = useState<ReproStep[]>([]);
  const [newStepText, setNewStepText] = useState('');
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'form' | 'success' | 'error'>('form');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      title: '',
      priority: '' as BugPriority | '',
      description: '',
      environment: '',
      expectedBehavior: '',
      actualBehavior: '',
    } satisfies FormValues,
    onSubmit: async ({ value }) => {
      try {
        await captureBug(key, {
          title: value.title,
          priority: (value.priority as BugPriority) || undefined,
          description: value.description || undefined,
          environment: value.environment || undefined,
          expectedBehavior: value.expectedBehavior || undefined,
          actualBehavior: value.actualBehavior || undefined,
          steps:
            reproSteps.length > 0
              ? reproSteps.map((s, i) => ({
                  description: s.description,
                  order: i + 1,
                }))
              : undefined,
        });
        setStatus('success');
      } catch (err) {
        setSubmitError(
          err instanceof Error
            ? err.message
            : 'Something went wrong. Please try again.',
        );
        setStatus('error');
      }
    },
  });

  const navigate = (next: number) => {
    setDirection(next > step ? 1 : -1);
    setStep(next);
  };

  const validateStep0 = () => {
    const errs: Record<string, string> = {};
    if (!form.store.state.values.title.trim()) errs.title = 'Title is required';
    if (!form.store.state.values.priority)
      errs.priority = 'Please select a priority level';
    setStepErrors(errs);
    return !Object.keys(errs).length;
  };

  const handleNext = () => {
    if (step === 0 && !validateStep0()) return;
    setStepErrors({});
    if (step < STEPS.length - 1) navigate(step + 1);
  };

  const addStep = () => {
    if (!newStepText.trim()) return;
    setReproSteps((prev) => [
      ...prev,
      { id: crypto.randomUUID(), description: newStepText.trim() },
    ]);
    setNewStepText('');
  };

  // ---- Success screen ----
  if (status === 'success') {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background px-4">
        <motion.div
          className="flex flex-col items-center gap-6 text-center max-w-sm w-full"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="relative flex size-24 items-center justify-center"
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              delay: 0.15,
              duration: 0.5,
              ease: [0.34, 1.56, 0.64, 1],
            }}
          >
            <div className="absolute inset-0 rounded-full bg-green-100 dark:bg-green-950" />
            <motion.div
              className="absolute inset-0 rounded-full bg-green-100/60 dark:bg-green-950/60"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ delay: 0.5, duration: 1.2, repeat: 1 }}
            />
            <CheckCircle2 className="relative size-12 text-green-600 dark:text-green-400" />
          </motion.div>

          <motion.div
            className="space-y-2"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h1 className="text-2xl font-bold tracking-tight">Bug reported!</h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Your report has been received. Our team will review it and follow
              up shortly.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
          >
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => {
                form.reset();
                setReproSteps([]);
                setNewStepText('');
                setStep(0);
                setStatus('form');
              }}
            >
              <Plus className="size-4" />
              Submit another report
            </Button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // ---- Error screen ----
  if (status === 'error') {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background px-4">
        <motion.div
          className="flex flex-col items-center gap-6 text-center max-w-sm w-full"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex size-24 items-center justify-center rounded-full bg-red-100 dark:bg-red-950">
            <AlertCircle className="size-12 text-red-600 dark:text-red-400" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">
              Submission failed
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {submitError}
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => {
                setStatus('form');
                navigate(3);
              }}
            >
              <ArrowLeft className="size-4" />
              Back to review
            </Button>
            <Button
              className="gap-2"
              onClick={() => {
                setStatus('form');
                form.handleSubmit();
              }}
            >
              <RotateCcw className="size-4" />
              Try again
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ---- Form ----
  return (
    <div className="flex min-h-svh items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-lg space-y-8">
        {/* Brand header */}
        <motion.div
          className="space-y-2 text-center"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-2xl font-bold tracking-tight">Report a Bug</h1>
          <p className="text-sm text-muted-foreground">
            Help us improve by describing the issue you found
          </p>
        </motion.div>

        {/* Stepper */}
        {/* <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <StepIndicator current={step} />
        </motion.div> */}

        {/* Card */}
        <motion.div
          className="rounded-2xl border bg-card shadow-sm overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
        >
          {/* Step header */}
          <div className="relative overflow-hidden px-6 py-4 border-b bg-muted/20">
            <AnimatePresence mode="wait" initial={false} custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                variants={SLIDE}
                initial="enter"
                animate="center"
                exit="exit"
                transition={SPRING}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Step {step + 1} of {STEPS.length}
                    </p>
                    <h2 className="text-base font-semibold leading-tight mt-0.5">
                      {STEPS[step].label}
                    </h2>
                  </div>
                  <p className="text-xs text-muted-foreground hidden sm:block">
                    {STEPS[step].description}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Progress bar */}
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-border/60">
              <motion.div
                className="h-full bg-primary"
                animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
              />
            </div>
          </div>

          {/* Step body */}
          <div className="overflow-hidden min-h-[320px]">
            <AnimatePresence mode="wait" initial={false} custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                variants={SLIDE}
                initial="enter"
                animate="center"
                exit="exit"
                transition={SPRING}
                className="px-6 py-6"
              >
                {/* ── Step 1: Details ── */}
                {step === 0 && (
                  <div className="space-y-5">
                    <form.Field name="title">
                      {(field) => (
                        <div className="space-y-1.5">
                          <Label htmlFor={`${uid}-title`}>
                            Title{' '}
                            <span className="text-destructive" aria-hidden>
                              *
                            </span>
                          </Label>
                          <Input
                            id={`${uid}-title`}
                            autoFocus
                            placeholder="e.g. Login button unresponsive on Safari"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => {
                              field.handleChange(e.target.value);
                              if (stepErrors.title)
                                setStepErrors(({ title: _t, ...rest }) => rest);
                            }}
                            aria-invalid={!!stepErrors.title}
                          />
                          <ErrorMessage message={stepErrors.title} />
                        </div>
                      )}
                    </form.Field>

                    <form.Field name="priority">
                      {(field) => (
                        <div className="space-y-1.5">
                          <Label>
                            Priority{' '}
                            <span className="text-destructive" aria-hidden>
                              *
                            </span>
                          </Label>
                          <PriorityGrid
                            value={field.state.value}
                            onChange={(v) => {
                              field.handleChange(v);
                              if (stepErrors.priority)
                                setStepErrors(
                                  ({ priority: _p, ...rest }) => rest,
                                );
                            }}
                          />
                          <ErrorMessage message={stepErrors.priority} />
                        </div>
                      )}
                    </form.Field>

                    <form.Field name="description">
                      {(field) => (
                        <div className="space-y-1.5">
                          <Label htmlFor={`${uid}-desc`}>
                            Description{' '}
                            <span className="text-[11px] font-normal text-muted-foreground">
                              (optional)
                            </span>
                          </Label>
                          <Textarea
                            id={`${uid}-desc`}
                            placeholder="Any additional context about the bug…"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            className="min-h-[80px] resize-none"
                          />
                        </div>
                      )}
                    </form.Field>
                  </div>
                )}

                {/* ── Step 2: Context ── */}
                {step === 1 && (
                  <div className="space-y-5">
                    <form.Field name="environment">
                      {(field) => (
                        <div className="space-y-1.5">
                          <Label htmlFor={`${uid}-env`}>
                            Environment{' '}
                            <span className="text-[11px] font-normal text-muted-foreground">
                              (optional)
                            </span>
                          </Label>
                          <Input
                            id={`${uid}-env`}
                            autoFocus
                            placeholder="e.g. Production · Chrome 123 · macOS 14"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                          />
                        </div>
                      )}
                    </form.Field>

                    <form.Field name="expectedBehavior">
                      {(field) => (
                        <div className="space-y-1.5">
                          <Label htmlFor={`${uid}-expected`}>
                            Expected Behavior{' '}
                            <span className="text-[11px] font-normal text-muted-foreground">
                              (optional)
                            </span>
                          </Label>
                          <Textarea
                            id={`${uid}-expected`}
                            placeholder="What should have happened?"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            className="min-h-[80px] resize-none"
                          />
                        </div>
                      )}
                    </form.Field>

                    <form.Field name="actualBehavior">
                      {(field) => (
                        <div className="space-y-1.5">
                          <Label htmlFor={`${uid}-actual`}>
                            Actual Behavior{' '}
                            <span className="text-[11px] font-normal text-muted-foreground">
                              (optional)
                            </span>
                          </Label>
                          <Textarea
                            id={`${uid}-actual`}
                            placeholder="What actually happened?"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            className="min-h-[80px] resize-none"
                          />
                        </div>
                      )}
                    </form.Field>
                  </div>
                )}

                {/* ── Step 3: Reproduction Steps ── */}
                {step === 2 && (
                  <div className="space-y-4">
                    <AnimatePresence initial={false}>
                      {reproSteps.length > 0 ? (
                        <motion.div
                          key="list"
                          className="space-y-2"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <AnimatePresence initial={false}>
                            {reproSteps.map((s, i) => (
                              <motion.div
                                key={s.id}
                                initial={{
                                  opacity: 0,
                                  height: 0,
                                  marginBottom: 0,
                                }}
                                animate={{
                                  opacity: 1,
                                  height: 'auto',
                                  marginBottom: 8,
                                }}
                                exit={{
                                  opacity: 0,
                                  height: 0,
                                  marginBottom: 0,
                                }}
                                transition={{ duration: 0.22 }}
                                className="overflow-hidden"
                              >
                                <div className="flex items-start gap-3 rounded-xl border bg-muted/30 p-3.5">
                                  <span className="flex size-5 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary mt-0.5">
                                    {i + 1}
                                  </span>
                                  <p className="flex-1 text-sm leading-relaxed break-words">
                                    {s.description}
                                  </p>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setReproSteps((prev) =>
                                        prev.filter((x) => x.id !== s.id),
                                      )
                                    }
                                    className="flex-shrink-0 mt-0.5 text-muted-foreground/60 hover:text-destructive transition-colors"
                                    aria-label="Remove step"
                                  >
                                    <Trash2 className="size-3.5" />
                                  </button>
                                </div>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="empty"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex flex-col items-center gap-1.5 rounded-xl border border-dashed py-8 text-center"
                        >
                          <p className="text-sm font-medium text-muted-foreground">
                            No steps added yet
                          </p>
                          <p className="text-xs text-muted-foreground/60 max-w-[240px]">
                            Steps help developers reproduce and fix the bug
                            faster
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="flex gap-2">
                      <Input
                        autoFocus
                        placeholder="Describe a step to reproduce…"
                        value={newStepText}
                        onChange={(e) => setNewStepText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addStep();
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={addStep}
                        disabled={!newStepText.trim()}
                        className="flex-shrink-0"
                      >
                        <Plus className="size-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Press{' '}
                      <kbd className="rounded border bg-muted px-1 py-0.5 font-mono text-[10px]">
                        Enter
                      </kbd>{' '}
                      or click <span className="font-medium">+</span> to add a
                      step
                    </p>
                  </div>
                )}

                {/* ── Step 4: Review ── */}
                {step === 3 && (
                  <form.Subscribe selector={(s) => s.values}>
                    {(values) => (
                      <div className="space-y-5">
                        {/* Details section */}
                        <div>
                          <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                            Bug Details
                          </p>
                          <div className="rounded-xl border bg-muted/20 p-4">
                            <ReviewRow label="Title" value={values.title} />
                            <div className="py-2.5 border-b border-border/50">
                              <span className="block text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-1">
                                Priority
                              </span>
                              <PriorityBadge priority={values.priority} />
                            </div>
                            <ReviewRow
                              label="Description"
                              value={values.description}
                            />
                          </div>
                        </div>

                        <Separator />

                        {/* Context section */}
                        <div>
                          <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                            Context
                          </p>
                          <div className="rounded-xl border bg-muted/20 p-4">
                            <ReviewRow
                              label="Environment"
                              value={values.environment}
                            />
                            <ReviewRow
                              label="Expected Behavior"
                              value={values.expectedBehavior}
                            />
                            <ReviewRow
                              label="Actual Behavior"
                              value={values.actualBehavior}
                            />
                          </div>
                        </div>

                        {/* Steps section */}
                        {reproSteps.length > 0 && (
                          <>
                            <Separator />
                            <div>
                              <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                                Reproduction Steps
                              </p>
                              <div className="rounded-xl border bg-muted/20 p-4 py-3 space-y-2">
                                {reproSteps.map((s, i) => (
                                  <div
                                    key={s.id}
                                    className="flex gap-2.5 text-sm"
                                  >
                                    <span className="flex-shrink-0 font-semibold text-muted-foreground tabular-nums">
                                      {i + 1}.
                                    </span>
                                    <span className="leading-relaxed">
                                      {s.description}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </form.Subscribe>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer navigation */}
          <div className="flex items-center justify-between border-t bg-muted/10 px-6 py-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => navigate(step - 1)}
              className={cn(
                'gap-1.5',
                step === 0 && 'invisible pointer-events-none',
              )}
            >
              <ArrowLeft className="size-4" />
              Back
            </Button>

            {step < STEPS.length - 1 ? (
              <Button
                type="button"
                size="sm"
                onClick={handleNext}
                className="gap-1.5"
              >
                Continue
                <ArrowRight className="size-4" />
              </Button>
            ) : (
              <form.Subscribe selector={(s) => s.isSubmitting}>
                {(isSubmitting) => (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => form.handleSubmit()}
                    disabled={isSubmitting}
                    className="gap-1.5 min-w-[140px]"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Submitting…
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="size-4" />
                        Submit Report
                      </>
                    )}
                  </Button>
                )}
              </form.Subscribe>
            )}
          </div>
        </motion.div>

        {/* Required note */}
        <motion.p
          className="text-center text-xs text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          Fields marked <span className="text-destructive font-medium">*</span>{' '}
          are required
        </motion.p>
      </div>
    </div>
  );
}
