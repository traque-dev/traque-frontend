import { axios } from '@/api/axios';
import type { EventNotificationTrigger } from '@/types/event';
import type { Organization } from '@/types/organization';
import type { Project } from '@/types/project';

export async function getEventNotificationTriggers(
  organizationId: Organization['id'],
  projectId: Project['id'],
): Promise<EventNotificationTrigger[]> {
  const url = `/api/v1/organizations/${organizationId}/projects/${projectId}/events/notification-triggers`;

  const { data } = await axios.get<EventNotificationTrigger[]>(url);

  return data;
}

export async function getEventNotificationTriggerById(
  organizationId: Organization['id'],
  projectId: Project['id'],
  notificationTriggerId: string,
): Promise<EventNotificationTrigger> {
  const url = `/api/v1/organizations/${organizationId}/projects/${projectId}/events/notification-triggers/${notificationTriggerId}`;

  const { data } = await axios.get<EventNotificationTrigger>(url);

  return data;
}

export async function createEventNotificationTrigger(
  organizationId: Organization['id'],
  projectId: Project['id'],
  payload: EventNotificationTrigger,
): Promise<EventNotificationTrigger> {
  const url = `/api/v1/organizations/${organizationId}/projects/${projectId}/events/notification-triggers`;

  const { data } = await axios.post<EventNotificationTrigger>(url, payload);

  return data;
}

export async function updateEventNotificationTrigger(
  organizationId: Organization['id'],
  projectId: Project['id'],
  notificationTriggerId: string,
  payload: Partial<EventNotificationTrigger>,
): Promise<EventNotificationTrigger> {
  const url = `/api/v1/organizations/${organizationId}/projects/${projectId}/events/notification-triggers/${notificationTriggerId}`;

  const { data } = await axios.put<EventNotificationTrigger>(url, payload);

  return data;
}

export async function deleteEventNotificationTrigger(
  organizationId: Organization['id'],
  projectId: Project['id'],
  notificationTriggerId: string,
): Promise<void> {
  const url = `/api/v1/organizations/${organizationId}/projects/${projectId}/events/notification-triggers/${notificationTriggerId}`;

  const { data } = await axios.delete(url);

  return data;
}
