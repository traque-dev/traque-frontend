import { createFileRoute, notFound, useNavigate } from '@tanstack/react-router';
import { type } from 'arktype';
import { ArrowLeft, Copy, FileCode2, MonitorSmartphone } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { getExceptionByIdQueryOptions } from '@/api/exceptions/query-options';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { dayjs } from '@/lib/dayjs';

const exceptionIdParamsSchema = type({
  projectId: 'string.uuid',
});

export const Route = createFileRoute(
  '/_authenticated/dashboard/issues_/$issueId/exceptions/$exceptionId',
)({
  validateSearch: exceptionIdParamsSchema,
  loaderDeps: ({ search }) => ({
    projectId: search.projectId,
  }),
  loader: async ({ context, params, deps }) => {
    const activeOrganization = await context.getActiveOrganization();

    if (!activeOrganization) {
      throw notFound();
    }

    const { exceptionId } = params;
    const { projectId } = deps;

    if (!projectId) {
      throw notFound();
    }

    const exception = await context.queryClient.ensureQueryData(
      getExceptionByIdQueryOptions(
        activeOrganization.id,
        projectId,
        exceptionId,
      ),
    );

    if (!exception) {
      throw notFound();
    }

    return {
      exception,
      activeOrganization,
      projectId,
    };
  },
  component: ExceptionDetailsPage,
});

function ExceptionDetailsPage() {
  const { exception, projectId } = Route.useLoaderData();
  const { issueId } = Route.useParams();
  const navigate = useNavigate({ from: Route.fullPath });

  const [inAppOnly, setInAppOnly] = useState(false);

  const frames = useMemo(
    () => exception?.stacktrace?.frames ?? [],
    [exception],
  );

  const filteredFrames = useMemo(
    () => (inAppOnly ? frames.filter((f) => f.inApp) : frames),
    [frames, inAppOnly],
  );

  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    setSelectedIndex(0);
  }, [inAppOnly, exception?.id]);

  const selectedFrame = filteredFrames[selectedIndex] ?? null;

  const statusCode = exception?.httpContext?.statusCode;
  const statusVariant: 'destructive' | 'outline' | 'secondary' = statusCode
    ? statusCode >= 500
      ? 'destructive'
      : statusCode >= 400
        ? 'outline'
        : 'secondary'
    : 'secondary';

  const responseText = useMemo(() => {
    const resp = exception?.httpContext?.response as unknown;

    if (resp == null) return '';

    try {
      return JSON.stringify(resp, null, 2);
    } catch {
      try {
        return String(resp);
      } catch {
        return '';
      }
    }
  }, [exception]);

  return (
    <div className="pt-6 space-y-6 pb-6">
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1"
            onClick={() =>
              navigate({
                to: '/dashboard/issues/$issueId/exceptions',
                params: { issueId },
                search: { projectId },
              })
            }
          >
            <ArrowLeft className="size-4" /> Back
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <h1 className="text-xl font-semibold tracking-tight">Exception</h1>
        </div>

        <div className="flex items-center gap-2 pr-1">
          {exception?.httpContext?.method ? (
            <Badge variant="secondary">{exception.httpContext.method}</Badge>
          ) : null}
          {statusCode ? (
            <Badge variant={statusVariant as any}>{statusCode}</Badge>
          ) : null}
        </div>
      </div>

      <div className="space-y-2 px-1">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div
              className="text-lg font-semibold truncate"
              title={exception?.name}
            >
              {exception?.name}
            </div>
            <div
              className="text-sm text-muted-foreground truncate"
              title={exception?.message}
            >
              {exception?.message}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 shrink-0">
            <div className="rounded-md border p-3">
              <div className="text-xs text-muted-foreground">Time</div>
              <div className="font-medium">
                {exception?.createdAt
                  ? dayjs(exception.createdAt).format('ll LT')
                  : '-'}
              </div>
            </div>
            <div className="rounded-md border p-3">
              <div className="text-xs text-muted-foreground">Environment</div>
              <div className="font-medium">{exception?.environment ?? '-'}</div>
            </div>
            <div className="rounded-md border p-3">
              <div className="text-xs text-muted-foreground">Platform</div>
              <div className="font-medium">{exception?.platform ?? '-'}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-md border">
        <div className="flex items-center justify-between p-3 border-b">
          <div className="text-sm font-semibold">Stacktrace</div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-xs text-muted-foreground">In-app only</span>
            <Switch checked={inAppOnly} onCheckedChange={setInAppOnly} />
          </div>
        </div>
        <div className="h-[480px]">
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={38} minSize={24} className="min-w-0">
              <ScrollArea className="h-full">
                <ul className="divide-y">
                  {filteredFrames.length === 0 ? (
                    <li className="text-sm text-muted-foreground p-3">
                      No stack frames.
                    </li>
                  ) : (
                    filteredFrames.map((f, idx) => {
                      const isActive = idx === selectedIndex;
                      const filename =
                        f.filename ?? f.absolutePath ?? 'unknown';
                      const location = [f.lineNumber, f.columnNumber]
                        .filter(Boolean)
                        .join(':');
                      return (
                        <li
                          key={`${filename}-${idx}`}
                          className={
                            'p-3 text-sm cursor-pointer hover:bg-accent/50 ' +
                            (isActive ? 'bg-accent' : '')
                          }
                          onClick={() => setSelectedIndex(idx)}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <FileCode2 className="size-3.5 text-muted-foreground" />
                                <span
                                  className="font-medium truncate"
                                  title={filename}
                                >
                                  {filename}
                                </span>
                              </div>
                              <div className="text-xs text-muted-foreground mt-0.5 truncate">
                                {f.functionName ?? '<anonymous>'}
                              </div>
                            </div>
                            <div className="text-xs shrink-0 tabular-nums text-muted-foreground">
                              {location || '-'}
                            </div>
                          </div>
                          {f.module ? (
                            <div className="mt-1 text-[11px] text-muted-foreground truncate">
                              {f.module}
                            </div>
                          ) : null}
                          {f.inApp ? (
                            <div className="mt-1">
                              <Badge variant="secondary">in-app</Badge>
                            </div>
                          ) : null}
                        </li>
                      );
                    })
                  )}
                </ul>
              </ScrollArea>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel minSize={40} className="min-w-0">
              <div className="h-full flex flex-col">
                <div className="p-3 border-b">
                  <div className="text-sm font-semibold">Frame details</div>
                </div>
                <ScrollArea className="flex-1">
                  {selectedFrame ? (
                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileCode2 className="size-4 text-muted-foreground" />
                          <div className="min-w-0">
                            <div
                              className="font-medium truncate"
                              title={
                                selectedFrame.filename ??
                                selectedFrame.absolutePath ??
                                'unknown'
                              }
                            >
                              {selectedFrame.filename ??
                                selectedFrame.absolutePath ??
                                'unknown'}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {selectedFrame.functionName ?? '<anonymous>'}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7"
                          onClick={async () => {
                            const text = `${selectedFrame.absolutePath ?? selectedFrame.filename ?? ''}:${selectedFrame.lineNumber ?? ''}${selectedFrame.columnNumber ? `:${selectedFrame.columnNumber}` : ''}`;
                            try {
                              await navigator.clipboard.writeText(text);
                            } catch {}
                          }}
                          aria-label="Copy location"
                        >
                          <Copy className="size-4" />
                        </Button>
                      </div>

                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="rounded-md border p-3">
                          <div className="text-xs text-muted-foreground">
                            Line
                          </div>
                          <div className="font-medium">
                            {selectedFrame.lineNumber ?? '-'}
                          </div>
                        </div>
                        <div className="rounded-md border p-3">
                          <div className="text-xs text-muted-foreground">
                            Column
                          </div>
                          <div className="font-medium">
                            {selectedFrame.columnNumber ?? '-'}
                          </div>
                        </div>
                        <div className="rounded-md border p-3">
                          <div className="text-xs text-muted-foreground">
                            In App
                          </div>
                          <div className="font-medium">
                            {selectedFrame.inApp ? 'Yes' : 'No'}
                          </div>
                        </div>
                        <div className="rounded-md border p-3">
                          <div className="text-xs text-muted-foreground">
                            Platform
                          </div>
                          <div className="font-medium flex items-center gap-1">
                            <MonitorSmartphone className="size-3.5 text-muted-foreground" />
                            {selectedFrame.platform ?? '-'}
                          </div>
                        </div>
                        <div className="rounded-md border p-3 md:col-span-2">
                          <div className="text-xs text-muted-foreground">
                            Module
                          </div>
                          <div
                            className="font-medium truncate"
                            title={selectedFrame.module ?? '-'}
                          >
                            {selectedFrame.module ?? '-'}
                          </div>
                        </div>
                        <div className="rounded-md border p-3 md:col-span-2">
                          <div className="text-xs text-muted-foreground">
                            Absolute path
                          </div>
                          <div
                            className="font-medium font-mono text-xs truncate"
                            title={selectedFrame.absolutePath ?? '-'}
                          >
                            {selectedFrame.absolutePath ?? '-'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                      Select a frame to see details
                    </div>
                  )}
                </ScrollArea>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-md border p-3">
          <div className="text-sm font-semibold mb-2">HTTP</div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-muted-foreground">URL</span>
              <span
                className="font-mono text-xs truncate max-w-[540px]"
                title={exception?.httpContext?.url}
              >
                {exception?.httpContext?.url ?? '-'}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-muted-foreground">Method</span>
              <span>
                {exception?.httpContext?.method ? (
                  <Badge variant="secondary">
                    {exception.httpContext.method}
                  </Badge>
                ) : (
                  '-'
                )}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-muted-foreground">Status</span>
              <span>
                {statusCode ? (
                  <Badge variant={statusVariant as any}>{statusCode}</Badge>
                ) : (
                  '-'
                )}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-muted-foreground">Client IP</span>
              <span className="font-medium">
                {exception?.httpContext?.clientIp ?? '-'}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-md border p-3 md:col-span-2">
          <div className="text-sm font-semibold mb-2">Message</div>
          <div className="text-sm text-muted-foreground whitespace-pre-wrap">
            {exception?.message}
          </div>
        </div>
      </div>

      {exception?.details ? (
        <div className="rounded-md border">
          <div className="p-3 border-b">
            <div className="text-sm font-semibold">Details</div>
          </div>
          <ScrollArea className="max-h-[360px]">
            <pre className="p-3 text-xs whitespace-pre-wrap leading-relaxed">
              {exception.details}
            </pre>
          </ScrollArea>
        </div>
      ) : null}

      {responseText ? (
        <div className="rounded-md border">
          <div className="p-3 border-b flex items-center justify-between">
            <div className="text-sm font-semibold">HTTP Response</div>
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(responseText);
                  toast.success('Response copied to clipboard');
                } catch {}
              }}
              aria-label="Copy response"
            >
              <Copy className="size-4" />
            </Button>
          </div>
          <ScrollArea className="max-h-[360px]">
            <pre className="p-3 text-xs whitespace-pre leading-relaxed">
              {responseText}
            </pre>
          </ScrollArea>
        </div>
      ) : null}

      {exception?.stacktrace?.stack ? (
        <div className="rounded-md border">
          <div className="p-3 border-b">
            <div className="text-sm font-semibold">Raw stack</div>
          </div>
          <ScrollArea className="max-h-[280px]">
            <pre className="p-3 text-xs whitespace-pre-wrap leading-relaxed">
              {exception.stacktrace.stack}
            </pre>
          </ScrollArea>
        </div>
      ) : null}
    </div>
  );
}
