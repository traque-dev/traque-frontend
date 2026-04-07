import { axios } from '@/api/axios';
import type {
  AddBugLabelDTO,
  AssignBugDTO,
  Bug,
  BugActivity,
  BugComment,
  BugLabel,
  BugReproductionStep,
  CaptureBugDTO,
  ChangeBugPriorityDTO,
  ChangeBugStatusDTO,
  CreateBugCommentDTO,
  CreateBugDTO,
  CreateBugLabelDTO,
  CreateBugReproductionStepDTO,
  PositiveResponse,
  ReorderBugReproductionStepsDTO,
  UpdateBugCommentDTO,
  UpdateBugDTO,
  UpdateBugLabelDTO,
  UpdateBugReproductionStepDTO,
} from '@/types/bug';
import type { Organization } from '@/types/organization';
import type { Page } from '@/types/page';
import type { Project } from '@/types/project';

const base = (organizationId: string, projectId: string) =>
  `/api/v1/organizations/${organizationId}/projects/${projectId}/bugs`;

export async function getBugs(
  organizationId: Organization['id'],
  projectId: Project['id'],
): Promise<Page<Bug>> {
  const { data } = await axios.get<Page<Bug>>(
    base(organizationId!, projectId!),
  );
  return data;
}

export async function createBug(
  organizationId: Organization['id'],
  projectId: Project['id'],
  dto: CreateBugDTO,
): Promise<Bug> {
  const { data } = await axios.post<Bug>(
    base(organizationId!, projectId!),
    dto,
  );
  return data;
}

export async function captureBugByProjectId(
  projectId: Project['id'],
  dto: CaptureBugDTO,
): Promise<Bug> {
  const url = `/api/v1/projects/${projectId}/bugs`;

  const { data } = await axios.post<Bug>(url, dto);

  return data;
}

/** Response shape is not defined in the OpenAPI spec. */
export async function getBugStatistics(
  organizationId: Organization['id'],
  projectId: Project['id'],
): Promise<unknown> {
  const { data } = await axios.get<unknown>(
    `${base(organizationId!, projectId!)}/statistics`,
  );
  return data;
}

export async function getBugById(
  organizationId: Organization['id'],
  projectId: Project['id'],
  bugId: string,
): Promise<Bug> {
  const { data } = await axios.get<Bug>(
    `${base(organizationId!, projectId!)}/${bugId}`,
  );
  return data;
}

export async function updateBug(
  organizationId: Organization['id'],
  projectId: Project['id'],
  bugId: string,
  dto: UpdateBugDTO,
): Promise<Bug> {
  const { data } = await axios.patch<Bug>(
    `${base(organizationId!, projectId!)}/${bugId}`,
    dto,
  );
  return data;
}

export async function deleteBug(
  organizationId: Organization['id'],
  projectId: Project['id'],
  bugId: string,
): Promise<PositiveResponse> {
  const { data } = await axios.delete<PositiveResponse>(
    `${base(organizationId!, projectId!)}/${bugId}`,
  );
  return data;
}

export async function changeBugStatus(
  organizationId: Organization['id'],
  projectId: Project['id'],
  bugId: string,
  dto: ChangeBugStatusDTO,
): Promise<PositiveResponse> {
  const { data } = await axios.put<PositiveResponse>(
    `${base(organizationId!, projectId!)}/${bugId}/status`,
    dto,
  );
  return data;
}

export async function changeBugPriority(
  organizationId: Organization['id'],
  projectId: Project['id'],
  bugId: string,
  dto: ChangeBugPriorityDTO,
): Promise<PositiveResponse> {
  const { data } = await axios.put<PositiveResponse>(
    `${base(organizationId!, projectId!)}/${bugId}/priority`,
    dto,
  );
  return data;
}

export async function assignBug(
  organizationId: Organization['id'],
  projectId: Project['id'],
  bugId: string,
  dto: AssignBugDTO,
): Promise<PositiveResponse> {
  const { data } = await axios.put<PositiveResponse>(
    `${base(organizationId!, projectId!)}/${bugId}/assignee`,
    dto,
  );
  return data;
}

export async function addLabelToBug(
  organizationId: Organization['id'],
  projectId: Project['id'],
  bugId: string,
  dto: AddBugLabelDTO,
): Promise<PositiveResponse> {
  const { data } = await axios.post<PositiveResponse>(
    `${base(organizationId!, projectId!)}/${bugId}/labels`,
    dto,
  );
  return data;
}

export async function removeLabelFromBug(
  organizationId: Organization['id'],
  projectId: Project['id'],
  bugId: string,
  labelId: string,
): Promise<PositiveResponse> {
  const { data } = await axios.delete<PositiveResponse>(
    `${base(organizationId!, projectId!)}/${bugId}/labels/${labelId}`,
  );
  return data;
}

export async function captureBug(
  apiKey: string,
  dto: CaptureBugDTO,
): Promise<PositiveResponse> {
  const { data } = await axios.post<PositiveResponse>('/api/v1/bugs', dto, {
    headers: { 'x-api-key': apiKey },
  });
  return data;
}

export async function getBugComments(
  organizationId: Organization['id'],
  projectId: Project['id'],
  bugId: string,
): Promise<Page<BugComment>> {
  const { data } = await axios.get<Page<BugComment>>(
    `${base(organizationId!, projectId!)}/${bugId}/comments`,
  );
  return data;
}

export async function createBugComment(
  organizationId: Organization['id'],
  projectId: Project['id'],
  bugId: string,
  dto: CreateBugCommentDTO,
): Promise<BugComment> {
  const { data } = await axios.post<BugComment>(
    `${base(organizationId!, projectId!)}/${bugId}/comments`,
    dto,
  );
  return data;
}

export async function updateBugComment(
  organizationId: Organization['id'],
  projectId: Project['id'],
  bugId: string,
  commentId: string,
  dto: UpdateBugCommentDTO,
): Promise<BugComment> {
  const { data } = await axios.patch<BugComment>(
    `${base(organizationId!, projectId!)}/${bugId}/comments/${commentId}`,
    dto,
  );
  return data;
}

export async function deleteBugComment(
  organizationId: Organization['id'],
  projectId: Project['id'],
  bugId: string,
  commentId: string,
): Promise<PositiveResponse> {
  const { data } = await axios.delete<PositiveResponse>(
    `${base(organizationId!, projectId!)}/${bugId}/comments/${commentId}`,
  );
  return data;
}

export async function getProjectBugLabels(
  organizationId: Organization['id'],
  projectId: Project['id'],
): Promise<BugLabel[]> {
  const { data } = await axios.get<BugLabel[]>(
    `${base(organizationId!, projectId!)}/labels`,
  );
  return data;
}

export async function createProjectBugLabel(
  organizationId: Organization['id'],
  projectId: Project['id'],
  dto: CreateBugLabelDTO,
): Promise<BugLabel> {
  const { data } = await axios.post<BugLabel>(
    `${base(organizationId!, projectId!)}/labels`,
    dto,
  );
  return data;
}

export async function updateProjectBugLabel(
  organizationId: Organization['id'],
  projectId: Project['id'],
  labelId: string,
  dto: UpdateBugLabelDTO,
): Promise<BugLabel> {
  const { data } = await axios.patch<BugLabel>(
    `${base(organizationId!, projectId!)}/labels/${labelId}`,
    dto,
  );
  return data;
}

export async function deleteProjectBugLabel(
  organizationId: Organization['id'],
  projectId: Project['id'],
  labelId: string,
): Promise<PositiveResponse> {
  const { data } = await axios.delete<PositiveResponse>(
    `${base(organizationId!, projectId!)}/labels/${labelId}`,
  );
  return data;
}

export async function getBugReproductionSteps(
  organizationId: Organization['id'],
  projectId: Project['id'],
  bugId: string,
): Promise<BugReproductionStep[]> {
  const { data } = await axios.get<BugReproductionStep[]>(
    `${base(organizationId!, projectId!)}/${bugId}/steps`,
  );
  return data;
}

export async function createBugReproductionStep(
  organizationId: Organization['id'],
  projectId: Project['id'],
  bugId: string,
  dto: CreateBugReproductionStepDTO,
): Promise<BugReproductionStep> {
  const { data } = await axios.post<BugReproductionStep>(
    `${base(organizationId!, projectId!)}/${bugId}/steps`,
    dto,
  );
  return data;
}

export async function updateBugReproductionStep(
  organizationId: Organization['id'],
  projectId: Project['id'],
  bugId: string,
  stepId: string,
  dto: UpdateBugReproductionStepDTO,
): Promise<BugReproductionStep> {
  const { data } = await axios.patch<BugReproductionStep>(
    `${base(organizationId!, projectId!)}/${bugId}/steps/${stepId}`,
    dto,
  );
  return data;
}

export async function deleteBugReproductionStep(
  organizationId: Organization['id'],
  projectId: Project['id'],
  bugId: string,
  stepId: string,
): Promise<PositiveResponse> {
  const { data } = await axios.delete<PositiveResponse>(
    `${base(organizationId!, projectId!)}/${bugId}/steps/${stepId}`,
  );
  return data;
}

export async function reorderBugReproductionSteps(
  organizationId: Organization['id'],
  projectId: Project['id'],
  bugId: string,
  dto: ReorderBugReproductionStepsDTO,
): Promise<BugReproductionStep[]> {
  const { data } = await axios.put<BugReproductionStep[]>(
    `${base(organizationId!, projectId!)}/${bugId}/steps/reorder`,
    dto,
  );
  return data;
}

export async function getBugActivities(
  organizationId: Organization['id'],
  projectId: Project['id'],
  bugId: string,
): Promise<Page<BugActivity>> {
  const { data } = await axios.get<Page<BugActivity>>(
    `${base(organizationId!, projectId!)}/${bugId}/activities`,
  );
  return data;
}
