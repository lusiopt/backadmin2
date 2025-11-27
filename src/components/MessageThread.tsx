"use client";

import React, { useState, useRef, useEffect } from "react";
import { Message, MessageType, MessageStatus, UserRole, CreateMessageInput } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import { MessageCircle, Send, FileText, AlertCircle, CheckCircle2, Clock, File, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface MessageThreadProps {
  serviceId: string;
  messages: Message[];
  onSendMessage: (input: CreateMessageInput) => void;
}

export function MessageThread({ serviceId, messages, onSendMessage }: MessageThreadProps) {
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState("");
  const [requestType, setRequestType] = useState<"document" | "clarification" | "other">("other");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const messageType = user?.role === UserRole.ADVOGADA
      ? MessageType.LAWYER_REQUEST
      : MessageType.BACKOFFICE_RESPONSE;

    onSendMessage({
      serviceId,
      content: newMessage,
      type: messageType,
      requestType: user?.role === UserRole.ADVOGADA ? requestType : undefined,
    });

    setNewMessage("");
  };

  const getMessageIcon = (message: Message) => {
    switch (message.type) {
      case MessageType.LAWYER_REQUEST:
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case MessageType.BACKOFFICE_RESPONSE:
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case MessageType.SYSTEM:
        return <Clock className="w-4 h-4 text-gray-500" />;
      default:
        return <MessageCircle className="w-4 h-4 text-blue-500" />;
    }
  };

  const getMessageBgColor = (message: Message) => {
    if (message.senderId === user?.id) {
      return "bg-blue-100 border-blue-300";
    }

    switch (message.senderRole) {
      case UserRole.ADVOGADA:
        return "bg-orange-50 border-orange-200";
      case UserRole.BACKOFFICE:
        return "bg-green-50 border-green-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const sortedMessages = [...messages].sort((a, b) =>
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-gray-600" />
          <h3 className="text-sm font-semibold text-gray-800">Mensagens do Processo</h3>
          {messages.some(m => m.status === MessageStatus.UNREAD && m.senderId !== user?.id) && (
            <span className="px-2 py-0.5 text-xs font-medium bg-red-500 text-white rounded-full">
              {messages.filter(m => m.status === MessageStatus.UNREAD && m.senderId !== user?.id).length} nova(s)
            </span>
          )}
        </div>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-96">
        {sortedMessages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">Nenhuma mensagem ainda</p>
            <p className="text-xs mt-1">Seja o primeiro a enviar uma mensagem</p>
          </div>
        ) : (
          sortedMessages.map((message) => {
            const isOwn = message.senderId === user?.id;

            return (
              <div key={message.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] ${isOwn ? "items-end" : "items-start"} flex flex-col gap-1`}>
                  {/* Sender info */}
                  <div className="flex items-center gap-2 px-1">
                    {getMessageIcon(message)}
                    <span className="text-xs font-medium text-gray-600">
                      {isOwn ? "Você" : message.senderName}
                    </span>
                    <span className="text-xs text-gray-400">
                      {format(new Date(message.createdAt), "dd/MM HH:mm", { locale: ptBR })}
                    </span>
                    {message.status === MessageStatus.UNREAD && !isOwn && (
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    )}
                  </div>

                  {/* Message bubble */}
                  <div className={`px-3 py-2 rounded-lg border ${getMessageBgColor(message)}`}>
                    {/* Request type badge for lawyer requests */}
                    {message.type === MessageType.LAWYER_REQUEST && message.requestType && (
                      <div className="flex items-center gap-1 mb-2 text-xs text-orange-700">
                        <FileText className="w-3 h-3" />
                        <span className="font-medium">
                          {message.requestType === "document" && "Solicitação de Documento"}
                          {message.requestType === "clarification" && "Pedido de Esclarecimento"}
                          {message.requestType === "other" && "Outra Solicitação"}
                        </span>
                      </div>
                    )}

                    {/* Message content */}
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">{message.content}</p>

                    {/* Read status */}
                    {isOwn && (
                      <div className="flex justify-end mt-1">
                        {message.status === MessageStatus.READ ? (
                          <CheckCircle2 className="w-3 h-3 text-green-500" />
                        ) : (
                          <Clock className="w-3 h-3 text-gray-400" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="px-4 py-3 bg-white border-t border-gray-200">
        {/* Request type selector for Advogada */}
        {user?.role === UserRole.ADVOGADA && (
          <div className="mb-2 flex gap-2">
            <button
              onClick={() => setRequestType("document")}
              className={`px-3 py-1 text-xs rounded-lg transition-colors flex items-center gap-1 ${
                requestType === "document"
                  ? "bg-orange-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <File className="w-3 h-3" /> Documento
            </button>
            <button
              onClick={() => setRequestType("clarification")}
              className={`px-3 py-1 text-xs rounded-lg transition-colors flex items-center gap-1 ${
                requestType === "clarification"
                  ? "bg-orange-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <MessageCircle className="w-3 h-3" /> Esclarecimento
            </button>
            <button
              onClick={() => setRequestType("other")}
              className={`px-3 py-1 text-xs rounded-lg transition-colors flex items-center gap-1 ${
                requestType === "other"
                  ? "bg-orange-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Sparkles className="w-3 h-3" /> Outro
            </button>
          </div>
        )}

        {/* Message input */}
        <div className="flex gap-2">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder={
              user?.role === UserRole.ADVOGADA
                ? "Digite sua solicitação..."
                : "Digite sua resposta..."
            }
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={2}
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Enviar</span>
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-2">
          Pressione Enter para enviar, Shift+Enter para nova linha
        </p>
      </div>
    </div>
  );
}
