import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateMonitorDTO } from '@/types/monitor';
import type { Organization } from '@/types/organization';
import {
  createMonitor,
  deleteMonitor,
  pauseMonitor,
  resumeMonitor,
} from './index';
import { getMonitorsQueryOptions } from './query-options';

export const useMonitors = (organizationId: Organization['id']) => {
  return useQuery(getMonitorsQueryOptions(organizationId));
};

export const useCreateMonitor = (organizationId: Organization['id']) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateMonitorDTO) => createMonitor(organizationId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['monitors', organizationId],
      });
    },
  });
};

export const useDeleteMonitor = (organizationId: Organization['id']) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (monitorId: string) => deleteMonitor(organizationId, monitorId),
    onSuccess: (_, monitorId) => {
      queryClient.invalidateQueries({
        queryKey: ['monitors', organizationId],
      });
      queryClient.removeQueries({
        queryKey: ['monitors', organizationId, monitorId],
      });
    },
  });
};

export const usePauseMonitor = (organizationId: Organization['id']) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (monitorId: string) => pauseMonitor(organizationId, monitorId),
    onSuccess: (_, monitorId) => {
      queryClient.invalidateQueries({
        queryKey: ['monitors', organizationId],
      });
      queryClient.invalidateQueries({
        queryKey: ['monitors', organizationId, monitorId],
      });
    },
  });
};

export const useResumeMonitor = (organizationId: Organization['id']) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (monitorId: string) => resumeMonitor(organizationId, monitorId),
    onSuccess: (_, monitorId) => {
      queryClient.invalidateQueries({
        queryKey: ['monitors', organizationId],
      });
      queryClient.invalidateQueries({
        queryKey: ['monitors', organizationId, monitorId],
      });
    },
  });
};
