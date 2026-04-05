import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { deleteFile, getFileById, uploadFile } from './index';

export const getFileByIdQueryOptions = (fileId: string) =>
  queryOptions({
    queryKey: ['files', fileId],
    queryFn: () => getFileById(fileId),
    enabled: Boolean(fileId),
  });

export const uploadFileMutationOptions = () =>
  mutationOptions({
    mutationKey: ['files', 'upload'],
    mutationFn: uploadFile,
  });

export const deleteFileMutationOptions = () =>
  mutationOptions({
    mutationKey: ['files', 'delete'],
    mutationFn: deleteFile,
  });
