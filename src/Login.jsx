import { useState } from 'react';
import { getState, DEFAULT_URL } from './api.js';

export default function Login({ onLogin }) {
  const [idInstance, setIdInstance] = useState(localStorage.getItem('idInstance') || '');
  const [apiTokenInstance, setToken] = useState('');
  const [apiUrl, setApiUrl] = useState(localStorage.getItem('apiUrl') || DEFAULT_URL);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const auth = { idInstance: idInstance.trim(), apiTokenInstance: apiTokenInstance.trim(), apiUrl: apiUrl.trim() };
    try {
      const data = await getState(auth);
      if (data.stateInstance !== 'authorized') {
        throw new Error('Инстанс не авторизован: ' + data.stateInstance);
      }
      localStorage.setItem('idInstance', auth.idInstance);
      localStorage.setItem('apiUrl', auth.apiUrl);
      onLogin(auth);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  return (
    <form className="login" onSubmit={handleSubmit}>
      <h2>Вход</h2>
      <input placeholder="idInstance" value={idInstance} onChange={(e) => setIdInstance(e.target.value)} required />
      <input
        type="password"
        placeholder="apiTokenInstance"
        value={apiTokenInstance}
        onChange={(e) => setToken(e.target.value)}
        required
      />
      <input placeholder="apiUrl" value={apiUrl} onChange={(e) => setApiUrl(e.target.value)} required />
      {error && <div className="error">{error}</div>}
      <button disabled={loading}>{loading ? 'Загрузка...' : 'Войти'}</button>
    </form>
  );
}
