import { revalidateLogic, useForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { type } from 'arktype';
import { AnimatePresence, motion } from 'motion/react';
import { useMemo } from 'react';
import { ConfettiMinimalisticLinear } from '@/components/icons';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { auth } from '@/lib/auth';

export const Route = createFileRoute('/auth/reset-password')({
  component: ResetPasswordPage,
  validateSearch: type({
    'token?': 'string',
    'error?': 'string',
  }),
});

const resetPasswordSchema = type({
  password: type('string >= 8').configure({
    message: 'Password must be at least 8 characters long',
  }),
  confirmPassword: type('string >= 8').configure({
    message: 'Passwords do not match',
  }),
}).narrow((data, ctx) => {
  if (data.password === data.confirmPassword) {
    return true;
  }

  return ctx.reject({
    expected: 'identical to password',
    message: 'Passwords do not match',
    actual: '',
    path: ['confirmPassword'],
  });
});

type ResetPasswordFormValues = typeof resetPasswordSchema.infer;

function ResetPasswordPage() {
  const navigate = useNavigate();
  const { token, error: errorParam } = Route.useSearch();

  const disabledByToken = useMemo(
    () => !token || !!errorParam,
    [token, errorParam],
  );

  const form = useForm({
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
    validationLogic: revalidateLogic({
      mode: 'submit',
      modeAfterSubmission: 'blur',
    }),
    validators: {
      onDynamic: resetPasswordSchema,
    },
    onSubmit: async ({ value }) => {
      await resetPasswordMutation.mutateAsync(value);
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (values: ResetPasswordFormValues) => {
      if (!token) throw new Error('Invalid or expired link');

      const { data, error } = await auth.resetPassword({
        newPassword: values.password,
        token,
      });

      if (error) {
        throw new Error(error.message ?? 'Failed to reset password');
      }

      return data;
    },
    onSuccess: () => {
      form.reset();
    },
  });

  const isPending = resetPasswordMutation.isPending;
  const isSuccess = resetPasswordMutation.isSuccess;
  const error = resetPasswordMutation.error as Error | null;

  if (isSuccess) {
    return (
      <div className="flex min-h-svh items-center justify-center px-4 py-10 bg-background">
        <Card className="w-full max-w-md text-center">
          <CardHeader className="items-center">
            <ConfettiMinimalisticLinear className="size-14 text-green-300" />
            <CardTitle className="text-2xl">Password updated</CardTitle>
            <CardDescription>
              You can now sign in with your new password.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={() => navigate({ to: '/' })}>Go home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh items-center justify-center px-4 py-10 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Reset your password</CardTitle>
          <CardDescription>Enter a new password below.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <AnimatePresence>
            {(disabledByToken || errorParam) && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
              >
                <Alert variant="destructive">
                  <AlertTitle>Invalid link</AlertTitle>
                  <AlertDescription>
                    {errorParam === 'INVALID_TOKEN' || !token
                      ? 'This reset link is invalid or has expired.'
                      : 'Unable to use this reset link.'}
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            <form.Field name="password">
              {(field) => (
                <div className="grid gap-2">
                  <Label htmlFor={field.name}>New password</Label>
                  <Input
                    id={field.name}
                    type="password"
                    autoComplete="new-password"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    disabled={isPending || disabledByToken}
                    aria-invalid={field.state.meta.errors.length > 0}
                  />
                  {field.state.meta.errors.length > 0 ? (
                    <p className="text-destructive text-sm">
                      {field.state.meta.errors.join(', ')}
                    </p>
                  ) : null}
                </div>
              )}
            </form.Field>

            <form.Field name="confirmPassword">
              {(field) => (
                <div className="grid gap-2">
                  <Label htmlFor={field.name}>Confirm password</Label>
                  <Input
                    id={field.name}
                    type="password"
                    autoComplete="new-password"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    disabled={isPending || disabledByToken}
                    aria-invalid={field.state.meta.errors.length > 0}
                  />
                  {field.state.meta.errors.length > 0 ? (
                    <p className="text-destructive text-sm">
                      {field.state.meta.errors.join(', ')}
                    </p>
                  ) : null}
                </div>
              )}
            </form.Field>

            <AnimatePresence>
              {error && !disabledByToken && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                >
                  <Alert variant="destructive">
                    <AlertTitle>Reset failed</AlertTitle>
                    <AlertDescription>{error.message}</AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              type="submit"
              className="w-full"
              disabled={isPending || disabledByToken}
            >
              {isPending ? 'Resetting…' : 'Reset password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
