import { axios } from '@/api/axios';
import type { Incident, TimelineEntry } from '@/types/incident';
import type { Organization } from '@/types/organization';
import type { Page } from '@/types/page';

const base = (orgId: string) =>
  `/api/v1/organizations/${orgId}/uptime/incidents`;

export async function getIncidents(
  organizationId: Organization['id'],
): Promise<Page<Incident>> {
  const { data } = await axios.get<Page<Incident>>(base(organizationId!));
  return data;
}

export async function getIncidentById(
  organizationId: Organization['id'],
  incidentId: string,
): Promise<Incident> {
  const { data } = await axios.get<Incident>(
    `${base(organizationId!)}/${incidentId}`,
  );
  return data;
}

export async function getIncidentTimeline(
  organizationId: Organization['id'],
  incidentId: string,
): Promise<TimelineEntry[]> {
  const { data } = await axios.get<TimelineEntry[]>(
    `${base(organizationId!)}/${incidentId}/timeline`,
  );
  return data;
}

export async function addIncidentComment(
  organizationId: Organization['id'],
  incidentId: string,
  body: { content: string },
): Promise<TimelineEntry> {
  const { data } = await axios.post<TimelineEntry>(
    `${base(organizationId!)}/${incidentId}/timeline`,
    body,
  );
  return data;
}

export async function acknowledgeIncident(
  organizationId: Organization['id'],
  incidentId: string,
): Promise<void> {
  await axios.post(`${base(organizationId!)}/${incidentId}/acknowledge`);
}

export async function resolveIncident(
  organizationId: Organization['id'],
  incidentId: string,
): Promise<void> {
  await axios.post(`${base(organizationId!)}/${incidentId}/resolve`);
}
