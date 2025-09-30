import { useChat } from '@ai-sdk/react';
import { useQueryClient } from '@tanstack/react-query';
import { createFileRoute, notFound, useNavigate } from '@tanstack/react-router';
import { useStore } from '@tanstack/react-store';
import { DefaultChatTransport } from 'ai';
import { type } from 'arktype';
import { useEffect, useRef, useState } from 'react';
import { getConversation } from '@/api/ai';
import { getProjectByIdQueryOptions } from '@/api/projects/query-options';
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai/conversation';
import { Loader } from '@/components/ai/loader';
import { Message, MessageContent } from '@/components/ai/message';
import {
  PromptInput,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
} from '@/components/ai/prompt-input';
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from '@/components/ai/reasoning';
import { Response } from '@/components/ai/response';
import { ProjectExceptionsChart } from '@/components/project-exceptions-chart';
import { config } from '@/config';
import { exceptionDailyStatisticSchema } from '@/schemas/exception';
import { chatStore } from '@/store/chat-store';

const chatParamsSchema = type({
  chatId: 'string.uuid',
});

const chatSearchParamsSchema = type({
  'projectId?': 'string.uuid',
  'dateFrom?': 'string.date',
  'dateTo?': 'string.date',
  'new?': 'boolean',
});

export const Route = createFileRoute('/_authenticated/dashboard/chat/$chatId')({
  component: Chat,
  validateSearch: chatSearchParamsSchema,
  staleTime: 0,
  loaderDeps: ({ search }) => ({
    new: search.new,
    projectId: search.projectId,
  }),
  remountDeps: ({ params }) => ({
    chatId: params.chatId,
  }),
  loader: async ({ params, deps, context }) => {
    chatParamsSchema.assert(params);

    const activeOrganization = await context.getActiveOrganization();

    if (!activeOrganization) {
      throw notFound();
    }

    let conversation = null;

    if (!deps.new) {
      try {
        const data = await getConversation(params.chatId);

        conversation = data;
      } catch (error) {}
    }

    const projectId = conversation?.projectId ?? deps?.projectId;

    if (!projectId) {
      throw notFound({
        data: {
          type: 'project',
        },
      });
    }

    const project = await context.queryClient.ensureQueryData(
      getProjectByIdQueryOptions(activeOrganization.id, projectId),
    );

    return {
      activeOrganization,
      conversation,
      project,
    };
  },
  errorComponent: ({ error }) => {
    return <div>{error.message}</div>;
  },
});

function Chat() {
  const { chatId } = Route.useParams();
  const { activeOrganization, conversation, project } = Route.useLoaderData();
  const { dateFrom, dateTo } = Route.useSearch();

  const queryClient = useQueryClient();

  const navigate = useNavigate({ from: Route.fullPath });

  const initialMessage = useStore(chatStore, (state) => state.initialMessage);

  const [input, setInput] = useState('');

  const { sendMessage, status, messages } = useChat({
    messages: conversation?.messages ?? [],
    transport: new DefaultChatTransport({
      api: `${config.api.url}/api/v1/ai/agents/${project.id}/chat?organizationId=${activeOrganization.id}`,
      credentials: () => 'include',
      body: () => ({
        threadMetadata: {
          id: chatId,
        },
        projectId: project.id,
        dateFrom,
        dateTo,
      }),
    }),
  });

  const hasSentInitRef = useRef(false);

  useEffect(() => {
    if (!initialMessage) return;
    if (hasSentInitRef.current) return;
    hasSentInitRef.current = true;

    const message = initialMessage;

    chatStore.setState({
      initialMessage: null,
    });

    sendMessage({ text: message }).then(() => {
      queryClient.invalidateQueries({
        queryKey: ['ai', 'conversations'],
      });

      navigate({
        search: {},
      });
    });
  }, [initialMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (input.trim()) {
      sendMessage({ text: input });
      setInput('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-1 relative size-full h-[calc(100vh-64px)]">
      <div className="flex flex-col justify-end h-full">
        {
          <Conversation className="h-full">
            <ConversationContent>
              {messages.map((message) => (
                <div key={message.id}>
                  <Message from={message.role} key={message.id}>
                    <MessageContent>
                      {message.parts.map((part, i) => {
                        switch (part.type) {
                          case 'text':
                            return (
                              <Response key={`${message.id}-${i}`}>
                                {part.text}
                              </Response>
                            );
                          case 'reasoning':
                            return (
                              <Reasoning
                                key={`${message.id}-${i}`}
                                className="w-full"
                                isStreaming={status === 'streaming'}
                              >
                                <ReasoningTrigger />
                                <ReasoningContent>{part.text}</ReasoningContent>
                              </Reasoning>
                            );
                          case 'tool-getExceptionStatistic':
                            if (part.state !== 'output-available') return null;
                            const data = exceptionDailyStatisticSchema(
                              part.output,
                            );

                            if (data instanceof type.errors) {
                              return (
                                <div className="text-red-400">
                                  Error parsing data
                                </div>
                              );
                            }

                            return (
                              <div className="w-xl">
                                <ProjectExceptionsChart data={data} />
                              </div>
                            );
                          default:
                            return null;
                        }
                      })}
                    </MessageContent>
                  </Message>
                </div>
              ))}
              {status === 'submitted' && <Loader />}
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>
        }

        <PromptInput onSubmit={handleSubmit} className="mt-0">
          <PromptInputTextarea
            onChange={(e) => setInput(e.target.value)}
            value={input}
          />
          <PromptInputToolbar className="flex justify-end">
            <PromptInputSubmit disabled={!input} status={status} />
          </PromptInputToolbar>
        </PromptInput>
      </div>
    </div>
  );
}
