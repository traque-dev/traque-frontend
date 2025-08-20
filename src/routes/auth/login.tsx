import { revalidateLogic, useForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import {
  createFileRoute,
  Link,
  redirect,
  useNavigate,
} from '@tanstack/react-router';
import { type } from 'arktype';
import { useState } from 'react';
import { GoogleIcon } from '@/components/icons/google-icon';
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
import { Separator } from '@/components/ui/separator';
import { auth } from '@/lib/auth';

export const Route = createFileRoute('/auth/login')({
  component: LoginPage,
  loader: async () => {
    const { data: session } = await auth.getSession();
    if (session) {
      throw redirect({ to: '/dashboard' });
    }
  },
  pendingComponent: () => null,
});

const loginSchema = type({
  email: type('string.email').configure({
    message: 'Please enter a valid email address',
  }),
  password: type('string >= 8').configure({
    message: 'Password must be at least 8 characters long',
  }),
});

type LoginFormValues = typeof loginSchema.infer;

function LoginPage() {
  const navigate = useNavigate();

  const [formError, setFormError] = useState<string | null>(null);

  const emailPasswordMutation = useMutation({
    mutationFn: async (values: LoginFormValues) => {
      const { data, error } = await auth.signIn.email({
        email: values.email,
        password: values.password,
        callbackURL: `${window.location.origin}/dashboard`,
      });
      if (error) throw new Error(error.message ?? 'Unable to sign in');
      return data;
    },
    onSuccess: () => {
      navigate({ to: '/dashboard' });
    },
    onError: (err: unknown) => {
      setFormError(err instanceof Error ? err.message : 'Unable to sign in');
    },
  });

  const googleMutation = useMutation({
    mutationFn: async () => {
      await auth.signIn.social({
        provider: 'google',
        callbackURL: `${window.location.origin}/dashboard`,
      });
    },
    onError: () => setFormError('Google sign-in failed. Please try again.'),
  });

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    validationLogic: revalidateLogic({
      mode: 'submit',
      modeAfterSubmission: 'blur',
    }),
    validators: {
      onDynamic: loginSchema,
    },
    onSubmit: async ({ value }) => {
      await emailPasswordMutation.mutateAsync(value);
    },
  });

  const isLoading = emailPasswordMutation.isPending || googleMutation.isPending;

  return (
    <div className="flex min-h-svh items-center justify-center px-4 py-10 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Sign in</CardTitle>
          <CardDescription>
            Welcome back. Please enter your details.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            <form.Field name="email">
              {(field) => (
                <div className="grid gap-2">
                  <Label htmlFor={field.name}>Email</Label>
                  <Input
                    id={field.name}
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    // aria-invalid={field.state.meta.errors.length > 0}
                  />
                  {field.state.meta.errors.length > 0 ? (
                    <p className="text-destructive text-sm">
                      {field.state.meta.errors.join(', ')}
                    </p>
                  ) : null}
                </div>
              )}
            </form.Field>

            <form.Field name="password">
              {(field) => (
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={field.name}>Password</Label>
                    <Link
                      to="/auth/forgot-password"
                      className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id={field.name}
                    type="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
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

            {formError ? (
              <p className="text-destructive text-sm" role="alert">
                {formError}
              </p>
            ) : null}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <div className="flex items-center gap-4">
            <Separator className="flex-1" />
            <span className="text-muted-foreground text-xs">
              Or continue with
            </span>
            <Separator className="flex-1" />
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => googleMutation.mutate()}
            disabled={isLoading}
          >
            <GoogleIcon className="w-4 h-4" />
            Continue with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
