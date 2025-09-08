import { Link, type NotFoundRouteProps } from '@tanstack/react-router';
import { type } from 'arktype';
import { BoxMinimalisticLinear, WidgetAddLinear } from './icons';
import { Button } from './ui/button';

const organizationProjectGateDataSchema = type({
  type: type('"organization" | "projects"').default('organization'),
});

export function OrganizationProjectGate(props: NotFoundRouteProps) {
  const { type } = organizationProjectGateDataSchema.assert(props.data);

  if (type === 'organization') {
    return (
      <div className="flex flex-col items-center justify-center gap-8 px-6 py-16 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <WidgetAddLinear className="size-7" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            Create your organization
          </h1>
          <p className="text-muted-foreground max-w-xl">
            You don&apos;t have an active organization yet. Create one to start
            adding projects, tracking exceptions, and collaborating with your
            team.
          </p>
        </div>
        <div className="mx-auto grid w-full max-w-3xl gap-3 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-lg border bg-muted/20 px-4 py-3">
            <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
              <BoxMinimalisticLinear className="size-5" />
            </div>
            <div className="text-sm text-left">
              <div className="font-medium">Projects</div>
              <div className="text-muted-foreground">Organize work</div>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border bg-muted/20 px-4 py-3">
            <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
              <WidgetAddLinear className="size-5" />
            </div>
            <div className="text-sm text-left">
              <div className="font-medium">Integrations</div>
              <div className="text-muted-foreground">Connect tools</div>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border bg-muted/20 px-4 py-3">
            <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
              <WidgetAddLinear className="size-5" />
            </div>
            <div className="text-sm text-left">
              <div className="font-medium">Collaboration</div>
              <div className="text-muted-foreground">Invite your team</div>
            </div>
          </div>
        </div>
        <div>
          <Button asChild className="min-w-56">
            <Link to="/onboarding">Create organization</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-8 px-6 py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <BoxMinimalisticLinear className="size-7" />
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Create your first project
        </h1>
        <p className="text-muted-foreground max-w-xl">
          Set up a project to start tracking issues and events across your
          applications.
        </p>
      </div>
      <div>
        <Button asChild className="min-w-56">
          <Link to="/dashboard/projects" search={{ create: true }}>
            <WidgetAddLinear className="size-4" /> Create project
          </Link>
        </Button>
      </div>
    </div>
  );
}
