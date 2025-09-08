import { createFileRoute, Link } from '@tanstack/react-router';
import { ConfettiMinimalisticLinear } from '@/components/icons/confetti-minimalistic-linear';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export const Route = createFileRoute('/auth/signup/success')({
  component: SignUpSuccessPage,
});

function SignUpSuccessPage() {
  return (
    <div className="flex min-h-svh items-center justify-center px-4 py-10 bg-background">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <ConfettiMinimalisticLinear className="text-primary w-10 h-10" />
          </div>
          <CardTitle className="text-2xl text-center">You're all set</CardTitle>
          <CardDescription className="text-center">
            Your account is ready. Create a new organization or check your
            invitations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button asChild className="w-full">
            <Link to="/auth/login">Login</Link>
          </Button>

          {/* <Button asChild variant="outline" className="w-full">
            <Link to="/dashboard/profile">Check invitations</Link>
          </Button> */}
        </CardContent>
      </Card>
    </div>
  );
}
