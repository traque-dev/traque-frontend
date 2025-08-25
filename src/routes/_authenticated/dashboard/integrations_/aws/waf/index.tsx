import { createFileRoute } from '@tanstack/react-router';
import {
  AwsWafIpSets,
  AwsWafKpis,
  AwsWafLogs,
  AwsWafManagedGroups,
  AwsWafOverview,
  AwsWafRules,
  AwsWafWebAcls,
} from '@/components/integrations/aws-waf';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const Route = createFileRoute(
  '/_authenticated/dashboard/integrations_/aws/waf/',
)({
  component: AwsWafIntegrationPage,
});

function AwsWafIntegrationPage() {
  return (
    <div className="grid gap-6">
      <AwsWafKpis />

      <Tabs defaultValue="ipsets" className="mt-2">
        <TabsList>
          {/* <TabsTrigger value="overview">Overview</TabsTrigger> */}
          {/* <TabsTrigger value="webacls">Web ACLs</TabsTrigger> */}
          {/* <TabsTrigger value="rules">Rules</TabsTrigger> */}
          <TabsTrigger value="ipsets">IP sets</TabsTrigger>
          {/* <TabsTrigger value="managed">Managed groups</TabsTrigger> */}
          {/* <TabsTrigger value="logs">Logs</TabsTrigger> */}
        </TabsList>

        <TabsContent value="overview" className="grid gap-6">
          <AwsWafOverview />
        </TabsContent>

        <TabsContent value="webacls">
          <AwsWafWebAcls />
        </TabsContent>

        <TabsContent value="rules">
          <AwsWafRules />
        </TabsContent>

        <TabsContent value="ipsets">
          <AwsWafIpSets />
        </TabsContent>

        <TabsContent value="managed">
          <AwsWafManagedGroups />
        </TabsContent>

        <TabsContent value="logs">
          <AwsWafLogs />
        </TabsContent>
      </Tabs>
    </div>
  );
}
