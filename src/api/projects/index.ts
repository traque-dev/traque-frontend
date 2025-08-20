import { axios } from '@/api/axios';
import type { Organization } from '@/types/organization';
import type { Project } from '@/types/project';

export async function getProjects(
  organizationId: Organization['id'],
): Promise<Project[]> {
  const url = `/api/v1/organizations/${organizationId}/projects`;

  const { data } = await axios.get<Project[]>(url);

  return data;
}

export async function getProjectById(
  organizationId: Organization['id'],
  projectId: Project['id'],
): Promise<Project> {
  const url = `/api/v1/organizations/${organizationId}/projects/${projectId}`;

  const { data } = await axios.get<Project>(url);

  return data;
}

export async function createProject(
  organizationId: Organization['id'],
  project: Project,
): Promise<Project> {
  const url = `/api/v1/organizations/${organizationId}/projects`;

  const { data } = await axios.post<Project>(url, project);

  return data;
}
