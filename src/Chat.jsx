import { useEffect, useRef, useState } from 'react';
import { checkAccount, sendMessage, receiveNotification, deleteNotification } from './api.js';

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

export default function Chat({ auth, onLogout }) {
  const [chats, setChats] = useState({});
  const [activeId, setActiveId] = useState(null);
  const [phone, setPhone] = useState('');
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const endRef = useRef(null);

  function addMessage(chatId, message, title) {
    setChats((prev) => {
      const chat = prev[chatId] || { id: chatId, title: title || chatId, messages: [] };
      if (message.id && chat.messages.some((m) => m.id === message.id)) {
        return prev;
      }
      return { ...prev, [chatId]: { ...chat, messages: [...chat.messages, message] } };
    });
  }

  useEffect(() => {
    const controller = new AbortController();

    async function poll() {
      while (!controller.signal.aborted) {
        try {
          const note = await receiveNotification(auth, controller.signal);
          if (!note) continue;

          const { typeWebhook, senderData, messageData, idMessage, timestamp } = note.body || {};
          const msgText = messageData?.textMessageData?.textMessage || messageData?.extendedTextMessageData?.text;

          if (typeWebhook === 'incomingMessageReceived' && msgText) {
            addMessage(
              senderData.chatId,
              { id: idMessage, text: msgText, out: false, time: (timestamp || Date.now() / 1000) * 1000 },
              senderData.senderName
            );
          }
          await deleteNotification(auth, note.receiptId);
        } catch (err) {
          if (controller.signal.aborted) return;
          setError(err.message);
          await new Promise((resolve) => setTimeout(resolve, 5000));
        }
      }
    }

    poll();
    return () => controller.abort();
  }, [auth]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats, activeId]);

  async function createChat(e) {
    e.preventDefault();
    setError('');
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10) {
      setError('Введите номер в международном формате');
      return;
    }
    try {
      const res = await checkAccount(auth, digits);
      if (!res.exist) {
        setError('Такого аккаунта нет');
        return;
      }
      setChats((prev) => {
        if (prev[res.chatId]) return prev;
        return { ...prev, [res.chatId]: { id: res.chatId, title: '+' + digits, messages: [] } };
      });
      setActiveId(res.chatId);
      setPhone('');
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSend(e) {
    e.preventDefault();
    const message = text.trim();
    if (!message || !activeId) return;
    setText('');
    setError('');
    try {
      const res = await sendMessage(auth, activeId, message);
      addMessage(activeId, { id: res.idMessage, text: message, out: true, time: Date.now() });
    } catch (err) {
      setError(err.message);
      setText(message);
    }
  }

  const activeChat = chats[activeId];

  return (
    <div className="app">
      <div className="sidebar">
        <div className="sidebar-top">
          <span>Чаты</span>
          <button className="logout" onClick={onLogout}>Выйти</button>
        </div>
        <form className="new-chat" onSubmit={createChat}>
          <input placeholder="Номер телефона" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <button>+</button>
        </form>
        <div className="chat-list">
          {Object.values(chats).map((chat) => (
            <div
              key={chat.id}
              className={chat.id === activeId ? 'chat-item active' : 'chat-item'}
              onClick={() => setActiveId(chat.id)}
            >
              <div className="avatar">{chat.title.replace('+', '')[0]}</div>
              <div className="chat-info">
                <div className="chat-title">{chat.title}</div>
                <div className="last-message">{chat.messages.at(-1)?.text}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="main">
        {error && <div className="error" onClick={() => setError('')}>{error}</div>}
        {activeChat ? (
          <>
            <div className="chat-header">{activeChat.title}</div>
            <div className="messages">
              {activeChat.messages.map((m, i) => (
                <div key={m.id || i} className={m.out ? 'message out' : 'message'}>
                  <span>{m.text}</span>
                  <span className="time">{formatTime(m.time)}</span>
                </div>
              ))}
              <div ref={endRef} />
            </div>
            <form className="send-form" onSubmit={handleSend}>
              <input placeholder="Сообщение" value={text} onChange={(e) => setText(e.target.value)} />
              <button disabled={!text.trim()}>Отправить</button>
            </form>
          </>
        ) : (
          <div className="empty">Выберите чат или создайте новый</div>
        )}
      </div>
    </div>
  );
}
