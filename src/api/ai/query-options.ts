import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { deleteConversation, getConversation, getConversations } from './index';

export const getConversationsQueryOptions = () =>
  queryOptions({
    queryKey: ['ai', 'conversations'],
    queryFn: () => getConversations(),
  });

export const getConversationQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ['ai', 'conversation', id],
    queryFn: () => getConversation(id),
  });

export const deleteConversationQueryOptions = () =>
  mutationOptions({
    mutationKey: ['ai', 'conversation'],
    mutationFn: (id: string) => deleteConversation(id),
  });
