import qs from 'query-string';
import { axios } from '@/api/axios';
import type { Event } from '@/types/event';
import type { Organization } from '@/types/organization';
import type { Page } from '@/types/page';
import type { Pageable } from '@/types/pageable';
import type { Project } from '@/types/project';

export async function getEvents(
  organizationId: Organization['id'],
  projectId: Project['id'],
  pageable: Pageable<Event>,
): Promise<Page<Event>> {
  const query = qs.stringify({
    ...pageable,
  });

  const url = `/api/v1/organizations/${organizationId}/projects/${projectId}/events?${query}`;

  const { data } = await axios.get<Page<Event>>(url);

  return data;
}
