import type { Base } from '@/types/base';

export type ClickDeviceType =
  | 'DESKTOP'
  | 'MOBILE'
  | 'TABLET'
  | 'BOT'
  | 'UNKNOWN';

export type ClickBreakdownDimension =
  | 'country'
  | 'referer'
  | 'device'
  | 'browser'
  | 'os';

export type ClickTimePeriod = 'day' | 'week' | 'month';

export type ShortLink = Base & {
  id: string;
  createdAt: string;
  updatedAt: string;
  slug: string;
  domain: string;
  /** Computed `https://{domain}/{slug}` — read-only display/copy value */
  shortUrl: string;
  destinationUrl: string;
  title?: string;
  description?: string;
  isActive: boolean;
  expiresAt?: string | null;
  clickLimit?: number | null;
  clickCount: number;
  lastClickedAt?: string | null;
  metadata?: Record<string, unknown> | null;
};

export type ShortLinkClick = Base & {
  id: string;
  createdAt: string;
  updatedAt: string;
  clickedAt: string;
  country?: string | null;
  region?: string | null;
  city?: string | null;
  deviceType: ClickDeviceType;
  browser?: string | null;
  os?: string | null;
  refererDomain?: string | null;
  language?: string | null;
  isBot: boolean;
};

export type ShortLinkStats = {
  totalClicks: number;
  uniqueVisitors: number;
  clicksToday: number;
  clicksLast7Days: number;
  clicksLast30Days: number;
  lastClickedAt?: string | null;
};

export type ShortLinkTimePoint = {
  /** ISO date-time = bucket start */
  date: string;
  clicks: number;
};

export type ShortLinkBreakdownItem = {
  /** dimension value; null = unknown */
  key: string | null;
  count: number;
};

export type CreateShortLinkDTO = {
  destinationUrl: string;
  slug?: string;
  domain?: string;
  title?: string;
  description?: string;
  isActive?: boolean;
  expiresAt?: string;
  clickLimit?: number;
  metadata?: Record<string, unknown>;
};

/** PATCH body — slug and domain cannot be changed; all fields optional */
export type UpdateShortLinkDTO = {
  destinationUrl?: string;
  title?: string;
  description?: string;
  isActive?: boolean;
  expiresAt?: string | null;
  clickLimit?: number | null;
  metadata?: Record<string, unknown>;
};
