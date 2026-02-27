import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Send, Trash2, Video, Edit3, XCircle, PlayCircle, Radio, FileText } from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('news');
  const [news, setNews] = useState({
    titleBn: '', titleEn: '', descBn: '', descEn: '', image: '', catBn: 'শিক্ষা', catEn: 'Education',
    videoUrl: '', isLive: false
  });
  const [allNews, setAllNews] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) navigate('/login');
    fetchNews();
  }, [navigate]);

  const fetchNews = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/news');
      const data = await res.json();
      setAllNews(data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setNews({ titleBn: '', titleEn: '', descBn: '', descEn: '', image: '', catBn: 'শিক্ষা', catEn: 'Education', videoUrl: '', isLive: false });
  };

  const handleSubmit = async (e, type) => {
    e.preventDefault();

    // ভিডিও আইডি থেকে থাম্বনেইল জেনারেট - hqdefault সব ভিডিওর জন্য কাজ করে
    let finalImage = news.image;
    if (type !== 'news' && news.videoUrl) {
      finalImage = `https://img.youtube.com/vi/${news.videoUrl.trim()}/hqdefault.jpg`;
    }

    const payload = {
      title: { bn: news.titleBn, en: news.titleEn },
      description: { bn: news.descBn, en: news.descEn || news.descBn },
      image: finalImage,
      category: { bn: news.catBn || 'ভিডিও', en: news.catEn || 'Video' },
      videoUrl: type === 'news' ? '' : news.videoUrl.trim(),
      isLive: type === 'live'
    };

    const url = editingId ? `http://localhost:5001/api/news/${editingId}` : 'http://localhost:5001/api/news';

    try {
      const res = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert("সফলভাবে পাবলিশ হয়েছে!");
        cancelEdit();
        fetchNews();
      } else {
        const errData = await res.json();
        alert("Error: " + (errData.error || "পাবলিশ করতে সমস্যা হয়েছে"));
      }
    } catch (err) {
      alert("সার্ভার কানেকশনে সমস্যা!");
    }
  };

  return (
    <div className="max-w-7xl mx-auto my-10 px-4 space-y-8 font-sans text-foreground">
      {/* Header */}
      <div className="flex justify-between items-center bg-card p-6 shadow-sm rounded-2xl border border-border">
        <h1 className="text-2xl font-black text-foreground uppercase italic tracking-tighter">Campus TV Admin</h1>
        <button onClick={() => {localStorage.removeItem('adminToken'); navigate('/login');}} className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2 rounded-full font-bold hover:bg-brandRed transition-all">
          <LogOut size={18} /> Logout
        </button>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-4 border-b border-border pb-2 overflow-x-auto">
        {[
          { id: 'news', label: 'News Post', icon: <FileText size={18}/> },
          { id: 'video', label: 'Video Post', icon: <PlayCircle size={18}/> },
          { id: 'live', label: 'Live Post', icon: <Radio size={18}/> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {setActiveTab(tab.id); cancelEdit();}}
            className={`flex items-center gap-2 px-6 py-3 rounded-t-xl font-bold transition-all ${activeTab === tab.id ? 'bg-brandRed text-white shadow-lg' : 'bg-muted text-muted-foreground hover:bg-secondary'}`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-card shadow-xl rounded-2xl border border-border overflow-hidden">
            <div className={`p-4 text-white flex items-center justify-between font-bold uppercase italic ${activeTab === 'live' ? 'bg-red-600' : activeTab === 'video' ? 'bg-blue-600' : 'bg-brandBlack'}`}>
              <div className="flex items-center gap-2">
                {editingId ? <Edit3 size={20}/> : <Send size={20}/>}
                <span>{editingId ? 'Edit Mode' : `New ${activeTab}`}</span>
              </div>
              {editingId && <button onClick={cancelEdit}><XCircle size={20}/></button>}
            </div>

            <form onSubmit={(e) => handleSubmit(e, activeTab)} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input type="text" placeholder="শিরোনাম (বাংলা)" className="w-full border-b-2 border-border bg-transparent text-foreground placeholder:text-muted-foreground p-3 outline-none focus:border-brandRed font-bold text-lg" value={news.titleBn} onChange={(e)=>setNews({...news, titleBn: e.target.value})} required />
                <input type="text" placeholder="Headline (English)" className="w-full border-b-2 border-border bg-transparent text-foreground placeholder:text-muted-foreground p-3 outline-none focus:border-brandRed font-bold text-lg" value={news.titleEn} onChange={(e)=>setNews({...news, titleEn: e.target.value})} required />
              </div>

              {activeTab !== 'news' ? (
                  <div className="p-5 bg-muted rounded-xl border-2 border-dashed border-border space-y-4">
                  <p className="text-xs font-black text-muted-foreground mb-2 uppercase italic">YouTube Video ID Only</p>
                  <input type="text" placeholder="Example: dQw4w9WgXcQ" className="w-full p-3 rounded-lg border border-border focus:ring-2 focus:ring-brandRed outline-none bg-background text-foreground placeholder:text-muted-foreground font-mono" value={news.videoUrl} onChange={(e)=>setNews({...news, videoUrl: e.target.value})} required />
                  <p className="text-[10px] mt-1 text-brandRed font-bold uppercase">* Thumbnail will be fetched automatically from YouTube</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <input type="text" placeholder="Image URL (Thumbnail)" className="w-full border-2 border-border bg-background text-foreground placeholder:text-muted-foreground p-3 rounded-lg outline-none focus:border-brandRed" value={news.image} onChange={(e)=>setNews({...news, image: e.target.value})} required />
                   <div className="flex gap-2">
                      <input type="text" placeholder="ক্যাটাগরি" className="w-1/2 border-2 border-border bg-background text-foreground placeholder:text-muted-foreground p-3 rounded-lg outline-none focus:border-brandRed" value={news.catBn} onChange={(e)=>setNews({...news, catBn: e.target.value})} required />
                      <input type="text" placeholder="Category (EN)" className="w-1/2 border-2 border-border bg-background text-foreground placeholder:text-muted-foreground p-3 rounded-lg outline-none focus:border-brandRed" value={news.catEn} onChange={(e)=>setNews({...news, catEn: e.target.value})} required />
                   </div>
                </div>
              )}

              <div className="space-y-4">
                <textarea placeholder="বিস্তারিত বর্ণনা (বাংলা)..." className="w-full border-2 border-border bg-background text-foreground placeholder:text-muted-foreground p-4 rounded-xl h-32 outline-none focus:border-brandRed" value={news.descBn} onChange={(e)=>setNews({...news, descBn: e.target.value})} required />
                <textarea placeholder="Description (English)..." className="w-full border-2 border-border bg-background text-foreground placeholder:text-muted-foreground p-4 rounded-xl h-32 outline-none focus:border-brandRed" value={news.descEn} onChange={(e)=>setNews({...news, descEn: e.target.value})} />
              </div>

              <button type="submit" className={`w-full p-4 font-black rounded-xl text-white transition-all uppercase shadow-xl flex items-center justify-center gap-2 ${activeTab === 'live' ? 'bg-red-600' : activeTab === 'video' ? 'bg-blue-600' : 'bg-brandBlack hover:bg-brandRed'}`}>
                {editingId ? 'Update Post' : `Publish ${activeTab}`}
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <div className="bg-card rounded-2xl shadow-lg border border-border overflow-hidden h-[800px] flex flex-col">
          <div className="bg-muted p-4 border-b border-border font-black text-xs uppercase text-muted-foreground">Manage Content</div>
          <div className="overflow-y-auto p-4 space-y-4 flex-1">
            {allNews.map((item) => (
              <div key={item._id} className="flex items-center gap-3 border-b border-border pb-3 group hover:bg-muted p-2 rounded-lg transition-all">
                <img
                  src={item.image || 'https://via.placeholder.com/150'}
                  className="w-14 h-14 object-cover rounded-lg shadow-sm bg-muted"
                  alt=""
                  onError={(e) => {e.target.src = 'https://via.placeholder.com/150'}}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-black truncate uppercase text-foreground leading-none mb-1">{item.title?.bn || "No Title"}</p>
                  <div className="flex gap-2">
                    {item.isLive ? <span className="text-[8px] bg-red-100 text-red-600 px-1 rounded font-bold uppercase">Live</span> : item.videoUrl ? <span className="text-[8px] bg-blue-100 text-blue-600 px-1 rounded font-bold uppercase">Video</span> : <span className="text-[8px] bg-muted text-muted-foreground px-1 rounded font-bold uppercase">News</span>}
                    <span className="text-[8px] text-gray-400 font-bold uppercase">{item.category?.bn}</span>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={() => {
                    setActiveTab(item.isLive ? 'live' : item.videoUrl ? 'video' : 'news');
                    setEditingId(item._id);
                    setNews({
                      titleBn: item.title.bn, titleEn: item.title.en,
                      descBn: item.description.bn, descEn: item.description.en,
                      image: item.image, catEn: item.category?.en, catBn: item.category?.bn,
                      videoUrl: item.videoUrl, isLive: item.isLive
                    });
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }} className="text-blue-500 p-1.5 hover:bg-blue-50 rounded-full border border-blue-100"><Edit3 size={14}/></button>
                  <button onClick={async () => {if(window.confirm("আপনি কি এটি ডিলিট করতে চান?")){await fetch(`http://localhost:5001/api/news/${item._id}`, {method:'DELETE'}); fetchNews();}}} className="text-brandRed p-1.5 hover:bg-red-50 rounded-full border border-red-100"><Trash2 size={14}/></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}