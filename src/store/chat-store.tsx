import { Store } from '@tanstack/react-store';
import type { Nullable } from '@/types/utils';

type ChatStore = {
  initialMessage: Nullable<string>;
};

export const chatStore = new Store<ChatStore>({
  initialMessage: null,
});
