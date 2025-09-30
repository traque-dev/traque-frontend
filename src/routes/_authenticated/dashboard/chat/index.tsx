import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, notFound, useNavigate } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';
import { getProjectsQueryOptions } from '@/api/projects/query-options';
import {
  PromptInput,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
} from '@/components/ai/prompt-input';
import { OrganizationProjectGate } from '@/components/organization-project-gate';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { issuesDatePresetRanges } from '@/constants/issues-date-preset-ranges';
import { dayjs } from '@/lib/dayjs';
import { verifyPlanAccess } from '@/lib/plan';
import { chatStore } from '@/store/chat-store';

export const Route = createFileRoute('/_authenticated/dashboard/chat/')({
  component: NewChat,
  loader: async ({ context }) => {
    const activeOrganization = await context.getActiveOrganization();

    if (!activeOrganization) {
      throw notFound({
        data: {
          type: 'organization',
        },
      });
    }

    await verifyPlanAccess('plus')({
      activeOrganization,
    });

    const projects = await context.queryClient.ensureQueryData(
      getProjectsQueryOptions(activeOrganization.id),
    );

    if (projects?.length === 0) {
      throw notFound({
        data: {
          type: 'projects',
        },
      });
    }

    return {
      activeOrganization,
    };
  },
  notFoundComponent: OrganizationProjectGate,
});

function NewChat() {
  const { activeOrganization } = Route.useLoaderData();

  const navigate = useNavigate({ from: Route.fullPath });

  const { data: projects } = useSuspenseQuery(
    getProjectsQueryOptions(activeOrganization.id),
  );

  const [input, setInput] = useState('');
  const [projectId, setProjectId] = useState<string>(projects[0].id!);
  const defaultRange = useMemo(
    () => ({
      from: issuesDatePresetRanges[0].from,
      to: issuesDatePresetRanges[0].to,
    }),
    [],
  );
  const [from, setFrom] = useState<Date | undefined>(defaultRange.from);
  const [to, setTo] = useState<Date | undefined>(defaultRange.to);

  useEffect(() => {
    if (!projectId && projects?.length) {
      setProjectId(projects[0].id as string);
    }
  }, [projects, projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    chatStore.setState({
      initialMessage: input,
    });
    await navigate({
      to: '/dashboard/chat/$chatId',
      params: {
        chatId: crypto.randomUUID(),
      },
      search: {
        projectId,
        dateFrom: from?.toISOString(),
        dateTo: to?.toISOString(),
        new: true,
      },
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 relative size-full h-[calc(100vh-64px)]">
      <div className="flex flex-col justify-end h-full">
        {
          <div className="space-y-6 flex-1 flex flex-col justify-center items-start">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">
                How can I help you?
              </h1>
              <p className="text-muted-foreground mt-1">
                Select a project and time range, then start with a suggestion
                below or ask your own question.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select value={projectId} onValueChange={(v) => setProjectId(v)}>
                <SelectTrigger className="min-w-48">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects
                    ?.filter((p) => Boolean(p.id))
                    .map((p) => (
                      <SelectItem key={p.id as string} value={p.id as string}>
                        {p.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">
                    {from && to
                      ? `${dayjs(from).format('ll')} – ${dayjs(to).format('ll')}`
                      : 'Time range'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-3" align="start">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      {issuesDatePresetRanges.map((r) => (
                        <Button
                          key={r.label}
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setFrom(r.from);
                            setTo(r.to);
                          }}
                        >
                          {r.label}
                        </Button>
                      ))}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setFrom(undefined);
                          setTo(undefined);
                        }}
                      >
                        Clear
                      </Button>
                    </div>
                    <Calendar
                      mode="range"
                      selected={
                        from && to
                          ? { from: new Date(from), to: new Date(to) }
                          : undefined
                      }
                      onSelect={(range) => {
                        setFrom(range?.from);
                        setTo(range?.to);
                      }}
                      numberOfMonths={1}
                      showOutsideDays
                      disabled={{
                        after: new Date(),
                      }}
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <div className="w-full grid gap-2 grid-cols-2">
              {[
                'Why did exceptions spike recently?',
                'Show the top 5 issues by event count',
                'What caused the biggest error rate increase?',
                'Summarize the most frequent exception',
              ].map((s) => (
                <button
                  key={s}
                  className="cursor-pointer text-left text-sm rounded-lg border px-4 py-3 hover:bg-accent hover:text-accent-foreground transition-colors"
                  onClick={() => {
                    setInput(s);
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        }

        <PromptInput onSubmit={handleSubmit} className="mt-4">
          <PromptInputTextarea
            onChange={(e) => setInput(e.target.value)}
            value={input}
          />
          <PromptInputToolbar className="flex justify-end">
            <PromptInputSubmit disabled={!input} />
          </PromptInputToolbar>
        </PromptInput>
      </div>
    </div>
  );
}
