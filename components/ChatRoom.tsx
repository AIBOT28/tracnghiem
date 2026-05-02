import React, { useState, useEffect, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import { CHAT_WS_URL } from '../constants';
import { v4 as uuidv4 } from 'uuid';

interface ChatMessage {
  username: string;
  content: string;
  createdAt: string;
}

const ChatRoom: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [username, setUsername] = useState(localStorage.getItem('chat_username') || '');
  const [isEditingUsername, setIsEditingUsername] = useState(!localStorage.getItem('chat_username'));
  const [deviceId] = useState(() => {
    let id = localStorage.getItem('chat_device_id');
    if (!id) {
      id = uuidv4();
      localStorage.setItem('chat_device_id', id);
    }
    return id;
  });
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(CHAT_WS_URL, {
        transport: signalR.HttpTransportType.LongPolling
      })
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);
  }, []);

  useEffect(() => {
    if (connection) {
      connection.start()
        .then(() => {
          console.log('Connected to ChatHub!');
          
          connection.on('ReceiveMessage', (user: string, message: string, time: string) => {
            setMessages(prev => [...prev, { username: user, content: message, createdAt: time }]);
          });

          connection.on('ReceiveHistory', (history: ChatMessage[]) => {
            setMessages(history);
          });

          connection.on('Error', (errorMessage: string) => {
            setError(errorMessage);
            setTimeout(() => setError(null), 5000);
          });
        })
        .catch(e => console.log('Connection failed: ', e));

      return () => {
        connection.stop();
      };
    }
  }, [connection]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !username.trim() || !connection) return;

    try {
      localStorage.setItem('chat_username', username);
      await connection.invoke('SendMessage', deviceId, username, input);
      setInput('');
    } catch (e) {
      console.error(e);
    }
  };

  if (isEditingUsername) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 bg-gray-50">
        <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Chào mừng bạn!</h2>
          <p className="text-gray-600 mb-6 text-center">Vui lòng nhập tên của bạn để bắt đầu trò chuyện</p>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Tên của bạn..."
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all mb-4"
            maxLength={20}
          />
          <button
            onClick={() => username.trim() && setIsEditingUsername(false)}
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg active:scale-95"
          >
            Bắt đầu Chat
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-100 overflow-hidden">
      {/* Header Chat */}
      <div className="bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
            {username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-bold text-gray-800">{username}</h3>
            <span className="text-xs text-green-500 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span> Trực tuyến
            </span>
          </div>
        </div>
        <button 
          onClick={() => setIsEditingUsername(true)}
          className="text-gray-500 hover:text-blue-600 p-2 rounded-lg hover:bg-gray-100 transition-all"
          title="Đổi tên"
        >
          <i className="fa-solid fa-user-pen"></i>
        </button>
      </div>

      {/* Messages List */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => {
          const isMe = msg.username === username;
          return (
            <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                {!isMe && <span className="text-xs text-gray-500 mb-1 ml-2">{msg.username}</span>}
                <div className={`px-4 py-2 rounded-2xl shadow-sm ${
                  isMe 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                }`}>
                  <p className="text-sm break-words whitespace-pre-wrap">{msg.content}</p>
                </div>
                <span className="text-[10px] text-gray-400 mt-1">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Error Toast */}
      {error && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm z-50 animate-bounce">
          <i className="fa-solid fa-triangle-exclamation mr-2"></i> {error}
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-200 shadow-lg shrink-0">
        <form onSubmit={handleSendMessage} className="flex gap-2 max-w-4xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Nhập tin nhắn (tối đa 150 ký tự)..."
            maxLength={150}
            className="flex-grow px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-md active:scale-90"
          >
            <i className="fa-solid fa-paper-plane"></i>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatRoom;
