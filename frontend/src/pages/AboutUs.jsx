import { useState, useEffect } from 'react';
import { X, Users, Award, Target, Eye } from 'lucide-react';

export default function AboutUs({ lang }) {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/employees');
      const data = await res.json();
      setEmployees(data);
    } catch (err) {
      console.error('Error fetching employees:', err);
    } finally {
      setLoading(false);
    }
  };

  const aboutContent = {
    bn: {
      title: 'ক্যাম্পাস টিভি সম্পর্কে',
      description: `ক্যাম্পাস টিভি হলো একটি আধুনিক ডিজিটাল সংবাদ মাধ্যম যা শিক্ষার্থীদের জন্য সর্বশেষ ক্যাম্পাস সংবাদ, শিক্ষা সংক্রান্ত তথ্য, এবং বিশ্ববিদ্যালয়ের গুরুত্বপূর্ণ ইভেন্টগুলি সরবরাহ করে। আমরা প্রতিশ্রুতিবদ্ধ যে শিক্ষার্থীদের কাছে সঠিক, নির্ভরযোগ্য এবং সময়োপযোগী তথ্য পৌঁছে দিতে।
      
আমাদের লক্ষ্য হলো শিক্ষার্থীদের মধ্যে একটি শক্তিশালী যোগাযোগ মাধ্যম তৈরি করা যা তাদের ক্যাম্পাস জীবন, শিক্ষাগত সুযোগ, এবং সামাজিক দায়বদ্ধতা সম্পর্কে সচেতন করে তুলবে। 

আমরা বিশ্বাস করি যে সংবাদ এবং তথ্য প্রচারের মাধ্যমে আমরা একটি শিক্ষিত এবং সচেতন প্রজন্ম গড়তে পারি যারা দেশ এবং সমাজের জন্য ইতিবাচক পরিবর্তন আনতে সক্ষম।`,
      teamTitle: 'আমাদের টিম',
      viewDetails: 'বিস্তারিত দেখুন',
      close: 'বন্ধ করুন',
      mission: 'আমাদের লক্ষ্য',
      missionText: 'শিক্ষার্থীদের সঠিক এবং নির্ভরযোগ্য তথ্য প্রদানের মাধ্যমে একটি সচেতন প্রজন্ম গড়ে তোলা।',
      vision: 'আমাদের দৃষ্টিভঙ্গি',
      visionText: 'শিক্ষা ও সংবাদ মাধ্যমে একটি অগ্রণী ডিজিটাল প্ল্যাটফর্ম হিসেবে প্রতিষ্ঠিত হওয়া।',
      values: 'আমাদের মূল্যবোধ',
      valuesText: 'সততা, স্বচ্ছতা, নির্ভরযোগ্যতা এবং শিক্ষার্থীদের প্রতি দায়বদ্ধতা।',
    },
    en: {
      title: 'About Campus TV',
      description: `Campus TV is a modern digital news platform that delivers the latest campus news, educational information, and important university events to students. We are committed to providing accurate, reliable, and timely information to students.

Our goal is to create a strong communication medium among students that will make them aware of their campus life, educational opportunities, and social responsibilities.

We believe that through news and information dissemination, we can build an educated and conscious generation capable of bringing positive changes to the country and society.`,
      teamTitle: 'Our Team',
      viewDetails: 'View Details',
      close: 'Close',
      mission: 'Our Mission',
      missionText: 'To build a conscious generation by providing accurate and reliable information to students.',
      vision: 'Our Vision',
      visionText: 'To establish ourselves as a leading digital platform in education and news media.',
      values: 'Our Values',
      valuesText: 'Honesty, transparency, reliability, and commitment to students.',
    },
  };

  const content = aboutContent[lang] || aboutContent.bn;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-brandRed via-red-700 to-brandBlack text-white py-16 mb-12 rounded-2xl shadow-2xl">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-black text-center mb-6 uppercase italic tracking-tight">
            {content.title}
          </h1>
          <div className="max-w-4xl mx-auto">
            <p className="text-lg md:text-xl leading-relaxed whitespace-pre-line text-center md:text-left">
              {content.description}
            </p>
          </div>
        </div>
      </div>

      {/* Mission, Vision, Values Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <div className="bg-card border-2 border-border rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:border-brandRed">
          <div className="flex items-center gap-3 mb-4">
            <Target className="text-brandRed" size={32} />
            <h3 className="text-xl font-black text-foreground uppercase">{content.mission}</h3>
          </div>
          <p className="text-muted-foreground leading-relaxed">{content.missionText}</p>
        </div>

        <div className="bg-card border-2 border-border rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:border-brandRed">
          <div className="flex items-center gap-3 mb-4">
            <Eye className="text-brandRed" size={32} />
            <h3 className="text-xl font-black text-foreground uppercase">{content.vision}</h3>
          </div>
          <p className="text-muted-foreground leading-relaxed">{content.visionText}</p>
        </div>

        <div className="bg-card border-2 border-border rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:border-brandRed">
          <div className="flex items-center gap-3 mb-4">
            <Award className="text-brandRed" size={32} />
            <h3 className="text-xl font-black text-foreground uppercase">{content.values}</h3>
          </div>
          <p className="text-muted-foreground leading-relaxed">{content.valuesText}</p>
        </div>
      </div>

      {/* Team Section */}
      <div className="mb-12">
        <div className="flex items-center justify-center gap-3 mb-8">
          <Users className="text-brandRed" size={36} />
          <h2 className="text-3xl md:text-4xl font-black text-foreground uppercase italic">
            {content.teamTitle}
          </h2>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-brandRed border-t-transparent"></div>
            <p className="mt-4 text-muted-foreground">Loading team members...</p>
          </div>
        ) : employees.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-2xl border border-border">
            <Users className="mx-auto mb-4 text-muted-foreground" size={48} />
            <p className="text-xl text-muted-foreground">
              {lang === 'bn' ? 'কোনো টিম সদস্য নেই' : 'No team members yet'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {employees.map((employee) => (
              <div
                key={employee._id}
                className="bg-card border border-border rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all hover:scale-105 hover:border-brandRed group"
              >
                <div className="aspect-square overflow-hidden bg-muted">
                  <img
                    src={employee.imageURL || 'https://via.placeholder.com/400x400?text=No+Image'}
                    alt={employee.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x400?text=No+Image';
                    }}
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-black text-foreground uppercase mb-1 truncate">
                    {employee.name}
                  </h3>
                  <p className="text-sm text-muted-foreground font-bold mb-3 truncate">
                    {employee.designation}
                  </p>
                  <button
                    onClick={() => setSelectedEmployee(employee)}
                    className="w-full py-2 bg-brandRed text-white font-bold rounded-lg hover:bg-red-700 transition-all uppercase text-sm"
                  >
                    {content.viewDetails}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Employee Details Modal */}
      {selectedEmployee && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border-2 border-brandRed rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-brandRed text-white p-6 flex items-center justify-between">
              <h2 className="text-2xl font-black uppercase italic">{selectedEmployee.name}</h2>
              <button
                onClick={() => setSelectedEmployee(null)}
                className="p-2 hover:bg-white/20 rounded-full transition-all"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <div className="flex flex-col items-center mb-6">
                <img
                  src={
                    selectedEmployee.imageURL ||
                    'https://via.placeholder.com/400x400?text=No+Image'
                  }
                  alt={selectedEmployee.name}
                  className="w-48 h-48 object-cover rounded-full border-4 border-brandRed shadow-xl mb-4"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x400?text=No+Image';
                  }}
                />
                <p className="text-xl font-bold text-brandRed">{selectedEmployee.designation}</p>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-black text-foreground mb-2 uppercase">
                    {lang === 'bn' ? 'জীবনী (বাংলা)' : 'Bio (Bangla)'}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {selectedEmployee.bio.bn}
                  </p>
                </div>
                <div className="border-t border-border pt-4">
                  <h3 className="text-lg font-black text-foreground mb-2 uppercase">
                    {lang === 'bn' ? 'জীবনী (ইংরেজি)' : 'Bio (English)'}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {selectedEmployee.bio.en}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-border">
              <button
                onClick={() => setSelectedEmployee(null)}
                className="w-full py-3 bg-brandBlack text-white font-bold rounded-lg hover:bg-brandRed transition-all uppercase"
              >
                {content.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
