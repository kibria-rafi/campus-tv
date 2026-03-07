import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LogOut,
  Send,
  Trash2,
  Edit3,
  XCircle,
  FileText,
  Radio,
  CheckCircle2,
  AlertCircle,
  KeyRound,
} from 'lucide-react';
import Loader from '../components/ui/Loader';
import { API_BASE } from '../config/api';

function ToolBtn({ onClick, title, children }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault(); // keep editor focus
        onClick();
      }}
      title={title}
      className="px-2 py-1 text-xs font-bold rounded hover:bg-card border border-transparent hover:border-border text-foreground transition-all select-none"
    >
      {children}
    </button>
  );
}

function RichEditor({
  initialValue = '',
  onChange,
  placeholder = 'Write here...',
}) {
  const editorRef = useRef(null);

  // Populate once on mount; key prop on parent handles re-init when editing id changes
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = initialValue;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const exec = (cmd, value = null) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, value);
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  const handleLink = () => {
    const url = window.prompt('Link URL:');
    if (url && url.trim()) exec('createLink', url.trim());
  };

  return (
    <div className="border-2 border-border rounded-xl overflow-hidden focus-within:border-brandRed transition-colors">
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-border bg-muted">
        <ToolBtn
          onClick={() => exec('bold')}
          title="Bold"
        >
          <b>B</b>
        </ToolBtn>
        <ToolBtn
          onClick={() => exec('italic')}
          title="Italic"
        >
          <i>I</i>
        </ToolBtn>
        <ToolBtn
          onClick={() => exec('underline')}
          title="Underline"
        >
          <u>U</u>
        </ToolBtn>
        <span className="w-px h-4 bg-border mx-1 inline-block" />
        <ToolBtn
          onClick={() => exec('insertUnorderedList')}
          title="Bullet list"
        >
          • List
        </ToolBtn>
        <ToolBtn
          onClick={() => exec('insertOrderedList')}
          title="Numbered list"
        >
          1. List
        </ToolBtn>
        <span className="w-px h-4 bg-border mx-1 inline-block" />
        <ToolBtn
          onClick={() => exec('formatBlock', 'blockquote')}
          title="Blockquote"
        >
          ❝
        </ToolBtn>
        <ToolBtn
          onClick={handleLink}
          title="Insert link"
        >
          Link
        </ToolBtn>
        <span className="w-px h-4 bg-border mx-1 inline-block" />
        <ToolBtn
          onClick={() => exec('removeFormat')}
          title="Clear formatting"
        >
          Clear
        </ToolBtn>
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
        data-placeholder={placeholder}
        className="bn-editor-area min-h-[180px] p-4 outline-none text-foreground bg-background leading-relaxed"
        style={{ fontFamily: "'SolaimanLipi', sans-serif" }}
      />
    </div>
  );
}

const CATEGORIES = [
  'Features',
  'Culture',
  'Education',
  'Amar Campus',
  'Opinion',
];

const CATEGORY_LABELS = {
  Features: { bn: 'ফিচার', en: 'Features' },
  Culture: { bn: 'সংস্কৃতি', en: 'Culture' },
  Education: { bn: 'শিক্ষা', en: 'Education' },
  'Amar Campus': { bn: 'আমার ক্যাম্পাস', en: 'Amar Campus' },
  Opinion: { bn: 'অপিনিয়ন', en: 'Opinion' },
};

const emptyForm = {
  titleBn: '',
  titleEn: '',
  subtitleBn: '',
  subtitleEn: '',
  descBn: '',
  descEn: '',
  image: '',
  secondaryImage: '',
  imageCaption: '',
  reporterName: '',
  catBn: 'শিক্ষা',
  catEn: 'Education',
  categories: [],
};

export default function AdminDashboard() {
  const [news, setNews] = useState(emptyForm);
  const [allNews, setAllNews] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [activeTab, setActiveTab] = useState('news'); // 'news' | 'stream'

  // Stream Settings tab state
  const [streamForm, setStreamForm] = useState({
    primaryM3u8: '',
    backupM3u8: '',
  });
  const [streamSaving, setStreamSaving] = useState(false);
  const [streamMsg, setStreamMsg] = useState(null); // { type: 'success'|'error', text }
  const [testResult, setTestResult] = useState({ primary: null, backup: null });
  const [testing, setTesting] = useState({ primary: false, backup: false });
  const [validationError, setValidationError] = useState(null);

  // Change-password form state
  const [pwForm, setPwForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [pwMsg, setPwMsg] = useState(null); // { type: 'success'|'error', text }
  const [pwSubmitting, setPwSubmitting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) navigate('/admin');
    fetchNews();
  }, [navigate]);

  const fetchStreamSettings = useCallback(async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_BASE}/api/admin/stream-settings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStreamForm({
          primaryM3u8: data.primaryM3u8 || '',
          backupM3u8: data.backupM3u8 || '',
        });
      }
    } catch (err) {
      console.error('Failed to load stream settings:', err);
    }
  }, []);

  const fetchNews = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/news`);
      const data = await res.json();
      setAllNews(data);
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  const handleSaveStreamSettings = async (e) => {
    e.preventDefault();
    setStreamSaving(true);
    setStreamMsg(null);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_BASE}/api/admin/stream-settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          primaryM3u8: streamForm.primaryM3u8.trim(),
          backupM3u8: streamForm.backupM3u8.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setStreamMsg({
          type: 'success',
          text: 'Stream settings saved successfully!',
        });
        setStreamForm({
          primaryM3u8: data.primaryM3u8 || '',
          backupM3u8: data.backupM3u8 || '',
        });
        setTestResult({ primary: null, backup: null });
      } else {
        setStreamMsg({
          type: 'error',
          text: data.error || 'Failed to save settings.',
        });
      }
    } catch {
      setStreamMsg({
        type: 'error',
        text: 'Network error — could not reach the server.',
      });
    } finally {
      setStreamSaving(false);
    }
  };

  const handleTestUrl = async (field) => {
    const url =
      field === 'primary' ? streamForm.primaryM3u8 : streamForm.backupM3u8;
    if (!url.trim()) return;
    setTesting((t) => ({ ...t, [field]: true }));
    setTestResult((r) => ({ ...r, [field]: null }));
    try {
      // Use no-cors so the fetch doesn't throw on CORS-blocked responses
      const controller = new AbortController();
      const tid = setTimeout(() => controller.abort(), 10000);
      const res = await fetch(url.trim(), {
        method: 'HEAD',
        signal: controller.signal,
        mode: 'no-cors',
      });
      clearTimeout(tid);
      // no-cors always gives opaque response (status 0) even on success
      setTestResult((r) => ({
        ...r,
        [field]: {
          ok: true,
          note:
            res.status === 0
              ? 'Request sent (opaque response — likely reachable)'
              : `HTTP ${res.status}`,
        },
      }));
    } catch (err) {
      const msg =
        err.name === 'AbortError'
          ? 'Timed out (10 s)'
          : err.message || 'Unreachable';
      setTestResult((r) => ({ ...r, [field]: { ok: false, note: msg } }));
    } finally {
      setTesting((t) => ({ ...t, [field]: false }));
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'stream') fetchStreamSettings();
    if (tab !== 'security') {
      setPwMsg(null);
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setNews(emptyForm);
    setValidationError(null);
  };

  const isRichEmpty = (html) => {
    if (!html) return true;
    return html.replace(/<[^>]*>/g, '').trim() === '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError(null);

    const titleBn = news.titleBn.trim();
    const titleEn = news.titleEn.trim();
    const hasBnTitle = titleBn !== '';
    const hasEnTitle = titleEn !== '';
    const hasBnBody = !isRichEmpty(news.descBn);
    const hasEnBody = !isRichEmpty(news.descEn);

    if (!hasBnTitle && !hasEnTitle) {
      setValidationError(
        'অন্তত একটি ভাষায় শিরোনাম লিখুন। / Enter a title in at least one language.'
      );
      return;
    }
    if (hasBnTitle && !hasBnBody) {
      setValidationError('বাংলা শিরোনাম আছে কিন্তু বাংলা বিবরণ নেই।');
      return;
    }
    if (!hasBnTitle && hasBnBody) {
      setValidationError('বাংলা বিবরণ আছে কিন্তু বাংলা শিরোনাম নেই।');
      return;
    }
    if (hasEnTitle && !hasEnBody) {
      setValidationError(
        'English title given but English article body is missing.'
      );
      return;
    }
    if (!hasEnTitle && hasEnBody) {
      setValidationError(
        'English article body given but English title is missing.'
      );
      return;
    }

    const payload = {
      title: { bn: titleBn, en: titleEn },
      subtitle: { bn: news.subtitleBn || '', en: news.subtitleEn || '' },
      description: { bn: news.descBn || '', en: news.descEn || '' },
      image: news.image,
      secondaryImage: news.secondaryImage || '',
      imageCaption: news.imageCaption || '',
      reporterName: news.reporterName || '',
      category: { bn: news.catBn || 'সাধারণ', en: news.catEn || 'General' },
      categories: news.categories || [],
    };

    const url = editingId
      ? `${API_BASE}/api/news/${editingId}`
      : `${API_BASE}/api/news`;

    try {
      const res = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert('সফলভাবে পাবলিশ হয়েছে!');
        cancelEdit();
        fetchNews();
      } else {
        const errData = await res.json();
        alert('Error: ' + (errData.error || 'পাবলিশ করতে সমস্যা হয়েছে'));
      }
    } catch (err) {
      alert('সার্ভার কানেকশনে সমস্যা!');
    }
  };

  return (
    <div className="max-w-7xl mx-auto my-10 px-4 space-y-8 font-sans text-foreground">
      <div className="flex justify-between items-center bg-card p-6 shadow-sm rounded-2xl border border-border">
        <h1 className="text-2xl font-black text-foreground uppercase italic tracking-tighter">
          Campus TV Admin
        </h1>
        <button
          onClick={() => {
            localStorage.removeItem('adminToken');
            navigate('/admin');
          }}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2 rounded-full font-bold hover:bg-brandRed transition-all"
        >
          <LogOut size={18} /> Logout
        </button>
      </div>

      <div className="flex gap-4 border-b border-border pb-2 overflow-x-auto">
        <button
          onClick={() => handleTabChange('news')}
          className={`flex items-center gap-2 px-6 py-3 rounded-t-xl font-bold transition-all ${
            activeTab === 'news'
              ? 'bg-brandRed text-white shadow-lg'
              : 'bg-muted text-muted-foreground hover:bg-card'
          }`}
        >
          <FileText size={18} /> News Post
        </button>
        <button
          onClick={() => handleTabChange('stream')}
          className={`flex items-center gap-2 px-6 py-3 rounded-t-xl font-bold transition-all ${
            activeTab === 'stream'
              ? 'bg-brandRed text-white shadow-lg'
              : 'bg-muted text-muted-foreground hover:bg-card'
          }`}
        >
          <Radio size={18} /> Stream Control
        </button>
        <button
          onClick={() => handleTabChange('security')}
          className={`flex items-center gap-2 px-6 py-3 rounded-t-xl font-bold transition-all ${
            activeTab === 'security'
              ? 'bg-brandRed text-white shadow-lg'
              : 'bg-muted text-muted-foreground hover:bg-card'
          }`}
        >
          <KeyRound size={18} /> Security
        </button>
      </div>

      {activeTab === 'news' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-card shadow-xl rounded-2xl border border-border overflow-hidden">
              <div
                className={`p-4 text-white flex items-center justify-between font-bold uppercase italic bg-brandBlack`}
              >
                <div className="flex items-center gap-2">
                  {editingId ? <Edit3 size={20} /> : <Send size={20} />}
                  <span>{editingId ? 'Edit Mode' : 'New News'}</span>
                </div>
                {editingId && (
                  <button onClick={cancelEdit}>
                    <XCircle size={20} />
                  </button>
                )}
              </div>

              <form
                onSubmit={(e) => handleSubmit(e)}
                className="p-8 space-y-6"
              >
                <p className="text-xs text-muted-foreground bg-muted rounded-lg px-4 py-2 border border-border">
                  বাংলায়, ইংরেজিতে, অথবা উভয় ভাষায় পাবলিশ করতে
                  পারবেন।&nbsp;/&nbsp;You can publish in Bengali, English, or
                  both.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input
                    type="text"
                    placeholder="শিরোনাম (বাংলা)"
                    className="w-full border-b-2 border-border bg-transparent text-foreground placeholder:text-muted-foreground p-3 outline-none focus:border-brandRed font-bold text-lg"
                    value={news.titleBn}
                    onChange={(e) =>
                      setNews({ ...news, titleBn: e.target.value })
                    }
                  />
                  <input
                    type="text"
                    placeholder="Headline (English) — optional"
                    className="w-full border-b-2 border-border bg-transparent text-foreground placeholder:text-muted-foreground p-3 outline-none focus:border-brandRed font-bold text-lg"
                    value={news.titleEn}
                    onChange={(e) =>
                      setNews({ ...news, titleEn: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input
                    type="text"
                    placeholder="সাবটাইটেল (বাংলা)"
                    className="w-full border-b-2 border-border bg-transparent text-foreground placeholder:text-muted-foreground p-3 outline-none focus:border-brandRed"
                    value={news.subtitleBn}
                    onChange={(e) =>
                      setNews({ ...news, subtitleBn: e.target.value })
                    }
                  />
                  <input
                    type="text"
                    placeholder="Subtitle (English)"
                    className="w-full border-b-2 border-border bg-transparent text-foreground placeholder:text-muted-foreground p-3 outline-none focus:border-brandRed"
                    value={news.subtitleEn}
                    onChange={(e) =>
                      setNews({ ...news, subtitleEn: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Image URL (Thumbnail)"
                    className="w-full border-2 border-border bg-background text-foreground placeholder:text-muted-foreground p-3 rounded-lg outline-none focus:border-brandRed"
                    value={news.image}
                    onChange={(e) =>
                      setNews({ ...news, image: e.target.value })
                    }
                    required
                  />
                  <input
                    type="text"
                    placeholder="Image Caption"
                    className="w-full border-2 border-border bg-background text-foreground placeholder:text-muted-foreground p-3 rounded-lg outline-none focus:border-brandRed"
                    value={news.imageCaption}
                    onChange={(e) =>
                      setNews({ ...news, imageCaption: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <input
                    type="text"
                    placeholder="Secondary Image URL (Optional - displayed in article body)"
                    className="w-full border-2 border-border bg-background text-foreground placeholder:text-muted-foreground p-3 rounded-lg outline-none focus:border-brandRed"
                    value={news.secondaryImage}
                    onChange={(e) =>
                      setNews({ ...news, secondaryImage: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <input
                    type="text"
                    placeholder="প্রতিবেদকের নাম / Reporter Name"
                    className="w-full border-2 border-border bg-background text-foreground placeholder:text-muted-foreground p-3 rounded-lg outline-none focus:border-brandRed"
                    value={news.reporterName}
                    onChange={(e) =>
                      setNews({ ...news, reporterName: e.target.value })
                    }
                  />
                </div>

                {/* Primary Category Selector */}
                <div className="border-2 border-border rounded-xl p-4 space-y-3">
                  <p className="text-sm font-bold text-foreground">
                    Primary Category (প্রধান বিভাগ)
                  </p>
                  <select
                    className="w-full border-2 border-border bg-background text-foreground p-3 rounded-lg outline-none focus:border-brandRed font-semibold"
                    value={news.catEn || 'Education'}
                    onChange={(e) => {
                      const selectedCat = e.target.value;
                      const bnLabel = CATEGORY_LABELS[selectedCat]?.bn || '';
                      setNews({
                        ...news,
                        catEn: selectedCat,
                        catBn: bnLabel,
                      });
                    }}
                  >
                    {CATEGORIES.map((cat) => (
                      <option
                        key={cat}
                        value={cat}
                      >
                        {CATEGORY_LABELS[cat]?.bn || cat} / {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Categories multi-select */}
                <div className="border-2 border-border rounded-xl p-4 space-y-2">
                  <p className="text-sm font-bold text-foreground mb-3">
                    Tags (ট্যাগ) - Select multiple categories
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {CATEGORIES.map((cat) => {
                      const checked = (news.categories || []).includes(cat);
                      const label = CATEGORY_LABELS[cat]?.bn || cat;
                      return (
                        <label
                          key={cat}
                          className={`flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-full border-2 text-sm font-bold transition-all select-none ${
                            checked
                              ? 'bg-brandRed text-white border-brandRed'
                              : 'bg-background text-foreground border-border hover:border-brandRed'
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={checked}
                            onChange={() => {
                              const current = news.categories || [];
                              setNews({
                                ...news,
                                categories: checked
                                  ? current.filter((c) => c !== cat)
                                  : [...current, cat],
                              });
                            }}
                          />
                          {label}
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-bold uppercase text-muted-foreground mb-2">
                      বিস্তারিত বর্ণনা (বাংলা)
                    </p>
                    <RichEditor
                      key={`bn-${editingId || 'new'}`}
                      initialValue={news.descBn}
                      onChange={(val) =>
                        setNews((prev) => ({ ...prev, descBn: val }))
                      }
                      placeholder="বিস্তারিত বর্ণনা লিখুন..."
                    />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase text-muted-foreground mb-2">
                      Article Body (English)
                    </p>
                    <RichEditor
                      key={`en-${editingId || 'new'}`}
                      initialValue={news.descEn}
                      onChange={(val) =>
                        setNews((prev) => ({ ...prev, descEn: val }))
                      }
                      placeholder="Write article body in English..."
                    />
                  </div>
                </div>

                {validationError && (
                  <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 text-red-500 rounded-xl px-4 py-3 text-sm font-semibold">
                    <AlertCircle
                      size={16}
                      className="mt-0.5 shrink-0"
                    />
                    {validationError}
                  </div>
                )}
                <button
                  type="submit"
                  className={`w-full p-4 font-black rounded-xl text-white transition-all uppercase shadow-xl flex items-center justify-center gap-2 bg-brandBlack hover:bg-brandRed`}
                >
                  {editingId ? 'Update Post' : 'Publish News'}
                </button>
              </form>
            </div>
          </div>

          <div className="bg-card rounded-2xl shadow-lg border border-border overflow-hidden h-200 flex flex-col">
            <div className="bg-muted p-4 border-b border-border font-black text-xs uppercase text-muted-foreground">
              Manage Content
            </div>
            <div className="overflow-y-auto p-4 space-y-4 flex-1">
              {allNews.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center gap-3 border-b border-border pb-3 group hover:bg-muted p-2 rounded-lg transition-all"
                >
                  <img
                    src={item.image || 'https://via.placeholder.com/150'}
                    className="w-14 h-14 object-cover rounded-lg shadow-sm bg-muted"
                    alt=""
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/150';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-black truncate uppercase text-foreground leading-none mb-1">
                      {item.title?.bn || 'No Title'}
                    </p>
                    <div className="flex gap-2">
                      {
                        <span className="text-[8px] bg-muted text-muted-foreground px-1 rounded font-bold uppercase">
                          News
                        </span>
                      }
                      <span className="text-[8px] text-gray-400 font-bold uppercase">
                        {item.category?.bn}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button
                      onClick={() => {
                        setEditingId(item._id);
                        setNews({
                          titleBn: item.title.bn,
                          titleEn: item.title.en,
                          subtitleBn: item.subtitle?.bn || '',
                          subtitleEn: item.subtitle?.en || '',
                          descBn: item.description.bn,
                          descEn: item.description.en,
                          image: item.image,
                          secondaryImage: item.secondaryImage || '',
                          imageCaption: item.imageCaption || '',
                          reporterName: item.reporterName || '',
                          catEn: item.category?.en,
                          catBn: item.category?.bn,
                          categories: item.categories || [],
                        });
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="text-blue-500 p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full border border-blue-100"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={async () => {
                        if (window.confirm('আপনি কি এটি ডিলিট করতে চান?')) {
                          await fetch(`${API_BASE}/api/news/${item._id}`, {
                            method: 'DELETE',
                          });
                          fetchNews();
                        }
                      }}
                      className="text-brandRed p-1.5 hover:bg-red-50 rounded-full border border-red-100"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'stream' && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-card shadow-xl rounded-2xl border border-border overflow-hidden">
            <div className="p-4 text-white flex items-center gap-2 font-bold uppercase italic bg-brandBlack">
              <Radio size={20} />
              <span>Stream Control</span>
            </div>

            <form
              onSubmit={handleSaveStreamSettings}
              className="p-8 space-y-6"
            >
              {/* Primary M3U8 */}
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase text-foreground tracking-wide">
                  Primary M3U8 URL <span className="text-brandRed">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://example.com/stream.m3u8"
                    className="flex-1 border-2 border-border bg-background text-foreground placeholder:text-muted-foreground p-3 rounded-lg outline-none focus:border-brandRed font-mono text-sm"
                    value={streamForm.primaryM3u8}
                    onChange={(e) => {
                      setStreamForm((f) => ({
                        ...f,
                        primaryM3u8: e.target.value,
                      }));
                      setTestResult((r) => ({ ...r, primary: null }));
                    }}
                    required
                  />
                  <button
                    type="button"
                    disabled={!streamForm.primaryM3u8.trim() || testing.primary}
                    onClick={() => handleTestUrl('primary')}
                    className="px-4 py-2 rounded-lg bg-muted text-muted-foreground hover:bg-card border border-border font-bold text-xs uppercase transition-all disabled:opacity-40 flex items-center gap-1.5 whitespace-nowrap"
                  >
                    {testing.primary ? <Loader size="sm" /> : null}
                    Test
                  </button>
                </div>
                {testResult.primary && (
                  <p
                    className={`text-xs flex items-center gap-1.5 font-semibold ${testResult.primary.ok ? 'text-green-500' : 'text-red-400'}`}
                  >
                    {testResult.primary.ok ? (
                      <CheckCircle2 size={13} />
                    ) : (
                      <AlertCircle size={13} />
                    )}
                    {testResult.primary.note}
                  </p>
                )}
              </div>

              {/* Backup M3U8 */}
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase text-foreground tracking-wide">
                  Backup M3U8 URL{' '}
                  <span className="text-muted-foreground text-xs normal-case">
                    (optional)
                  </span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://example.com/backup.m3u8"
                    className="flex-1 border-2 border-border bg-background text-foreground placeholder:text-muted-foreground p-3 rounded-lg outline-none focus:border-brandRed font-mono text-sm"
                    value={streamForm.backupM3u8}
                    onChange={(e) => {
                      setStreamForm((f) => ({
                        ...f,
                        backupM3u8: e.target.value,
                      }));
                      setTestResult((r) => ({ ...r, backup: null }));
                    }}
                  />
                  <button
                    type="button"
                    disabled={!streamForm.backupM3u8.trim() || testing.backup}
                    onClick={() => handleTestUrl('backup')}
                    className="px-4 py-2 rounded-lg bg-muted text-muted-foreground hover:bg-card border border-border font-bold text-xs uppercase transition-all disabled:opacity-40 flex items-center gap-1.5 whitespace-nowrap"
                  >
                    {testing.backup ? <Loader size="sm" /> : null}
                    Test
                  </button>
                </div>
                {testResult.backup && (
                  <p
                    className={`text-xs flex items-center gap-1.5 font-semibold ${testResult.backup.ok ? 'text-green-500' : 'text-red-400'}`}
                  >
                    {testResult.backup.ok ? (
                      <CheckCircle2 size={13} />
                    ) : (
                      <AlertCircle size={13} />
                    )}
                    {testResult.backup.note}
                  </p>
                )}
              </div>

              {/* Playback priority note */}
              <div className="rounded-lg bg-muted border border-border p-4 text-xs text-muted-foreground space-y-1">
                <p className="font-black uppercase text-foreground text-[11px] mb-2">
                  Playback Priority
                </p>
                <p>1 · Primary M3U8 — attempted first</p>
                <p>
                  2 · Backup M3U8 — used if primary fails (requires backup URL)
                </p>
                <p>3 · Video Archive — shown if both streams fail</p>
              </div>

              {/* Status message */}
              {streamMsg && (
                <div
                  className={`flex items-center gap-2 p-3 rounded-lg text-sm font-semibold ${
                    streamMsg.type === 'success'
                      ? 'bg-green-500/10 text-green-500 border border-green-500/30'
                      : 'bg-red-500/10 text-red-400 border border-red-500/30'
                  }`}
                >
                  {streamMsg.type === 'success' ? (
                    <CheckCircle2 size={16} />
                  ) : (
                    <AlertCircle size={16} />
                  )}
                  {streamMsg.text}
                </div>
              )}

              <button
                type="submit"
                disabled={streamSaving}
                className="w-full p-4 font-black rounded-xl text-white transition-all uppercase shadow-xl flex items-center justify-center gap-2 bg-brandBlack hover:bg-brandRed disabled:opacity-60"
              >
                {streamSaving ? <Loader size="sm" /> : <Radio size={18} />}
                Save Stream Settings
              </button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="max-w-lg mx-auto">
          <div className="bg-card shadow-xl rounded-2xl border border-border overflow-hidden">
            <div className="p-4 text-white flex items-center gap-2 font-bold uppercase italic bg-brandBlack">
              <KeyRound size={20} />
              <span>Change Password</span>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setPwMsg(null);

                const { currentPassword, newPassword, confirmPassword } =
                  pwForm;

                if (!currentPassword || !newPassword || !confirmPassword) {
                  setPwMsg({
                    type: 'error',
                    text: 'All three fields are required.',
                  });
                  return;
                }
                if (newPassword.length < 8) {
                  setPwMsg({
                    type: 'error',
                    text: 'New password must be at least 8 characters.',
                  });
                  return;
                }
                if (newPassword !== confirmPassword) {
                  setPwMsg({
                    type: 'error',
                    text: 'New password and confirm password do not match.',
                  });
                  return;
                }
                if (newPassword === currentPassword) {
                  setPwMsg({
                    type: 'error',
                    text: 'New password must differ from the current password.',
                  });
                  return;
                }

                setPwSubmitting(true);
                try {
                  const token = localStorage.getItem('adminToken');
                  let res;
                  try {
                    res = await fetch(`${API_BASE}/api/admin/change-password`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                      },
                      body: JSON.stringify({ currentPassword, newPassword }),
                    });
                  } catch {
                    setPwMsg({
                      type: 'error',
                      text: 'Network error — could not reach the server.',
                    });
                    return;
                  }

                  let data = {};
                  try {
                    data = await res.json();
                  } catch {
                    // non-JSON body (e.g. HTML error page)
                  }

                  if (res.ok) {
                    setPwMsg({
                      type: 'success',
                      text: 'Password updated successfully!',
                    });
                    setPwForm({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: '',
                    });
                  } else {
                    setPwMsg({
                      type: 'error',
                      text:
                        data.error || `Request failed (HTTP ${res.status}).`,
                    });
                  }
                } finally {
                  setPwSubmitting(false);
                }
              }}
              className="p-8 space-y-6"
            >
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase text-foreground tracking-wide">
                  Current Password
                </label>
                <input
                  type="password"
                  autoComplete="current-password"
                  placeholder="Enter current password"
                  className="w-full border-2 border-border bg-background text-foreground placeholder:text-muted-foreground p-3 rounded-lg outline-none focus:border-brandRed"
                  value={pwForm.currentPassword}
                  onChange={(e) =>
                    setPwForm((f) => ({
                      ...f,
                      currentPassword: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold uppercase text-foreground tracking-wide">
                  New Password
                  <span className="ml-2 text-xs font-normal normal-case text-muted-foreground">
                    (min 8 characters)
                  </span>
                </label>
                <input
                  type="password"
                  autoComplete="new-password"
                  placeholder="Enter new password"
                  className="w-full border-2 border-border bg-background text-foreground placeholder:text-muted-foreground p-3 rounded-lg outline-none focus:border-brandRed"
                  value={pwForm.newPassword}
                  onChange={(e) =>
                    setPwForm((f) => ({ ...f, newPassword: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold uppercase text-foreground tracking-wide">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  autoComplete="new-password"
                  placeholder="Repeat new password"
                  className="w-full border-2 border-border bg-background text-foreground placeholder:text-muted-foreground p-3 rounded-lg outline-none focus:border-brandRed"
                  value={pwForm.confirmPassword}
                  onChange={(e) =>
                    setPwForm((f) => ({
                      ...f,
                      confirmPassword: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              {pwMsg && (
                <div
                  className={`flex items-center gap-2 p-3 rounded-lg text-sm font-semibold ${
                    pwMsg.type === 'success'
                      ? 'bg-green-500/10 text-green-500 border border-green-500/30'
                      : 'bg-red-500/10 text-red-400 border border-red-500/30'
                  }`}
                >
                  {pwMsg.type === 'success' ? (
                    <CheckCircle2 size={16} />
                  ) : (
                    <AlertCircle size={16} />
                  )}
                  {pwMsg.text}
                </div>
              )}

              <button
                type="submit"
                disabled={pwSubmitting}
                className="w-full p-4 font-black rounded-xl text-white transition-all uppercase shadow-xl flex items-center justify-center gap-2 bg-brandBlack hover:bg-brandRed disabled:opacity-60"
              >
                {pwSubmitting ? <Loader size="sm" /> : <KeyRound size={18} />}
                Update Password
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
