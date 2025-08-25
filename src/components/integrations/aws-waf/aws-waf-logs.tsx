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
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function AwsWafLogs() {
  return (
    <Card className="border-muted/50 shadow-none">
      <CardHeader className="border-b">
        <CardTitle className="text-base">Logs</CardTitle>
        <CardDescription>
          Recent events and matches (placeholder)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Source IP</TableHead>
              <TableHead>URI</TableHead>
              <TableHead>Rule</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(8)].map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  2025-08-23 12:{(i + 10).toString().padStart(2, '0')}
                </TableCell>
                <TableCell>203.0.113.{i + 10}</TableCell>
                <TableCell>/api/login</TableCell>
                <TableCell>AWS-AWSManagedRulesCommonRuleSet</TableCell>
                <TableCell className="text-red-600 dark:text-red-400">
                  Blocked
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableCaption>
            Showing latest 8 events. Connect to AWS to ingest real logs.
          </TableCaption>
        </Table>
      </CardContent>
    </Card>
  );
}
