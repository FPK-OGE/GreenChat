# Чат для MAX

Небольшой чат на React для отправки и получения текстовых сообщений через GREEN-API.

Используются методы:
- sendMessage - отправка
- receiveNotification и deleteNotification - получение (HTTP API)
- checkAccount - поиск чата по номеру телефона

## Запуск

```
npm install
npm run dev
```

Потом открыть http://localhost:5173, ввести idInstance и apiTokenInstance из личного кабинета GREEN-API, указать номер получателя и написать сообщение.

Инстанс в кабинете должен быть авторизован.
