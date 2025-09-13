import type { Base } from '@/types/base';
import type { EventEnvironment } from '@/types/event-environment';
import type { EventPlatform } from '@/types/event-platform';

export enum HttpRequestMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
  OPTIONS = 'OPTIONS',
  HEAD = 'HEAD',
}

export type HttpContext = Base & {
  url?: string;
  method?: HttpRequestMethod;
  statusCode?: number;
  status?: string;
  clientIp?: string;
  response?: Record<string, unknown>;
};

export type StacktraceFrame = {
  frameIndex?: number;
  filename?: string;
  functionName?: string;
  lineNumber?: number;
  columnNumber?: number;
  absolutePath?: string;
  module?: string;
  inApp?: boolean;
  platform?: string;
};

export type Stacktrace = {
  stack?: string;
  frames?: StacktraceFrame[];
};

export type Exception = Base & {
  environment: EventEnvironment;
  platform: EventPlatform;
  name: string;
  message: string;
  details?: string;
  suggestion?: string;
  httpContext?: HttpContext;
  stacktrace?: Stacktrace;
};

export type ExceptionDailyStatistic = {
  date: string;
  count: number;
};
