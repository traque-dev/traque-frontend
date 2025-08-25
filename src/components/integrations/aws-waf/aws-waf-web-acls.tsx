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

export function AwsWafWebAcls() {
  const webAcls = useMemo(
    () => [
      {
        name: 'prod-web',
        scope: 'CLOUDFRONT',
        rules: 12,
        associated: 4,
        status: 'Active',
      },
      {
        name: 'api-edge',
        scope: 'REGIONAL',
        rules: 8,
        associated: 2,
        status: 'Active',
      },
      {
        name: 'staging',
        scope: 'REGIONAL',
        rules: 6,
        associated: 1,
        status: 'Idle',
      },
    ],
    [],
  );

  return (
    <Card className="border-muted/50 shadow-none">
      <CardHeader className="border-b">
        <CardTitle className="text-base">Web ACLs</CardTitle>
        <CardDescription>
          Overview of your web access control lists
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Scope</TableHead>
              <TableHead className="text-right">Rules</TableHead>
              <TableHead className="text-right">Associated resources</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {webAcls.map((acl) => (
              <TableRow key={acl.name}>
                <TableCell>{acl.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {acl.scope}
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums">
                  {acl.rules}
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums">
                  {acl.associated}
                </TableCell>
                <TableCell>
                  <span
                    className={
                      acl.status === 'Active'
                        ? 'inline-flex items-center gap-2'
                        : 'inline-flex items-center gap-2 text-muted-foreground'
                    }
                  >
                    <StatusDot connected={acl.status === 'Active'} />
                    {acl.status}
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
