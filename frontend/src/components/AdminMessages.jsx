import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Trash2,
  Mail,
  MailOpen,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Inbox,
} from 'lucide-react';
import Loader from './ui/Loader';
import { API_BASE } from '../config/api';

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AdminMessages({ onUnreadRefresh }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(null); // { type: 'success'|'error', text }
  const [expandedId, setExpandedId] = useState(null);
  const navigate = useNavigate();

  const fetchMessages = useCallback(async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_BASE}/api/admin/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      } else if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('adminToken');
        navigate('/admin');
      } else {
        setNotice({
          type: 'error',
          text: `Failed to load messages (HTTP ${res.status}).`,
        });
      }
    } catch {
      setNotice({
        type: 'error',
        text: 'Network error — could not load messages.',
      });
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const markAsRead = useCallback(
    async (id) => {
      try {
        const token = localStorage.getItem('adminToken');
        const res = await fetch(`${API_BASE}/api/admin/messages/${id}/read`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          setMessages((prev) =>
            prev.map((m) => (m._id === id ? { ...m, isRead: true } : m))
          );
          onUnreadRefresh?.();
        }
      } catch {
        // silent — UI stays consistent
      }
    },
    [onUnreadRefresh]
  );

  const deleteMessage = useCallback(
    async (id) => {
      try {
        const token = localStorage.getItem('adminToken');
        const res = await fetch(`${API_BASE}/api/admin/messages/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          setMessages((prev) => prev.filter((m) => m._id !== id));
          if (expandedId === id) setExpandedId(null);
          onUnreadRefresh?.();
        } else {
          setNotice({ type: 'error', text: 'Failed to delete message.' });
        }
      } catch {
        setNotice({
          type: 'error',
          text: 'Network error — could not delete message.',
        });
      }
    },
    [expandedId, onUnreadRefresh]
  );

  const handleExpand = async (message) => {
    if (expandedId === message._id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(message._id);
    if (!message.isRead) {
      await markAsRead(message._id);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    setNotice(null);
    await fetchMessages();
    onUnreadRefresh?.();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-card shadow-xl rounded-2xl border border-border overflow-hidden">
        {/* Header */}
        <div className="p-4 text-white flex items-center justify-between font-bold uppercase italic bg-brandBlack">
          <div className="flex items-center gap-2">
            <Inbox size={20} />
            <span>Contact Inbox</span>
            <span className="text-xs font-normal normal-case opacity-70">
              ({messages.length} total,{' '}
              {messages.filter((m) => !m.isRead).length} unread)
            </span>
          </div>
          <button
            onClick={handleRefresh}
            title="Refresh messages"
            className="opacity-70 hover:opacity-100 transition-opacity"
          >
            <RefreshCw size={16} />
          </button>
        </div>

        {/* Notice banner */}
        {notice && (
          <div
            className={`flex items-center gap-2 mx-4 mt-4 p-3 rounded-lg text-sm font-semibold ${
              notice.type === 'success'
                ? 'bg-green-500/10 text-green-500 border border-green-500/30'
                : 'bg-red-500/10 text-red-400 border border-red-500/30'
            }`}
          >
            {notice.type === 'success' ? (
              <CheckCircle2 size={16} />
            ) : (
              <AlertCircle size={16} />
            )}
            {notice.text}
          </div>
        )}

        {/* Empty state */}
        {messages.length === 0 ? (
          <div className="p-12 text-center">
            <Mail
              size={40}
              className="mx-auto text-muted-foreground mb-3"
            />
            <p className="text-muted-foreground font-semibold">
              No messages yet.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Messages submitted via the contact form will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {messages.map((m) => (
              <div
                key={m._id}
                className={`transition-colors ${!m.isRead ? 'bg-brandRed/5' : ''}`}
              >
                {/* Row */}
                <div
                  className="flex items-start gap-3 p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleExpand(m)}
                >
                  {/* Read/unread icon */}
                  <div className="shrink-0 mt-0.5">
                    {m.isRead ? (
                      <MailOpen
                        size={18}
                        className="text-muted-foreground"
                      />
                    ) : (
                      <Mail
                        size={18}
                        className="text-brandRed"
                      />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <p
                        className={`text-sm truncate ${
                          !m.isRead
                            ? 'font-black text-foreground'
                            : 'font-semibold text-foreground'
                        }`}
                      >
                        {m.name}
                        {!m.isRead && (
                          <span className="ml-2 inline-block w-2 h-2 rounded-full bg-brandRed align-middle" />
                        )}
                      </p>
                      <span className="text-[11px] text-muted-foreground whitespace-nowrap shrink-0 font-mono">
                        {formatDate(m.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {m.email}
                    </p>
                    <p className="text-xs font-semibold text-muted-foreground truncate mt-0.5">
                      {m.subject}
                    </p>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteMessage(m._id);
                    }}
                    title="Delete message"
                    className="shrink-0 text-muted-foreground hover:text-brandRed p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 border border-transparent hover:border-red-100 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* Expanded message body */}
                {expandedId === m._id && (
                  <div className="px-4 pb-5 pl-11 space-y-3">
                    <div className="bg-muted rounded-xl p-4 border border-border text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                      {m.message}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <span>
                        From:{' '}
                        <a
                          href={`mailto:${m.email}`}
                          className="text-brandRed underline"
                        >
                          {m.email}
                        </a>
                      </span>
                      <span>Subject: {m.subject}</span>
                    </div>
                    {!m.isRead && (
                      <button
                        onClick={() => markAsRead(m._id)}
                        className="text-xs font-bold text-brandRed hover:underline"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
