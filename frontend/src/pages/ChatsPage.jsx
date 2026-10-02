import { useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import { SendHorizonal } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { chatService } from '../services/chatService';

const ChatsPage = () => {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState('');
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchChats = async () => {
      try {
        const response = await chatService.getChats();
        const chatList = response?.data?.chats || [];
        setChats(chatList);
        if (chatList[0]) {
          setSelectedChatId(chatList[0]._id);
        }
      } catch (error) {
        console.error('Failed to load chats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';
    const newSocket = io(socketUrl, {
      auth: { token: localStorage.getItem('gighub_token') }
    });

    newSocket.on('connect', () => {
      newSocket.emit('join_user', user._id || user.id);
    });

    newSocket.on('new_message', (payload) => {
      const { chatId, message } = payload;
      setMessages((prev) => {
        const exists = prev.some((item) => item._id === message._id);
        if (exists) return prev;
        return [...prev, { ...message, _id: message._id || Date.now() }];
      });

      setChats((prev) =>
        prev.map((chat) =>
          chat._id === chatId
            ? { ...chat, lastMessage: { content: message.content, sender: message.sender, timestamp: message.timestamp } }
            : chat
        )
      );
    });

    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, [user]);

  useEffect(() => {
    if (!selectedChatId) return;
    const loadActiveChat = async () => {
      try {
        const response = await chatService.getChatById(selectedChatId);
        setMessages(response?.data?.chat?.messages || []);
        socket?.emit('join_chat', selectedChatId);
      } catch (error) {
        console.error('Failed to load active chat:', error);
      }
    };

    loadActiveChat();
  }, [selectedChatId, socket]);

  const handleSend = async (event) => {
    event.preventDefault();
    if (!selectedChatId || !draft.trim() || !socket) return;

    socket.emit('send_message', {
      chatId: selectedChatId,
      senderId: user._id || user.id,
      content: draft.trim()
    });

    setDraft('');
  };

  const activeChat = useMemo(
    () => chats.find((chat) => chat._id === selectedChatId) || null,
    [chats, selectedChatId]
  );

  const activeParticipants = activeChat?.participants?.filter((person) => person._id !== (user?._id || user?.id)) || [];

  if (loading) {
    return <div className="page-shell"><div className="loader">Loading conversations...</div></div>;
  }

  return (
    <div className="page-shell">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Messages</span>
          <h2>Live conversations</h2>
        </div>
      </div>

      <div className="chat-layout">
        <aside className="chat-list">
          {chats.length ? (
            chats.map((chat) => {
              const otherUser = chat.participants.find((person) => person._id !== (user?._id || user?.id));
              return (
                <button key={chat._id} className={`chat-item ${selectedChatId === chat._id ? 'active' : ''}`} onClick={() => setSelectedChatId(chat._id)}>
                  <div className="avatar">{otherUser?.name?.[0] || 'U'}</div>
                  <div className="chat-item-meta">
                    <strong>{otherUser?.name || 'Conversation'}</strong>
                    <span className="muted">{chat.lastMessage?.content || 'No messages yet'}</span>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="empty-state">No conversations yet.</div>
          )}
        </aside>

        <div className="chat-window">
          {activeChat ? (
            <>
              <div className="chat-header">
                <div>
                  <strong>{activeParticipants[0]?.name || 'Conversation'}</strong>
                  <div className="muted">{activeParticipants[0]?.role || 'User'}</div>
                </div>
              </div>

              <div className="chat-messages">
                {messages.length ? (
                  messages.map((message) => {
                    const senderId = message.sender?._id || message.sender;
                    const isMe = senderId === (user?._id || user?.id);
                    return (
                      <div key={message._id || `${message.timestamp}-${Math.random()}`} className={`message-row ${isMe ? 'me' : ''}`}>
                        <div className="message-bubble">
                          <div className="message-meta">
                            <strong>{isMe ? 'You' : message.sender?.name || 'User'}</strong>
                            <span>{new Date(message.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <div>{message.content}</div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="empty-state">No messages yet in this conversation.</div>
                )}
              </div>

              <form className="chat-form" onSubmit={handleSend}>
                <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Type a message" />
                <button type="submit" className="button primary"><SendHorizonal size={16} /> Send</button>
              </form>
            </>
          ) : (
            <div className="empty-state">Select a chat to begin.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatsPage;
