import { useParams } from 'react-router-dom';
import { dummyNews } from '../data';

export default function NewsDetails({ lang }) {
  const { id } = useParams();
  // আইডি অনুযায়ী ডাটা খুঁজে বের করা
  const news = dummyNews.find(item => item.id === parseInt(id));

  if (!news) return <h2 className="text-center py-10">{lang === 'bn' ? 'দুঃখিত, খবরটি পাওয়া যায়নি!' : 'Sorry, news not found!'}</h2>;

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-sm">
      <span className="text-blue-700 font-bold uppercase text-sm">{news.category[lang]}</span>
      <h1 className="text-3xl md:text-4xl font-extrabold mt-2 mb-4 leading-tight">{news.title[lang]}</h1>
      <p className="text-gray-500 mb-6 italic">{lang === 'bn' ? 'প্রকাশিত:' : 'Published:'} {news.time[lang]} {lang === 'bn' ? 'আগে' : 'ago'}</p>
      
      <img src={news.image} className="w-full h-auto rounded-xl mb-6 shadow-lg" alt={news.title[lang]} />
      
      <div className="text-gray-800 text-lg leading-relaxed space-y-4">
        <p>{lang === 'bn' ? 'এখানে খবরের বিস্তারিত অংশ থাকবে। যেহেতু আমরা ডামি ডাটা ব্যবহার করছি, তাই এই অংশটি আপাতত ডেমো টেক্সট হিসেবে থাকছে।' : 'Detailed news content will be here. Since we are using dummy data, this portion is demo text for now.'}</p>
        <p>{lang === 'bn' ? `ক্যাম্পাস টিভির পক্ষ থেকে জানানো হয়েছে যে, ${news.title[lang]} বিষয়টি নিয়ে সাধারণ শিক্ষার্থীদের মধ্যে ব্যাপক আগ্রহ তৈরি হয়েছে। বিস্তারিত তথ্য শীঘ্রই আপডেট করা হবে।` : `Campus TV has announced that ${news.title[lang]} has generated significant interest among students. Detailed information will be updated soon.`}</p>
      </div>
    </div>
  );
}