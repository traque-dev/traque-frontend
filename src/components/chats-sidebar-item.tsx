import { Link, useLocation, useNavigate } from '@tanstack/react-router';
import { ChevronDown, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useConversations, useDeleteConversation } from '@/api/ai/hooks';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { ChatRoundLineLinear } from './icons/chat-round-line-linear';

type Props = {
  isActive: boolean;
};

export function ChatsSidebarItem({ isActive }: Props) {
  const location = useLocation();
  const navigate = useNavigate();

  const [isChatOpen, setIsChatOpen] = useState(
    location.pathname.startsWith('/dashboard/chat'),
  );

  const { data: conversations } = useConversations();
  const { mutate: deleteConversation } = useDeleteConversation();

  useEffect(() => {
    setIsChatOpen(location.pathname.startsWith('/dashboard/chat'));
  }, [location.pathname]);

  const onDeleteConversation = (id: string) => {
    deleteConversation(id);

    if (location.pathname.startsWith(`/dashboard/chat/${id}`)) {
      navigate({ to: '/dashboard/chat' });
    }
  };

  return (
    <SidebarMenuItem key="chats">
      <SidebarMenuButton
        asChild={true}
        className="group/menu-button group-data-[collapsible=icon]:px-[7px]! font-medium gap-3 h-9 [&>svg]:size-auto"
        tooltip="Chat"
        isActive={isActive}
      >
        <Link to="/dashboard/chat">
          <ChatRoundLineLinear
            className="text-muted-foreground/65 group-data-[active=true]/menu-button:text-primary"
            height={22}
            width={22}
            aria-hidden="true"
          />
          <span>Chat</span>
        </Link>
      </SidebarMenuButton>
      <SidebarMenuAction
        aria-label="Toggle Chat submenu"
        onClick={() => setIsChatOpen((v) => !v)}
        data-state={isChatOpen ? 'open' : 'closed'}
        showOnHover
        className="transition-transform data-[state=open]:rotate-180"
      >
        <ChevronDown className="size-4" />
      </SidebarMenuAction>
      {isChatOpen && (
        <SidebarMenuSub>
          {conversations?.map((conversation) => (
            <SidebarMenuSubItem
              key={conversation.id}
              className="group/conversation"
            >
              <SidebarMenuSubButton
                asChild={true}
                isActive={
                  location.pathname === `/dashboard/chat/${conversation.id}`
                }
              >
                <Link
                  to="/dashboard/chat/$chatId"
                  params={{ chatId: conversation.id }}
                >
                  <span>{conversation.name}</span>
                </Link>
              </SidebarMenuSubButton>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <SidebarMenuAction className="hidden group-hover/conversation:flex">
                    <X className="size-4" />
                  </SidebarMenuAction>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete conversation?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      this conversation and remove its messages.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDeleteConversation(conversation.id)}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      )}
    </SidebarMenuItem>
  );
}
