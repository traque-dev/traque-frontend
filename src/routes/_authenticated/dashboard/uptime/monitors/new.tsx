import {
  createFileRoute,
  Link,
  notFound,
  useNavigate,
} from '@tanstack/react-router';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Globe,
  Loader2,
  Minus,
  Plus,
  Search,
  Server,
  Wifi,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Fragment, useState } from 'react';
import { toast } from 'sonner';
import { useCreateMonitor } from '@/api/monitors/hooks';
import { Badge } from '@/components/ui/badge';
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
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type {
  CreateMonitorDTO,
  EscalationPolicy,
  HttpMethod,
  IpVersion,
  MonitorRegion,
  MonitorType,
  NotificationChannel,
  RequestHeader,
} from '@/types/monitor';

export const Route = createFileRoute(
  '/_authenticated/dashboard/uptime/monitors/new',
)({
  component: NewMonitorPage,
  loader: async ({ context }) => {
    const activeOrganization = await context.getActiveOrganization();

    if (!activeOrganization) {
      throw notFound({ data: { type: 'organization' } });
    }

    return { activeOrganization };
  },
});

const STEPS = [
  { id: 'basics', title: 'Basics' },
  { id: 'request', title: 'Request' },
  { id: 'schedule', title: 'Schedule' },
  { id: 'notifications', title: 'Alerts' },
] as const;

type Step = (typeof STEPS)[number]['id'];

const MONITOR_TYPES: {
  value: MonitorType;
  label: string;
  description: string;
  icon: React.ElementType;
}[] = [
  {
    value: 'HTTP_UNAVAILABLE',
    label: 'HTTP',
    description: 'Check if a URL is reachable',
    icon: Globe,
  },
  {
    value: 'HTTP_KEYWORD_MISSING',
    label: 'Keyword Missing',
    description: 'Alert when keyword disappears',
    icon: Search,
  },
  {
    value: 'HTTP_KEYWORD_PRESENT',
    label: 'Keyword Present',
    description: 'Alert when keyword appears',
    icon: Search,
  },
  {
    value: 'HTTP_STATUS_CODE',
    label: 'Status Code',
    description: 'Check for specific HTTP status',
    icon: Globe,
  },
  {
    value: 'PING',
    label: 'Ping',
    description: 'ICMP ping check',
    icon: Wifi,
  },
  {
    value: 'TCP',
    label: 'TCP',
    description: 'TCP port connectivity',
    icon: Server,
  },
  {
    value: 'DNS',
    label: 'DNS',
    description: 'DNS resolution check',
    icon: Globe,
  },
];

const HTTP_METHODS: HttpMethod[] = [
  'GET',
  'POST',
  'PUT',
  'PATCH',
  'DELETE',
  'HEAD',
  'OPTIONS',
];

const REGIONS: { value: MonitorRegion; label: string }[] = [
  // { value: 'EUROPE', label: 'Europe' },
  { value: 'NORTH_AMERICA', label: 'North America' },
  // { value: 'ASIA', label: 'Asia' },
  // { value: 'AUSTRALIA', label: 'Australia' },
];

const NOTIFICATION_CHANNELS: { value: NotificationChannel; label: string }[] = [
  { value: 'EMAIL', label: 'Email' },
  { value: 'PUSH', label: 'Push Notification' },
  { value: 'SMS', label: 'SMS' },
  { value: 'CALL', label: 'Phone Call' },
  { value: 'CRITICAL_ALERT', label: 'Critical Alert' },
];

const ESCALATION_POLICIES: { value: EscalationPolicy; label: string }[] = [
  { value: 'IMMEDIATELY', label: 'Immediately' },
  { value: 'WITHIN_3_MIN', label: 'Within 3 minutes' },
  { value: 'WITHIN_5_MIN', label: 'Within 5 minutes' },
  { value: 'WITHIN_10_MIN', label: 'Within 10 minutes' },
  { value: 'DO_NOTHING', label: 'Do nothing' },
];

function isHttpType(type: MonitorType): boolean {
  return [
    'HTTP_UNAVAILABLE',
    'HTTP_KEYWORD_MISSING',
    'HTTP_KEYWORD_PRESENT',
    'HTTP_STATUS_CODE',
  ].includes(type);
}

function NewMonitorPage() {
  const navigate = useNavigate();
  const { activeOrganization } = Route.useLoaderData();
  const { mutate: create, isPending } = useCreateMonitor(activeOrganization.id);

  const [step, setStep] = useState<Step>('basics');
  const stepIndex = STEPS.findIndex((s) => s.id === step);

  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [monitorType, setMonitorType] =
    useState<MonitorType>('HTTP_UNAVAILABLE');

  const [httpMethod, setHttpMethod] = useState<HttpMethod>('GET');
  const [requestHeaders, setRequestHeaders] = useState<RequestHeader[]>([]);
  const [requestBody, setRequestBody] = useState('');
  const [keyword, setKeyword] = useState('');
  const [expectedStatusCode, setExpectedStatusCode] = useState<string>('');
  const [followRedirects, setFollowRedirects] = useState(true);

  const [checkInterval, setCheckInterval] = useState('180');
  const [requestTimeout, setRequestTimeout] = useState('30');
  const [regions, setRegions] = useState<MonitorRegion[]>([
    'EUROPE',
    'NORTH_AMERICA',
  ]);
  const [ipVersion, setIpVersion] = useState<IpVersion>('BOTH');
  const [sslVerification, setSslVerification] = useState(true);

  const [notificationChannels, setNotificationChannels] = useState<
    NotificationChannel[]
  >(['EMAIL']);
  const [escalationPolicy, setEscalationPolicy] =
    useState<EscalationPolicy>('IMMEDIATELY');

  const canProceedBasics = name.trim() && url.trim() && monitorType;
  const canSubmit = canProceedBasics;

  /** Back and current always; forward only after basics are valid */
  function canNavigateToStep(targetIndex: number) {
    if (targetIndex <= stepIndex) return true;
    return Boolean(canProceedBasics);
  }

  function goNext() {
    const idx = stepIndex;
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1].id);
  }

  function goPrev() {
    const idx = stepIndex;
    if (idx > 0) setStep(STEPS[idx - 1].id);
  }

  function handleSubmit() {
    const dto: CreateMonitorDTO = {
      name: name.trim(),
      url: url.trim(),
      type: monitorType,
      httpMethod: isHttpType(monitorType) ? httpMethod : undefined,
      requestHeaders: requestHeaders.length > 0 ? requestHeaders : undefined,
      requestBody: requestBody.trim() || undefined,
      keyword: keyword.trim() || undefined,
      expectedStatusCode: expectedStatusCode
        ? Number(expectedStatusCode)
        : undefined,
      followRedirects: isHttpType(monitorType) ? followRedirects : undefined,
      checkIntervalSeconds: Number(checkInterval) || 180,
      requestTimeoutSeconds: Number(requestTimeout) || 30,
      regions: regions.length > 0 ? regions : undefined,
      ipVersion,
      sslVerification: isHttpType(monitorType) ? sslVerification : undefined,
      notificationChannels,
      escalationPolicy,
    };

    create(dto, {
      onSuccess: () => {
        toast.success('Monitor created');
        navigate({ to: '/dashboard/uptime/monitors' });
      },
      onError: (error: unknown) => {
        const message =
          error instanceof Error ? error.message : 'Failed to create monitor';
        toast.error(message);
      },
    });
  }

  function addHeader() {
    setRequestHeaders((prev) => [...prev, { name: '', value: '' }]);
  }

  function removeHeader(index: number) {
    setRequestHeaders((prev) => prev.filter((_, i) => i !== index));
  }

  function updateHeader(index: number, field: 'name' | 'value', val: string) {
    setRequestHeaders((prev) =>
      prev.map((h, i) => (i === index ? { ...h, [field]: val } : h)),
    );
  }

  function toggleRegion(region: MonitorRegion) {
    setRegions((prev) =>
      prev.includes(region)
        ? prev.filter((r) => r !== region)
        : [...prev, region],
    );
  }

  function toggleChannel(channel: NotificationChannel) {
    setNotificationChannels((prev) =>
      prev.includes(channel)
        ? prev.filter((c) => c !== channel)
        : [...prev, channel],
    );
  }

  return (
    <div className="pt-6 space-y-6 max-w-3xl">
      <div className="flex items-center justify-between gap-3 px-1">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Create Monitor
          </h1>
          <p className="text-muted-foreground text-sm">
            Set up a new uptime monitor for your service
          </p>
        </div>
        <Button variant="ghost" asChild>
          <Link to="/dashboard/uptime/monitors">Cancel</Link>
        </Button>
      </div>

      <nav className="px-1 space-y-4" aria-label="Create monitor steps">
        <div className="sm:hidden space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Step {stepIndex + 1} of {STEPS.length}
          </p>
          <p className="text-base font-semibold leading-none">
            {STEPS[stepIndex].title}
          </p>
          <div className="flex gap-1.5 pt-1" aria-label="Jump to step">
            {STEPS.map((s, i) => {
              const navigable = canNavigateToStep(i);
              const isDone = i < stepIndex;
              const isCurrent = i === stepIndex;
              return (
                <button
                  key={s.id}
                  type="button"
                  aria-current={isCurrent ? 'step' : undefined}
                  aria-label={`${s.title}, step ${i + 1} of ${STEPS.length}${isCurrent ? ', current' : ''}${!navigable ? ', complete basics first' : ''}`}
                  disabled={!navigable}
                  title={
                    navigable
                      ? `Go to ${s.title}`
                      : 'Fill name, URL, and monitor type first'
                  }
                  onClick={() => navigable && setStep(s.id)}
                  className={cn(
                    'h-2 flex-1 min-w-0 rounded-full transition-all',
                    (isDone || isCurrent) && 'bg-primary',
                    !isDone && !isCurrent && 'bg-muted',
                    isCurrent &&
                      'ring-2 ring-primary ring-offset-2 ring-offset-background',
                    navigable &&
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    !navigable && 'cursor-not-allowed opacity-60',
                  )}
                />
              );
            })}
          </div>
        </div>

        <div className="hidden sm:flex items-center w-full min-w-0 overflow-x-auto pb-1 -mb-1 [scrollbar-width:thin]">
          {STEPS.map((s, i) => {
            const isActive = s.id === step;
            const isCompleted = i < stepIndex;
            const navigable = canNavigateToStep(i);
            return (
              <Fragment key={s.id}>
                {i > 0 && (
                  <div
                    aria-hidden
                    className={cn(
                      'h-0.5 flex-1 min-w-[0.75rem] max-w-28 shrink transition-colors',
                      i <= stepIndex ? 'bg-primary/40' : 'bg-border',
                    )}
                  />
                )}
                <button
                  type="button"
                  aria-current={isActive ? 'step' : undefined}
                  aria-label={`${s.title}, step ${i + 1} of ${STEPS.length}${!navigable ? ', complete basics first' : ''}`}
                  disabled={!navigable}
                  title={
                    navigable
                      ? `Go to ${s.title}`
                      : 'Fill name, URL, and monitor type first'
                  }
                  onClick={() => navigable && setStep(s.id)}
                  className={cn(
                    'flex shrink-0 items-center gap-2 rounded-lg px-1 py-0.5 text-left transition-colors',
                    navigable &&
                      'hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    !navigable && 'cursor-not-allowed opacity-50',
                  )}
                >
                  <span
                    className={cn(
                      'flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors',
                      isActive &&
                        'bg-primary text-primary-foreground shadow-sm',
                      !isActive && isCompleted && 'bg-primary/15 text-primary',
                      !isActive &&
                        !isCompleted &&
                        'bg-muted text-muted-foreground',
                    )}
                  >
                    {isCompleted ? (
                      <Check className="size-3.5" aria-hidden />
                    ) : (
                      <span aria-hidden>{i + 1}</span>
                    )}
                  </span>
                  <span
                    className={cn(
                      'text-sm font-medium whitespace-nowrap',
                      isActive ? 'text-foreground' : 'text-muted-foreground',
                    )}
                  >
                    {s.title}
                  </span>
                </button>
              </Fragment>
            );
          })}
        </div>
      </nav>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.15 }}
        >
          {step === 'basics' && (
            <Card className="shadow-none">
              <CardHeader>
                <CardTitle className="text-lg">Basic Information</CardTitle>
                <CardDescription>
                  Name your monitor and specify the URL to check.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-2">
                  <Label htmlFor="monitor-name">Monitor name</Label>
                  <Input
                    id="monitor-name"
                    placeholder="My Website"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="monitor-url">URL</Label>
                  <Input
                    id="monitor-url"
                    placeholder="https://example.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                </div>

                <div className="grid gap-3">
                  <Label>Monitor type</Label>
                  <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
                    {MONITOR_TYPES.map(
                      ({ value, label, description, icon: Icon }) => {
                        const selected = monitorType === value;
                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setMonitorType(value)}
                            className={`flex items-start gap-3 rounded-xl p-3 border transition-all text-left ${
                              selected
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-muted-foreground/30'
                            }`}
                          >
                            <div
                              className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${
                                selected
                                  ? 'bg-primary/10 text-primary'
                                  : 'bg-muted text-muted-foreground'
                              }`}
                            >
                              <Icon className="size-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium text-sm">{label}</div>
                              <div className="text-xs text-muted-foreground">
                                {description}
                              </div>
                            </div>
                          </button>
                        );
                      },
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 'request' && (
            <Card className="shadow-none">
              <CardHeader>
                <CardTitle className="text-lg">Request Configuration</CardTitle>
                <CardDescription>
                  Configure how the monitor checks your service.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {isHttpType(monitorType) && (
                  <>
                    <div className="grid gap-2">
                      <Label>HTTP Method</Label>
                      <Select
                        value={httpMethod}
                        onValueChange={(v) => setHttpMethod(v as HttpMethod)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {HTTP_METHODS.map((m) => (
                            <SelectItem key={m} value={m}>
                              {m}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <div className="flex items-center justify-between">
                        <Label>Request Headers</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addHeader}
                        >
                          <Plus className="size-3 mr-1" /> Add
                        </Button>
                      </div>
                      {requestHeaders.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                          No custom headers configured.
                        </p>
                      )}
                      {requestHeaders.map((header, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Input
                            placeholder="Header name"
                            value={header.name}
                            onChange={(e) =>
                              updateHeader(i, 'name', e.target.value)
                            }
                            className="flex-1"
                          />
                          <Input
                            placeholder="Value"
                            value={header.value}
                            onChange={(e) =>
                              updateHeader(i, 'value', e.target.value)
                            }
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="shrink-0 size-9"
                            onClick={() => removeHeader(i)}
                          >
                            <Minus className="size-4" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    {['POST', 'PUT', 'PATCH'].includes(httpMethod) && (
                      <div className="grid gap-2">
                        <Label>Request Body</Label>
                        <Textarea
                          placeholder='{"key": "value"}'
                          value={requestBody}
                          onChange={(e) => setRequestBody(e.target.value)}
                          rows={4}
                          className="font-mono text-sm"
                        />
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="follow-redirects"
                        checked={followRedirects}
                        onCheckedChange={(v) => setFollowRedirects(v === true)}
                      />
                      <Label
                        htmlFor="follow-redirects"
                        className="text-sm font-normal"
                      >
                        Follow redirects
                      </Label>
                    </div>
                  </>
                )}

                {(monitorType === 'HTTP_KEYWORD_MISSING' ||
                  monitorType === 'HTTP_KEYWORD_PRESENT') && (
                  <div className="grid gap-2">
                    <Label>Keyword</Label>
                    <Input
                      placeholder="Enter keyword to search for"
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                    />
                  </div>
                )}

                {monitorType === 'HTTP_STATUS_CODE' && (
                  <div className="grid gap-2">
                    <Label>Expected Status Code</Label>
                    <Input
                      placeholder="200"
                      type="number"
                      value={expectedStatusCode}
                      onChange={(e) => setExpectedStatusCode(e.target.value)}
                    />
                  </div>
                )}

                {!isHttpType(monitorType) && (
                  <p className="text-sm text-muted-foreground">
                    No additional request configuration needed for{' '}
                    <Badge variant="secondary">{monitorType}</Badge> monitors.
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {step === 'schedule' && (
            <Card className="shadow-none">
              <CardHeader>
                <CardTitle className="text-lg">Schedule & Regions</CardTitle>
                <CardDescription>
                  Set how often and from where to check your service.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label>Check Interval</Label>
                    <Select
                      value={checkInterval}
                      onValueChange={setCheckInterval}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">Every 30 seconds</SelectItem>
                        <SelectItem value="60">Every 1 minute</SelectItem>
                        <SelectItem value="180">Every 3 minutes</SelectItem>
                        <SelectItem value="300">Every 5 minutes</SelectItem>
                        <SelectItem value="600">Every 10 minutes</SelectItem>
                        <SelectItem value="1800">Every 30 minutes</SelectItem>
                        <SelectItem value="3600">Every 1 hour</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label>Request Timeout</Label>
                    <Select
                      value={requestTimeout}
                      onValueChange={setRequestTimeout}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 seconds</SelectItem>
                        <SelectItem value="10">10 seconds</SelectItem>
                        <SelectItem value="15">15 seconds</SelectItem>
                        <SelectItem value="30">30 seconds</SelectItem>
                        <SelectItem value="60">60 seconds</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-3">
                  <Label>Monitoring Regions</Label>
                  <div className="grid gap-2 grid-cols-2">
                    {REGIONS.map(({ value, label }) => {
                      const selected = regions.includes(value);
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => toggleRegion(value)}
                          className={`flex items-center gap-2 rounded-lg border p-3 text-sm transition-all ${
                            selected
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-muted-foreground/30'
                          }`}
                        >
                          <div
                            className={`flex size-5 items-center justify-center rounded border ${
                              selected
                                ? 'bg-primary border-primary text-primary-foreground'
                                : 'border-muted-foreground/30'
                            }`}
                          >
                            {selected && <Check className="size-3" />}
                          </div>
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>IP Version</Label>
                  <Select
                    value={ipVersion}
                    onValueChange={(v) => setIpVersion(v as IpVersion)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BOTH">IPv4 + IPv6</SelectItem>
                      <SelectItem value="IPV4">IPv4 only</SelectItem>
                      <SelectItem value="IPV6">IPv6 only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {isHttpType(monitorType) && (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="ssl-verification"
                      checked={sslVerification}
                      onCheckedChange={(v) => setSslVerification(v === true)}
                    />
                    <Label
                      htmlFor="ssl-verification"
                      className="text-sm font-normal"
                    >
                      Verify SSL certificate
                    </Label>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {step === 'notifications' && (
            <Card className="shadow-none">
              <CardHeader>
                <CardTitle className="text-lg">Alert Settings</CardTitle>
                <CardDescription>
                  Choose how you want to be notified when an incident occurs.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-3">
                  <Label>Notification Channels</Label>
                  <div className="space-y-2">
                    {NOTIFICATION_CHANNELS.map(({ value, label }) => (
                      <div key={value} className="flex items-center gap-2">
                        <Checkbox
                          id={`channel-${value}`}
                          checked={notificationChannels.includes(value)}
                          onCheckedChange={() => toggleChannel(value)}
                        />
                        <Label
                          htmlFor={`channel-${value}`}
                          className="text-sm font-normal"
                        >
                          {label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>Escalation Policy</Label>
                  <Select
                    value={escalationPolicy}
                    onValueChange={(v) =>
                      setEscalationPolicy(v as EscalationPolicy)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ESCALATION_POLICIES.map(({ value, label }) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Defines how quickly team members are notified after an
                    incident is detected.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-between px-1 pb-6">
        <Button variant="outline" onClick={goPrev} disabled={stepIndex === 0}>
          <ArrowLeft className="size-4 mr-1" /> Previous
        </Button>

        {stepIndex < STEPS.length - 1 ? (
          <Button onClick={goNext} disabled={!canNavigateToStep(stepIndex + 1)}>
            Next <ArrowRight className="size-4 ml-1" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={!canSubmit || isPending}>
            {isPending ? (
              <>
                <Loader2 className="size-4 mr-1 animate-spin" /> Creating...
              </>
            ) : (
              <>
                <Check className="size-4 mr-1" /> Create Monitor
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
