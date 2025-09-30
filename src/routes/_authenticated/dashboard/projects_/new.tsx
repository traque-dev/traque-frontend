import {
  createFileRoute,
  Link,
  notFound,
  useNavigate,
} from '@tanstack/react-router';
import { motion } from 'motion/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useCreateProject } from '@/api/projects/hooks';
import { NestjsLogo } from '@/components/icons/nestjs-logo';
import { NodejsLogo } from '@/components/icons/nodejs-logo';
import { ReactLogo } from '@/components/icons/react-logo';
import { OrganizationProjectGate } from '@/components/organization-project-gate';
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
import { Platform } from '@/types/platform';

export const Route = createFileRoute('/_authenticated/dashboard/projects_/new')(
  {
    component: NewProject,
    loader: async ({ context }) => {
      const activeOrganization = await context.getActiveOrganization();

      if (!activeOrganization) {
        throw notFound({
          data: {
            type: 'organization',
          },
        });
      }

      return {
        activeOrganization,
      };
    },
    notFoundComponent: OrganizationProjectGate,
  },
);

function NewProject() {
  const navigate = useNavigate();

  const { activeOrganization } = Route.useLoaderData();

  const [name, setName] = useState('');
  const [platform, setPlatform] = useState<Platform | null>(null);

  const { mutate: createProject, isPending: isCreatingProject } =
    useCreateProject(activeOrganization.id);

  return (
    <div className="pt-6">
      <div className="flex items-center justify-between gap-3 px-1">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">New project</h1>
          <p className="text-muted-foreground text-sm">
            Create a project to start tracking issues and events
          </p>
        </div>
        <Button variant="ghost" asChild>
          <Link to="/dashboard/projects">Cancel</Link>
        </Button>
      </div>

      <Card className="mt-6 shadow-none">
        <CardHeader>
          <CardTitle className="text-lg">Project details</CardTitle>
          <CardDescription>
            Give your project a name and platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <motion.form
            className="grid gap-4 text-left"
            onSubmit={(e) => {
              e.preventDefault();
              if (!platform) return;

              createProject(
                {
                  name,
                  platform,
                },
                {
                  onSuccess: () => {
                    toast.success('Project created');
                    navigate({ to: '/dashboard/projects' });
                  },
                  onError: (error: unknown) => {
                    const message =
                      error instanceof Error
                        ? error.message
                        : 'Failed to create project';
                    toast.error(message);
                  },
                },
              );
            }}
          >
            <div className="grid gap-2">
              <Label htmlFor="project-name">Project name</Label>
              <Input
                id="project-name"
                placeholder="Web App"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="grid gap-3 mt-2">
              <div className="flex items-center gap-2">
                <Label>Platform</Label>
              </div>

              <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
                {(
                  [
                    { key: Platform.REACT, name: 'React', Logo: ReactLogo },
                    {
                      key: Platform.NODE_JS,
                      name: 'Node.js',
                      Logo: NodejsLogo,
                    },
                    { key: Platform.NEST_JS, name: 'NestJS', Logo: NestjsLogo },
                  ] as const
                ).map(({ key, name, Logo }) => {
                  const selected = platform === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setPlatform(key)}
                      className={
                        'rounded-xl p-3 border transition-all grid place-items-center gap-2 ' +
                        (selected
                          ? 'border-primary bg-primary/10'
                          : 'border-border bg-transparent')
                      }
                    >
                      <Logo width={36} height={36} />
                      <span className="text-sm font-semibold">{name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end mt-2">
              <Button
                type="submit"
                disabled={!name || !platform || isCreatingProject}
              >
                {isCreatingProject ? 'Creating…' : 'Create project'}
              </Button>
            </div>
          </motion.form>
        </CardContent>
      </Card>
    </div>
  );
}
