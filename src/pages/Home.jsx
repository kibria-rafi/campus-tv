import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Ticker from '../components/Ticker';
import { translations } from '../data';

export default function Home({ lang }) {
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const t = translations[lang];

  useEffect(() => {
    // ব্যাকএন্ড থেকে খবর নিয়ে আসা
    fetch('http://localhost:5000/api/news')
      .then(res => res.json())
      .then(data => {
        setNewsList(data);
        setLoading(false);
      })
      .catch(err => console.error("Error fetching news:", err));
  }, []);

  if (loading) return <div className="text-center py-20 font-bold">লোড হচ্ছে...</div>;
  if (newsList.length === 0) return <div className="text-center py-20">এখনো কোনো খবর নেই।</div>;

  return (
    <div className="space-y-6">
      {/* টিচারে এখন আসল খবর স্ক্রল করবে */}
      <Ticker lang={lang} newsList={newsList} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4">
        {/* প্রধান খবর (সবার শেষের পোস্টটি আগে দেখাবে) */}
        <div className="lg:col-span-8">
          <Link to={`/news/${newsList[0]._id}`}>
            <div className="relative group overflow-hidden rounded-sm shadow-xl">
              <img src={newsList[0].image} className="w-full h-[500px] object-cover" alt="" />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black p-8 text-white">
                <span className="bg-brandRed px-3 py-1 text-sm font-bold uppercase mb-3 inline-block">
                  {newsList[0].category[lang]}
                </span>
                <h2 className="text-4xl font-bold leading-tight underline decoration-brandRed decoration-4 underline-offset-8">
                  {newsList[0].title[lang]}
                </h2>
              </div>
            </div>
          </Link>
        </div>

        {/* সাইডবার লিস্ট */}
        <div className="lg:col-span-4 space-y-6">
          <h3 className="text-2xl font-black border-l-8 border-brandRed pl-3 uppercase text-brandBlack italic">
            {t.latest}
          </h3>
          <div className="space-y-4">
            {newsList.slice(1, 6).map(news => (
              <Link key={news._id} to={`/news/${news._id}`} className="flex gap-4 border-b border-gray-200 pb-4 group">
                <div className="min-w-[120px]">
                  <img src={news.image} className="w-full h-20 object-cover rounded-sm group-hover:brightness-75" alt="" />
                </div>
                <h4 className="font-bold text-md leading-snug group-hover:text-brandRed transition">
                  {news.title[lang]}
                </h4>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}