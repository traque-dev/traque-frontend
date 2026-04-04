import { axios } from '@/api/axios';
import type {
  AvailabilityPeriod,
  CreateMonitorDTO,
  Monitor,
  MonitorCheck,
  MonitorSummary,
  ResponseTimePoint,
  UpdateMonitorDTO,
} from '@/types/monitor';
import type { Organization } from '@/types/organization';
import type { Page } from '@/types/page';

const base = (orgId: string) =>
  `/api/v1/organizations/${orgId}/uptime/monitors`;

export async function getMonitors(
  organizationId: Organization['id'],
): Promise<Page<Monitor>> {
  const { data } = await axios.get<Page<Monitor>>(base(organizationId!));

  return data;
}

export async function getMonitorById(
  organizationId: Organization['id'],
  monitorId: string,
): Promise<Monitor> {
  const { data } = await axios.get<Monitor>(
    `${base(organizationId!)}/${monitorId}`,
  );
  return data;
}

export async function createMonitor(
  organizationId: Organization['id'],
  dto: CreateMonitorDTO,
): Promise<Monitor> {
  const { data } = await axios.post<Monitor>(base(organizationId!), dto);
  return data;
}

export async function updateMonitor(
  organizationId: Organization['id'],
  monitorId: string,
  dto: UpdateMonitorDTO,
): Promise<Monitor> {
  const { data } = await axios.patch<Monitor>(
    `${base(organizationId!)}/${monitorId}`,
    dto,
  );
  return data;
}

export async function deleteMonitor(
  organizationId: Organization['id'],
  monitorId: string,
): Promise<void> {
  await axios.delete(`${base(organizationId!)}/${monitorId}`);
}

export async function pauseMonitor(
  organizationId: Organization['id'],
  monitorId: string,
): Promise<Monitor> {
  const { data } = await axios.post<Monitor>(
    `${base(organizationId!)}/${monitorId}/pause`,
  );
  return data;
}

export async function resumeMonitor(
  organizationId: Organization['id'],
  monitorId: string,
): Promise<Monitor> {
  const { data } = await axios.post<Monitor>(
    `${base(organizationId!)}/${monitorId}/resume`,
  );
  return data;
}

export async function getMonitorChecks(
  organizationId: Organization['id'],
  monitorId: string,
): Promise<Page<MonitorCheck>> {
  const { data } = await axios.get<Page<MonitorCheck>>(
    `${base(organizationId!)}/${monitorId}/checks`,
  );
  return data;
}

export async function getMonitorSummary(
  organizationId: Organization['id'],
  monitorId: string,
): Promise<MonitorSummary> {
  const { data } = await axios.get<MonitorSummary>(
    `${base(organizationId!)}/${monitorId}/summary`,
  );
  return data;
}

export async function getMonitorResponseTimes(
  organizationId: Organization['id'],
  monitorId: string,
  params?: {
    region?: 'EUROPE' | 'NORTH_AMERICA' | 'ASIA' | 'AUSTRALIA';
    period?: 'day' | 'week' | 'month';
  },
): Promise<ResponseTimePoint[]> {
  const { data } = await axios.get<ResponseTimePoint[]>(
    `${base(organizationId!)}/${monitorId}/response-times`,
    { params },
  );
  return data;
}

export async function getMonitorAvailability(
  organizationId: Organization['id'],
  monitorId: string,
  params?: { from?: string; to?: string },
): Promise<AvailabilityPeriod[]> {
  const { data } = await axios.get<AvailabilityPeriod[]>(
    `${base(organizationId!)}/${monitorId}/availability`,
    { params },
  );
  return data;
}
