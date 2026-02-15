import { Link } from 'react-router-dom';
import { dummyNews, translations } from '../data';

export default function Home({ lang }) {
  const t = translations[lang];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* প্রধান খবর (Left - 8 columns) */}
      <div className="lg:col-span-8">
        <Link to={`/news/${dummyNews[0].id}`}>
          <div className="relative group overflow-hidden rounded-sm shadow-xl">
            <img src={dummyNews[0].image} className="w-full h-[500px] object-cover group-hover:scale-105 transition duration-700" />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/70 to-transparent p-8 text-white">
              <span className="bg-brandRed px-3 py-1 text-sm font-bold uppercase mb-3 inline-block tracking-wider">
                {dummyNews[0].category[lang]}
              </span>
              <h2 className="text-4xl font-bold leading-tight group-hover:underline decoration-brandRed">
                {dummyNews[0].title[lang]}
              </h2>
            </div>
          </div>
        </Link>
      </div>

      {/* সাইডবার (Right - 4 columns) */}
      <div className="lg:col-span-4 space-y-6">
        <h3 className="text-2xl font-black border-l-8 border-brandRed pl-3 uppercase tracking-tight text-brandBlack">
          {t.latest}
        </h3>
        <div className="space-y-4">
          {dummyNews.map(news => (
            <Link key={news.id} to={`/news/${news.id}`} className="flex gap-4 border-b border-gray-200 pb-4 group">
              <div className="min-w-[120px]">
                <img src={news.image} className="w-full h-20 object-cover rounded-sm grayscale group-hover:grayscale-0 transition duration-300" />
              </div>
              <h4 className="font-bold text-md leading-snug group-hover:text-brandRed transition">
                {news.title[lang]}
              </h4>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}