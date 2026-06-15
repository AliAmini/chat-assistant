'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Message {
  id: string;
  role: 'USER' | 'ASSISTANT';
  content: string;
  createdAt: string;
}

interface Conversation {
  id: string;
  title: string | null;
  messages: Message[];
}

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [conversations, setConversations] = useState<any[]>([]);

  useEffect(() => {
    fetchConversation();
    fetchConversations();
  }, [params.id]);

  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/conversations');
      const data = await response.json();
      setConversations(data);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    }
  };

  const fetchConversation = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/conversations/${params.id}`);
      const data = await response.json();
      setConversation(data);
    } catch (error) {
      console.error('Failed to fetch conversation:', error);
    }
  };

  const createNewConversation = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      router.push(`/chat/${data.id}`);
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    setSending(true);
    const messageContent = input.trim();
    setInput('');

    try {
      const response = await fetch(
        `http://localhost:4000/api/conversations/${params.id}/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content: messageContent }),
        }
      );

      const data = await response.json();
      
      // Update conversation with new messages
      setConversation(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          messages: [...prev.messages, data.userMessage, data.assistantMessage],
        };
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      setInput(messageContent);
    } finally {
      setSending(false);
    }
  };

  if (!conversation) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <button
            onClick={createNewConversation}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition-colors"
          >
            New Conversation
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <h2 className="text-sm font-semibold text-gray-400 mb-2">Conversations</h2>
            {conversations.length === 0 ? (
              <p className="text-sm text-gray-500">No conversations yet</p>
            ) : (
              <ul className="space-y-1">
                {conversations.map((conv) => (
                  <li key={conv.id}>
                    <Link
                      href={`/chat/${conv.id}`}
                      className={`block px-2 py-1 text-sm rounded hover:bg-gray-700 transition-colors truncate ${
                        conv.id === params.id ? 'bg-gray-700' : ''
                      }`}
                    >
                      {conv.title || 'Untitled Conversation'}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <h1 className="text-xl font-semibold text-gray-800">
            {conversation.title || 'Chat'}
          </h1>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto space-y-4">
            {conversation.messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-20">
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              conversation.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === 'USER' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`chat-message-${
                      message.role === 'USER' ? 'user' : 'assistant'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input area */}
        <div className="border-t border-gray-200 bg-white p-4">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={sendMessage} className="flex space-x-4">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                disabled={sending}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              />
              <button
                type="submit"
                disabled={sending || !input.trim()}
                className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {sending ? 'Sending...' : 'Send'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}