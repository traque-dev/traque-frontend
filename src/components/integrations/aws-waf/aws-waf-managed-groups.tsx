import { useMemo } from 'react';
import { StatusDot } from '@/components/status-dot';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function AwsWafManagedGroups() {
  const managedGroups = useMemo(
    () => [
      {
        name: 'AWSManagedRulesKnownBadInputs',
        vendor: 'AWS',
        rules: 32,
        status: 'Enabled',
      },
      {
        name: 'AWSManagedRulesBotControl',
        vendor: 'AWS',
        rules: 14,
        status: 'Enabled',
      },
      { name: 'AnonymousIPList', vendor: 'AWS', rules: 10, status: 'Disabled' },
    ],
    [],
  );

  return (
    <Card className="border-muted/50 shadow-none">
      <CardHeader className="border-b">
        <CardTitle className="text-base">Managed rule groups</CardTitle>
        <CardDescription>
          Vendor-provided protections and status
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead className="text-right">Rules</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {managedGroups.map((g) => (
              <TableRow key={g.name}>
                <TableCell>{g.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {g.vendor}
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums">
                  {g.rules}
                </TableCell>
                <TableCell>
                  <span
                    className={
                      g.status === 'Enabled'
                        ? 'inline-flex items-center gap-2'
                        : 'inline-flex items-center gap-2 text-muted-foreground'
                    }
                  >
                    <StatusDot connected={g.status === 'Enabled'} />
                    {g.status}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
