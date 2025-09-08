import { revalidateLogic, useForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import {
  createFileRoute,
  Link,
  redirect,
  useNavigate,
} from '@tanstack/react-router';
import { type } from 'arktype';
import { ErrorMessage } from '@/components/error-message';
import { GoogleIcon } from '@/components/icons/google-icon';
import { USFlag } from '@/components/icons/US-flag';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { auth } from '@/lib/auth';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/auth/signup/')({
  component: SignUpPage,
  loader: async ({ context }) => {
    const session = context.session;
    if (session) {
      throw redirect({ to: '/dashboard' });
    }
  },
  pendingComponent: () => null,
});

const signupSchema = type({
  name: type('string >= 2').configure({
    message: 'Please enter your full name',
  }),
  email: type('string.email').configure({
    message: 'Please enter a valid email address',
  }),
  password: type('string >= 8').configure({
    message: 'Password must be at least 8 characters long',
  }),
  dataLocation: 'string',
  acceptPolicy: 'boolean',
}).narrow((data, ctx) => {
  if (data.dataLocation !== 'us') {
    return ctx.reject({
      expected: 'us',
      message: 'Only United States is available right now',
      actual: data.dataLocation,
      path: ['dataLocation'],
    });
  }

  if (!data.acceptPolicy) {
    return ctx.reject({
      expected: 'true',
      message: 'You must agree to the Privacy Policy',
      actual: String(data.acceptPolicy),
      path: ['acceptPolicy'],
    });
  }

  return true;
});

type SignUpFormValues = typeof signupSchema.infer;

function SignUpPage() {
  const navigate = useNavigate();

  const emailPasswordSignUpMutation = useMutation({
    mutationFn: async (values: SignUpFormValues) => {
      const { data, error } = await auth.signUp.email({
        name: values.name,
        email: values.email,
        password: values.password,
        callbackURL: `${window.location.origin}/auth/signup/success`,
      });

      if (error) {
        throw new Error(error.message ?? 'Unable to sign up');
      }

      return data;
    },
    onSuccess: () => {
      navigate({ to: '/auth/signup/verify-email' });
    },
  });

  const googleAuthMutation = useMutation({
    mutationFn: async () => {
      await auth.signIn.social({
        provider: 'google',
        callbackURL: `${window.location.origin}/onboarding`,
      });
    },
  });

  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      dataLocation: 'us',
      acceptPolicy: false,
    },
    validationLogic: revalidateLogic({
      mode: 'submit',
      modeAfterSubmission: 'blur',
    }),
    validators: {
      onDynamic: signupSchema,
    },
    onSubmit: async ({ value }) => {
      await emailPasswordSignUpMutation.mutateAsync(value);
    },
  });

  const isLoading =
    emailPasswordSignUpMutation.isPending || googleAuthMutation.isPending;

  const error = (emailPasswordSignUpMutation.error ||
    googleAuthMutation.error) as Error | null;

  return (
    <div className="flex min-h-svh items-center justify-center px-4 py-10 bg-background">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle className="text-2xl">Create your account</CardTitle>
          <CardDescription>Welcome to Traque!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div>
              <p className="font-semibold">Data Storage Location</p>
              <p className="text-muted-foreground text-sm">
                Select where your organization's data will be stored. Note that
                this location cannot be changed after your account is created.
              </p>
            </div>
            <form.Field name="dataLocation">
              {(field) => (
                <div className="grid gap-2">
                  <Select
                    value={field.state.value}
                    onValueChange={(v) => field.handleChange(v)}
                  >
                    <SelectTrigger
                      id={field.name}
                      aria-invalid={field.state.meta.errors.length > 0}
                      className="w-full"
                    >
                      <SelectValue placeholder="Select a location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="us">
                        <span className="flex items-center gap-2">
                          <USFlag className="size-4" />
                          United States
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <ErrorMessage message={field.state.meta.errors.join(', ')} />
                </div>
              )}
            </form.Field>
          </div>

          <Separator className="my-5" />

          <Button
            variant="outline"
            className="w-full"
            onClick={() => googleAuthMutation.mutate()}
            disabled={isLoading}
          >
            <GoogleIcon className="w-4 h-4" />
            Continue with Google
          </Button>

          <div className="flex items-center gap-4">
            <Separator className="flex-1" />
            <span className="text-muted-foreground text-xs">
              Or continue with email
            </span>
            <Separator className="flex-1" />
          </div>

          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            <div className="grid gap-5 md:grid-cols-2">
              <form.Field name="name">
                {(field) => (
                  <div className="grid gap-2">
                    <Label htmlFor={field.name}>Full Name</Label>
                    <div>
                      <Input
                        id={field.name}
                        type="text"
                        placeholder="John Doe"
                        autoComplete="name"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={field.state.meta.errors.length > 0}
                      />
                      <ErrorMessage
                        message={field.state.meta.errors.join(', ')}
                      />
                    </div>
                  </div>
                )}
              </form.Field>

              <form.Field name="email">
                {(field) => (
                  <div className="grid gap-2">
                    <Label htmlFor={field.name}>Email</Label>
                    <div>
                      <Input
                        id={field.name}
                        type="email"
                        placeholder="you@example.com"
                        autoComplete="email"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={field.state.meta.errors.length > 0}
                      />
                      <ErrorMessage
                        message={field.state.meta.errors.join(', ')}
                      />
                    </div>
                  </div>
                )}
              </form.Field>

              <form.Field name="password">
                {(field) => (
                  <div className="grid gap-2 col-start-1 col-end-3">
                    <Label htmlFor={field.name}>Password</Label>
                    <div>
                      <Input
                        id={field.name}
                        type="password"
                        placeholder="••••••••"
                        autoComplete="new-password"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={field.state.meta.errors.length > 0}
                      />

                      <ErrorMessage
                        message={field.state.meta.errors.join(', ')}
                      />
                    </div>
                  </div>
                )}
              </form.Field>
            </div>

            <Separator className="my-5" />

            <form.Field name="acceptPolicy">
              {(field) => (
                <div className="flex items-center gap-1">
                  <Checkbox
                    id={field.name}
                    checked={field.state.value}
                    onCheckedChange={(v) => field.handleChange(Boolean(v))}
                    onBlur={field.handleBlur}
                    aria-invalid={field.state.meta.errors.length > 0}
                  />
                  <div>
                    <Label
                      htmlFor={field.name}
                      className={cn(
                        'font-normal gap-1',
                        field.state.meta.errors.length > 0 &&
                          'text-destructive',
                      )}
                    >
                      I agree to the
                      <a
                        href="https://www.traque.dev/privacy"
                        target="_blank"
                        rel="noreferrer"
                        className="underline underline-offset-4 text-foreground"
                      >
                        Privacy Policy
                      </a>
                    </Label>
                  </div>
                </div>
              )}
            </form.Field>

            <ErrorMessage message={error?.message} />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating account…' : 'Create account'}
            </Button>

            <div className="flex flex-row justify-end">
              <Link
                to="/auth/login"
                className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
              >
                Already have an account?
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
