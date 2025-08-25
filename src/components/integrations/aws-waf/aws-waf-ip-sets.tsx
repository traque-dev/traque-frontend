import {
  GetIPSetCommand,
  type GetIPSetCommandOutput,
  type IPSetSummary,
  ListIPSetsCommand,
  type ListIPSetsCommandOutput,
} from '@aws-sdk/client-wafv2';
import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAwsWafClient } from '@/hooks/use-aws-waf-client';
import { auth } from '@/lib/auth';
import { AwsWafIpSetSheet } from './aws-waf-ip-set-sheet';

type WafIpSet = {
  id: string;
  name: string;
  type: string;
  addresses: number;
};

export function AwsWafIpSets() {
  const { data: activeOrganization } = auth.useActiveOrganization();
  const organizationId = activeOrganization?.id;
  const { client: wafClient, isConnected } = useAwsWafClient();

  const {
    data: ipSets = [],
    isPending,
    isError,
  } = useQuery<WafIpSet[]>({
    queryKey: ['aws-waf', 'ipsets', organizationId],
    enabled: !!wafClient && !!organizationId && isConnected,
    retry: false,
    queryFn: async () => {
      if (!wafClient) return [];

      const allSets: WafIpSet[] = [];

      let nextMarker: string | undefined = undefined;
      do {
        const listResp: ListIPSetsCommandOutput = await wafClient.send(
          new ListIPSetsCommand({ Scope: 'REGIONAL', NextMarker: nextMarker }),
        );

        const summaries = listResp.IPSets ?? [];
        const pageDetails = await Promise.all(
          summaries.map(async (summary: IPSetSummary) => {
            if (!summary.Id || !summary.Name) return null;
            try {
              const detailResp: GetIPSetCommandOutput = await wafClient.send(
                new GetIPSetCommand({
                  Scope: 'REGIONAL',
                  Id: summary.Id,
                  Name: summary.Name,
                }),
              );
              const ipset = detailResp.IPSet;
              return {
                id: summary.Id,
                name: ipset?.Name ?? summary.Name,
                type: ipset?.IPAddressVersion ?? '—',
                addresses: ipset?.Addresses?.length ?? 0,
              } satisfies WafIpSet;
            } catch {
              return {
                id: summary.Id,
                name: summary.Name,
                type: '—',
                addresses: 0,
              } satisfies WafIpSet;
            }
          }),
        );

        for (const row of pageDetails) if (row) allSets.push(row);

        nextMarker = listResp.NextMarker;
      } while (nextMarker);

      return allSets;
    },
  });

  const columns: ColumnDef<WafIpSet>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => row.original.name,
      },
      {
        accessorKey: 'type',
        header: 'Type',
        cell: ({ getValue }) => (
          <span className="text-muted-foreground">{getValue() as string}</span>
        ),
      },
      {
        accessorKey: 'addresses',
        header: () => <div className="text-right">Addresses</div>,
        cell: ({ getValue }) => (
          <div className="text-right font-mono tabular-nums">
            {(getValue() as number).toLocaleString()}
          </div>
        ),
      },
      {
        id: 'actions',
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => (
          <div className="text-right">
            <AwsWafIpSetSheet id={row.original.id} name={row.original.name}>
              <Button size="sm" variant="outline">
                Manage
              </Button>
            </AwsWafIpSetSheet>
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <Card className="border-muted/50 shadow-none">
      <CardHeader className="border-b">
        <CardTitle className="text-base">IP sets</CardTitle>
        <CardDescription>Reusable lists of IP addresses</CardDescription>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={ipSets}
          isLoading={isPending}
          emptyText={isError ? 'Failed to load IP sets' : 'No IP sets found'}
          className="[&>div]:border-none space-y-0"
        />
      </CardContent>
    </Card>
  );
}
