import {
  GetIPSetCommand,
  type GetIPSetCommandOutput,
  UpdateIPSetCommand,
} from '@aws-sdk/client-wafv2';
import { revalidateLogic, useForm } from '@tanstack/react-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { type } from 'arktype';
import type { PropsWithChildren } from 'react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { TrashBinMinimalistic2Linear } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useAwsWafClient } from '@/hooks/use-aws-waf-client';
import { auth } from '@/lib/auth';

export type AwsWafIpSetSheetProps = PropsWithChildren<{
  id: string;
  name: string;
  scope?: 'REGIONAL' | 'CLOUDFRONT';
}>;

const newIpFormSchema = type({
  ip: type(
    'string & /^(?:\\s*)(?:25[0-5]|2[0-4]\\d|1?\\d?\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1?\\d?\\d)){3}\\/(?:3[0-2]|[12]?\\d)(?:\\s*)$/',
  ).configure({
    message: 'Enter a valid IPv4 CIDR (e.g. 203.0.113.0/24)',
  }),
});

export function AwsWafIpSetSheet({
  id,
  name,
  scope = 'REGIONAL',
  children,
}: AwsWafIpSetSheetProps) {
  const { data: activeOrganization } = auth.useActiveOrganization();
  const organizationId = activeOrganization?.id;

  const { client: wafClient } = useAwsWafClient();
  const [open, setOpen] = useState(false);

  const queryKey = useMemo(
    () => ['aws-waf', 'ipset', organizationId, id, scope, name],
    [organizationId, id, scope, name],
  );

  const { data, isPending, isError, refetch } = useQuery<{
    addresses: string[];
    lockToken: string;
    ipVersion?: string;
  }>({
    queryKey,
    enabled: open && !!wafClient && !!organizationId,
    retry: false,
    queryFn: async () => {
      if (!wafClient) throw new Error('No WAF client');
      const resp: GetIPSetCommandOutput = await wafClient.send(
        new GetIPSetCommand({ Scope: scope, Id: id, Name: name }),
      );
      return {
        addresses: resp.IPSet?.Addresses ?? [],
        lockToken: resp.LockToken ?? '',
        ipVersion: resp.IPSet?.IPAddressVersion,
      };
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (nextAddresses: string[]) => {
      if (!wafClient) throw new Error('No WAF client');
      // Always fetch latest lock token just before update to avoid optimistic lock errors
      const latest = await wafClient.send(
        new GetIPSetCommand({ Scope: scope, Id: id, Name: name }),
      );
      const latestLock = latest.LockToken ?? '';
      await wafClient.send(
        new UpdateIPSetCommand({
          Scope: scope,
          Id: id,
          Name: name,
          LockToken: latestLock,
          Addresses: nextAddresses,
        }),
      );
    },
    onSuccess: async () => {
      await refetch();
    },
    onError: () => {
      toast.error('Failed to update IP set');
    },
  });

  const handleRemove = async (ip: string) => {
    if (!data) return;

    try {
      await updateMutation.mutateAsync(data.addresses.filter((a) => a !== ip));
      toast.success('IP removed');
    } catch {
      toast.error('Failed to remove IP');
    }
  };

  const form = useForm({
    defaultValues: {
      ip: '',
    },
    validationLogic: revalidateLogic({
      mode: 'submit',
      modeAfterSubmission: 'blur',
    }),
    validators: {
      onDynamic: newIpFormSchema,
    },
    onSubmit: async (formValues) => {
      await updateMutation.mutateAsync([
        ...(data?.addresses ?? []),
        formValues.value.ip,
      ]);
      toast.success('IP added');
    },
  });

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="p-0">
        <SheetHeader>
          <SheetTitle>Manage IP set</SheetTitle>
          <SheetDescription>
            {name} • {scope}
            {data?.ipVersion ? ` • ${data.ipVersion}` : null}
          </SheetDescription>
        </SheetHeader>

        <div className="px-4 pb-4 space-y-4 flex-1 min-h-0 flex flex-col">
          <div className="flex gap-2">
            <form.Field
              name="ip"
              children={(field) => (
                <div className="flex-1">
                  <Input
                    placeholder="e.g. 203.0.113.5/32"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    disabled={updateMutation.isPending}
                    onBlur={field.handleBlur}
                    autoFocus={false}
                  />
                  {field.state.meta.errors ? (
                    <div className="text-sm text-destructive">
                      {field.state.meta.errors.join(', ')}
                    </div>
                  ) : null}
                </div>
              )}
            />

            <Button onClick={() => form.handleSubmit()}>
              {updateMutation.isPending ? 'Updating...' : 'Add IP'}
            </Button>
          </div>

          <div className="rounded-md border flex flex-col flex-1 min-h-0">
            <div className="flex items-center justify-between border-b px-3 py-2">
              <div className="text-sm text-muted-foreground">
                Addresses ({data?.addresses.length ?? 0})
              </div>
            </div>
            <div className="flex-1 min-h-0">
              {isPending ? (
                <div className="px-3 py-8 text-center text-sm text-muted-foreground">
                  Loading…
                </div>
              ) : isError ? (
                <div className="px-3 py-8 text-center text-sm text-destructive">
                  Failed to load IP set
                </div>
              ) : (data?.addresses.length ?? 0) === 0 ? (
                <div className="px-3 py-8 text-center text-sm text-muted-foreground">
                  No IPs yet. Add one above.
                </div>
              ) : (
                <ScrollArea className="h-full">
                  <ul className="divide-y">
                    {data?.addresses.map((ip) => (
                      <li
                        key={ip}
                        className="flex items-center justify-between px-3 py-2"
                      >
                        <span className="font-mono text-sm">{ip}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="size-6"
                          onClick={() => handleRemove(ip)}
                          disabled={updateMutation.isPending}
                        >
                          <TrashBinMinimalistic2Linear className="size-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
