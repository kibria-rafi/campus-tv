import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { API_BASE } from '../config/api';

export default function Login({ lang }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginMsg, setLoginMsg] = useState(null);
  const navigate = useNavigate();
  const isBn = lang === 'bn';

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginMsg(null);
    let res;
    try {
      res = await fetch(`${API_BASE}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
    } catch {
      setLoginMsg({ type: 'error', text: isBn ? 'সার্ভারের সাথে সংযোগ করা যায়নি।' : 'Server connection error.' });
      return;
    }
    let data;
    try { data = await res.json(); } catch { data = {}; }

    if (data.success) {
      localStorage.setItem('adminToken', data.token);
      navigate('/dashboard');
    } else {
      setLoginMsg({ type: 'error', text: isBn ? 'ইউজারনেম বা পাসওয়ার্ড ভুল।' : 'Invalid username or password.' });
    }
  };

  return (
    <div className="max-w-md mx-auto my-10 bg-card text-card-foreground p-8 rounded-lg shadow-xl border-t-4 border-brandRed">
      <h2 className="text-3xl font-black text-center text-foreground mb-6 uppercase italic">
        {isBn ? 'অ্যাডমিন লগইন' : 'Admin Login'}
      </h2>
      <form
        onSubmit={handleLogin}
        className="space-y-4"
      >
        <div>
          <label className="block text-sm font-bold mb-1 text-foreground">
            {isBn ? 'ইউজারনেম' : 'Username'}
          </label>
          <input
            type="text"
            className="w-full border border-border bg-background text-foreground placeholder:text-muted-foreground p-2 rounded focus:outline-none focus:border-brandRed"
            placeholder="admin"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-bold mb-1 text-foreground">
            {isBn ? 'পাসওয়ার্ড' : 'Password'}
          </label>
          <input
            type="password"
            className="w-full border border-border bg-background text-foreground placeholder:text-muted-foreground p-2 rounded focus:outline-none focus:border-brandRed"
            placeholder="*******"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {loginMsg && (
          <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold ${
            loginMsg.type === 'error'
              ? 'bg-red-500/10 border border-red-500/30 text-red-500'
              : 'bg-green-500/10 border border-green-500/30 text-green-600'
          }`}>
            <AlertCircle size={16} />
            {loginMsg.text}
          </div>
        )}
        <button
          type="submit"
          className="w-full bg-brandRed text-white font-bold py-2 rounded hover:bg-red-700 transition uppercase italic"
        >
          {isBn ? 'প্রবেশ করুন' : 'Login'}
        </button>
      </form>
    </div>
  );
}
