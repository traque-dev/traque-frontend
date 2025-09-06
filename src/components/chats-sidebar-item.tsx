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

  const [isChatOpen, setIsChatOpen] = useState(
    location.pathname.startsWith('/dashboard/chat'),
  );

  const { data: conversations } = useConversations();

  useEffect(() => {
    setIsChatOpen(location.pathname.startsWith('/dashboard/chat'));
  }, [location.pathname]);

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
        className="transition-transform data-[state=open]:rotate-180 !top-[9px]"
      >
        <ChevronDown />
      </SidebarMenuAction>
      {isChatOpen && (
        <SidebarMenuSub className="overflow-hidden">
          {conversations?.map((conversation) => (
            <SidebarMenuSubItem
              key={conversation.id}
              className="group/conversation relative overflow-hidden"
            >
              <SidebarMenuSubButton
                asChild
                isActive={
                  location.pathname === `/dashboard/chat/${conversation.id}`
                }
              >
                <Link
                  to="/dashboard/chat/$chatId"
                  params={{ chatId: conversation.id }}
                >
                  <span className="truncate">{conversation.name}</span>

                  <div className="text-muted-foreground group-hover/conversation:bg-sidebar-accent pointer-events-auto absolute top-0 right-[4px] bottom-0 z-50 flex translate-x-full items-center justify-end transition-transform group-hover/conversation:translate-x-0">
                    <div className="from-sidebar-accent pointer-events-none absolute top-0 right-full bottom-0 h-12 w-8 bg-linear-to-l to-transparent opacity-0 group-hover/conversation:opacity-100" />
                    <DeleteConversationButton
                      conversationId={conversation.id}
                    />
                  </div>
                </Link>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      )}
    </SidebarMenuItem>
  );
}

type DeleteConversationButtonProps = {
  conversationId: string;
};

function DeleteConversationButton({
  conversationId,
}: DeleteConversationButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const { mutate: deleteConversation } = useDeleteConversation();

  const onDeleteConversation = (id: string) => {
    deleteConversation(id);

    if (location.pathname.startsWith(`/dashboard/chat/${id}`)) {
      navigate({ to: '/dashboard/chat' });
    }
  };
  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <button
          className="cursor-pointer"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsOpen(true);
          }}
        >
          <X className="size-4" />
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete conversation?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete this
            conversation and remove its messages.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsOpen(false);
            }}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDeleteConversation(conversationId);
            }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
