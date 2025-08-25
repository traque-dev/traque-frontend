// import {
//   ListWebACLsCommand,
//   type ListWebACLsCommandOutput,
// } from '@aws-sdk/client-wafv2';
// import { useQuery } from '@tanstack/react-query';
// import { useMemo } from 'react';
import { toast } from 'sonner';
import { useDeleteAwsWafCredentials } from '@/api/integrations/aws/waf/hooks';
import { AwsWafLogo } from '@/components/icons/aws-waf-logo';
import { StatusDot } from '@/components/status-dot';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  //   CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAwsWafClient } from '@/hooks/use-aws-waf-client';
import { auth } from '@/lib/auth';
import { AwsWafIntegrationConnectDrawer } from './aws-waf-integration-connect-drawer';

export function AwsWafKpis() {
  const { isConnected, isLoading } = useAwsWafClient();

  const { data: activeOrganization } = auth.useActiveOrganization();
  const organizationId = activeOrganization?.id;
  const deleteCreds = useDeleteAwsWafCredentials(organizationId);

  //   const { data: webAclCount, isPending: isWebAclCountLoading } = useQuery({
  //     queryKey: ['aws-waf', 'kpis', 'web-acls-count', organizationId],
  //     enabled: !!wafClient && !!organizationId && isConnected,
  //     queryFn: async () => {
  //       if (!wafClient) return 0;

  //       const countForScope = async (scope: 'REGIONAL' | 'CLOUDFRONT') => {
  //         let nextMarker: string | undefined = undefined;
  //         let total = 0;
  //         do {
  //           const resp: ListWebACLsCommandOutput = await wafClient.send(
  //             new ListWebACLsCommand({ Scope: scope, NextMarker: nextMarker }),
  //           );
  //           console.log(`${scope}`, resp);
  //           total += resp.WebACLs?.length ?? 0;
  //           nextMarker = resp.NextMarker;
  //         } while (nextMarker);
  //         return total;
  //       };

  //       const [regional] = await Promise.all([
  //         countForScope('REGIONAL'),
  //         // countForScope('CLOUDFRONT'),
  //       ]);

  //       return regional + 0;
  //     },
  //     retry: false,
  //   });

  //   const kpis = useMemo(() => {
  //     const webAclsValue =
  //       !isConnected || !wafClient
  //         ? '—'
  //         : isWebAclCountLoading
  //           ? '…'
  //           : (webAclCount ?? 0).toLocaleString();

  //     return [
  //       { label: 'Total requests (24h)', value: '—' },
  //       { label: 'Blocked requests', value: '—' },
  //       { label: 'Block rate', value: '—' },
  //       { label: 'Active web ACLs', value: webAclsValue },
  //     ];
  //   }, [isConnected, wafClient, isWebAclCountLoading, webAclCount]);

  return (
    <Card className="border-none shadow-none pb-0">
      <CardHeader className="flex flex-row items-start justify-between gap-4 border-b">
        <div className="flex items-center gap-4">
          <AwsWafLogo width={48} height={48} className="rounded-sm" />
          <div>
            <CardTitle className="text-base">AWS WAF</CardTitle>
            <CardDescription>Web Application Firewall by AWS</CardDescription>
          </div>
        </div>
        <CardAction className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <StatusDot connected={isConnected} />
            {isLoading
              ? 'Checking…'
              : isConnected
                ? 'Connected'
                : 'Not connected'}
          </div>
          {isConnected ? (
            <div className="flex items-center gap-2">
              <AwsWafIntegrationConnectDrawer>
                <Button size="sm" variant="outline">
                  Reconnect
                </Button>
              </AwsWafIntegrationConnectDrawer>
              <Button
                size="sm"
                variant="destructive"
                disabled={deleteCreds.isPending}
                onClick={async () => {
                  try {
                    await deleteCreds.mutateAsync();
                    toast.success('Disconnected from AWS WAF');
                  } catch (e) {
                    toast.error('Failed to disconnect');
                  }
                }}
              >
                {deleteCreds.isPending ? 'Disconnecting…' : 'Disconnect'}
              </Button>
            </div>
          ) : (
            <AwsWafIntegrationConnectDrawer>
              <Button size="sm">Connect</Button>
            </AwsWafIntegrationConnectDrawer>
          )}
        </CardAction>
      </CardHeader>
      {/* <CardContent className="pt-0">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map((kpi) => (
            <Card key={kpi.label} className="border-muted/40">
              <CardHeader className="pb-2">
                <CardDescription>{kpi.label}</CardDescription>
                <CardTitle className="text-2xl">{kpi.value}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>
      </CardContent> */}
    </Card>
  );
}
