import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createShortLink,
  deleteShortLink,
  updateShortLink,
} from '@/api/short-links';
import { getShortLinksQueryOptions } from '@/api/short-links/query-options';
import type { ShortLinkFilters } from '@/api/short-links/types';
import type { Organization } from '@/types/organization';
import type { Pageable } from '@/types/pageable';
import type {
  CreateShortLinkDTO,
  ShortLink,
  UpdateShortLinkDTO,
} from '@/types/short-link';

export const useShortLinks = (
  organizationId: Organization['id'],
  pageable: Pageable<ShortLink>,
  filters?: ShortLinkFilters,
) => {
  return useQuery(getShortLinksQueryOptions(organizationId, pageable, filters));
};

export const useCreateShortLink = (organizationId: Organization['id']) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateShortLinkDTO) =>
      createShortLink(organizationId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['short-links', organizationId],
      });
    },
  });
};

export const useUpdateShortLink = (
  organizationId: Organization['id'],
  shortLinkId: ShortLink['id'],
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateShortLinkDTO) =>
      updateShortLink(organizationId, shortLinkId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['short-links', organizationId],
      });
      queryClient.invalidateQueries({
        queryKey: ['short-links', organizationId, shortLinkId],
      });
    },
  });
};

export const useDeleteShortLink = (organizationId: Organization['id']) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (shortLinkId: ShortLink['id']) =>
      deleteShortLink(organizationId, shortLinkId),
    onSuccess: (_, shortLinkId) => {
      queryClient.invalidateQueries({
        queryKey: ['short-links', organizationId],
      });
      queryClient.removeQueries({
        queryKey: ['short-links', organizationId, shortLinkId],
      });
    },
  });
};
