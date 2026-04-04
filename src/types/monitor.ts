import type { Base } from '@/types/base';

export type MonitorType =
  | 'HTTP_UNAVAILABLE'
  | 'HTTP_KEYWORD_MISSING'
  | 'HTTP_KEYWORD_PRESENT'
  | 'HTTP_STATUS_CODE'
  | 'PING'
  | 'TCP'
  | 'UDP'
  | 'SMTP'
  | 'POP3'
  | 'IMAP'
  | 'DNS'
  | 'PLAYWRIGHT';

export type HttpMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'
  | 'HEAD'
  | 'OPTIONS';

export type MonitorRegion = 'EUROPE' | 'NORTH_AMERICA' | 'ASIA' | 'AUSTRALIA';

export type IpVersion = 'IPV4' | 'IPV6' | 'BOTH';

export type NotificationChannel =
  | 'CALL'
  | 'SMS'
  | 'EMAIL'
  | 'PUSH'
  | 'CRITICAL_ALERT';

export type EscalationPolicy =
  | 'DO_NOTHING'
  | 'IMMEDIATELY'
  | 'WITHIN_3_MIN'
  | 'WITHIN_5_MIN'
  | 'WITHIN_10_MIN';

export type MaintenanceDay =
  | 'MON'
  | 'TUE'
  | 'WED'
  | 'THU'
  | 'FRI'
  | 'SAT'
  | 'SUN';

export type RequestHeader = {
  name: string;
  value: string;
};

export type MonitorStatus =
  | 'UP'
  | 'DOWN'
  | 'PAUSED'
  | 'PENDING'
  | 'MAINTENANCE';

export type Monitor = Base & {
  name: string;
  pronounceableName?: string;
  url: string;
  type: MonitorType;
  status?: MonitorStatus;
  checkIntervalSeconds: number;
  confirmationPeriodSeconds: number;
  recoveryPeriodSeconds: number;
  requestTimeoutSeconds: number;
  httpMethod: HttpMethod;
  requestBody?: string;
  requestHeaders?: RequestHeader[];
  followRedirects: boolean;
  keepCookiesOnRedirect: boolean;
  basicAuthUsername?: string;
  basicAuthPassword?: string;
  proxyHost?: string;
  proxyPort?: number;
  keyword?: string;
  expectedStatusCode?: number;
  port?: number;
  ipVersion: IpVersion;
  regions?: MonitorRegion[];
  sslVerification: boolean;
  sslExpirationAlertDays?: number;
  domainExpirationAlertDays?: number;
  maintenanceWindowStartTime?: string;
  maintenanceWindowEndTime?: string;
  maintenanceWindowTimezone?: string;
  maintenanceWindowDays?: MaintenanceDay[];
  notificationChannels: NotificationChannel[];
  escalationPolicy: EscalationPolicy;
  lastCheckedAt?: string | null;
  paused?: boolean;
};

export type CreateMonitorDTO = {
  name: string;
  pronounceableName?: string;
  url: string;
  type: MonitorType;
  checkIntervalSeconds?: number;
  confirmationPeriodSeconds?: number;
  recoveryPeriodSeconds?: number;
  requestTimeoutSeconds?: number;
  httpMethod?: HttpMethod;
  requestBody?: string;
  requestHeaders?: RequestHeader[];
  followRedirects?: boolean;
  keepCookiesOnRedirect?: boolean;
  basicAuthUsername?: string;
  basicAuthPassword?: string;
  proxyHost?: string;
  proxyPort?: number;
  keyword?: string;
  expectedStatusCode?: number;
  port?: number;
  ipVersion?: IpVersion;
  regions?: MonitorRegion[];
  sslVerification?: boolean;
  sslExpirationAlertDays?: number;
  domainExpirationAlertDays?: number;
  maintenanceWindowStartTime?: string;
  maintenanceWindowEndTime?: string;
  maintenanceWindowTimezone?: string;
  maintenanceWindowDays?: MaintenanceDay[];
  notificationChannels?: NotificationChannel[];
  escalationPolicy?: EscalationPolicy;
};

/** PATCH body — all fields optional per API */
export type UpdateMonitorDTO = Partial<CreateMonitorDTO>;

export type MonitorSummary = {
  // uptimePercentage?: number;
  currentlyUpForMs?: number;
  lastCheckedAt?: string;
  // lastResponseTimeMs?: number;
  // avgResponseTimeMs?: number;
};

export type MonitorCheck = Base & {
  status: 'UP' | 'DOWN';
  region: MonitorRegion | null;
  checkedAt: string;
  httpStatusCode: number | null;
  errorMessage: string | null;
  dnsLookupMs: number | null;
  tcpConnectionMs: number | null;
  tlsHandshakeMs: number | null;
  firstByteMs: number | null;
  totalResponseMs: number | null;
};

export type ResponseTimePoint = {
  checkedAt: string;
  dnsLookupMs: number | null;
  tcpConnectionMs: number | null;
  tlsHandshakeMs: number | null;
  totalResponseMs: number | null;
};

export type AvailabilityPeriod = {
  label: string;
  from: string;
  to: string;
  availabilityPercent: number;
  downtimeMs: number;
  incidentCount: number;
  longestDowntimeMs: number;
  averageDowntimeMs: number;
};
