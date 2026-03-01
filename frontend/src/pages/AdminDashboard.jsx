import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LogOut,
  Send,
  Trash2,
  Edit3,
  XCircle,
  FileText,
  Users,
} from 'lucide-react';
import { API_BASE } from '../config/api';

const emptyForm = {
  titleBn: '',
  titleEn: '',
  subtitleBn: '',
  subtitleEn: '',
  descBn: '',
  descEn: '',
  image: '',
  imageCaption: '',
  reporterName: '',
  catBn: 'শিক্ষা',
  catEn: 'Education',
};

const emptyEmployee = {
  name: '',
  designation: '',
  bioBn: '',
  bioEn: '',
  imageURL: '',
};

export default function AdminDashboard() {
  const [news, setNews] = useState(emptyForm);
  const [allNews, setAllNews] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [activeTab, setActiveTab] = useState('news'); // 'news' or 'employees'
  const [employee, setEmployee] = useState(emptyEmployee);
  const [allEmployees, setAllEmployees] = useState([]);
  const [editingEmployeeId, setEditingEmployeeId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) navigate('/admin');
    fetchNews();
    fetchEmployees();
  }, [navigate]);

  const fetchNews = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/news`);
      const data = await res.json();
      setAllNews(data);
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/employees`);
      const data = await res.json();
      setAllEmployees(data);
    } catch (err) {
      console.error('Fetch employees error:', err);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setNews(emptyForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      title: { bn: news.titleBn, en: news.titleEn },
      subtitle: { bn: news.subtitleBn || '', en: news.subtitleEn || '' },
      description: { bn: news.descBn, en: news.descEn || news.descBn },
      image: news.image,
      imageCaption: news.imageCaption || '',
      reporterName: news.reporterName || '',
      category: { bn: news.catBn || 'সাধারণ', en: news.catEn || 'General' },
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

  const handleEmployeeSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name: employee.name,
      designation: employee.designation,
      bio: {
        bn: employee.bioBn,
        en: employee.bioEn,
      },
      imageURL: employee.imageURL || '',
    };

    const url = editingEmployeeId
      ? `${API_BASE}/api/employees/${editingEmployeeId}`
      : `${API_BASE}/api/employees`;

    try {
      const res = await fetch(url, {
        method: editingEmployeeId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert(
          editingEmployeeId
            ? 'কর্মচারী সফলভাবে আপডেট করা হয়েছে!'
            : 'কর্মচারী সফলভাবে যোগ করা হয়েছে!'
        );
        cancelEmployeeEdit();
        fetchEmployees();
      } else {
        const errData = await res.json();
        alert('Error: ' + (errData.error || 'কর্মচারী যোগ করতে সমস্যা হয়েছে'));
      }
    } catch (err) {
      alert('সার্ভার কানেকশনে সমস্যা!');
    }
  };

  const cancelEmployeeEdit = () => {
    setEditingEmployeeId(null);
    setEmployee(emptyEmployee);
  };

  const handleDeleteEmployee = async (id) => {
    if (!window.confirm('আপনি কি এই কর্মচারীকে ডিলিট করতে চান?')) return;

    try {
      await fetch(`${API_BASE}/api/employees/${id}`, {
        method: 'DELETE',
      });
      fetchEmployees();
    } catch (err) {
      alert('ডিলিট করতে সমস্যা হয়েছে!');
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
          onClick={() => setActiveTab('news')}
          className={`flex items-center gap-2 px-6 py-3 rounded-t-xl font-bold transition-all ${
            activeTab === 'news'
              ? 'bg-brandRed text-white shadow-lg'
              : 'bg-muted text-muted-foreground hover:bg-card'
          }`}
        >
          <FileText size={18} /> News Post
        </button>
        <button
          onClick={() => setActiveTab('employees')}
          className={`flex items-center gap-2 px-6 py-3 rounded-t-xl font-bold transition-all ${
            activeTab === 'employees'
              ? 'bg-brandRed text-white shadow-lg'
              : 'bg-muted text-muted-foreground hover:bg-card'
          }`}
        >
          <Users size={18} /> Manage Employees
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input
                    type="text"
                    placeholder="শিরোনাম (বাংলা)"
                    className="w-full border-b-2 border-border bg-transparent text-foreground placeholder:text-muted-foreground p-3 outline-none focus:border-brandRed font-bold text-lg"
                    value={news.titleBn}
                    onChange={(e) =>
                      setNews({ ...news, titleBn: e.target.value })
                    }
                    required
                  />
                  <input
                    type="text"
                    placeholder="Headline (English)"
                    className="w-full border-b-2 border-border bg-transparent text-foreground placeholder:text-muted-foreground p-3 outline-none focus:border-brandRed font-bold text-lg"
                    value={news.titleEn}
                    onChange={(e) =>
                      setNews({ ...news, titleEn: e.target.value })
                    }
                    required
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="প্রতিবেদকের নাম / Reporter Name"
                    className="w-full border-2 border-border bg-background text-foreground placeholder:text-muted-foreground p-3 rounded-lg outline-none focus:border-brandRed"
                    value={news.reporterName}
                    onChange={(e) =>
                      setNews({ ...news, reporterName: e.target.value })
                    }
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="ক্যাটাগরি"
                      className="w-1/2 border-2 border-border bg-background text-foreground placeholder:text-muted-foreground p-3 rounded-lg outline-none focus:border-brandRed"
                      value={news.catBn}
                      onChange={(e) =>
                        setNews({ ...news, catBn: e.target.value })
                      }
                      required
                    />
                    <input
                      type="text"
                      placeholder="Category (EN)"
                      className="w-1/2 border-2 border-border bg-background text-foreground placeholder:text-muted-foreground p-3 rounded-lg outline-none focus:border-brandRed"
                      value={news.catEn}
                      onChange={(e) =>
                        setNews({ ...news, catEn: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <textarea
                    placeholder="বিস্তারিত বর্ণনা (বাংলা)..."
                    className="w-full border-2 border-border bg-background text-foreground placeholder:text-muted-foreground p-4 rounded-xl h-32 outline-none focus:border-brandRed"
                    value={news.descBn}
                    onChange={(e) =>
                      setNews({ ...news, descBn: e.target.value })
                    }
                    required
                  />
                  <textarea
                    placeholder="Description (English)..."
                    className="w-full border-2 border-border bg-background text-foreground placeholder:text-muted-foreground p-4 rounded-xl h-32 outline-none focus:border-brandRed"
                    value={news.descEn}
                    onChange={(e) =>
                      setNews({ ...news, descEn: e.target.value })
                    }
                  />
                </div>

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
                          imageCaption: item.imageCaption || '',
                          reporterName: item.reporterName || '',
                          catEn: item.category?.en,
                          catBn: item.category?.bn,
                        });
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="text-blue-500 p-1.5 hover:bg-blue-50 rounded-full border border-blue-100"
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

      {activeTab === 'employees' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-card shadow-xl rounded-2xl border border-border overflow-hidden">
              <div className="p-4 text-white flex items-center justify-between font-bold uppercase italic bg-brandBlack">
                <div className="flex items-center gap-2">
                  {editingEmployeeId ? (
                    <Edit3 size={20} />
                  ) : (
                    <Users size={20} />
                  )}
                  <span>
                    {editingEmployeeId ? 'Edit Employee' : 'Add New Employee'}
                  </span>
                </div>
                {editingEmployeeId && (
                  <button onClick={cancelEmployeeEdit}>
                    <XCircle size={20} />
                  </button>
                )}
              </div>

              <form
                onSubmit={handleEmployeeSubmit}
                className="p-8 space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input
                    type="text"
                    placeholder="Employee Name"
                    className="w-full border-b-2 border-border bg-transparent text-foreground placeholder:text-muted-foreground p-3 outline-none focus:border-brandRed font-bold text-lg"
                    value={employee.name}
                    onChange={(e) =>
                      setEmployee({ ...employee, name: e.target.value })
                    }
                    required
                  />
                  <input
                    type="text"
                    placeholder="Designation / পদবী"
                    className="w-full border-b-2 border-border bg-transparent text-foreground placeholder:text-muted-foreground p-3 outline-none focus:border-brandRed font-bold text-lg"
                    value={employee.designation}
                    onChange={(e) =>
                      setEmployee({ ...employee, designation: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Image URL"
                    className="w-full border-2 border-border bg-background text-foreground placeholder:text-muted-foreground p-3 rounded-lg outline-none focus:border-brandRed"
                    value={employee.imageURL}
                    onChange={(e) =>
                      setEmployee({ ...employee, imageURL: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-4">
                  <textarea
                    placeholder="Bio (Bangla) / জীবনী..."
                    className="w-full border-2 border-border bg-background text-foreground placeholder:text-muted-foreground p-4 rounded-xl h-32 outline-none focus:border-brandRed"
                    value={employee.bioBn}
                    onChange={(e) =>
                      setEmployee({ ...employee, bioBn: e.target.value })
                    }
                    required
                  />
                  <textarea
                    placeholder="Bio (English)..."
                    className="w-full border-2 border-border bg-background text-foreground placeholder:text-muted-foreground p-4 rounded-xl h-32 outline-none focus:border-brandRed"
                    value={employee.bioEn}
                    onChange={(e) =>
                      setEmployee({ ...employee, bioEn: e.target.value })
                    }
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full p-4 font-black rounded-xl text-white transition-all uppercase shadow-xl flex items-center justify-center gap-2 bg-brandBlack hover:bg-brandRed"
                >
                  {editingEmployeeId ? 'Update Employee' : 'Add Employee'}
                </button>
              </form>
            </div>
          </div>

          <div className="bg-card rounded-2xl shadow-lg border border-border overflow-hidden h-200 flex flex-col">
            <div className="bg-muted p-4 border-b border-border font-black text-xs uppercase text-muted-foreground">
              All Employees ({allEmployees.length})
            </div>
            <div className="overflow-y-auto p-4 space-y-4 flex-1">
              {allEmployees.map((emp) => (
                <div
                  key={emp._id}
                  className="flex items-center gap-3 border-b border-border pb-3 group hover:bg-muted p-2 rounded-lg transition-all"
                >
                  <img
                    src={emp.imageURL || 'https://via.placeholder.com/150'}
                    className="w-14 h-14 object-cover rounded-full shadow-sm bg-muted"
                    alt={emp.name}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/150';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-black truncate uppercase text-foreground leading-none mb-1">
                      {emp.name}
                    </p>
                    <p className="text-[9px] text-gray-400 font-bold">
                      {emp.designation}
                    </p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button
                      onClick={() => {
                        setEditingEmployeeId(emp._id);
                        setEmployee({
                          name: emp.name,
                          designation: emp.designation,
                          bioBn: emp.bio.bn,
                          bioEn: emp.bio.en,
                          imageURL: emp.imageURL || '',
                        });
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="text-blue-500 p-1.5 hover:bg-blue-50 rounded-full border border-blue-100"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteEmployee(emp._id)}
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
    </div>
  );
}
