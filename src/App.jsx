import { useState } from 'react';
import Login from './Login.jsx';
import Chat from './Chat.jsx';

export default function App() {
  const [auth, setAuth] = useState(null);

  if (!auth) {
    return <Login onLogin={setAuth} />;
  }
  return <Chat auth={auth} onLogout={() => setAuth(null)} />;
}
