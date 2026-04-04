import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Organization } from '@/types/organization';
import {
  acknowledgeIncident,
  addIncidentComment,
  resolveIncident,
} from './index';
import { getIncidentsQueryOptions } from './query-options';

export const useIncidents = (organizationId: Organization['id']) => {
  return useQuery(getIncidentsQueryOptions(organizationId));
};

export const useAcknowledgeIncident = (
  organizationId: Organization['id'],
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (incidentId: string) =>
      acknowledgeIncident(organizationId, incidentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['incidents', organizationId],
      });
    },
  });
};

export const useResolveIncident = (organizationId: Organization['id']) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (incidentId: string) =>
      resolveIncident(organizationId, incidentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['incidents', organizationId],
      });
    },
  });
};

export const useAddIncidentComment = (
  organizationId: Organization['id'],
  incidentId: string,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content: string) =>
      addIncidentComment(organizationId, incidentId, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['incidents', organizationId, incidentId, 'timeline'],
      });
    },
  });
};
