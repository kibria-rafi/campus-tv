import { useState, useEffect } from 'react';

export default function Live() {
  const [liveVideo, setLiveVideo] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5001/api/news')
      .then(res => res.json())
      .then(data => {
        // শুধু লাইভ ভিডিওগুলো ফিল্টার করা
        const activeLive = data.find(item => item.isLive === true);
        setLiveVideo(activeLive);
      });
  }, []);

  return (
    <div className="max-w-5xl mx-auto my-10 px-4 text-center">
      <h2 className="text-3xl font-black text-brandRed uppercase italic mb-6 animate-pulse">🔴 Live Stream</h2>
      {liveVideo ? (
        <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-2xl border-4 border-brandRed">
          <iframe 
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${liveVideo.videoUrl}?autoplay=1`}
            allowFullScreen
          ></iframe>
        </div>
      ) : (
        <div className="bg-gray-100 p-20 rounded-2xl">
          <p className="text-xl font-bold text-gray-500 italic">বর্তমানে কোনো লাইভ সম্প্রচার নেই।</p>
        </div>
      )}
    </div>
  );
}