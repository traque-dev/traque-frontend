import { createFileRoute, notFound } from '@tanstack/react-router';
import { Clock, Copy, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { getProjectById } from '@/api/projects';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { dayjs } from '@/lib/dayjs';

export const Route = createFileRoute(
  '/_authenticated/dashboard/projects_/$projectId/settings',
)({
  component: RouteComponent,
  loader: async ({ params, context }) => {
    const activeOrganization = await context.getActiveOrganization();

    if (!activeOrganization) {
      throw notFound();
    }

    const project = await getProjectById(
      activeOrganization.id,
      params.projectId,
    );

    return {
      organizationId: activeOrganization.id,
      project,
      title: 'Project settings',
    };
  },
  pendingComponent: () => <div>Loading...</div>,
});

function RouteComponent() {
  const { project } = Route.useLoaderData();

  const handleCopy = async (value?: string) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      toast.success('API key copied');
    } catch {
      toast.error('Failed to copy');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Project settings
          </h1>
          <p className="text-muted-foreground text-sm">
            Configure keys and integrations
          </p>
        </div>
        {project.updatedAt ? (
          <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
            <Clock className="size-3.5" /> Updated{' '}
            {dayjs(project.updatedAt).format('LLL')}
          </div>
        ) : null}
      </div>

      <Card className="shadow-none">
        <CardHeader>
          <div className="flex items-center gap-2">
            <KeyRound className="size-5 text-muted-foreground" />
            <div>
              <CardTitle className="text-base">Project API key</CardTitle>
              <CardDescription>
                Use this key to send events and exceptions
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              <p>
                This is a{' '}
                <span className="font-medium">public project key</span>. It
                supports <span className="font-medium">event</span> and
                <span className="font-medium"> exception</span> capture only. No
                data can be read using this key.
              </p>
            </AlertDescription>
          </Alert>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Public API key</label>
            <div className="flex items-center gap-2">
              <Input readOnly value={project.apiKey} className="font-mono" />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    onClick={() => handleCopy(project.apiKey)}
                  >
                    <Copy className="size-4" />
                    Copy
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Copy API key</TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* <Separator />

          <p className="text-muted-foreground text-sm">
            Need to rotate your key? Contact an organization admin.
          </p> */}
        </CardContent>
      </Card>
    </div>
  );
}
