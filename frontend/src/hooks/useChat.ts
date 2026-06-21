/**
 * =============================================================================
 * useChat Hook
 * =============================================================================
 *
 * PURPOSE:
 * Encapsulates all solo AI chat logic: sending messages, managing conversations,
 * loading history, and handling AI responses. This hook is the primary interface
 * between the UI (SoloChat page) and the chat system.
 *
 * WHY A CUSTOM HOOK:
 * - Separates business logic from UI rendering
 * - Reusable across different chat interfaces
 * - Manages complex async flows (send → pending → response/error)
 * - Coordinates between Zustand store and API calls
 *
 * PATTERN: Command Pattern
 * The hook exposes commands (sendMessage, removeConversation, startNewChat)
 * that the UI calls. The hook handles all the complexity internally.
 *
 * DATA FLOW:
 * 1. User types message → calls sendMessage()
 * 2. Hook creates local user message + pending assistant message
 * 3. Hook calls API with conversation history
 * 4. On success: updates assistant message with AI response
 * 5. On error: updates assistant message with error state
 *
 * STATE MANAGEMENT:
 * - Local state: isLoading (for UI spinner)
 * - Global state: conversations, messages (via Zustand)
 * - Server state: synced on mount and after operations
 *
 * LEARNING NOTES:
 * - useCallback prevents unnecessary re-renders of child components
 * - The hook handles conversation creation (first message creates conversation)
 * - Optimistic updates: user message appears immediately before API confirms
 * - Error recovery: failed messages show error state, not removed
 * =============================================================================
 */

import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { sendChatMessage, type ChatAttachment } from '../api/chat';
import {
  deleteConversation as deleteConversationRequest,
  fetchConversation,
  fetchConversationInsight,
  fetchConversations,
} from '../api/conversations';
import type { ProjectSummary } from '../api/projects';
import { useChatStore } from '../store/chatStore';
import type { Message } from '../store/chatStore';

/**
 * Map API role string to local role type.
 *
 * WHY THIS EXISTS:
 * The API uses 'model' for AI responses, but the frontend uses 'assistant'.
 * This normalizes the role for consistent handling.
 */
function mapRole(role: string): 'user' | 'assistant' {
  return role === 'assistant' ? 'assistant' : 'user';
}

/**
 * Generate a deterministic message ID from message properties.
 *
 * WHY DETERMINISTIC:
 * Prevents duplicate messages when syncing. Same message content
 * always produces the same ID, so re-importing doesn't create duplicates.
 *
 * PATTERN: Composite key
 * Combines role + timestamp + content prefix for uniqueness.
 */
function buildMessageId(role: string, timestamp: string, content: string) {
  return `${role}:${timestamp}:${content.slice(0, 24)}`;
}

export function useChat(activeProject?: ProjectSummary | null) {
  const [isLoading, setIsLoading] = useState(false);
  const {
    addConversation,
    addMessage,
    conversations,
    deleteConversation,
    getActiveConversation,
    loadConversations,
    setActiveConversation,
    setConversationMessages,
    updateMessage,
    updateConversationInsight,
    updateConversationPreferences,
    updateConversationServerId,
  } = useChatStore();

  const syncConversations = useCallback(async () => {
    try {
      const summaries = await fetchConversations(activeProject?.id || undefined);
      loadConversations(summaries.map((summary) => ({
        id: summary.id,
        serverId: summary.id,
        title: summary.title,
        messages: [],
        project: summary.project || null,
        createdAt: summary.createdAt,
        updatedAt: summary.updatedAt,
        sourceType: summary.sourceType,
        sourceLabel: summary.sourceLabel,
        insight: null,
        preferredProvider: null,
        preferredModelId: null,
      })));
    } catch (error) {
      console.error('Failed to sync conversations', error);
    }
  }, [activeProject?.id, loadConversations]);

  useEffect(() => {
    void syncConversations();
  }, [syncConversations]);

  useEffect(() => {
    const activeConversation = getActiveConversation();
    if (!activeConversation?.serverId || activeConversation.messages.length > 0) {
      return;
    }

    let cancelled = false;

    const loadConversationDetail = async () => {
      try {
        const [detail, insight] = await Promise.all([
          fetchConversation(activeConversation.serverId as string),
          fetchConversationInsight(activeConversation.serverId as string).catch(() => null),
        ]);

        if (cancelled) {
          return;
        }

        const messages: Message[] = detail.messages.map((message) => ({
          id: buildMessageId(message.role, message.timestamp, message.content),
          role: mapRole(message.role),
          content: message.content,
          timestamp: message.timestamp,
          messageState: 'complete',
          memoryRefs: message.memoryRefs || [],
          fileUrl: message.fileUrl || null,
          fileName: message.fileName || null,
          fileType: message.fileType || null,
          fileSize: message.fileSize || null,
          modelId: message.modelId || null,
          provider: message.provider || null,
          requestedModelId: message.requestedModelId || null,
          processingMs: message.processingMs ?? null,
          promptTokens: message.promptTokens ?? null,
          completionTokens: message.completionTokens ?? null,
          totalTokens: message.totalTokens ?? null,
          autoMode: Boolean(message.autoMode),
          autoComplexity: message.autoComplexity || null,
          fallbackUsed: Boolean(message.fallbackUsed),
        }));

        setConversationMessages(activeConversation.id, messages);
        updateConversationInsight(activeConversation.id, insight);
      } catch (error) {
        console.error('Failed to load conversation detail', error);
      }
    };

    void loadConversationDetail();

    return () => {
      cancelled = true;
    };
  }, [conversations, getActiveConversation, setConversationMessages, updateConversationInsight]);

  /**
   * Send a message to the AI and handle the response.
   *
   * FLOW:
   * 1. Get or create active conversation
   * 2. Add user message to store (optimistic update)
   * 3. Add pending assistant message (shows loading state)
   * 4. Call API with conversation history
   * 5. Update assistant message with response or error
   *
   * OPTIMISTIC UPDATES:
   * User message appears immediately. Assistant message shows "Thinking..."
   * while waiting for API response. This makes the UI feel responsive.
   *
   * ERROR HANDLING:
   * - API errors: Show toast notification, update message with error state
   * - Network errors: Same handling (catch block)
   * - Message stays in conversation (not removed) for retry context
   *
   * @param content - The user's message text
   * @param options - Optional: modelId, attachment, project context
   */
  const sendMessage = useCallback(
    async (
      content: string,
      options?: {
        modelId?: string;
        preferredProvider?: string | null;
        attachment?: ChatAttachment | null;
        project?: ProjectSummary | null;
      }
    ) => {
      let conversation = getActiveConversation();
      const selectedProject = options?.project || activeProject || null;

      if (!conversation) {
        const newConversation = {
          id: crypto.randomUUID(),
          title: content.slice(0, 50) + (content.length > 50 ? '...' : ''),
          messages: [],
          project: selectedProject ? {
            id: selectedProject.id,
            name: selectedProject.name,
            description: selectedProject.description,
          } : null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          insight: null,
          preferredProvider: options?.preferredProvider || null,
          preferredModelId: options?.modelId || null,
        };
        addConversation(newConversation);
        conversation = newConversation;
      }

      if (options?.preferredProvider || options?.modelId) {
        updateConversationPreferences(conversation.id, {
          preferredProvider: options?.preferredProvider || null,
          preferredModelId: options?.modelId || null,
        });
      }

      let historySource = conversation.messages;
      if (conversation.serverId && conversation.messages.length === 0) {
        try {
          const detail = await fetchConversation(conversation.serverId);
          historySource = detail.messages.map((message) => ({
            id: buildMessageId(message.role, message.timestamp, message.content),
            role: mapRole(message.role),
            content: message.content,
            timestamp: message.timestamp,
            messageState: 'complete',
            memoryRefs: message.memoryRefs || [],
            fileUrl: message.fileUrl || null,
            fileName: message.fileName || null,
            fileType: message.fileType || null,
            fileSize: message.fileSize || null,
            modelId: message.modelId || null,
            provider: message.provider || null,
            requestedModelId: message.requestedModelId || null,
            processingMs: message.processingMs ?? null,
            promptTokens: message.promptTokens ?? null,
            completionTokens: message.completionTokens ?? null,
            totalTokens: message.totalTokens ?? null,
            autoMode: Boolean(message.autoMode),
            autoComplexity: message.autoComplexity || null,
            fallbackUsed: Boolean(message.fallbackUsed),
          }));
          setConversationMessages(conversation.id, historySource);
        } catch (error) {
          console.error('Failed to refresh conversation before send', error);
        }
      }

      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: 'user',
        content,
        timestamp: new Date().toISOString(),
        messageState: 'complete',
        fileUrl: options?.attachment?.fileUrl || null,
        fileName: options?.attachment?.fileName || null,
        fileType: options?.attachment?.fileType || null,
        fileSize: options?.attachment?.fileSize || null,
      };

      addMessage(conversation.id, userMessage);
      const assistantMessageId = crypto.randomUUID();
      addMessage(conversation.id, {
        id: assistantMessageId,
        role: 'assistant',
        content: 'Thinking...',
        timestamp: new Date().toISOString(),
        messageState: 'pending',
        requestedModelId: options?.modelId || 'auto',
        autoMode: !options?.modelId || options.modelId === 'auto',
      });
      setIsLoading(true);

      try {
        const history = historySource.map((message) => ({
          role: message.role === 'user' ? 'user' : 'model',
          parts: [{ text: message.content }],
        }));

        const response = await sendChatMessage(
          content,
          history,
          conversation.serverId,
          options?.modelId,
          options?.attachment || null,
          selectedProject?.id || conversation.project?.id || null
        );

        if (response.conversationId && !conversation.serverId) {
          updateConversationServerId(conversation.id, response.conversationId);
        }

        updateMessage(conversation.id, assistantMessageId, {
          content: response.content,
          timestamp: response.timestamp,
          messageState: 'complete',
          memoryRefs: response.memoryRefs || [],
          modelId: response.modelId || null,
          provider: response.provider || null,
          requestedModelId: response.requestedModelId || options?.modelId || null,
          processingMs: response.processingMs ?? null,
          promptTokens: response.promptTokens ?? null,
          completionTokens: response.completionTokens ?? null,
          totalTokens: response.totalTokens ?? null,
          autoMode: Boolean(response.autoMode),
          autoComplexity: response.autoComplexity || null,
          fallbackUsed: Boolean(response.fallbackUsed),
        });
        updateConversationPreferences(conversation.id, {
          preferredProvider: response.provider || options?.preferredProvider || null,
          preferredModelId: response.modelId || options?.modelId || null,
        });
        updateConversationInsight(conversation.id, response.insight || null);
      } catch (error: unknown) {
        const err = error as { response?: { data?: { error?: string } }; message?: string };
        const errMsg = err.response?.data?.error || err.message || 'Failed to get AI response';
        toast.error(errMsg);
        updateMessage(conversation.id, assistantMessageId, {
          content: 'Sorry, I hit an error while processing your request. Please try again.',
          timestamp: new Date().toISOString(),
          messageState: 'error',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [
      addConversation,
      addMessage,
      activeProject,
      getActiveConversation,
      setConversationMessages,
      updateMessage,
      updateConversationInsight,
      updateConversationPreferences,
      updateConversationServerId,
    ]
  );

  const removeConversation = useCallback(
    async (conversationId: string) => {
      const conversation = conversations.find((item) => item.id === conversationId);
      try {
        if (conversation?.serverId) {
          await deleteConversationRequest(conversation.serverId);
        }
      } catch (error) {
        console.error('Failed to delete conversation from server', error);
        toast.error('Failed to delete conversation');
        return;
      }

      deleteConversation(conversationId);
    },
    [conversations, deleteConversation]
  );

  const startNewChat = useCallback(() => {
    setActiveConversation(null);
  }, [setActiveConversation]);

  return {
    sendMessage,
    isLoading,
    removeConversation,
    startNewChat,
    syncConversations,
  };
}
