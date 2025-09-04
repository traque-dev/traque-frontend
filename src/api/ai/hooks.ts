import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  deleteConversationQueryOptions,
  getConversationQueryOptions,
  getConversationsQueryOptions,
} from './query-options';

export const useConversations = () => {
  return useQuery(getConversationsQueryOptions());
};

export const useConversation = (id: string) => {
  return useQuery(getConversationQueryOptions(id));
};

export const useDeleteConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    ...deleteConversationQueryOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['ai', 'conversations'],
      });
    },
  });
};
