export const DEFAULT_URL = 'https://api.green-api.com';

function makeUrl(auth, method, end = '') {
  const base = auth.apiUrl.replace(/\/$/, '');
  return `${base}/waInstance${auth.idInstance}/${method}/${auth.apiTokenInstance}${end}`;
}

async function request(url, options = {}) {
  const { method = 'GET', body, signal } = options;
  const res = await fetch(url, {
    method,
    signal,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error('Ошибка ' + res.status + (text ? ': ' + text.slice(0, 200) : ''));
  }
  return text ? JSON.parse(text) : null;
}

export function getState(auth) {
  return request(makeUrl(auth, 'getStateInstance'));
}

export function checkAccount(auth, phone) {
  return request(makeUrl(auth, 'checkAccount'), {
    method: 'POST',
    body: { phoneNumber: Number(phone) },
  });
}

export function sendMessage(auth, chatId, message) {
  return request(makeUrl(auth, 'sendMessage'), {
    method: 'POST',
    body: { chatId, message },
  });
}

export function receiveNotification(auth, signal) {
  return request(makeUrl(auth, 'receiveNotification', '?receiveTimeout=10'), { signal });
}

export function deleteNotification(auth, receiptId) {
  return request(makeUrl(auth, 'deleteNotification', '/' + receiptId), { method: 'DELETE' });
}
