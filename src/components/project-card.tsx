import { Link } from '@tanstack/react-router';
import {
  AlertCircle,
  Clock,
  Code2,
  Copy,
  KeyRound,
  MoreVertical,
  Settings,
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { dayjs } from '@/lib/dayjs';
import type { Project } from '@/types/project';

type ProjectCardProps = {
  project: Project;
};

function getPlatformLabel(platform?: string) {
  if (!platform) return undefined;
  const map: Record<string, string> = {
    NEST_JS: 'NestJS',
    NODE_JS: 'Node.js',
    JAVA: 'Java',
    PYTHON: 'Python',
    REACT: 'React',
    NEXT_JS: 'Next.js',
    REACT_NATIVE: 'React Native',
    EXPO: 'Expo',
  };
  return map[platform] ?? platform;
}

function maskApiKey(apiKey?: string) {
  if (!apiKey) return '';
  if (apiKey.length <= 8) return apiKey;
  return `${apiKey.slice(0, 8)}••••${apiKey.slice(-4)}`;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const platformLabel = getPlatformLabel(project.platform as unknown as string);
  const updatedAt = project.updatedAt
    ? dayjs(project.updatedAt).format('LLL')
    : undefined;

  const handleCopyApiKey = async () => {
    if (!project.apiKey) return;
    try {
      await navigator.clipboard.writeText(project.apiKey);
      toast.success('API key copied');
    } catch {
      toast.error('Failed to copy API key');
    }
  };

  return (
    <Card className="shadow-none">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1.5">
            <CardDescription>Project</CardDescription>
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-xl leading-tight">
                {project.name}
              </CardTitle>
              {platformLabel ? (
                <Badge variant="secondary">{platformLabel}</Badge>
              ) : null}
            </div>
            {updatedAt ? (
              <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
                <Clock className="size-3.5" /> Updated {updatedAt}
              </div>
            ) : null}
          </div>

          <CardAction>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Project actions"
                >
                  <MoreVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Quick actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    to="/dashboard/issues"
                    search={{ projectId: project.id }}
                  >
                    <AlertCircle className="size-4" /> View issues
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    to="/dashboard/events"
                    search={{ projectId: project.id }}
                  >
                    <Code2 className="size-4" /> View events
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    to="/dashboard/projects/$projectId/settings"
                    params={{ projectId: project.id as string }}
                  >
                    <Settings className="size-4" /> Project settings
                  </Link>
                </DropdownMenuItem>
                {project.apiKey ? (
                  <DropdownMenuItem onSelect={handleCopyApiKey}>
                    <Copy className="size-4" /> Copy API key
                  </DropdownMenuItem>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          </CardAction>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {project.description ? (
          <p className="text-muted-foreground line-clamp-2 text-sm">
            {project.description}
          </p>
        ) : (
          <p className="text-muted-foreground/80 italic text-sm">
            No description provided
          </p>
        )}

        {project.apiKey ? (
          <div className="flex items-center justify-between gap-2 rounded-md border bg-muted/40 px-3 py-2">
            <div className="flex items-center gap-2 text-sm">
              <KeyRound className="size-4 text-muted-foreground" />
              <span className="font-mono tracking-wider">
                {maskApiKey(project.apiKey)}
              </span>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={handleCopyApiKey}>
                  <Copy className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copy API key</TooltipContent>
            </Tooltip>
          </div>
        ) : null}
      </CardContent>

      <CardFooter>
        <div className="grid w-full grid-cols-3 gap-2">
          <Button asChild variant="secondary">
            <Link to="/dashboard/issues" search={{ projectId: project.id }}>
              <AlertCircle className="size-4" /> Issues
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/dashboard/events" search={{ projectId: project.id }}>
              <Code2 className="size-4" /> Events
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link
              to="/dashboard/projects/$projectId/settings"
              params={{ projectId: project.id as string }}
            >
              <Settings className="size-4" /> Settings
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
