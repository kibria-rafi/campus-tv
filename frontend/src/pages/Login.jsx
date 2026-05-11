import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Loader2 } from 'lucide-react';
import { API_BASE } from '../config/api';

export default function Login({ lang }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginMsg, setLoginMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const isBn = lang === 'bn';

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoginMsg(null);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      let data;
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (data.success) {
        localStorage.setItem('adminToken', data.token);
        navigate('/dashboard');
      } else {
        setLoginMsg({
          type: 'error',
          text: isBn ? 'ইউজারনেম বা পাসওয়ার্ড ভুল।' : 'Invalid username or password.',
        });
        setLoading(false);
      }
    } catch (err) {
      console.error('[Login] Error:', err);
      setLoginMsg({
        type: 'error',
        text: isBn ? 'সার্ভারের সাথে সংযোগ করা যায়নি।' : 'Server connection error.',
      });
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-10 bg-card text-card-foreground p-8 rounded-lg shadow-xl border-t-4 border-brandRed">
      <h2 className="text-3xl font-black text-center text-foreground mb-6 uppercase italic">
        {isBn ? 'অ্যাডমিন লগইন' : 'Admin Login'}
      </h2>
      <form onSubmit={handleLogin} className="space-y-4">
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
          <div
            className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold ${
              loginMsg.type === 'error'
                ? 'bg-red-500/10 border border-red-500/30 text-red-500'
                : 'bg-green-500/10 border border-green-500/30 text-green-600'
            }`}
          >
            <AlertCircle size={16} />
            {loginMsg.text}
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-brandRed text-white font-bold py-2 rounded transition uppercase italic flex items-center justify-center gap-2 ${
            loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-red-700'
          }`}
        >
          {loading && <Loader2 className="w-5 h-5 animate-spin" />}
          {loading
            ? isBn
              ? 'প্রবেশ করা হচ্ছে...'
              : 'Logging in...'
            : isBn
            ? 'প্রবেশ করুন'
            : 'Login'}
        </button>
      </form>
    </div>
  );
}
