import { createFileRoute, Link } from '@tanstack/react-router';
import { UserRoundedLinear } from '@/components/icons/user-rounded-linear';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export const Route = createFileRoute('/auth/signup/verify-email')({
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  return (
    <div className="flex min-h-svh items-center justify-center px-4 py-10 bg-background">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <UserRoundedLinear className="text-primary w-10 h-10" />
          </div>
          <CardTitle className="text-2xl text-center">
            Verify your email
          </CardTitle>
          <CardDescription className="text-center">
            We sent a confirmation link to your email. Click the link to
            activate your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            If you don&apos;t see the email, check your spam folder. It can take
            a minute to arrive.
          </p>
          <Button asChild variant="outline" className="w-full">
            <Link to="/auth/login">Back to login</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
