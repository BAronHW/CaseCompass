import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { customFetch, requestTypeEnum } from "../../lib/customFetch";
import { Send, Bot, User, Sparkles } from "lucide-react";

const socket = io("http://localhost:3000", {
  autoConnect: false,
  reconnectionAttempts: 3,
  reconnectionDelay: 10000,
  transports: ['polling', 'websocket']
});

interface ChatMessages {
  id: number;
  chatId: number;
  body: string;
  timestamp: Date;
  isHuman: boolean;
  metaData: string;
  role: "user" | "llm";
}

interface ChatRoomCreateStruct {
    message: string;
    chatRoom: string;
  }

  interface NewHumanMessagePayload {
    newMessage: ChatMessages;
  }

  interface NewLlmResponsePayload {
    newLlmMessage: ChatMessages;
  }


export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessages[]>([]);
  const [unsentMessage, setUnsentMessage] = useState("");
  const [chatRoom, setChatRoom] = useState("");
  const [enableRag, setEnableRag] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = (messageBody: string) => {
    if (!messageBody.trim()) return;
    
    socket.emit("send-message", {
      messageBody,
      enableRag,
    });
    setUnsentMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(unsentMessage);
    }
  };

  const formatTime = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  useEffect(() => {
    if (!socket.connected) socket.connect();
    const token = sessionStorage.getItem("Authorization");
    socket.emit("connect-to-chat-room", { token });

    const handleChatCreated = ({ message, chatRoom }: ChatRoomCreateStruct) => {
      setChatRoom(chatRoom);
    };

    const handleNewHumanMessage = ({ newMessage }: NewHumanMessagePayload) => {
      setMessages((prev) => [...prev, newMessage]);
    };

    const handleNewLlmResponse = ({ newLlmMessage }: NewLlmResponsePayload) => {
      setMessages((prev) => [...prev, newLlmMessage]);
    };

    socket.on("chat-created", handleChatCreated);
    socket.on("new-human-message", handleNewHumanMessage);
    socket.on("new-llm-response", handleNewLlmResponse);

    return () => {
      socket.off("chat-created", handleChatCreated);
      socket.off("new-human-message", handleNewHumanMessage);
      socket.off("new-llm-response", handleNewLlmResponse);
    };
  }, []);

  useEffect(() => {
    const getExistingMessages = async () => {
      try {
        const response = await customFetch('http://localhost:3000/api/chat', requestTypeEnum.GET);
        if (response.messages && Array.isArray(response.messages)) {
          setMessages(response.messages);
        }
      } catch (error) {
        console.error('Failed to fetch existing messages:', error);
      }
    };

    getExistingMessages();
  }, []);

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 p-4 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-gray-900">Case Compass</h1>
              <p className="text-sm text-gray-500">AI Legal Assistant</p>
            </div>
          </div>
          
          <button
            onClick={() => setEnableRag(!enableRag)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              enableRag
                ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            {enableRag ? 'RAG ON' : 'RAG OFF'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto px-4 py-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${msg.isHuman ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.isHuman 
                    ? 'bg-blue-500' 
                    : 'bg-gradient-to-br from-purple-500 to-blue-600'
                }`}>
                  {msg.isHuman ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-white" />
                  )}
                </div>

                <div className={`flex flex-col max-w-xs sm:max-w-md lg:max-w-lg ${
                  msg.isHuman ? 'items-end' : 'items-start'
                }`}>
                  <div className={`px-4 py-3 rounded-2xl shadow-sm ${
                    msg.isHuman
                      ? 'bg-blue-500 text-white rounded-br-md'
                      : 'bg-white border border-gray-200 text-gray-800 rounded-bl-md'
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.body}</p>
                  </div>
                  <span className="text-xs text-gray-500 mt-1 px-2">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              </div>
            ))}
            
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-sm border-t border-gray-200 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end gap-3 bg-white rounded-2xl border border-gray-200 shadow-sm p-3">
            <div className="flex-1">
              <textarea
                value={unsentMessage}
                onChange={(e) => setUnsentMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Chat with case compass..."
                className="w-full resize-none border-none outline-none text-gray-800 placeholder-gray-500 text-sm leading-relaxed max-h-32"
                rows={1}
                style={{
                  height: 'auto',
                  minHeight: '24px',
                }}
              />
            </div>
            
            <button
              onClick={() => sendMessage(unsentMessage)}
              disabled={!unsentMessage.trim()}
              className={`p-2 rounded-xl transition-all duration-200 ${
                unsentMessage.trim()
                  ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          
          <p className="text-xs text-gray-500 text-center mt-2">
            Press Enter to send • Shift + Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}