import { useMemo } from 'react';
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

export function AwsWafRules() {
  const rules = useMemo(
    () => [
      {
        name: 'AWS-AWSManagedRulesCommonRuleSet',
        action: 'Block',
        priority: 1,
        matches: 9812,
      },
      { name: 'RateLimit-Login', action: 'Block', priority: 2, matches: 1243 },
      { name: 'Allow-HealthChecks', action: 'Allow', priority: 3, matches: 0 },
    ],
    [],
  );

  return (
    <Card className="border-muted/50 shadow-none">
      <CardHeader className="border-b">
        <CardTitle className="text-base">Rules</CardTitle>
        <CardDescription>Evaluation order and recent matches</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Action</TableHead>
              <TableHead className="text-right">Priority</TableHead>
              <TableHead className="text-right">Matches (24h)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rules.map((r) => (
              <TableRow key={r.name}>
                <TableCell>{r.name}</TableCell>
                <TableCell
                  className={
                    r.action === 'Block'
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-emerald-600 dark:text-emerald-400'
                  }
                >
                  {r.action}
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums">
                  {r.priority}
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums">
                  {r.matches.toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
