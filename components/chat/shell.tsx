"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useActiveChat } from "@/hooks/use-active-chat";
import {
  initialArtifactData,
  useArtifact,
  useArtifactSelector,
} from "@/hooks/use-artifact";
import { useWebLLM } from "@/hooks/use-web-llm";
import type { Attachment, ChatMessage } from "@/lib/types";
import { cn, generateUUID } from "@/lib/utils";
import { Artifact } from "./artifact";
import { ChatHeader } from "./chat-header";
import { DataStreamHandler } from "./data-stream-handler";
import { submitEditedMessage } from "./message-editor";
import { Messages } from "./messages";
import { MultimodalInput } from "./multimodal-input";

export function ChatShell() {
  const {
    chatId,
    messages,
    setMessages,
    sendMessage,
    status,
    stop,
    regenerate,
    addToolApprovalResponse,
    input,
    setInput,
    visibilityType,
    isReadonly,
    isLoading,
    votes,
    currentModelId,
    setCurrentModelId,
    showCreditCardAlert,
    setShowCreditCardAlert,
  } = useActiveChat();

  const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const isArtifactVisible = useArtifactSelector((state) => state.isVisible);
  const { setArtifact } = useArtifact();

  // WebLLM for browser-local inference
  const webLLM = useWebLLM();
  const isLocalModel = currentModelId === "masidy-local";
  const [webLLMLoadingMessage, setWebLLMLoadingMessage] = useState("");

  // Initialize WebLLM when local model is selected
  useEffect(() => {
    if (isLocalModel && webLLM.status === "idle") {
      webLLM.isSupported().then((supported) => {
        if (!supported) {
          setCurrentModelId("masidy");
          return;
        }
        webLLM.initialize();
      });
    }
  }, [isLocalModel, webLLM, setCurrentModelId]);

  // Custom send for local model
  const sendLocalMessage = useCallback(async (msg: Parameters<typeof sendMessage>[0]) => {
    if (!isLocalModel) return sendMessage(msg);

    // Initialize if not ready
    if (!webLLM.isReady) {
      const ok = await webLLM.initialize();
      if (!ok) {
        setCurrentModelId("masidy");
        return sendMessage(msg);
      }
    }

    // Extract text from message parts
    const userText = (msg?.parts ?? [])
      .filter((p): p is { type: "text"; text: string } => p.type === "text")
      .map((p) => p.text)
      .join(" ");

    const userMsgId = generateUUID();

    // Add user message to UI immediately
    setMessages((prev) => [
      ...prev,
      { id: userMsgId, role: "user", parts: [{ type: "text", text: userText }], metadata: { createdAt: new Date().toISOString() } } as ChatMessage,
    ]);

    const assistantMsgId = generateUUID();
    let accumulated = "";

    // Add empty assistant message for streaming
    setMessages((prev) => [
      ...prev,
      { id: assistantMsgId, role: "assistant", parts: [{ type: "text", text: "" }], metadata: { createdAt: new Date().toISOString() } } as ChatMessage,
    ]);

    try {
      // Get context from Masidy pipeline
      const contextRes = await fetch("/api/masidy-context", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: userText }],
        }),
      });
      const { systemPrompt, imageUrl } = await contextRes.json();

      // If image was generated, show it
      if (imageUrl) {
        setMessages((prev) => prev.map((m) =>
          m.id === assistantMsgId
            ? { ...m, parts: [{ type: "text", text: `Here is your generated image:\n\n![Generated Image](${imageUrl})` }] } as ChatMessage
            : m
        ));
        // Save and return
        await fetch("/api/masidy-save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chatId, userMessage: { id: userMsgId, content: userText }, assistantText: `![Generated Image](${imageUrl})`, visibility: visibilityType }),
        });
        return;
      }

      // Build conversation history for context
      const history = messages.slice(-6).map((m) => ({
        role: m.role as "user" | "assistant",
        content: (m.parts ?? []).filter((p): p is { type: "text"; text: string } => p.type === "text").map((p) => p.text).join(" "),
      })).filter((m) => m.content);

      history.push({ role: "user", content: userText });

      // Run WebLLM inference with token streaming
      await webLLM.generate(systemPrompt, history, (token) => {
        accumulated += token;
        setMessages((prev) => prev.map((m) =>
          m.id === assistantMsgId
            ? { ...m, parts: [{ type: "text", text: accumulated }] } as ChatMessage
            : m
        ));
      });

      // Save to DB
      await fetch("/api/masidy-save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId,
          userMessage: { id: userMsgId, content: userText },
          assistantText: accumulated,
          visibility: visibilityType,
        }),
      });
    } catch (e) {
      console.error("Local inference failed:", e);
      setMessages((prev) => prev.map((m) =>
        m.id === assistantMsgId
          ? { ...m, parts: [{ type: "text", text: "Local model error. Please try again or switch to a server model." }] } as ChatMessage
          : m
      ));
    }
  }, [isLocalModel, webLLM, sendMessage, setMessages, messages, chatId, visibilityType, setCurrentModelId]);

  const stopRef = useRef(stop);
  stopRef.current = stop;

  const prevChatIdRef = useRef(chatId);
  useEffect(() => {
    if (prevChatIdRef.current !== chatId) {
      prevChatIdRef.current = chatId;
      stopRef.current();
      setArtifact(initialArtifactData);
      setEditingMessage(null);
      setAttachments([]);
    }
  }, [chatId, setArtifact]);

  return (
    <>
      <div className="flex h-dvh w-full flex-row overflow-hidden">
        <div
          className={cn(
            "flex min-w-0 flex-col bg-sidebar transition-[width] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
            isArtifactVisible ? "w-[40%]" : "w-full"
          )}
        >
          <ChatHeader
            chatId={chatId}
            isReadonly={isReadonly}
            selectedVisibilityType={visibilityType}
          />

          <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-background md:rounded-tl-[12px] md:border-t md:border-l md:border-border/40">
            <Messages
              addToolApprovalResponse={addToolApprovalResponse}
              chatId={chatId}
              isArtifactVisible={isArtifactVisible}
              isLoading={isLoading}
              isReadonly={isReadonly}
              messages={messages}
              onEditMessage={(msg) => {
                const text = msg.parts
                  ?.filter((p) => p.type === "text")
                  .map((p) => p.text)
                  .join("");
                setInput(text ?? "");
                setEditingMessage(msg);
              }}
              regenerate={regenerate}
              selectedModelId={currentModelId}
              setMessages={setMessages}
              status={status}
              votes={votes}
            />

            <div className="sticky bottom-0 z-1 mx-auto flex w-full max-w-4xl flex-col gap-2 border-t-0 bg-background px-2 pb-3 md:px-4 md:pb-4">
              {/* WebLLM download/loading status */}
              {isLocalModel && webLLM.isLoading && (
                <div className="rounded-xl border border-border/40 bg-card/50 px-4 py-3 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">Loading Masidy Local</span>
                    <span className="text-muted-foreground">{webLLM.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-orange-500 transition-all duration-300"
                      style={{ width: `${webLLM.progress}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate">{webLLM.progressText || "Preparing model..."}</p>
                  <p className="text-[11px] text-muted-foreground/60">First time only — cached after download (~2GB)</p>
                </div>
              )}
              {isLocalModel && webLLM.status === "unsupported" && (
                <div className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-2 text-sm text-orange-700 dark:border-orange-900 dark:bg-orange-950 dark:text-orange-300">
                  WebGPU not supported on this device. Switched to server mode.
                </div>
              )}
              {!isReadonly && (
                <MultimodalInput
                  attachments={attachments}
                  chatId={chatId}
                  editingMessage={editingMessage}
                  input={input}
                  isLoading={isLoading || (isLocalModel && webLLM.isGenerating)}
                  messages={messages}
                  onCancelEdit={() => {
                    setEditingMessage(null);
                    setInput("");
                  }}
                  onModelChange={setCurrentModelId}
                  selectedModelId={currentModelId}
                  selectedVisibilityType={visibilityType}
                  sendMessage={
                    editingMessage
                      ? async () => {
                          const msg = editingMessage;
                          setEditingMessage(null);
                          await submitEditedMessage({
                            message: msg,
                            text: input,
                            setMessages,
                            regenerate,
                          });
                          setInput("");
                        }
                      : isLocalModel ? sendLocalMessage : sendMessage
                  }
                  setAttachments={setAttachments}
                  setInput={setInput}
                  setMessages={setMessages}
                  status={isLocalModel && webLLM.isGenerating ? "submitted" : status}
                  stop={stop}
                />
              )}
            </div>
          </div>
        </div>

        <Artifact
          addToolApprovalResponse={addToolApprovalResponse}
          attachments={attachments}
          chatId={chatId}
          input={input}
          isReadonly={isReadonly}
          messages={messages}
          regenerate={regenerate}
          selectedModelId={currentModelId}
          selectedVisibilityType={visibilityType}
          sendMessage={sendMessage}
          setAttachments={setAttachments}
          setInput={setInput}
          setMessages={setMessages}
          status={status}
          stop={stop}
          votes={votes}
        />
      </div>

      <DataStreamHandler />

      <AlertDialog
        onOpenChange={setShowCreditCardAlert}
        open={showCreditCardAlert}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Activate AI Gateway</AlertDialogTitle>
            <AlertDialogDescription>
              This application requires{" "}
              {process.env.NODE_ENV === "production" ? "the owner" : "you"} to
              activate Vercel AI Gateway.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                window.open(
                  "https://vercel.com/d?to=%2F%5Bteam%5D%2F%7E%2Fai%3Fmodal%3Dadd-credit-card",
                  "_blank"
                );
                window.location.href = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/`;
              }}
            >
              Activate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
