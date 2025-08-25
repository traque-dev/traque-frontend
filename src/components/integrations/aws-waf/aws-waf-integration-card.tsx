import { Link } from '@tanstack/react-router';
import { AwsWafLogo } from '@/components/icons/aws-waf-logo';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { useAwsWafClient } from '@/hooks/use-aws-waf-client';
import { cn } from '@/lib/utils';
import { AwsWafIntegrationConnectDrawer } from './aws-waf-integration-connect-drawer';

export function AwsWafIntegrationCard() {
  const { isConnected } = useAwsWafClient();

  return (
    <>
      <Card className="group relative overflow-hidden border-muted/50 transition-shadow hover:shadow-md">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-muted/30 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <AwsWafLogo width={48} height={48} className="rounded-sm" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold leading-none">
                  AWS WAF
                </h3>
                <Badge variant="outline" className="rounded">
                  Security
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Web Application Firewall by AWS
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground">
            Protect your apps and APIs from common web exploits. Ingest findings
            and alerts to monitor threats in real-time.
          </p>
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span
              className={cn(
                'inline-flex h-2 w-2 rounded-full',
                isConnected ? 'bg-emerald-500' : 'bg-amber-500',
              )}
            />
            {isConnected ? 'Connected' : 'Not connected'}
          </div>
          <div className="flex gap-2">
            {isConnected && (
              <Link to="/dashboard/integrations/aws/waf">
                <Button size="sm">Open</Button>
              </Link>
            )}
            <AwsWafIntegrationConnectDrawer>
              <Button size="sm" variant={isConnected ? 'outline' : 'default'}>
                {isConnected ? 'Reconnect' : 'Connect'}
              </Button>
            </AwsWafIntegrationConnectDrawer>
            {!isConnected && (
              <Button size="sm" variant="outline">
                Learn more
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </>
  );
}
