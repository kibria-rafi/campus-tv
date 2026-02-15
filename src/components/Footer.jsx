export default function Footer() {
  return (
    <footer className="bg-brandBlack text-white mt-16 py-12 border-t-8 border-brandRed">
      <div className="container mx-auto px-4 text-center">
        <div className="flex justify-center items-center space-x-3 mb-6">
          <div className="bg-brandRed text-white p-2 rounded-sm font-black text-2xl">C</div>
          <h2 className="text-3xl font-black tracking-tighter uppercase italic">Campus TV</h2>
        </div>
        <div className="h-1 w-20 bg-brandRed mx-auto mb-6"></div>
        <p className="text-gray-400 max-w-md mx-auto">শিক্ষার্থীদের সংবাদ ও তথ্যের ডিজিটাল প্ল্যাটফর্ম।</p>
        <p className="mt-8 text-gray-500 text-xs tracking-widest uppercase italic">© ২০২৬ ক্যাম্পাস টিভি | All Rights Reserved</p>
      </div>
    </footer>
  );
}