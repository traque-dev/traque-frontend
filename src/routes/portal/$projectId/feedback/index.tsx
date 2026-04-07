import { useForm } from '@tanstack/react-form';
import { createFileRoute } from '@tanstack/react-router';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Lightbulb,
  Loader2,
  Mail,
  MessageSquarePlus,
  Paperclip,
  Plus,
  Rocket,
  RotateCcw,
  Sparkles,
  User,
  Zap,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useId, useState } from 'react';
import { submitPublicFeedback } from '@/api/feedback';
import { uploadFile } from '@/api/files';
import { ErrorMessage } from '@/components/error-message';
import { FileUpload } from '@/components/file-upload';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { FeedbackType } from '@/types/feedback';

export const Route = createFileRoute('/portal/$projectId/feedback/')({
  component: SubmitFeedbackPage,
});

const STEPS = [
  { label: 'Type', description: 'What kind of feedback?' },
  { label: 'Details', description: 'Tell us more' },
  { label: 'About you', description: 'Optional contact info' },
  { label: 'Review', description: 'Confirm & submit' },
] as const;

const MAX_FILE_SIZE_MB = 10;
const MAX_FILES = 5;

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const FEEDBACK_TYPES: {
  value: FeedbackType;
  label: string;
  description: string;
  icon: typeof Lightbulb;
  bg: string;
  border: string;
  text: string;
  iconColor: string;
}[] = [
  {
    value: 'IDEA',
    label: 'Idea',
    description: 'A brand new concept or suggestion',
    icon: Lightbulb,
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    border: 'border-amber-300 dark:border-amber-800',
    text: 'text-amber-700 dark:text-amber-400',
    iconColor: 'text-amber-500',
  },
  {
    value: 'FEATURE_REQUEST',
    label: 'Feature Request',
    description: "Something you'd like us to build",
    icon: Sparkles,
    bg: 'bg-violet-50 dark:bg-violet-950/30',
    border: 'border-violet-300 dark:border-violet-800',
    text: 'text-violet-700 dark:text-violet-400',
    iconColor: 'text-violet-500',
  },
  {
    value: 'IMPROVEMENT',
    label: 'Improvement',
    description: 'Make an existing feature better',
    icon: Rocket,
    bg: 'bg-sky-50 dark:bg-sky-950/30',
    border: 'border-sky-300 dark:border-sky-800',
    text: 'text-sky-700 dark:text-sky-400',
    iconColor: 'text-sky-500',
  },
  {
    value: 'GENERAL',
    label: 'General',
    description: 'Any other thoughts or comments',
    icon: Zap,
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    border: 'border-emerald-300 dark:border-emerald-800',
    text: 'text-emerald-700 dark:text-emerald-400',
    iconColor: 'text-emerald-500',
  },
];

const SLIDE = {
  enter: (d: number) => ({ x: d > 0 ? 48 : -48, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (d: number) => ({ x: d < 0 ? 48 : -48, opacity: 0 }),
};

const SPRING = { duration: 0.28, ease: [0.32, 0.72, 0, 1] } as const;

type FormValues = {
  type: FeedbackType | '';
  title: string;
  description: string;
  submitterName: string;
  submitterEmail: string;
};

function TypeGrid({
  value,
  onChange,
}: {
  value: FeedbackType | '';
  onChange: (v: FeedbackType) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
      {FEEDBACK_TYPES.map((t) => {
        const Icon = t.icon;
        return (
          <button
            key={t.value}
            type="button"
            onClick={() => onChange(t.value)}
            className={cn(
              'group flex items-start gap-3 rounded-xl border p-4 text-left transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
              value === t.value
                ? `${t.bg} ${t.border} ${t.text}`
                : 'border-border bg-background text-muted-foreground hover:bg-accent/50 hover:text-foreground',
            )}
          >
            <span
              className={cn(
                'flex size-9 flex-shrink-0 items-center justify-center rounded-lg transition-colors',
                value === t.value
                  ? `${t.bg} ${t.iconColor}`
                  : 'bg-muted text-muted-foreground group-hover:text-foreground',
              )}
            >
              <Icon className="size-4.5" />
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{t.label}</span>
                {value === t.value && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      duration: 0.15,
                      ease: [0.34, 1.56, 0.64, 1],
                    }}
                  >
                    <CheckCircle2 className="size-3.5" />
                  </motion.span>
                )}
              </div>
              <p className="text-xs mt-0.5 opacity-75 leading-snug">
                {t.description}
              </p>
            </div>
          </button>
        );
      })}
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

function TypeBadge({ type }: { type: FeedbackType | '' }) {
  const t = FEEDBACK_TYPES.find((x) => x.value === type);
  if (!t) return null;
  const Icon = t.icon;
  return (
    <Badge className={cn('border font-medium gap-1.5', t.bg, t.border, t.text)}>
      <Icon className="size-3" />
      {t.label}
    </Badge>
  );
}

function SubmitFeedbackPage() {
  const { projectId } = Route.useParams();
  const uid = useId();

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'form' | 'success' | 'error'>('form');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);

  const form = useForm({
    defaultValues: {
      type: '' as FeedbackType | '',
      title: '',
      description: '',
      submitterName: '',
      submitterEmail: '',
    } satisfies FormValues,
    onSubmit: async ({ value }) => {
      try {
        let fileIds: string[] | undefined;

        if (attachedFiles.length > 0) {
          const uploaded = await Promise.all(
            attachedFiles.map((file) =>
              uploadFile({ file, purpose: 'FEEDBACK' }),
            ),
          );
          fileIds = uploaded.map((f) => f.id);
        }

        await submitPublicFeedback(projectId, {
          title: value.title,
          type: value.type as FeedbackType,
          description: value.description || undefined,
          submitterName: value.submitterName || undefined,
          submitterEmail: value.submitterEmail || undefined,
          fileIds,
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
    if (!form.store.state.values.type) errs.type = 'Please select a type';
    setStepErrors(errs);
    return !Object.keys(errs).length;
  };

  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!form.store.state.values.title.trim()) errs.title = 'Title is required';
    setStepErrors(errs);
    return !Object.keys(errs).length;
  };

  const handleNext = () => {
    if (step === 0 && !validateStep0()) return;
    if (step === 1 && !validateStep1()) return;
    setStepErrors({});
    if (step < STEPS.length - 1) navigate(step + 1);
  };

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
            <h1 className="text-2xl font-bold tracking-tight">
              Feedback submitted!
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Thank you for sharing your thoughts. Your feedback helps us build
              a better product.
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
                setAttachedFiles([]);
                setStep(0);
                setStatus('form');
              }}
            >
              <Plus className="size-4" />
              Submit more feedback
            </Button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

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
                navigate(STEPS.length - 1);
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

  return (
    <div className="flex min-h-svh items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-lg space-y-8">
        <motion.div
          className="space-y-2 text-center"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center justify-center gap-2 mb-1">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                delay: 0.1,
                duration: 0.4,
                ease: [0.34, 1.56, 0.64, 1],
              }}
            >
              <MessageSquarePlus className="size-7 text-primary" />
            </motion.div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Share Feedback</h1>
          <p className="text-sm text-muted-foreground">
            Your ideas and suggestions help us improve
          </p>
        </motion.div>

        <motion.div
          className="rounded-2xl border bg-card shadow-sm overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
        >
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

            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-border/60">
              <motion.div
                className="h-full bg-primary"
                animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
              />
            </div>
          </div>

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
                {step === 0 && (
                  <div className="space-y-4">
                    <form.Field name="type">
                      {(field) => (
                        <div className="space-y-2">
                          <Label>
                            What type of feedback is this?{' '}
                            <span className="text-destructive" aria-hidden>
                              *
                            </span>
                          </Label>
                          <TypeGrid
                            value={field.state.value}
                            onChange={(v) => {
                              field.handleChange(v);
                              if (stepErrors.type)
                                setStepErrors(({ type: _t, ...rest }) => rest);
                            }}
                          />
                          <ErrorMessage message={stepErrors.type} />
                        </div>
                      )}
                    </form.Field>
                  </div>
                )}

                {step === 1 && (
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
                            placeholder="e.g. Add dark mode support"
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
                            placeholder="Share as much detail as you'd like…"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            className="min-h-[100px] resize-none"
                          />
                        </div>
                      )}
                    </form.Field>

                    <div className="space-y-1.5">
                      <Label>
                        Attachments{' '}
                        <span className="text-[11px] font-normal text-muted-foreground">
                          (optional)
                        </span>
                      </Label>
                      <FileUpload
                        files={attachedFiles}
                        onChange={setAttachedFiles}
                        maxFiles={MAX_FILES}
                        maxFileSizeMb={MAX_FILE_SIZE_MB}
                        hint="Screenshots or files that help explain your feedback"
                      />
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-5">
                    <motion.div
                      className="rounded-xl border border-dashed bg-muted/20 p-4 text-center"
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.25 }}
                    >
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        This is{' '}
                        <span className="font-medium">completely optional</span>
                        . If you'd like us to follow up, leave your contact info
                        below.
                      </p>
                    </motion.div>

                    <form.Field name="submitterName">
                      {(field) => (
                        <div className="space-y-1.5">
                          <Label htmlFor={`${uid}-name`}>
                            <span className="inline-flex items-center gap-1.5">
                              <User className="size-3.5 text-muted-foreground" />
                              Name
                            </span>
                          </Label>
                          <Input
                            id={`${uid}-name`}
                            autoFocus
                            placeholder="Jane Doe"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                          />
                        </div>
                      )}
                    </form.Field>

                    <form.Field name="submitterEmail">
                      {(field) => (
                        <div className="space-y-1.5">
                          <Label htmlFor={`${uid}-email`}>
                            <span className="inline-flex items-center gap-1.5">
                              <Mail className="size-3.5 text-muted-foreground" />
                              Email
                            </span>
                          </Label>
                          <Input
                            id={`${uid}-email`}
                            type="email"
                            placeholder="jane@example.com"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                          />
                        </div>
                      )}
                    </form.Field>
                  </div>
                )}

                {step === 3 && (
                  <form.Subscribe selector={(s) => s.values}>
                    {(values) => (
                      <div className="space-y-5">
                        <div>
                          <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                            Feedback
                          </p>
                          <div className="rounded-xl border bg-muted/20 p-4">
                            <div className="py-2.5 first:pt-0 border-b border-border/50">
                              <span className="block text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-1">
                                Type
                              </span>
                              <TypeBadge type={values.type} />
                            </div>
                            <ReviewRow label="Title" value={values.title} />
                            <ReviewRow
                              label="Description"
                              value={values.description}
                            />
                          </div>
                        </div>

                        {(values.submitterName || values.submitterEmail) && (
                          <>
                            <Separator />
                            <div>
                              <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                                Contact
                              </p>
                              <div className="rounded-xl border bg-muted/20 p-4">
                                <ReviewRow
                                  label="Name"
                                  value={values.submitterName}
                                />
                                <ReviewRow
                                  label="Email"
                                  value={values.submitterEmail}
                                />
                              </div>
                            </div>
                          </>
                        )}

                        {attachedFiles.length > 0 && (
                          <>
                            <Separator />
                            <div>
                              <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                                Attachments
                              </p>
                              <div className="rounded-xl border bg-muted/20 p-3 space-y-2">
                                {attachedFiles.map((file) => (
                                  <div
                                    key={`${file.name}-${file.size}`}
                                    className="flex items-center gap-2.5 text-sm"
                                  >
                                    <Paperclip className="size-3.5 flex-shrink-0 text-muted-foreground" />
                                    <span className="truncate flex-1">
                                      {file.name}
                                    </span>
                                    <span className="text-xs text-muted-foreground flex-shrink-0">
                                      {formatFileSize(file.size)}
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
                        Submit Feedback
                      </>
                    )}
                  </Button>
                )}
              </form.Subscribe>
            )}
          </div>
        </motion.div>

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
