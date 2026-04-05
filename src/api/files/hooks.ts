import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  deleteFileMutationOptions,
  getFileByIdQueryOptions,
  uploadFileMutationOptions,
} from './query-options';

const fileKey = (fileId: string) => ['files', fileId] as const;

export const useFile = (fileId: string) =>
  useQuery(getFileByIdQueryOptions(fileId));

export const useUploadFile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    ...uploadFileMutationOptions(),
    onSuccess: (data) => {
      queryClient.setQueryData(fileKey(data.id), data);
    },
  });
};

export const useDeleteFile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    ...deleteFileMutationOptions(),
    onSuccess: (_, fileId) => {
      queryClient.removeQueries({ queryKey: fileKey(fileId) });
    },
  });
};
