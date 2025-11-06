"use client";

import React, { useState, useRef, useEffect } from "react";
import { Upload, Send, FileText, X, Loader2, Brain } from "lucide-react";
import {
  aiChatApi,
  ContractAnalysisResponse,
  Chat,
  ChatMessage as ChatMessageType,
} from "@/lib/api/aiChat";
import { Button } from "@/components/ui/button";

interface ChatInterfaceProps {
  className?: string;
  currentChatId?: string | null;
  onChatSaved?: (chatId: string) => void;
}

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  reasoning?: string; // Store reasoning separately
  timestamp: Date;
  file?: File;
}

export function ChatInterface({
  className,
  currentChatId,
  onChatSaved,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showReasoning, setShowReasoning] = useState(false);
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [hasContract, setHasContract] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load chat when currentChatId changes
  useEffect(() => {
    const loadChat = async () => {
      if (!currentChatId) {
        // Clear messages for new chat
        setMessages([]);
        setHasContract(false);
        return;
      }

      setIsLoadingChat(true);
      setError(null);
      try {
        const chat: Chat = await aiChatApi.getChat(currentChatId);
        // Check if chat has contract text stored
        setHasContract(!!chat.contract_text);

        // Convert chat messages to Message format
        const loadedMessages: Message[] = chat.messages.map((msg) => ({
          id: msg.id,
          type: msg.role as "user" | "assistant",
          content: msg.content,
          reasoning: msg.reasoning || undefined,
          timestamp: new Date(msg.created_at),
        }));
        setMessages(loadedMessages);
      } catch (err: any) {
        setError("Failed to load chat");
        console.error("Error loading chat:", err);
      } finally {
        setIsLoadingChat(false);
      }
    };

    loadChat();
  }, [currentChatId]);

  // Parse response to extract reasoning and main content
  const parseResponse = (
    response: string
  ): { main: string; reasoning?: string } => {
    const separator = "--- Model Reasoning ---\n\n";
    const divider = "\n\n" + "=".repeat(60) + "\n\n";

    const reasoningIndex = response.indexOf(separator);
    const dividerIndex = response.indexOf(divider);

    if (reasoningIndex !== -1 && dividerIndex !== -1) {
      const reasoning = response
        .substring(reasoningIndex + separator.length, dividerIndex)
        .trim();
      const main = response.substring(dividerIndex + divider.length).trim();
      return { main, reasoning };
    }

    return { main: response };
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        setError("Please upload a PDF file");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        setError("File size must be less than 10MB");
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSend = async () => {
    // Allow text-only if chat has a contract (follow-up question)
    if (currentChatId && hasContract && !selectedFile && inputText.trim()) {
      // This is a follow-up question - allow it
    } else if (!selectedFile && !inputText.trim()) {
      setError("Please upload a PDF file or enter some text");
      return;
    }

    setIsLoading(true);
    setError(null);

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputText || `Uploaded: ${selectedFile?.name}`,
      timestamp: new Date(),
      file: selectedFile || undefined,
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      // Determine if we should save to chat
      const shouldSaveToChat = !currentChatId; // Save to new chat if no current chat
      const chatIdToUse = currentChatId || undefined;

      const response: ContractAnalysisResponse =
        await aiChatApi.analyzeContract({
          file: selectedFile || undefined,
          user_text: inputText.trim() || undefined,
          chat_id: chatIdToUse,
          save_to_chat: shouldSaveToChat,
        });

      // Parse response to extract reasoning
      const { main, reasoning } = parseResponse(response.analysis);

      // Add assistant message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: main,
        reasoning: reasoning,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // If we saved to a new chat, reload chats to get the new chat ID
      // Note: The backend saves the chat but doesn't return the ID in the response
      // So we'll trigger a refresh and the user can see the new chat in the sidebar
      if (shouldSaveToChat && onChatSaved) {
        // Trigger refresh - the parent will reload the chat list
        // We can't get the chat ID from the response, so we'll just trigger refresh
        onChatSaved(""); // Empty string to trigger refresh
      }

      // Reset form
      setInputText("");
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.detail ||
        err.message ||
        "Failed to analyze contract";
      setError(errorMessage);

      // Add error message to chat
      const errorMsg: Message = {
        id: Date.now().toString(),
        type: "assistant",
        content: `Error: ${errorMessage}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Reasoning Toggle */}
      <div className="mb-4 flex items-center justify-end">
        <button
          onClick={() => setShowReasoning(!showReasoning)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            showReasoning
              ? "bg-purple-100 text-purple-700 hover:bg-purple-200"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <Brain className="w-4 h-4" />
          <span>Show Reasoning</span>
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {isLoadingChat ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
              <span className="text-gray-600">Loading chat...</span>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-white rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg"></div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome to Contract Analyzer
            </h2>
            <p className="text-gray-600 max-w-md mx-auto">
              Upload a PDF contract or enter text to get AI-powered contract
              analysis and recommendations.
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.type === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.type === "user"
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                    : "bg-white text-gray-900 shadow-md"
                }`}
              >
                {message.file && (
                  <div className="flex items-center gap-2 mb-2 text-sm opacity-90">
                    <FileText className="w-4 h-4" />
                    <span>{message.file.name}</span>
                  </div>
                )}

                {/* Show reasoning if toggle is on and reasoning exists */}
                {message.type === "assistant" &&
                  showReasoning &&
                  message.reasoning && (
                    <div className="mb-3 pb-3 border-b border-gray-200">
                      <div className="text-xs font-medium text-gray-500 mb-1">
                        Model Reasoning
                      </div>
                      <div className="text-sm text-gray-600 whitespace-pre-wrap">
                        {message.reasoning}
                      </div>
                    </div>
                  )}

                <div className="whitespace-pre-wrap">{message.content}</div>
                <div
                  className={`text-xs mt-2 ${
                    message.type === "user" ? "text-white/70" : "text-gray-500"
                  }`}
                >
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl px-4 py-3 shadow-md">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
                <span className="text-gray-600">Analyzing contract...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white rounded-2xl p-4 shadow-lg">
        {/* File Preview */}
        {selectedFile && (
          <div className="mb-3 flex items-center justify-between bg-gray-50 rounded-xl p-3">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-500" />
              <span className="text-sm font-medium text-gray-700">
                {selectedFile.name}
              </span>
              <span className="text-xs text-gray-500">
                ({(selectedFile.size / 1024).toFixed(1)} KB)
              </span>
            </div>
            <button
              onClick={handleRemoveFile}
              className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        )}

        {/* Input Controls */}
        <div className="flex items-end gap-2">
          {/* File Upload Button */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="flex-shrink-0"
            onClick={handleFileButtonClick}
          >
            <Upload className="w-5 h-5" />
          </Button>

          {/* Text Input */}
          <div className="flex-1">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={
                hasContract && currentChatId
                  ? "Ask a follow-up question about the contract..."
                  : selectedFile
                  ? "Add any questions or additional context..."
                  : "Upload a PDF contract or enter contract text to analyze..."
              }
              className="w-full px-4 py-3 text-sm md:text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows={3}
              disabled={isLoading}
            />
          </div>

          {/* Send Button */}
          <Button
            onClick={handleSend}
            disabled={
              isLoading ||
              (!selectedFile &&
                !inputText.trim() &&
                !(currentChatId && hasContract))
            }
            className="flex-shrink-0 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>

        {/* Helper Text */}
        <p className="text-xs text-gray-500 mt-2">
          {hasContract && currentChatId
            ? "Ask follow-up questions about the contract or upload a new file"
            : selectedFile
            ? "You can add questions or context before sending"
            : "Upload a PDF contract or type contract text to get started"}
        </p>
      </div>
    </div>
  );
}
