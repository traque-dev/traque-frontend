import { useMemo } from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function AwsWafOverview() {
  const trafficData = useMemo(
    () => [
      { h: '01:00', allowed: 4800, blocked: 50 },
      { h: '02:00', allowed: 4200, blocked: 41 },
      { h: '03:00', allowed: 3900, blocked: 38 },
      { h: '04:00', allowed: 5200, blocked: 55 },
      { h: '05:00', allowed: 7400, blocked: 72 },
      { h: '06:00', allowed: 9300, blocked: 95 },
      { h: '07:00', allowed: 10120, blocked: 104 },
      { h: '08:00', allowed: 11240, blocked: 121 },
      { h: '09:00', allowed: 10980, blocked: 115 },
      { h: '10:00', allowed: 9870, blocked: 98 },
      { h: '11:00', allowed: 8120, blocked: 74 },
      { h: '12:00', allowed: 6900, blocked: 61 },
    ],
    [],
  );

  const chartConfig = useMemo(
    () => ({
      allowed: { label: 'Allowed', color: 'hsl(var(--chart-2))' },
      blocked: { label: 'Blocked', color: 'hsl(var(--chart-5))' },
    }),
    [],
  );

  const topIps = useMemo(
    () => [
      { ip: '203.0.113.12', country: 'US', requests: 12432, blocked: 312 },
      { ip: '198.51.100.45', country: 'DE', requests: 11021, blocked: 128 },
      { ip: '192.0.2.77', country: 'BR', requests: 8421, blocked: 451 },
      { ip: '2a02:26f0::1', country: 'NL', requests: 5310, blocked: 34 },
      { ip: '2001:db8::9', country: 'SG', requests: 4120, blocked: 17 },
    ],
    [],
  );

  const topUris = useMemo(
    () => [
      { uri: '/api/login', requests: 58112, blocked: 1321 },
      { uri: '/api/orders', requests: 44102, blocked: 342 },
      { uri: '/checkout', requests: 39214, blocked: 98 },
      { uri: '/search', requests: 35101, blocked: 77 },
      { uri: '/admin', requests: 1821, blocked: 812 },
    ],
    [],
  );

  return (
    <>
      <Card className="border-muted/50 shadow-none">
        <CardHeader className="border-b">
          <CardTitle className="text-base">Traffic trend (24h)</CardTitle>
          <CardDescription>
            Allowed vs blocked requests over the last day
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="aspect-[2.4]">
            <AreaChart data={trafficData} margin={{ left: 8, right: 8 }}>
              <defs>
                <linearGradient id="fillAllowed" x1="0" x2="0" y1="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--chart-2)"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--chart-2)"
                    stopOpacity={0}
                  />
                </linearGradient>
                <linearGradient id="fillBlocked" x1="0" x2="0" y1="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--chart-5)"
                    stopOpacity={0.35}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--chart-5)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="h" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} width={40} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                dataKey="allowed"
                type="monotone"
                stroke="hsl(var(--chart-2))"
                fill="url(#fillAllowed)"
                strokeWidth={2}
                dot={false}
                name="Allowed"
              />
              <Area
                dataKey="blocked"
                type="monotone"
                stroke="hsl(var(--chart-5))"
                fill="url(#fillBlocked)"
                strokeWidth={2}
                dot={false}
                name="Blocked"
              />
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-muted/50 shadow-none">
          <CardHeader className="border-b">
            <CardTitle className="text-base">Top IP addresses</CardTitle>
            <CardDescription>Sources by volume and blocks</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>IP</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead className="text-right">Requests</TableHead>
                  <TableHead className="text-right">Blocked</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topIps.map((row) => (
                  <TableRow key={row.ip}>
                    <TableCell>{row.ip}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {row.country}
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums">
                      {row.requests.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums">
                      {row.blocked.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableCaption>Top 5 sources over the last 24 hours.</TableCaption>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-muted/50 shadow-none">
          <CardHeader className="border-b">
            <CardTitle className="text-base">Top URIs</CardTitle>
            <CardDescription>
              Endpoints receiving the most traffic
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Path</TableHead>
                  <TableHead className="text-right">Requests</TableHead>
                  <TableHead className="text-right">Blocked</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topUris.map((row) => (
                  <TableRow key={row.uri}>
                    <TableCell>{row.uri}</TableCell>
                    <TableCell className="text-right font-mono tabular-nums">
                      {row.requests.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums">
                      {row.blocked.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableCaption>
                Top 5 endpoints over the last 24 hours.
              </TableCaption>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
