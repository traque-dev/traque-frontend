import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  AddBugLabelDTO,
  AssignBugDTO,
  CaptureBugDTO,
  ChangeBugPriorityDTO,
  ChangeBugStatusDTO,
  CreateBugCommentDTO,
  CreateBugDTO,
  CreateBugLabelDTO,
  CreateBugReproductionStepDTO,
  ReorderBugReproductionStepsDTO,
  UpdateBugCommentDTO,
  UpdateBugDTO,
  UpdateBugLabelDTO,
  UpdateBugReproductionStepDTO,
} from '@/types/bug';
import type { Organization } from '@/types/organization';
import type { Project } from '@/types/project';
import {
  addLabelToBug,
  assignBug,
  captureBug,
  changeBugPriority,
  changeBugStatus,
  createBug,
  createBugComment,
  createBugReproductionStep,
  createProjectBugLabel,
  deleteBug,
  deleteBugComment,
  deleteBugReproductionStep,
  deleteProjectBugLabel,
  removeLabelFromBug,
  reorderBugReproductionSteps,
  updateBug,
  updateBugComment,
  updateBugReproductionStep,
  updateProjectBugLabel,
} from './index';
import {
  getBugActivitiesQueryOptions,
  getBugByIdQueryOptions,
  getBugCommentsQueryOptions,
  getBugReproductionStepsQueryOptions,
  getBugStatisticsQueryOptions,
  getBugsQueryOptions,
  getProjectBugLabelsQueryOptions,
} from './query-options';

const bugListKey = (
  organizationId: Organization['id'],
  projectId: Project['id'],
) => ['bugs', organizationId, projectId] as const;

const bugDetailKey = (
  organizationId: Organization['id'],
  projectId: Project['id'],
  bugId: string,
) => ['bugs', organizationId, projectId, bugId] as const;

export const useBugs = (
  organizationId: Organization['id'],
  projectId: Project['id'],
) => useQuery(getBugsQueryOptions(organizationId, projectId));

export const useBug = (
  organizationId: Organization['id'],
  projectId: Project['id'],
  bugId: string,
) => useQuery(getBugByIdQueryOptions(organizationId, projectId, bugId));

export const useBugStatistics = (
  organizationId: Organization['id'],
  projectId: Project['id'],
) => useQuery(getBugStatisticsQueryOptions(organizationId, projectId));

export const useBugComments = (
  organizationId: Organization['id'],
  projectId: Project['id'],
  bugId: string,
) => useQuery(getBugCommentsQueryOptions(organizationId, projectId, bugId));

export const useProjectBugLabels = (
  organizationId: Organization['id'],
  projectId: Project['id'],
) => useQuery(getProjectBugLabelsQueryOptions(organizationId, projectId));

export const useBugReproductionSteps = (
  organizationId: Organization['id'],
  projectId: Project['id'],
  bugId: string,
) =>
  useQuery(
    getBugReproductionStepsQueryOptions(organizationId, projectId, bugId),
  );

export const useBugActivities = (
  organizationId: Organization['id'],
  projectId: Project['id'],
  bugId: string,
) => useQuery(getBugActivitiesQueryOptions(organizationId, projectId, bugId));

export const useCreateBug = (
  organizationId: Organization['id'],
  projectId: Project['id'],
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateBugDTO) =>
      createBug(organizationId, projectId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: bugListKey(organizationId, projectId),
      });
    },
  });
};

export const useUpdateBug = (
  organizationId: Organization['id'],
  projectId: Project['id'],
  bugId: string,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateBugDTO) =>
      updateBug(organizationId, projectId, bugId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: bugListKey(organizationId, projectId),
      });
      queryClient.invalidateQueries({
        queryKey: bugDetailKey(organizationId, projectId, bugId),
      });
    },
  });
};

export const useDeleteBug = (
  organizationId: Organization['id'],
  projectId: Project['id'],
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bugId: string) => deleteBug(organizationId, projectId, bugId),
    onSuccess: (_, bugId) => {
      queryClient.invalidateQueries({
        queryKey: bugListKey(organizationId, projectId),
      });
      queryClient.removeQueries({
        queryKey: bugDetailKey(organizationId, projectId, bugId),
      });
    },
  });
};

export const useChangeBugStatus = (
  organizationId: Organization['id'],
  projectId: Project['id'],
  bugId: string,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: ChangeBugStatusDTO) =>
      changeBugStatus(organizationId, projectId, bugId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: bugListKey(organizationId, projectId),
      });
      queryClient.invalidateQueries({
        queryKey: bugDetailKey(organizationId, projectId, bugId),
      });
      queryClient.invalidateQueries({
        queryKey: [
          ...bugDetailKey(organizationId, projectId, bugId),
          'activities',
        ],
      });
    },
  });
};

export const useChangeBugPriority = (
  organizationId: Organization['id'],
  projectId: Project['id'],
  bugId: string,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: ChangeBugPriorityDTO) =>
      changeBugPriority(organizationId, projectId, bugId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: bugListKey(organizationId, projectId),
      });
      queryClient.invalidateQueries({
        queryKey: bugDetailKey(organizationId, projectId, bugId),
      });
      queryClient.invalidateQueries({
        queryKey: [
          ...bugDetailKey(organizationId, projectId, bugId),
          'activities',
        ],
      });
    },
  });
};

export const useAssignBug = (
  organizationId: Organization['id'],
  projectId: Project['id'],
  bugId: string,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: AssignBugDTO) =>
      assignBug(organizationId, projectId, bugId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: bugListKey(organizationId, projectId),
      });
      queryClient.invalidateQueries({
        queryKey: bugDetailKey(organizationId, projectId, bugId),
      });
      queryClient.invalidateQueries({
        queryKey: [
          ...bugDetailKey(organizationId, projectId, bugId),
          'activities',
        ],
      });
    },
  });
};

export const useAddLabelToBug = (
  organizationId: Organization['id'],
  projectId: Project['id'],
  bugId: string,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: AddBugLabelDTO) =>
      addLabelToBug(organizationId, projectId, bugId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: bugListKey(organizationId, projectId),
      });
      queryClient.invalidateQueries({
        queryKey: bugDetailKey(organizationId, projectId, bugId),
      });
      queryClient.invalidateQueries({
        queryKey: [
          ...bugDetailKey(organizationId, projectId, bugId),
          'activities',
        ],
      });
    },
  });
};

export const useRemoveLabelFromBug = (
  organizationId: Organization['id'],
  projectId: Project['id'],
  bugId: string,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (labelId: string) =>
      removeLabelFromBug(organizationId, projectId, bugId, labelId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: bugListKey(organizationId, projectId),
      });
      queryClient.invalidateQueries({
        queryKey: bugDetailKey(organizationId, projectId, bugId),
      });
      queryClient.invalidateQueries({
        queryKey: [
          ...bugDetailKey(organizationId, projectId, bugId),
          'activities',
        ],
      });
    },
  });
};

export const useCaptureBug = () =>
  useMutation({
    mutationFn: ({ apiKey, dto }: { apiKey: string; dto: CaptureBugDTO }) =>
      captureBug(apiKey, dto),
  });

export const useCreateBugComment = (
  organizationId: Organization['id'],
  projectId: Project['id'],
  bugId: string,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateBugCommentDTO) =>
      createBugComment(organizationId, projectId, bugId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          ...bugDetailKey(organizationId, projectId, bugId),
          'comments',
        ],
      });
      queryClient.invalidateQueries({
        queryKey: [
          ...bugDetailKey(organizationId, projectId, bugId),
          'activities',
        ],
      });
    },
  });
};

export const useUpdateBugComment = (
  organizationId: Organization['id'],
  projectId: Project['id'],
  bugId: string,
  commentId: string,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateBugCommentDTO) =>
      updateBugComment(organizationId, projectId, bugId, commentId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          ...bugDetailKey(organizationId, projectId, bugId),
          'comments',
        ],
      });
    },
  });
};

export const useDeleteBugComment = (
  organizationId: Organization['id'],
  projectId: Project['id'],
  bugId: string,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) =>
      deleteBugComment(organizationId, projectId, bugId, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          ...bugDetailKey(organizationId, projectId, bugId),
          'comments',
        ],
      });
      queryClient.invalidateQueries({
        queryKey: [
          ...bugDetailKey(organizationId, projectId, bugId),
          'activities',
        ],
      });
    },
  });
};

export const useCreateProjectBugLabel = (
  organizationId: Organization['id'],
  projectId: Project['id'],
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateBugLabelDTO) =>
      createProjectBugLabel(organizationId, projectId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...bugListKey(organizationId, projectId), 'labels'],
      });
    },
  });
};

export const useUpdateProjectBugLabel = (
  organizationId: Organization['id'],
  projectId: Project['id'],
  labelId: string,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateBugLabelDTO) =>
      updateProjectBugLabel(organizationId, projectId, labelId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...bugListKey(organizationId, projectId), 'labels'],
      });
      queryClient.invalidateQueries({
        queryKey: bugListKey(organizationId, projectId),
      });
    },
  });
};

export const useDeleteProjectBugLabel = (
  organizationId: Organization['id'],
  projectId: Project['id'],
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (labelId: string) =>
      deleteProjectBugLabel(organizationId, projectId, labelId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...bugListKey(organizationId, projectId), 'labels'],
      });
      queryClient.invalidateQueries({
        queryKey: bugListKey(organizationId, projectId),
      });
    },
  });
};

export const useCreateBugReproductionStep = (
  organizationId: Organization['id'],
  projectId: Project['id'],
  bugId: string,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateBugReproductionStepDTO) =>
      createBugReproductionStep(organizationId, projectId, bugId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...bugDetailKey(organizationId, projectId, bugId), 'steps'],
      });
      queryClient.invalidateQueries({
        queryKey: bugDetailKey(organizationId, projectId, bugId),
      });
    },
  });
};

export const useUpdateBugReproductionStep = (
  organizationId: Organization['id'],
  projectId: Project['id'],
  bugId: string,
  stepId: string,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateBugReproductionStepDTO) =>
      updateBugReproductionStep(organizationId, projectId, bugId, stepId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...bugDetailKey(organizationId, projectId, bugId), 'steps'],
      });
      queryClient.invalidateQueries({
        queryKey: bugDetailKey(organizationId, projectId, bugId),
      });
    },
  });
};

export const useDeleteBugReproductionStep = (
  organizationId: Organization['id'],
  projectId: Project['id'],
  bugId: string,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (stepId: string) =>
      deleteBugReproductionStep(organizationId, projectId, bugId, stepId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...bugDetailKey(organizationId, projectId, bugId), 'steps'],
      });
      queryClient.invalidateQueries({
        queryKey: bugDetailKey(organizationId, projectId, bugId),
      });
    },
  });
};

export const useReorderBugReproductionSteps = (
  organizationId: Organization['id'],
  projectId: Project['id'],
  bugId: string,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: ReorderBugReproductionStepsDTO) =>
      reorderBugReproductionSteps(organizationId, projectId, bugId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...bugDetailKey(organizationId, projectId, bugId), 'steps'],
      });
      queryClient.invalidateQueries({
        queryKey: bugDetailKey(organizationId, projectId, bugId),
      });
    },
  });
};
